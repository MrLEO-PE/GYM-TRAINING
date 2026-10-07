/*
 * Takes every screenshot used by the in-app tutorial and by case-study.html,
 * straight from the running app, so the pictures never drift from the product.
 *
 *   cd tools && npm install && npm run shots
 *
 * Writes tutorial/01..12 (the student walkthrough the app itself shows) plus
 * tutorial/13-teacher-view.png (used only by the case study).
 */
import puppeteer from 'puppeteer';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = process.env.GYM_ROOT || path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'tutorial');
const PORT = 8391;
const TYPES = { '.html': 'text/html', '.png': 'image/png', '.pdf': 'application/pdf', '.css': 'text/css' };

fs.mkdirSync(OUT, { recursive: true });

const site = http.createServer((req, res) => {
  const f = path.join(ROOT, req.url === '/' ? 'index.html' : decodeURIComponent(req.url.split('?')[0]));
  if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end('not found'); }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream' });
  fs.createReadStream(f).pipe(res);
});
await new Promise(r => site.listen(PORT, r));

const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
const page = await browser.newPage();
page.on('pageerror', e => console.log('  ! page error: ' + e.message));
page.on('dialog', async d => { await d.accept('leoleoleo'); });
await page.setRequestInterception(true);
page.on('request', r => r.url().includes('supabase.co') ? r.abort() : r.continue());   // shoot offline
await page.setViewport({ width: 1000, height: 1400, deviceScaleFactor: 2 });

await page.goto(`http://localhost:${PORT}/index.html`);
await page.evaluate(() => localStorage.setItem('igcse_theme', 'dark'));
await page.goto(`http://localhost:${PORT}/index.html`, { waitUntil: 'networkidle2' });
await new Promise(r => setTimeout(r, 1800));

// A believable student, so the pictures show a real screen rather than empty fields.
await page.evaluate(() => {
  const u = store[currentUser];
  u.machines.forEach((m, i) => {
    m.pr = [60, 45, 80, 50, 40][i] || 50;
    m.prHistory = [
      { date: '2026-09-01', pr: m.pr - 10, verified: true },
      { date: '2026-09-10', pr: m.pr - 5, verified: true },
      { date: '2026-09-20', pr: m.pr, verified: true }
    ];
    m.verifiedPr = m.pr; m.verifiedDate = '2026-09-20';
  });
  activeSlots = [0, 1, 2, 3, "", "", "", ""];
  saveRoutine();
  setGoal('hypertrophy');
  renderMachines();          // without this the 1RM shot still shows the pre-seed zeros
});
await new Promise(r => setTimeout(r, 500));

let n = 0;
async function shot(name, selector, padTop = 14, padBottom = 14, fullWidth = false) {
  n++;
  const box = await page.evaluate((s, pt, pb, fw) => {
    const el = document.querySelector(s);
    if (!el) return null;
    el.scrollIntoView({ block: 'center' });
    const r = el.getBoundingClientRect();
    return {
      x: fw ? 0 : Math.max(0, r.left - 10),
      y: Math.max(0, r.top + window.scrollY - pt),
      w: fw ? document.documentElement.clientWidth : Math.min(document.documentElement.clientWidth, r.width + 20),
      h: r.height + pt + pb
    };
  }, selector, padTop, padBottom, fullWidth);

  const label = String(n).padStart(2, '0') + '-' + name;
  if (!box) { console.log(`  ${label}  SKIPPED, no element matches ${selector}`); return; }
  await new Promise(r => setTimeout(r, 350));
  const file = path.join(OUT, label + '.png');
  await page.screenshot({ path: file, clip: { x: box.x, y: box.y, width: Math.max(60, box.w), height: Math.min(820, Math.max(60, box.h)) } });
  console.log(`  ${label.padEnd(24)} ${Math.round(fs.statSync(file).size / 1024)} KB`);
}

console.log('capturing:');
await shot('your-name', '.profile-box', 10, 10);

await page.evaluate(() => { const s = document.getElementById('machineSectionBody'); if (s) s.style.display = 'block'; });
await shot('your-1rm', '#machineList .machine-row');

await page.evaluate(() => openEpleyModal(0));
await new Promise(r => setTimeout(r, 500));
await shot('epley-table', '#epleyModal .modal-content', 6, 6);
await page.evaluate(() => closeEpleyModal());

await page.evaluate(() => openSafety(0));
await new Promise(r => setTimeout(r, 500));
await shot('safety', '#safetyModal .modal-content', 6, 6);
await page.evaluate(() => document.querySelectorAll('.modal-overlay.active').forEach(m => m.classList.remove('active')));

await shot('todays-focus', '#mode-endurance', 52, 14, true);
await shot('pick-machines', '#slotPickerContainer', 34, 44, true);
await shot('reps-and-sets', '#setsCountTabs', 22, 34, true);

await page.evaluate(() => { togglePersonalise(0); adjustLevelKg(0, 2.5); });
await new Promise(r => setTimeout(r, 500));
await shot('personalise', '#workoutLog .machine-row', 10, 10);

await page.evaluate(() => { togglePersonalise(0); toggleHitTarget(0, exerciseReps(store[currentUser].machines[0])); });
await new Promise(r => setTimeout(r, 500));
await shot('log-your-reps', '#workoutLog .machine-row', 10, 10);

await shot('save-workout', '#rpeSelect', 34, 120, true);

await page.evaluate(() => {
  const mk = d => ({
    id: 't' + d, date: `${d} Sep 2026`, isoDate: `2026-09-${String(d).padStart(2, '0')}`,
    goalKey: 'hypertrophy', goalName: 'Muscular Size', targetReps: 10, setsPlanned: 3,
    successRate: 80 + d % 15, rpe: 3,
    machines: [{ name: store[currentUser].machines[0].name, weight: 60, sets: [10, 10, 10] }]
  });
  store[currentUser].history = [20, 18, 16, 14, 12, 10, 8, 6, 4, 2].map(mk);
  store[currentUser].igcsePicks = ['t20', 't18', 't16'];
  renderHistory();
});
await new Promise(r => setTimeout(r, 500));
await shot('tick-your-8', '#historyList', 34, 10, true);

await page.evaluate(() => openIgcseLog());
await new Promise(r => setTimeout(r, 600));
await shot('download-sheet', '#igcseModal .modal-content', 6, 6);
await page.evaluate(() => closeIgcseLog());

// 13: the teacher's live view. Only the case study uses this one.
await page.setViewport({ width: 900, height: 1100, deviceScaleFactor: 2 });
await page.evaluate(() => {
  const today = new Date().toISOString().slice(0, 10);
  const names = store[currentUser].machines.map(m => m.name);
  store[currentUser].draft = {
    isoDate: today, goalKey: 'hypertrophy',
    machines: [
      { name: names[0], targetReps: 10, plannedSets: 3, sets: [10, 10, 10] },
      { name: names[1], targetReps: 10, plannedSets: 3, sets: [10, 10, null] },
      { name: names[2], targetReps: 10, plannedSets: 3, sets: [4, 4, 4] },
      { name: names[3], targetReps: 10, plannedSets: 3, sets: [14, 14, 14] }
    ]
  };
  openClassOverview();
});
await new Promise(r => setTimeout(r, 800));
await shot('teacher-view', '#classOverviewModal .modal-content', 4, 4);

await browser.close();
site.close();
console.log('done — now run: npm run case-study');
