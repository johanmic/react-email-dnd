import { createContext, useCallback, useMemo, useReducer, type ReactNode, useEffect } from 'react';
import '../styles.css';
import type { CanvasDocument, CanvasContentBlock } from '../types/schema';
import {
  cloneCanvasDocument,
  createEmptyDocument,
  documentsAreEqual,
  findBlockById,
  updateBlockProps,
} from '../utils/document';

interface CanvasState {
  past: CanvasDocument[];
  present: CanvasDocument;
  future: CanvasDocument[];
  savedSnapshot: CanvasDocument;
  selectedBlockId: string | null;
  previewMode: 'desktop' | 'mobile';
}

type CanvasAction =
  | {
      type: 'setDocument';
      document: CanvasDocument;
      options?: {
        commit?: boolean;
        replaceHistory?: boolean;
        markAsSaved?: boolean;
      };
    }
  | { type: 'updateTitle'; title: string }
  | { type: 'save'; snapshot: CanvasDocument }
  | { type: 'undo' }
  | { type: 'selectBlock'; blockId: string | null }
  | { type: 'updateBlockProps'; blockId: string; props: Record<string, unknown> }
  | { type: 'setPreviewMode'; mode: 'desktop' | 'mobile' };

interface CanvasProviderProps {
  children: ReactNode;
  initialDocument?: CanvasDocument;
  onSave?: (document: CanvasDocument) => void;
  onDocumentChange?: (document: CanvasDocument) => void;
}

export interface CanvasStoreValue {
  document: CanvasDocument;
  isDirty: boolean;
  canUndo: boolean;
  selectedBlockId: string | null;
  selectedBlock: CanvasContentBlock | null;
  previewMode: 'desktop' | 'mobile';
  updateTitle: (title: string) => void;
  setDocument: (
    document: CanvasDocument,
    options?: { commit?: boolean; replaceHistory?: boolean; markAsSaved?: boolean },
  ) => void;
  save: () => void;
  undo: () => void;
  selectBlock: (blockId: string | null) => void;
  updateBlockProps: (blockId: string, props: Record<string, unknown>) => void;
  setPreviewMode: (mode: 'desktop' | 'mobile') => void;
}

const CanvasStoreContext = createContext<CanvasStoreValue | null>(null);

function createInitialState(initialDocument?: CanvasDocument): CanvasState {
  const base = cloneCanvasDocument(initialDocument ?? createEmptyDocument());

  return {
    past: [],
    present: base,
    future: [],
    savedSnapshot: cloneCanvasDocument(base),
    selectedBlockId: null,
    previewMode: 'desktop',
  };
}

function pushToHistory(state: CanvasState, nextDocument: CanvasDocument): CanvasState {
  if (documentsAreEqual(state.present, nextDocument)) {
    return state;
  }

  const past = [...state.past, cloneCanvasDocument(state.present)];

  return {
    past,
    present: cloneCanvasDocument(nextDocument),
    future: [],
    savedSnapshot: state.savedSnapshot,
    selectedBlockId: state.selectedBlockId,
    previewMode: state.previewMode,
  };
}

function replaceHistory(
  state: CanvasState,
  nextDocument: CanvasDocument,
  markAsSaved: boolean,
): CanvasState {
  const present = cloneCanvasDocument(nextDocument);

  return {
    past: [],
    present,
    future: [],
    savedSnapshot: markAsSaved ? cloneCanvasDocument(present) : state.savedSnapshot,
    selectedBlockId: state.selectedBlockId,
    previewMode: state.previewMode,
  };
}

