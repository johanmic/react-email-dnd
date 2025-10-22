/**
 * Custom Font Usage Example
 *
 * This example shows how to properly use custom fonts with React Email DnD
 * according to the React Email Font component documentation:
 * https://react.email/docs/components/font
 */

import { EmailEditor, CanvasProvider } from '@react-email-dnd';
import type { CanvasDocument, FontDefinition } from '@react-email-dnd/shared';
import { useState, useCallback } from 'react';

// Correct font definitions according to React Email documentation
const customFonts: FontDefinition[] = [
  {
    id: 'geist',
    fontFamily: 'Geist',
    fallbackFontFamily: 'system-ui, sans-serif',
    webFont: {
      url: 'https://fonts.gstatic.com/s/geist/v4/gyByhwUxId8gMEwYGFWNOITddY4.woff2',
      format: 'woff2',
    },
    fontWeight: 400,
    fontStyle: 'normal',
  },
  {
    id: 'inter',
    fontFamily: 'Inter',
    fallbackFontFamily: 'system-ui, sans-serif',
    webFont: {
      url: 'https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa2JL7W0Q5n-wU.woff2',
      format: 'woff2',
    },
    fontWeight: 400,
    fontStyle: 'normal',
  },
];

// Example document with fonts in theme
const exampleDocument: CanvasDocument = {
  version: 1,
  meta: {
    title: 'Custom Font Example',
  },
  variables: {},
  theme: {
    fonts: customFonts,
  },
  sections: [
    {
      id: 'section-1',
      type: 'section',
      rows: [
        {
          id: 'row-1',
          type: 'row',
          gutter: 16,
          padding: '6',
          margin: '0',
          align: 'left',
          columns: [
            {
              id: 'column-1',
              type: 'column',
              padding: '4',
              margin: '0',
              align: 'left',
              blocks: [
                {
                  id: 'heading-1',
                  type: 'heading',
                  props: {
                    content: 'Custom Font Example',
                    as: 'h1',
                    align: 'left',
                    fontSize: 32,
                    color: '#111827',
                    lineHeight: '1.2',
                    fontWeight: 'bold',
                    margin: '0 0 16px',
                    padding: '0',
                    fontFamily: 'Geist', // This will use the custom font
                  },
                },
                {
                  id: 'text-1',
                  type: 'text',
                  props: {
                    content: 'This text uses the Inter font family.',
                    align: 'left',
                    fontSize: 16,
                    color: '#374151',
                    lineHeight: '1.6',
                    fontWeight: 'normal',
                    margin: '0 0 16px',
                    padding: '0',
                    fontFamily: 'Inter', // This will use the custom font
                  },
                },
                {
                  id: 'button-1',
                  type: 'button',
                  props: {
                    label: 'Custom Font Button',
                    href: 'https://example.com',
                    align: 'center',
                    backgroundColor: '#2563eb',
                    color: '#ffffff',
                    borderRadius: 6,
                    padding: '12px 24px',
                    fontSize: 14,
                    fontWeight: 'bold',
                    margin: '12px 0',
                    fontFamily: 'Geist', // This will use the custom font
                  },
                },
              ],
            },
          ],
        },
      ],
      padding: '8',
      margin: '0',
      align: 'left',
    },
  ],
};

function CustomFontExample() {
  const [document, setDocument] = useState<CanvasDocument>(exampleDocument);

  const handleSave = useCallback((data: CanvasDocument) => {
    console.log('💾 Saved document with fonts:', data);
  }, []);

  const handleDocumentChange = useCallback((data: CanvasDocument) => {
    console.log('📝 Document changed:', data);
    setDocument(data);
  }, []);

  const uploadFile = useCallback(async (file: File) => {
    // Demo uploader
    await new Promise((r) => setTimeout(r, 800));
    return URL.createObjectURL(file);
  }, []);

  return (
    <div className="h-screen flex flex-col">
      <div className="p-4 shadow-sm flex justify-between items-center bg-white border-b">
        <h2 className="text-xl font-semibold text-gray-800">Custom Font Example</h2>
        <div className="text-sm text-gray-600">
          Fonts: {document.theme?.fonts?.map((f) => f.fontFamily).join(', ') || 'None'}
        </div>
      </div>
      <div className="flex-1 overflow-hidden">
        <CanvasProvider
          initialDocument={document}
          onSave={handleSave}
          onDocumentChange={handleDocumentChange}
          uploadFile={uploadFile}
        >
          <EmailEditor fonts={customFonts} daisyui={false} unlockable={true} />
        </CanvasProvider>
      </div>
    </div>
  );
}

export default CustomFontExample;
