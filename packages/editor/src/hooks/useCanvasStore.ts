'use client';

import { useContext } from 'react';
import { CanvasStoreContext } from '../components/CanvasProvider';

export function useCanvasStore() {
  const context = useContext(CanvasStoreContext);

  if (!context) {
    throw new Error('useCanvasStore must be used within a CanvasProvider');
  }

  return context;
}
