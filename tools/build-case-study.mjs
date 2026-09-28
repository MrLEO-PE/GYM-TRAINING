/*
 * Builds case-study.html: one self-contained page with every screenshot embedded,
 * so it can be dropped into a portfolio site with no image folder alongside it.
 *
 *   cd tools && npm install && npm run case-study
 *
 * Run capture-screenshots.mjs first if the app has changed.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SHOTS = path.join(ROOT, 'tutorial');
const OUT = path.join(ROOT, 'case-study.html');

function shot(name) {
  const f = path.join(SHOTS, name);
  if (!fs.existsSync(f)) throw new Error(`missing screenshot: ${name} — run "npm run shots" first`);
  return 'data:image/png;base64,' + fs.readFileSync(f).toString('base64');
}

// Edit the wording here; the pictures come from whatever capture-screenshots.mjs produced.
const sections = [
  {
    id: 'setup',
    title: 'Getting a student started',
    lead: 'Every target the app produces is derived from one number per machine: the student’s one-rep max. Getting that right, safely, is the first job.',
    figures: [
      ['01-your-name.png', 'Students pick themselves from a shared class list. On a tablet passed between two students, switching takes one tap and loads that student’s own history.'],
      ['02-your-1rm.png', 'Each machine holds a verified 1RM. The small line beside it is that student’s 1RM trend across the term — green when climbing.'],
      ['03-epley-table.png', 'Most students cannot safely attempt a true one-rep max. The Epley table derives it from a manageable weight and rep count instead.'],
      ['04-safety.png', 'Teacher-written set-up and safety rules sit on each machine, shared across the whole class.']
    ]
  },
  {
    id: 'plan',
    title: 'Planning a lesson',
    lead: 'The syllabus trains three zones, each with its own load, rep and set ranges. The app enforces those ranges rather than trusting free text, so a student cannot set a target that contradicts the zone they picked.',
    figures: [
      ['05-todays-focus.png', 'Three training zones. Each sets the working weight as a percentage of 1RM, and its own rep and set windows.'],
      ['06-pick-machines.png', 'Eight machine slots by default, extendable to thirteen — the number of exercise rows on the Cambridge log sheet, so a session can never overflow the form it is submitted on.'],
      ['07-reps-and-sets.png', 'Reps and sets are chosen once for the session. The options shown change with the zone.'],
      ['08-personalise.png', 'Per-machine overrides are folded away by default to keep the screen calm. Once a machine differs, the button itself states how.']
    ]
  },
  {
    id: 'train',
    title: 'Logging the session',
    lead: 'Scoring is per machine, not per session, so mixed targets stay honest: a machine set to four sets of ten is worth more than one set to three.',
    figures: [
      ['09-log-your-reps.png', 'Reps are entered per set. Going over the target flags the working weight as too light rather than scoring as a perfect set.'],
      ['10-save-workout.png', 'A session score is how close the student came to their own targets, not to anyone else’s.']
    ]
  },
  {
    id: 'teacher',
    title: 'Watching a lesson happen',
    lead: 'The hardest part of a fifty-minute practical lesson is knowing who needs attention. In-progress reps sync to the cloud a couple of seconds after a student stops typing, so the teacher sees the room without walking it.',
    figures: [
      ['13-teacher-view.png', 'Green means every set is in, orange means still under way. The panel re-reads the cloud every twenty seconds. Warnings name the exercise and the problem — short of target, or past it on a weight that is too light.']
    ]
  },
  {
    id: 'submit',
    title: 'Producing the coursework',
    lead: 'The end product is an official Cambridge form. It has room for exactly eight sessions, so the app makes that limit explicit rather than silently truncating a term’s work.',
    figures: [
      ['11-tick-your-8.png', 'Students choose which eight sessions represent their programme. Choices are held per session, so deleting one does not silently shift the selection onto another.'],
      ['12-download-sheet.png', 'The official template is filled and flattened, so it prints identically on a tablet and a laptop. Teachers can also export the whole class as a single PDF, one page per student.']
    ]
  }
];

const facts = [
  ['One file, no build step', 'The whole app is a single HTML file served as a static page. Nothing to install on school devices and nothing to deploy beyond a commit.'],
  ['Works on the devices a class actually has', 'Verified on phone, tablet and laptop widths, in light and dark themes, with touch-sized controls throughout.'],
  ['Shared cloud state', 'A class shares one dataset. Writes are queued rather than fired in parallel, so a slow save cannot overwrite a newer one.'],
  ['Built around the syllabus', 'Training zones, rep and set windows, the thirteen-exercise limit and the eight-session sheet all come from the Cambridge specification rather than being invented.']
];

const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const figure = (file, caption, eager) => `
        <figure>
          <img src="${shot(file)}" alt="${esc(caption).slice(0, 120)}" loading="${eager ? 'eager' : 'lazy'}">
          <figcaption>${caption}</figcaption>
        </figure>`;

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>IGCSE PE Gym Tracker</title>
<meta name="description" content="A single-page training tracker built for a Cambridge IGCSE PE class, from first login to the submitted coursework sheet.">
<style>
  :root {
    color-scheme: light;
    --bg: #f6f8fa; --card: #ffffff; --line: #d8dee4;
    --ink: #1f2328; --soft: #57606a; --accent: #0550ae; --accent-soft: #ddf4ff;
    --radius: 12px;
  }
  @media (prefers-color-scheme: dark) {
    :root:not([data-theme="light"]) {
      color-scheme: dark;
      --bg: #0d1117; --card: #161b22; --line: #30363d;
      --ink: #e6edf3; --soft: #9198a1; --accent: #58a6ff; --accent-soft: #10243e;
    }
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    background: var(--bg); color: var(--ink); line-height: 1.6;
    -webkit-text-size-adjust: 100%;
  }
  .wrap { max-width: 900px; margin: 0 auto; padding: 0 16px 80px; }
  header { padding: 64px 0 36px; border-bottom: 1px solid var(--line); margin-bottom: 40px; }
  .eyebrow { font-size: .8rem; letter-spacing: .09em; text-transform: uppercase; color: var(--accent); font-weight: 700; }
  h1 { font-size: clamp(2rem, 5.5vw, 3rem); line-height: 1.15; margin: 10px 0 16px; letter-spacing: -.02em; }
  .stand { font-size: clamp(1.02rem, 2.4vw, 1.18rem); color: var(--soft); max-width: 62ch; }
  .meta { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 24px; }
  .chip { font-size: .78rem; font-weight: 600; color: var(--accent); background: var(--accent-soft);
          border: 1px solid color-mix(in srgb, var(--accent) 35%, transparent); border-radius: 999px; padding: 4px 12px; }
  h2 { font-size: clamp(1.3rem, 3.4vw, 1.6rem); letter-spacing: -.01em; margin-bottom: 8px; }
  section { margin-bottom: 56px; scroll-margin-top: 20px; }
  .lead { color: var(--soft); max-width: 68ch; margin-bottom: 26px; }
  figure { background: var(--card); border: 1px solid var(--line); border-radius: var(--radius);
           overflow: hidden; margin-bottom: 20px; }
  figure img { width: 100%; height: auto; display: block; }
  figcaption { font-size: .88rem; color: var(--soft); padding: 12px 16px; border-top: 1px solid var(--line); }
  .facts { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 14px; }
  .fact { background: var(--card); border: 1px solid var(--line); border-radius: var(--radius); padding: 16px 18px; }
  .fact h3 { font-size: .95rem; margin-bottom: 6px; }
  .fact p { font-size: .86rem; color: var(--soft); }
  nav { position: sticky; top: 0; background: color-mix(in srgb, var(--bg) 88%, transparent);
        backdrop-filter: blur(8px); border-bottom: 1px solid var(--line); z-index: 5; }
  nav ul { max-width: 900px; margin: 0 auto; padding: 10px 16px; display: flex; gap: 18px;
           list-style: none; overflow-x: auto; font-size: .84rem; }
  nav a { color: var(--soft); text-decoration: none; white-space: nowrap; }
  nav a:hover { color: var(--accent); }
  footer { border-top: 1px solid var(--line); padding-top: 22px; color: var(--soft); font-size: .84rem; }
  @media (prefers-reduced-motion: reduce) { * { transition: none !important; } }
</style>
</head>
<body>

<nav><ul>
${sections.map(s => `  <li><a href="#${s.id}">${s.title}</a></li>`).join('\n')}
  <li><a href="#build">How it is built</a></li>
</ul></nav>

<div class="wrap">
  <header>
    <p class="eyebrow">Cambridge IGCSE Physical Education</p>
    <h1>Gym Tracker</h1>
    <p class="stand">
      A training tracker built for my own IGCSE PE class. Students record what they lift on shared
      tablets during a fifty-minute practical lesson; the app turns that into the weight training log
      the exam board actually asks for.
    </p>
    <div class="meta">
      <span class="chip">Single-page web app</span>
      <span class="chip">Shared cloud state</span>
      <span class="chip">Fills the official Cambridge form</span>
      <span class="chip">Phone, tablet &amp; laptop</span>
    </div>
  </header>

${sections.map(s => `  <section id="${s.id}">
    <h2>${s.title}</h2>
    <p class="lead">${s.lead}</p>
${s.figures.map((f, i) => figure(f[0], f[1], i === 0)).join('\n')}
  </section>`).join('\n\n')}

  <section id="build">
    <h2>How it is built</h2>
    <p class="lead">Constraints first: school tablets, patchy wi-fi, no install, and coursework that goes to an exam board.</p>
    <div class="facts">
${facts.map(f => `      <div class="fact"><h3>${f[0]}</h3><p>${f[1]}</p></div>`).join('\n')}
    </div>
  </section>

  <footer>Screenshots taken from the running application.</footer>
</div>

</body>
</html>`;

fs.writeFileSync(OUT, html, 'utf8');
const imgs = sections.reduce((n, s) => n + s.figures.length, 0);
console.log(`wrote ${path.relative(ROOT, OUT)} — ${imgs} screenshots embedded, ${Math.round(fs.statSync(OUT).size / 1024)} KB, self-contained`);
