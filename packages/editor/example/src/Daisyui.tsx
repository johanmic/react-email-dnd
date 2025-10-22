/**
 * DaisyUI Email Editor Example with Font Support
 *
 * This example demonstrates how to use custom fonts in the email editor:
 *
 * 1. Define fonts as FontDefinition objects with webFont URLs
 * 2. Pass fonts to EmailEditor via the fonts prop
 * 3. Fonts will appear in dropdowns for text, heading, and button blocks
 * 4. Fonts are dynamically loaded in the canvas preview
 * 5. Fonts are rendered in the final email using React Email's <Font> component
 *
 * You can also add fonts directly to the document's theme.fonts array
 * for programmatic font management.
 */

import { EmailEditor, CanvasProvider } from '@react-email-dnd';
import type { CanvasDocument, FontDefinition } from '@react-email-dnd/shared';
import '@react-email-dnd/styles.css';
import { useState, useCallback } from 'react';
import { createSampleCanvasDocument, bb } from './sample-document';
import { customBlocks } from './components/custom-blocks';
import { Footer } from './components/footer';
import themes from '../themes.json';
const theme = themes.lofi;
const baseColorNames = [
  'primary',
  'secondary',
  'accent',
  'neutral',
  'info',
  'success',
  'warning',
  'error',
];
const colors = [
  theme.primary,
  theme.secondary,
  theme.accent,
  theme.neutral,
  theme.info,
  theme.success,
  theme.warning,
  theme.error,
];
const padding = {
  none: '0',
  small: '4',
  medium: { base: '6', md: '8' },
  large: { base: '8', md: '12' },
  verylarge: '12px 24px',
};
const bgColors = ['base-100', 'base-200', 'base-300'].map((name) => ({
  class: `bg-${name}`,
  label: name,
  labelClass: `bg-${name}`,
}));
const textColors = baseColorNames.slice(0, 3).map((name) => ({
  // hex: forest[`${name}-content` as keyof typeof forest],
  class: `text-${name}`,
  labelClass: `bg-${name}`,
  label: name,
}));
import { advancedFonts as fonts } from './font-examples';

console.log({ textColors, bgColors, fonts });

function App() {
  const [document, setDocument] = useState<CanvasDocument | undefined>(
    createSampleCanvasDocument(),
  );

  const handleSave = useCallback((data: CanvasDocument) => {
    console.log('🟨 SAVED:', data);
    // In a real app, you would send this to your backend
    // fetch('/api/save-email', { method: 'POST', body: JSON.stringify(data) })
  }, []);

  const handleDocumentChange = useCallback((data: CanvasDocument) => {
    console.log('🟨 DOCUMENT CHANGED:', JSON.stringify(data, null, 2));
    setDocument(data);
  }, []);
  const [copied, setCopied] = useState(false);
  const handleCopy = useCallback(async () => {
    try {
      const text = JSON.stringify(document ?? null, null, 2);
      await navigator.clipboard.writeText(text);
      setCopied(true);
      console.log('✅ Copied document to clipboard');
      console.log('📄 Current document:', document);
    } catch (err) {
      console.error('Failed to copy document to clipboard', err);
    }
  }, [document]);

  const uploadFile = useCallback(async (file: File) => {
    // Demo uploader: simulate latency and return a blob URL.
    // In real usage, call your backend or a storage SDK and return the final URL.
    await new Promise((r) => setTimeout(r, 800));
    return URL.createObjectURL(file);
  }, []);

  const loadSampleDocument = () => {
    setDocument(createSampleCanvasDocument());
  };

  const clearDocument = () => {
    setDocument(undefined);
  };

  const addFontsToDocument = () => {
    if (!document) return;

    const updatedDocument = {
      ...document,
      theme: {
        ...document.theme,
        fonts: fonts,
      },
    };

    setDocument(updatedDocument);
    console.log('✅ Added fonts to document:', updatedDocument.theme?.fonts);
  };

  return (
    <div data-theme="lofi">
      <div className="h-full flex flex-col">
        <div className="bg-secondary ">Hej</div>
        <div className="p-4 shadow-sm flex justify-between items-center bg-base-100 border-b">
          <h2 className="text-xl font-semibold text-primary/80">DaisyUI Email Editor</h2>
          <div className="flex gap-3">
            <button
              onClick={loadSampleDocument}
              className="px-4 py-2 btn btn-primary btn-soft transition-colors"
            >
              Load Sample
            </button>
            <button
              onClick={clearDocument}
              className="px-4 py-2 btn btn-secondary btn-soft transition-colors"
            >
              Clear
            </button>
            <button
              onClick={handleCopy}
              className="px-4 py-2 btn btn-success btn-soft transition-colors"
            >
              {copied ? 'Copied!' : 'Copy to Clipboard'}
            </button>
            <button
              onClick={() => console.log('📄 Current document state:', document)}
              className="px-4 py-2 btn btn-info btn-soft transition-colors"
            >
              Log Document
            </button>
            <button
              onClick={addFontsToDocument}
              className="px-4 py-2 btn btn-warning btn-soft transition-colors"
            >
              Add Fonts to Document
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-hidden">
          <CanvasProvider
            initialDocument={bb}
            onSave={handleSave}
            onDocumentChange={handleDocumentChange}
            uploadFile={uploadFile}
          >
            <EmailEditor
              colors={colors}
              textColors={textColors}
              bgColors={bgColors}
              daisyui={true}
              unlockable={true}
              customBlocks={customBlocks}
              padding={padding}
              fonts={fonts}
            />
          </CanvasProvider>
        </div>
      </div>
    </div>
  );
}

export default App;
