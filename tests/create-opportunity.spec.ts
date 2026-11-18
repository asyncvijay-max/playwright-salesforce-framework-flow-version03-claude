import { test } from "@playwright/test";
import { OpportunityPage } from "../src/pages/OpportunityPage";
import { EXISTING_ACCOUNT, uniqueId } from "../src/data/testData";
import { daysFromNow } from "../src/data/dates";

test("create an opportunity linked to an existing account", async ({
  page,
}) => {
  const opportunities = new OpportunityPage(page);

  const opportunity = {
    name: `PW Opportunity ${uniqueId()}`,
    closeDate: daysFromNow(30),
    stage: "Prospecting",
    accountName: EXISTING_ACCOUNT,
    amount: "25000",
  };

  // Create the opportunity
  await opportunities.create(opportunity);

  // Check the saved details
  await opportunities.openDetailsTab();
  await opportunities.expectDetail("Opportunity Name", opportunity.name);
  await opportunities.expectDetailDate("Close Date", opportunity.closeDate);
  await opportunities.expectDetail("Stage", opportunity.stage);
  await opportunities.expectDetail("Account Name", opportunity.accountName);
  await opportunities.expectDetail("Amount", "25,000");
});
