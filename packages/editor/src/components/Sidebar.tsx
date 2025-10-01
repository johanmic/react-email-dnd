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
import clsx from 'clsx';

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
  daisyui?: boolean;
}

export function Sidebar({
  structureItems = DEFAULT_STRUCTURE_ITEMS,
  blocks = DEFAULT_CONTENT_ITEMS,
  daisyui = false,
}: SidebarProps) {
  return (
    <aside
      className={clsx('w-52 border-l p-2.5', {
        'flex flex-col gap-5 bg-slate-50': !daisyui,
        'border-black': !daisyui,
        'flex flex-col gap-5 border-primary items-center border-l-primary-content': daisyui,
      })}
    >
      <div className="flex flex-col gap-3 items-center">
        <p
          className={clsx({
            'mb-2 text-xs font-semibold tracking-wider uppercase text-slate-900': !daisyui,
            'text-xl font-bold uppercase mb-4 leading-none text-base-content/60': daisyui,
          })}
        >
          Structure
        </p>
        <div
          className={clsx({
            'grid gap-3': !daisyui,
            'flex flex-col gap-3': daisyui,
          })}
        >
          {structureItems.map((item) => (
            <SidebarItem
              id={item.id}
              key={item.id}
              className={clsx({ group: !daisyui })}
              daisyui={daisyui}
              data={{
                category: 'structure',
                label: item.label,
              }}
            >
              <div
                className={clsx('flex items-center gap-4', {
                  'p-3 rounded-xl border border-dashed border-slate-900/10 bg-white text-slate-900 text-sm font-medium leading-5 transition transform group-hover:border-green-500/40 group-hover:shadow-lg group-hover:-translate-y-0.5 group-focus-within:border-green-500/40 group-focus-within:shadow-lg active:scale-95':
                    !daisyui,
                })}
              >
                <item.icon size={18} weight="duotone" />
                <span>{item.label}</span>
              </div>
            </SidebarItem>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-5 items-center">
        <div
          className={clsx({
            'mb-2 text-xs font-semibold tracking-wider uppercase text-slate-900': !daisyui,
            'text-xl font-bold uppercase mb-4 h-24 flex items-center justify-center leading-none text-base-content/60':
              daisyui,
          })}
        >
          Content
        </div>
        <div
          className={clsx({
            'grid gap-3': !daisyui,
            'flex flex-col gap-3': daisyui,
          })}
        >
          {blocks.map((block) => (
            <SidebarItem
              id={`block-${block.type}`}
              key={block.type}
              className={clsx({ group: !daisyui })}
              daisyui={daisyui}
              data={{
                category: 'content',
                blockType: block.type,
                label: block.label,
                defaults: block.defaults,
              }}
            >
              <div
                className={clsx('flex items-center gap-2', {
                  'p-3 rounded-xl border border-dashed border-slate-900/10 bg-white text-slate-900 text-sm font-medium leading-5 transition transform group-hover:border-green-500/40 group-hover:shadow-lg group-hover:-translate-y-0.5 group-focus-within:border-green-500/40 group-focus-within:shadow-lg active:scale-95':
                    !daisyui,
                })}
              >
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
