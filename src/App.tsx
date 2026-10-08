import { useCallback, useState } from 'react';
import { AddTaskDialog } from './components/AddTaskDialog';
import { AddTopicDialog } from './components/AddTopicDialog';
import { ConfirmDialog } from './components/ConfirmDialog';
import { Sidebar } from './components/Sidebar';
import { Toast } from './components/Toast';
import { Topbar } from './components/Topbar';
import { useAppData } from './hooks/useAppData';
import { useAuth } from './hooks/useAuth';
import { useGlobalShortcuts, useHashRoute } from './hooks/useHashRoute';
import { getSearchResults } from './lib/search';
import { TOPICS_TAB_KEY } from './lib/ui';
import type { SearchResult } from './types';
import { JournalsView } from './views/JournalsView';
import { LoginView } from './views/LoginView';
import { SearchView } from './views/SearchView';
import { TasksView } from './views/TasksView';
import { TopicDetailView } from './views/TopicDetailView';
import { TopicsView } from './views/TopicsView';
import { TodayView } from './views/TodayView';

type ConfirmState = {
  eyebrow?: string;
  title: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
};

function LoadingShell({ message }: { message: string }) {
  return (
    <div className="grid min-h-dvh place-items-center px-4">
      <p className="text-[13px] text-soft">{message}</p>
    </div>
  );
}

export default function App() {
  const { userId, loading, authError, signIn, signUp, signOut } = useAuth();

  if (loading) return <LoadingShell message="Checking session…" />;
  if (!userId) {
    return <LoginView authError={authError} onSignIn={signIn} onSignUp={signUp} />;
  }

  return <AuthenticatedApp userId={userId} onSignOut={signOut} />;
}

