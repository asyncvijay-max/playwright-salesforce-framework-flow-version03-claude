/** Edit Account Test 
 * The test: edit-account.spec.ts
Create an Account with Phone, Type and Industry.
Update it: new Phone, Type and Industry.
Check the changed fields show the new values.
Check an untouched field (Website) still has its old value. This proves the edit changed only what we asked, and that’s the check people most often forget.
*/
import { test } from "@playwright/test";
import { AccountPage } from "../src/pages/AccountPage";
import { uniqueId } from "../src/data/testData";

// ⚠ This test SAVES a real Account in your org, then EDITS it.
test("edit an account and keep the fields that were not changed", async ({
  page,
}) => {
  const accounts = new AccountPage(page);

  const account = {
    name: `PW Account ${uniqueId()}`,
    phone: "020 7946 0000",
    website: "www.acme.example",
    type: "Prospect",
    industry: "Technology",
  };
  const changes = {
    phone: "020 7946 1111",
    type: "Customer - Direct", // ⚠ check this value exists in your org
    industry: "Finance", // ⚠ check this value exists in your org
  };

  // Create the account
  await accounts.create(account);

  // Edit three of its fields
  await accounts.update(account.name, changes);

  // The changed fields show the new values
  await accounts.openDetailsTab();
  await accounts.expectDetail("Phone", changes.phone);
  await accounts.expectDetail("Type", changes.type);
  await accounts.expectDetail("Industry", changes.industry);

  // The fields we didn't touch keep their old values
  await accounts.expectDetail("Account Name", account.name);
  await accounts.expectDetail("Website", account.website);
});
