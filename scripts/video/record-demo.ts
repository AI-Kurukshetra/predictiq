import { chromium, Browser, Page } from "playwright";
import * as fs from "fs";

const TIMING_PATH = "scripts/video/scene-timings.json";
const SCRIPT_PATH = "scripts/video/demo-script.json";
const BASE_URL = "http://localhost:3000";

interface SceneTiming { id: string; scene_duration_ms: number; start_ms: number; end_ms: number; }
interface Timings { total_duration_ms: number; scenes: SceneTiming[]; }
interface SceneAction { type: string; url?: string; selector?: string; value?: string; y?: number; speed?: string; ms?: number; typeSpeed?: number; }
interface Scene { id: string; title: string; narration: string; actions: SceneAction[]; }

async function sleep(ms: number) { return new Promise(resolve => setTimeout(resolve, ms)); }

async function executeAction(page: Page, action: SceneAction) {
  try {
    switch (action.type) {
      case "goto":
        await page.goto(action.url || BASE_URL, { waitUntil: "networkidle", timeout: 10000 });
        break;
      case "wait":
        await sleep(action.ms || 1000);
        break;
      case "scroll":
        await page.evaluate((y) => window.scrollTo({ top: y, behavior: "smooth" }), action.y || 0);
        await sleep(800);
        break;
      case "fill":
        if (action.selector) {
          await page.click(action.selector).catch(() => {});
          await page.fill(action.selector, "");
          for (const char of (action.value || "").split("")) {
            await page.keyboard.type(char, { delay: action.typeSpeed || 50 });
          }
        }
        break;
      case "click":
        if (action.selector) {
          for (const sel of action.selector.split(", ")) {
            try { await page.click(sel.trim(), { timeout: 3000 }); break; } catch { continue; }
          }
        }
        break;
      case "waitForNavigation":
        await page.waitForLoadState("networkidle", { timeout: 10000 }).catch(() => {});
        await sleep(500);
        break;
      case "highlight":
        if (action.selector) {
          await page.evaluate((sel) => {
            const el = document.querySelector(sel);
            if (el) { (el as HTMLElement).style.outline = "3px solid #3B82F6"; (el as HTMLElement).style.outlineOffset = "4px"; }
          }, action.selector);
          await sleep(action.ms || 1500);
          await page.evaluate((sel) => {
            const el = document.querySelector(sel);
            if (el) { (el as HTMLElement).style.outline = ""; (el as HTMLElement).style.outlineOffset = ""; }
          }, action.selector);
        }
        break;
    }
  } catch (err) {
    console.log(`  Warning: ${action.type} failed: ${(err as Error).message}`);
  }
}

async function main() {
  if (!fs.existsSync(TIMING_PATH)) { console.error("ERROR: Run generate-audio.py first!"); process.exit(1); }

  const timings: Timings = JSON.parse(fs.readFileSync(TIMING_PATH, "utf-8"));
  const scenes: Scene[] = JSON.parse(fs.readFileSync(SCRIPT_PATH, "utf-8"));

  console.log(`Scenes: ${scenes.length}`);
  console.log(`Duration: ${timings.total_duration_ms / 1000}s\n`);

  const browser: Browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    recordVideo: { dir: "scripts/video/", size: { width: 1280, height: 720 } }
  });
  const page = await context.newPage();
  const syncLog: { id: string; expected_ms: number; actual_ms: number; drift_ms: number }[] = [];

  for (let i = 0; i < scenes.length; i++) {
    const scene = scenes[i];
    const timing = timings.scenes[i];
    console.log(`▶ ${scene.id}: ${scene.title} (${timing.scene_duration_ms}ms)`);
    const sceneStart = Date.now();

    for (const action of scene.actions) { await executeAction(page, action); }

    const elapsed = Date.now() - sceneStart;
    const remaining = timing.scene_duration_ms - elapsed;
    if (remaining > 0) await sleep(remaining);

    const actual = Date.now() - sceneStart;
    const drift = actual - timing.scene_duration_ms;
    syncLog.push({ id: scene.id, expected_ms: timing.scene_duration_ms, actual_ms: actual, drift_ms: drift });
    console.log(`  ${Math.abs(drift) < 500 ? "✅" : "⚠️"} Drift: ${drift > 0 ? "+" : ""}${drift}ms`);
  }

  await page.close();
  await context.close();
  await browser.close();

  fs.writeFileSync("scripts/video/sync-report.json", JSON.stringify(syncLog, null, 2));
  const maxDrift = Math.max(...syncLog.map(s => Math.abs(s.drift_ms)));
  console.log(`\nMax drift: ${maxDrift}ms`);
  console.log(maxDrift < 500 ? "✅ SYNC OK" : "⚠️ SYNC ISSUES");
}

main().catch(console.error);
