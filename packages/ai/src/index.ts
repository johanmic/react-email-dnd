/**
 * @react-email-dnd/ai
 * 
 * AI utilities and block generators for react-email-dnd.
 * Provides helper functions to create editor blocks from AI outputs,
 * ensuring compatibility with shared schema and renderer types.
 */

export {
  generateBlockId,
  generateTextBlock,
  generateHeadingBlock,
  generateButtonBlock,
  generateImageBlock,
  generateDividerBlock,
  generateCustomBlock,
  generateColumnBlock,
  generateRowBlock,
  generateSectionBlock,
  generateDocument,
  generateSimpleLayout,
  generateMultiColumnLayout,
  type BlockGeneratorOptions,
  type StructuralBlockOptions,
  type DocumentGeneratorOptions,
} from './blocks/aiGenerators';
