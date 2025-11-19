import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import { Vanilla } from './Vanilla';
import DaisyuiApp from './Daisyui';
import { useState } from 'react';

function App() {
  const [hideTopMenu, setHideTopMenu] = useState(false);

  let header = null;
  if (!hideTopMenu) {
    header = (
      <header className="">
        <h1 className="text-2xl font-bold text-primary/80">React Email DnD</h1>
        <nav className="flex gap-4">
          <Link to="/daisyui" className="btn btn-primary">
            Daisyui
          </Link>
          <Link to="/vanilla" className="btn btn-secondary">
            Vanilla
          </Link>
        </nav>
        <div onClick={() => setHideTopMenu(true)}>Show top menu</div>
      </header>
    );
  }
  return (
    <BrowserRouter>
      <div className="h-screen flex flex-col">
        {header}
        <main className="flex-1 overflow-hidden">
          <Routes>
            <Route path="/" element={<Navigate to="/daisyui" replace />} />
            <Route path="/daisyui" element={<DaisyuiApp />} />
            <Route path="/vanilla" element={<Vanilla />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
