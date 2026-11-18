import { Page } from "@playwright/test";
import { RecordPage } from "./RecordPage";

/** The data a test can give when creating a contact. Only lastName is required. */
export type ContactData = {
  firstName?: string;
  lastName: string;
  email?: string;
  phone?: string;
  accountName?: string; // must be an Account that already exists in the org
};

/**
 * Everything a test needs to do with Contacts.
 * Gets openNew(), openDetailsTab(), expectDetail() and toast from RecordPage.
 */
export class ContactPage extends RecordPage {
  constructor(page: Page) {
    super(page, "Contact", "Contact");
  }

  /** "First Last" as Salesforce shows it in the Name field and the toast. */
  static fullName(contact: ContactData): string {
    if (!contact.firstName) return contact.lastName;
    return `${contact.firstName} ${contact.lastName}`;
  }

  async create(contact: ContactData) {
    const popup = await this.openNew();

    if (contact.firstName)
      await popup.textField("First Name").fill(contact.firstName);
    await popup.textField("Last Name").fill(contact.lastName);
    if (contact.email) await popup.textField("Email").fill(contact.email);
    if (contact.phone) await popup.textField("Phone").fill(contact.phone);
    if (contact.accountName)
      await popup.lookup("Account Name").select(contact.accountName);

    await popup.save();
    await this.toast.expectMessage(ContactPage.fullName(contact)); // straight after Save, before it fades
  }
}
