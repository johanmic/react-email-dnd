import { EmailEditor, CanvasProvider } from '@react-email-dnd';
import type { CanvasDocument } from '@react-email-dnd/shared';
import '@react-email-dnd/styles.css';
import { useState, useCallback } from 'react';
import { createSampleCanvasDocument, bb } from './sample-document';
import { customBlocks, customBlockPropEditors } from './custom-blocks';
import themes from '../themes.json';
const forest = themes.forest;
const colors = [
  forest.primary,
  forest.secondary,
  forest.accent,
  forest.neutral,
  forest.info,
  forest.success,
  forest.warning,
  forest.error,
];
const textColors = [
  'primary',
  'secondary',
  'accent',
  'neutral',
  'info',
  'success',
  'warning',
  'error',
].map((name) => ({
  hex: forest[`${name}-content` as keyof typeof forest],
  class: `text-${name}`,
}));

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
    console.log('🟨 DOCUMENT CHANGED:', data);
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

  return (
    <div className="h-screen flex flex-col" data-theme="forest">
      <header className="p-4 shadow-sm flex justify-between items-center bg-base-100">
        <h1 className="text-2xl font-bold text-primary/80">React Email DnD</h1>
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
        </div>
      </header>
      <main className="flex-1 overflow-hidden">
        <CanvasProvider
          initialDocument={bb}
          onSave={handleSave}
          onDocumentChange={handleDocumentChange}
          uploadFile={uploadFile}
        >
          <EmailEditor
            colors={colors}
            textColors={textColors}
            daisyui={true}
            unlockable={true}
            customBlocks={customBlocks}
            customBlockPropEditors={customBlockPropEditors}
          />
        </CanvasProvider>
      </main>
    </div>
  );
}

export default App;
