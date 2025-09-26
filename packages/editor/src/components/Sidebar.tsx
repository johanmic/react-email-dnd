import { ColumnsIcon, RowsIcon, SquaresFourIcon } from '@phosphor-icons/react';
import { SidebarItem } from './SidebarItem';
import type {
  BlockDefinition,
  ButtonBlock,
  DividerBlock,
  ImageBlock,
  StructurePaletteItem,
  TextBlock,
  HeadingBlock,
} from '../types/schema';
import { buttonDefinition } from './button';
import { dividerDefinition } from './divider';
import { headingDefinition } from './heading';
import { imageDefinition } from './image';
import { textDefinition } from './text';

type BuiltInBlockDefinition =
  | BlockDefinition<ButtonBlock>
  | BlockDefinition<HeadingBlock>
  | BlockDefinition<TextBlock>
  | BlockDefinition<DividerBlock>
  | BlockDefinition<ImageBlock>;

const DEFAULT_STRUCTURE_ITEMS: StructurePaletteItem[] = [
  { id: 'structure-section', label: 'Section', icon: SquaresFourIcon },
  { id: 'structure-row', label: 'Row', icon: RowsIcon },
  { id: 'structure-columns-1', label: '1 Column', icon: ColumnsIcon },
  { id: 'structure-columns-2', label: '2 Columns', icon: ColumnsIcon },
  { id: 'structure-columns-3', label: '3 Columns', icon: ColumnsIcon },
];

const DEFAULT_CONTENT_ITEMS: BuiltInBlockDefinition[] = [
  headingDefinition,
  textDefinition,
  dividerDefinition,
  imageDefinition,
  buttonDefinition,
];

export interface SidebarProps {
  structureItems?: StructurePaletteItem[];
  blocks?: BuiltInBlockDefinition[];
}

export function Sidebar({
  structureItems = DEFAULT_STRUCTURE_ITEMS,
  blocks = DEFAULT_CONTENT_ITEMS,
}: SidebarProps) {
  return (
    <aside className="email-dnd-sidebar w-52 border-r border-black p-2.5">
      <div>
        <p className="email-dnd-sidebar-heading">Structure</p>
        <div className="email-dnd-sidebar-grid">
          {structureItems.map((item) => (
            <SidebarItem
              id={item.id}
              key={item.id}
              className="email-dnd-sidebar-entry"
              data={{
                category: 'structure',
                label: item.label,
              }}
            >
              <div className="email-dnd-sidebar-tile">
                <item.icon size={18} weight="duotone" />
                <span>{item.label}</span>
              </div>
            </SidebarItem>
          ))}
        </div>
      </div>
      <div>
        <p className="email-dnd-sidebar-heading">Content</p>
        <div className="email-dnd-sidebar-grid">
          {blocks.map((block) => (
            <SidebarItem
              id={`block-${block.type}`}
              key={block.type}
              className="email-dnd-sidebar-entry"
              data={{
                category: 'content',
                blockType: block.type,
                label: block.label,
                defaults: block.defaults,
              }}
            >
              <div className="email-dnd-sidebar-tile">
                <block.icon size={18} weight="duotone" />
                <span>{block.label}</span>
              </div>
            </SidebarItem>
          ))}
        </div>
      </div>
    </aside>
  );
}
