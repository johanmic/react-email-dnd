import type {
  BlockDefinition,
  CanvasContentBlock,
  CustomBlockDefinition,
  CustomBlockProps,
} from '@react-email-dnd/shared';

function slugify(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-')
    .trim();
}

function ensureKey(value: string): string {
  const cleaned = slugify(value);
  return cleaned.length > 0 ? cleaned : 'custom-block';
}

export function getBlockPaletteKey(block: BlockDefinition<CanvasContentBlock>): string {
  if (block.id && block.id.length > 0) {
    return block.id;
  }
  if (block.type === 'custom') {
    const defaults = block.defaults as CustomBlockProps;
    const componentName = defaults.componentName ?? 'custom';
    return `custom-${ensureKey(componentName)}`;
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

export function buildCustomBlockRegistry(
  blocks: BlockDefinition<CanvasContentBlock>[],
): // eslint-disable-next-line @typescript-eslint/no-explicit-any
Record<string, CustomBlockDefinition<any>> {
  // Allow heterogeneous custom components; each definition carries its own prop type
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return blocks.reduce<Record<string, CustomBlockDefinition<any>>>((acc, block) => {
    if (block.type !== 'custom') {
      return acc;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const customBlock = block as CustomBlockDefinition<any>;
    const componentName = customBlock.defaults.componentName;
    if (!componentName) {
      return acc;
    }
    acc[componentName] = customBlock;
    return acc;
  }, {});
}
