import { createElement, Fragment, type ReactNode } from 'react';
import { pathOr } from 'ramda';
import type { CanvasContentBlock } from '@react-email-dnd/shared';

const TEMPLATE_VARIABLE_PATTERN = /\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g;

export type VariableMatch = {
  key: string;
  defined: boolean;
};

export function replaceVariables(
  content: string,
  variables: Record<string, unknown> | undefined,
  daisyui: boolean = false,
): ReactNode {
  if (!content || !variables) return content;

  const parts: ReactNode[] = [];
  let lastIndex = 0;
  const matches = content.matchAll(TEMPLATE_VARIABLE_PATTERN);
  let hasMatch = false;

  for (const match of matches) {
    hasMatch = true;
    const [fullMatch, key] = match;
    const index = match.index!;

    // Push text before the match
    if (index > lastIndex) {
      parts.push(content.slice(lastIndex, index));
    }

    // Check if variable exists and get value
    // We use undefined as default to distinguish between "missing" and "empty string"
    const val = pathOr(undefined, key.split('.'), variables);

    if (val !== undefined) {
      // Matched
      const displayValue = String(val);
      parts.push(
        createElement(
          'span',
          {
            key: `var-${index}`,
            className: daisyui ? 'text-success font-medium' : 'text-green-600 font-medium',
          },
          displayValue,
        ),
      );
    } else {
      // Not matched
      parts.push(
        createElement(
          'span',
          {
            key: `miss-${index}`,
            className: daisyui ? 'text-warning font-medium' : 'text-orange-500 font-medium',
          },
          fullMatch,
        ),
      );
    }

    lastIndex = index + fullMatch.length;
  }

  if (!hasMatch) {
    return content;
  }

  if (lastIndex < content.length) {
    parts.push(content.slice(lastIndex));
  }

  if (parts.length === 0) return content;
  if (parts.length === 1 && typeof parts[0] === 'string') return parts[0];

  return createElement(Fragment, {}, ...parts);
}

export function getNestedValue(source: unknown, path: string): unknown {
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

export function substituteString(
  value: string | undefined,
  variables: Record<string, unknown> | undefined,
): string | undefined {
  if (!value) return value;
  if (!variables) return value;

  return value.replace(TEMPLATE_VARIABLE_PATTERN, (_, key: string) => {
    const val = getNestedValue(variables, key);
    if (val === undefined || val === null) {
      return `{{${key}}}`;
    }
    return String(val);
  });
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
