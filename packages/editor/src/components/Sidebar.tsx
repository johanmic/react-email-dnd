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
import { useState } from 'react';
import { Trash } from '@phosphor-icons/react';
import { useCanvasStore } from '../hooks/useCanvasStore';

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
  const { variables, upsertVariable, deleteVariable } = useCanvasStore();
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');

  const handleAddVariable = () => {
    const key = newKey.trim();
    if (!key) return;
    upsertVariable(key, newValue);
    setNewKey('');
    setNewValue('');
  };

  return (
    <aside
      className={clsx('w-52 border-l p-2.5 sticky top-0 h-screen overflow-y-auto', {
        'flex flex-col gap-5 bg-slate-50': !daisyui,
        'border-black': !daisyui,
        'flex flex-col gap-5 border-primary items-center border-l-primary-content': daisyui,
      })}
    >
      <div className="flex flex-col gap-3 items-center">
        <p
          className={clsx({
            'mb-y text-xs font-semibold tracking-wider uppercase text-slate-900': !daisyui,
            'text-sm font-bold uppercase mb-4 leading-none text-base-content/60': daisyui,
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
      <div className="flex flex-col gap-3 items-center">
        <div
          className={clsx('my-2', {
            'text-xs font-semibold tracking-wider uppercase text-slate-900': !daisyui,
            'text-sm font-bold uppercase flex items-center justify-center leading-none text-base-content/60':
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
      <div className="flex flex-col gap-3 w-full items-center">
        <div
          className={clsx('my-2 w-full px-2', {
            'text-xs font-semibold tracking-wider uppercase text-slate-900': !daisyui,
            'text-sm font-bold uppercase flex items-center leading-none text-base-content/60':
              daisyui,
          })}
        >
          Variables
        </div>
        <div className={clsx('w-full px-2 flex flex-col gap-3')}>
          {Object.keys(variables).length === 0 ? (
            <div
              className={clsx('text-xs rounded-md p-2', {
                'text-slate-500 bg-white border border-slate-900/10': !daisyui,
                'text-base-content/60 bg-base-100 border border-base-300': daisyui,
              })}
            >
              No variables yet. Add one below.
            </div>
          ) : (
            Object.entries(variables).map(([key, value]) => (
              <div
                key={key}
                className={clsx('flex items-center gap-2 rounded-md', {
                  'bg-white border border-slate-900/10 p-2': !daisyui,
                  'bg-base-100 border border-base-300 p-2': daisyui,
                })}
                title={`Use as {{${key}}}`}
              >
                <span
                  className={clsx('text-xs font-mono px-1.5 py-0.5 rounded', {
                    'bg-slate-100 text-slate-700': !daisyui,
                    'bg-base-200 text-base-content/80': daisyui,
                  })}
                >
                  {key}
                </span>
                <input
                  type="text"
                  value={value}
                  onChange={(e) => upsertVariable(key, e.target.value)}
                  className={clsx('flex-1 text-xs px-2 py-1 rounded', {
                    'border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500/60':
                      !daisyui,
                    'input input-bordered input-xs rounded': daisyui,
                  })}
                  placeholder="Value"
                />
                <button
                  type="button"
                  className={clsx('inline-flex items-center justify-center rounded p-1', {
                    'text-red-600 hover:bg-red-50': !daisyui,
                    'btn btn-ghost btn-xs text-error': daisyui,
                  })}
                  aria-label={`Delete variable ${key}`}
                  onClick={() => deleteVariable(key)}
                >
                  <Trash size={14} />
                </button>
              </div>
            ))
          )}
          <div
            className={clsx('flex items-center gap-2 rounded-md', {
              'bg-white border border-dashed border-slate-900/20 p-2': !daisyui,
              'bg-base-100 border border-dashed border-base-300 p-2': daisyui,
            })}
          >
            <input
              type="text"
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
              placeholder="key"
              className={clsx('w-20 text-xs px-2 py-1 rounded', {
                'border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500/60':
                  !daisyui,
                'input input-bordered input-xs rounded': daisyui,
              })}
            />
            <input
              type="text"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              placeholder="value"
              className={clsx('flex-1 text-xs px-2 py-1 rounded', {
                'border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500/60':
                  !daisyui,
                'input input-bordered input-xs rounded': daisyui,
              })}
            />
            <button
              type="button"
              onClick={handleAddVariable}
              className={clsx('text-xs px-2 py-1 rounded', {
                'bg-green-600 text-white hover:bg-green-700': !daisyui,
                'btn btn-primary btn-xs': daisyui,
              })}
            >
              Add
            </button>
          </div>
          <div
            className={clsx('text-[10px] px-1 text-slate-500', { 'text-base-content/60': daisyui })}
          >
            Use variables like {'{{order_id}}'} in text fields.
          </div>
        </div>
      </div>
    </aside>
  );
}
