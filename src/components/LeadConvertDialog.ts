import { Locator, Page, expect } from "@playwright/test";

export class LeadConvertDialog {
  readonly root: Locator;
  readonly convertButton: Locator;
  readonly successDialog: Locator;
  readonly successHeading: Locator;

  constructor(page: Page) {
    this.root = page.getByRole("dialog", { name: "Convert Lead" });
    this.convertButton = this.root.getByRole("button", {
      name: "Convert",
      exact: true,
    });
    // After Convert, Salesforce swaps in a different dialog with its own name.
    this.successDialog = page.getByRole("dialog", {
      name: "Your lead has been converted",
    });
    this.successHeading = this.successDialog.getByRole("heading", {
      name: "Your lead has been converted",
    });
  }

  section(name: "Account" | "Contact" | "Opportunity"): Locator {
    return this.root.getByRole("group", { name });
  }

  /**
   * A new record's link on the success screen. The Account's name is also linked
   * from the Contact and Opportunity cards ("Account Name: ..."), so it appears 3 times;
   * the record's own title link always comes first.
   * The name only needs to be contained (the test passes the contact's last name).
   */
  recordLink(recordName: string): Locator {
    return this.successDialog.getByRole("link", { name: recordName }).first();
  }

  async expectOpen() {
    await expect(this.root).toBeVisible();
  }

  /**
   * Only the Account section starts open; Contact and Opportunity are collapsed
   * and their fields don't exist until the section header is clicked.
   */
  async expandSection(name: "Account" | "Contact" | "Opportunity") {
    const header = this.section(name).getByRole("button", { name, exact: true });
    if ((await header.getAttribute("aria-expanded")) !== "true") {
      await header.click();
    }
    await expect(header).toHaveAttribute("aria-expanded", "true");
  }

  async setOpportunityName(name: string) {
    await this.expandSection("Opportunity");
    // In this dialog required fields are named with their star, e.g. "Account Name *".
    await this.section("Opportunity")
      .getByRole("textbox", { name: /^Opportunity Name( \*)?$/ })
      .fill(name);
  }

  async convert() {
    await this.convertButton.click();
    await expect(this.successHeading).toBeVisible();
  }

  async expectRecordLink(recordName: string) {
    await expect(this.recordLink(recordName)).toBeVisible();
  }
}
