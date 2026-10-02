import { useEffect, type FormEvent, type ReactNode } from 'react';
import { X } from 'lucide-react';

/** Shared overlay + panel chrome for confirm / add / link modals. */
export function ModalShell({
  children,
  onClose,
  zIndex = 20,
}: {
  children: ReactNode;
  onClose: () => void;
  zIndex?: 20 | 30;
}) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className={`fixed inset-0 grid place-items-center bg-black/55 backdrop-blur-[4px] ${
        zIndex === 30 ? 'z-30' : 'z-20'
      }`}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      {children}
    </div>
  );
}

export function ModalPanel({
  children,
  as: Tag = 'div',
  onSubmit,
}: {
  children: ReactNode;
  as?: 'div' | 'form';
  onSubmit?: (event: FormEvent) => void;
}) {
  const className =
    'w-[min(430px,calc(100vw-32px))] rounded-xl border border-edge bg-[#191a20] p-6 shadow-[0_26px_90px_#000b]';
  if (Tag === 'form') {
    return (
      <form className={className} onSubmit={onSubmit}>
        {children}
      </form>
    );
  }
  return <div className={className}>{children}</div>;
}

export function ModalHeader({
  eyebrow,
  title,
  onClose,
  titleId,
}: {
  eyebrow?: string;
  title: string;
  onClose: () => void;
  titleId?: string;
}) {
  return (
    <div className="mb-5 flex items-start justify-between gap-3">
      <div>
        {eyebrow ? (
          <div className="mb-2 text-[8px] font-bold tracking-[1.5px] text-accent uppercase">{eyebrow}</div>
        ) : null}
        <h2
          id={titleId}
          className="m-0 font-display text-2xl font-medium tracking-tight text-ink"
        >
          {title}
        </h2>
      </div>
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="grid h-7 w-7 shrink-0 cursor-pointer place-items-center rounded-full border border-line bg-panel text-soft"
      >
        <X size={17} />
      </button>
    </div>
  );
}

export function ModalActions({ children }: { children: ReactNode }) {
  return <div className="flex items-center justify-end gap-2">{children}</div>;
}
