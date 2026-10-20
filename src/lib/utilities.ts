const NULLISH_VALUES = new Set<unknown>([undefined, null, ""]); // eslint-disable-line unicorn/no-null

export function isNullish(value: unknown): value is "" | undefined | null {
  return NULLISH_VALUES.has(value);
}
