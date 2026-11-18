import { Locator, expect } from "@playwright/test";

/**
 * A Salesforce lookup: Account Name, Contact Name, Owner...
 * You type a record's name, then pick it from the search results.
 * Found by its label, always inside a scope (usually the popup).
 */
export class Lookup {
  readonly field: Locator;

  constructor(
    private readonly scope: Locator,
    readonly label: string,
  ) {
    this.field = scope.getByRole("combobox", { name: label, exact: true });
  }

  option(recordName: string): Locator {
    return this.scope
      .getByRole("option")
      .filter({ hasText: recordName })
      .filter({ hasNotText: "Show more results" });
  }

  async select(recordName: string) {
    // Salesforce only searches on real key presses: fill() pastes the text and no results appear.
    await this.field.click();
    await this.field.pressSequentially(recordName, { delay: 20 });
    await this.option(recordName).click();
    await this.expectValue(recordName);
  }

  async expectValue(recordName: string) {
    await expect(this.field).toHaveValue(recordName);
  }
}
