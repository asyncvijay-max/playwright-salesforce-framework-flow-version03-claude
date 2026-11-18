import { test } from "@playwright/test";
import { AccountPage } from "../src/pages/AccountPage";
import { uniqueId } from "../src/data/testData";

// ⚠ This test SAVES a real Account in your org.
test("create a new account", async ({ page }) => {
  const accounts = new AccountPage(page);

  const account = {
    name: `PW Account ${uniqueId()}`,
    phone: "020 7946 0000",
    website: "www.acme.example",
    type: "Prospect", // ⚠ check this value exists in your org
    industry: "Technology", // ⚠ check this value exists in your org
  };

  // Create the account
  await accounts.create(account);

  // Check the saved details
  await accounts.openDetailsTab();
  await accounts.expectDetail("Account Name", account.name);
  await accounts.expectDetail("Phone", account.phone);
  await accounts.expectDetail("Website", account.website);
  await accounts.expectDetail("Type", account.type);
  await accounts.expectDetail("Industry", account.industry);
});
