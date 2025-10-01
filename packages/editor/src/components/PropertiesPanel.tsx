import React, { useCallback } from 'react';
import clsx from 'clsx';
import { X } from '@phosphor-icons/react';
import { useCanvasStore } from '../hooks/useCanvasStore';
import type {
  ButtonBlockProps,
  TextBlockProps,
  ImageBlockProps,
  HeadingBlockProps,
  CanvasContentBlock,
} from '../types/schema';

interface PropertiesPanelProps {
  className?: string;
}

interface TextPropsFormProps {
  block: CanvasContentBlock & { type: 'text' };
  onUpdate: (props: Partial<TextBlockProps>) => void;
}

interface HeadingPropsFormProps {
  block: CanvasContentBlock & { type: 'heading' };
  onUpdate: (props: Partial<HeadingBlockProps>) => void;
}

interface ButtonPropsFormProps {
  block: CanvasContentBlock & { type: 'button' };
  onUpdate: (props: Partial<ButtonBlockProps>) => void;
}

interface ImagePropsFormProps {
  block: CanvasContentBlock & { type: 'image' };
  onUpdate: (props: Partial<ImageBlockProps>) => void;
}

function HeadingPropsForm({ block, onUpdate }: HeadingPropsFormProps) {
  const props = block.props as HeadingBlockProps;

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2 leading-snug">
          Heading Level
        </label>
        <select
          value={props.as || 'h1'}
          onChange={(e) =>
            onUpdate({ as: e.target.value as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' })
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white transition focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 hover:border-gray-400 cursor-pointer pr-10"
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
        <label className="block text-sm font-medium text-gray-700 mb-2 leading-snug">
          Text Content
        </label>
        <textarea
          value={props.content || ''}
          onChange={(e) => onUpdate({ content: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white transition focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 hover:border-gray-400 resize-y min-h-16"
          rows={3}
          placeholder="Enter your text content..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2 leading-snug">
          Alignment
        </label>
        <select
          value={props.align || 'left'}
          onChange={(e) => onUpdate({ align: e.target.value as 'left' | 'center' | 'right' })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white transition focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 hover:border-gray-400 cursor-pointer pr-10"
        >
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2 leading-snug">
          Font Size
        </label>
        <input
          type="number"
          value={props.fontSize || 16}
          onChange={(e) => onUpdate({ fontSize: Number(e.target.value) })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white transition focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 hover:border-gray-400"
          min="8"
          max="72"
        />
        <span className="block text-xs text-gray-500 mt-1">Pixels (8-72)</span>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2 leading-snug">Color</label>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={props.color || '#1f2937'}
            onChange={(e) => onUpdate({ color: e.target.value })}
            className="w-12 h-10 p-1 border border-gray-300 rounded-md cursor-pointer bg-white"
          />
          <input
            type="text"
            value={props.color || '#1f2937'}
            onChange={(e) => onUpdate({ color: e.target.value })}
            className="flex-1 ml-3 px-3 py-2 border border-gray-300 rounded-md text-sm bg-white transition focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 hover:border-gray-400"
            placeholder="#1f2937"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2 leading-snug">
          Font Weight
        </label>
        <select
          value={props.fontWeight || 'normal'}
          onChange={(e) => onUpdate({ fontWeight: e.target.value as 'normal' | 'medium' | 'bold' })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white transition focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 hover:border-gray-400 cursor-pointer pr-10"
        >
          <option value="normal">Normal</option>
          <option value="medium">Medium</option>
          <option value="bold">Bold</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2 leading-snug">
          Line Height
        </label>
        <input
          type="text"
          value={props.lineHeight || '1.6'}
          onChange={(e) => onUpdate({ lineHeight: e.target.value })}
          placeholder="1.6"
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white transition focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 hover:border-gray-400"
        />
        <span className="block text-xs text-gray-500 mt-1">
          Number or percentage (e.g., 1.6 or 150%)
        </span>
      </div>
    </div>
  );
}

function TextPropsForm({ block, onUpdate }: TextPropsFormProps) {
  const props = block.props as TextBlockProps;

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2 leading-snug">
          Text Content
        </label>
        <textarea
          value={props.content || ''}
          onChange={(e) => onUpdate({ content: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white transition focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 hover:border-gray-400 resize-y min-h-16"
          rows={3}
          placeholder="Enter your text content..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2 leading-snug">
          Alignment
        </label>
        <select
          value={props.align || 'left'}
          onChange={(e) => onUpdate({ align: e.target.value as 'left' | 'center' | 'right' })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white transition focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 hover:border-gray-400 cursor-pointer pr-10"
        >
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2 leading-snug">
          Font Size
        </label>
        <input
          type="number"
          value={props.fontSize || 16}
          onChange={(e) => onUpdate({ fontSize: Number(e.target.value) })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white transition focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 hover:border-gray-400"
          min="8"
          max="72"
        />
        <span className="block text-xs text-gray-500 mt-1">Pixels (8-72)</span>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2 leading-snug">Color</label>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={props.color || '#1f2937'}
            onChange={(e) => onUpdate({ color: e.target.value })}
            className="w-12 h-10 p-1 border border-gray-300 rounded-md cursor-pointer bg-white"
          />
          <input
            type="text"
            value={props.color || '#1f2937'}
            onChange={(e) => onUpdate({ color: e.target.value })}
            className="flex-1 ml-3 px-3 py-2 border border-gray-300 rounded-md text-sm bg-white transition focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 hover:border-gray-400"
            placeholder="#1f2937"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2 leading-snug">
          Font Weight
        </label>
        <select
          value={props.fontWeight || 'normal'}
          onChange={(e) => onUpdate({ fontWeight: e.target.value as 'normal' | 'medium' | 'bold' })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white transition focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 hover:border-gray-400 cursor-pointer pr-10"
        >
          <option value="normal">Normal</option>
          <option value="medium">Medium</option>
          <option value="bold">Bold</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2 leading-snug">
          Line Height
        </label>
        <input
          type="text"
          value={props.lineHeight || '1.6'}
          onChange={(e) => onUpdate({ lineHeight: e.target.value })}
          placeholder="1.6"
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white transition focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 hover:border-gray-400"
        />
        <span className="block text-xs text-gray-500 mt-1">
          Number or percentage (e.g., 1.6 or 150%)
        </span>
      </div>
    </div>
  );
}

function ButtonPropsForm({ block, onUpdate }: ButtonPropsFormProps) {
  const props = block.props as ButtonBlockProps;

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2 leading-snug">
          Button Text
        </label>
        <input
          type="text"
          value={props.label || ''}
          onChange={(e) => onUpdate({ label: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white transition focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 hover:border-gray-400"
          placeholder="Enter button text..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2 leading-snug">URL</label>
        <input
          type="url"
          value={props.href || ''}
          onChange={(e) => onUpdate({ href: e.target.value })}
          placeholder="https://example.com"
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white transition focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 hover:border-gray-400"
        />
        <span className="block text-xs text-gray-500 mt-1">Where the button should link to</span>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2 leading-snug">
          Alignment
        </label>
        <select
          value={props.align || 'center'}
          onChange={(e) => onUpdate({ align: e.target.value as 'left' | 'center' | 'right' })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white transition focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 hover:border-gray-400 cursor-pointer pr-10"
        >
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2 leading-snug">
          Background Color
        </label>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={props.backgroundColor || '#2563eb'}
            onChange={(e) => onUpdate({ backgroundColor: e.target.value })}
            className="w-12 h-10 p-1 border border-gray-300 rounded-md cursor-pointer bg-white"
          />
          <input
            type="text"
            value={props.backgroundColor || '#2563eb'}
            onChange={(e) => onUpdate({ backgroundColor: e.target.value })}
            className="flex-1 ml-3 px-3 py-2 border border-gray-300 rounded-md text-sm bg-white transition focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 hover:border-gray-400"
            placeholder="#2563eb"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2 leading-snug">
          Text Color
        </label>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={props.color || '#ffffff'}
            onChange={(e) => onUpdate({ color: e.target.value })}
            className="w-12 h-10 p-1 border border-gray-300 rounded-md cursor-pointer bg-white"
          />
          <input
            type="text"
            value={props.color || '#ffffff'}
            onChange={(e) => onUpdate({ color: e.target.value })}
            className="flex-1 ml-3 px-3 py-2 border border-gray-300 rounded-md text-sm bg-white transition focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 hover:border-gray-400"
            placeholder="#ffffff"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2 leading-snug">
          Border Radius
        </label>
        <input
          type="number"
          value={props.borderRadius || 6}
          onChange={(e) => onUpdate({ borderRadius: Number(e.target.value) })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white transition focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 hover:border-gray-400"
          min="0"
          max="50"
        />
        <span className="block text-xs text-gray-500 mt-1">Pixels (0-50)</span>
      </div>
    </div>
  );
}

function ImagePropsForm({ block, onUpdate }: ImagePropsFormProps) {
  const props = block.props as ImageBlockProps;

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2 leading-snug">
          Image URL
        </label>
        <input
          type="url"
          value={props.src || ''}
          onChange={(e) => onUpdate({ src: e.target.value })}
          placeholder="https://example.com/image.jpg"
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white transition focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 hover:border-gray-400"
        />
        <span className="block text-xs text-gray-500 mt-1">Direct link to your image</span>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2 leading-snug">
          Alt Text
        </label>
        <input
          type="text"
          value={props.alt || ''}
          onChange={(e) => onUpdate({ alt: e.target.value })}
          placeholder="Image description"
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white transition focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 hover:border-gray-400"
        />
        <span className="block text-xs text-gray-500 mt-1">
          Accessible description for screen readers
        </span>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2 leading-snug">
          Link URL (Optional)
        </label>
        <input
          type="url"
          value={props.href || ''}
          onChange={(e) => onUpdate({ href: e.target.value })}
          placeholder="https://example.com"
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white transition focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 hover:border-gray-400"
        />
        <span className="block text-xs text-gray-500 mt-1">Make the image clickable</span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 leading-snug">Width</label>
          <input
            type="number"
            value={props.width || 600}
            onChange={(e) => onUpdate({ width: Number(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white transition focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 hover:border-gray-400"
            min="1"
          />
          <span className="block text-xs text-gray-500 mt-1">Pixels</span>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 leading-snug">
            Height
          </label>
          <input
            type="number"
            value={props.height || 200}
            onChange={(e) => onUpdate({ height: Number(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white transition focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 hover:border-gray-400"
            min="1"
          />
          <span className="block text-xs text-gray-500 mt-1">Pixels</span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2 leading-snug">
          Alignment
        </label>
        <select
          value={props.align || 'center'}
          onChange={(e) => onUpdate({ align: e.target.value as 'left' | 'center' | 'right' })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white transition focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 hover:border-gray-400 cursor-pointer pr-10"
        >
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2 leading-snug">
          Border Radius
        </label>
        <input
          type="number"
          value={props.borderRadius || 0}
          onChange={(e) => onUpdate({ borderRadius: Number(e.target.value) })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white transition focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 hover:border-gray-400"
          min="0"
          max="50"
        />
        <span className="block text-xs text-gray-500 mt-1">Pixels (0 for sharp corners)</span>
      </div>
    </div>
  );
}

export function PropertiesPanel({ className = '' }: PropertiesPanelProps) {
  const { selectedBlock, selectBlock, updateBlockProps } = useCanvasStore();

  const handleClose = () => {
    selectBlock(null);
  };

  const handleUpdate = useCallback(
    (blockId: string, props: Record<string, unknown>) => {
      updateBlockProps(blockId, props);
    },
    [updateBlockProps],
  );

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
          />
        );
      case 'button':
        return (
          <ButtonPropsForm
            block={selectedBlock as CanvasContentBlock & { type: 'button' }}
            onUpdate={(props) => handleUpdate(selectedBlock.id, props)}
          />
        );
      case 'image':
        return (
          <ImagePropsForm
            block={selectedBlock as CanvasContentBlock & { type: 'image' }}
            onUpdate={(props) => handleUpdate(selectedBlock.id, props)}
          />
        );
      case 'heading':
        return (
          <HeadingPropsForm
            block={selectedBlock as CanvasContentBlock & { type: 'heading' }}
            onUpdate={(props) => handleUpdate(selectedBlock.id, props)}
          />
        );
      case 'divider':
        return (
          <div className="text-sm text-gray-500 text-center p-8 italic">
            Divider properties coming soon...
          </div>
        );
      default:
        return (
          <div className="text-sm text-gray-500 text-center p-8 italic">
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
    <div className={clsx('fixed inset-y-0 right-0 z-50 flex items-end', className)}>
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px] cursor-pointer"
        onClick={handleClose}
      />
      <div className="relative w-[400px] max-w-[90vw] h-full bg-white flex flex-col border-l border-gray-200 shadow-[ -20px_0_25px_-5px_rgba(0,0,0,0.1),_-8px_0_10px_-6px_rgba(0,0,0,0.1)] animate-[slide-in-right_0.25s_cubic-bezier(0.4,0,0.2,1)]">
        <div className="sticky top-0 z-10 flex items-start justify-between px-5 pt-6 pb-4 border-b border-gray-100 bg-[#fafafa]">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 m-0 leading-snug">
              {getBlockTypeName(selectedBlock.type)} Properties
            </h3>
            <p className="text-sm text-gray-500 mt-1">Customize your {selectedBlock.type} block</p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 active:bg-gray-200 rounded-md inline-flex items-center justify-center -mt-0.5"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-6 pb-8 overflow-y-auto flex-1">{renderPropsForm()}</div>
      </div>
    </div>
  );
}
