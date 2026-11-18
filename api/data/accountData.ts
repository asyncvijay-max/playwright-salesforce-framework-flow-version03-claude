import { uniqueId } from "../../src/data/testData";
import { Account } from "../clients/AccountClient";

/** A valid new Account with a unique name. Pass overrides to change any field. */
export function buildAccount(overrides: Partial<Account> = {}): Partial<Account> {
  return {
    Name: `PW API Account ${uniqueId()}`,
    Phone: "020 7946 0000",
    Website: "www.acme.example",
    Type: "Prospect", // ⚠ check this value exists in your org
    Industry: "Technology", // ⚠ check this value exists in your org
    ...overrides,
  };
}
