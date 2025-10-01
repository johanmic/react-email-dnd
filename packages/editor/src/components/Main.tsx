import { useContext, useEffect, useLayoutEffect, useRef } from 'react';
import type { CanvasSection } from '../types/schema';
import { createEmptySection } from '../utils/document';
import { Canvas } from './Canvas';
import { CanvasStoreContext } from './CanvasProvider';

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export interface MainProps {
  sections: CanvasSection[];
  daisyui?: boolean;
}

export function Main({ sections, daisyui = false }: MainProps) {
  const canvasStore = useContext(CanvasStoreContext);
  const placeholderSectionRef = useRef<CanvasSection | null>(null);

  const getPlaceholderSection = () => {
    if (!placeholderSectionRef.current) {
      placeholderSectionRef.current = createEmptySection();
    }

    return placeholderSectionRef.current;
  };

  useIsomorphicLayoutEffect(() => {
    if (!canvasStore || sections.length > 0) {
      if (sections.length > 0) {
        placeholderSectionRef.current = null;
      }

      return;
    }

    const placeholder = getPlaceholderSection();

    canvasStore.setDocument(
      {
        ...canvasStore.document,
        sections: [placeholder],
      },
      { commit: false },
    );
  }, [canvasStore, sections.length]);

  const normalizedSections = sections.length > 0 ? sections : [getPlaceholderSection()];

  return (
    <div className="flex-1 p-2.5">
      <Canvas sections={normalizedSections} daisyui={daisyui} />
    </div>
  );
}
