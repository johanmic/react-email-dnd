import React, { useState, useCallback } from 'react';
import { X } from '@phosphor-icons/react';
import { useCanvasStore } from '../hooks/useCanvasStore';
import type {
  ButtonBlockProps,
  TextBlockProps,
  ImageBlockProps,
  CanvasContentBlock,
} from '../types/schema';

interface PropertiesPanelProps {
  className?: string;
}

interface TextPropsFormProps {
  block: CanvasContentBlock & { type: 'text' };
  onUpdate: (props: Partial<TextBlockProps>) => void;
}

interface ButtonPropsFormProps {
  block: CanvasContentBlock & { type: 'button' };
  onUpdate: (props: Partial<ButtonBlockProps>) => void;
}

interface ImagePropsFormProps {
  block: CanvasContentBlock & { type: 'image' };
  onUpdate: (props: Partial<ImageBlockProps>) => void;
}

function TextPropsForm({ block, onUpdate }: TextPropsFormProps) {
  const props = block.props as TextBlockProps;

  return (
    <div className="space-y-6">
      <div>
        <label className="email-dnd-properties-label">Text Content</label>
        <textarea
          value={props.content || ''}
          onChange={(e) => onUpdate({ content: e.target.value })}
          className="email-dnd-properties-textarea"
          rows={3}
          placeholder="Enter your text content..."
        />
      </div>

      <div>
        <label className="email-dnd-properties-label">Alignment</label>
        <select
          value={props.align || 'left'}
          onChange={(e) => onUpdate({ align: e.target.value as 'left' | 'center' | 'right' })}
          className="email-dnd-properties-select"
        >
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
        </select>
      </div>

      <div>
        <label className="email-dnd-properties-label">Font Size</label>
        <input
          type="number"
          value={props.fontSize || 16}
          onChange={(e) => onUpdate({ fontSize: Number(e.target.value) })}
          className="email-dnd-properties-input"
          min="8"
          max="72"
        />
        <span className="email-dnd-properties-hint">Pixels (8-72)</span>
      </div>

      <div>
        <label className="email-dnd-properties-label">Color</label>
        <div className="email-dnd-properties-color-wrapper">
          <input
            type="color"
            value={props.color || '#1f2937'}
            onChange={(e) => onUpdate({ color: e.target.value })}
            className="email-dnd-properties-color"
          />
          <input
            type="text"
            value={props.color || '#1f2937'}
            onChange={(e) => onUpdate({ color: e.target.value })}
            className="email-dnd-properties-input flex-1 ml-3"
            placeholder="#1f2937"
          />
        </div>
      </div>

      <div>
        <label className="email-dnd-properties-label">Font Weight</label>
        <select
          value={props.fontWeight || 'normal'}
          onChange={(e) => onUpdate({ fontWeight: e.target.value as 'normal' | 'medium' | 'bold' })}
          className="email-dnd-properties-select"
        >
          <option value="normal">Normal</option>
          <option value="medium">Medium</option>
          <option value="bold">Bold</option>
        </select>
      </div>

      <div>
        <label className="email-dnd-properties-label">Line Height</label>
        <input
          type="text"
          value={props.lineHeight || '1.6'}
          onChange={(e) => onUpdate({ lineHeight: e.target.value })}
          placeholder="1.6"
          className="email-dnd-properties-input"
        />
        <span className="email-dnd-properties-hint">Number or percentage (e.g., 1.6 or 150%)</span>
      </div>
    </div>
  );
}

function ButtonPropsForm({ block, onUpdate }: ButtonPropsFormProps) {
  const props = block.props as ButtonBlockProps;

  return (
    <div className="space-y-6">
      <div>
        <label className="email-dnd-properties-label">Button Text</label>
        <input
          type="text"
          value={props.label || ''}
          onChange={(e) => onUpdate({ label: e.target.value })}
          className="email-dnd-properties-input"
          placeholder="Enter button text..."
        />
      </div>

      <div>
        <label className="email-dnd-properties-label">URL</label>
        <input
          type="url"
          value={props.href || ''}
          onChange={(e) => onUpdate({ href: e.target.value })}
          placeholder="https://example.com"
          className="email-dnd-properties-input"
        />
        <span className="email-dnd-properties-hint">Where the button should link to</span>
      </div>

      <div>
        <label className="email-dnd-properties-label">Alignment</label>
        <select
          value={props.align || 'center'}
          onChange={(e) => onUpdate({ align: e.target.value as 'left' | 'center' | 'right' })}
          className="email-dnd-properties-select"
        >
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
        </select>
      </div>

      <div>
        <label className="email-dnd-properties-label">Background Color</label>
        <div className="email-dnd-properties-color-wrapper">
          <input
            type="color"
            value={props.backgroundColor || '#2563eb'}
            onChange={(e) => onUpdate({ backgroundColor: e.target.value })}
            className="email-dnd-properties-color"
          />
          <input
            type="text"
            value={props.backgroundColor || '#2563eb'}
            onChange={(e) => onUpdate({ backgroundColor: e.target.value })}
            className="email-dnd-properties-input flex-1 ml-3"
            placeholder="#2563eb"
          />
        </div>
      </div>

      <div>
        <label className="email-dnd-properties-label">Text Color</label>
        <div className="email-dnd-properties-color-wrapper">
          <input
            type="color"
            value={props.color || '#ffffff'}
            onChange={(e) => onUpdate({ color: e.target.value })}
            className="email-dnd-properties-color"
          />
          <input
            type="text"
            value={props.color || '#ffffff'}
            onChange={(e) => onUpdate({ color: e.target.value })}
            className="email-dnd-properties-input flex-1 ml-3"
            placeholder="#ffffff"
          />
        </div>
      </div>

      <div>
        <label className="email-dnd-properties-label">Border Radius</label>
        <input
          type="number"
          value={props.borderRadius || 6}
          onChange={(e) => onUpdate({ borderRadius: Number(e.target.value) })}
          className="email-dnd-properties-input"
          min="0"
          max="50"
        />
        <span className="email-dnd-properties-hint">Pixels (0-50)</span>
      </div>
    </div>
  );
}

