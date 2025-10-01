import type { ChangeEvent } from 'react';
import { useCanvasStore } from '../hooks/useCanvasStore';
import { ArrowCounterClockwiseIcon } from '@phosphor-icons/react';
import clsx from 'clsx';
const TITLE_INPUT_ID = 'email-dnd-title-input';

export function Header({ daisyui = false }: { daisyui?: boolean }) {
  const { document, updateTitle, save, undo, isDirty, canUndo } = useCanvasStore();

  const handleTitleChange = (event: ChangeEvent<HTMLInputElement>) => {
    updateTitle(event.target.value);
  };

  return (
    <header
      className={clsx(
        // Tailwind default styling
        !daisyui &&
          'flex items-center justify-between gap-4 p-3 border-b border-slate-900/10 bg-white',
        // DaisyUI variant
        daisyui && 'flex items-center justify-between gap-4 p-3 border-b bg-base-100',
      )}
      aria-label="Email editor header"
    >
      <div className={clsx('flex items-center gap-3 flex-1')}>
        <label
          className={clsx(
            !daisyui && 'text-sm font-semibold text-slate-900',
            daisyui && 'text-sm font-semibold text-base-content',
          )}
          htmlFor={TITLE_INPUT_ID}
        >
          Email title
        </label>
        <input
          id={TITLE_INPUT_ID}
          type="text"
          value={document.meta.title}
          onChange={handleTitleChange}
          placeholder="Untitled email"
          className={clsx(
            !daisyui &&
              'flex-1 px-3 py-2 border border-slate-300/60 rounded-lg text-[0.95rem] text-slate-900 bg-slate-50 transition focus:outline-none focus:border-green-500/60 focus:ring-2 focus:ring-green-500/20 focus:bg-white',
            daisyui && 'input input-bordered input-sm w-full max-w-xl',
          )}
        />
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={undo}
          disabled={!canUndo}
          className={clsx(
            !daisyui &&
              'gap-2 flex items-center py-2 px-3.5 rounded-lg border border-slate-300/60 bg-white text-slate-900 text-sm font-medium transition hover:border-green-500/60 hover:bg-green-500/10 hover:shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500/20 disabled:opacity-55',
            daisyui && 'btn btn-ghost btn-sm',
          )}
        >
          <ArrowCounterClockwiseIcon />
          Undo
        </button>
        <button
          type="button"
          onClick={save}
          disabled={!isDirty}
          className={clsx(
            !daisyui &&
              'py-2 px-3.5 rounded-lg border bg-green-500 border-green-500 text-white text-sm font-medium transition hover:bg-green-600 hover:border-green-600 shadow',
            daisyui && 'btn btn-primary btn-sm',
          )}
        >
          Save
        </button>
      </div>
    </header>
  );
}
