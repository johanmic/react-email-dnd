import { describe, expect, it } from 'vitest';
import {
  buildBlockDefinitionMap,
  buildCustomBlockRegistry,
  getSidebarBlockId,
  textDefinition,
  type BlockDefinition,
  type CanvasContentBlock,
  type CustomBlockDefinition,
} from '../../src';

function createCustomDefinition(): CustomBlockDefinition<{ text: string }> {
  return {
    id: 'custom-hero',
    type: 'custom',
    label: 'Hero',
    icon: textDefinition.icon,
    defaults: {
      componentName: 'HeroBlock',
      props: { text: 'Example' },
    },
    component: ({ text }: { text: string }) => <div>{text}</div>,
  };
}

describe('block-library helpers', () => {
  it('generates stable sidebar identifiers for custom blocks', () => {
    const customDefinition = createCustomDefinition();
    const sidebarId = getSidebarBlockId(customDefinition as BlockDefinition<CanvasContentBlock>);
    expect(sidebarId).toBe('block-custom-heroblock');
  });

  it('builds a lookup map for block definitions', () => {
    const customDefinition = createCustomDefinition();
    const definitions = [
      textDefinition as unknown as BlockDefinition<CanvasContentBlock>,
      customDefinition as unknown as BlockDefinition<CanvasContentBlock>,
    ];

    const map = buildBlockDefinitionMap(definitions);

    expect(map['block-text']).toBeDefined();
    expect(map['block-custom-heroblock']).toBe(customDefinition);
  });

  it('builds a custom block registry keyed by component name', () => {
    const customDefinition = createCustomDefinition();
    const registry = buildCustomBlockRegistry([
      textDefinition as unknown as BlockDefinition<CanvasContentBlock>,
      customDefinition as unknown as BlockDefinition<CanvasContentBlock>,
    ]);

    expect(registry.HeroBlock).toBe(customDefinition);
  });
});
