import { useRef } from 'react';
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  BookOpen,
  Circle,
  Clock3,
  ListChecks,
  Sparkles,
} from 'lucide-react';
import { NavButton } from './NavButton';
import type { View } from '../types';

export function Sidebar({
  view,
  selectedThread,
  activeThreadCount,
  openTaskCount,
  onGo,
  onExport,
  onImport,
  onLoadSample,
}: {
  view: View;
  selectedThread: string | null;
  activeThreadCount: number;
  openTaskCount: number;
  onGo: (view: View) => void;
  onExport: () => void;
  onImport: (file: File) => void;
  onLoadSample: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <aside className="sticky top-0 flex h-dvh w-[248px] shrink-0 flex-col overflow-y-auto border-r border-line bg-sidebar/90 px-[18px] pt-8 pb-5 max-[850px]:w-[210px] max-[620px]:fixed max-[620px]:bottom-0 max-[620px]:left-0 max-[620px]:top-auto max-[620px]:z-10 max-[620px]:h-[61px] max-[620px]:w-full max-[620px]:overflow-visible max-[620px]:border-r-0 max-[620px]:border-t max-[620px]:bg-sidebar/95 max-[620px]:px-1.5 max-[620px]:py-1 max-[620px]:backdrop-blur-md">
      <a
        className="mb-11 flex items-center gap-2.5 px-2 font-display text-[17px] font-bold tracking-[-0.8px] text-ink no-underline max-[620px]:hidden"
        href="#/today"
        onClick={(event) => {
          event.preventDefault();
          onGo('today');
        }}
      >
        <span className="grid h-8 w-8 place-items-center rounded-[11px] bg-panel text-accent">
          <Sparkles size={18} />
        </span>
        <span>
          on my mind<span className="text-accent">.</span>
        </span>
      </a>

      <div className="px-3 pb-3 text-[10px] font-bold tracking-[1.5px] text-soft uppercase max-[620px]:hidden">
        Your space
      </div>

      <nav
        className="grid gap-1 max-[620px]:flex max-[620px]:h-full max-[620px]:items-center max-[620px]:justify-around"
        aria-label="Main navigation"
      >
        <NavButton
          icon={<Clock3 size={16} strokeWidth={1.65} />}
          label="Today"
          active={view === 'today' && !selectedThread}
          onClick={() => onGo('today')}
        />
        <NavButton
          icon={<BookOpen size={16} strokeWidth={1.65} />}
          label="Journals"
          active={view === 'journals' && !selectedThread}
          onClick={() => onGo('journals')}
        />
        <NavButton
          icon={<Circle size={16} strokeWidth={1.65} />}
          label="Threads"
          count={activeThreadCount}
          active={view === 'threads' && !selectedThread}
          onClick={() => onGo('threads')}
        />
        <NavButton
          icon={<ListChecks size={16} strokeWidth={1.65} />}
          label="Tasks"
          count={openTaskCount}
          active={view === 'tasks' && !selectedThread}
          onClick={() => onGo('tasks')}
        />
      </nav>

      <div className="mt-auto max-[620px]:hidden">
        <div className="flex gap-2.5 border-t border-line px-1.5 py-4">
          <span className="grid h-7 w-7 place-items-center rounded-[9px] bg-hover text-accent">⌑</span>
          <div>
            <strong className="mb-1 block text-[11px] text-ink">Your private space</strong>
            <small className="block text-[11px] text-soft">Saved on this device</small>
          </div>
        </div>
        <button
          type="button"
          onClick={onExport}
          className="flex cursor-pointer items-center gap-2 border-0 bg-transparent px-2 py-2 text-[11px] text-soft hover:text-ink"
        >
          <ArrowDownToLine size={15} /> Export your data
        </button>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="flex cursor-pointer items-center gap-2 border-0 bg-transparent px-2 py-2 text-[11px] text-soft hover:text-ink"
        >
          <ArrowUpFromLine size={15} /> Import backup
        </button>
        <button
          type="button"
          onClick={onLoadSample}
          className="flex cursor-pointer items-center gap-2 border-0 bg-transparent px-2 py-2 text-[11px] text-soft hover:text-ink"
        >
          <Sparkles size={15} /> Load sample data
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) onImport(file);
            event.target.value = '';
          }}
        />
      </div>
    </aside>
  );
}
