import puppeteer from "puppeteer-core";
import assert from "node:assert/strict";

const base = "http://127.0.0.1:4173";
const browser = await puppeteer.launch({
  executablePath: "/usr/bin/google-chrome",
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});
const page = await browser.newPage();
await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 1 });

async function open(path, expected) {
  await page.goto(`${base}${path}`, { waitUntil: "networkidle0" });
  const result = await page.evaluate(() => ({
    path: location.pathname,
    width: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
    inputs: document.querySelectorAll("input, textarea, [contenteditable='true']").length,
    body: document.body.innerText,
    dock: (() => {
      const el = document.querySelector(".hj-dock");
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { left: r.left, right: r.right, bottom: r.bottom, width: r.width };
    })(),
  }));
  assert.equal(result.path, path);
  assert.ok(result.body.includes(expected), `${path} missing ${expected}`);
  assert.ok(result.scrollWidth <= result.width + 1, `${path} horizontal overflow ${result.scrollWidth} > ${result.width}`);
  assert.equal(result.inputs, 0, `${path} unexpectedly exposes text input UI`);
  assert.ok(result.dock, `${path} missing bottom dock`);
  assert.ok(result.dock.left >= 0 && result.dock.right <= 390.5 && result.dock.bottom <= 844.5, `${path} dock leaves viewport`);
  console.log("LAYOUT_PASS", path, JSON.stringify(result.dock));
}

await open("/", "현준이의 작은 마을");
await page.locator("button.hj-place.run").click();
await page.waitForFunction(() => location.pathname === "/race", { timeout: 2500 });
console.log("NAV_PASS", "/ -> /race");

await open("/greenhouse", "현준이의 반짝 농장");
await page.locator(".hj-plots button").click();
await page.waitForFunction(() => document.querySelector(".hj-plots button")?.textContent?.includes("물 주기"));
const farmSaved = await page.evaluate(() => Boolean(localStorage.getItem("hyunjun-game-v2")));
assert.equal(farmSaved, true, "farm touch did not persist v2 save");
console.log("FARM_TOUCH_PASS");

await open("/house", "현준이의 포근한 집");
const closetButtons = await page.$$(".hj-closet button");
assert.ok(closetButtons.length >= 2, "house outfit buttons missing");
await closetButtons[1].click();
await page.waitForFunction(() => document.querySelectorAll(".hj-closet button")[1]?.classList.contains("selected"));
console.log("HOUSE_TOUCH_PASS");

await open("/race", "박현준 러너");
await page.locator(".hj-run-card .hj-big").click();
await new Promise((resolve) => setTimeout(resolve, 650));
const runner = await page.evaluate(() => ({
  progress: Number.parseFloat(document.querySelector(".hj-progress i")?.style.width || "0"),
  text: document.body.innerText,
}));
assert.ok(runner.progress > 0, "runner did not advance after touch start");
assert.ok(runner.text.includes("1/5"), "runner stage HUD missing");
console.log("RUNNER_TOUCH_PASS", runner.progress);

await browser.close();
console.log("HYUNJUN_BROWSER_ACCEPTANCE_PASS");
