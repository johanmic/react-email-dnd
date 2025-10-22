import { CanvasProvider, EmailEditor } from '@react-email-dnd';
import { customBlocks } from './components/custom-blocks';
//const bb =``
export const Vanilla = () => {
  return (
    <div className="h-full min-w-screen flex items-center justify-center">
      <div className="w-full ">
        <h1 className="text-4xl font-bold text-primary mb-4">Vanilla Editor</h1>
        <CanvasProvider
          //initialDocument={bb}
          onSave={() => console.log('save')}
          onDocumentChange={(data) => console.log('done', data)}
        >
          <EmailEditor customBlocks={customBlocks} showHidden={true} />
        </CanvasProvider>
      </div>
    </div>
  );
};
