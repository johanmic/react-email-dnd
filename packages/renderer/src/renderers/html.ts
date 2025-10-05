import type { CanvasContentBlock, CanvasDocument } from '@react-email-dnd/shared';
import { substitute } from '../utils';
import type { RenderContext, RendererOptions } from '../types';

function renderBlock(block: CanvasContentBlock, context: RenderContext): string {
  switch (block.type) {
    case 'heading':
      return `<h2>${substitute(block.props.content, context) ?? ''}</h2>`;
    case 'text':
      return `<p>${substitute(block.props.content, context) ?? ''}</p>`;
    case 'button':
      return `<a href="${block.props.href ?? '#'}" style="display:inline-block;padding:12px 24px;background:${
        block.props.backgroundColor ?? '#2563eb'
      };color:${block.props.color ?? '#fff'};border-radius:${block.props.borderRadius ?? 6}px;">${
        substitute(block.props.label, context) ?? block.props.label
      }</a>`;
    case 'image':
      return `<img src="${substitute(block.props.src, context) ?? block.props.src}" alt="${
        substitute(block.props.alt, context) ?? ''
      }" />`;
    case 'divider':
      return `<hr style="margin:${block.props.margin ?? '16px 0'};border-width:${block.props.thickness ?? 1}px;border-color:${
        block.props.color ?? '#e5e7eb'
      };" />`;
    case 'custom':
      return `<div data-custom-block="${block.props.componentName}"></div>`;
    default:
      return '';
  }
}

export function renderHtml(
  document: CanvasDocument,
  context: RenderContext,
  options: RendererOptions,
): string {
  const indent = options.indent ?? 2;
  const lines: string[] = ['<div class="red-outer">'];

  document.sections.forEach((section) => {
    lines.push(`  <section data-id="${section.id}">`);

    section.rows.forEach((row) => {
      lines.push(`    <div class="red-row" data-id="${row.id}">`);

      row.columns.forEach((column) => {
        lines.push(`      <div class="red-column" data-id="${column.id}">`);

        column.blocks.forEach((block) => {
          const rendered = renderBlock(block, context);
          if (rendered) {
            lines.push(`        ${rendered}`);
          }
        });

        lines.push('      </div>');
      });

      lines.push('    </div>');
    });

    lines.push('  </section>');
  });

  lines.push('</div>');

  if (indent <= 0) {
    return lines.join('\n');
  }

  return lines
    .map((line) => {
      const trimmed = line.trimStart();
      const depth = (line.length - trimmed.length) / 2;
      return ' '.repeat(depth * indent) + trimmed;
    })
    .join('\n');
}
