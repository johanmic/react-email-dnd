// packages/editor/src/components/PropertiesPanel.tsx
import React, { useCallback, useMemo, useRef, useState } from 'react';
import clsx from 'clsx';
import {
  X,
  TrashIcon,
  LockIcon,
  LockOpenIcon,
  CaretDownIcon,
  Eye,
  EyeSlash,
} from '@phosphor-icons/react';
import { useCanvasStore } from '../hooks/useCanvasStore';
import { ConfirmModal } from './ConfirmModal';
import { removeBlock } from '../utils/drag-drop';
import type {
  ColorOption,
  ButtonBlockProps,
  TextBlockProps,
  ImageBlockProps,
  HeadingBlockProps,
  CanvasContentBlock,
  CustomBlockProps,
  Padding,
  CustomBlockPropEditor,
  CustomBlockDefinition,
} from '@react-email-dnd/shared';
export type { ColorOption } from '@react-email-dnd/shared';
import {
  getDefaultPaddingOptionEntries,
  isPaddingEqual,
  paddingToDisplay,
  formatPaddingForInput,
  parsePaddingInput,
  type PaddingOptionEntry,
} from '../utils/padding';
// Container types are inferred at usage; no direct type imports needed here

// export type ColorOption =
//   | string
//   | {
//       hex: string; // visual color used for inline styles and email-safe values
//       class?: string; // optional CSS class (e.g., tailwind/daisyUI) applied in editor previews
//       label?: string;
//     };

// Legacy type - now imported from shared schema
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type CustomBlockPropEditors = Record<string, CustomBlockPropEditor<any>>;

interface PropertiesPanelProps {
  className?: string;
  daisyui?: boolean;

  unlockable?: boolean;
  colors?: ColorOption[];
  textColors?: ColorOption[];
  bgColors?: ColorOption[];
  customBlockRegistry?: Record<string, CustomBlockDefinition<Record<string, unknown>>>;
  paddingOptions?: PaddingOptionEntry[];
}

interface TextPropsFormProps {
  block: CanvasContentBlock & { type: 'text' };
  onUpdate: (props: Partial<TextBlockProps>) => void;
  daisyui?: boolean;
  colors?: ColorOption[];
  textColors?: ColorOption[];
  paddingOptions: PaddingOptionEntry[];
}

interface LockedToggleProps {
  locked: boolean;
  onToggle: () => void;
  daisyui?: boolean;
}

interface HiddenToggleProps {
  hidden: boolean;
  onToggle: () => void;
  daisyui?: boolean;
}

interface HeadingPropsFormProps {
  block: CanvasContentBlock & { type: 'heading' };
  onUpdate: (props: Partial<HeadingBlockProps>) => void;
  daisyui?: boolean;
  colors?: ColorOption[];
  textColors?: ColorOption[];
  paddingOptions: PaddingOptionEntry[];
}

interface ButtonPropsFormProps {
  block: CanvasContentBlock & { type: 'button' };
  onUpdate: (props: Partial<ButtonBlockProps>) => void;
  daisyui?: boolean;
  colors?: ColorOption[];
  textColors?: ColorOption[];
  paddingOptions: PaddingOptionEntry[];
}

interface ImagePropsFormProps {
  block: CanvasContentBlock & { type: 'image' };
  onUpdate: (props: Partial<ImageBlockProps>) => void;
  daisyui?: boolean;
  paddingOptions: PaddingOptionEntry[];
}

interface ColorPickerProps {
  value?: string;
  valueClassName?: string;
  onChange: (color: string | undefined, meta?: { hex?: string; className?: string }) => void;
  colors?: ColorOption[];
  daisyui?: boolean;
  disabled?: boolean;
}

