// packages/editor/src/components/PropertiesPanel.tsx
import React, { useCallback, useMemo, useRef, useState } from 'react';
import clsx from 'clsx';
import { X, TrashIcon, LockIcon, LockOpenIcon, CaretDownIcon } from '@phosphor-icons/react';
import { useCanvasStore } from '../hooks/useCanvasStore';
import { ConfirmModal } from './ConfirmModal';
import { removeBlock } from '../utils/drag-drop';
import type {
  ButtonBlockProps,
  TextBlockProps,
  ImageBlockProps,
  HeadingBlockProps,
  CanvasContentBlock,
} from '@react-email-dnd/shared';

interface PropertiesPanelProps {
  className?: string;
  daisyui?: boolean;

  unlockable?: boolean;
  colors?: string[];
}

interface TextPropsFormProps {
  block: CanvasContentBlock & { type: 'text' };
  onUpdate: (props: Partial<TextBlockProps>) => void;
  daisyui?: boolean;
  colors?: string[];
}

interface LockedToggleProps {
  locked: boolean;
  onToggle: () => void;
  daisyui?: boolean;
}

interface HeadingPropsFormProps {
  block: CanvasContentBlock & { type: 'heading' };
  onUpdate: (props: Partial<HeadingBlockProps>) => void;
  daisyui?: boolean;
  colors?: string[];
}

interface ButtonPropsFormProps {
  block: CanvasContentBlock & { type: 'button' };
  onUpdate: (props: Partial<ButtonBlockProps>) => void;
  daisyui?: boolean;
  colors?: string[];
}

interface ImagePropsFormProps {
  block: CanvasContentBlock & { type: 'image' };
  onUpdate: (props: Partial<ImageBlockProps>) => void;
  daisyui?: boolean;
  colors?: string[];
}

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  colors?: string[];
  daisyui?: boolean;
  disabled?: boolean;
}

