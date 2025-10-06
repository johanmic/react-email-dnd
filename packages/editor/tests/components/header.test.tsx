import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import {
  Header,
  CanvasProvider,
  useCanvasStore,
  type CanvasDocument,
  type CanvasSection,
} from '../../src';

describe('Header', () => {
  const initialDocument: CanvasDocument = {
    version: 1,
    meta: { title: 'Welcome email' },
    sections: [],
  };

  it('allows editing the title, saving, and undoing changes', async () => {
    const onSave = vi.fn();
    render(
      <CanvasProvider initialDocument={initialDocument} onSave={onSave}>
        <Header />
      </CanvasProvider>,
    );

    const titleInput = screen.getByLabelText(/email title/i) as HTMLInputElement;
    const saveButton = screen.getByRole('button', { name: /save/i });
    const undoButton = screen.getByRole('button', { name: /undo/i });

    expect(titleInput.value).toBe('Welcome email');
    expect(saveButton).toBeDisabled();
    expect(undoButton).toBeDisabled();

    const user = userEvent.setup();
    await user.clear(titleInput);
    await user.type(titleInput, 'Updated launch email');

    expect(saveButton).toBeEnabled();
    expect(undoButton).toBeEnabled();

    await user.click(undoButton);

    expect(titleInput.value).toBe('Welcome email');
    expect(saveButton).toBeDisabled();
    expect(undoButton).toBeDisabled();

    await user.type(titleInput, 'Updated launch email');

    expect(saveButton).toBeEnabled();
    expect(undoButton).toBeEnabled();

    await user.click(saveButton);

    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onSave).toHaveBeenLastCalledWith({
      version: 1,
      meta: { title: 'Updated launch email' },
      sections: [],
    });
    expect(saveButton).toBeDisabled();
    expect(undoButton).toBeEnabled();
    expect(titleInput.value).toBe('Updated launch email');

    await user.clear(titleInput);
    await user.type(titleInput, 'Product launch v2');

    expect(saveButton).toBeEnabled();
    expect(undoButton).toBeEnabled();

    await user.click(undoButton);

    expect(titleInput.value).toBe('Updated launch email');
    expect(saveButton).toBeDisabled();
    expect(undoButton).toBeEnabled();

    await user.click(undoButton);

    expect(titleInput.value).toBe('Welcome email');
    expect(saveButton).toBeDisabled();
    expect(undoButton).toBeDisabled();
  });

  it('enables undo when sections change through the canvas store', async () => {
    const initialSections: CanvasSection[] = [];
    const initialDocumentWithSections: CanvasDocument = {
      version: 1,
      meta: { title: 'Welcome email' },
      sections: initialSections,
    };

    const NewSectionButton = () => {
      const { document, setDocument } = useCanvasStore();

      const handleClick = () => {
        const nextSection: CanvasSection = {
          id: 'section-1',
          type: 'section',
          rows: [],
        };

        setDocument({
          ...document,
          sections: [...document.sections, nextSection],
        });
      };

      return (
        <button type="button" onClick={handleClick}>
          Add Section
        </button>
      );
    };

    const user = userEvent.setup();

    render(
      <CanvasProvider initialDocument={initialDocumentWithSections}>
        <Header />
        <NewSectionButton />
      </CanvasProvider>,
    );

    const undoButton = screen.getByRole('button', { name: /undo/i });
    const addSectionButton = screen.getByRole('button', { name: /add section/i });

    expect(undoButton).toBeDisabled();

    await user.click(addSectionButton);

    expect(undoButton).toBeEnabled();

    await user.click(undoButton);

    expect(undoButton).toBeDisabled();
  });

  it('keeps the header dirty state when document changes are echoed back as initialDocument', async () => {
    const initialDoc: CanvasDocument = {
      version: 1,
      meta: { title: 'Welcome email' },
      sections: [],
    };

    const MutateDocumentButton = () => {
      const { document, setDocument } = useCanvasStore();

      const handleClick = () => {
        const nextSection: CanvasSection = {
          id: `section-${document.sections.length + 1}`,
          type: 'section',
          rows: [],
        };

        setDocument({
          ...document,
          sections: [...document.sections, nextSection],
        });
      };

      return (
        <button type="button" onClick={handleClick}>
          Mutate document
        </button>
      );
    };

    const Harness = () => {
      const [doc, setDoc] = useState<CanvasDocument>(initialDoc);

      return (
        <CanvasProvider initialDocument={doc} onDocumentChange={setDoc}>
          <Header />
          <MutateDocumentButton />
        </CanvasProvider>
      );
    };

    const user = userEvent.setup();

    render(<Harness />);

    const saveButton = screen.getByRole('button', { name: /save/i });
    const mutateButton = screen.getByRole('button', { name: /mutate document/i });

    expect(saveButton).toBeDisabled();

    await user.click(mutateButton);

    expect(saveButton).toBeEnabled();
  });
});
