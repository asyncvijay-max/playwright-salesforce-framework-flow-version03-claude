import { test as setup } from "@playwright/test";
import { execSync } from "child_process";
import fs from "fs";
import { SF_ORG_ALIAS } from "../src/config/org";

const authFile = "playwright/.auth/user.json";

setup("login to Salesforce", async ({ browser, baseURL }) => {
  setup.setTimeout(120_000); // Salesforce can be slow to load
  if (!baseURL) {
    throw new Error("Set baseURL in playwright.config.ts to your Lightning URL.");
  }

  // 1. If we have a saved session, check it still works
  if (fs.existsSync(authFile)) {
    const context = await browser.newContext({ storageState: authFile });
    const page = await context.newPage();
    await page.goto(`${baseURL}/lightning/page/home`);

    const stillLoggedIn = await page
      .getByRole("button", { name: "App Launcher" })
      .waitFor({ timeout: 20_000 })
      .then(() => true)
      .catch(() => false);

    await context.close();

    if (stillLoggedIn) {
      console.log("Saved session is still valid, skipping login");
      return;
    }
    console.log("Saved session has expired, logging in again");
  }

  // 2. Get a one-time login URL from the Salesforce CLI (no password, no code)
  let output: string;
  try {
    output = execSync(
      `sf org open --url-only --target-org ${SF_ORG_ALIAS} --json`,
      {
        encoding: "utf-8",
        stdio: ["ignore", "pipe", "ignore"], // ignore warnings on stderr
        env: {
          ...process.env,
          SF_SKIP_NEW_VERSION_CHECK: "true", // hide "update available" warning
          NO_COLOR: "1",
        },
      },
    );
  } catch {
    throw new Error(
      `Salesforce CLI login failed. Check that the sf CLI is installed and that ` +
        `"sf org open --url-only --target-org ${SF_ORG_ALIAS}" works in your terminal.`,
    );
  }

  // Pick out the URL even if the CLI printed extra text around the JSON
  const match = output.match(/"url"\s*:\s*"([^"]+)"/);
  if (!match) {
    throw new Error(
      `Could not get a login URL from the Salesforce CLI. Check that ` +
        `"sf org open --url-only --target-org ${SF_ORG_ALIAS}" works in your terminal.`,
    );
  }
  const loginUrl = match[1]; // contains a token, don't log it

  // 3. Open that URL in a fresh browser and wait for Lightning to load
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto(loginUrl);

  await page
    .getByRole("button", { name: "App Launcher" })
    .waitFor({ timeout: 60_000 });

  // 4. Save the session for the other tests to reuse
  await context.storageState({ path: authFile });
  await context.close();
  console.log("Logged in through the Salesforce CLI and saved the session");
});
