import { Locator, Page, expect } from "@playwright/test";

/**
 * A Salesforce toast: the short message at the top of the page after Save, Delete...
 * It disappears after a few seconds, so check it straight after the action.
 */
export class Toast {
  constructor(private readonly page: Page) {}

  message(text: string): Locator {
    return this.page.getByRole("status").filter({ hasText: text }); // this org renders toasts with role="status"
  }

  async expectMessage(text: string) {
    await expect(this.message(text)).toBeVisible();
  }
}