function ImagePropsForm({ block, onUpdate }: ImagePropsFormProps) {
  const props = block.props as ImageBlockProps;

  return (
    <div className="space-y-6">
      <div>
        <label className="email-dnd-properties-label">Image URL</label>
        <input
          type="url"
          value={props.src || ''}
          onChange={(e) => onUpdate({ src: e.target.value })}
          placeholder="https://example.com/image.jpg"
          className="email-dnd-properties-input"
        />
        <span className="email-dnd-properties-hint">Direct link to your image</span>
      </div>

      <div>
        <label className="email-dnd-properties-label">Alt Text</label>
        <input
          type="text"
          value={props.alt || ''}
          onChange={(e) => onUpdate({ alt: e.target.value })}
          placeholder="Image description"
          className="email-dnd-properties-input"
        />
        <span className="email-dnd-properties-hint">Accessible description for screen readers</span>
      </div>

      <div>
        <label className="email-dnd-properties-label">Link URL (Optional)</label>
        <input
          type="url"
          value={props.href || ''}
          onChange={(e) => onUpdate({ href: e.target.value })}
          placeholder="https://example.com"
          className="email-dnd-properties-input"
        />
        <span className="email-dnd-properties-hint">Make the image clickable</span>
      </div>

      <div className="email-dnd-properties-grid">
        <div>
          <label className="email-dnd-properties-label">Width</label>
          <input
            type="number"
            value={props.width || 600}
            onChange={(e) => onUpdate({ width: Number(e.target.value) })}
            className="email-dnd-properties-input"
            min="1"
          />
          <span className="email-dnd-properties-hint">Pixels</span>
        </div>

        <div>
          <label className="email-dnd-properties-label">Height</label>
          <input
            type="number"
            value={props.height || 200}
            onChange={(e) => onUpdate({ height: Number(e.target.value) })}
            className="email-dnd-properties-input"
            min="1"
          />
          <span className="email-dnd-properties-hint">Pixels</span>
        </div>
      </div>

      <div>
        <label className="email-dnd-properties-label">Alignment</label>
        <select
          value={props.align || 'center'}
          onChange={(e) => onUpdate({ align: e.target.value as 'left' | 'center' | 'right' })}
          className="email-dnd-properties-select"
        >
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
        </select>
      </div>

      <div>
        <label className="email-dnd-properties-label">Border Radius</label>
        <input
          type="number"
          value={props.borderRadius || 0}
          onChange={(e) => onUpdate({ borderRadius: Number(e.target.value) })}
          className="email-dnd-properties-input"
          min="0"
          max="50"
        />
        <span className="email-dnd-properties-hint">Pixels (0 for sharp corners)</span>
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
        // Similar to text but with different props
        return (
          <TextPropsForm
            block={selectedBlock as CanvasContentBlock & { type: 'text' }}
            onUpdate={(props) => handleUpdate(selectedBlock.id, props)}
          />
        );
      case 'divider':
        return (
          <div className="email-dnd-properties-message">Divider properties coming soon...</div>
        );
      default:
        return (
          <div className="email-dnd-properties-message">
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
    <div className={`email-dnd-properties-panel ${className}`}>
      <div className="email-dnd-properties-panel-overlay" onClick={handleClose} />
      <div className="email-dnd-properties-panel-content">
        <div className="email-dnd-properties-header">
          <div>
            <h3 className="email-dnd-properties-title">
              {getBlockTypeName(selectedBlock.type)} Properties
            </h3>
            <p className="email-dnd-properties-subtitle">
              Customize your {selectedBlock.type} block
            </p>
          </div>
          <button type="button" onClick={handleClose} className="email-dnd-properties-close-btn">
            <X size={20} />
          </button>
        </div>
        <div className="email-dnd-properties-body">{renderPropsForm()}</div>
      </div>
    </div>
  );
}
