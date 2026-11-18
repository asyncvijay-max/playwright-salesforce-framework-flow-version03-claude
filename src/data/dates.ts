import { config } from "dotenv";

config();

/**
 * Your Salesforce USER's locale (avatar → Settings → Language & Time Zone).
 * 'en-GB' → 14/12/2026   ·   'en-US' → 12/14/2026
 * Set SF_LOCALE in your .env file if yours is different.
 */
const LOCALE = process.env.SF_LOCALE ?? "en-GB";

/** Turns a Date into text in the format Salesforce expects for your locale. */
export function formatDate(date: Date): string {
  return date.toLocaleDateString(LOCALE);
}

/** A date n days from today (use a negative n for the past). Keeps test dates from going stale. */
export function daysFromNow(n: number): Date {
  const date = new Date();
  date.setDate(date.getDate() + n);
  return date;
}
