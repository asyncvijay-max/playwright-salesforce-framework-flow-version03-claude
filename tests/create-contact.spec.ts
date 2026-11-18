import { test } from "@playwright/test";
import { ContactPage } from "../src/pages/ContactPage";
import { EXISTING_ACCOUNT, uniqueId } from "../src/data/testData";

// ⚠ This test SAVES a real Contact in your org.
test("create a new contact", async ({ page }) => {
  const contacts = new ContactPage(page);
  const id = uniqueId();

  const contact = {
    firstName: "PW",
    lastName: `Contact ${id}`,
    email: `pw.contact.${id}@example.com`,
    phone: "020 7946 0001",
    accountName: EXISTING_ACCOUNT,
  };

  // Create the contact
  await contacts.create(contact);

  // Check the saved details (Salesforce shows First + Last as one "Name" field)
  await contacts.openDetailsTab();
  await contacts.expectDetail("Name", ContactPage.fullName(contact));
  await contacts.expectDetail("Email", contact.email);
  await contacts.expectDetail("Phone", contact.phone);
  await contacts.expectDetail("Account Name", contact.accountName);
});
