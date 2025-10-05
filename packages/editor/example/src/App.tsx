import { EmailEditor, CanvasProvider } from 'react-email-dnd';
import type { CanvasDocument } from '@react-email-dnd/shared';
import 'react-email-dnd/styles.css';
import { useState, useCallback } from 'react';
import { createSampleCanvasDocument } from './sample-document';

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
            onClick={() => console.log('Current document:', document)}
            className="px-4 py-2 btn btn-success btn-soft transition-colors"
          >
            Log to Console
          </button>
        </div>
      </header>
      <main className="flex-1 overflow-hidden">
        <CanvasProvider
          initialDocument={document}
          onSave={handleSave}
          onDocumentChange={handleDocumentChange}
          uploadFile={uploadFile}
        >
          <EmailEditor daisyui={true} unlockable={false} />
        </CanvasProvider>
      </main>
    </div>
  );
}

export default App;
