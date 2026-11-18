# Alia's University Decision

A small static website to help explore university courses and pick 5 UCAS choices for 2027 entry. It's plain HTML, CSS and JavaScript, with no build step, no backend and no trackers.

## Files

```
index.html             page structure and fixed content (explainer, dates, checklist)
styles.css             all styling (mobile first, light and dark mode)
app.js                 tabs, countdown, search, shortlists, My 5 and checklist
data/universities.json university id → name + UCAS provider page
data/courses.json      every shortlisted course; "list" is single / science / business
data/subjects.json     Single honours subject groups, blurbs and UCAS guide/search links
data/disciplines.json  Overview tab subject list (★ / ⚠ flags)
```

To change a course, offer or link, edit the JSON files. You don't need to touch the HTML.

## Viewing it locally

The site loads its data with `fetch`, so it needs a local web server. Double-clicking `index.html` won't work. From this folder, run:

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000.

## Publishing on GitHub Pages

1. Create a new **public** repo called `alias-university-decision` on GitHub. Leave it empty, without a README.
2. From this folder, run:

```bash
git init -b main
```

```bash
git add index.html styles.css app.js data README.md .gitignore
```

```bash
git commit -m "Initial site"
```

```bash
git remote add origin https://github.com/<your-username>/alias-university-decision.git
```

```bash
git push -u origin main
```

3. On GitHub, go to **Settings → Pages**, set **Source** to *Deploy from a branch*, then pick branch `main` and folder `/ (root)`. Save.
4. After a minute or so the site will be live at `https://<your-username>.github.io/alias-university-decision/`.

All paths are relative, so it works from that sub-path without any changes.

## Notes

- Saved picks, checklist ticks and the last open tab are stored in the browser's `localStorage`, on that device only.
- The page has `noindex, nofollow`, so search engines are asked not to list it. Anyone with the link can still open it.
