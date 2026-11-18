import { Page } from "@playwright/test";
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
}
