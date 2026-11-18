import { Locator, Page, expect } from "@playwright/test";
import { TextField } from "./TextField";
import { Picklist } from "./Picklist";
import { DateField } from "./DateField";
import { Lookup } from "./Lookup";

/**
 * A Salesforce popup (dialog): New Contact, New Account, Edit "Acme Ltd"...
 * Found by its title. Hands out field components that search inside it.
 */
export class Modal {
  readonly root: Locator;
  readonly saveButton: Locator;
  readonly cancelButton: Locator;

  constructor(
    page: Page,
    readonly title: string,
  ) {
    this.root = page.getByRole("dialog", { name: title });
    this.saveButton = this.root.getByRole("button", {
      name: "Save",
      exact: true,
    });
    this.cancelButton = this.root.getByRole("button", {
      name: "Cancel",
      exact: true,
    });
  }

  textField(label: string): TextField {
    return new TextField(this.root, label);
  }

  picklist(label: string): Picklist {
    return new Picklist(this.root, label);
  }

  lookup(label: string): Lookup {
    return new Lookup(this.root, label);
  }

  dateField(label: string): DateField {
    return new DateField(this.root, label);
  }

  async expectOpen() {
    await expect(this.root).toBeVisible();
  }

  async save() {
    await this.saveButton.click();
    await expect(this.root).toBeHidden();
  }

  async cancel() {
    await this.cancelButton.click();
    await expect(this.root).toBeHidden();
  }
}
