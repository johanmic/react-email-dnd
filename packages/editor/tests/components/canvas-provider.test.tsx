import { act, render, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useEffect } from 'react';
import type { CanvasDocument } from '@react-email-dnd/shared';
import { CanvasProvider, useCanvasStore } from '../../src';

function StoreCapture({
  onCapture,
}: {
  onCapture: (store: ReturnType<typeof useCanvasStore>) => void;
}) {
  const store = useCanvasStore();

  useEffect(() => {
    onCapture(store);
  }, [store, onCapture]);

  return null;
}

describe('CanvasProvider document exports', () => {
  it('propagates container styling updates to document change and save callbacks', async () => {
    const initialDocument: CanvasDocument = {
      version: 1,
      meta: { title: 'Test email' },
      variables: {},
      sections: [
        {
          id: 'section-1',
          type: 'section',
          rows: [
            {
              id: 'row-1',
              type: 'row',
              gutter: 16,
              columns: [
                {
                  id: 'column-1',
                  type: 'column',
                  blocks: [],
                },
              ],
            },
          ],
        },
      ],
    };

    const handleDocumentChange = vi.fn();
    const handleSave = vi.fn();

    let store: ReturnType<typeof useCanvasStore> | null = null;

    const capture = (value: ReturnType<typeof useCanvasStore>) => {
      store = value;
    };

    render(
      <CanvasProvider
        initialDocument={initialDocument}
        onDocumentChange={handleDocumentChange}
        onSave={handleSave}
      >
        <StoreCapture onCapture={capture} />
      </CanvasProvider>,
    );

    await waitFor(() => expect(handleDocumentChange).toHaveBeenCalled());
    handleDocumentChange.mockClear();

    await waitFor(() => expect(store).not.toBeNull());

    act(() => {
      store!.updateContainerProps({
        kind: 'row',
        id: 'row-1',
        props: { className: 'bg-primary' },
      });
    });

    await waitFor(() =>
      expect(handleDocumentChange).toHaveBeenCalledWith(
        expect.objectContaining({
          sections: [
            expect.objectContaining({
              rows: [
                expect.objectContaining({
                  id: 'row-1',
                  className: 'bg-primary',
                }),
              ],
            }),
          ],
        }),
      ),
    );

    act(() => {
      store!.save();
    });

    await waitFor(() =>
      expect(handleSave).toHaveBeenCalledWith(
        expect.objectContaining({
          sections: [
            expect.objectContaining({
              rows: [
                expect.objectContaining({
                  id: 'row-1',
                  className: 'bg-primary',
                }),
              ],
            }),
          ],
        }),
      ),
    );
  });
});
