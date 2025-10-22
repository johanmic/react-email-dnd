import type { Padding } from '@react-email-dnd/shared';

type PaddingRecord = Record<string, string | number>;

const BREAKPOINT_PREFIXES: Record<string, string> = {
  base: '',
  default: '',
  small: 'sm',
  sm: 'sm',
  mobile: 'sm',
  medium: 'md',
  md: 'md',
  tablet: 'md',
  large: 'lg',
  lg: 'lg',
  desktop: 'lg',
  xl: 'xl',
  '2xl': '2xl',
};

const PADDING_VALUE_ORDER = [
  'base',
  'default',
  'all',
  'mobile',
  'small',
  'sm',
  'tablet',
  'medium',
  'md',
  'desktop',
  'large',
  'lg',
  'xl',
  '2xl',
] as const;

export interface PaddingOptionEntry {
  id: string;
  label: string;
  value: Padding;
}

type PaddingOptionSource =
  | Record<string, Padding>
  | PaddingOptionEntry[];

const DEFAULT_PADDING_OPTION_MAP: Record<string, Padding> = {
  none: '0',
  xs: '2',
  sm: '4',
  md: '6',
  lg: '8',
  xl: '10',
  button: '12px 24px',
};

const DEFAULT_PADDING_OPTION_ENTRIES: PaddingOptionEntry[] = Object.entries(
  DEFAULT_PADDING_OPTION_MAP,
).map(([key, value]) => ({
  id: key,
  label: humanizeKey(key),
  value,
}));

function humanizeKey(value: string): string {
  return value
    .replace(/[_-]+/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\s+/g, ' ')
    .replace(/^\s+|\s+$/g, '')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function normalizePaddingOptions(
  source?: PaddingOptionSource,
): PaddingOptionEntry[] {
  if (!source) {
    return getDefaultPaddingOptionEntries();
  }

  if (Array.isArray(source)) {
    return source.map((entry) => ({
      id: entry.id,
      label: entry.label,
      value: entry.value,
    }));
  }

  return Object.entries(source).map(([key, value]) => ({
    id: key,
    label: humanizeKey(key),
    value,
  }));
}

export function getDefaultPaddingOptionEntries(): PaddingOptionEntry[] {
  return DEFAULT_PADDING_OPTION_ENTRIES.map((entry) => ({ ...entry }));
}

function isRecordPadding(value: Padding): value is PaddingRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function trimTrailingZeros(value: number): string {
  if (Number.isInteger(value)) {
    return `${value}`;
  }
  return value.toString().replace(/\.0+$/, '').replace(/(\.\d*?)0+$/, '$1');
}

function numberToPx(value: number): string {
  const pxValue = value * 4;
  if (Number.isInteger(pxValue)) {
    return `${pxValue}px`;
  }
  const rounded = parseFloat(pxValue.toFixed(3));
  return `${trimTrailingZeros(rounded)}px`;
}

function parseNumericString(value: string): number | undefined {
  const normalized = value.trim();
  if (!normalized) {
    return undefined;
  }
  const numeric = Number(normalized);
  if (Number.isNaN(numeric)) {
    return undefined;
  }
  return numeric;
}

function sanitizeArbitraryValue(value: string): string {
  return value.trim().replace(/\s+/g, '_').replace(/\]/g, '\\]').replace(/\[/g, '\\[');
}

type SpacingShorthand = 'p' | 'm';

function toTailwindSpacingClass(value: string | number, shorthand: SpacingShorthand): string | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return `${shorthand}-${trimTrailingZeros(value)}`;
  }

  const trimmed = typeof value === 'string' ? value.trim() : '';
  if (!trimmed) {
    return undefined;
  }

  if (trimmed.startsWith('p-') || trimmed.startsWith('m-')) {
    return trimmed;
  }

  const numericValue = parseNumericString(trimmed);
  if (numericValue != null) {
    return `${shorthand}-${trimTrailingZeros(numericValue)}`;
  }

  return `${shorthand}-[${sanitizeArbitraryValue(trimmed)}]`;
}

function normalizeArbitraryToCss(value: string, shorthand: SpacingShorthand): string {
  const arbitraryMatch = value.match(new RegExp(`^${shorthand}-\\[(.*)]$`));
  if (!arbitraryMatch) {
    return value;
  }

  return arbitraryMatch[1].replace(/\\\]/g, ']').replace(/\\\[/g, '[').replace(/_/g, ' ');
}

function toCssSpacingValue(value: string | number, shorthand: SpacingShorthand): string {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return numberToPx(value);
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return '';
  }

  if (trimmed.startsWith('p-') || trimmed.startsWith('m-')) {
    const numericMatch = trimmed.match(/^[pm]-([0-9]+(?:\.[0-9]+)?)$/);
    if (numericMatch) {
      const num = Number(numericMatch[1]);
      if (!Number.isNaN(num)) {
        return numberToPx(num);
      }
    }
    return normalizeArbitraryToCss(trimmed, shorthand);
  }

  const numericValue = parseNumericString(trimmed);
  if (numericValue != null) {
    return numberToPx(numericValue);
  }

  return trimmed;
}

function pickBasePaddingValue(padding: PaddingRecord): string | number | undefined {
  for (const key of PADDING_VALUE_ORDER) {
    if (key in padding) {
      return padding[key];
    }
  }

  const firstEntry = Object.values(padding)[0];
  return firstEntry;
}

