// Walks the recorded example through to the store (a pretend one in
// development) and takes a screenshot at each step of sharing.
//   node scripts/share-flow.mjs <base url> <out folder>
import { chromium } from "playwright-core";

const [base = "http://127.0.0.1:5173/", out = "."] = process.argv.slice(2);
const browser = await chromium.launch({ channel: "msedge" });
const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
page.on("pageerror", (e) => console.log(`[pageerror] ${e.message}`));
page.on("console", (m) => m.type() === "error" && console.log(`[error] ${m.text()}`));
const shot = (name) => page.screenshot({ path: `${out}/${name}.png`, fullPage: true });

await page.goto(`${base}#/example`);
// The first turn plays itself; the second is typed as a person would.
await page.getByRole("button", { name: "Send", exact: true }).waitFor();
await page.waitForFunction(() => !document.querySelector(".step.busy") && document.querySelectorAll(".step").length > 3, null, { timeout: 60000 });
await page.fill("#say", "Make the corners round.");
await page.getByRole("button", { name: "Send", exact: true }).click();
await page.waitForFunction(() => document.body.innerText.includes("look like pills"), null, { timeout: 60000 });
await page.getByRole("link", { name: "Share it in the store" }).click();
await page.getByRole("button", { name: "Check it in the store" }).waitFor({ timeout: 30000 });
await page.waitForFunction(() => document.querySelectorAll(".shots img").length >= 4, null, { timeout: 30000 });
await page.waitForTimeout(500);
await shot("share-1-ready");
await page.getByRole("button", { name: "Check it in the store" }).click();
await page.getByRole("button", { name: "Send it to the moderators" }).waitFor({ timeout: 30000 });
await shot("share-2-checked");
await page.getByRole("button", { name: "Send it to the moderators" }).click();
await page.getByText("Sent.").waitFor({ timeout: 30000 });
await shot("share-3-sent");
await browser.close();
