import { test, expect } from "../fixtures/apiFixtures";
import { Account } from "../clients/AccountClient";
import { CreateResult, QueryResult, SfError } from "../clients/SObjectClient";
import { buildAccount } from "../data/accountData";
import { expectStatus } from "../utils/expectStatus";

// ⚠ These tests create (and then delete) real Accounts in your org.

const FIELDS: (keyof Account)[] = ["Name", "Phone", "Website", "Type", "Industry"];

test.describe("Account API - CRUD", () => {
  test("create, read, update and delete an account", async ({ accounts }) => {
    const payload = buildAccount();
    let id = "";

    await test.step("Create: POST returns 201 and a new Account id", async () => {
      const response = await accounts.create(payload);
      await expectStatus(response, 201);

      const body = (await response.json()) as CreateResult;
      expect(body.success).toBe(true);
      expect(body.errors).toEqual([]);
      expect(body.id).toMatch(/^001[a-zA-Z0-9]{15}$/); // 001 = Account key prefix
      id = body.id;
    });

    await test.step("Read: GET returns the saved fields", async () => {
      const response = await accounts.get(id, FIELDS);
      await expectStatus(response, 200);

      const record = (await response.json()) as Account;
      expect(record).toMatchObject({ Id: id, ...payload });
    });

    const changes: Partial<Account> = { Phone: "020 7946 1111", Industry: "Banking" }; // ⚠ check this value exists in your org

    await test.step("Update: PATCH returns 204 and the changes are saved", async () => {
      const response = await accounts.update(id, changes);
      await expectStatus(response, 204);

      const record = (await (await accounts.get(id, FIELDS)).json()) as Account;
      expect(record).toMatchObject({ ...payload, ...changes });
    });

    await test.step("Delete: DELETE returns 204 and the record is gone", async () => {
      const response = await accounts.delete(id);
      await expectStatus(response, 204);

      const after = await accounts.get(id);
      await expectStatus(after, 404);
      const [error] = (await after.json()) as SfError[];
      expect(["ENTITY_IS_DELETED", "NOT_FOUND"]).toContain(error.errorCode);
    });
  });

  test("SOQL query finds a created account", async ({ accounts }) => {
    const payload = buildAccount();
    const { id } = (await (await accounts.create(payload)).json()) as CreateResult;

    const response = await accounts.query(`SELECT Id, Name FROM Account WHERE Id = '${id}'`);
    await expectStatus(response, 200);

    const result = (await response.json()) as QueryResult<Account>;
    expect(result.totalSize).toBe(1);
    expect(result.records[0]).toMatchObject({ Id: id, Name: payload.Name });
  });
});

test.describe("Account API - negative cases", () => {
  test("create without Name returns 400 REQUIRED_FIELD_MISSING", async ({ accounts }) => {
    const { Name, ...withoutName } = buildAccount();

    const response = await accounts.create(withoutName);
    await expectStatus(response, 400);

    const [error] = (await response.json()) as SfError[];
    expect(error.errorCode).toBe("REQUIRED_FIELD_MISSING");
    expect(error.fields).toContain("Name");
  });

  test("create with an unknown Industry value returns 400", async ({ accounts }) => {
    const response = await accounts.create(buildAccount({ Industry: "Not A Real Industry" }));
    await expectStatus(response, 400);

    const [error] = (await response.json()) as SfError[];
    expect(error.errorCode).toBe("INVALID_OR_NULL_FOR_RESTRICTED_PICKLIST");
  });

  test("GET with a malformed id returns 404 NOT_FOUND", async ({ accounts }) => {
    const response = await accounts.get("not-a-real-id");
    await expectStatus(response, 404);

    const [error] = (await response.json()) as SfError[];
    expect(error.errorCode).toBe("NOT_FOUND");
  });

  test("request without a token returns 401 INVALID_SESSION_ID", async ({ playwright, sfAuth }) => {
    const anonymous = await playwright.request.newContext({ baseURL: sfAuth.instanceUrl });
    try {
      const response = await anonymous.get(`/services/data/v${sfAuth.apiVersion}/sobjects/Account`);
      await expectStatus(response, 401);

      const [error] = (await response.json()) as SfError[];
      expect(error.errorCode).toBe("INVALID_SESSION_ID");
    } finally {
      await anonymous.dispose();
    }
  });
});