function canvasReducer(state: CanvasState, action: CanvasAction): CanvasState {
  switch (action.type) {
    case 'setDocument': {
      const options = action.options ?? {};
      const nextDocument = cloneCanvasDocument(action.document);

      if (options.replaceHistory) {
        return replaceHistory(state, nextDocument, options.markAsSaved ?? true);
      }

      if (options.commit === false) {
        if (documentsAreEqual(state.present, nextDocument)) {
          return state;
        }

        return {
          ...state,
          present: nextDocument,
        };
      }

      return pushToHistory(state, nextDocument);
    }
    case 'updateTitle': {
      if (state.present.meta.title === action.title) {
        return state;
      }

      const nextDocument = cloneCanvasDocument(state.present);
      nextDocument.meta = {
        ...nextDocument.meta,
        title: action.title,
      };

      return pushToHistory(state, nextDocument);
    }
    case 'save': {
      return {
        ...state,
        savedSnapshot: cloneCanvasDocument(action.snapshot),
      };
    }
    case 'undo': {
      if (state.past.length === 0) {
        return state;
      }

      const previous = state.past[state.past.length - 1];
      const nextPast = state.past.slice(0, -1);

      return {
        past: nextPast,
        present: cloneCanvasDocument(previous),
        future: [cloneCanvasDocument(state.present), ...state.future],
        savedSnapshot: state.savedSnapshot,
        selectedBlockId: state.selectedBlockId,
        previewMode: state.previewMode,
      };
    }
    case 'selectBlock': {
      return {
        ...state,
        selectedBlockId: action.blockId,
      };
    }
    case 'updateBlockProps': {
      const updatedDocument = updateBlockProps(state.present, action.blockId, action.props);
      return pushToHistory(state, updatedDocument);
    }
    case 'setPreviewMode': {
      if (state.previewMode === action.mode) {
        return state;
      }
      return {
        ...state,
        previewMode: action.mode,
      };
    }
    default:
      return state;
  }
}

export function CanvasProvider({
  children,
  initialDocument,
  onSave,
  onDocumentChange,
}: CanvasProviderProps) {
  const [state, dispatch] = useReducer(canvasReducer, initialDocument, createInitialState);

  const updateTitle = useCallback((title: string) => {
    dispatch({ type: 'updateTitle', title });
  }, []);

  const setDocument = useCallback(
    (
      document: CanvasDocument,
      options?: { commit?: boolean; replaceHistory?: boolean; markAsSaved?: boolean },
    ) => {
      dispatch({ type: 'setDocument', document, options });
      onDocumentChange?.(document);
    },
    [onDocumentChange],
  );

  useEffect(() => {
    // Initialize or replace the document only when the external initialDocument changes.
    // Do NOT react to internal edits, to avoid resetting user input while typing.
    if (initialDocument) {
      setDocument(initialDocument, { replaceHistory: true, markAsSaved: true });
    }
  }, [initialDocument, setDocument]);

  const save = useCallback(() => {
    if (documentsAreEqual(state.present, state.savedSnapshot)) {
      return;
    }

    const snapshot = cloneCanvasDocument(state.present);
    dispatch({ type: 'save', snapshot });
    onSave?.(snapshot);
  }, [onSave, state.present, state.savedSnapshot]);

  const canUndo = state.past.length > 0;

  const undo = useCallback(() => {
    if (!canUndo) {
      return;
    }

    dispatch({ type: 'undo' });
  }, [canUndo]);

  const selectBlock = useCallback((blockId: string | null) => {
    dispatch({ type: 'selectBlock', blockId });
  }, []);

  const updateBlockProps = useCallback((blockId: string, props: Record<string, unknown>) => {
    dispatch({ type: 'updateBlockProps', blockId, props });
  }, []);

  const setPreviewMode = useCallback((mode: 'desktop' | 'mobile') => {
    dispatch({ type: 'setPreviewMode', mode });
  }, []);

  const document = state.present;
  const isDirty = !documentsAreEqual(state.present, state.savedSnapshot);
  const selectedBlock = state.selectedBlockId
    ? findBlockById(document, state.selectedBlockId)
    : null;

  const value = useMemo<CanvasStoreValue>(
    () => ({
      document,
      isDirty,
      canUndo,
      selectedBlockId: state.selectedBlockId,
      selectedBlock,
      previewMode: state.previewMode,
      updateTitle,
      setDocument,
      save,
      undo,
      selectBlock,
      updateBlockProps,
      setPreviewMode,
    }),
    [
      document,
      isDirty,
      canUndo,
      state.selectedBlockId,
      selectedBlock,
      state.previewMode,
      updateTitle,
      setDocument,
      save,
      undo,
      selectBlock,
      updateBlockProps,
      setPreviewMode,
    ],
  );

  return <CanvasStoreContext.Provider value={value}>{children}</CanvasStoreContext.Provider>;
}

export { CanvasStoreContext };
