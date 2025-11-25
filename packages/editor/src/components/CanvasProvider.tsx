'use client';

import {
  createContext,
  useCallback,
  useMemo,
  useReducer,
  type ReactNode,
  useEffect,
  useRef,
} from 'react';
import '../styles.css';
import type {
  CanvasDocument,
  CanvasContentBlock,
  CanvasSection,
  CanvasRow,
  CanvasColumn,
} from '@react-email-dnd/shared';
import {
  applyLayoutDefaults,
  cloneCanvasDocument,
  createEmptyDocument,
  documentsAreEqual,
  findBlockById,
  updateBlockProps,
} from '../utils/document';
import { withCombinedClassNames } from '../utils/classNames';

interface CanvasState {
  past: HistoryEntry[];
  present: CanvasDocument;
  future: HistoryEntry[];
  savedSnapshot: CanvasDocument;
  lastAction: 'updateTitle' | null;
  selectedBlockId: string | null;
  selectedContainer:
    | { kind: 'section'; id: string }
    | { kind: 'row'; id: string }
    | { kind: 'column'; id: string }
    | null;
  previewMode: 'desktop' | 'mobile';
  layoutMode: 'mobile' | 'desktop' | null;
  forceLayoutMode: 'mobile' | 'desktop' | null;
  showInlineInsertion: boolean;
  previewVariables: boolean;
  debug: boolean;
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
  | {
      type: 'selectContainer';
      container:
        | { kind: 'section'; id: string }
        | { kind: 'row'; id: string }
        | { kind: 'column'; id: string }
        | null;
    }
  | { type: 'updateBlockProps'; blockId: string; props: Record<string, unknown> }
  | {
      type: 'updateContainerProps';
      target:
        | { kind: 'section'; id: string; props: Partial<CanvasSection> }
        | { kind: 'row'; id: string; props: Partial<CanvasRow> }
        | { kind: 'column'; id: string; props: Partial<CanvasColumn> };
    }
  | { type: 'setPreviewMode'; mode: 'desktop' | 'mobile' }
  | { type: 'upsertVariable'; key: string; value: string }
  | { type: 'deleteVariable'; key: string }
  | { type: 'setLayoutMode'; mode: 'mobile' | 'desktop' | null }
  | { type: 'setForceLayoutMode'; mode: 'mobile' | 'desktop' | null }
  | { type: 'setShowInlineInsertion'; show: boolean }
  | { type: 'setPreviewVariables'; enabled: boolean };

interface HistoryEntry {
  document: CanvasDocument;
  savedSnapshot: CanvasDocument;
}

interface CanvasProviderProps {
  children: ReactNode;
  initialDocument?: CanvasDocument;
  onSave?: (document: CanvasDocument) => void;
  onDocumentChange?: (document: CanvasDocument) => void;
  /** Optional global upload handler. Should upload a File and resolve to its URL */
  uploadFile?: (file: File) => Promise<string>;
  /** Dynamic variables that override document variables. These are not saved and are available to custom blocks. */
  variables?: Record<string, unknown>;
  /** Enable debug logging */
  debug?: boolean;
}

export interface CanvasStoreValue {
  document: CanvasDocument;
  isDirty: boolean;
  canUndo: boolean;
  selectedBlockId: string | null;
  selectedBlock: CanvasContentBlock | null;
  selectedContainer:
    | { kind: 'section'; id: string }
    | { kind: 'row'; id: string }
    | { kind: 'column'; id: string }
    | null;
  previewMode: 'desktop' | 'mobile';
  layoutMode: 'mobile' | 'desktop' | null;
  forceLayoutMode: 'mobile' | 'desktop' | null;
  showInlineInsertion: boolean;
  previewVariables: boolean;
  isMobileExperience: boolean;
  variables: Record<string, unknown>;
  debug: boolean;
  /** If provided by provider, components can use this to upload files */
  uploadFile?: (file: File) => Promise<string>;
  /** Portal root element for modals and overlays */
  portalRoot: HTMLElement | null;
  updateTitle: (title: string) => void;
  setDocument: (
    document: CanvasDocument,
    options?: { commit?: boolean; replaceHistory?: boolean; markAsSaved?: boolean },
  ) => void;
  save: () => void;
  undo: () => void;
  selectBlock: (blockId: string | null) => void;
  selectContainer: (
    container:
      | { kind: 'section'; id: string }
      | { kind: 'row'; id: string }
      | { kind: 'column'; id: string }
      | null,
  ) => void;
  updateBlockProps: (blockId: string, props: Record<string, unknown>) => void;
  updateContainerProps: (
    target:
      | { kind: 'section'; id: string; props: Partial<CanvasSection> }
      | { kind: 'row'; id: string; props: Partial<CanvasRow> }
      | { kind: 'column'; id: string; props: Partial<CanvasColumn> },
  ) => void;
  setPreviewMode: (mode: 'desktop' | 'mobile') => void;
  upsertVariable: (key: string, value: string) => void;
  deleteVariable: (key: string) => void;
  setLayoutMode: (mode: 'mobile' | 'desktop' | null) => void;
  setForceLayoutMode: (mode: 'mobile' | 'desktop' | null) => void;
  setShowInlineInsertion: (show: boolean) => void;
  setPreviewVariables: (enabled: boolean) => void;
}

const CanvasStoreContext = createContext<CanvasStoreValue | null>(null);

function createInitialState(args: {
  initialDocument?: CanvasDocument;
  debug?: boolean;
}): CanvasState {
  const { initialDocument, debug = false } = args;
  const sourceDocument = initialDocument
    ? applyLayoutDefaults(initialDocument)
    : createEmptyDocument();
  const base = cloneCanvasDocument(sourceDocument);

  return {
    past: [],
    present: base,
    future: [],
    savedSnapshot: cloneCanvasDocument(base),
    lastAction: null,
    selectedBlockId: null,
    selectedContainer: null,
    previewMode: 'desktop',
    layoutMode: null,
    forceLayoutMode: null,
    showInlineInsertion: false,
    previewVariables: false,
    debug,
  };
}

function pushToHistory(state: CanvasState, nextDocument: CanvasDocument): CanvasState {
  if (documentsAreEqual(state.present, nextDocument)) {
    return state;
  }

  const pastEntry: HistoryEntry = {
    document: cloneCanvasDocument(state.present),
    savedSnapshot: cloneCanvasDocument(state.savedSnapshot),
  };
  const past = [...state.past, pastEntry];

  return {
    past,
    present: cloneCanvasDocument(nextDocument),
    future: [],
    savedSnapshot: state.savedSnapshot,
    lastAction: null,
    selectedBlockId: state.selectedBlockId,
    selectedContainer: state.selectedContainer,
    previewMode: state.previewMode,
    layoutMode: state.layoutMode,
    forceLayoutMode: state.forceLayoutMode,
    showInlineInsertion: state.showInlineInsertion,
    previewVariables: state.previewVariables,
    debug: state.debug,
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
    lastAction: null,
    selectedBlockId: state.selectedBlockId,
    selectedContainer: state.selectedContainer,
    previewMode: state.previewMode,
    layoutMode: state.layoutMode,
    forceLayoutMode: state.forceLayoutMode,
    showInlineInsertion: state.showInlineInsertion,
    previewVariables: state.previewVariables,
    debug: state.debug,
  };
}

function canvasReducer(state: CanvasState, action: CanvasAction): CanvasState {
  switch (action.type) {
    case 'setDocument': {
      const options = action.options ?? {};
      const normalized = applyLayoutDefaults(action.document);
      const nextDocument = cloneCanvasDocument(normalized);

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
          lastAction: null,
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

      if (state.lastAction === 'updateTitle') {
        return {
          ...state,
          present: nextDocument,
          lastAction: 'updateTitle',
        };
      }

      const updatedState = pushToHistory(state, nextDocument);
      return {
        ...updatedState,
        lastAction: 'updateTitle',
      };
    }
    case 'save': {
      return {
        ...state,
        savedSnapshot: cloneCanvasDocument(action.snapshot),
        lastAction: null,
      };
    }
    case 'undo': {
      if (state.past.length === 0) {
        return state;
      }

      const previous = state.past[state.past.length - 1];
      const nextPast = state.past.slice(0, -1);
      const futureEntry: HistoryEntry = {
        document: cloneCanvasDocument(state.present),
        savedSnapshot: cloneCanvasDocument(state.savedSnapshot),
      };

      return {
        past: nextPast,
        present: cloneCanvasDocument(previous.document),
        future: [futureEntry, ...state.future],
        savedSnapshot: cloneCanvasDocument(previous.savedSnapshot),
        lastAction: null,
        selectedBlockId: state.selectedBlockId,
        selectedContainer: state.selectedContainer,
        previewMode: state.previewMode,
        layoutMode: state.layoutMode,
        forceLayoutMode: state.forceLayoutMode,
        showInlineInsertion: state.showInlineInsertion,
        previewVariables: state.previewVariables,
        debug: state.debug,
      };
    }
    case 'selectBlock': {
      return {
        ...state,
        selectedBlockId: action.blockId,
        selectedContainer: null,
        lastAction: null,
      };
    }
    case 'selectContainer': {
      return {
        ...state,
        selectedContainer: action.container,
        selectedBlockId: null,
        lastAction: null,
      };
    }
    case 'updateBlockProps': {
      const updatedDocument = updateBlockProps(state.present, action.blockId, action.props);
      return pushToHistory(state, updatedDocument);
    }
    case 'updateContainerProps': {
      const { target } = action;
      if (state.debug) console.log('🔄 updateContainerProps called:', target);
      let next = state.present;
      if (target.kind === 'section') {
        next = {
          ...next,
          sections: next.sections.map((s) => (s.id === target.id ? { ...s, ...target.props } : s)),
        };
        if (state.debug)
          console.log('📝 Updated section:', target.id, 'with props:', target.props);
      } else if (target.kind === 'row') {
        next = {
          ...next,
          sections: next.sections.map((s) => ({
            ...s,
            rows: s.rows.map((r) => (r.id === target.id ? { ...r, ...target.props } : r)),
          })),
        };
        if (state.debug) console.log('📝 Updated row:', target.id, 'with props:', target.props);
      } else if (target.kind === 'column') {
        next = {
          ...next,
          sections: next.sections.map((s) => ({
            ...s,
            rows: s.rows.map((r) => ({
              ...r,
              columns: r.columns.map((c) => (c.id === target.id ? { ...c, ...target.props } : c)),
            })),
          })),
        };
        if (state.debug)
          console.log('📝 Updated column:', target.id, 'with props:', target.props);
      }
      if (state.debug) console.log('📄 New document state:', next);
      return pushToHistory(state, next);
    }
    case 'setPreviewMode': {
      if (state.previewMode === action.mode) {
        return state;
      }
      return {
        ...state,
        previewMode: action.mode,
        lastAction: null,
      };
    }
    case 'setLayoutMode': {
      if (state.layoutMode === action.mode) {
        return state;
      }
      return {
        ...state,
        layoutMode: action.mode,
        lastAction: null,
      };
    }
    case 'setForceLayoutMode': {
      if (state.forceLayoutMode === action.mode) {
        return state;
      }
      return {
        ...state,
        forceLayoutMode: action.mode,
        lastAction: null,
      };
    }
    case 'setShowInlineInsertion': {
      if (state.showInlineInsertion === action.show) {
        return state;
      }
      return {
        ...state,
        showInlineInsertion: action.show,
        lastAction: null,
      };
    }
    case 'setPreviewVariables': {
      if (state.previewVariables === action.enabled) {
        return state;
      }
      return {
        ...state,
        previewVariables: action.enabled,
        lastAction: null,
      };
    }
    case 'upsertVariable': {
      const next = cloneCanvasDocument(state.present);
      next.variables = { ...(next.variables ?? {}) };
      next.variables[action.key] = action.value;
      return pushToHistory(state, next);
    }
    case 'deleteVariable': {
      const next = cloneCanvasDocument(state.present);
      if (!next.variables) {
        return state;
      }
      const { [action.key]: removed, ...rest } = next.variables;
      if (typeof removed === 'undefined') {
        return state;
      }
      next.variables = rest;
      return pushToHistory(state, next);
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
  uploadFile,
  variables: dynamicVariables,
  debug = false,
}: CanvasProviderProps) {
  const [state, dispatch] = useReducer(
    canvasReducer,
    { initialDocument, debug },
    createInitialState,
  );
  const lastInitialDocumentRef = useRef<CanvasDocument | null>(null);
  const lastNotifiedDocumentRef = useRef<CanvasDocument | null>(null);
  const portalRootRef = useRef<HTMLDivElement | null>(null);

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

  useEffect(() => {
    // Only replace the current document when the upstream initialDocument actually changes.
    if (!initialDocument) {
      lastInitialDocumentRef.current = null;
      return;
    }

    if (
      lastInitialDocumentRef.current &&
      documentsAreEqual(lastInitialDocumentRef.current, initialDocument)
    ) {
      return;
    }

    lastInitialDocumentRef.current = cloneCanvasDocument(initialDocument);

    if (documentsAreEqual(state.present, initialDocument)) {
      return;
    }

    setDocument(initialDocument, { replaceHistory: true, markAsSaved: true });
  }, [initialDocument, setDocument, state.present]);

  useEffect(() => {
    if (!onDocumentChange) {
      lastNotifiedDocumentRef.current = null;
      return;
    }

    const current = state.present;
    const exportSnapshot = withCombinedClassNames(current);
    if (
      lastNotifiedDocumentRef.current &&
      documentsAreEqual(lastNotifiedDocumentRef.current, exportSnapshot)
    ) {
      return;
    }

    lastNotifiedDocumentRef.current = cloneCanvasDocument(exportSnapshot);
    onDocumentChange(exportSnapshot);
  }, [onDocumentChange, state.present]);

  const save = useCallback(() => {
    if (documentsAreEqual(state.present, state.savedSnapshot)) {
      if (state.debug) console.log('💾 Save skipped - no changes detected');
      return;
    }

    const snapshot = cloneCanvasDocument(state.present);
    if (state.debug) console.log('💾 SAVING DOCUMENT:', snapshot);
    dispatch({ type: 'save', snapshot });
    onSave?.(withCombinedClassNames(snapshot));
  }, [onSave, state.present, state.savedSnapshot, state.debug]);

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

  const selectContainer = useCallback(
    (
      container:
        | { kind: 'section'; id: string }
        | { kind: 'row'; id: string }
        | { kind: 'column'; id: string }
        | null,
    ) => {
      dispatch({ type: 'selectContainer', container });
    },
    [],
  );

  const updateBlockProps = useCallback((blockId: string, props: Record<string, unknown>) => {
    dispatch({ type: 'updateBlockProps', blockId, props });
  }, []);

  const updateContainerProps = useCallback(
    (
      target:
        | { kind: 'section'; id: string; props: Partial<CanvasSection> }
        | { kind: 'row'; id: string; props: Partial<CanvasRow> }
        | { kind: 'column'; id: string; props: Partial<CanvasColumn> },
    ) => {
      dispatch({ type: 'updateContainerProps', target });
    },
    [],
  );

  const setPreviewMode = useCallback((mode: 'desktop' | 'mobile') => {
    dispatch({ type: 'setPreviewMode', mode });
  }, []);

  const upsertVariable = useCallback((key: string, value: string) => {
    dispatch({ type: 'upsertVariable', key, value });
  }, []);

  const deleteVariable = useCallback((key: string) => {
    dispatch({ type: 'deleteVariable', key });
  }, []);

  const setLayoutMode = useCallback((mode: 'mobile' | 'desktop' | null) => {
    dispatch({ type: 'setLayoutMode', mode });
  }, []);

  const setForceLayoutMode = useCallback((mode: 'mobile' | 'desktop' | null) => {
    dispatch({ type: 'setForceLayoutMode', mode });
  }, []);

  const setShowInlineInsertion = useCallback((show: boolean) => {
    dispatch({ type: 'setShowInlineInsertion', show });
  }, []);

  const setPreviewVariables = useCallback((enabled: boolean) => {
    dispatch({ type: 'setPreviewVariables', enabled });
  }, []);

  const isMobileExperience = useMemo(() => {
    return (state.forceLayoutMode ?? state.layoutMode) === 'mobile';
  }, [state.forceLayoutMode, state.layoutMode]);

  const document = state.present;
  const isDirty = !documentsAreEqual(state.present, state.savedSnapshot);
  const selectedBlock = state.selectedBlockId
    ? findBlockById(document, state.selectedBlockId)
    : null;

  // Merge dynamic variables with document variables, but never save dynamic variables
  const mergedVariables = useMemo(() => {
    const documentVars = document.variables ?? {};
    const dynamicVars = dynamicVariables ?? {};
    // Dynamic variables override document variables
    return { ...documentVars, ...dynamicVars };
  }, [document.variables, dynamicVariables]);

  const value = useMemo<CanvasStoreValue>(
    () => ({
      document,
      isDirty,
      canUndo,
      selectedBlockId: state.selectedBlockId,
      selectedBlock,
      selectedContainer: state.selectedContainer,
      previewMode: state.previewMode,
      layoutMode: state.layoutMode,
      forceLayoutMode: state.forceLayoutMode,
      showInlineInsertion: state.showInlineInsertion,
      previewVariables: state.previewVariables,
      isMobileExperience,
      variables: mergedVariables,
      debug: state.debug,
      uploadFile,
      portalRoot: portalRootRef.current,
      updateTitle,
      setDocument,
      save,
      undo,
      selectBlock,
      selectContainer,
      updateBlockProps,
      updateContainerProps,
      setPreviewMode,
      upsertVariable,
      deleteVariable,
      setLayoutMode,
      setForceLayoutMode,
      setShowInlineInsertion,
      setPreviewVariables,
    }),
    [
      document,
      isDirty,
      canUndo,
      state.selectedBlockId,
      selectedBlock,
      state.previewMode,
      state.selectedContainer,
      state.layoutMode,
      state.forceLayoutMode,
      state.showInlineInsertion,
      state.previewVariables,
      isMobileExperience,
      mergedVariables,
      state.debug,
      uploadFile,
      updateTitle,
      setDocument,
      save,
      undo,
      selectBlock,
      selectContainer,
      updateBlockProps,
      updateContainerProps,
      setPreviewMode,
      upsertVariable,
      deleteVariable,
      setLayoutMode,
      setForceLayoutMode,
      setShowInlineInsertion,
      setPreviewVariables,
    ],
  );

  return (
    <CanvasStoreContext.Provider value={value}>
      <div style={{ position: 'relative' }}>
        <div
          ref={portalRootRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: 0,
            height: 0,
            overflow: 'visible',
            pointerEvents: 'none',
            zIndex: 99999,
          }}
          aria-hidden="true"
        />
        {children}
      </div>
    </CanvasStoreContext.Provider>
  );
}

export { CanvasStoreContext };
