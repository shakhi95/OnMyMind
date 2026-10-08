import { ArrowRight, Search, X } from 'lucide-react';
import { EmptyState } from '../components/EmptyState';
import { KindChip, toneFromSearchKind } from '../components/KindChip';
import { PageHeader } from '../components/PageHeader';
import { dateTimeText } from '../lib/dates';
import type { SearchResult } from '../types';

export function SearchView({
  query,
  setQuery,
  results,
  onResult,
}: {
  query: string;
  setQuery: (value: string) => void;
  results: SearchResult[];
  onResult: (result: SearchResult) => void;
}) {
  return (
    <>
      <PageHeader
        eyebrow="Find your way back"
        title="Search your space"
        description="Look across topics, tasks, dumps, and decisions."
      >
        <div className="flex min-w-[min(300px,40vw)] items-center gap-2 rounded-md border border-line bg-[#141518] px-3 py-2 text-soft max-[620px]:min-w-full max-[620px]:w-full">
          <Search size={15} />
          <input
            data-global-search
            autoFocus
            aria-label="Search all your thoughts"
            placeholder="Try “website” or “money”"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="w-full border-0 bg-transparent text-[11px] text-ink outline-none"
          />
          {query && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => setQuery('')}
              className="grid cursor-pointer place-items-center border-0 bg-transparent text-soft"
            >
              <X size={13} />
            </button>
          )}
        </div>
      </PageHeader>

      {query.trim() ? (
        results.length ? (
          <div className="grid gap-2">
            {results.map((result, index) => (
              <button
                key={`${result.kind}-${result.date}-${index}`}
                type="button"
                onClick={() => onResult(result)}
                className="flex w-full cursor-pointer items-center gap-3 rounded-lg border border-line bg-surface px-4 py-3 text-left hover:border-edge"
              >
                <KindChip tone={toneFromSearchKind(result.kind)} />
                <span className="min-w-0 flex-1">
                  <strong className="block text-[13px] font-semibold text-ink">{result.title}</strong>
                  <small className="mt-1 block max-w-[560px] overflow-hidden text-ellipsis whitespace-nowrap text-[10px] text-soft">
                    {result.excerpt}
                  </small>
                </span>
                <time className="text-[10px] text-soft max-[620px]:hidden">
                  {dateTimeText(
                    result.date.includes('T') ? result.date : `${result.date}T12:00:00`,
                    { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' },
                  )}
                </time>
                <ArrowRight size={15} className="text-soft" />
              </button>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Search />}
            title="No matches yet."
            text="Try a different word. Your search covers dumps, topic notes, decisions, and tasks."
          />
        )
      ) : (
        <EmptyState
          icon={<Search />}
          title="Everything you wrote, findable."
          text="Search titles, notes, decisions, and actions whenever you need to pick up an old topic."
        />
      )}
    </>
  );
}
