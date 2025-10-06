import { useState, type ChangeEvent } from 'react';
import { useCanvasStore } from '../hooks/useCanvasStore';
import {
  ArrowCounterClockwiseIcon,
  CodeIcon,
  DeviceMobileIcon,
  DesktopIcon,
} from '@phosphor-icons/react';
import { renderDocument } from '@react-email-dnd/renderer';
import clsx from 'clsx';
import { ReactTextPreviewModal } from './ReactTextPreviewModal';
const TITLE_INPUT_ID = 'email-dnd-title-input';

export function Header({ daisyui = false }: { daisyui?: boolean }) {
  const { document, updateTitle, save, undo, isDirty, canUndo, previewMode, setPreviewMode } =
    useCanvasStore();
  const [reactTextOpen, setReactTextOpen] = useState(false);
  const [reactTextOutput, setReactTextOutput] = useState('');

  const closeReactText = () => {
    setReactTextOpen(false);
    setReactTextOutput('');
  };

  const handleTitleChange = (event: ChangeEvent<HTMLInputElement>) => {
    updateTitle(event.target.value);
  };

  const handleShowReactText = () => {
    try {
      const result = renderDocument({
        document,
        options: {
          format: 'react-text',
          variables: document.variables,
        },
      });

      if (result.format !== 'react-text') {
        return;
      }

      setReactTextOutput(result.code);
      setReactTextOpen(true);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to render react-text output', error);
    }
  };

  return (
    <header
      className={clsx(
        // Tailwind default styling
        !daisyui &&
          'flex items-center justify-between gap-4 p-3 border-b border-slate-900/10 bg-white',
        // DaisyUI variant
        daisyui && 'flex items-center justify-between gap-4 p-3 border-b bg-base-200',
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
            daisyui && 'input input-bordered input-sm rounded-box w-full max-w-xl',
          )}
        />
      </div>
      <div className="flex items-center gap-2">
        <div
          className={clsx('flex items-center gap-1 mr-2')}
          role="group"
          aria-label="Preview mode"
        >
          <button
            type="button"
            onClick={() => setPreviewMode('desktop')}
            aria-pressed={previewMode === 'desktop'}
            title="Desktop preview"
            className={clsx(
              !daisyui &&
                'inline-flex items-center gap-1 py-2 px-2.5 rounded-lg border text-sm transition',
              !daisyui &&
                (previewMode === 'desktop'
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-900 border-slate-300/60 hover:border-green-500/60 hover:bg-green-500/10'),
              daisyui && 'btn btn-ghost btn-sm',
              daisyui && (previewMode === 'desktop' ? 'btn-active' : ''),
            )}
          >
            <DesktopIcon size={18} />
          </button>
          <button
            type="button"
            onClick={() => setPreviewMode('mobile')}
            aria-pressed={previewMode === 'mobile'}
            title="Mobile preview"
            className={clsx(
              !daisyui &&
                'inline-flex items-center gap-1 py-2 px-2.5 rounded-lg border text-sm transition',
              !daisyui &&
                (previewMode === 'mobile'
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-900 border-slate-300/60 hover:border-green-500/60 hover:bg-green-500/10'),
              daisyui && 'btn btn-ghost btn-sm',
              daisyui && (previewMode === 'mobile' ? 'btn-active' : ''),
            )}
          >
            <DeviceMobileIcon size={18} />
          </button>
        </div>
        <button
          type="button"
          onClick={handleShowReactText}
          title="Open React Email JSX output"
          className={clsx(
            !daisyui &&
              'gap-2 flex items-center py-2 px-3.5 rounded-lg border border-slate-300/60 bg-white text-slate-900 text-sm font-medium transition hover:border-green-500/60 hover:bg-green-500/10 hover:shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500/20',
            daisyui && 'btn btn-ghost btn-sm',
          )}
        >
          <CodeIcon size={18} />
        </button>
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
      <ReactTextPreviewModal
        open={reactTextOpen}
        code={reactTextOutput}
        onClose={closeReactText}
        daisyui={daisyui}
      />
    </header>
  );
}
