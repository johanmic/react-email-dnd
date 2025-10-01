// packages/editor/src/components/PropertiesPanel.tsx
import React, { useCallback, useState } from 'react';
import clsx from 'clsx';
import { X, Trash } from '@phosphor-icons/react';
import { useCanvasStore } from '../hooks/useCanvasStore';
import { ConfirmModal } from './ConfirmModal';
import { removeBlock } from '../utils/drag-drop';
import type {
  ButtonBlockProps,
  TextBlockProps,
  ImageBlockProps,
  HeadingBlockProps,
  CanvasContentBlock,
} from '../types/schema';

interface PropertiesPanelProps {
  className?: string;
  daisyui?: boolean;
}

interface TextPropsFormProps {
  block: CanvasContentBlock & { type: 'text' };
  onUpdate: (props: Partial<TextBlockProps>) => void;
  daisyui?: boolean;
}

interface HeadingPropsFormProps {
  block: CanvasContentBlock & { type: 'heading' };
  onUpdate: (props: Partial<HeadingBlockProps>) => void;
  daisyui?: boolean;
}

interface ButtonPropsFormProps {
  block: CanvasContentBlock & { type: 'button' };
  onUpdate: (props: Partial<ButtonBlockProps>) => void;
  daisyui?: boolean;
}

interface ImagePropsFormProps {
  block: CanvasContentBlock & { type: 'image' };
  onUpdate: (props: Partial<ImageBlockProps>) => void;
  daisyui?: boolean;
}

function HeadingPropsForm({ block, onUpdate, daisyui }: HeadingPropsFormProps) {
  const props = block.props as HeadingBlockProps;

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
    <div className="space-y-6">
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
        <label className={labelCls}>Text Content</label>
        <textarea
          value={props.content || ''}
          onChange={(e) => onUpdate({ content: e.target.value })}
          className={clsx(fieldCls, 'resize-y min-h-16')}
          rows={3}
          placeholder="Enter your text content..."
        />
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
          <input
            type="color"
            value={props.color || '#1f2937'}
            onChange={(e) => onUpdate({ color: e.target.value })}
            className={colorBoxCls}
          />
          <input
            type="text"
            value={props.color || '#1f2937'}
            onChange={(e) => onUpdate({ color: e.target.value })}
            className={inlineTextInputCls}
            placeholder="#1f2937"
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
    </div>
  );
}

function TextPropsForm({ block, onUpdate, daisyui }: TextPropsFormProps) {
  const props = block.props as TextBlockProps;

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
    <div className="space-y-6">
      <div>
        <label className={labelCls}>Text Content</label>
        <textarea
          value={props.content || ''}
          onChange={(e) => onUpdate({ content: e.target.value })}
          className={clsx(fieldCls, 'resize-y min-h-16')}
          rows={3}
          placeholder="Enter your text content..."
        />
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
          <input
            type="color"
            value={props.color || '#1f2937'}
            onChange={(e) => onUpdate({ color: e.target.value })}
            className={colorBoxCls}
          />
          <input
            type="text"
            value={props.color || '#1f2937'}
            onChange={(e) => onUpdate({ color: e.target.value })}
            className={inlineTextInputCls}
            placeholder="#1f2937"
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
    </div>
  );
}

function ButtonPropsForm({ block, onUpdate, daisyui }: ButtonPropsFormProps) {
  const props = block.props as ButtonBlockProps;

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
    <div className="space-y-6">
      <div>
        <label className={labelCls}>Button Text</label>
        <input
          type="text"
          value={props.label || ''}
          onChange={(e) => onUpdate({ label: e.target.value })}
          className={fieldCls}
          placeholder="Enter button text..."
        />
      </div>

      <div>
        <label className={labelCls}>URL</label>
        <input
          type="url"
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
          <input
            type="color"
            value={props.backgroundColor || '#2563eb'}
            onChange={(e) => onUpdate({ backgroundColor: e.target.value })}
            className={colorBoxCls}
          />
          <input
            type="text"
            value={props.backgroundColor || '#2563eb'}
            onChange={(e) => onUpdate({ backgroundColor: e.target.value })}
            className={inlineTextInputCls}
            placeholder="#2563eb"
          />
        </div>
      </div>

      <div>
        <label className={labelCls}>Text Color</label>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={props.color || '#ffffff'}
            onChange={(e) => onUpdate({ color: e.target.value })}
            className={colorBoxCls}
          />
          <input
            type="text"
            value={props.color || '#ffffff'}
            onChange={(e) => onUpdate({ color: e.target.value })}
            className={inlineTextInputCls}
            placeholder="#ffffff"
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
    </div>
  );
}

function ImagePropsForm({ block, onUpdate, daisyui }: ImagePropsFormProps) {
  const props = block.props as ImageBlockProps;

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

  return (
    <div className="space-y-6">
      <div>
        <label className={labelCls}>Image URL</label>
        <input
          type="url"
          value={props.src || ''}
          onChange={(e) => onUpdate({ src: e.target.value })}
          placeholder="https://example.com/image.jpg"
          className={fieldCls}
        />
        <span className={helpCls}>Direct link to your image</span>
      </div>

      <div>
        <label className={labelCls}>Alt Text</label>
        <input
          type="text"
          value={props.alt || ''}
          onChange={(e) => onUpdate({ alt: e.target.value })}
          placeholder="Image description"
          className={fieldCls}
        />
        <span className={helpCls}>Accessible description for screen readers</span>
      </div>

      <div>
        <label className={labelCls}>Link URL (Optional)</label>
        <input
          type="url"
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
    </div>
  );
}

export function PropertiesPanel({ className = '', daisyui = false }: PropertiesPanelProps) {
  const { document, setDocument, selectedBlockId, selectedBlock, selectBlock, updateBlockProps } =
    useCanvasStore();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const handleClose = () => {
    selectBlock(null);
  };

  const handleUpdate = useCallback(
    (blockId: string, props: Record<string, unknown>) => {
      updateBlockProps(blockId, props);
    },
    [updateBlockProps],
  );

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
          />
        );
      case 'button':
        return (
          <ButtonPropsForm
            block={selectedBlock as CanvasContentBlock & { type: 'button' }}
            onUpdate={(props) => handleUpdate(selectedBlock.id, props)}
            daisyui={daisyui}
          />
        );
      case 'image':
        return (
          <ImagePropsForm
            block={selectedBlock as CanvasContentBlock & { type: 'image' }}
            onUpdate={(props) => handleUpdate(selectedBlock.id, props)}
            daisyui={daisyui}
          />
        );
      case 'heading':
        return (
          <HeadingPropsForm
            block={selectedBlock as CanvasContentBlock & { type: 'heading' }}
            onUpdate={(props) => handleUpdate(selectedBlock.id, props)}
            daisyui={daisyui}
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
        <div className="p-6 pb-8 overflow-y-auto flex-1">{renderPropsForm()}</div>
        {['text', 'button', 'image', 'heading'].includes(selectedBlock.type) ? (
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
              <Trash size={18} />
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
