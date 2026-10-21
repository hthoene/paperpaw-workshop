// Opens the workshop in the installed Edge (Playwright, no download),
// prints the console of the page and its frames, and takes screenshots.
//   node scripts/look.mjs <url> <out.png> [wait ms] [width] [height]
import { chromium } from "playwright-core";

const [url, out, wait = "8000", width = "1440", height = "1000"] = process.argv.slice(2);
const browser = await chromium.launch({ channel: "msedge" });
const page = await browser.newPage({ viewport: { width: Number(width), height: Number(height) } });
page.on("console", (m) => console.log(`[${m.type()}] ${m.text()}`));
page.on("pageerror", (e) => console.log(`[pageerror] ${e.message}`));
page.on("requestfailed", (r) => console.log(`[failed] ${r.url()} ${r.failure()?.errorText}`));
await page.goto(url);
await page.waitForTimeout(Number(wait));
await page.screenshot({ path: out, fullPage: false });
await browser.close();
