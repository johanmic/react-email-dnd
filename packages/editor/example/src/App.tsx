import { EmailEditor, CanvasProvider } from 'react-email-dnd';
import 'react-email-dnd/styles.css';

function App() {
  return (
    <CanvasProvider>
      <EmailEditor
        onSave={(data) => {
          console.log('🟨 SAVED:', data);
        }}
      />
    </CanvasProvider>
  );
}

export default App;