function resolveSpacingClasses(value: Padding | undefined, shorthand: SpacingShorthand): string[] {
  if (!value) {
    return [];
  }

  if (typeof value === 'string') {
    const className = toTailwindSpacingClass(value, shorthand);
    return className ? [className] : [];
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return [`${shorthand}-${trimTrailingZeros(value)}`];
  }

  if (!isRecordPadding(value)) {
    return [];
  }

  const resolved: string[] = [];
  const seen = new Set<string>();

  for (const [key, rawValue] of Object.entries(value)) {
    const className = toTailwindSpacingClass(rawValue, shorthand);
    if (!className) {
      continue;
    }

    const prefix = BREAKPOINT_PREFIXES[key] ?? key.replace(/[^a-z0-9:]/gi, '');
    const fullClassName = prefix ? `${prefix}:${className}` : className;
    if (seen.has(fullClassName)) {
      continue;
    }
    seen.add(fullClassName);
    resolved.push(fullClassName);
  }

  return resolved;
}

function resolveSpacingStyle(value: Padding | undefined, shorthand: SpacingShorthand): string | undefined {
  if (!value) {
    return undefined;
  }

  if (typeof value === 'string') {
    const cssValue = toCssSpacingValue(value, shorthand);
    return cssValue || undefined;
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return numberToPx(value);
  }

  if (!isRecordPadding(value)) {
    return undefined;
  }

  const baseValue = pickBasePaddingValue(value);
  if (baseValue == null) {
    return undefined;
  }

  const cssValue = toCssSpacingValue(baseValue, shorthand);
  return cssValue || undefined;
}

export function resolvePaddingClasses(padding: Padding | undefined): string[] {
  return resolveSpacingClasses(padding, 'p');
}

export function resolvePaddingStyle(padding: Padding | undefined): string | undefined {
  return resolveSpacingStyle(padding, 'p');
}

export function resolveMarginClasses(margin: Padding | undefined): string[] {
  return resolveSpacingClasses(margin, 'm');
}

export function resolveMarginStyle(margin: Padding | undefined): string | undefined {
  return resolveSpacingStyle(margin, 'm');
}

function normalizePaddingRecord(input: unknown): PaddingRecord | undefined {
  if (typeof input !== 'object' || input === null || Array.isArray(input)) {
    return undefined;
  }

  const entries = Object.entries(input).reduce<PaddingRecord>((acc, [rawKey, rawValue]) => {
    const key = String(rawKey).trim();
    if (!key) {
      return acc;
    }
    if (typeof rawValue === 'number' && Number.isFinite(rawValue)) {
      acc[key] = rawValue;
      return acc;
    }
    if (typeof rawValue === 'string') {
      const trimmed = rawValue.trim();
      if (!trimmed) {
        return acc;
      }
      const numeric = parseNumericString(trimmed);
      acc[key] = numeric ?? trimmed;
    }
    return acc;
  }, {});

  if (Object.keys(entries).length === 0) {
    return undefined;
  }

  return entries;
}

export function parsePaddingInput(input: string): Padding | undefined {
  const trimmed = input.trim();
  if (!trimmed) {
    return undefined;
  }

  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    try {
      const parsed = JSON.parse(trimmed);
      const normalized = normalizePaddingRecord(parsed);
      if (normalized) {
        return normalized;
      }
    } catch (error) {
      console.warn('Failed to parse padding JSON input:', error);
      return trimmed;
    }
  }

  if (trimmed.includes(':')) {
    const parts = trimmed.split(',');
    const result: PaddingRecord = {};
    for (const part of parts) {
      const [rawKey, ...rawValueParts] = part.split(':');
      if (!rawKey || rawValueParts.length === 0) {
        continue;
      }
      const key = rawKey.trim();
      const valueString = rawValueParts.join(':').trim();
      if (!key || !valueString) {
        continue;
      }
      const numeric = parseNumericString(valueString);
      result[key] = numeric ?? valueString;
    }
    if (Object.keys(result).length > 0) {
      return result;
    }
  }

  return trimmed;
}

export function formatPaddingForInput(padding: Padding | undefined): string {
  if (!padding) {
    return '';
  }

  if (typeof padding === 'string') {
    return padding;
  }

  if (!isRecordPadding(padding)) {
    return '';
  }

  return Object.entries(padding)
    .map(([key, value]) => `${key}:${typeof value === 'number' ? trimTrailingZeros(value) : value}`)
    .join(', ');
}

function normalizePaddingForComparison(padding?: Padding): string {
  if (padding == null) {
    return '';
  }

  if (typeof padding === 'string') {
    return padding.trim();
  }

  if (typeof padding === 'number') {
    return trimTrailingZeros(padding);
  }

  const sortedEntries = Object.entries(padding)
    .map(([key, value]) => [key, value] as const)
    .sort(([a], [b]) => (a > b ? 1 : a < b ? -1 : 0));

  return JSON.stringify(
    sortedEntries.map(([key, value]) => [key, typeof value === 'string' ? value.trim() : value]),
  );
}

export function isPaddingEqual(a?: Padding, b?: Padding): boolean {
  return normalizePaddingForComparison(a) === normalizePaddingForComparison(b);
}

export function paddingToDisplay(padding?: Padding): string {
  if (padding == null) {
    return 'None';
  }

  if (typeof padding === 'string') {
    return padding;
  }

  if (typeof padding === 'number') {
    return trimTrailingZeros(padding);
  }

  return Object.entries(padding)
    .map(([key, value]) => `${key}: ${value}`)
    .join(', ');
}
