import { Locator, expect } from "@playwright/test";

/**
 * A Salesforce number input: Amount, Probability, Quantity...
 * Currency, number and percent fields render as role "spinbutton", not "textbox".
 * Found by its label, always inside a scope (usually the popup).
 * It works like TextField but finds the field as a number input, 
 * so you can reuse it for number, currency and percent fields such as Probability or Quantity.

 */
export class NumberField {
  readonly input: Locator;

  constructor(
    scope: Locator,
    readonly label: string,
  ) {
    this.input = scope.getByRole("spinbutton", { name: label, exact: true });
  }

  async fill(value: string) {
    await this.input.fill(value);
  }

  async expectValue(value: string) {
    await expect(this.input).toHaveValue(value);
  }

  async expectError() {
    await expect(this.input).toHaveAttribute("aria-invalid", "true");
  }
}
