import type { CanvasDocument } from '../types/schema';

/**
 * Validates if a JSON object is a valid CanvasDocument
 */
export function isValidCanvasDocument(json: unknown): json is CanvasDocument {
  if (!json || typeof json !== 'object') {
    return false;
  }

  const doc = json as Record<string, unknown>;

  // Check required fields
  if (typeof doc.version !== 'number' || !doc.meta || !Array.isArray(doc.sections)) {
    return false;
  }

  // Check meta object
  const meta = doc.meta as Record<string, unknown>;
  if (typeof meta.title !== 'string') {
    return false;
  }

  // Check sections array
  const sections = doc.sections as unknown[];
  for (const section of sections) {
    if (!isValidSection(section)) {
      return false;
    }
  }

  return true;
}

/**
 * Validates if an object is a valid CanvasSection
 */
function isValidSection(section: unknown): boolean {
  if (!section || typeof section !== 'object') {
    return false;
  }

  const s = section as Record<string, unknown>;

  if (s.type !== 'section' || typeof s.id !== 'string' || !Array.isArray(s.rows)) {
    return false;
  }

  // Check rows
  for (const row of s.rows as unknown[]) {
    if (!isValidRow(row)) {
      return false;
    }
  }

  return true;
}

/**
 * Validates if an object is a valid CanvasRow
 */
function isValidRow(row: unknown): boolean {
  if (!row || typeof row !== 'object') {
    return false;
  }

  const r = row as Record<string, unknown>;

  if (r.type !== 'row' || typeof r.id !== 'string' || !Array.isArray(r.columns)) {
    return false;
  }

  // Check columns
  for (const column of r.columns as unknown[]) {
    if (!isValidColumn(column)) {
      return false;
    }
  }

  return true;
}

/**
 * Validates if an object is a valid CanvasColumn
 */
function isValidColumn(column: unknown): boolean {
  if (!column || typeof column !== 'object') {
    return false;
  }

  const c = column as Record<string, unknown>;

  if (c.type !== 'column' || typeof c.id !== 'string' || !Array.isArray(c.blocks)) {
    return false;
  }

  // Check blocks
  for (const block of c.blocks as unknown[]) {
    if (!isValidBlock(block)) {
      return false;
    }
  }

  return true;
}

/**
 * Validates if an object is a valid CanvasContentBlock
 */
function isValidBlock(block: unknown): boolean {
  if (!block || typeof block !== 'object') {
    return false;
  }

  const b = block as Record<string, unknown>;

  if (typeof b.type !== 'string' || typeof b.id !== 'string' || !b.props) {
    return false;
  }

  // Check if it's a valid block type
  const validTypes = ['button', 'text', 'heading', 'divider', 'image', 'custom'];
  if (!validTypes.includes(b.type)) {
    return false;
  }

  return true;
}

/**
 * Parses a JSON string into a CanvasDocument with validation
 */
export function parseCanvasDocument(jsonString: string): CanvasDocument {
  try {
    const parsed = JSON.parse(jsonString);

    if (!isValidCanvasDocument(parsed)) {
      throw new Error('Invalid CanvasDocument structure');
    }

    return parsed;
  } catch (error) {
    throw new Error(
      `Failed to parse CanvasDocument: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

/**
 * Serializes a CanvasDocument to a JSON string
 */
export function serializeCanvasDocument(document: CanvasDocument): string {
  return JSON.stringify(document, null, 2);
}
