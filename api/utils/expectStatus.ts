import { expect, APIResponse } from "@playwright/test";

/**
 * Check the HTTP status and, if it is wrong, show Salesforce's error body in the failure
 * (e.g. INVALID_SESSION_ID, REQUIRED_FIELD_MISSING) instead of just the two numbers.
 */
export async function expectStatus(response: APIResponse, expected: number): Promise<void> {
  if (response.status() !== expected) {
    const body = (await response.text()).slice(0, 1000);
    expect(
      response.status(),
      `${response.url().replace(/\?.*$/, "")} returned ${response.status()}: ${body}`,
    ).toBe(expected);
  }
}
