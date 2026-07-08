// snake_case (DB) <-> camelCase (JS) translation at the data-access boundary (CLAUDE.md §7).
const isPlainObject = (v) => v && typeof v === 'object' && !Array.isArray(v) && !(v instanceof Date);
const toCamelKey = (s) => s.replace(/_([a-z0-9])/g, (_, c) => c.toUpperCase());
const toSnakeKey = (s) => s.replace(/[A-Z]/g, (c) => '_' + c.toLowerCase());

export function toCamel(input) {
  if (Array.isArray(input)) return input.map(toCamel);
  if (isPlainObject(input)) {
    const out = {};
    for (const key of Object.keys(input)) out[toCamelKey(key)] = toCamel(input[key]);
    return out;
  }
  return input;
}

export function toSnake(input) {
  if (Array.isArray(input)) return input.map(toSnake);
  if (isPlainObject(input)) {
    const out = {};
    for (const key of Object.keys(input)) out[toSnakeKey(key)] = toSnake(input[key]);
    return out;
  }
  return input;
}
