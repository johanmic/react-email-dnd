import './styles.css';

export {
  buildCustomBlockRegistry,
  buttonBlockPropsSchema,
  buttonBlockSchema,
  canvasColumnSchema,
  canvasContentBlockSchema,
  canvasDocumentSchema,
  canvasRowSchema,
  canvasSectionSchema,
  customBlockPropsSchema,
  customBlockSchema,
  dividerBlockPropsSchema,
  dividerBlockSchema,
  documentMetaSchema,
  headingBlockPropsSchema,
  headingBlockSchema,
  imageBlockPropsSchema,
  imageBlockSchema,
  isCanvasDocument,
  parseCanvasDocument,
  safeParseCanvasDocument,
  textBlockPropsSchema,
  textBlockSchema,
  validateCanvasDocument,
} from '@react-email-dnd/shared';

export type {
  BlockDefinition,
  ButtonBlock,
  ButtonBlockProps,
  CanvasBlockBase,
  CanvasColumn,
  CanvasContentBlock,
  CanvasContentType,
  CanvasDocument,
  CanvasDocumentValidationResult,
  CanvasRow,
  CanvasSection,
  ComponentLibrary,
  CustomBlock,
  CustomBlockProps,
  CustomBlockDefinition,
  CustomBlockRegistry,
  DividerBlock,
  DividerBlockProps,
  DocumentMeta,
  HeadingBlock,
  HeadingBlockProps,
  IdentifiedNode,
  ImageBlock,
  ImageBlockProps,
  ReactEmailDnd,
  ReactEmailDndDocument,
  StructurePaletteItem,
  TextBlock,
  TextBlockProps,
} from '@react-email-dnd/shared';

export * from './components/button';
export * from './components/divider';
export * from './components/heading';
export * from './components/image';
export * from './components/text';
export * from './components/Canvas';
export * from './components/Main';
export * from './components/Sidebar';
export * from './components/SidebarItem';
export * from './components/CanvasProvider';
export { Header } from './components/Header';
export { EmailEditor } from './components/EmailEditor';
export type { EmailEditorProps, HeaderItem } from './components/EmailEditor';
export * from './components/PropertiesPanel';

export type { CustomBlockPropEditors, ColorOption } from './components/PropertiesPanel';

export type { PaddingOptionEntry } from './utils/padding';
export { normalizePaddingOptions, getDefaultPaddingOptionEntries } from './utils/padding';

export * from './hooks/useCanvasStore';

export * from './utils/email-renderer';
export * from './utils/document';
export * from './utils/drag-drop';
export * from './utils/json';
export * from './utils/block-library';
