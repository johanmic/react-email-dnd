'use client';

import { useState, useMemo, type ChangeEvent } from 'react';
import { useCanvasStore } from '../hooks/useCanvasStore';
import {
  ArrowCounterClockwiseIcon,
  CodeIcon,
  DeviceMobileIcon,
  DesktopIcon,
  CheckCircle,
  WarningCircle,
  BracketsCurly,
} from '@phosphor-icons/react';
import { renderDocument } from '@react-email-dnd/renderer';
import clsx from 'clsx';
import { ReactTextPreviewModal } from './ReactTextPreviewModal';
import { extractVariableMatches, type VariableMatch } from '../utils/templateVariables';

const TITLE_INPUT_ID = 'email-dnd-title-input';

export type HeaderItem = 'title' | 'preview' | 'codeview' | 'undo' | 'save';

function VariableMatchesHint({
  label,
  matches,
  daisyui,
}: {
  label: string;
  matches: VariableMatch[];
  daisyui?: boolean;
}) {
  if (matches.length === 0) {
    return null;
  }

  const hasMissing = matches.some((match) => !match.defined);

  return (
    <div
      className={clsx('mt-2 rounded-md border px-3 py-2 text-[11px] leading-tight', {
        'bg-slate-50 border-slate-200 text-slate-700': !daisyui,
        'bg-base-200 border-base-300 text-base-content/80': daisyui,
      })}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="font-semibold uppercase tracking-wide">{label}</span>
        <span
          className={clsx('text-[10px] font-semibold', {
            'text-emerald-600': !daisyui && !hasMissing,
            'text-red-500': !daisyui && hasMissing,
            'text-success': daisyui && !hasMissing,
            'text-error': daisyui && hasMissing,
          })}
        >
          {matches.length} match{matches.length > 1 ? 'es' : ''}
        </span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {matches.map((match) => (
          <span
            key={match.key}
            className={clsx(
              'font-mono text-[11px]',
              !daisyui && 'inline-flex items-center gap-1 rounded-full border px-2 py-0.5',
              daisyui && 'badge badge-sm gap-1 h-5',
              match.defined
                ? {
                    'border-emerald-200 bg-emerald-50 text-emerald-700': !daisyui,
                    'badge-success': daisyui,
                  }
                : {
                    'border-orange-200 bg-orange-50 text-orange-700': !daisyui,
                    'badge-warning': daisyui,
                  },
            )}
            title={match.defined ? 'Variable is available' : 'Variable is missing'}
          >
            {match.defined ? (
              <CheckCircle size={12} weight="bold" />
            ) : (
              <WarningCircle size={12} weight="bold" />
            )}
            {'{{'}
            {match.key}
            {'}}'}
          </span>
        ))}
      </div>
    </div>
  );
}

export function Header({
  daisyui = false,
  headerItems,
  headerVariableCheck = false,
}: {
  daisyui?: boolean;
  headerItems?: HeaderItem[];
  headerVariableCheck?: boolean;
}) {
  const {
    document,
    updateTitle,
    save,
    undo,
    isDirty,
    canUndo,
    previewMode,
    setPreviewMode,
    variables,
    previewVariables,
    setPreviewVariables,
  } = useCanvasStore();
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
      console.error('Failed to render react-text output', error);
    }
  };

  const titleMatches = useMemo(
    () => extractVariableMatches(document.meta.title, variables),
    [document.meta.title, variables],
  );

  // Determine which items to show (default to all if not specified)
  const shouldShow = (item: HeaderItem): boolean => {
    return !headerItems || headerItems.includes(item);
  };

  return (
    <header
      className={clsx(
        'flex flex-col py-3 border-b',
        !daisyui && 'gap-3 border-slate-900/10 bg-white',
        daisyui && 'gap-2 border-primary/10',
        'md:flex-row md:items-center md:justify-between md:gap-4',
      )}
      aria-label="Email editor header"
    >
      {shouldShow('title') && (
        <div className={clsx('flex flex-col md:flex-row items-start gap-3 flex-1 min-w-[200px]')}>
          <div className="flex-1 max-w-xl w-full">
            <input
              id={TITLE_INPUT_ID}
              type="text"
              value={document.meta.title}
              onChange={handleTitleChange}
              placeholder="Untitled email"
              className={clsx(
                !daisyui &&
                  'w-full px-3 py-2 border border-slate-300/60 rounded-lg text-[0.95rem] text-slate-900 bg-slate-50 transition focus:outline-none focus:border-green-500/60 focus:ring-2 focus:ring-green-500/20 focus:bg-white',
                daisyui && 'input input-bordered input-sm rounded-box w-full',
              )}
            />
            {headerVariableCheck && (
              <VariableMatchesHint
                label="Variables in title"
                matches={titleMatches}
                daisyui={daisyui}
              />
            )}
          </div>
        </div>
      )}
      <div className="flex items-center justify-end gap-2 flex-wrap md:flex-nowrap">
        {shouldShow('preview') && (
          <div
            className={clsx('flex items-center gap-1 mr-2')}
            role="group"
            aria-label="Preview mode"
          >
            <button
              type="button"
              onClick={() => setPreviewVariables(!previewVariables)}
              aria-pressed={previewVariables}
              title="Toggle variable preview"
              className={clsx(
                !daisyui &&
                  'inline-flex items-center gap-1 py-2 px-2.5 rounded-lg border text-sm transition',
                !daisyui &&
                  (previewVariables
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-900 border-slate-300/60 hover:border-green-500/60 hover:bg-green-500/10'),
                daisyui && 'btn btn-ghost btn-sm',
                daisyui && (previewVariables ? 'btn-active' : ''),
              )}
            >
              <BracketsCurly size={18} />
            </button>
            <div
              className={clsx('w-px h-5 mx-1', daisyui ? 'bg-base-content/10' : 'bg-slate-200')}
            />
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
        )}
        {shouldShow('codeview') && (
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
        )}
        {shouldShow('undo') && (
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
        )}
        {shouldShow('save') && (
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
        )}
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
