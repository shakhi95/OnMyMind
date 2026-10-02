import { ModalActions, ModalHeader, ModalPanel, ModalShell } from './ModalShell';
import { ghostBtnClass, primaryBtnClass } from '../lib/ui';

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
    <ModalShell onClose={onClose} zIndex={30}>
      <ModalPanel>
        <div role="dialog" aria-modal="true" aria-labelledby="confirm-dialog-title">
          <ModalHeader
            eyebrow={eyebrow}
            title={title}
            onClose={onClose}
            titleId="confirm-dialog-title"
          />
          <p className="mt-0 mb-6 text-[13px] leading-relaxed text-muted">{message}</p>
          <ModalActions>
            <button type="button" onClick={onClose} className={ghostBtnClass}>
              {cancelLabel}
            </button>
            <button
              type="button"
              autoFocus
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={
                danger
                  ? 'inline-flex cursor-pointer items-center gap-2 rounded-md border border-[#69483e] bg-[#2a1f1e] px-3 py-2 text-[11px] font-semibold text-[#d7b1a5] hover:bg-[#332422]'
                  : primaryBtnClass
              }
            >
              {confirmLabel}
            </button>
          </ModalActions>
        </div>
      </ModalPanel>
    </ModalShell>
  );
}
