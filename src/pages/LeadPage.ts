import { Page } from "@playwright/test";
import { RecordPage } from "./RecordPage";
import { ActionMenu } from "../components/ActionMenu";
import { LeadConvertDialog } from "../components/LeadConvertDialog";

/**
 * The data a test can give when creating a lead. lastName and company are required.
 * Lead Status is required in Salesforce but has a default ("Open - Not Contacted"),
 * so it's optional here: set it only to choose a different value.
 */
export type LeadData = {
  lastName: string;
  company: string;
  salutation?: string;
  firstName?: string;
  title?: string;
  email?: string;
  status?: string;
  leadSource?: string;
};

/**
 * Everything a test needs to do with Leads.
 * Gets openNew(), openList(), openDetailsTab(), openRelatedTab(), expectDetail(),
 * expectRelatedRecord() and toast from RecordPage.
 */
export class LeadPage extends RecordPage {
  constructor(page: Page) {
    super(page, "Lead", "Lead");
  }

  async create(lead: LeadData) {
    const popup = await this.openNew();

    if (lead.salutation)
      await popup.picklist("Salutation").select(lead.salutation);
    if (lead.firstName)
      await popup.textField("First Name").fill(lead.firstName);
    await popup.textField("Last Name").fill(lead.lastName);
    await popup.textField("Company").fill(lead.company);
    if (lead.title) await popup.textField("Title").fill(lead.title);
    if (lead.email) await popup.textField("Email").fill(lead.email);
    if (lead.status) await popup.picklist("Lead Status").select(lead.status);
    if (lead.leadSource)
      await popup.picklist("Lead Source").select(lead.leadSource);

    await popup.save();
    await this.toast.expectMessage(lead.lastName); // straight after Save, before it fades
  }

  /** Converts the open lead into a new Account, Contact and Opportunity (all "Create New"). */
  async convert(opportunityName?: string) {
    await new ActionMenu(this.page).run("Convert");
    const dialog = new LeadConvertDialog(this.page);
    await dialog.expectOpen();
    if (opportunityName) await dialog.setOpportunityName(opportunityName);
    await dialog.convert(); // waits for "Your lead has been converted"
  }

  /** On the success screen: checks there is a link to each new record. */
  async expectConverted(...recordNames: string[]) {
    const dialog = new LeadConvertDialog(this.page);
    for (const name of recordNames) {
      await dialog.expectRecordLink(name);
    }
  }

  /** On the success screen: opens one of the new records. */
  async openConvertedRecord(recordName: string) {
    await new LeadConvertDialog(this.page).recordLink(recordName).click();
  }
}
