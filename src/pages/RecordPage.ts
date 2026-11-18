import { Locator, Page, expect } from "@playwright/test";
import { Modal } from "../components/Modal";
import { Toast } from "../components/Toast";
import { DetailField } from "../components/DetailField";
import { formatDate } from "../data/dates";

/**
 * What EVERY Salesforce record page shares: Contacts, Accounts, Opportunities...
 * Specific pages extend this class and add their own methods.
 */
export class RecordPage {
  readonly toast: Toast;
  constructor(
    protected readonly page: Page,
    readonly objectApiName: string, // used in URLs, e.g. 'Account'
    readonly objectLabel: string, // used in titles, e.g. 'Account' → "New Account"
  ) {
    this.toast = new Toast(page);
  }

  async openNew(): Promise<Modal> {
    await this.page.goto(`/lightning/o/${this.objectApiName}/new`);
    const popup = new Modal(this.page, `New ${this.objectLabel}`);
    await popup.expectOpen();
    return popup;
  }

  async openDetailsTab() {
    await this.page.getByRole("tab", { name: "Details", exact: true }).click();
  }

  async expectDetail(label: string, value: string) {
    await new DetailField(this.page, label).expectValue(value);
  }

  async expectDetailDate(label: string, date: Date) {
    await this.expectDetail(label, formatDate(date));
  }

  async openRelatedTab() {
    await this.page.getByRole("tab", { name: "Related", exact: true }).click();
  }

  /**
   * A related list card on the Related tab: "Contacts (1)", "Opportunities (2)"...
   * Matched by the start of its heading, so the record count doesn't matter.
   * Hidden copies of earlier record pages stay in the DOM, so only visible cards count.
   */
  relatedList(listName: string): Locator {
    return this.page
      .locator("article")
      .filter({ visible: true })
      .filter({
        has: this.page.getByRole("heading", {
          name: new RegExp(`^${listName}\\b`),
        }),
      });
  }

  /** The link to a record in a related list. The name only needs to be contained (e.g. a last name). */
  relatedRecord(listName: string, recordName: string): Locator {
    return this.relatedList(listName).getByRole("link", { name: recordName });
  }

  async expectRelatedRecord(listName: string, recordName: string) {
    await this.openRelatedTab();
    await expect(this.relatedRecord(listName, recordName)).toBeVisible();
  }

  async openRelatedRecord(listName: string, recordName: string) {
    await this.openRelatedTab();
    await this.relatedRecord(listName, recordName).click();
  }
}
