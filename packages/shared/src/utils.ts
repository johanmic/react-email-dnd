import type {
  BlockDefinition,
  CanvasContentBlock,
  CustomBlockDefinition,
  CustomBlockProps,
} from './schema';

export function slugify(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-')
    .trim();
}

export function ensureKey(value: string): string {
  const cleaned = slugify(value);
  return cleaned.length > 0 ? cleaned : 'custom-block';
}

export function buildCustomBlockRegistry(
  blocks: (BlockDefinition<CanvasContentBlock> | CustomBlockDefinition<any>)[],
): Record<string, CustomBlockDefinition<any>> {
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
