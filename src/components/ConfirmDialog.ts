import { Locator, Page, expect } from '@playwright/test';

/**
 * An "Are you sure?" popup: Delete Account, Delete Contact, Remove...
 * No fields: a title, a message, Cancel and a confirm button named after the action.
 * Salesforce uses role "dialog" or "alertdialog" for these, so both are accepted.
 */
export class ConfirmDialog {
  readonly root: Locator;
  readonly cancelButton: Locator;

  constructor(page: Page, readonly title: string) {
    this.root = page
      .getByRole('dialog', { name: title })
      .or(page.getByRole('alertdialog', { name: title }));   // ⚠ confirm which role your org uses
    this.cancelButton = this.root.getByRole('button', { name: 'Cancel', exact: true });
  }

  async expectOpen() {
    await expect(this.root).toBeVisible();
  }

  async confirm(buttonName: string) {
    await this.root.getByRole('button', { name: buttonName, exact: true }).click();
    await expect(this.root).toBeHidden();
  }

  async cancel() {
    await this.cancelButton.click();
    await expect(this.root).toBeHidden();
  }
}
