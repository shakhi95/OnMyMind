import type { ReactNode } from 'react';

export function PageHeader({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <div className="mb-7 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-end">
      <div>
        <div className="mb-2.5 text-[10px] font-bold tracking-[1.5px] text-muted uppercase">{eyebrow}</div>
        <h1 className="m-0 font-display text-[clamp(1.875rem,4vw,2.375rem)] font-medium tracking-[-1.5px] text-ink">
          {title}
        </h1>
        <p className="mt-2 mb-0 text-[13px] text-muted">{description}</p>
      </div>
      {children}
    </div>
  );
}
