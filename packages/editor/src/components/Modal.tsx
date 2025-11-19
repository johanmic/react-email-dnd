'use client';

import { useContext, useEffect, useState, type ReactNode, type CSSProperties } from 'react';
import clsx from 'clsx';
import { createPortal } from 'react-dom';
import { CanvasStoreContext } from './CanvasProvider';

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
  const canvasStore = useContext(CanvasStoreContext);

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

    // Priority 1: Use portal root from CanvasProvider if available
    const portalRoot = (canvasStore as { portalRoot?: HTMLElement | null } | null)?.portalRoot;
    if (portalRoot) {
      setPortalNode(portalRoot);
      return;
    }

    // Priority 2: For daisyui, try to find theme root
    if (daisyui) {
      const themeRoot = document.querySelector<HTMLElement>('[data-theme]');
      if (themeRoot) {
        setPortalNode(themeRoot);
        return;
      }
    }

    // Priority 3: Fallback to document.body
    setPortalNode(document.body);
  }, [daisyui, canvasStore]);

  if (!open) {
    return null;
  }

  const containerClasses = clsx(
    'fixed inset-0 z-[9999] flex items-center justify-center p-4',
    {
      'md:p-6': daisyui,
    },
    className,
  );

  const containerStyle: CSSProperties = {
    pointerEvents: 'auto',
  };

  const overlayClasses = clsx('absolute inset-0 bg-black/40 backdrop-blur-[2px]', overlayClassName);

  const contentClasses = clsx(
    'relative z-10 w-full max-w-lg',
    {
      'rounded-2xl border border-base-300 bg-base-100 text-base-content shadow-2xl': daisyui,
    },
    contentClassName,
  );

  const modalContent = (
    <div className={containerClasses} style={containerStyle}>
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
