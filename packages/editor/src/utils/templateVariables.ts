import type { CanvasContentBlock } from '@react-email-dnd/shared';

const TEMPLATE_VARIABLE_PATTERN = /\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g;

export type VariableMatch = {
  key: string;
  defined: boolean;
};

function getNestedValue(source: unknown, path: string): unknown {
  if (!source || typeof source !== 'object') {
    return undefined;
  }

  const parts = path.split('.');
  let current: unknown = source;

  for (const part of parts) {
    if (current == null || typeof current !== 'object') {
      return undefined;
    }

    if (Array.isArray(current)) {
      const index = Number.parseInt(part, 10);
      if (Number.isNaN(index)) {
        return undefined;
      }
      current = current[index];
    } else {
      current = (current as Record<string, unknown>)[part];
    }
  }

  return current;
}

function variableExists(
  variables: Record<string, unknown> | undefined,
  key: string,
): boolean {
  if (!variables) {
    return false;
  }

  const nested = getNestedValue(variables, key);
  if (nested !== undefined) {
    return true;
  }

  return Object.prototype.hasOwnProperty.call(variables, key);
}

export function extractVariableMatches(
  value: string | undefined,
  variables: Record<string, unknown> | undefined,
): VariableMatch[] {
  if (!value) {
    return [];
  }

  const matches = new Map<string, VariableMatch>();

  for (const match of value.matchAll(TEMPLATE_VARIABLE_PATTERN)) {
    const key = match[1]?.trim();
    if (!key || matches.has(key)) {
      continue;
    }
    matches.set(key, {
      key,
      defined: variableExists(variables, key),
    });
  }

  return Array.from(matches.values());
}

function visitValues(value: unknown, onMatch: (content: string) => void) {
  if (typeof value === 'string') {
    onMatch(value);
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((entry) => visitValues(entry, onMatch));
    return;
  }

  if (value && typeof value === 'object') {
    Object.values(value).forEach((entry) => visitValues(entry, onMatch));
  }
}

export function collectBlockVariableMatches(
  block: CanvasContentBlock,
  variables: Record<string, unknown> | undefined,
): VariableMatch[] {
  const matches = new Map<string, VariableMatch>();

  visitValues(block.props, (content) => {
    const contentMatches = extractVariableMatches(content, variables);
    contentMatches.forEach((match) => {
      const existing = matches.get(match.key);
      if (!existing || (match.defined && !existing.defined)) {
        matches.set(match.key, match);
      }
    });
  });

  return Array.from(matches.values());
}
