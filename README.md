# Dina Dashboard Wireframe (Runnable)

Static HTML/CSS/JS wireframe for a **Google Ads Waste & Opportunity Intelligence Platform** UX.

This is a **decision-first** wireframe (finding-first UX), not a reporting dashboard.

## What’s inside

- `index.html`: Main shell layout (sidebar + topbar + `#pages` container)
- `pages/*.html`: “Page partials” loaded into `index.html`
- `assets/css/wireframe.css`: Styles
- `assets/js/partials-loader.js`: Loads page partials with `fetch("pages/<id>.html")`
- `assets/js/wireframe.js`: Navigation + UI wiring (wireframe behavior)

## Run locally

Because the app loads partial HTML via `fetch()`, it must be served over HTTP. Opening `index.html` via `file://` may fail due to browser security rules.

From the project root:

```bash
python3 -m http.server 8000
```

Then open:

- `http://localhost:8000/`

## Deploy to GitHub Pages

1. Push the repo to GitHub
2. In GitHub: **Repo → Settings → Pages**
3. **Source**: “Deploy from a branch”
4. **Branch**: `main`
5. **Folder**: `/ (root)`

GitHub will publish your site at:

- `https://<YOUR_USERNAME>.github.io/<REPO_NAME>/`

## Notes / conventions

- Page partials must use a top-level `<section class="page" id="...">` whose `id` matches the route/hash (example: `id="competitors"`).
- New pages should be added to the `pageOrder` array in `assets/js/partials-loader.js` so they load in the intended order.

## License

Private/internal wireframe (add a license if you plan to open-source).

