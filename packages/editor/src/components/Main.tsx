import { useContext, useEffect, useLayoutEffect, useRef } from 'react';
import type { CanvasSection, CustomBlockDefinition } from '@react-email-dnd/shared';
import { createEmptySection } from '../utils/document';
import { Canvas } from './Canvas';
import { CanvasStoreContext } from './CanvasProvider';

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export interface MainProps {
  sections: CanvasSection[];
  daisyui?: boolean;
  unlockable?: boolean;
  customBlockRegistry?: Record<string, CustomBlockDefinition<any>>;
}

export function Main({
  sections,
  daisyui = false,
  unlockable = true,
  customBlockRegistry = {},
}: MainProps) {
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

  const previewMode = canvasStore?.previewMode ?? 'desktop';
  const wrapperClasses =
    previewMode === 'mobile'
      ? 'mx-auto w-[390px] max-w-full border border-primary/50 rounded-xl overflow-hidden'
      : 'mx-auto w-[720px] max-w-full';

  return (
    <div className="flex-1 p-2.5">
      <div className={wrapperClasses} aria-label={`Preview area (${previewMode})`}>
        <Canvas
          sections={normalizedSections}
          daisyui={daisyui}
          unlockable={unlockable}
          customBlockRegistry={customBlockRegistry}
        />
      </div>
    </div>
  );
}
