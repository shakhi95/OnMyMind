import { X } from 'lucide-react';

export function ConfirmDialog({
  eyebrow,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  danger,
  onConfirm,
  onClose,
}: {
  eyebrow?: string;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-30 grid place-items-center bg-black/55 backdrop-blur-[4px]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        className="w-[min(430px,calc(100vw-32px))] rounded-xl border border-edge bg-[#191a20] p-6 shadow-[0_26px_90px_#000b]"
      >
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            {eyebrow ? (
              <div className="mb-2 text-[8px] font-bold tracking-[1.5px] text-accent uppercase">{eyebrow}</div>
            ) : null}
            <h2
              id="confirm-dialog-title"
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

        <p className="mt-0 mb-6 text-[13px] leading-relaxed text-muted">{message}</p>

        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer border-0 bg-transparent px-2 py-2 text-[11px] text-soft hover:text-ink"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            autoFocus
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={[
              'inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-[11px] font-semibold',
              danger
                ? 'border-[#69483e] bg-[#2a1f1e] text-[#d7b1a5] hover:bg-[#332422]'
                : 'border-accent bg-accent text-[#222329] hover:bg-[#d0d1e0]',
            ].join(' ')}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
