'use client';

import { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import { Modal } from './Modal';

export interface ReactTextPreviewModalProps {
  open: boolean;
  code: string;
  onClose: () => void;
  daisyui?: boolean;
}

export function ReactTextPreviewModal({ open, code, onClose, daisyui = false }: ReactTextPreviewModalProps) {
  const [copied, setCopied] = useState(false);
  const copyTimeoutRef = useRef<number | null>(null);
  const preRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    if (!open) {
      setCopied(false);
      if (copyTimeoutRef.current) {
        window.clearTimeout(copyTimeoutRef.current);
        copyTimeoutRef.current = null;
      }
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (copyTimeoutRef.current) {
        window.clearTimeout(copyTimeoutRef.current);
        copyTimeoutRef.current = null;
      }
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  const handleCopy = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(code);
      } else if (preRef.current) {
        const range = document.createRange();
        range.selectNodeContents(preRef.current);
        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
        document.execCommand('copy');
        selection?.removeAllRanges();
      }

      setCopied(true);
      copyTimeoutRef.current = window.setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to copy react-text output', error);
      setCopied(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      daisyui={daisyui}
      contentClassName="w-full max-w-4xl"
      labelledBy="react-text-preview-title"
    >
      <div
        className={clsx(
          'h-[80vh] flex flex-col rounded-xl border shadow-xl overflow-hidden',
          {
            'bg-slate-950 border-slate-800 text-slate-100': !daisyui,
            'bg-base-100 border-base-300 text-base-content': daisyui,
          },
        )}
        aria-label="React Email JSX preview"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
          <span
            id="react-text-preview-title"
            className="text-sm font-semibold uppercase tracking-wide opacity-80"
          >
            React Email JSX
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className={clsx(
                'rounded-md px-3 py-1.5 text-xs font-medium transition border',
                {
                  'bg-slate-800 text-slate-100 border-slate-700 hover:bg-slate-700': !daisyui,
                  'btn btn-ghost btn-xs': daisyui,
                },
              )}
            >
              {copied ? 'Copied!' : 'Copy code'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className={clsx(
                'rounded-md px-3 py-1.5 text-xs font-medium transition border',
                {
                  'bg-slate-800 text-slate-100 border-slate-700 hover:bg-slate-700': !daisyui,
                  'btn btn-ghost btn-xs': daisyui,
                },
              )}
            >
              Close
            </button>
          </div>
        </div>
        <pre
          ref={preRef}
          className={clsx(
            'flex-1 m-0 p-5 overflow-auto text-[13px] leading-relaxed',
            {
              'bg-slate-950 text-slate-100': !daisyui,
              'bg-base-200 text-base-content': daisyui,
            },
          )}
        >
          {code}
        </pre>
      </div>
    </Modal>
  );
}
