import type { ChangeEvent } from 'react';
import { useCanvasStore } from '../hooks/useCanvasStore';
import { ArrowCounterClockwiseIcon } from '@phosphor-icons/react';
import { FileTextIcon } from '@phosphor-icons/react';
const TITLE_INPUT_ID = 'email-dnd-title-input';

export function Header() {
  const { document, updateTitle, save, undo, isDirty, canUndo } = useCanvasStore();

  const handleTitleChange = (event: ChangeEvent<HTMLInputElement>) => {
    updateTitle(event.target.value);
  };

  return (
    <header className="email-dnd-header" aria-label="Email editor header">
      <div className="email-dnd-header-title">
        <label className="email-dnd-header-label" htmlFor={TITLE_INPUT_ID}>
          Email title
        </label>
        <input
          id={TITLE_INPUT_ID}
          type="text"
          value={document.meta.title}
          onChange={handleTitleChange}
          placeholder="Untitled email"
          className="email-dnd-header-input"
        />
      </div>
      <div className="email-dnd-header-actions">
        <button
          type="button"
          onClick={undo}
          disabled={!canUndo}
          className="flex email-dnd-header-button gap-2 flex items-center"
        >
          <ArrowCounterClockwiseIcon />
          Undo
        </button>
        <button
          type="button"
          onClick={save}
          disabled={!isDirty}
          className="email-dnd-header-button email-dnd-header-button--primary"
        >
          Save
        </button>
      </div>
    </header>
  );
}
