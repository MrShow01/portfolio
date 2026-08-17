# Mohamed El Shehawy — Portfolio

Personal portfolio for **Mohamed El Shehawy**, Senior Flutter Developer.
Plain HTML, CSS and JavaScript — no framework, no build step, no dependencies.

**Live:** enable GitHub Pages on this repo (Settings → Pages → *Source: GitHub Actions*).

---

## Contents

| Section | What it covers |
| --- | --- |
| Hero | Name, rotating role, headline stats, CV download |
| About | Summary, quick facts, spoken languages |
| Skills | Platforms, framework, languages, state management, backend, architecture, tools, integrations |
| Experience | Timeline from N.I.T (2021) through E-Systematic (present), plus freelance and teaching |
| Projects | Egypt Real Estate (featured) + Kimcam Academy, Van Salis GAIA AI, TechNex Store, Fix EGY Services, Lime Kuwait — each linked to its live store listing |
| Education | B.Sc. Computer Science, Mansoura University |
| Contact | Email, phone, LinkedIn, GitHub, copy-to-clipboard |

## Files

```
index.html                     # all markup, meta tags, JSON-LD structured data
assets/css/styles.css          # design tokens + every component style
assets/js/main.js              # theme, nav, scroll effects, counters, typewriter
assets/img/favicon.svg         # gradient "M" mark
assets/img/og-image.png        # 1200×630 social preview card
assets/files/…-CV.pdf          # CV served by the "Download CV" button
.github/workflows/deploy.yml   # GitHub Pages deployment
```

## Features

- **Dark and light themes** — follows the OS preference on first visit, remembers the choice in `localStorage`, and is applied before first paint so there's no flash.
- **Responsive** from 320 px phones to wide desktops; the nav collapses to a sheet under 960 px.
- **Accessible** — skip link, focus-visible rings, ARIA labels on icon-only controls, keyboard-dismissable menu, semantic landmarks.
- **Motion-aware** — every animation, the typewriter and the counters short-circuit under `prefers-reduced-motion: reduce`.
- **SEO-ready** — Open Graph and Twitter cards, canonical URL, and `Person` JSON-LD.
- **Zero dependencies** — the only external request is the Google Fonts stylesheet.

## Running locally

Open `index.html` directly, or serve it so that the clipboard API and relative paths behave exactly as in production:

```bash
python3 -m http.server 8000
# → http://localhost:8000
```

## Customising

- **Colours** — every colour lives in the `:root` / `[data-theme='light']` token blocks at the top of `assets/css/styles.css`.
- **Rotating roles** — the `roles` array in the typewriter section of `assets/js/main.js`.
- **Content** — all copy is plain markup in `index.html`; sections are separated by banner comments.
- **Social card** — replace `assets/img/og-image.png` (keep it 1200×630).
