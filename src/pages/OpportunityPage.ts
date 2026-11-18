import { Page } from "@playwright/test";
import { RecordPage } from "./RecordPage";

export type OpportunityData = {
  name: string;
  closeDate: Date;
  stage: string;
  accountName?: string;
  amount?: string;
};

export class OpportunityPage extends RecordPage {
  constructor(page: Page) {
    super(page, "Opportunity", "Opportunity");
  }

  async create(opportunity: OpportunityData) {
    const popup = await this.openNew();

    await popup.textField("Opportunity Name").fill(opportunity.name);
    if (opportunity.accountName)
      await popup.lookup("Account Name").select(opportunity.accountName);
    await popup.dateField("Close Date").fill(opportunity.closeDate);
    await popup.picklist("Stage").select(opportunity.stage);
    if (opportunity.amount)
      await popup.numberField("Amount").fill(opportunity.amount);

    await popup.save();
    await this.toast.expectMessage(opportunity.name);
  }
}
