import type { CanvasDocument } from '@react-email-dnd/shared';
import { substitute } from '../utils';
import type { RenderContext, RendererOptions } from '../types';

type Line = { depth: number; content: string };

const COMPONENT_IMPORTS = [
  'Html',
  'Head',
  'Preview',
  'Body',
  'Container',
  'Section',
  'Row',
  'Column',
  'Heading',
  'Text',
  'Button',
  'Hr',
  'Img',
];

function pushLine(lines: Line[], depth: number, content: string) {
  lines.push({ depth, content });
}

function escapeForAttribute(value: string | undefined): string {
  if (!value) return '';
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}

function escapeForText(value: string | undefined): string {
  if (!value) return '';
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function renderReactText(
  document: CanvasDocument,
  context: RenderContext,
  options: RendererOptions,
): string {
  const indent = options.indent ?? 2;
  const componentName = options.componentName ?? 'EmailTemplate';
  const previewText = document.meta.description ?? document.meta.title ?? 'Preview text';
  const lines: Line[] = [];

  pushLine(lines, 0, `import { ${COMPONENT_IMPORTS.join(', ')} } from '@react-email/components';`);
  pushLine(lines, 0, '');
  pushLine(lines, 0, `export function ${componentName}() {`);
  pushLine(lines, 1, 'return (');
  pushLine(lines, 2, '<Html>');
  pushLine(lines, 3, '<Head />');
  pushLine(lines, 3, `<Preview>${escapeForText(substitute(previewText, context))}</Preview>`);
  pushLine(lines, 3, '<Body>');
  pushLine(lines, 4, '<Container>');

  document.sections.forEach((section) => {
    pushLine(lines, 5, '<Section>');

    section.rows.forEach((row) => {
      pushLine(lines, 6, '<Row>');

      row.columns.forEach((column) => {
        const width = column.width != null ? ` width={${JSON.stringify(column.width)}}` : '';
        pushLine(lines, 7, `<Column${width}>`);

        column.blocks.forEach((block) => {
          switch (block.type) {
            case 'heading': {
              const tag = block.props.as ?? 'h2';
              const content = escapeForText(substitute(block.props.content, context));
              pushLine(lines, 8, `<Heading as="${tag}">${content}</Heading>`);
              break;
            }
            case 'text': {
              const content = escapeForText(substitute(block.props.content, context));
              pushLine(lines, 8, `<Text>${content}</Text>`);
              break;
            }
            case 'button': {
              const label = escapeForText(substitute(block.props.label, context) ?? block.props.label);
              const href = escapeForAttribute(block.props.href);
              pushLine(lines, 8, `<Button href="${href || '#'}">${label}</Button>`);
              break;
            }
            case 'image': {
              const src = escapeForAttribute(substitute(block.props.src, context) ?? block.props.src);
              const alt = escapeForAttribute(substitute(block.props.alt, context));
              const widthAttr =
                block.props.width != null ? ` width={${JSON.stringify(block.props.width)}}` : '';
              const heightAttr =
                block.props.height != null ? ` height={${JSON.stringify(block.props.height)}}` : '';
              pushLine(
                lines,
                8,
                `<Img src="${src}" alt="${alt}"${widthAttr}${heightAttr} />`,
              );
              break;
            }
            case 'divider': {
              pushLine(lines, 8, '<Hr />');
              break;
            }
            case 'custom': {
              pushLine(lines, 8, `{/* Custom block: ${block.props.componentName} */}`);
              break;
            }
            default:
              break;
          }
        });

        pushLine(lines, 7, '</Column>');
      });

      pushLine(lines, 6, '</Row>');
    });

    pushLine(lines, 5, '</Section>');
  });

  pushLine(lines, 4, '</Container>');
  pushLine(lines, 3, '</Body>');
  pushLine(lines, 2, '</Html>');
  pushLine(lines, 1, ');');
  pushLine(lines, 0, '}');

  return lines
    .map(({ depth, content }) => {
      if (content === '') return '';
      return `${' '.repeat(depth * indent)}${content}`;
    })
    .join('\n');
}
