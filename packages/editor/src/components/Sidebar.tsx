'use client';

import { ColumnsIcon, RowsIcon, SquaresFourIcon } from '@phosphor-icons/react';
import { SidebarItem } from './SidebarItem';
import type {
  BlockDefinition,
  CanvasContentBlock,
  StructurePaletteItem,
} from '@react-email-dnd/shared';
import { buttonDefinition } from './button';
import { dividerDefinition } from './divider';
import { headingDefinition } from './heading';
import { imageDefinition } from './image';
import { textDefinition } from './text';
import clsx from 'clsx';
import { useMemo } from 'react';
import { useCanvasStore } from '../hooks/useCanvasStore';
import { getSidebarBlockId } from '../utils/block-library';
export const DEFAULT_STRUCTURE_ITEMS: StructurePaletteItem[] = [
  { id: 'structure-section', label: 'Section', icon: SquaresFourIcon },
  { id: 'structure-row', label: 'Row', icon: RowsIcon },
  { id: 'structure-columns-1', label: '1 Column', icon: ColumnsIcon },
  { id: 'structure-columns-2', label: '2 Columns', icon: ColumnsIcon },
  { id: 'structure-columns-3', label: '3 Columns', icon: ColumnsIcon },
];

export const DEFAULT_CONTENT_ITEMS = [
  headingDefinition,
  textDefinition,
  dividerDefinition,
  imageDefinition,
  buttonDefinition,
] as BlockDefinition<CanvasContentBlock>[];

export interface SidebarProps {
  structureItems?: StructurePaletteItem[];
  blocks?: BlockDefinition<CanvasContentBlock>[];
  daisyui?: boolean;
  columns?: 1 | 2 | 3;
  variablesLocked?: boolean;
  hidden?: boolean;
}

function getVariableType(value: unknown): 'string' | 'number' | 'object' {
  if (typeof value === 'string') return 'string';
  if (typeof value === 'number') return 'number';
  return 'object';
}

export function Sidebar({
  structureItems = DEFAULT_STRUCTURE_ITEMS,
  blocks = DEFAULT_CONTENT_ITEMS,
  daisyui = false,
  columns = 2,
  hidden = false,
  ...props
}: SidebarProps) {
  // variablesLocked is available via props but not currently used
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _variablesLocked = props.variablesLocked ?? false;
  console.log(
    '[Sidebar] Received blocks prop:',
    blocks.map((b) => b.type),
  );
  const { variables } = useCanvasStore();

  const variableEntries = useMemo(() => Object.entries(variables), [variables]);

  const gridListClasses = useMemo(
    () =>
      clsx('w-full grid gap-3 grid-cols-1', {
        'md:grid-cols-2': columns === 2,
        'md:grid-cols-3': columns === 3,
      }),
    [columns],
  );

  if (hidden) {
    return null;
  }

  return (
    <aside
      className={clsx('p-2 sticky top-0', {
        'w-52': columns === 1,
        'w-80': columns === 2,
        'w-96': columns === 3,
        'flex flex-col gap-5 bg-slate-50': !daisyui,
        'border-black': !daisyui,
        'flex flex-col gap-5 border-primary': daisyui,
      })}
    >
      {structureItems.length > 0 && (
        <div className="flex flex-col gap-3 items-center">
          <p
            className={clsx({
              'mb-y text-xs font-semibold tracking-wider uppercase text-slate-900': !daisyui,
              'text-sm font-bold uppercase mb-4 leading-none text-base-content/60': daisyui,
            })}
          >
            Structure
          </p>
          <div className={gridListClasses}>
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
      )}
      {blocks.length > 0 && (
        <div className="flex flex-col gap-3 items-center">
          <div
            className={clsx('my-2', {
              'mb-y text-xs font-semibold tracking-wider uppercase text-slate-900': !daisyui,
              'text-sm font-bold uppercase flex items-center justify-center leading-none text-base-content/60':
                daisyui,
            })}
          >
            Content
          </div>
          <div className={gridListClasses}>
            {blocks.map((block) => {
              const paletteId = getSidebarBlockId(block);
              return (
                <SidebarItem
                  id={paletteId}
                  key={paletteId}
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
                    className={clsx('flex items-center gap-4', {
                      'p-3 rounded-xl border border-dashed border-slate-900/10 bg-white text-slate-900 text-sm font-medium leading-5 transition transform group-hover:border-green-500/40 group-hover:shadow-lg group-hover:-translate-y-0.5 group-focus-within:border-green-500/40 group-focus-within:shadow-lg active:scale-95':
                        !daisyui,
                    })}
                  >
                    <block.icon size={18} weight="duotone" />
                    <span>{block.label}</span>
                  </div>
                </SidebarItem>
              );
            })}
          </div>
        </div>
      )}
      {variableEntries.length > 0 && (
        <div className="flex flex-col gap-3 w-full items-center">
          <div
            className={clsx('my-2 w-full', {
              'text-xs font-semibold tracking-wider uppercase text-slate-900': !daisyui,
              'text-sm font-bold uppercase leading-none text-base-content/60': daisyui,
            })}
          >
            <span>Variables</span>
          </div>
          <div
            className={clsx('w-full flex flex-col gap-3', {
              'px-2': !daisyui,
              'px-3': daisyui,
            })}
          >
            <div
              className={clsx('flex flex-col gap-3 rounded-lg border p-3', {
                'bg-white border-slate-200 shadow-sm': !daisyui,
                'bg-base-200 border-base-300': daisyui,
              })}
            >
              <ul className="flex flex-col gap-2">
                {variableEntries.map(([key, value]) => {
                  const varType = getVariableType(value);
                  return (
                    <li
                      key={key}
                      className={clsx(
                        'flex items-center justify-between gap-2 rounded-md px-2 py-1',
                        {
                          'bg-slate-100 text-slate-800': !daisyui,
                          'bg-base-100 text-base-content': daisyui,
                        },
                      )}
                      title={`Variable: ${key} (${varType})`}
                    >
                      <span className="text-[11px] font-mono font-semibold tracking-tight">
                        {key}
                      </span>
                      <span
                        className={clsx('text-[11px]', {
                          'text-slate-600': !daisyui,
                          'text-base-content/70': daisyui,
                        })}
                      >
                        {varType}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
