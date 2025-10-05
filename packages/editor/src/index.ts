import './styles.css';

export {
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
export * from './components/Header';
export * from './components/EmailEditor';
export * from './components/PropertiesPanel';

export * from './hooks/useCanvasStore';

export * from './utils/email-renderer';
export * from './utils/document';
export * from './utils/drag-drop';
export * from './utils/json';
