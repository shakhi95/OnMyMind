import type { ReactNode } from 'react';

export function NavButton({
  icon,
  label,
  count,
  active,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  count?: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 text-left text-[13px] font-medium transition-colors',
        'max-[620px]:min-w-[51px] max-[620px]:grid max-[620px]:justify-items-center max-[620px]:gap-0.5 max-[620px]:px-2 max-[620px]:py-1.5 max-[620px]:text-[9px]',
        active
          ? 'border-edge bg-panel font-semibold text-ink'
          : 'border-transparent bg-transparent text-soft hover:bg-hover hover:text-ink',
      ].join(' ')}
    >
      <span className={`grid w-[17px] place-items-center ${active ? 'text-accent' : 'text-soft'}`}>{icon}</span>
      {label}
      {count !== undefined && (
        <small className="ml-auto text-[11px] text-soft max-[620px]:hidden">{count}</small>
      )}
    </button>
  );
}
