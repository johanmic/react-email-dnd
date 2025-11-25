import type {
  BlockDefinition,
  CanvasContentBlock,
  CustomBlockDefinition,
  CustomBlockProps,
} from '@react-email-dnd/shared';

import { ensureKey } from '@react-email-dnd/shared';

export function getBlockPaletteKey(block: BlockDefinition<CanvasContentBlock>): string {
  if (block.type === 'custom') {
    const defaults = block.defaults as CustomBlockProps;
    if (defaults.componentName) {
      return `custom-${ensureKey(defaults.componentName)}`;
    }
    if (block.id && block.id.length > 0) {
      return block.id;
    }
    return 'custom-block';
  }
  if (block.id && block.id.length > 0) {
    return block.id;
  }
  return block.type;
}

export function getSidebarBlockId(block: BlockDefinition<CanvasContentBlock>): string {
  return `block-${getBlockPaletteKey(block)}`;
}

export type BlockDefinitionMap = Record<string, BlockDefinition<CanvasContentBlock>>;

export function buildBlockDefinitionMap(
  blocks: BlockDefinition<CanvasContentBlock>[],
): BlockDefinitionMap {
  return blocks.reduce<BlockDefinitionMap>((acc, block) => {
    acc[getSidebarBlockId(block)] = block;
    return acc;
  }, {});
}
