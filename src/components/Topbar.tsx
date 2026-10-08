import { useEffect, useRef, useState } from 'react';
import { ArrowDownToLine, ArrowUpFromLine, LogOut, MoreHorizontal, Search } from 'lucide-react';
import type { View } from '../types';
import { VIEW_LABELS } from '../types';

export function Topbar({
  view,
  selectedTopic,
  saved,
  saveError,
  onSearch,
  onExport,
  onImport,
  onSignOut,
}: {
  view: View;
  selectedTopic: string | null;
  saved: boolean;
  saveError: boolean;
  onSearch: () => void;
  onExport: () => void;
  onImport: (file: File) => void;
  onSignOut: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  return (
    <header className="flex h-[65px] items-center justify-between border-b border-line bg-bg/55 px-[clamp(25px,5vw,72px)] max-[850px]:px-7 max-[620px]:h-[55px] max-[620px]:px-4">
      <div className="flex items-center gap-2.5 text-[10px] tracking-[1.35px] text-soft uppercase">
        <span>My space</span>
        <b className="font-normal text-[#42434a]">/</b>
        <strong className="text-[10px] text-[#b8bac3]">
          {selectedTopic ? 'Topic' : VIEW_LABELS[view]}
        </strong>
      </div>
      <div className="flex items-center gap-3.5 max-[620px]:gap-2">
        <button
          type="button"
          onClick={onSearch}
          aria-label="Search your thoughts"
          className="flex cursor-pointer items-center gap-1.5 rounded-md border border-line bg-[#141518] px-2 py-1.5 text-[10px] text-soft hover:border-edge hover:text-ink"
        >
          <Search size={14} />
          <span className="max-[620px]:hidden">Search</span>
          <kbd className="rounded border border-line px-1 text-[8px] text-soft max-[620px]:hidden">/</kbd>
        </button>
        <span className={`text-[10px] max-[620px]:hidden ${saveError ? 'text-[#d4a18e]' : 'text-soft'}`}>
          <i
            className={`mr-1.5 mb-px inline-block h-1.5 w-1.5 rounded-full ${
              saveError ? 'bg-[#bd806b]' : saved ? 'bg-[#9ca0b5]' : 'bg-[#d1a47a]'
            }`}
          />
          {saveError ? 'Could not save' : saved ? 'Saved' : 'Saving…'}
        </span>

        <div className="relative hidden max-[620px]:block" ref={menuRef}>
          <button
            type="button"
            aria-label="Account menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
            className="grid h-8 w-8 cursor-pointer place-items-center rounded-md border border-line bg-[#141518] text-soft hover:border-edge hover:text-ink"
          >
            <MoreHorizontal size={16} />
          </button>
          {menuOpen && (
            <div
              role="menu"
              className="absolute top-[calc(100%+6px)] right-0 z-20 min-w-[168px] rounded-lg border border-line bg-surface py-1.5 shadow-[0_16px_40px_rgba(0,0,0,0.45)]"
            >
              <button
                type="button"
                role="menuitem"
                className="flex w-full cursor-pointer items-center gap-2 border-0 bg-transparent px-3 py-2.5 text-left text-[12px] text-ink hover:bg-hover"
                onClick={() => {
                  setMenuOpen(false);
                  onExport();
                }}
              >
                <ArrowDownToLine size={15} /> Export your data
              </button>
              <button
                type="button"
                role="menuitem"
                className="flex w-full cursor-pointer items-center gap-2 border-0 bg-transparent px-3 py-2.5 text-left text-[12px] text-ink hover:bg-hover"
                onClick={() => {
                  setMenuOpen(false);
                  fileRef.current?.click();
                }}
              >
                <ArrowUpFromLine size={15} /> Import backup
              </button>
              <button
                type="button"
                role="menuitem"
                className="flex w-full cursor-pointer items-center gap-2 border-0 bg-transparent px-3 py-2.5 text-left text-[12px] text-ink hover:bg-hover"
                onClick={() => {
                  setMenuOpen(false);
                  onSignOut();
                }}
              >
                <LogOut size={15} /> Sign out
              </button>
            </div>
          )}
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
      </div>
    </header>
  );
}
