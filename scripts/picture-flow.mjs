// Plays the recorded example with a picture and takes screenshots: the
// conversation, the reader asleep on the X4 Pro, the Boox, the Files panel,
// and a picture added by hand.
//   node scripts/picture-flow.mjs <base url> <out folder>
import { chromium } from "playwright-core";

const [base = "http://127.0.0.1:5173/", out = "."] = process.argv.slice(2);
const browser = await chromium.launch({ channel: "msedge" });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
page.on("pageerror", (e) => console.log(`[pageerror] ${e.message}`));
page.on("console", (m) => m.type() === "error" && console.log(`[error] ${m.text()}`));
const shot = (name, full = false) => page.screenshot({ path: `${out}/${name}.png`, fullPage: full });

await page.goto(`${base}#/example/sleep-picture`);
await page.waitForFunction(() => document.body.innerText.includes("Shall I make it lighter"), null, { timeout: 60000 });
await page.waitForTimeout(800);
await shot("pictures-1-conversation");
await page.getByRole("button", { name: "X4 Pro" }).click();
await page.waitForTimeout(800);
await page.getByRole("button", { name: "Asleep" }).click();
await page.waitForTimeout(1500);
await shot("pictures-2-asleep-x4-pro");
await page.getByRole("button", { name: "Boox Go 7" }).click();
await page.waitForTimeout(1500);
await shot("pictures-3-boox");
await page.getByRole("button", { name: "Files" }).click();
await page.waitForTimeout(500);
await shot("pictures-4-files");
await page.getByRole("button", { name: "Close" }).click();
// A picture added by hand: it waits beside the message field.
await page.locator('input[type="file"]').setInputFiles("public/examples/night-sky.jpg");
await page.locator(".attached li").first().waitFor();
await shot("pictures-5-added");
await browser.close();
