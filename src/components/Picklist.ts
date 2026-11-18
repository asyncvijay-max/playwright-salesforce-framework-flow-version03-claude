import { Locator, expect } from "@playwright/test";

/**
 * A Salesforce single-select picklist: Salutation, Lead Source, Stage, Type...
 * Found by its label, always inside a scope (usually the popup).
 */
export class Picklist {
  readonly field: Locator;

  constructor(
    private readonly scope: Locator,
    readonly label: string,
  ) {
    this.field = scope.getByRole("combobox", { name: label, exact: true });
  }

  option(value: string): Locator {
    return this.scope.getByRole("option", { name: value, exact: true });
  }

  async select(value: string) {
    const option = this.option(value);
    // Salesforce sometimes ignores the first click (e.g. right after another picklist closes),
    // so keep clicking until the list is really open. Options exist in the page even when closed.
    await expect(async () => {
      if ((await this.field.getAttribute("aria-expanded")) !== "true") {
        await this.field.click();
      }
      await expect(option).toBeVisible({ timeout: 2_000 });
    }).toPass({ timeout: 15_000 });
    await option.click();
    await this.expectValue(value);
  }

  async expectValue(value: string) {
    await expect(this.field).toContainText(value);
  }
}