function AuthenticatedApp({ userId, onSignOut }: { userId: string; onSignOut: () => void }) {
  const {
    data,
    today,
    loading,
    loadError,
    saved,
    saveError,
    toast,
    setToast,
    journal,
    activeTopics,
    openTasks,
    addDump,
    updateDump,
    removeDump,
    createTopicOnDump,
    linkTopicToDump,
    unlinkTopicFromDump,
    addTask,
    addTopic,
    setTaskStatus,
    revisitTopicInJournal,
    addNote,
    setTopicStatus,
    doExport,
    doImport,
  } = useAppData(userId);

  const { view, selectedTopic, selectedJournalDay, go, openTopicRoute, openJournalDay } = useHashRoute();
  const [dialog, setDialog] = useState<'task' | 'topic' | null>(null);
  const [confirm, setConfirm] = useState<ConfirmState | null>(null);
  const [query, setQuery] = useState('');

  const openQuickAdd = useCallback(() => setDialog('task'), []);
  const openSearch = useCallback(() => go('search'), [go]);
  useGlobalShortcuts(openQuickAdd, openSearch);

  const openTopic = (id: string, revisit = false) => {
    if (revisit) revisitTopicInJournal(id);
    const topic = data.topics.find((item) => item.id === id);
    if (topic) {
      try {
        sessionStorage.setItem(TOPICS_TAB_KEY, topic.status);
      } catch {
        /* ignore */
      }
    }
    openTopicRoute(id);
  };

  const chooseSearchResult = (result: SearchResult) => {
    if (result.topicId) {
      openTopic(result.topicId);
      return;
    }
    if (result.kind === 'dump') {
      const day = result.date.slice(0, 10);
      if (day === today) {
        go('today');
        return;
      }
      openJournalDay(day);
      return;
    }
    if (result.kind === 'task') {
      go('tasks');
      if (result.targetId) {
        window.setTimeout(
          () => document.getElementById(`task-${result.targetId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }),
          80,
        );
      }
      return;
    }
    go('journals');
  };

  const requestRemoveDump = (id: string) => {
    setConfirm({
      eyebrow: 'This cannot be undone',
      title: 'Delete this dump?',
      message: 'It will leave today’s journal. Linked topics stay in Topics.',
      confirmLabel: 'Delete dump',
      danger: true,
      onConfirm: () => removeDump(id),
    });
  };

  if (loading) return <LoadingShell message="Loading your space…" />;

  if (loadError) {
    return (
      <div className="grid min-h-dvh place-items-center px-4">
        <div className="max-w-sm text-center">
          <p className="mb-4 text-[13px] text-[#d7b1a5]">Couldn’t load your data. Check your connection and try again.</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="cursor-pointer rounded-lg border-0 bg-panel px-3 py-2 text-[13px] text-ink hover:bg-hover"
          >
            Reload
          </button>
          <button
            type="button"
            onClick={onSignOut}
            className="ml-2 cursor-pointer rounded-lg border border-line bg-transparent px-3 py-2 text-[13px] text-soft hover:text-ink"
          >
            Sign out
          </button>
        </div>
      </div>
    );
  }

  const currentTopic = data.topics.find((topic) => topic.id === selectedTopic);
  const searchResults = getSearchResults(data, query);

  const handleImport = async (file: File) => {
    try {
      await doImport(file);
    } catch {
      setToast('Could not import that file. Choose a valid On My Mind JSON backup.');
    }
  };

  return (
    <div className="flex min-h-dvh max-[620px]:block max-[620px]:pb-[63px]">
      <Sidebar
        view={view}
        selectedTopic={selectedTopic}
        activeTopicCount={activeTopics.length}
        openTaskCount={openTasks.length}
        onGo={go}
        onExport={doExport}
        onImport={handleImport}
        onSignOut={onSignOut}
      />

      <main className="min-w-0 flex-1">
        <Topbar
          view={view}
          selectedTopic={selectedTopic}
          saved={saved}
          saveError={saveError}
          onSearch={() => go('search')}
          onExport={doExport}
          onImport={handleImport}
          onSignOut={onSignOut}
        />

        <div className="mx-auto max-w-[1030px] px-12 pt-12 pb-20 max-[850px]:px-7 max-[620px]:px-4 max-[620px]:pt-8">
          {saveError && (
            <div
              className="mb-4 rounded-md border border-[#69483e] bg-[#201d20] px-3 py-2.5 text-[10px] text-[#d7b1a5]"
              role="status"
            >
              We couldn’t save this right now. Your writing is still here in this window. Export your data
              before leaving.
            </div>
          )}

          {selectedTopic && currentTopic ? (
            <TopicDetailView
              topic={currentTopic}
              tasks={data.tasks.filter((task) => task.topicId === currentTopic.id)}
              setTaskStatus={setTaskStatus}
              addTask={addTask}
              addNote={addNote}
              setStatus={(status) => setTopicStatus(currentTopic.id, status)}
              onBack={() => go(view === 'search' ? 'topics' : view)}
              onRevisit={() => {
                revisitTopicInJournal(currentTopic.id);
                go('today');
              }}
            />
          ) : view === 'today' ? (
            <TodayView
              journal={journal}
              topics={data.topics}
              saved={saved}
              saveError={saveError}
              onAddDump={addDump}
              onUpdateDump={updateDump}
              onRemoveDump={requestRemoveDump}
              onCreateTopic={createTopicOnDump}
              onLinkTopic={linkTopicToDump}
              onUnlinkTopic={unlinkTopicFromDump}
              onOpenTopic={openTopic}
            />
          ) : view === 'journals' ? (
            <JournalsView
              data={data}
              selectedDay={selectedJournalDay}
              onOpenDay={openJournalDay}
              onBackToList={() => go('journals')}
              onOpenTopic={openTopic}
            />
          ) : view === 'topics' ? (
            <TopicsView
              topics={data.topics}
              tasks={data.tasks}
              onOpen={openTopic}
              onAdd={() => setDialog('topic')}
            />
          ) : view === 'tasks' ? (
            <TasksView
              tasks={data.tasks}
              topics={data.topics}
              onChange={setTaskStatus}
              onAdd={() => setDialog('task')}
              onOpenTopic={openTopic}
            />
          ) : view === 'search' ? (
            <SearchView
              query={query}
              setQuery={setQuery}
              results={searchResults}
              onResult={chooseSearchResult}
            />
          ) : null}
        </div>
      </main>

      {dialog === 'task' && (
        <AddTaskDialog
          onClose={() => setDialog(null)}
          topics={activeTopics}
          onAdd={(title, topicId) => addTask(title, topicId)}
        />
      )}
      {dialog === 'topic' && (
        <AddTopicDialog
          onClose={() => setDialog(null)}
          onAdd={(title) => {
            const id = addTopic(title);
            if (id) openTopic(id);
          }}
        />
      )}
      {confirm && (
        <ConfirmDialog
          eyebrow={confirm.eyebrow}
          title={confirm.title}
          message={confirm.message}
          confirmLabel={confirm.confirmLabel}
          danger={confirm.danger}
          onConfirm={confirm.onConfirm}
          onClose={() => setConfirm(null)}
        />
      )}
      {toast && <Toast message={toast} />}
    </div>
  );
}
