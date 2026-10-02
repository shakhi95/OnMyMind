import { useCallback, useEffect, useState } from 'react';
import { isTypingTarget } from '../lib/dom';
import type { View } from '../types';
import { VIEWS } from '../types';

export function useHashRoute() {
  const [view, setView] = useState<View>('today');
  const [selectedThread, setSelectedThread] = useState<string | null>(null);
  const [selectedJournalDay, setSelectedJournalDay] = useState<string | null>(null);

  const syncRoute = useCallback(() => {
    const route = window.location.hash.replace(/^#\/?/, '').split('/');
    if (route[0] === 'history') {
      window.location.hash = route[1] ? `#/journals/${route[1]}` : '#/journals';
      return;
    }
    if (route[0] === 'later') {
      try {
        sessionStorage.setItem('on-my-mind.threads-tab', 'later');
      } catch {
        /* ignore */
      }
      window.location.hash = '#/threads';
      return;
    }
    if (route[0] === 'threads' && route[1]) {
      setSelectedThread(route[1]);
      setSelectedJournalDay(null);
      setView('threads');
      return;
    }
    if (route[0] === 'journals') {
      setSelectedThread(null);
      setSelectedJournalDay(route[1] || null);
      setView('journals');
      return;
    }
    setSelectedThread(null);
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

  const go = useCallback((next: View) => {
    setSelectedThread(null);
    setSelectedJournalDay(null);
    setView(next);
    window.location.hash = `#/${next}`;
  }, []);

  const openThreadRoute = useCallback((id: string) => {
    setSelectedThread(id);
    setSelectedJournalDay(null);
    setView('threads');
    window.location.hash = `#/threads/${id}`;
  }, []);

  const openJournalDay = useCallback((day: string) => {
    setSelectedThread(null);
    setSelectedJournalDay(day);
    setView('journals');
    window.location.hash = `#/journals/${day}`;
  }, []);

  return {
    view,
    selectedThread,
    selectedJournalDay,
    go,
    openThreadRoute,
    openJournalDay,
    setSelectedThread,
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
