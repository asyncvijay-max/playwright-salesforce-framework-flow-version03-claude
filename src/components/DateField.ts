import { Locator, expect } from "@playwright/test";
import { formatDate } from "../data/dates";

/**
 * A Salesforce date field: Close Date, Due Date, Birthdate...
 * A text box with a calendar. We type the date (in your locale's format) and press Tab.
 * Found by its label, always inside a scope (usually the popup).
 */
export class DateField {
  readonly input: Locator;

  constructor(
    scope: Locator,
    readonly label: string,
  ) {
    this.input = scope.getByRole("textbox", { name: label, exact: true });
  }

  async fill(date: Date) {
    await this.input.fill(formatDate(date));
    await this.input.press("Tab"); // accept the value and close the calendar (NOT Escape: that can close the popup)
  }

  async expectValue(date: Date) {
    await expect(this.input).toHaveValue(formatDate(date));
  }
}