function ColorPicker({
  value,
  valueClassName,
  onChange,
  colors,
  daisyui,
  disabled,
}: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  type Swatch = {
    key: string;
    hex?: string;
    className?: string;
    labelClassName?: string;
    label: string;
  };

  const swatches = useMemo<Swatch[]>(() => {
    if (!colors) return [];
    return colors
      .map((entry): Swatch | null => {
        if (typeof entry === 'string') {
          return { key: `hex:${entry.toLowerCase()}`, hex: entry, label: entry };
        }
        const hex = entry?.hex;
        const className = entry?.class;
        const labelClassName = entry?.labelClass;
        if (!hex && !className) return null;
        const key = className ? `class:${className}` : `hex:${(hex ?? '').toLowerCase()}`;
        return {
          key,
          hex: hex ?? undefined,
          className: className ?? undefined,
          labelClassName: labelClassName ?? undefined,
          label: entry.label ?? entry.tw ?? className ?? hex ?? key,
        };
      })
      .filter((e): e is Swatch => e !== null);
  }, [colors]);

  const selectedKey = useMemo(() => {
    if (valueClassName) {
      const match = swatches.find((swatch) => swatch.className === valueClassName);
      if (match) return match.key;
    }
    if (value) {
      const normalized = value.toLowerCase();
      const match = swatches.find((swatch) => swatch.hex?.toLowerCase() === normalized);
      if (match) return match.key;
      return `hex:${normalized}`;
    }
    return undefined;
  }, [swatches, value, valueClassName]);

  const selectedSwatch = useMemo(() => {
    if (!selectedKey) return undefined;
    return swatches.find((swatch) => swatch.key === selectedKey);
  }, [selectedKey, swatches]);

  const previewStyle = useMemo(() => {
    const style: React.CSSProperties = {};
    if (selectedSwatch?.hex) {
      style.backgroundColor = selectedSwatch.hex;
    } else if (value && /^#([0-9a-fA-F]{3}){1,2}$/.test(value)) {
      style.backgroundColor = value;
    }
    return style;
  }, [selectedSwatch, value]);

  const handleColorSelect = (swatch: Swatch) => {
    const nextColor = swatch.hex ?? undefined;
    onChange(nextColor, { hex: swatch.hex, className: swatch.className });
    setIsOpen(false);
  };

  const handleClickOutside = useCallback((event: MouseEvent) => {
    const target = event.target as Node;
    if (buttonRef.current?.contains(target)) {
      return;
    }
    if (dropdownRef.current?.contains(target)) {
      return;
    }
    setIsOpen(false);
  }, []);

  React.useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [handleClickOutside, isOpen]);

  if (swatches.length === 0) {
    const safeValue = value && /^#([0-9a-fA-F]{3}){1,2}$/.test(value) ? value : '#ffffff';
    return (
      <input
        type="color"
        disabled={disabled}
        value={safeValue}
        onChange={(event) => {
          const next = event.target.value;
          onChange(next, { hex: next });
        }}
        className={clsx('h-14 w-16 rounded-xl border-0 cursor-pointer p-0', {
          'opacity-50 cursor-not-allowed': disabled,
        })}
        aria-label="Choose color"
      />
    );
  }

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        disabled={disabled}
        onClick={() => {
          setIsOpen(!isOpen);
        }}
        className={clsx(
          'w-16 h-14 rounded-xl border-2 transition-all duration-200 flex items-center justify-center',
          {
            'border-gray-300 hover:border-gray-400': !daisyui && !disabled,
            'border-base-100 hover:border-primary/50': daisyui && !disabled,
            'border-gray-200 opacity-50 cursor-not-allowed': disabled,
            'border-blue-500 ring-2 ring-blue-500/20': isOpen && !disabled,
          },
        )}
        aria-label="Open color picker"
      >
        <div
          className={clsx(
            'w-10 h-10 rounded-full border transition-all duration-200 flex items-center justify-center',
            {
              'border-gray-200 bg-white': !selectedSwatch?.className && !selectedSwatch?.hex,
              'border-base-200 bg-base-100':
                daisyui && !selectedSwatch?.className && !selectedSwatch?.hex,
            },
            selectedSwatch?.className,
            selectedSwatch?.labelClassName,
          )}
          style={previewStyle}
        >
          <CaretDownIcon
            size={12}
            className={clsx('transition-transform duration-200', {
              'text-gray-600': !daisyui,
              'text-base-content': daisyui,
              'rotate-180': isOpen,
            })}
          />
        </div>
      </button>

      {isOpen && (
        <div
          ref={dropdownRef}
          className={clsx('absolute top-full left-0 mt-2 p-3 rounded-lg border shadow-lg z-50', {
            'bg-white border-gray-200': !daisyui,
            'bg-base-100 border-base-300': daisyui,
          })}
        >
          <div className="flex flex-wrap gap-3 w-60">
            {swatches.map((sw) => (
              <button
                key={sw.key}
                type="button"
                onClick={() => handleColorSelect(sw)}
                className={clsx(
                  'w-10 h-10 rounded-full border-2 transition-all duration-200 hover:scale-105',
                  {
                    'border-gray-300 hover:border-gray-400': !daisyui,
                    'border-base-300 hover:border-primary/50': daisyui,
                    'ring-2ring-offset-2': selectedKey === sw.key,
                  },
                )}
                aria-label={`Select color ${sw.label}`}
              >
                <div
                  className={clsx('w-full h-full rounded-full', sw.labelClassName || sw.className)}
                  style={sw.hex ? { backgroundColor: sw.hex } : undefined}
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface PaddingButtonGroupProps {
  value?: Padding;
  options: PaddingOptionEntry[];
  onChange: (value: Padding | undefined) => void;
  disabled?: boolean;
  daisyui?: boolean;
  allowClear?: boolean;
}

function PaddingButtonGroup({
  value,
  options,
  onChange,
  disabled,
  daisyui,
  allowClear = false,
}: PaddingButtonGroupProps) {
  const activeOption = useMemo(
    () => options.find((option) => isPaddingEqual(option.value, value)),
    [options, value],
  );

  const handleSelect = useCallback(
    (next: Padding) => {
      if (disabled) {
        return;
      }
      onChange(next);
    },
    [disabled, onChange],
  );

  const handleClear = useCallback(() => {
    if (disabled) return;
    onChange(undefined);
  }, [disabled, onChange]);

  const buttonBaseClass = daisyui
    ? 'btn btn-xs'
    : 'px-3 py-1 text-xs font-medium rounded-md border transition';

  const selectedClass = daisyui
    ? 'btn-primary'
    : 'bg-slate-900 text-white border-slate-900 shadow-sm';

  const unselectedClass = daisyui
    ? 'btn-ghost'
    : 'bg-white text-slate-600 border-slate-300 hover:border-slate-400 hover:text-slate-900';

  const clearButtonClass = daisyui
    ? 'btn btn-xs btn-outline'
    : 'px-2.5 py-1 text-xs font-medium rounded-md border border-slate-200 text-slate-500 hover:border-slate-300';

  const customNoticeClass = daisyui ? 'text-xs text-base-content/60' : 'text-xs text-slate-500';

  const hasCustomValue = value != null && !activeOption;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isActive = activeOption?.id === option.id;
          return (
            <button
              key={option.id}
              type="button"
              disabled={disabled}
              className={clsx(buttonBaseClass, isActive ? selectedClass : unselectedClass, {
                'opacity-60 cursor-not-allowed': disabled,
              })}
              onClick={() => handleSelect(option.value)}
            >
              {option.label}
            </button>
          );
        })}
        {allowClear ? (
          <button
            type="button"
            disabled={disabled}
            className={clsx(clearButtonClass, { 'opacity-60 cursor-not-allowed': disabled })}
            onClick={handleClear}
          >
            Clear
          </button>
        ) : null}
      </div>
      {hasCustomValue ? (
        <span className={customNoticeClass}>Custom padding: {paddingToDisplay(value)}</span>
      ) : null}
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

function HiddenToggle({ hidden, onToggle, daisyui }: HiddenToggleProps) {
  return (
    <div
      className={clsx('flex items-center justify-between p-4 rounded-lg border mb-6', {
        'bg-blue-50/50 border-blue-200': !daisyui && hidden,
        'bg-gray-50 border-gray-200': !daisyui && !hidden,
        'bg-info/10 border-info/20': daisyui && hidden,
        'bg-base-200 border-base-300': daisyui && !hidden,
      })}
    >
      <div className="flex items-center gap-3">
        {hidden ? (
          <EyeSlash
            size={20}
            weight="bold"
            className={clsx({
              'text-blue-600': !daisyui,
              'text-info': daisyui,
            })}
          />
        ) : (
          <Eye
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
            {hidden ? 'Hidden' : 'Visible'}
          </div>
          <div
            className={clsx('text-xs', {
              'text-gray-600': !daisyui,
              'text-base-content/70': daisyui,
            })}
          >
            {hidden
              ? 'Not shown in editor or rendered output'
              : 'Shown in editor and rendered output'}
          </div>
        </div>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={hidden}
          onChange={onToggle}
          className="sr-only peer"
          aria-label={hidden ? 'Show block' : 'Hide block'}
        />
        <div
          className={clsx(
            "w-11 h-6 rounded-full peer transition-colors peer-focus:ring-2 peer-focus:ring-offset-1 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-transform peer-checked:after:translate-x-full",
            {
              'bg-gray-300 peer-checked:bg-blue-500 peer-focus:ring-blue-500/20': !daisyui,
              'bg-base-300 peer-checked:bg-info peer-focus:ring-info/20': daisyui,
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
  textColors,
  paddingOptions,
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
            value={props.color}
            valueClassName={props.colorClassName}
            onChange={(color, meta) =>
              onUpdate({
                color: meta?.hex ?? color,
                colorClassName: meta?.className,
              })
            }
            colors={textColors ?? colors}
            daisyui={daisyui}
            disabled={disabled || block.locked}
          />
          <input
            type="text"
            value={props.color ?? ''}
            onChange={(e) =>
              onUpdate({
                color: e.target.value || undefined,
                colorClassName: undefined,
              })
            }
            className={inlineTextInputCls}
            placeholder="#1f2937"
            disabled={disabled || block.locked}
          />
        </div>
      </div>

      <div>
        <label className={labelCls}>Color Class</label>
        <input
          type="text"
          value={props.colorClassName ?? ''}
          onChange={(e) => onUpdate({ colorClassName: e.target.value || undefined })}
          className={fieldCls}
          placeholder="e.g. text-primary"
          disabled={disabled || block.locked}
        />
        <span className={helpCls}>Tailwind or CSS class applied for text color.</span>
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

      <div>
        <label className={labelCls}>Margin</label>
        <input
          type="text"
          value={props.margin || '0 0 16px'}
          onChange={(e) => onUpdate({ margin: e.target.value })}
          placeholder="0 0 16px"
          className={fieldCls}
        />
        <span className={helpCls}>CSS margin (e.g., 16px or 16px 0)</span>
      </div>

      <div>
        <label className={labelCls}>Padding</label>
        <PaddingButtonGroup
          value={props.padding}
          options={paddingOptions}
          onChange={(next) => onUpdate({ padding: next })}
          disabled={disabled || block.locked}
          daisyui={daisyui}
          allowClear
        />
        <span className={helpCls}>Choose a preset padding or clear to inherit defaults.</span>
      </div>

      <div>
        <label className={labelCls}>Class Name</label>
        <input
          type="text"
          value={props.className ?? ''}
          onChange={(e) => onUpdate({ className: e.target.value || undefined })}
          placeholder="Custom classes"
          className={fieldCls}
          disabled={disabled || block.locked}
        />
        <span className={helpCls}>Additional classes applied to the heading element.</span>
      </div>
    </fieldset>
  );
}

function TextPropsForm({
  block,
  onUpdate,
  daisyui,
  colors,
  textColors,
  paddingOptions,
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
            value={props.color}
            valueClassName={props.colorClassName}
            onChange={(color, meta) =>
              onUpdate({
                color: meta?.hex ?? color,
                colorClassName: meta?.className,
              })
            }
            colors={textColors ?? colors}
            daisyui={daisyui}
            disabled={disabled || block.locked}
          />
          <input
            type="text"
            value={props.color ?? ''}
            onChange={(e) =>
              onUpdate({
                color: e.target.value || undefined,
                colorClassName: undefined,
              })
            }
            className={inlineTextInputCls}
            placeholder="#1f2937"
            disabled={disabled || block.locked}
          />
        </div>
      </div>

      <div>
        <label className={labelCls}>Color Class</label>
        <input
          type="text"
          value={props.colorClassName ?? ''}
          onChange={(e) => onUpdate({ colorClassName: e.target.value || undefined })}
          className={fieldCls}
          placeholder="e.g. text-primary"
          disabled={disabled || block.locked}
        />
        <span className={helpCls}>Tailwind or CSS class applied to text color.</span>
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

      <div>
        <label className={labelCls}>Margin</label>
        <input
          type="text"
          value={props.margin || '0 0 16px'}
          onChange={(e) => onUpdate({ margin: e.target.value })}
          placeholder="0 0 16px"
          className={fieldCls}
        />
        <span className={helpCls}>CSS margin (e.g., 16px or 16px 0)</span>
      </div>

      <div>
        <label className={labelCls}>Padding</label>
        <PaddingButtonGroup
          value={props.padding}
          options={paddingOptions}
          onChange={(next) => onUpdate({ padding: next })}
          disabled={disabled || block.locked}
          daisyui={daisyui}
          allowClear
        />
        <span className={helpCls}>Choose a preset padding or clear to inherit defaults.</span>
      </div>

      <div>
        <label className={labelCls}>Class Name</label>
        <input
          type="text"
          value={props.className ?? ''}
          onChange={(e) => onUpdate({ className: e.target.value || undefined })}
          placeholder="Custom classes"
          className={fieldCls}
          disabled={disabled || block.locked}
        />
        <span className={helpCls}>Additional classes applied to the text element.</span>
      </div>
    </fieldset>
  );
}

function ButtonPropsForm({
  block,
  onUpdate,
  daisyui,
  colors,
  textColors,
  paddingOptions,
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
            value={props.backgroundColor}
            valueClassName={props.backgroundClassName}
            onChange={(color, meta) =>
              onUpdate({
                backgroundColor: meta?.hex ?? color,
                backgroundClassName: meta?.className,
              })
            }
            colors={colors}
            daisyui={daisyui}
            disabled={disabled || block.locked}
          />
          <input
            type="text"
            value={props.backgroundColor ?? ''}
            onChange={(e) =>
              onUpdate({
                backgroundColor: e.target.value || undefined,
                backgroundClassName: undefined,
              })
            }
            className={inlineTextInputCls}
            placeholder="#2563eb"
            disabled={disabled || block.locked}
          />
        </div>
      </div>

      <div>
        <label className={labelCls}>Background Class</label>
        <input
          type="text"
          value={props.backgroundClassName ?? ''}
          onChange={(e) => onUpdate({ backgroundClassName: e.target.value || undefined })}
          className={fieldCls}
          placeholder="e.g. bg-primary"
          disabled={disabled || block.locked}
        />
        <span className={helpCls}>Tailwind or CSS class applied for background color.</span>
      </div>

      <div>
        <label className={labelCls}>Text Color</label>
        <div className="flex items-center gap-3">
          <ColorPicker
            value={props.color}
            valueClassName={props.colorClassName}
            onChange={(color, meta) =>
              onUpdate({
                color: meta?.hex ?? color,
                colorClassName: meta?.className,
              })
            }
            colors={textColors ?? colors}
            daisyui={daisyui}
            disabled={disabled || block.locked}
          />
          <input
            type="text"
            value={props.color ?? ''}
            onChange={(e) =>
              onUpdate({
                color: e.target.value || undefined,
                colorClassName: undefined,
              })
            }
            className={inlineTextInputCls}
            placeholder="#ffffff"
            disabled={disabled || block.locked}
          />
        </div>
      </div>

      <div>
        <label className={labelCls}>Text Color Class</label>
        <input
          type="text"
          value={props.colorClassName ?? ''}
          onChange={(e) => onUpdate({ colorClassName: e.target.value || undefined })}
          className={fieldCls}
          placeholder="e.g. text-primary-content"
          disabled={disabled || block.locked}
        />
        <span className={helpCls}>Tailwind or CSS class applied to button text.</span>
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

      <div>
        <label className={labelCls}>Padding</label>
        <PaddingButtonGroup
          value={props.padding}
          options={paddingOptions}
          onChange={(next) => onUpdate({ padding: next })}
          disabled={disabled || block.locked}
          daisyui={daisyui}
          allowClear
        />
        <span className={helpCls}>Choose a preset padding or clear to inherit defaults.</span>
      </div>

      <div>
        <label className={labelCls}>Font Size</label>
        <input
          type="number"
          value={props.fontSize || 14}
          onChange={(e) => onUpdate({ fontSize: Number(e.target.value) })}
          className={fieldCls}
          min="8"
          max="72"
        />
        <span className={helpCls}>Pixels (8-72)</span>
      </div>

      <div>
        <label className={labelCls}>Font Weight</label>
        <select
          value={props.fontWeight || 'bold'}
          onChange={(e) => onUpdate({ fontWeight: e.target.value as 'normal' | 'medium' | 'bold' })}
          className={selectCls}
        >
          <option value="normal">Normal</option>
          <option value="medium">Medium</option>
          <option value="bold">Bold</option>
        </select>
      </div>

      <div>
        <label className={labelCls}>Margin</label>
        <input
          type="text"
          value={props.margin || '12px 0'}
          onChange={(e) => onUpdate({ margin: e.target.value })}
          placeholder="12px 0"
          className={fieldCls}
        />
        <span className={helpCls}>CSS margin (e.g., 12px 0)</span>
      </div>

      <div>
        <label className={labelCls}>Class Name</label>
        <input
          type="text"
          value={props.className ?? ''}
          onChange={(e) => onUpdate({ className: e.target.value || undefined })}
          placeholder="Custom button classes"
          className={fieldCls}
          disabled={disabled || block.locked}
        />
        <span className={helpCls}>Additional classes applied to the button element.</span>
      </div>
    </fieldset>
  );
}

function ImagePropsForm({
  block,
  onUpdate,
  daisyui,
  paddingOptions,
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
            value={props.width ?? 600}
            onChange={(e) => onUpdate({ width: Number(e.target.value) })}
            className={fieldCls}
            min="0"
          />
          <span className={helpCls}>Pixels (0 for auto)</span>
        </div>

        <div>
          <label className={labelCls}>Height</label>
          <input
            type="number"
            value={props.height ?? 200}
            onChange={(e) => onUpdate({ height: Number(e.target.value) })}
            className={fieldCls}
            min="0"
          />
          <span className={helpCls}>Pixels (0 for auto)</span>
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

      <div>
        <label className={labelCls}>Margin</label>
        <input
          type="text"
          value={props.margin || '12px 0'}
          onChange={(e) => onUpdate({ margin: e.target.value })}
          placeholder="12px 0"
          className={fieldCls}
        />
        <span className={helpCls}>CSS margin (e.g., 12px 0)</span>
      </div>

      <div>
        <label className={labelCls}>Padding</label>
        <PaddingButtonGroup
          value={props.padding}
          options={paddingOptions}
          onChange={(next) => onUpdate({ padding: next })}
          disabled={disabled || block.locked}
          daisyui={daisyui}
          allowClear
        />
        <span className={helpCls}>Choose a preset padding or clear to inherit defaults.</span>
      </div>

      <div>
        <label className={labelCls}>Class Name</label>
        <input
          type="text"
          value={props.className ?? ''}
          onChange={(e) => onUpdate({ className: e.target.value || undefined })}
          placeholder="Custom image classes"
          className={fieldCls}
        />
        <span className={helpCls}>Additional classes applied to the image element.</span>
      </div>
    </fieldset>
  );
}

export function PropertiesPanel({
  className = '',
  daisyui = false,
  unlockable = true,
  colors,
  textColors,
  bgColors,
  customBlockRegistry,
  paddingOptions,
}: PropertiesPanelProps) {
  const {
    document,
    setDocument,
    selectedBlockId,
    selectedBlock,
    selectedContainer,
    selectBlock,
    selectContainer,
    updateBlockProps,
    updateContainerProps,
  } = useCanvasStore();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const resolvedPaddingOptions = useMemo(() => {
    if (paddingOptions && paddingOptions.length > 0) {
      return paddingOptions.map((entry) => ({ ...entry }));
    }
    return getDefaultPaddingOptionEntries();
  }, [paddingOptions]);

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
    selectContainer(null);
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

  const handleToggleHidden = useCallback(() => {
    if (!selectedBlockId || !selectedBlock) return;
    updateBlockProps(selectedBlockId, { hidden: !selectedBlock.hidden });
  }, [selectedBlockId, selectedBlock, updateBlockProps]);

  const handleDeleteConfirm = useCallback(() => {
    if (!selectedBlockId) return;
    const nextSections = removeBlock(document.sections, selectedBlockId);
    setDocument({ ...document, sections: nextSections });
    setDeleteOpen(false);
    selectBlock(null);
  }, [document, selectedBlockId, selectBlock, setDocument]);

  if (!selectedBlock && !selectedContainer) {
    return null;
  }

  const renderPropsForm = () => {
    if (!selectedBlock) return null;
    switch (selectedBlock.type) {
      case 'text':
        return (
          <TextPropsForm
            block={selectedBlock as CanvasContentBlock & { type: 'text' }}
            onUpdate={(props) => handleUpdate(selectedBlock.id, props)}
            daisyui={daisyui}
            colors={colors}
            textColors={textColors}
            paddingOptions={resolvedPaddingOptions}
            disabled={isLocked}
          />
        );
      case 'button':
        return (
          <ButtonPropsForm
            block={selectedBlock as CanvasContentBlock & { type: 'button' }}
            onUpdate={(props) => handleUpdate(selectedBlock.id, props)}
            daisyui={daisyui}
            colors={bgColors ?? colors}
            textColors={textColors}
            paddingOptions={resolvedPaddingOptions}
            disabled={isLocked}
          />
        );
      case 'image':
        return (
          <ImagePropsForm
            block={selectedBlock as CanvasContentBlock & { type: 'image' }}
            onUpdate={(props) => handleUpdate(selectedBlock.id, props)}
            daisyui={daisyui}
            paddingOptions={resolvedPaddingOptions}
            disabled={isLocked}
          />
        );
      case 'heading':
        return (
          <HeadingPropsForm
            block={selectedBlock as CanvasContentBlock & { type: 'heading' }}
            onUpdate={(props) => handleUpdate(selectedBlock.id, props)}
            daisyui={daisyui}
            colors={bgColors ?? colors}
            textColors={textColors}
            paddingOptions={resolvedPaddingOptions}
            disabled={isLocked}
          />
        );
      case 'custom': {
        const customBlock = selectedBlock as CanvasContentBlock & { type: 'custom' };
        const customProps = customBlock.props as CustomBlockProps;
        const componentName = customProps.componentName;
        const blockDefinition = customBlockRegistry?.[componentName];
        const Editor = blockDefinition?.propEditor;

        if (!Editor) {
          return (
            <div
              className={clsx('text-sm text-center p-8 italic', {
                'text-gray-500': !daisyui,
                'text-base-content/60': daisyui,
              })}
            >
              {blockDefinition
                ? `No property editor defined for ${componentName}. The block is read-only.`
                : `Add a custom block definition for ${componentName} to edit its props.`}
            </div>
          );
        }

        const value = (customProps.props ?? {}) as Record<string, unknown>;

        const handlePartialUpdate = (patch: Partial<Record<string, unknown>>) => {
          if (isLocked) return;
          updateBlockProps(customBlock.id, {
            componentName,
            props: { ...value, ...patch },
          });
        };

        const handleReplace = (nextValue: Record<string, unknown>) => {
          if (isLocked) return;
          updateBlockProps(customBlock.id, {
            componentName,
            props: nextValue,
          });
        };

        return (
          <Editor
            block={customBlock}
            value={value}
            onChange={handlePartialUpdate}
            onReplace={handleReplace}
            daisyui={daisyui}
            colors={colors}
            textColors={textColors}
            bgColors={bgColors}
            disabled={isLocked}
            paddingOptions={resolvedPaddingOptions}
          />
        );
      }
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

  const getContainerTypeName = (kind: 'section' | 'row' | 'column') => {
    switch (kind) {
      case 'section':
        return 'Section';
      case 'row':
        return 'Row';
      case 'column':
        return 'Column';
      default:
        return 'Container';
    }
  };

  const renderContainerForm = () => {
    if (!selectedContainer) return null;
    const findRow = (id: string) => {
      for (const section of document.sections) {
        const row = section.rows.find((r) => r.id === id);
        if (row) return { row, section };
      }
      return null;
    };
    const findColumn = (id: string) => {
      for (const section of document.sections) {
        for (const row of section.rows) {
          const column = row.columns.find((c) => c.id === id);
          if (column) return { column, row, section };
        }
      }
      return null;
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

    if (selectedContainer.kind === 'section') {
      const section = document.sections.find((s) => s.id === selectedContainer.id);
      if (!section) return null;
      const locked = !!section.locked;
      const hidden = !!section.hidden;
      return (
        <fieldset className="space-y-6" disabled={locked}>
          {unlockable && (
            <LockedToggle
              locked={locked}
              daisyui={daisyui}
              onToggle={() =>
                updateContainerProps({
                  kind: 'section',
                  id: section.id,
                  props: { locked: !locked },
                })
              }
            />
          )}
          <HiddenToggle
            hidden={hidden}
            daisyui={daisyui}
            onToggle={() =>
              updateContainerProps({
                kind: 'section',
                id: section.id,
                props: { hidden: !hidden },
              })
            }
          />
          <div>
            <label className={labelCls}>Background</label>
            <div className="flex items-center gap-3">
              <ColorPicker
                value={section.backgroundColor}
                valueClassName={section.backgroundClassName}
                onChange={(color, meta) => {
                  const nextBackgroundColor =
                    meta?.className != null ? undefined : (meta?.hex ?? color ?? undefined);
                  updateContainerProps({
                    kind: 'section',
                    id: section.id,
                    props: {
                      backgroundColor: nextBackgroundColor,
                      backgroundClassName: meta?.className,
                    },
                  });
                }}
                colors={bgColors ?? colors}
                daisyui={daisyui}
                disabled={locked}
              />
              <input
                type="text"
                value={section.backgroundColor ?? ''}
                onChange={(e) =>
                  updateContainerProps({
                    kind: 'section',
                    id: section.id,
                    props: {
                      backgroundColor: e.target.value || undefined,
                      backgroundClassName: undefined,
                    },
                  })
                }
                className={fieldCls}
                placeholder="#ffffff or transparent"
              />
            </div>
          </div>
          <div>
            <label className={labelCls}>Alignment</label>
            <select
              value={section.align ?? 'left'}
              onChange={(e) =>
                updateContainerProps({
                  kind: 'section',
                  id: section.id,
                  props: { align: e.target.value as 'left' | 'center' | 'right' | 'justify' },
                })
              }
              className={selectCls}
              disabled={locked}
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
              <option value="justify">Justify</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Padding</label>
            <PaddingButtonGroup
              value={section.padding}
              options={resolvedPaddingOptions}
              onChange={(next) =>
                updateContainerProps({
                  kind: 'section',
                  id: section.id,
                  props: { padding: next },
                })
              }
              disabled={locked}
              daisyui={daisyui}
              allowClear
            />
            <span className={helpCls}>Choose a preset padding or clear to inherit defaults.</span>
          </div>
          <div>
            <label className={labelCls}>Margin</label>
            <PaddingButtonGroup
              value={section.margin}
              options={resolvedPaddingOptions}
              onChange={(next) =>
                updateContainerProps({
                  kind: 'section',
                  id: section.id,
                  props: { margin: next },
                })
              }
              disabled={locked}
              daisyui={daisyui}
              allowClear
            />
            <span className={helpCls}>
              Space around the section. Use presets or expand Advanced for custom values.
            </span>
          </div>

          {/* Advanced Section */}
          <div className="pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={clsx('text-sm font-medium mb-3 flex items-center gap-2', {
                'text-gray-700 hover:text-gray-900': !daisyui,
                'text-base-content/80 hover:text-base-content': daisyui,
              })}
            >
              <CaretDownIcon
                size={16}
                className={clsx('transition-transform', { 'rotate-180': showAdvanced })}
              />
              Advanced Settings
            </button>
            {showAdvanced && (
              <div className="space-y-4 pl-6">
                <div>
                  <label className={labelCls}>Custom Margin</label>
                  <input
                    type="text"
                    value={formatPaddingForInput(section.margin)}
                    onChange={(e) =>
                      updateContainerProps({
                        kind: 'section',
                        id: section.id,
                        props: { margin: parsePaddingInput(e.target.value) },
                      })
                    }
                    className={fieldCls}
                    placeholder="e.g. 0 or 0 auto"
                    disabled={locked}
                  />
                  <span className={helpCls}>CSS margin value or Tailwind token.</span>
                </div>
                <div>
                  <label className={labelCls}>Background Class</label>
                  <input
                    type="text"
                    value={section.backgroundClassName ?? ''}
                    onChange={(e) =>
                      updateContainerProps({
                        kind: 'section',
                        id: section.id,
                        props: {
                          backgroundClassName: e.target.value || undefined,
                        },
                      })
                    }
                    className={fieldCls}
                    placeholder="e.g. bg-base-200"
                  />
                  <span className={helpCls}>
                    Tailwind background class (overrides color picker).
                  </span>
                </div>
                <div>
                  <label className={labelCls}>Class Name</label>
                  <input
                    type="text"
                    value={section.className ?? ''}
                    onChange={(e) =>
                      updateContainerProps({
                        kind: 'section',
                        id: section.id,
                        props: { className: e.target.value },
                      })
                    }
                    className={fieldCls}
                    placeholder="Custom Tailwind classes"
                  />
                  <span className={helpCls}>Additional CSS classes for advanced styling.</span>
                </div>
              </div>
            )}
          </div>
        </fieldset>
      );
    }

    if (selectedContainer.kind === 'row') {
      const match = findRow(selectedContainer.id);
      if (!match) return null;
      const { row, section } = match;
      const locked = !!(row.locked || section.locked);
      const hidden = !!row.hidden;
      const hasMultipleColumns = row.columns.length > 1;
      return (
        <fieldset className="space-y-6" disabled={locked}>
          {unlockable && (
            <LockedToggle
              locked={!!row.locked}
              daisyui={daisyui}
              onToggle={() =>
                updateContainerProps({ kind: 'row', id: row.id, props: { locked: !row.locked } })
              }
            />
          )}
          <HiddenToggle
            hidden={hidden}
            daisyui={daisyui}
            onToggle={() =>
              updateContainerProps({ kind: 'row', id: row.id, props: { hidden: !hidden } })
            }
          />
          <div>
            <label className={labelCls}>Background</label>
            <div className="flex items-center gap-3">
              <ColorPicker
                value={row.backgroundColor}
                valueClassName={row.backgroundClassName}
                onChange={(color, meta) => {
                  const nextBackgroundColor =
                    meta?.className != null ? undefined : (meta?.hex ?? color ?? undefined);
                  updateContainerProps({
                    kind: 'row',
                    id: row.id,
                    props: {
                      backgroundColor: nextBackgroundColor,
                      backgroundClassName: meta?.className,
                    },
                  });
                }}
                colors={bgColors ?? colors}
                daisyui={daisyui}
                disabled={locked}
              />
              <input
                type="text"
                value={row.backgroundColor ?? ''}
                onChange={(e) =>
                  updateContainerProps({
                    kind: 'row',
                    id: row.id,
                    props: {
                      backgroundColor: e.target.value || undefined,
                      backgroundClassName: undefined,
                    },
                  })
                }
                className={fieldCls}
                placeholder="#f8fafc"
              />
            </div>
          </div>
          <div>
            <label className={labelCls}>Alignment</label>
            <select
              value={row.align ?? 'left'}
              onChange={(e) =>
                updateContainerProps({
                  kind: 'row',
                  id: row.id,
                  props: { align: e.target.value as 'left' | 'center' | 'right' | 'justify' },
                })
              }
              className={selectCls}
              disabled={locked}
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
              <option value="justify">Justify</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Padding</label>
            <PaddingButtonGroup
              value={row.padding}
              options={resolvedPaddingOptions}
              onChange={(next) =>
                updateContainerProps({
                  kind: 'row',
                  id: row.id,
                  props: { padding: next },
                })
              }
              disabled={locked}
              daisyui={daisyui}
              allowClear
            />
            <span className={helpCls}>Choose a preset padding or clear to inherit defaults.</span>
          </div>
          <div>
            <label className={labelCls}>Margin</label>
            <PaddingButtonGroup
              value={row.margin}
              options={resolvedPaddingOptions}
              onChange={(next) =>
                updateContainerProps({
                  kind: 'row',
                  id: row.id,
                  props: { margin: next },
                })
              }
              disabled={locked}
              daisyui={daisyui}
              allowClear
            />
            <span className={helpCls}>
              Space around the row. Use presets or expand Advanced for custom values.
            </span>
          </div>

          {hasMultipleColumns && (
            <div>
              <label className={labelCls}>Column Gap (px)</label>
              <input
                type="number"
                value={row.gutter ?? 16}
                onChange={(e) =>
                  updateContainerProps({
                    kind: 'row',
                    id: row.id,
                    props: { gutter: Number(e.target.value) },
                  })
                }
                className={fieldCls}
                min="0"
              />
              <span className={helpCls}>Space between columns in this row.</span>
            </div>
          )}

          {/* Advanced Section */}
          <div className="pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={clsx('text-sm font-medium mb-3 flex items-center gap-2', {
                'text-gray-700 hover:text-gray-900': !daisyui,
                'text-base-content/80 hover:text-base-content': daisyui,
              })}
            >
              <CaretDownIcon
                size={16}
                className={clsx('transition-transform', { 'rotate-180': showAdvanced })}
              />
              Advanced Settings
            </button>
            {showAdvanced && (
              <div className="space-y-4 pl-6">
                <div>
                  <label className={labelCls}>Custom Margin</label>
                  <input
                    type="text"
                    value={formatPaddingForInput(row.margin)}
                    onChange={(e) =>
                      updateContainerProps({
                        kind: 'row',
                        id: row.id,
                        props: { margin: parsePaddingInput(e.target.value) },
                      })
                    }
                    className={fieldCls}
                    placeholder="e.g. 0"
                    disabled={locked}
                  />
                  <span className={helpCls}>CSS margin value or Tailwind token.</span>
                </div>
                <div>
                  <label className={labelCls}>Background Class</label>
                  <input
                    type="text"
                    value={row.backgroundClassName ?? ''}
                    onChange={(e) =>
                      updateContainerProps({
                        kind: 'row',
                        id: row.id,
                        props: {
                          backgroundClassName: e.target.value || undefined,
                        },
                      })
                    }
                    className={fieldCls}
                    placeholder="e.g. bg-muted"
                  />
                  <span className={helpCls}>
                    Tailwind background class (overrides color picker).
                  </span>
                </div>
                <div>
                  <label className={labelCls}>Class Name</label>
                  <input
                    type="text"
                    value={row.className ?? ''}
                    onChange={(e) =>
                      updateContainerProps({
                        kind: 'row',
                        id: row.id,
                        props: { className: e.target.value },
                      })
                    }
                    className={fieldCls}
                    placeholder="Custom Tailwind classes"
                  />
                  <span className={helpCls}>Additional CSS classes for advanced styling.</span>
                </div>
              </div>
            )}
          </div>
        </fieldset>
      );
    }

    if (selectedContainer.kind === 'column') {
      const match = findColumn(selectedContainer.id);
      if (!match) return null;
      const { column, row, section } = match;
      const locked = !!(column.locked || row.locked || section.locked);
      const hidden = !!column.hidden;
      const hasMultipleColumns = row.columns.length > 1;
      return (
        <fieldset className="space-y-6" disabled={locked}>
          {unlockable && (
            <LockedToggle
              locked={!!column.locked}
              daisyui={daisyui}
              onToggle={() =>
                updateContainerProps({
                  kind: 'column',
                  id: column.id,
                  props: { locked: !column.locked },
                })
              }
            />
          )}
          <HiddenToggle
            hidden={hidden}
            daisyui={daisyui}
            onToggle={() =>
              updateContainerProps({
                kind: 'column',
                id: column.id,
                props: { hidden: !hidden },
              })
            }
          />
          <div>
            <label className={labelCls}>Background</label>
            <div className="flex items-center gap-3">
              <ColorPicker
                value={column.backgroundColor}
                valueClassName={column.backgroundClassName}
                onChange={(color, meta) => {
                  const nextBackgroundColor =
                    meta?.className != null ? undefined : (meta?.hex ?? color ?? undefined);
                  updateContainerProps({
                    kind: 'column',
                    id: column.id,
                    props: {
                      backgroundColor: nextBackgroundColor,
                      backgroundClassName: meta?.className,
                    },
                  });
                }}
                colors={bgColors ?? colors}
                daisyui={daisyui}
                disabled={locked}
              />
              <input
                type="text"
                value={column.backgroundColor ?? ''}
                onChange={(e) =>
                  updateContainerProps({
                    kind: 'column',
                    id: column.id,
                    props: {
                      backgroundColor: e.target.value || undefined,
                      backgroundClassName: undefined,
                    },
                  })
                }
                className={fieldCls}
                placeholder="#ffffff"
              />
            </div>
          </div>
          <div>
            <label className={labelCls}>Alignment</label>
            <select
              value={column.align ?? 'left'}
              onChange={(e) =>
                updateContainerProps({
                  kind: 'column',
                  id: column.id,
                  props: { align: e.target.value as 'left' | 'center' | 'right' | 'justify' },
                })
              }
              className={selectCls}
              disabled={locked}
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
              <option value="justify">Justify</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Padding</label>
            <PaddingButtonGroup
              value={column.padding}
              options={resolvedPaddingOptions}
              onChange={(next) =>
                updateContainerProps({
                  kind: 'column',
                  id: column.id,
                  props: { padding: next },
                })
              }
              disabled={locked}
              daisyui={daisyui}
              allowClear
            />
            <span className={helpCls}>Choose a preset padding or clear to inherit defaults.</span>
          </div>
          <div>
            <label className={labelCls}>Margin</label>
            <PaddingButtonGroup
              value={column.margin}
              options={resolvedPaddingOptions}
              onChange={(next) =>
                updateContainerProps({
                  kind: 'column',
                  id: column.id,
                  props: { margin: next },
                })
              }
              disabled={locked}
              daisyui={daisyui}
              allowClear
            />
            <span className={helpCls}>
              Space around the column. Use presets or expand Advanced for custom values.
            </span>
          </div>

          {hasMultipleColumns && (
            <div>
              <label className={labelCls}>Width (flex basis)</label>
              <input
                type="number"
                value={column.width ?? 1}
                onChange={(e) =>
                  updateContainerProps({
                    kind: 'column',
                    id: column.id,
                    props: { width: Number(e.target.value) },
                  })
                }
                className={fieldCls}
                min="0"
              />
              <span className={helpCls}>
                Relative width compared to other columns. Equal values = equal widths.
              </span>
            </div>
          )}

          {/* Advanced Section */}
          <div className="pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={clsx('text-sm font-medium mb-3 flex items-center gap-2', {
                'text-gray-700 hover:text-gray-900': !daisyui,
                'text-base-content/80 hover:text-base-content': daisyui,
              })}
            >
              <CaretDownIcon
                size={16}
                className={clsx('transition-transform', { 'rotate-180': showAdvanced })}
              />
              Advanced Settings
            </button>
            {showAdvanced && (
              <div className="space-y-4 pl-6">
                <div>
                  <label className={labelCls}>Custom Margin</label>
                  <input
                    type="text"
                    value={formatPaddingForInput(column.margin)}
                    onChange={(e) =>
                      updateContainerProps({
                        kind: 'column',
                        id: column.id,
                        props: { margin: parsePaddingInput(e.target.value) },
                      })
                    }
                    className={fieldCls}
                    placeholder="e.g. 0"
                    disabled={locked}
                  />
                  <span className={helpCls}>CSS margin value or Tailwind token.</span>
                </div>
                <div>
                  <label className={labelCls}>Background Class</label>
                  <input
                    type="text"
                    value={column.backgroundClassName ?? ''}
                    onChange={(e) =>
                      updateContainerProps({
                        kind: 'column',
                        id: column.id,
                        props: {
                          backgroundClassName: e.target.value || undefined,
                        },
                      })
                    }
                    className={fieldCls}
                    placeholder="e.g. bg-primary"
                  />
                  <span className={helpCls}>
                    Tailwind background class (overrides color picker).
                  </span>
                </div>
                <div>
                  <label className={labelCls}>Class Name</label>
                  <input
                    type="text"
                    value={column.className ?? ''}
                    onChange={(e) =>
                      updateContainerProps({
                        kind: 'column',
                        id: column.id,
                        props: { className: e.target.value },
                      })
                    }
                    className={fieldCls}
                    placeholder="Custom Tailwind classes"
                  />
                  <span className={helpCls}>Additional CSS classes for advanced styling.</span>
                </div>
              </div>
            )}
          </div>
        </fieldset>
      );
    }

    return null;
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
              {selectedBlock
                ? `${getBlockTypeName(selectedBlock.type)} Properties`
                : selectedContainer
                  ? `${getContainerTypeName(selectedContainer.kind)} Settings`
                  : 'Properties'}
            </h3>
            <p
              className={clsx('text-sm mt-1', {
                'text-gray-500': !daisyui,
                'text-base-content/60': daisyui,
              })}
            >
              {selectedBlock
                ? `Customize your ${selectedBlock.type} block`
                : selectedContainer
                  ? `Customize this ${getContainerTypeName(selectedContainer.kind).toLowerCase()}`
                  : ''}
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
          {selectedBlock ? (
            <>
              {unlockable && (
                <LockedToggle
                  locked={!!selectedBlock.locked}
                  onToggle={handleToggleLocked}
                  daisyui={daisyui}
                />
              )}
              <HiddenToggle
                hidden={!!selectedBlock.hidden}
                onToggle={handleToggleHidden}
                daisyui={daisyui}
              />
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
            </>
          ) : (
            renderContainerForm()
          )}
        </div>
        {selectedBlock &&
        ['text', 'button', 'image', 'heading', 'divider'].includes(
          (selectedBlock as CanvasContentBlock).type,
        ) &&
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
          description={
            selectedBlock
              ? `This will remove the ${getBlockTypeName((selectedBlock as CanvasContentBlock).type)} block.`
              : 'This will remove the selected element.'
          }
          confirmLabel="Delete"
          onCancel={() => setDeleteOpen(false)}
          onConfirm={handleDeleteConfirm}
        />
      </div>
    </div>
  );
}
