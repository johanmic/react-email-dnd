import React, { useState, useCallback } from 'react';
import type { TemplateGenerationRequest } from '../types';
import type { UseAIReturn } from '../hooks/useAi';

export interface AIPanelProps {
  /**
   * AI hook instance
   */
  ai: UseAIReturn;
  
  /**
   * Callback when a template is generated
   */
  onTemplateGenerated?: (result: any) => void;
  
  /**
   * Custom className for styling
   */
  className?: string;
  
  /**
   * Available style options
   */
  styles?: Array<'minimal' | 'modern' | 'classic' | 'bold'>;
}

/**
 * AI Panel component for generating email templates
 */
export function AIPanel({
  ai,
  onTemplateGenerated,
  className = '',
  styles = ['minimal', 'modern', 'classic', 'bold'],
}: AIPanelProps) {
  const [description, setDescription] = useState('');
  const [selectedStyle, setSelectedStyle] = useState<string>(styles[0] || 'modern');
  const [includeImages, setIncludeImages] = useState(false);
  const [sections, setSections] = useState<string>('');

  const handleGenerate = useCallback(async () => {
    if (!description.trim()) {
      return;
    }

    const request: TemplateGenerationRequest = {
      description: description.trim(),
      style: selectedStyle as any,
      includeImages,
      sections: sections
        ? sections.split(',').map((s) => s.trim()).filter(Boolean)
        : undefined,
    };

    const result = await ai.generateTemplate(request);
    
    if (result && onTemplateGenerated) {
      onTemplateGenerated(result);
    }
  }, [description, selectedStyle, includeImages, sections, ai, onTemplateGenerated]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        handleGenerate();
      }
    },
    [handleGenerate]
  );

  return (
    <div className={`ai-panel ${className}`}>
      <div className="ai-panel-header">
        <h3 className="ai-panel-title">AI Template Generator</h3>
        <p className="ai-panel-description">
          Describe your email template and let AI create it for you
        </p>
      </div>

      <div className="ai-panel-content">
        {/* Description Input */}
        <div className="ai-panel-field">
          <label htmlFor="ai-description" className="ai-panel-label">
            Description *
          </label>
          <textarea
            id="ai-description"
            className="ai-panel-textarea"
            placeholder="E.g., Create a welcome email with a hero section, feature list, and call-to-action button"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={4}
            disabled={ai.state.isLoading}
          />
          <p className="ai-panel-hint">Press Cmd/Ctrl + Enter to generate</p>
        </div>

        {/* Style Selection */}
        <div className="ai-panel-field">
          <label htmlFor="ai-style" className="ai-panel-label">
            Style
          </label>
          <select
            id="ai-style"
            className="ai-panel-select"
            value={selectedStyle}
            onChange={(e) => setSelectedStyle(e.target.value)}
            disabled={ai.state.isLoading}
          >
            {styles.map((style) => (
              <option key={style} value={style}>
                {style.charAt(0).toUpperCase() + style.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Sections Input (Optional) */}
        <div className="ai-panel-field">
          <label htmlFor="ai-sections" className="ai-panel-label">
            Sections (Optional)
          </label>
          <input
            id="ai-sections"
            type="text"
            className="ai-panel-input"
            placeholder="E.g., Header, Features, Testimonial, CTA, Footer"
            value={sections}
            onChange={(e) => setSections(e.target.value)}
            disabled={ai.state.isLoading}
          />
          <p className="ai-panel-hint">Comma-separated list of sections</p>
        </div>

        {/* Include Images Checkbox */}
        <div className="ai-panel-field">
          <label className="ai-panel-checkbox-label">
            <input
              type="checkbox"
              className="ai-panel-checkbox"
              checked={includeImages}
              onChange={(e) => setIncludeImages(e.target.checked)}
              disabled={ai.state.isLoading}
            />
            <span>Include placeholder images</span>
          </label>
        </div>

        {/* Generate Button */}
        <div className="ai-panel-actions">
          <button
            className="ai-panel-button ai-panel-button-primary"
            onClick={handleGenerate}
            disabled={ai.state.isLoading || !description.trim()}
          >
            {ai.state.isLoading ? (
              <>
                <span className="ai-panel-spinner" />
                Generating...
              </>
            ) : (
              'Generate Template'
            )}
          </button>

          {ai.state.isLoading && (
            <button
              className="ai-panel-button ai-panel-button-secondary"
              onClick={ai.cancel}
            >
              Cancel
            </button>
          )}
        </div>

        {/* Error Display */}
        {ai.state.error && (
          <div className="ai-panel-error">
            <strong>Error:</strong> {ai.state.error.message}
          </div>
        )}

        {/* Success Message */}
        {ai.state.response && !ai.state.isLoading && !ai.state.error && (
          <div className="ai-panel-success">
            Template generated successfully!
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Compact version of AI Panel
 */
export interface AICompactPanelProps {
  ai: UseAIReturn;
  onTemplateGenerated?: (result: any) => void;
  className?: string;
}

export function AICompactPanel({
  ai,
  onTemplateGenerated,
  className = '',
}: AICompactPanelProps) {
  const [prompt, setPrompt] = useState('');

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) return;

    const result = await ai.generateTemplate({
      description: prompt.trim(),
    });

    if (result && onTemplateGenerated) {
      onTemplateGenerated(result);
      setPrompt('');
    }
  }, [prompt, ai, onTemplateGenerated]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleGenerate();
      }
    },
    [handleGenerate]
  );

  return (
    <div className={`ai-compact-panel ${className}`}>
      <div className="ai-compact-panel-input-wrapper">
        <input
          type="text"
          className="ai-compact-panel-input"
          placeholder="Describe your email template..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={ai.state.isLoading}
        />
        <button
          className="ai-compact-panel-button"
          onClick={handleGenerate}
          disabled={ai.state.isLoading || !prompt.trim()}
          title="Generate template"
        >
          {ai.state.isLoading ? '⏳' : '✨'}
        </button>
      </div>
      {ai.state.error && (
        <div className="ai-compact-panel-error">{ai.state.error.message}</div>
      )}
    </div>
  );
}
