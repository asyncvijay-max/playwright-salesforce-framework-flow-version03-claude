import { Page } from "@playwright/test";
import { RecordPage } from "./RecordPage.js";

/** The data a test can give when creating an account. Only name is required. */
export type AccountData = {
  name: string;
  phone?: string;
  website?: string;
  type?: string;
  industry?: string;
};

/**
 * Everything a test needs to do with Accounts.
 * Gets openNew(), openDetailsTab(), expectDetail() and toast from RecordPage.
 */
export class AccountPage extends RecordPage {
  constructor(page: Page) {
    super(page, "Account", "Account");
  }

  async create(account: AccountData) {
    const popup = await this.openNew();

    await popup.textField("Account Name").fill(account.name);
    if (account.phone) await popup.textField("Phone").fill(account.phone);
    if (account.website) await popup.textField("Website").fill(account.website);
    if (account.type) await popup.picklist("Type").select(account.type);
    if (account.industry)
      await popup.picklist("Industry").select(account.industry);

    await popup.save();
    await this.toast.expectMessage(account.name); // straight after Save, before it fades
  }

  /** Edits the open account. Only the fields given in `changes` are touched. */
  async update(currentName: string, changes: Partial<AccountData>) {
    const popup = await this.openEdit(currentName);

    if (changes.name) await popup.textField("Account Name").fill(changes.name);
    if (changes.phone) await popup.textField("Phone").fill(changes.phone);
    if (changes.website) await popup.textField("Website").fill(changes.website);
    if (changes.type) await popup.picklist("Type").select(changes.type);
    if (changes.industry)
      await popup.picklist("Industry").select(changes.industry);

    await popup.save();
    await this.toast.expectMessage(changes.name ?? currentName); // the NEW name if it was renamed
  }
}
