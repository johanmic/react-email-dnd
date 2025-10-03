import clsx from 'clsx';

export interface ConfirmModalProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  daisyui?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  open,
  title,
  description,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  daisyui = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className={clsx('absolute inset-0', {
          'bg-black/30 backdrop-blur-sm': !daisyui,
          'bg-base-content/40 backdrop-blur': daisyui,
        })}
        onClick={onCancel}
      />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div
          className={clsx('w-full max-w-md rounded-lg shadow-xl border p-5 relative', {
            'bg-white text-slate-900 border-slate-200': !daisyui,
            'bg-base-100 text-base-content border-base-300': daisyui,
          })}
          role="dialog"
          aria-modal="true"
        >
          <h3
            className={clsx('text-base font-semibold mb-2', {
              'text-slate-900': !daisyui,
              'text-base-content': daisyui,
            })}
          >
            {title}
          </h3>
          {description ? (
            <p
              className={clsx('text-sm mb-4', {
                'text-slate-600': !daisyui,
                'text-base-content/70': daisyui,
              })}
            >
              {description}
            </p>
          ) : null}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onCancel}
              className={clsx('px-3 py-1.5 rounded-md', {
                'bg-slate-100 text-slate-800 hover:bg-slate-200': !daisyui,
                btn: daisyui,
              })}
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className={clsx('px-3 py-1.5 rounded-md', {
                'bg-red-600 text-white hover:bg-red-700': !daisyui,
                'btn btn-error': daisyui,
              })}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

