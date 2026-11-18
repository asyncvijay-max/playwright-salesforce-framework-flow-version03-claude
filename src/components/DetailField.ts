import { Locator, Page, expect } from "@playwright/test";

/**
 * A read-only field on a record's Details tab: Name, Account Name, Email...
 * Found by its label. Only the Details layout is searched (not the highlights panel).
 */
export class DetailField {
  readonly root: Locator;

  constructor(
    page: Page,
    readonly label: string,
  ) {
    this.root = page
      .locator(`records-record-layout-item[field-label="${label}"]`) // ⚠ check this tag + attribute in your org
      .filter({ visible: true });
  }

  async expectValue(value: string) {
    await expect(this.root).toContainText(value);
  }
}
