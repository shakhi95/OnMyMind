import { Search } from 'lucide-react';
import type { View } from '../types';
import { VIEW_LABELS } from '../types';

export function Topbar({
  view,
  selectedTopic,
  saved,
  saveError,
  onSearch,
}: {
  view: View;
  selectedTopic: string | null;
  saved: boolean;
  saveError: boolean;
  onSearch: () => void;
}) {
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
        <span className={`text-[10px] ${saveError ? 'text-[#d4a18e]' : 'text-soft'}`}>
          <i
            className={`mr-1.5 mb-px inline-block h-1.5 w-1.5 rounded-full ${
              saveError ? 'bg-[#bd806b]' : saved ? 'bg-[#9ca0b5]' : 'bg-[#d1a47a]'
            }`}
          />
          {saveError
            ? 'Could not save · writing remains here'
            : saved
              ? 'Saved on this device'
              : 'Saving…'}
        </span>
        <span className="rounded border border-line px-1.5 py-1 text-[9px] tracking-wide text-soft uppercase max-[620px]:hidden">
          Local
        </span>
      </div>
    </header>
  );
}
