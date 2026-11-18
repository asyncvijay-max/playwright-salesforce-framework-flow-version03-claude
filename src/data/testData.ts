export const EXISTING_ACCOUNT = "PW Account 20261110-181212-9b133c";

/** A different value on every call, e.g. "1763113000123-4f9a". Makes test data unique. */
export function uniqueId(): string {
  return `${Date.now()}-${Math.random().toString(16).slice(2, 6)}`;
}
