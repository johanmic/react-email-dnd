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
import { useCallback, useMemo, useState, type KeyboardEvent } from 'react';
import { PencilSimpleIcon, PlusIcon, TrashIcon, X } from '@phosphor-icons/react';
import { useCanvasStore } from '../hooks/useCanvasStore';
import { getSidebarBlockId } from '../utils/block-library';
import { Modal } from './Modal';
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
}

interface VariableDraft {
  id: string;
  key: string;
  value: string;
}

export function Sidebar({
  structureItems = DEFAULT_STRUCTURE_ITEMS,
  blocks = DEFAULT_CONTENT_ITEMS,
  daisyui = false,
  columns = 2,
}: SidebarProps) {
  const { variables, upsertVariable, deleteVariable } = useCanvasStore();
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [isVariablesModalOpen, setIsVariablesModalOpen] = useState(false);
  const [variableDrafts, setVariableDrafts] = useState<VariableDraft[]>([]);

  const variableEntries = useMemo(() => Object.entries(variables), [variables]);

  const createDraftId = useCallback(() => Math.random().toString(36).slice(2, 10), []);

  const gridListClasses = useMemo(
    () =>
      clsx('w-full grid gap-3 grid-cols-1', {
        'md:grid-cols-2': columns === 2,
        'md:grid-cols-3': columns === 3,
      }),
    [columns],
  );

  const handleAddVariable = () => {
    const key = newKey.trim();
    if (!key) return;
    upsertVariable(key, newValue);
    setNewKey('');
    setNewValue('');
  };

  const openVariablesModal = () => {
    setVariableDrafts(
      variableEntries.map(([key, value], index) => ({
        id: `${key}-${index}-${createDraftId()}`,
        key,
        value,
      })),
    );
    setIsVariablesModalOpen(true);
  };

  const closeVariablesModal = () => {
    setIsVariablesModalOpen(false);
  };

  const handleDraftChange = (id: string, field: 'key' | 'value', value: string) => {
    setVariableDrafts((drafts) =>
      drafts.map((draft) => (draft.id === id ? { ...draft, [field]: value } : draft)),
    );
  };

  const handleDraftRemove = (id: string) => {
    setVariableDrafts((drafts) => drafts.filter((draft) => draft.id !== id));
  };

  const handleDraftAdd = () => {
    setVariableDrafts((drafts) => [
      ...drafts,
      { id: `new-${createDraftId()}`, key: '', value: '' },
    ]);
  };

  const handleSaveDrafts = () => {
    const trimmedEntries = variableDrafts
      .map(({ key, value }) => ({ key: key.trim(), value }))
      .filter(({ key }) => key);

    const nextVariables = trimmedEntries.reduce<Record<string, string>>((acc, { key, value }) => {
      acc[key] = value;
      return acc;
    }, {});

    const nextKeys = new Set(Object.keys(nextVariables));

    Object.keys(variables).forEach((existingKey) => {
      if (!nextKeys.has(existingKey)) {
        deleteVariable(existingKey);
      }
    });

    Object.entries(nextVariables).forEach(([key, value]) => {
      if (variables[key] !== value) {
        upsertVariable(key, value);
      }
    });

    setIsVariablesModalOpen(false);
  };

  const handleNewFieldKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleAddVariable();
    }
  };

  return (
    <aside
      className={clsx('border-l p-2.5 sticky top-0', {
        'w-52': columns === 1,
        'w-80': columns === 2,
        'w-96': columns === 3,
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
                  className={clsx('flex items-center gap-2', {
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
      <div className="flex flex-col gap-3 w-full items-center">
        <div
          className={clsx('my-2 w-full flex items-center justify-between', {
            'text-xs font-semibold tracking-wider uppercase text-slate-900': !daisyui,
            'text-sm font-bold uppercase leading-none text-base-content/60': daisyui,
          })}
        >
          <span>Variables</span>
          <button
            type="button"
            onClick={openVariablesModal}
            className={clsx('inline-flex items-center gap-1 text-[11px] font-medium', {
              'text-slate-700 hover:text-slate-900 transition-colors': !daisyui,
              'btn btn-ghost btn-xs': daisyui,
            })}
          >
            <PencilSimpleIcon size={14} />
            Edit
          </button>
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
            {variableEntries.length === 0 ? (
              <div
                className={clsx('text-xs rounded-md border p-2', {
                  'text-slate-500 bg-slate-50 border-slate-200': !daisyui,
                  'text-base-content/60 bg-base-100 border-base-300': daisyui,
                })}
              >
                No variables yet. Add one below.
              </div>
            ) : (
              <ul className="flex flex-col gap-2">
                {variableEntries.map(([key, value]) => (
                  <li
                    key={key}
                    className={clsx(
                      'flex items-center justify-between gap-2 rounded-md px-2 py-1',
                      {
                        'bg-slate-100 text-slate-800': !daisyui,
                        'bg-base-100 text-base-content': daisyui,
                      },
                    )}
                    title={`Use as {{${key}}}`}
                  >
                    <span className="text-[11px] font-mono font-semibold tracking-tight">
                      {key}
                    </span>
                    <span
                      className={clsx('text-[11px] truncate max-w-[120px]', {
                        'text-slate-600': !daisyui,
                        'text-base-content/70': daisyui,
                      })}
                    >
                      {value || '—'}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <div
              className={clsx('flex items-center gap-2 rounded-md border border-dashed p-2', {
                'bg-white border-slate-300/70': !daisyui,
                'bg-base-100 border-base-300': daisyui,
              })}
            >
              <input
                type="text"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                onKeyDown={handleNewFieldKeyDown}
                placeholder="key"
                className={clsx('w-24 text-xs px-2 py-1 rounded', {
                  'border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500/60':
                    !daisyui,
                  'input input-bordered input-xs rounded': daisyui,
                })}
              />
              <input
                type="text"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                onKeyDown={handleNewFieldKeyDown}
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
                className={clsx(
                  'inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded',
                  {
                    'bg-green-600 text-white hover:bg-green-700 transition-colors': !daisyui,
                    'btn btn-primary btn-xs': daisyui,
                  },
                )}
              >
                <PlusIcon size={12} />
                Add
              </button>
            </div>
            <div
              className={clsx('text-[10px] px-1 text-slate-500', {
                'text-base-content/60': daisyui,
              })}
            >
              Use variables like {'{{order_id}}'} in text fields.
            </div>
          </div>
        </div>
      </div>
      <Modal
        open={isVariablesModalOpen}
        onClose={closeVariablesModal}
        daisyui={daisyui}
        labelledBy="sidebar-variables-modal-title"
      >
        <div
          className={clsx('rounded-xl border p-5 shadow-2xl', {
            'bg-white text-slate-900 border-slate-200': !daisyui,
            'bg-base-100 text-base-content border-base-300': daisyui,
          })}
        >
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <h3
                id="sidebar-variables-modal-title"
                className={clsx('text-base font-semibold', {
                  'text-slate-900': !daisyui,
                  'text-base-content': daisyui,
                })}
              >
                Edit variables
              </h3>
              <p
                className={clsx('text-xs mt-1', {
                  'text-slate-500': !daisyui,
                  'text-base-content/70': daisyui,
                })}
              >
                Update keys or values. Empty keys will be removed on save.
              </p>
            </div>
            <button
              type="button"
              onClick={closeVariablesModal}
              className={clsx('inline-flex rounded p-1', {
                'text-slate-500 hover:text-slate-700': !daisyui,
                'btn btn-ghost btn-sm': daisyui,
              })}
              aria-label="Close"
            >
              <X size={16} />
            </button>
          </div>
          <div className="flex flex-col gap-3 max-h-[50vh] overflow-y-auto pr-1">
            {variableDrafts.length === 0 ? (
              <div
                className={clsx('text-sm rounded-md border p-3 text-center', {
                  'bg-slate-50 text-slate-500 border-slate-200': !daisyui,
                  'bg-base-100 text-base-content/70 border-base-300': daisyui,
                })}
              >
                No variables yet. Add a new one below.
              </div>
            ) : (
              variableDrafts.map((draft) => (
                <div
                  key={draft.id}
                  className={clsx('flex items-start gap-2 rounded-md border p-2', {
                    'bg-slate-50 border-slate-200': !daisyui,
                    'bg-base-100 border-base-300': daisyui,
                  })}
                >
                  <div className="flex flex-1 flex-col gap-2 sm:flex-row">
                    <input
                      type="text"
                      value={draft.key}
                      onChange={(event) => handleDraftChange(draft.id, 'key', event.target.value)}
                      placeholder="key"
                      className={clsx('flex-1 text-xs px-2 py-1 rounded', {
                        'border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500/60':
                          !daisyui,
                        'input input-bordered input-xs rounded': daisyui,
                      })}
                    />
                    <input
                      type="text"
                      value={draft.value}
                      onChange={(event) => handleDraftChange(draft.id, 'value', event.target.value)}
                      placeholder="value"
                      className={clsx('flex-1 text-xs px-2 py-1 rounded', {
                        'border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500/60':
                          !daisyui,
                        'input input-bordered input-xs rounded': daisyui,
                      })}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDraftRemove(draft.id)}
                    className={clsx('inline-flex items-center justify-center rounded p-1', {
                      'text-red-600 hover:bg-red-50': !daisyui,
                      'btn btn-ghost btn-xs text-error': daisyui,
                    })}
                    aria-label="Remove variable"
                  >
                    <TrashIcon size={14} />
                  </button>
                </div>
              ))
            )}
          </div>
          <div className="mt-3 flex justify-between gap-3">
            <button
              type="button"
              onClick={handleDraftAdd}
              className={clsx(
                'inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded',
                {
                  'bg-slate-900 text-white hover:bg-slate-700 transition-colors': !daisyui,
                  'btn btn-primary btn-xs': daisyui,
                },
              )}
            >
              <PlusIcon size={12} />
              Add variable
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={closeVariablesModal}
                className={clsx('px-3 py-1.5 rounded-md text-xs font-medium', {
                  'bg-slate-200 text-slate-700 hover:bg-slate-300': !daisyui,
                  'btn btn-ghost btn-xs': daisyui,
                })}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveDrafts}
                className={clsx('px-3 py-1.5 rounded-md text-xs font-semibold', {
                  'bg-green-600 text-white hover:bg-green-700': !daisyui,
                  'btn btn-success btn-xs': daisyui,
                })}
              >
                Save changes
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </aside>
  );
}
