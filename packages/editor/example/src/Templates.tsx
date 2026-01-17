import { useState } from 'react';
import {
  CanvasProvider,
  EmailEditor,
  emailTemplates,
  createDocumentFromTemplate,
  getTemplateCategories,
  getTemplatesByCategory,
  type CanvasDocument,
  type EmailTemplate,
} from '@react-email-dnd';
import { customBlocks } from './components/custom-blocks';

export const Templates = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [document, setDocument] = useState<CanvasDocument | null>(null);
  const categories = getTemplateCategories();

  const handleTemplateSelect = (template: EmailTemplate) => {
    const doc = createDocumentFromTemplate(template.metadata.id);
    if (doc) {
      setDocument(doc);
      setSelectedTemplate(template);
    }
  };

  const handleBackToGallery = () => {
    setSelectedTemplate(null);
    setDocument(null);
  };

  if (document && selectedTemplate) {
    return (
      <div className="h-full w-full flex flex-col">
        <div className="bg-base-200 p-4 flex items-center justify-between border-b">
          <div className="flex items-center gap-4">
            <button onClick={handleBackToGallery} className="btn btn-sm btn-ghost">
              ← Back to Templates
            </button>
            <div>
              <h2 className="text-xl font-bold">{selectedTemplate.metadata.name}</h2>
              <p className="text-sm text-base-content/70">{selectedTemplate.metadata.description}</p>
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-hidden">
          <CanvasProvider
            initialDocument={document}
            onSave={() => console.log('save')}
            onDocumentChange={(data) => console.log('document changed', data)}
          >
            <EmailEditor customBlocks={customBlocks} showHidden={true} />
          </CanvasProvider>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full overflow-auto bg-base-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Email Templates</h1>
          <p className="text-lg text-base-content/70">
            Choose from our pre-built templates to get started quickly
          </p>
        </div>

        {categories.map((category) => {
          const templates = getTemplatesByCategory(category);
          if (templates.length === 0) return null;

          return (
            <div key={category} className="mb-12">
              <h2 className="text-2xl font-bold mb-4 capitalize">{category}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates.map((template) => (
                  <div
                    key={template.metadata.id}
                    className="card bg-base-200 shadow-md hover:shadow-xl transition-shadow cursor-pointer"
                    onClick={() => handleTemplateSelect(template)}
                  >
                    <div className="card-body">
                      <h3 className="card-title">{template.metadata.name}</h3>
                      <p className="text-sm text-base-content/70">{template.metadata.description}</p>
                      {template.metadata.tags && template.metadata.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {template.metadata.tags.map((tag) => (
                            <span key={tag} className="badge badge-sm badge-primary">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="card-actions justify-end mt-4">
                        <button className="btn btn-primary btn-sm">Use Template</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        <div className="mt-12 p-6 bg-base-200 rounded-lg">
          <h3 className="text-xl font-bold mb-2">Custom Templates</h3>
          <p className="text-base-content/70 mb-4">
            You can also create your own templates by importing the <code className="bg-base-300 px-2 py-1 rounded">emailTemplates</code> array
            and using <code className="bg-base-300 px-2 py-1 rounded">createDocumentFromTemplate()</code> function.
          </p>
          <div className="mockup-code text-sm">
            <pre data-prefix="1"><code>import {'{'} createDocumentFromTemplate {'}'} from '@react-email-dnd';</code></pre>
            <pre data-prefix="2"><code></code></pre>
            <pre data-prefix="3"><code>const document = createDocumentFromTemplate('welcome');</code></pre>
          </div>
        </div>
      </div>
    </div>
  );
};
