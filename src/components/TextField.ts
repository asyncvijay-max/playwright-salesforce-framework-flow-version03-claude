import { Locator, expect } from "@playwright/test";

/**
 * A Salesforce text input: First Name, Last Name, Email, Phone, Title...
 * Found by its label, always inside a scope (usually the popup).
 */
export class TextField {
  readonly input: Locator;

  constructor(
    scope: Locator,
    readonly label: string,
  ) {
    this.input = scope.getByRole("textbox", { name: label, exact: true });
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
