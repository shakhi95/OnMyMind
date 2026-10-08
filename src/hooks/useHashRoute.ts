import { useCallback, useEffect, useState } from 'react';
import { isTypingTarget } from '../lib/dom';
import { TOPICS_TAB_KEY } from '../lib/ui';
import type { View } from '../types';
import { VIEWS } from '../types';

export function useHashRoute() {
  const [view, setView] = useState<View>('today');
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [selectedJournalDay, setSelectedJournalDay] = useState<string | null>(null);

  const syncRoute = useCallback(() => {
    const route = window.location.hash.replace(/^#\/?/, '').split('/');
    if (route[0] === 'history') {
      window.location.hash = route[1] ? `#/journals/${route[1]}` : '#/journals';
      return;
    }
    if (route[0] === 'later') {
      try {
        sessionStorage.setItem(TOPICS_TAB_KEY, 'later');
      } catch {
        /* ignore */
      }
      window.location.hash = '#/topics';
      return;
    }
    if (route[0] === 'topics' && route[1]) {
      setSelectedTopic(route[1]);
      setSelectedJournalDay(null);
      setView('topics');
      return;
    }
    if (route[0] === 'journals') {
      setSelectedTopic(null);
      setSelectedJournalDay(route[1] || null);
      setView('journals');
      return;
    }
    setSelectedTopic(null);
    setSelectedJournalDay(null);
    const requested = route[0] as View;
    setView(VIEWS.includes(requested) ? requested : 'today');
  }, []);

  useEffect(() => {
    if (!window.location.hash) window.history.replaceState(null, '', '#/today');
    else syncRoute();
    window.addEventListener('hashchange', syncRoute);
    return () => window.removeEventListener('hashchange', syncRoute);
  }, [syncRoute]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [view, selectedTopic, selectedJournalDay]);

  const go = useCallback((next: View) => {
    setSelectedTopic(null);
    setSelectedJournalDay(null);
    setView(next);
    window.location.hash = `#/${next}`;
  }, []);

  const openTopicRoute = useCallback((id: string) => {
    setSelectedTopic(id);
    setSelectedJournalDay(null);
    setView('topics');
    window.location.hash = `#/topics/${id}`;
  }, []);

  const openJournalDay = useCallback((day: string) => {
    setSelectedTopic(null);
    setSelectedJournalDay(day);
    setView('journals');
    window.location.hash = `#/journals/${day}`;
  }, []);

  return {
    view,
    selectedTopic,
    selectedJournalDay,
    go,
    openTopicRoute,
    openJournalDay,
    setSelectedTopic,
  };
}

export function useGlobalShortcuts(onQuickAdd: () => void, onSearch: () => void) {
  useEffect(() => {
    const shortcuts = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        onQuickAdd();
      }
      if (event.key === '/' && !isTypingTarget(event.target)) {
        event.preventDefault();
        onSearch();
        window.setTimeout(() => document.querySelector<HTMLInputElement>('[data-global-search]')?.focus(), 0);
      }
    };
    window.addEventListener('keydown', shortcuts);
    return () => window.removeEventListener('keydown', shortcuts);
  }, [onQuickAdd, onSearch]);
}
