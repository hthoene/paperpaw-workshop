// Draws the example picture of public/examples/night-sky.jpg (a night
// sky over hills, an owl on a branch) and saves it as a JPEG: our own
// drawing, so it ships under the repository's licence.
//   node scripts/draw-example.mjs public/examples/night-sky.jpg
import { chromium } from "playwright-core";
const out = process.argv[2];
const browser = await chromium.launch({ channel: "msedge" });
const page = await browser.newPage();
const data = await page.evaluate(() => {
  const c = document.createElement("canvas");
  c.width = 1600; c.height = 1200;
  const g = c.getContext("2d");
  let seed = 3; const r = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const sky = g.createLinearGradient(0, 0, 0, 1200);
  sky.addColorStop(0, "#0b1a3a"); sky.addColorStop(0.55, "#3a4f7a"); sky.addColorStop(1, "#c9a27a");
  g.fillStyle = sky; g.fillRect(0, 0, 1600, 1200);
  for (let i = 0; i < 260; i++) { g.fillStyle = `rgba(255,255,240,${0.3 + r() * 0.7})`; g.beginPath(); g.arc(r() * 1600, r() * 650, r() * 2.2 + 0.4, 0, 7); g.fill(); }
  const glow = g.createRadialGradient(1150, 300, 40, 1150, 300, 260);
  glow.addColorStop(0, "rgba(255,250,220,0.9)"); glow.addColorStop(1, "rgba(255,250,220,0)");
  g.fillStyle = glow; g.fillRect(800, 0, 800, 700);
  g.fillStyle = "#f6f0d8"; g.beginPath(); g.arc(1150, 300, 110, 0, 7); g.fill();
  g.fillStyle = "rgba(200,190,160,0.5)"; for (const [x, y, s] of [[1120, 270, 22], [1185, 330, 15], [1135, 345, 10]]) { g.beginPath(); g.arc(x, y, s, 0, 7); g.fill(); }
  const hill = (y0, color, amp, f) => { g.fillStyle = color; g.beginPath(); g.moveTo(0, 1200); for (let x = 0; x <= 1600; x += 10) g.lineTo(x, y0 + Math.sin(x / f) * amp + Math.sin(x / (f / 3)) * amp / 4); g.lineTo(1600, 1200); g.fill(); };
  hill(860, "#2b3550", 50, 260); hill(950, "#1d2438", 40, 190); hill(1050, "#11162a", 30, 140);
  g.strokeStyle = "#0a0d18"; g.lineWidth = 26; g.lineCap = "round"; g.beginPath(); g.moveTo(0, 760); g.quadraticCurveTo(300, 700, 620, 730); g.stroke();
  g.lineWidth = 10; g.beginPath(); g.moveTo(420, 715); g.lineTo(520, 640); g.stroke();
  g.fillStyle = "#0a0d18";
  g.beginPath(); g.ellipse(330, 610, 78, 110, 0, 0, 7); g.fill();
  g.beginPath(); g.arc(330, 500, 70, 0, 7); g.fill();
  g.beginPath(); g.moveTo(272, 455); g.lineTo(285, 395); g.lineTo(310, 445); g.fill();
  g.beginPath(); g.moveTo(388, 455); g.lineTo(375, 395); g.lineTo(350, 445); g.fill();
  g.fillStyle = "#e8c45a"; for (const x of [303, 357]) { g.beginPath(); g.arc(x, 495, 17, 0, 7); g.fill(); }
  g.fillStyle = "#0a0d18"; for (const x of [303, 357]) { g.beginPath(); g.arc(x, 497, 7, 0, 7); g.fill(); }
  g.fillStyle = "#c98a3a"; g.beginPath(); g.moveTo(322, 515); g.lineTo(338, 515); g.lineTo(330, 535); g.fill();
  const img = g.getImageData(0, 0, 1600, 1200); for (let i = 0; i < img.data.length; i += 4) { const n = (r() - 0.5) * 14; img.data[i] += n; img.data[i + 1] += n; img.data[i + 2] += n; } g.putImageData(img, 0, 0);
  return c.toDataURL("image/jpeg", 0.86);
});
const fs = await import("node:fs");
fs.writeFileSync(out, Buffer.from(data.split(",")[1], "base64"));
await browser.close();
