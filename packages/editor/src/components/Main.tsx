'use client';

import { useContext, useEffect, useLayoutEffect, useRef } from 'react';
import type { CanvasSection, CustomBlockDefinition } from '@react-email-dnd/shared';
import { createEmptySection } from '../utils/document';
import { Canvas } from './Canvas';
import { CanvasStoreContext } from './CanvasProvider';

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

import type {
  BlockDefinition,
  CanvasContentBlock,
  StructurePaletteItem,
} from '@react-email-dnd/shared';

export interface MainProps {
  sections: CanvasSection[];
  daisyui?: boolean;
  colorMode?: 'hierarchy' | 'primary' | 'none' | 'output';
  colorModeDepth?: number | null;
  unlockable?: boolean;
  showHidden?: boolean;
  // Using `any` by design to allow heterogeneous custom block props across definitions.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  customBlockRegistry?: Record<string, CustomBlockDefinition<any>>;
  inlineInsertionMode?: boolean;
  inlineInsertionVariant?: 'icon-only' | 'icon-with-label';
  onAddSection?: () => void;
  onAddRow?: (sectionId: string, columnCount?: number, index?: number) => void;
  onAddColumn?: (rowId: string, columnCount?: number, index?: number) => void;
  onAddBlock?: (columnId: string, blockKey: string, index?: number) => void;
  contentBlocks?: BlockDefinition<CanvasContentBlock>[];
  structureItems?: StructurePaletteItem[];
}

export function Main({
  sections,
  daisyui = false,
  colorMode = 'hierarchy',
  colorModeDepth = null,
  unlockable = true,
  showHidden = false,
  customBlockRegistry = {},
  inlineInsertionMode = false,
  inlineInsertionVariant = 'icon-with-label',
  onAddSection,
  onAddRow,
  onAddColumn,
  onAddBlock,
  contentBlocks,
  structureItems,
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
    <div className="flex-1 p-2">
      <div className={wrapperClasses} aria-label={`Preview area (${previewMode})`}>
        <Canvas
          sections={normalizedSections}
          daisyui={daisyui}
          colorMode={colorMode}
          colorModeDepth={colorModeDepth}
          unlockable={unlockable}
          showHidden={showHidden}
          customBlockRegistry={customBlockRegistry}
          inlineInsertionMode={inlineInsertionMode}
          inlineInsertionVariant={inlineInsertionVariant}
          onAddSection={onAddSection}
          onAddRow={onAddRow}
          onAddColumn={onAddColumn}
          onAddBlock={onAddBlock}
          contentBlocks={contentBlocks}
          structureItems={structureItems}
        />
      </div>
    </div>
  );
}
