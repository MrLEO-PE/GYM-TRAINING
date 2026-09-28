# GYM-TRAINING

A weight training tracker for a Cambridge IGCSE PE class. Students log what they lift on shared
tablets during a lesson; the app turns that into the official Cambridge weight training log.

| File | What it is |
| --- | --- |
| `index.html` | The whole app. A single static page — open it, or serve it, nothing to build. |
| `weight_training_log_template.pdf` | The official Cambridge form the app fills in. |
| `tutorial/` | Screenshots used by the in-app tutorial and by the case study. |
| `case-study.html` | A self-contained portfolio page. Every screenshot is embedded, so this one file can be dropped into any website on its own. |
| `tools/` | Scripts that regenerate the two items above. |

## Updating the tutorial and the case study after changing the app

The screenshots are captured from the running app, so they go stale when the interface changes.
Both are regenerated from one command:

```bash
cd tools
npm install      # first time only; downloads a headless browser
npm run all      # re-shoots every screenshot, then rebuilds case-study.html
```

Or separately:

```bash
npm run shots        # tutorial/01..12 (shown in the app) + 13-teacher-view.png (case study only)
npm run case-study   # rebuilds case-study.html from whatever is in tutorial/
```

Then copy `case-study.html` wherever the portfolio lives — it needs no other files.

If the capture step says **Could not find Chrome**, the browser download was interrupted.
Run `npx puppeteer browsers install chrome` inside `tools/` and try again.

All screenshots are taken in dark theme, so the set stays visually consistent.

### Changing the words rather than the pictures

- Captions in the in-app tutorial live in the `TUTORIAL` array in `index.html`.
- Headings and captions in the case study live in `sections` near the top of
  `tools/build-case-study.mjs`.

### Adding a step

Add a `shot(...)` call in `tools/capture-screenshots.mjs` — the numbering is automatic from the
order the calls appear, so inserting one renumbers the rest. Then reference the new filename in
whichever of the two places should show it.
