import { test } from "@playwright/test";
import { LeadPage } from "../src/pages/LeadPage";
import { AccountPage } from "../src/pages/AccountPage";
import { ContactPage } from "../src/pages/ContactPage";
import { OpportunityPage } from "../src/pages/OpportunityPage";
import { uniqueId } from "../src/data/testData";

// ⚠ This test SAVES a real Lead in your org and CONVERTS it into a new Account, Contact and Opportunity.
test("convert a lead into a new account, contact and opportunity", async ({
  page,
}) => {
  const leads = new LeadPage(page);
  const accounts = new AccountPage(page);
  const contacts = new ContactPage(page);
  const opportunities = new OpportunityPage(page);

  const id = uniqueId();
  const lead = {
    firstName: "Priya",
    lastName: `PW Lead ${id}`,
    company: `PW Company ${id}`,
    email: `pw.${id}@example.com`,
    leadSource: "Web", // ⚠ check this value exists in your org
  };
  const opportunityName = `PW Opportunity ${id}`;

  // Create the lead
  await leads.create(lead);

  // Convert it: new Account, Contact and Opportunity
  await leads.convert(opportunityName);
  await leads.expectConverted(lead.company, lead.lastName, opportunityName);

  // The new Account: named after the Company, and linked to both new records
  await leads.openConvertedRecord(lead.company);
  await accounts.openDetailsTab();
  await accounts.expectDetail("Account Name", lead.company);
  await accounts.expectRelatedRecord("Contacts", lead.lastName);
  await accounts.expectRelatedRecord("Opportunities", opportunityName);

  // The new Contact: linked to the Account, and kept the Lead's email
  await accounts.openRelatedRecord("Contacts", lead.lastName);
  await contacts.openDetailsTab();
  await contacts.expectDetail("Name", `${lead.firstName} ${lead.lastName}`);
  await contacts.expectDetail("Account Name", lead.company);
  await contacts.expectDetail("Email", lead.email);

  // The new Opportunity: linked to the Account, and kept the Lead's source
  await contacts.openAccount(lead.company);
  await accounts.openRelatedRecord("Opportunities", opportunityName);
  await opportunities.openDetailsTab();
  await opportunities.expectDetail("Opportunity Name", opportunityName);
  await opportunities.expectDetail("Account Name", lead.company);
  await opportunities.expectDetail("Lead Source", lead.leadSource);
});
