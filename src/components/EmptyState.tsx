import type { ReactNode } from 'react';

export function EmptyState({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return (
    <div className="rounded-[10px] border border-line bg-surface px-5 py-12 text-center">
      <span className="mx-auto mb-3.5 grid h-[42px] w-[42px] place-items-center rounded-[13px] bg-panel text-accent">
        {icon}
      </span>
      <h3 className="m-0 font-display text-lg font-medium text-ink">{title}</h3>
      <p className="mx-auto mt-2 mb-0 max-w-[340px] text-xs leading-relaxed text-muted">{text}</p>
    </div>
  );
}
