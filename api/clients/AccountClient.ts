import { APIRequestContext } from "@playwright/test";
import { SObjectClient } from "./SObjectClient";

/** Account fields used by the tests (Salesforce API names). */
export interface Account {
  Id: string;
  Name: string;
  Phone: string;
  Website: string;
  Type: string;
  Industry: string;
}

export class AccountClient extends SObjectClient<Account> {
  constructor(
    api: APIRequestContext,
    apiVersion: string,
    onCreated?: (sObjectType: string, id: string) => void,
  ) {
    super(api, "Account", apiVersion, onCreated);
  }
}
