import {
  createContext,
  useCallback,
  useMemo,
  useReducer,
  type ReactNode,
} from 'react';
import type { CanvasDocument } from '../types/schema';
import {
  cloneCanvasDocument,
  createEmptyDocument,
  documentsAreEqual,
} from '../utils/document';

interface CanvasState {
  past: CanvasDocument[];
  present: CanvasDocument;
  future: CanvasDocument[];
  savedSnapshot: CanvasDocument;
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
  | { type: 'undo' };

interface CanvasProviderProps {
  children: ReactNode;
  initialDocument?: CanvasDocument;
  onSave?: (document: CanvasDocument) => void;
}

export interface CanvasStoreValue {
  document: CanvasDocument;
  isDirty: boolean;
  canUndo: boolean;
  updateTitle: (title: string) => void;
  setDocument: (
    document: CanvasDocument,
    options?: { commit?: boolean; replaceHistory?: boolean; markAsSaved?: boolean },
  ) => void;
  save: () => void;
  undo: () => void;
}

const CanvasStoreContext = createContext<CanvasStoreValue | null>(null);

function createInitialState(initialDocument?: CanvasDocument): CanvasState {
  const base = cloneCanvasDocument(initialDocument ?? createEmptyDocument());

  return {
    past: [],
    present: base,
    future: [],
    savedSnapshot: cloneCanvasDocument(base),
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
      };
    }
    default:
      return state;
  }
}

export function CanvasProvider({ children, initialDocument, onSave }: CanvasProviderProps) {
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
    },
    [],
  );

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

  const document = state.present;
  const isDirty = !documentsAreEqual(state.present, state.savedSnapshot);

  const value = useMemo<CanvasStoreValue>(
    () => ({
      document,
      isDirty,
      canUndo,
      updateTitle,
      setDocument,
      save,
      undo,
    }),
    [document, isDirty, canUndo, updateTitle, setDocument, save, undo],
  );

  return <CanvasStoreContext.Provider value={value}>{children}</CanvasStoreContext.Provider>;
}

export { CanvasStoreContext };
