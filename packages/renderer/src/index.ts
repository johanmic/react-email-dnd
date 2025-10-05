import type { RenderRequest, RenderResult, RendererOptions } from './types';
import { renderHtml } from './renderers/html';
import { renderPlainText } from './renderers/plain-text';
import { renderReact } from './renderers/react';
import { renderReactText } from './renderers/react-text';
import type { RenderContext } from './types';

function createContext(options: RendererOptions): RenderContext {
  return {
    variables: options.variables,
  };
}

export function renderDocument({ document, options }: RenderRequest): RenderResult {
  const context = createContext(options);

  switch (options.format) {
    case 'react':
      return {
        format: 'react',
        node: renderReact(document, context, options),
      };
    case 'react-text':
      return {
        format: 'react-text',
        code: renderReactText(document, context, options),
      };
    case 'html':
      return {
        format: 'html',
        html: renderHtml(document, context, options),
      };
    case 'plain-text':
      return {
        format: 'plain-text',
        text: renderPlainText(document, context, options),
      };
    default: {
      const exhaustive: never = options.format;
      throw new Error(`Unsupported render format: ${exhaustive}`);
    }
  }
}

export * from './types';
