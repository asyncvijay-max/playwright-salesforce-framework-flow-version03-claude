import { test as base, expect, APIRequestContext } from "@playwright/test";
import { getSfAuth, SfAuth } from "../config/sfAuth";
import { AccountClient } from "../clients/AccountClient";

interface CreatedRecord {
  sObjectType: string;
  id: string;
}

interface ApiFixtures {
  /** Token, instance URL and API version from the Salesforce CLI. */
  sfAuth: SfAuth;
  /** Request context already pointed at the org, with the Bearer token set. */
  sfApi: APIRequestContext;
  /** Records created during the test. Any still present are deleted afterwards. */
  createdRecords: CreatedRecord[];
  accounts: AccountClient;
}

export const test = base.extend<ApiFixtures>({
  sfAuth: async ({}, use) => {
    await use(getSfAuth());
  },

  createdRecords: async ({}, use) => {
    await use([]);
  },

  sfApi: async ({ playwright, sfAuth, createdRecords }, use) => {
    const api = await playwright.request.newContext({
      baseURL: sfAuth.instanceUrl,
      extraHTTPHeaders: {
        Authorization: `Bearer ${sfAuth.accessToken}`,
        Accept: "application/json",
      },
    });

    await use(api);

    // Cleanup: delete anything the test created. 404 means it is already gone.
    for (const { sObjectType, id } of createdRecords.reverse()) {
      const response = await api.delete(
        `/services/data/v${sfAuth.apiVersion}/sobjects/${sObjectType}/${id}`,
      );
      if (![204, 404].includes(response.status())) {
        console.warn(`Cleanup could not delete ${sObjectType} ${id}: HTTP ${response.status()}`);
      }
    }
    await api.dispose();
  },

  accounts: async ({ sfApi, sfAuth, createdRecords }, use) => {
    await use(
      new AccountClient(sfApi, sfAuth.apiVersion, (sObjectType, id) =>
        createdRecords.push({ sObjectType, id }),
      ),
    );
  },
});

export { expect };
