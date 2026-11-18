import { test } from "@playwright/test";
import { LeadPage } from "../src/pages/LeadPage";
import { uniqueId } from "../src/data/testData";

// ⚠ This test SAVES a real Lead in your org.
test("create a new lead", async ({ page }) => {
  const leads = new LeadPage(page);

  const id = uniqueId();
  const lead = {
    salutation: "Ms.",
    firstName: "Priya",
    lastName: `PW Lead ${id}`,
    company: `PW Company ${id}`,
    title: "Head of IT",
    email: `pw.${id}@example.com`,
    leadSource: "Web", // ⚠ check this value exists in your org
  };

  // Create the lead (Lead Status is left at its default)
  await leads.create(lead);

  // Check the saved details
  await leads.openDetailsTab();
  await leads.expectDetail("Name", `${lead.firstName} ${lead.lastName}`);
  await leads.expectDetail("Company", lead.company);
  await leads.expectDetail("Title", lead.title);
  await leads.expectDetail("Email", lead.email);
  await leads.expectDetail("Lead Source", lead.leadSource);
  await leads.expectDetail("Lead Status", "Open - Not Contacted"); // the default value
});