function ColorPicker({ value, onChange, colors, daisyui, disabled }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleColorSelect = (color: string) => {
    onChange(color);
    setIsOpen(false);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  };

  React.useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  if (!colors || colors.length === 0) {
    return null;
  }

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          'w-12 h-10 rounded-md border-2 transition-all duration-200 flex items-center justify-center',
          {
            'border-gray-300 hover:border-gray-400': !daisyui && !disabled,
            'border-base-300 hover:border-primary/50': daisyui && !disabled,
            'border-gray-200 opacity-50 cursor-not-allowed': disabled,
            'border-blue-500 ring-2 ring-blue-500/20': isOpen && !disabled,
          },
        )}
        style={{ backgroundColor: value }}
        aria-label="Open color picker"
      >
        <CaretDownIcon
          size={12}
          className={clsx('transition-transform duration-200', {
            'text-white': !daisyui,
            'text-base-content': daisyui,
            'rotate-180': isOpen,
          })}
        />
      </button>

      {isOpen && (
        <div
          className={clsx('absolute top-full left-0 mt-2 p-3 rounded-lg border shadow-lg z-50', {
            'bg-white border-gray-200': !daisyui,
            'bg-base-100 border-base-300': daisyui,
          })}
        >
          <div className="grid grid-cols-6 gap-2">
            {colors.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => handleColorSelect(color)}
                className={clsx(
                  'w-8 h-8 rounded-full border-2 transition-all duration-200 hover:scale-110',
                  {
                    'border-gray-300 hover:border-gray-400': !daisyui,
                    'border-base-300 hover:border-primary/50': daisyui,
                    'ring-2 ring-blue-500 ring-offset-2': value === color,
                  },
                )}
                style={{ backgroundColor: color }}
                aria-label={`Select color ${color}`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function LockedToggle({ locked, onToggle, daisyui }: LockedToggleProps) {
  return (
    <div
      className={clsx('flex items-center justify-between p-4 rounded-lg border mb-6', {
        'bg-amber-50/50 border-amber-200': !daisyui && locked,
        'bg-gray-50 border-gray-200': !daisyui && !locked,
        'bg-warning/10 border-warning/20': daisyui && locked,
        'bg-base-200 border-base-300': daisyui && !locked,
      })}
    >
      <div className="flex items-center gap-3">
        {locked ? (
          <LockIcon
            size={20}
            weight="bold"
            className={clsx({
              'text-amber-600': !daisyui,
              'text-warning': daisyui,
            })}
          />
        ) : (
          <LockOpenIcon
            size={20}
            weight="bold"
            className={clsx({
              'text-gray-500': !daisyui,
              'text-base-content/60': daisyui,
            })}
          />
        )}
        <div>
          <div
            className={clsx('text-sm font-medium', {
              'text-gray-900': !daisyui,
              'text-base-content': daisyui,
            })}
          >
            {locked ? 'Locked' : 'Unlocked'}
          </div>
          <div
            className={clsx('text-xs', {
              'text-gray-600': !daisyui,
              'text-base-content/70': daisyui,
            })}
          >
            {locked ? 'Cannot be edited or moved' : 'Can be edited and moved'}
          </div>
        </div>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={locked}
          onChange={onToggle}
          className="sr-only peer"
          aria-label={locked ? 'Unlock block' : 'Lock block'}
        />
        <div
          className={clsx(
            "w-11 h-6 rounded-full peer transition-colors peer-focus:ring-2 peer-focus:ring-offset-1 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-transform peer-checked:after:translate-x-full",
            {
              'bg-gray-300 peer-checked:bg-amber-500 peer-focus:ring-amber-500/20': !daisyui,
              'bg-base-300 peer-checked:bg-warning peer-focus:ring-warning/20': daisyui,
            },
          )}
        />
      </label>
    </div>
  );
}

function HeadingPropsForm({
  block,
  onUpdate,
  daisyui,
  colors,
  disabled = false,
}: HeadingPropsFormProps & { disabled?: boolean }) {
  const props = block.props as HeadingBlockProps;
  const { variables } = useCanvasStore();
  const contentRef = useRef<HTMLTextAreaElement | null>(null);

  const variableKeys = useMemo(() => Object.keys(variables), [variables]);

  const insertVariable = (key: string) => {
    const el = contentRef.current;
    if (!el) return;
    const start = el.selectionStart ?? el.value.length;
    const end = el.selectionEnd ?? el.value.length;
    const before = el.value.slice(0, start);
    const after = el.value.slice(end);
    const next = `${before}{{${key}}}${after}`;
    onUpdate({ content: next });
    setTimeout(() => {
      el.focus();
      const caret = start + key.length + 4;
      el.setSelectionRange(caret, caret);
    }, 0);
  };

  const labelCls = clsx('block text-sm font-medium mb-2 leading-snug', {
    'text-gray-700': !daisyui,
    'text-base-content/80': daisyui,
  });
  const helpCls = clsx('block text-xs mt-1', {
    'text-gray-500': !daisyui,
    'text-base-content/60': daisyui,
  });
  const fieldBase = 'w-full px-3 py-2 rounded-md text-sm transition focus:outline-none';
  const fieldCls = clsx(fieldBase, {
    'border border-gray-300 bg-white hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10':
      !daisyui,
    'border border-base-300 bg-base-100 text-base-content hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/10':
      daisyui,
  });
  const selectCls = clsx(fieldCls, 'cursor-pointer pr-10');
  const colorBoxCls = clsx('w-12 h-10 p-1 rounded-md cursor-pointer', {
    'border border-gray-300 bg-white': !daisyui,
    'border border-base-300 bg-base-100': daisyui,
  });
  const inlineTextInputCls = clsx(
    'flex-1 ml-3 px-3 py-2 rounded-md text-sm transition focus:outline-none',
    {
      'border border-gray-300 bg-white hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10':
        !daisyui,
      'border border-base-300 bg-base-100 text-base-content hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/10':
        daisyui,
    },
  );

  return (
    <fieldset disabled={disabled || block.locked} className="space-y-6">
      <div>
        <label className={labelCls}>Heading Level</label>
        <select
          value={props.as || 'h1'}
          onChange={(e) =>
            onUpdate({ as: e.target.value as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' })
          }
          className={selectCls}
        >
          <option value="h1">H1</option>
          <option value="h2">H2</option>
          <option value="h3">H3</option>
          <option value="h4">H4</option>
          <option value="h5">H5</option>
          <option value="h6">H6</option>
        </select>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <label className={labelCls}>Text Content</label>
          {variableKeys.length > 0 && (
            <div className="flex items-center gap-2">
              <span
                className={clsx('text-xs', {
                  'text-gray-500': !daisyui,
                  'text-base-content/60': daisyui,
                })}
              >
                variables:
              </span>
              <select
                className={clsx('text-xs px-2 py-1 rounded', {
                  'border border-gray-300 bg-white': !daisyui,
                  'select select-bordered select-xs rounded': daisyui,
                })}
                onChange={(e) => {
                  if (e.target.value) insertVariable(e.target.value);
                  e.currentTarget.selectedIndex = 0;
                }}
              >
                <option value="">Choose</option>
                {variableKeys.map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
        <textarea
          ref={contentRef}
          value={props.content || ''}
          onChange={(e) => onUpdate({ content: e.target.value })}
          className={clsx(fieldCls, 'resize-y min-h-16')}
          rows={3}
          placeholder="Enter your text content..."
        />
        {variableKeys.length > 0 ? (
          <div className="mt-2 flex flex-wrap gap-2">
            {variableKeys.map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => insertVariable(k)}
                className={clsx('text-[11px] px-2 py-0.5 rounded', {
                  'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300':
                    !daisyui,
                  'btn btn-xs': daisyui,
                })}
                title={`Insert {{${k}}}`}
              >
                {'{{'}
                {k}
                {'}}'}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div>
        <label className={labelCls}>Alignment</label>
        <select
          value={props.align || 'left'}
          onChange={(e) => onUpdate({ align: e.target.value as 'left' | 'center' | 'right' })}
          className={selectCls}
        >
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
        </select>
      </div>

      <div>
        <label className={labelCls}>Font Size</label>
        <input
          type="number"
          value={props.fontSize || 16}
          onChange={(e) => onUpdate({ fontSize: Number(e.target.value) })}
          className={fieldCls}
          min="8"
          max="72"
        />
        <span className={helpCls}>Pixels (8-72)</span>
      </div>

      <div>
        <label className={labelCls}>Color</label>
        <div className="flex items-center gap-3">
          <ColorPicker
            value={props.color || '#1f2937'}
            onChange={(color) => onUpdate({ color })}
            colors={colors}
            daisyui={daisyui}
            disabled={disabled || block.locked}
          />
          <input
            type="text"
            value={props.color || '#1f2937'}
            onChange={(e) => onUpdate({ color: e.target.value })}
            className={inlineTextInputCls}
            placeholder="#1f2937"
            disabled={disabled || block.locked}
          />
        </div>
      </div>

      <div>
        <label className={labelCls}>Font Weight</label>
        <select
          value={props.fontWeight || 'normal'}
          onChange={(e) => onUpdate({ fontWeight: e.target.value as 'normal' | 'medium' | 'bold' })}
          className={selectCls}
        >
          <option value="normal">Normal</option>
          <option value="medium">Medium</option>
          <option value="bold">Bold</option>
        </select>
      </div>

      <div>
        <label className={labelCls}>Line Height</label>
        <input
          type="text"
          value={props.lineHeight || '1.6'}
          onChange={(e) => onUpdate({ lineHeight: e.target.value })}
          placeholder="1.6"
          className={fieldCls}
        />
        <span className={helpCls}>Number or percentage (e.g., 1.6 or 150%)</span>
      </div>
    </fieldset>
  );
}

function TextPropsForm({
  block,
  onUpdate,
  daisyui,
  colors,
  disabled = false,
}: TextPropsFormProps & { disabled?: boolean }) {
  const props = block.props as TextBlockProps;
  const { variables } = useCanvasStore();
  const contentRef = useRef<HTMLTextAreaElement | null>(null);

  const variableKeys = useMemo(() => Object.keys(variables), [variables]);

  const insertVariable = (key: string) => {
    const el = contentRef.current;
    if (!el) return;
    const start = el.selectionStart ?? el.value.length;
    const end = el.selectionEnd ?? el.value.length;
    const before = el.value.slice(0, start);
    const after = el.value.slice(end);
    const next = `${before}{{${key}}}${after}`;
    onUpdate({ content: next });
    setTimeout(() => {
      el.focus();
      const caret = start + key.length + 4;
      el.setSelectionRange(caret, caret);
    }, 0);
  };

  const labelCls = clsx('block text-sm font-medium mb-2 leading-snug', {
    'text-gray-700': !daisyui,
    'text-base-content/80': daisyui,
  });
  const helpCls = clsx('block text-xs mt-1', {
    'text-gray-500': !daisyui,
    'text-base-content/60': daisyui,
  });
  const fieldBase = 'w-full px-3 py-2 rounded-md text-sm transition focus:outline-none';
  const fieldCls = clsx(fieldBase, {
    'border border-gray-300 bg-white hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10':
      !daisyui,
    'border border-base-300 bg-base-100 text-base-content hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/10':
      daisyui,
  });
  const selectCls = clsx(fieldCls, 'cursor-pointer pr-10');
  const colorBoxCls = clsx('w-12 h-10 p-1 rounded-md cursor-pointer', {
    'border border-gray-300 bg-white': !daisyui,
    'border border-base-300 bg-base-100': daisyui,
  });
  const inlineTextInputCls = clsx(
    'flex-1 ml-3 px-3 py-2 rounded-md text-sm transition focus:outline-none',
    {
      'border border-gray-300 bg-white hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10':
        !daisyui,
      'border border-base-300 bg-base-100 text-base-content hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/10':
        daisyui,
    },
  );

  return (
    <fieldset disabled={disabled || block.locked} className="space-y-6">
      <div>
        <div className="flex items-center justify-between">
          <label className={labelCls}>Text Content</label>
          {variableKeys.length > 0 && (
            <div className="flex items-center gap-2">
              <span
                className={clsx('text-xs', {
                  'text-gray-500': !daisyui,
                  'text-base-content/60': daisyui,
                })}
              >
                variables:
              </span>
              <select
                className={clsx('text-xs px-2 py-1 rounded', {
                  'border border-gray-300 bg-white': !daisyui,
                  'select select-bordered select-xs rounded': daisyui,
                })}
                onChange={(e) => {
                  if (e.target.value) insertVariable(e.target.value);
                  e.currentTarget.selectedIndex = 0;
                }}
              >
                <option value="">Choose</option>
                {variableKeys.map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
        <textarea
          ref={contentRef}
          value={props.content || ''}
          onChange={(e) => onUpdate({ content: e.target.value })}
          className={clsx(fieldCls, 'resize-y min-h-16')}
          rows={3}
          placeholder="Enter your text content..."
        />
        {variableKeys.length > 0 ? (
          <div className="mt-2 flex flex-wrap gap-2">
            {variableKeys.map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => insertVariable(k)}
                className={clsx('text-[11px] px-2 py-0.5 rounded', {
                  'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300':
                    !daisyui,
                  'btn btn-xs': daisyui,
                })}
                title={`Insert {{${k}}}`}
              >
                {'{{'}
                {k}
                {'}}'}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div>
        <label className={labelCls}>Alignment</label>
        <select
          value={props.align || 'left'}
          onChange={(e) => onUpdate({ align: e.target.value as 'left' | 'center' | 'right' })}
          className={selectCls}
        >
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
        </select>
      </div>

      <div>
        <label className={labelCls}>Font Size</label>
        <input
          type="number"
          value={props.fontSize || 16}
          onChange={(e) => onUpdate({ fontSize: Number(e.target.value) })}
          className={fieldCls}
          min="8"
          max="72"
        />
        <span className={helpCls}>Pixels (8-72)</span>
      </div>

      <div>
        <label className={labelCls}>Color</label>
        <div className="flex items-center gap-3">
          <ColorPicker
            value={props.color || '#1f2937'}
            onChange={(color) => onUpdate({ color })}
            colors={colors}
            daisyui={daisyui}
            disabled={disabled || block.locked}
          />
          <input
            type="text"
            value={props.color || '#1f2937'}
            onChange={(e) => onUpdate({ color: e.target.value })}
            className={inlineTextInputCls}
            placeholder="#1f2937"
            disabled={disabled || block.locked}
          />
        </div>
      </div>

      <div>
        <label className={labelCls}>Font Weight</label>
        <select
          value={props.fontWeight || 'normal'}
          onChange={(e) => onUpdate({ fontWeight: e.target.value as 'normal' | 'medium' | 'bold' })}
          className={selectCls}
        >
          <option value="normal">Normal</option>
          <option value="medium">Medium</option>
          <option value="bold">Bold</option>
        </select>
      </div>

      <div>
        <label className={labelCls}>Line Height</label>
        <input
          type="text"
          value={props.lineHeight || '1.6'}
          onChange={(e) => onUpdate({ lineHeight: e.target.value })}
          placeholder="1.6"
          className={fieldCls}
        />
        <span className={helpCls}>Number or percentage (e.g., 1.6 or 150%)</span>
      </div>
    </fieldset>
  );
}

function ButtonPropsForm({
  block,
  onUpdate,
  daisyui,
  colors,
  disabled = false,
}: ButtonPropsFormProps & { disabled?: boolean }) {
  const props = block.props as ButtonBlockProps;
  const { variables } = useCanvasStore();
  const labelInputRef = useRef<HTMLInputElement | null>(null);
  const hrefInputRef = useRef<HTMLInputElement | null>(null);
  const variableKeys = useMemo(() => Object.keys(variables), [variables]);

  const insertVariableInto = (
    ref: React.RefObject<HTMLInputElement | null>,
    current: string,
    key: string,
    prop: 'label' | 'href',
  ) => {
    const el = ref.current;
    if (!el) return;
    const start = el.selectionStart ?? current.length;
    const end = el.selectionEnd ?? current.length;
    const before = current.slice(0, start);
    const after = current.slice(end);
    const next = `${before}{{${key}}}${after}`;
    onUpdate({ [prop]: next } as Partial<ButtonBlockProps>);
    setTimeout(() => {
      el.focus();
      const caret = start + key.length + 4;
      el.setSelectionRange(caret, caret);
    }, 0);
  };

  const labelCls = clsx('block text-sm font-medium mb-2 leading-snug', {
    'text-gray-700': !daisyui,
    'text-base-content/80': daisyui,
  });
  const helpCls = clsx('block text-xs mt-1', {
    'text-gray-500': !daisyui,
    'text-base-content/60': daisyui,
  });
  const fieldBase = 'w-full px-3 py-2 rounded-md text-sm transition focus:outline-none';
  const fieldCls = clsx(fieldBase, {
    'border border-gray-300 bg-white hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10':
      !daisyui,
    'border border-base-300 bg-base-100 text-base-content hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/10':
      daisyui,
  });
  const selectCls = clsx(fieldCls, 'cursor-pointer pr-10');
  const colorBoxCls = clsx('w-12 h-10 p-1 rounded-md cursor-pointer', {
    'border border-gray-300 bg-white': !daisyui,
    'border border-base-300 bg-base-100': daisyui,
  });
  const inlineTextInputCls = clsx(
    'flex-1 ml-3 px-3 py-2 rounded-md text-sm transition focus:outline-none',
    {
      'border border-gray-300 bg-white hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10':
        !daisyui,
      'border border-base-300 bg-base-100 text-base-content hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/10':
        daisyui,
    },
  );

  return (
    <fieldset disabled={disabled || block.locked} className="space-y-6">
      <div>
        <div className="flex items-center justify-between">
          <label className={labelCls}>Button Text</label>
          {variableKeys.length > 0 && (
            <select
              className={clsx('text-xs px-2 py-1 rounded', {
                'border border-gray-300 bg-white': !daisyui,
                'select select-bordered select-xs rounded': daisyui,
              })}
              onChange={(e) => {
                if (e.target.value)
                  insertVariableInto(labelInputRef, props.label || '', e.target.value, 'label');
                e.currentTarget.selectedIndex = 0;
              }}
            >
              <option value="">Insert variable</option>
              {variableKeys.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          )}
        </div>
        <input
          type="text"
          ref={labelInputRef}
          value={props.label || ''}
          onChange={(e) => onUpdate({ label: e.target.value })}
          className={fieldCls}
          placeholder="Enter button text..."
        />
      </div>

      <div>
        <div className="flex items-center justify-between">
          <label className={labelCls}>URL</label>
          {variableKeys.length > 0 && (
            <select
              className={clsx('text-xs px-2 py-1 rounded', {
                'border border-gray-300 bg-white': !daisyui,
                'select select-bordered select-xs rounded': daisyui,
              })}
              onChange={(e) => {
                if (e.target.value)
                  insertVariableInto(hrefInputRef, props.href || '', e.target.value, 'href');
                e.currentTarget.selectedIndex = 0;
              }}
            >
              <option value="">Insert variable</option>
              {variableKeys.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          )}
        </div>
        <input
          type="url"
          ref={hrefInputRef}
          value={props.href || ''}
          onChange={(e) => onUpdate({ href: e.target.value })}
          placeholder="https://example.com"
          className={fieldCls}
        />
        <span className={helpCls}>Where the button should link to</span>
      </div>

      <div>
        <label className={labelCls}>Alignment</label>
        <select
          value={props.align || 'center'}
          onChange={(e) => onUpdate({ align: e.target.value as 'left' | 'center' | 'right' })}
          className={selectCls}
        >
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
        </select>
      </div>

      <div>
        <label className={labelCls}>Background Color</label>
        <div className="flex items-center gap-3">
          <ColorPicker
            value={props.backgroundColor || '#2563eb'}
            onChange={(color) => onUpdate({ backgroundColor: color })}
            colors={colors}
            daisyui={daisyui}
            disabled={disabled || block.locked}
          />
          <input
            type="text"
            value={props.backgroundColor || '#2563eb'}
            onChange={(e) => onUpdate({ backgroundColor: e.target.value })}
            className={inlineTextInputCls}
            placeholder="#2563eb"
            disabled={disabled || block.locked}
          />
        </div>
      </div>

      <div>
        <label className={labelCls}>Text Color</label>
        <div className="flex items-center gap-3">
          <ColorPicker
            value={props.color || '#ffffff'}
            onChange={(color) => onUpdate({ color })}
            colors={colors}
            daisyui={daisyui}
            disabled={disabled || block.locked}
          />
          <input
            type="text"
            value={props.color || '#ffffff'}
            onChange={(e) => onUpdate({ color: e.target.value })}
            className={inlineTextInputCls}
            placeholder="#ffffff"
            disabled={disabled || block.locked}
          />
        </div>
      </div>

      <div>
        <label className={labelCls}>Border Radius</label>
        <input
          type="number"
          value={props.borderRadius || 6}
          onChange={(e) => onUpdate({ borderRadius: Number(e.target.value) })}
          className={fieldCls}
          min="0"
          max="50"
        />
        <span className={helpCls}>Pixels (0-50)</span>
      </div>
    </fieldset>
  );
}

function ImagePropsForm({
  block,
  onUpdate,
  daisyui,
  colors,
  disabled = false,
}: ImagePropsFormProps & { disabled?: boolean }) {
  const props = block.props as ImageBlockProps;
  const { variables, uploadFile } = useCanvasStore();
  const srcRef = useRef<HTMLInputElement | null>(null);
  const altRef = useRef<HTMLInputElement | null>(null);
  const hrefRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const variableKeys = useMemo(() => Object.keys(variables), [variables]);

  const insertInto = (
    ref: React.RefObject<HTMLInputElement | null>,
    current: string,
    key: string,
    prop: 'src' | 'alt' | 'href',
  ) => {
    const el = ref.current;
    if (!el) return;
    const start = el.selectionStart ?? current.length;
    const end = el.selectionEnd ?? current.length;
    const before = current.slice(0, start);
    const after = current.slice(end);
    const next = `${before}{{${key}}}${after}`;
    onUpdate({ [prop]: next } as Partial<ImageBlockProps>);
    setTimeout(() => {
      el.focus();
      const caret = start + key.length + 4;
      el.setSelectionRange(caret, caret);
    }, 0);
  };

  const labelCls = clsx('block text-sm font-medium mb-2 leading-snug', {
    'text-gray-700': !daisyui,
    'text-base-content/80': daisyui,
  });
  const helpCls = clsx('block text-xs mt-1', {
    'text-gray-500': !daisyui,
    'text-base-content/60': daisyui,
  });
  const fieldBase = 'w-full px-3 py-2 rounded-md text-sm transition focus:outline-none';
  const fieldCls = clsx(fieldBase, {
    'border border-gray-300 bg-white hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10':
      !daisyui,
    'border border-base-300 bg-base-100 text-base-content hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/10':
      daisyui,
  });
  const selectCls = clsx(fieldCls, 'cursor-pointer pr-10');

  const handleFilePick: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    if (!uploadFile) return;
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadFile(file);
      onUpdate({ src: url });
    } finally {
      setUploading(false);
      e.currentTarget.value = '';
    }
  };

  return (
    <fieldset disabled={disabled || block.locked} className="space-y-6">
      <div>
        <div className="flex items-center justify-between">
          <label className={labelCls}>Image URL</label>
          {variableKeys.length > 0 && (
            <select
              className={clsx('text-xs px-2 py-1 rounded', {
                'border border-gray-300 bg-white': !daisyui,
                'select select-bordered select-xs rounded': daisyui,
              })}
              onChange={(e) => {
                if (e.target.value) insertInto(srcRef, props.src || '', e.target.value, 'src');
                e.currentTarget.selectedIndex = 0;
              }}
            >
              <option value="">Insert variable</option>
              {variableKeys.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          )}
        </div>
        <div className="flex gap-2 items-center">
          <input
            type="url"
            ref={srcRef}
            value={props.src || ''}
            onChange={(e) => onUpdate({ src: e.target.value })}
            placeholder="https://example.com/image.jpg"
            className={clsx(fieldCls, 'flex-1')}
          />
          {uploadFile ? (
            <label
              className={clsx('text-xs px-2 py-1 rounded cursor-pointer', {
                'bg-slate-100 hover:bg-slate-200 border border-slate-300': !daisyui,
                'btn btn-xs': daisyui,
              })}
            >
              {uploading ? 'Uploading…' : 'Upload'}
              <input type="file" accept="image/*" className="hidden" onChange={handleFilePick} />
            </label>
          ) : null}
        </div>
        <span className={helpCls}>
          Direct link to your image{uploadFile ? ' or use the Upload button' : ''}
        </span>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <label className={labelCls}>Alt Text</label>
          {variableKeys.length > 0 && (
            <select
              className={clsx('text-xs px-2 py-1 rounded', {
                'border border-gray-300 bg-white': !daisyui,
                'select select-bordered select-xs rounded': daisyui,
              })}
              onChange={(e) => {
                if (e.target.value) insertInto(altRef, props.alt || '', e.target.value, 'alt');
                e.currentTarget.selectedIndex = 0;
              }}
            >
              <option value="">Insert variable</option>
              {variableKeys.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          )}
        </div>
        <input
          type="text"
          ref={altRef}
          value={props.alt || ''}
          onChange={(e) => onUpdate({ alt: e.target.value })}
          placeholder="Image description"
          className={fieldCls}
        />
        <span className={helpCls}>Accessible description for screen readers</span>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <label className={labelCls}>Link URL (Optional)</label>
          {variableKeys.length > 0 && (
            <select
              className={clsx('text-xs px-2 py-1 rounded', {
                'border border-gray-300 bg-white': !daisyui,
                'select select-bordered select-xs rounded': daisyui,
              })}
              onChange={(e) => {
                if (e.target.value) insertInto(hrefRef, props.href || '', e.target.value, 'href');
                e.currentTarget.selectedIndex = 0;
              }}
            >
              <option value="">Insert variable</option>
              {variableKeys.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          )}
        </div>
        <input
          type="url"
          ref={hrefRef}
          value={props.href || ''}
          onChange={(e) => onUpdate({ href: e.target.value })}
          placeholder="https://example.com"
          className={fieldCls}
        />
        <span className={helpCls}>Make the image clickable</span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Width</label>
          <input
            type="number"
            value={props.width || 600}
            onChange={(e) => onUpdate({ width: Number(e.target.value) })}
            className={fieldCls}
            min="1"
          />
          <span className={helpCls}>Pixels</span>
        </div>

        <div>
          <label className={labelCls}>Height</label>
          <input
            type="number"
            value={props.height || 200}
            onChange={(e) => onUpdate({ height: Number(e.target.value) })}
            className={fieldCls}
            min="1"
          />
          <span className={helpCls}>Pixels</span>
        </div>
      </div>

      <div>
        <label className={labelCls}>Placeholder URL</label>
        <input
          type="url"
          value={props.placeholder || ''}
          onChange={(e) => onUpdate({ placeholder: e.target.value })}
          placeholder="Fallback URL used when Image URL is empty"
          className={fieldCls}
        />
        <span className={helpCls}>Optional fallback when no Image URL is set</span>
      </div>

      <div>
        <label className={labelCls}>Alignment</label>
        <select
          value={props.align || 'center'}
          onChange={(e) => onUpdate({ align: e.target.value as 'left' | 'center' | 'right' })}
          className={selectCls}
        >
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
        </select>
      </div>

      <div>
        <label className={labelCls}>Border Radius</label>
        <input
          type="number"
          value={props.borderRadius || 0}
          onChange={(e) => onUpdate({ borderRadius: Number(e.target.value) })}
          className={fieldCls}
          min="0"
          max="50"
        />
        <span className={helpCls}>Pixels (0 for sharp corners)</span>
      </div>
    </fieldset>
  );
}

export function PropertiesPanel({
  className = '',
  daisyui = false,
  unlockable = true,
  colors,
}: PropertiesPanelProps) {
  const { document, setDocument, selectedBlockId, selectedBlock, selectBlock, updateBlockProps } =
    useCanvasStore();
  const [deleteOpen, setDeleteOpen] = useState(false);

  // Check if block or any parent container is locked
  const isBlockOrParentLocked = useCallback((): boolean => {
    if (!selectedBlockId) return false;

    // Check if block itself is locked
    if (selectedBlock?.locked) return true;

    // Find the block's parent containers and check if any are locked
    for (const section of document.sections) {
      if (section.locked) {
        // Check if block is in this locked section
        for (const row of section.rows) {
          for (const column of row.columns) {
            if (column.blocks.some((b) => b.id === selectedBlockId)) {
              return true;
            }
          }
        }
      }

      for (const row of section.rows) {
        if (row.locked) {
          // Check if block is in this locked row
          for (const column of row.columns) {
            if (column.blocks.some((b) => b.id === selectedBlockId)) {
              return true;
            }
          }
        }

        for (const column of row.columns) {
          if (column.locked) {
            // Check if block is in this locked column
            if (column.blocks.some((b) => b.id === selectedBlockId)) {
              return true;
            }
          }
        }
      }
    }

    return false;
  }, [selectedBlockId, selectedBlock, document.sections]);

  const isLocked = isBlockOrParentLocked();

  const handleClose = () => {
    selectBlock(null);
  };

  const handleUpdate = useCallback(
    (blockId: string, props: Record<string, unknown>) => {
      updateBlockProps(blockId, props);
    },
    [updateBlockProps],
  );

  const handleToggleLocked = useCallback(() => {
    if (!selectedBlockId || !selectedBlock) return;
    updateBlockProps(selectedBlockId, { locked: !selectedBlock.locked });
  }, [selectedBlockId, selectedBlock, updateBlockProps]);

  const handleDeleteConfirm = useCallback(() => {
    if (!selectedBlockId) return;
    const nextSections = removeBlock(document.sections, selectedBlockId);
    setDocument({ ...document, sections: nextSections });
    setDeleteOpen(false);
    selectBlock(null);
  }, [document, selectedBlockId, selectBlock, setDocument]);

  if (!selectedBlock) {
    return null;
  }

  const renderPropsForm = () => {
    switch (selectedBlock.type) {
      case 'text':
        return (
          <TextPropsForm
            block={selectedBlock as CanvasContentBlock & { type: 'text' }}
            onUpdate={(props) => handleUpdate(selectedBlock.id, props)}
            daisyui={daisyui}
            colors={colors}
            disabled={isLocked}
          />
        );
      case 'button':
        return (
          <ButtonPropsForm
            block={selectedBlock as CanvasContentBlock & { type: 'button' }}
            onUpdate={(props) => handleUpdate(selectedBlock.id, props)}
            daisyui={daisyui}
            colors={colors}
            disabled={isLocked}
          />
        );
      case 'image':
        return (
          <ImagePropsForm
            block={selectedBlock as CanvasContentBlock & { type: 'image' }}
            onUpdate={(props) => handleUpdate(selectedBlock.id, props)}
            daisyui={daisyui}
            colors={colors}
            disabled={isLocked}
          />
        );
      case 'heading':
        return (
          <HeadingPropsForm
            block={selectedBlock as CanvasContentBlock & { type: 'heading' }}
            onUpdate={(props) => handleUpdate(selectedBlock.id, props)}
            daisyui={daisyui}
            colors={colors}
            disabled={isLocked}
          />
        );
      case 'divider':
        return (
          <div
            className={clsx('text-sm text-center p-8 italic', {
              'text-gray-500': !daisyui,
              'text-base-content/60': daisyui,
            })}
          >
            Divider properties coming soon...
          </div>
        );
      default:
        return (
          <div
            className={clsx('text-sm text-center p-8 italic', {
              'text-gray-500': !daisyui,
              'text-base-content/60': daisyui,
            })}
          >
            Properties for this block type are not yet supported.
          </div>
        );
    }
  };

  const getBlockTypeName = (type: string) => {
    switch (type) {
      case 'text':
        return 'Text';
      case 'button':
        return 'Button';
      case 'image':
        return 'Image';
      case 'heading':
        return 'Heading';
      case 'divider':
        return 'Divider';
      default:
        return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };

  return (
    <div className={clsx('fixed inset-0 z-50 flex items-end justify-end', className)}>
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px] cursor-pointer"
        onClick={handleClose}
      />
      <div
        className={clsx(
          'relative w-[400px] max-w-[90vw] h-full flex flex-col border-l shadow-[ -20px_0_25px_-5px_rgba(0,0,0,0.1),_-8px_0_10px_-6px_rgba(0,0,0,0.1)] animate-[slide-in-right_0.25s_cubic-bezier(0.4,0,0.2,1)]',
          {
            'bg-white border-gray-200': !daisyui,
            'bg-base-100 border-base-200': daisyui,
          },
        )}
      >
        <div
          className={clsx(
            'sticky top-0 z-10 flex items-start justify-between px-5 pt-6 pb-4 border-b',
            {
              'border-gray-100 bg-[#fafafa]': !daisyui,
              'border-base-200 bg-base-200': daisyui,
            },
          )}
        >
          <div>
            <h3
              className={clsx('text-lg font-semibold m-0 leading-snug', {
                'text-gray-900': !daisyui,
                'text-base-content': daisyui,
              })}
            >
              {getBlockTypeName(selectedBlock.type)} Properties
            </h3>
            <p
              className={clsx('text-sm mt-1', {
                'text-gray-500': !daisyui,
                'text-base-content/60': daisyui,
              })}
            >
              Customize your {selectedBlock.type} block
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className={clsx(
              'p-1.5 rounded-md inline-flex items-center justify-center -mt-0.5 transition',
              {
                'text-gray-400 hover:bg-gray-100 hover:text-gray-700 active:bg-gray-200': !daisyui,
                'text-base-content/60 hover:bg-base-200 hover:text-base-content active:bg-base-300':
                  daisyui,
              },
            )}
            aria-label="Close properties panel"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-6 pb-8 overflow-y-auto flex-1">
          {unlockable && !isLocked && (
            <LockedToggle
              locked={!!selectedBlock.locked}
              onToggle={handleToggleLocked}
              daisyui={daisyui}
            />
          )}
          {isLocked && (
            <div
              className={clsx('mb-6 p-4 rounded-lg border-l-4 text-sm', {
                'bg-gray-50 border-gray-400 text-gray-700': !daisyui,
                'bg-base-200 border-base-content/40 text-base-content/80': daisyui,
              })}
            >
              <div className="font-medium mb-1">
                {!unlockable ? 'Template-locked content' : 'Read-only mode'}
              </div>
              <div
                className={clsx('text-xs', {
                  'text-gray-600': !daisyui,
                  'text-base-content/70': daisyui,
                })}
              >
                {!unlockable
                  ? 'This element is locked by the template and cannot be unlocked'
                  : selectedBlock.locked
                    ? 'Unlock this block to edit its properties'
                    : 'This block is in a locked container and cannot be edited'}
              </div>
            </div>
          )}
          <div className={clsx({ 'opacity-60': isLocked })}>{renderPropsForm()}</div>
        </div>
        {['text', 'button', 'image', 'heading', 'divider'].includes(selectedBlock.type) &&
        !isLocked ? (
          <div
            className={clsx('px-6 pb-6 pt-4 border-t', {
              'border-gray-100': !daisyui,
              'border-base-200': daisyui,
            })}
          >
            <button
              type="button"
              onClick={() => setDeleteOpen(true)}
              className={clsx(
                'w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md transition',
                {
                  'bg-red-600 text-white hover:bg-red-700': !daisyui,
                  'btn btn-error': daisyui,
                },
              )}
            >
              <TrashIcon size={18} />
              Delete this block
            </button>
          </div>
        ) : null}

        <ConfirmModal
          open={deleteOpen}
          daisyui={daisyui}
          title="Delete block?"
          description={`This will remove the ${getBlockTypeName(selectedBlock.type)} block.`}
          confirmLabel="Delete"
          onCancel={() => setDeleteOpen(false)}
          onConfirm={handleDeleteConfirm}
        />
      </div>
    </div>
  );
}
