import { useEffect, useState, type ReactNode } from 'react';
import clsx from 'clsx';
import { createPortal } from 'react-dom';

export interface ModalProps {
  open: boolean;
  onClose?: () => void;
  daisyui?: boolean;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  overlayClassName?: string;
  labelledBy?: string;
  describedBy?: string;
  role?: 'dialog' | 'alertdialog';
}

export function Modal({
  open,
  onClose,
  daisyui = false,
  children,
  className,
  contentClassName,
  overlayClassName,
  labelledBy,
  describedBy,
  role = 'dialog',
}: ModalProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [portalNode, setPortalNode] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setIsMounted(true);
    return () => {
      setIsMounted(false);
    };
  }, []);

  useEffect(() => {
    if (typeof document === 'undefined') {
      setPortalNode(null);
      return;
    }

    if (daisyui) {
      const themeRoot = document.querySelector<HTMLElement>('[data-theme]');
      if (themeRoot) {
        setPortalNode(themeRoot);
        return;
      }
    }

    setPortalNode(document.body);
  }, [daisyui]);

  if (!open) {
    return null;
  }

  const containerClasses = clsx(
    'fixed inset-0 z-[2000] flex items-center justify-center p-4',
    {
      'md:p-6': daisyui,
    },
    className,
  );

  const overlayClasses = clsx(
    'absolute inset-0 bg-black/40 backdrop-blur-[2px]',
    overlayClassName,
  );

  const contentClasses = clsx(
    'relative z-10 w-full max-w-lg',
    {
      'rounded-2xl border border-base-300 bg-base-100 text-base-content shadow-2xl': daisyui,
    },
    contentClassName,
  );

  const modalContent = (
    <div className={containerClasses}>
      <div className={overlayClasses} aria-hidden onClick={onClose} />
      <div
        className={contentClasses}
        role={role}
        aria-modal="true"
        aria-labelledby={labelledBy}
        aria-describedby={describedBy}
      >
        {children}
      </div>
    </div>
  );

  if (!isMounted || !portalNode) {
    return modalContent;
  }

  return createPortal(modalContent, portalNode);
}
