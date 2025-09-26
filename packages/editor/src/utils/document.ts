import type { CanvasDocument, CanvasSection } from '../types/schema';

const DEFAULT_TITLE = 'Untitled email';

function generateId(prefix: string): string {
  const globalCrypto =
    typeof globalThis !== 'undefined'
      ? (globalThis as { crypto?: { randomUUID?: () => string } }).crypto
      : undefined;

  const randomSuffix =
    globalCrypto && typeof globalCrypto.randomUUID === 'function'
      ? globalCrypto.randomUUID()
      : Math.random().toString(36).slice(2, 10);

  return `${prefix}-${randomSuffix}`;
}

export function createEmptyDocument(title: string = DEFAULT_TITLE): CanvasDocument {
  return {
    version: 1,
    meta: { title },
    sections: [],
  };
}

export function createEmptySection(): CanvasSection {
  return {
    id: generateId('section'),
    type: 'section',
    rows: [],
  };
}

export function cloneCanvasDocument(document: CanvasDocument): CanvasDocument {
  return JSON.parse(JSON.stringify(document)) as CanvasDocument;
}

export function documentsAreEqual(a: CanvasDocument, b: CanvasDocument): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}
