import { execSync } from "child_process";
import { SF_ORG_ALIAS } from "../../src/config/org";

export interface SfAuth {
  accessToken: string; // secret, never log it
  instanceUrl: string; // e.g. https://my-org.my.salesforce.com
  apiVersion: string; // e.g. "68.0"
}

let cached: SfAuth | undefined;

/** Real Salesforce access tokens look like "00D<orgId>!<secret>". */
const TOKEN_PATTERN = /^00D\w{12,15}!\S+$/;

/** Run an sf CLI command with --json and return its parsed "result". Never logs the output. */
function runSf(command: string): unknown {
  let output: string;
  try {
    output = execSync(command, {
      encoding: "utf-8",
      stdio: ["ignore", "pipe", "ignore"], // ignore warnings on stderr
      env: {
        ...process.env,
        SF_SKIP_NEW_VERSION_CHECK: "true", // hide "update available" warning
        NO_COLOR: "1",
      },
    });
  } catch {
    throw new Error(
      `Salesforce CLI failed. Check that the sf CLI is installed and that "${command}" works in your terminal.`,
    );
  }
  try {
    // Parse from the first "{" in case the CLI printed extra text first
    return JSON.parse(output.slice(output.indexOf("{"))).result;
  } catch {
    throw new Error(`Could not read the JSON output of "${command}".`);
  }
}

/** Find the token in the show-access-token result, whatever shape the CLI version uses. */
function pickToken(result: unknown): string | undefined {
  if (typeof result === "string") return result;
  if (result && typeof result === "object") {
    const r = result as Record<string, unknown>;
    const value = r.accessToken ?? r.token ?? r.access_token;
    if (typeof value === "string") return value;
  }
  return undefined;
}

/**
 * Get an access token from the Salesforce CLI (same login the UI tests use).
 * - `sf org display` gives the instance URL and API version. Since sf CLI 2.15x it
 *   shows "[REDACTED]" instead of the token.
 * - `sf org auth show-access-token` gives the token itself.
 * The result is cached for the rest of this worker process.
 */
export function getSfAuth(): SfAuth {
  if (cached) return cached;

  const displayCommand = `sf org display --target-org ${SF_ORG_ALIAS} --json`;
  const org = runSf(displayCommand) as { instanceUrl?: string; apiVersion?: string } | undefined;
  if (!org?.instanceUrl) {
    throw new Error(`Could not read the org URL. Check that "${displayCommand}" shows a connected org.`);
  }

  const tokenCommand = `sf org auth show-access-token --target-org ${SF_ORG_ALIAS} --json`;
  const accessToken = pickToken(runSf(tokenCommand));
  if (!accessToken || !TOKEN_PATTERN.test(accessToken)) {
    throw new Error(
      `Could not read an access token from the Salesforce CLI. Check that "${tokenCommand}" works in your terminal.`,
    );
  }

  cached = {
    accessToken,
    instanceUrl: org.instanceUrl,
    apiVersion: process.env.SF_API_VERSION ?? org.apiVersion ?? "68.0",
  };
  return cached;
}
