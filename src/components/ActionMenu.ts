import { Locator, Page, expect } from "@playwright/test";

/**
 * The action buttons at the top of a record page (Edit, Clone, Delete, Change Owner...),
 * plus the "Show more actions" menu. An action may be a button OR a menu item,
 * depending on the page layout and window width: run() handles both.
 */
export class ActionMenu {
  readonly root: Locator;
  readonly moreButton: Locator;

  constructor(private readonly page: Page) {
    this.root = page.locator("records-highlights2").filter({ visible: true }); // ⚠ confirm the tag in your org
    this.moreButton = this.root.getByRole("button", {
      name: /^Show more actions/,
    });
  }

  async run(action: string) {
    await expect(this.moreButton).toBeVisible(); // wait until the panel has finished loading

    const button = this.root.getByRole("button", { name: action, exact: true });
    if (await button.isVisible()) {
      await button.click();
      return;
    }

    await this.moreButton.click();
    await this.page
      .getByRole("menuitem", { name: action, exact: true })
      .click();
  }
}
