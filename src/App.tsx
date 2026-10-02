import { useCallback, useState } from 'react';
import { AddTaskDialog } from './components/AddTaskDialog';
import { AddThreadDialog } from './components/AddThreadDialog';
import { ConfirmDialog } from './components/ConfirmDialog';
import { Sidebar } from './components/Sidebar';
import { Toast } from './components/Toast';
import { Topbar } from './components/Topbar';
import { useAppData } from './hooks/useAppData';
import { useGlobalShortcuts, useHashRoute } from './hooks/useHashRoute';
import { getSearchResults } from './lib/search';
import type { SearchResult } from './types';
import { JournalsView } from './views/JournalsView';
import { SearchView } from './views/SearchView';
import { TasksView } from './views/TasksView';
import { ThreadDetailView } from './views/ThreadDetailView';
import { ThreadsView } from './views/ThreadsView';
import { TodayView } from './views/TodayView';

type ConfirmState = {
  eyebrow?: string;
  title: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
};

export default function App() {
  const {
    data,
    today,
    saved,
    saveError,
    toast,
    setToast,
    journal,
    activeThreads,
    openTasks,
    addDump,
    updateDump,
    removeDump,
    createThreadOnDump,
    linkThreadToDump,
    unlinkThreadFromDump,
    addTask,
    addThread,
    setTaskStatus,
    revisitThreadInJournal,
    addNote,
    setThreadStatus,
    doExport,
    doImport,
    loadSampleData,
  } = useAppData();

  const { view, selectedThread, selectedJournalDay, go, openThreadRoute, openJournalDay } = useHashRoute();
  const [dialog, setDialog] = useState<'task' | 'thread' | null>(null);
  const [confirm, setConfirm] = useState<ConfirmState | null>(null);
  const [query, setQuery] = useState('');

  const openQuickAdd = useCallback(() => setDialog('task'), []);
  const openSearch = useCallback(() => go('search'), [go]);
  useGlobalShortcuts(openQuickAdd, openSearch);

  const openThread = (id: string, revisit = false) => {
    if (revisit) revisitThreadInJournal(id);
    const thread = data.threads.find((item) => item.id === id);
    if (thread) {
      try {
        sessionStorage.setItem('on-my-mind.threads-tab', thread.status);
      } catch {
        /* ignore */
      }
    }
    openThreadRoute(id);
  };

  const chooseSearchResult = (result: SearchResult) => {
    if (result.threadId) {
      openThread(result.threadId);
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
      message: 'It will leave today’s journal. Linked threads stay in Threads.',
      confirmLabel: 'Delete dump',
      danger: true,
      onConfirm: () => removeDump(id),
    });
  };

  const requestLoadSample = () => {
    setConfirm({
      eyebrow: 'Replace local data',
      title: 'Load sample data?',
      message:
        'This replaces everything on this device with sample data for the last 15 days. Export first if you care about current writing.',
      confirmLabel: 'Load sample',
      danger: true,
      onConfirm: () => loadSampleData(),
    });
  };

  const currentThread = data.threads.find((thread) => thread.id === selectedThread);
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
        selectedThread={selectedThread}
        activeThreadCount={activeThreads.length}
        openTaskCount={openTasks.length}
        onGo={go}
        onExport={doExport}
        onImport={handleImport}
        onLoadSample={requestLoadSample}
      />

      <main className="min-w-0 flex-1">
        <Topbar
          view={view}
          selectedThread={selectedThread}
          saved={saved}
          saveError={saveError}
          onSearch={() => go('search')}
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

          {selectedThread && currentThread ? (
            <ThreadDetailView
              thread={currentThread}
              tasks={data.tasks.filter((task) => task.threadId === currentThread.id)}
              setTaskStatus={setTaskStatus}
              addTask={addTask}
              addNote={addNote}
              setStatus={(status) => setThreadStatus(currentThread.id, status)}
              onBack={() => go(view === 'search' ? 'threads' : view)}
              onRevisit={() => {
                revisitThreadInJournal(currentThread.id);
                go('today');
              }}
            />
          ) : view === 'today' ? (
            <TodayView
              journal={journal}
              threads={data.threads}
              saved={saved}
              saveError={saveError}
              onAddDump={addDump}
              onUpdateDump={updateDump}
              onRemoveDump={requestRemoveDump}
              onCreateThread={createThreadOnDump}
              onLinkThread={linkThreadToDump}
              onUnlinkThread={unlinkThreadFromDump}
              onOpenThread={openThread}
            />
          ) : view === 'journals' ? (
            <JournalsView
              data={data}
              selectedDay={selectedJournalDay}
              onOpenDay={openJournalDay}
              onBackToList={() => go('journals')}
              onOpenThread={openThread}
            />
          ) : view === 'threads' ? (
            <ThreadsView
              threads={data.threads}
              tasks={data.tasks}
              onOpen={openThread}
              onAdd={() => setDialog('thread')}
            />
          ) : view === 'tasks' ? (
            <TasksView
              tasks={data.tasks}
              threads={data.threads}
              onChange={setTaskStatus}
              onAdd={() => setDialog('task')}
              onOpenThread={openThread}
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
          threads={activeThreads}
          onAdd={(title, threadId) => addTask(title, threadId)}
        />
      )}
      {dialog === 'thread' && (
        <AddThreadDialog
          onClose={() => setDialog(null)}
          onAdd={(title) => {
            const id = addThread(title);
            if (id) openThread(id);
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
