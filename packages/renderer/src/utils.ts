import type { CanvasContentBlock } from '@react-email-dnd/shared';
import type { RenderContext } from './types';

const PLACEHOLDER_PATTERN = /\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g;

export function substitute(value: string | undefined, context: RenderContext): string | undefined {
  if (!value) return value;
  if (!context.variables) return value;

  return value.replace(PLACEHOLDER_PATTERN, (_, key: string) => {
    if (!context.variables) return `{{${key}}}`;
    return Object.prototype.hasOwnProperty.call(context.variables, key)
      ? context.variables[key] ?? ''
      : `{{${key}}}`;
  });
}

export function describeBlock(block: CanvasContentBlock, context: RenderContext): string {
  switch (block.type) {
    case 'text':
      return substitute(block.props.content, context) ?? '';
    case 'heading':
      return substitute(block.props.content, context) ?? '';
    case 'button':
      return `${block.props.label} (${block.props.href ?? '#'})`;
    case 'image':
      return block.props.alt ?? block.props.src;
    case 'divider':
      return '——';
    case 'custom':
      return block.props.componentName;
    default:
      return block.type;
  }
}

export function indentLines(lines: string[], indentSize: number): string {
  const pad = ' '.repeat(indentSize);
  return lines
    .map((line) => (line.length ? `${pad}${line}` : line))
    .join('\n');
}
