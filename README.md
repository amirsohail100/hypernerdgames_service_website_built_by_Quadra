<p align="center">
  <img src="<QUADRA_LOGO_PATH>" alt="Quadra logo" width="180">
</p>

<p align="center">
  <img src="<HYPERNERDGAMES_LOGO_PATH>" alt="HypernerdGames logo" width="320">
</p>

<h1 align="center">HypernerdGames Website</h1>

<p align="center">
  <a href="#getting-started"><img src="https://img.shields.io/badge/type-static%20site-0f0d0d?style=flat-square" alt="Static site"></a>
  <a href="#getting-started"><img src="https://img.shields.io/badge/build-none-D90037?style=flat-square" alt="No build step"></a>
  <a href="#license"><img src="https://img.shields.io/badge/license-proprietary-7A706B?style=flat-square" alt="License"></a>
</p>

The official website of **HypernerdGames**, an independent game studio. The site introduces the studio, showcases its game portfolio, provides a genre overview, presents the team, and offers a contact form.

The project is a dependency-free static front end written in HTML, CSS and vanilla JavaScript, with a Three.js ambient background. It needs no build step and no package manager, so it can be opened locally or deployed to any static host.

---

## Table of Contents

- [Highlights](#highlights)
- [UI Showcase](#ui-showcase)
- [Pages](#pages)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Deployment](#deployment)
- [Responsive Design](#responsive-design)
- [Customisation](#customisation)
- [Accessibility](#accessibility)
- [Browser Support](#browser-support)
- [Known Limitations](#known-limitations)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)
- [Credits](#credits)

---

## Highlights

- **Fully responsive** layout, from 320px phones to large desktop displays, in portrait and landscape
- **Mobile navigation** with a hamburger menu below 1180px
- **Live search and genre filters** on the Games and Genre pages
- **Scroll-reveal animations** and animated statistics counters
- **Light and dark themes**, with the choice remembered between visits
- **Three.js ambient background** and interactive 3D hover effects on game cards
- **Preloader and tab-aware shutter transition**
- **Reduced-motion support** via the `prefers-reduced-motion` media query

---

## UI Showcase

<!-- Replace each placeholder with the exact path to the image in assets/UI. -->

<p align="center">
  <img src="<UI_1_PATH>" alt="<UI_1_ALT>" width="900">
  <br>
  <em><UI_1_CAPTION></em>
</p>

<p align="center">
  <img src="<UI_2_PATH>" alt="<UI_2_ALT>" width="900">
  <br>
  <em><UI_2_CAPTION></em>
</p>

<p align="center">
  <img src="<UI_3_PATH>" alt="<UI_3_ALT>" width="900">
  <br>
  <em><UI_3_CAPTION></em>
</p>

<p align="center">
  <img src="<UI_4_PATH>" alt="<UI_4_ALT>" width="900">
  <br>
  <em><UI_4_CAPTION></em>
</p>

---

## Pages

| Page | File | Description |
|------|------|-------------|
| Home | `pages/home.html` | Hero, brand marquee, studio statistics, featured titles |
| Games | `pages/games.html` | Full catalogue with search and genre filters |
| Genre | `pages/genre.html` | Genre overview with the same search and filters |
| About | `pages/about.html` | Studio story, core values, statistics, team |
| Help | `pages/help.html` | FAQ accordion and contact form |

The root `index.html` redirects to `pages/home.html`.

---

## Architecture

The site is organised into three layers, each loaded in a fixed order on every page:

```
  Styles        style.css  →  pages.css  →  responsive.css
                (tokens & components)   (page layouts)   (breakpoint overrides)

  Scripts       main.js    →  three-bg.js
                (UI behaviour)          (WebGL, optional)

  Markup        pages/*.html
                (shared header, footer and nav on every page)
```

**`main.js`** handles the preloader and shutter, theme switching, the custom cursor, navigation state, scroll reveal (`IntersectionObserver`), statistics counters, card tilt, filtering, the toast notification, and the back-to-top button.

**`three-bg.js`** is an isolated module that runs only when Three.js is available. It renders the scroll-linked background and lazily creates a small 3D scene the first time a game card is hovered. It is skipped on touch devices and when reduced motion is requested.

**`responsive.css`** contains all breakpoint logic. Shared values such as the side gutter are defined once as CSS custom properties.

---

## Project Structure

```
.
├── index.html               # Entry point, redirects to pages/home.html
├── README.md
├── assets/
│   ├── icon/                # Studio logos (HNG and Quadra), SVG
│   ├── image/               # General images
│   └── UI/                  # UI screenshots used in the showcase
├── css/
│   ├── style.css            # Design tokens, base styles, core components
│   ├── pages.css            # Page header, FAQ, genre panel styles
│   └── responsive.css       # Responsive layer, loaded last
├── js/
│   ├── main.js              # Preloader, theme, filters, navigation, reveal, forms
│   └── three-bg.js          # Three.js ambient scene and card hover scenes
└── pages/
    ├── home.html
    ├── games.html
    ├── genre.html
    ├── about.html
    └── help.html
```

---

## Getting Started

### Prerequisites

- A modern web browser
- Internet access for the CDN-hosted dependencies (see below)
- Optional: Python 3 or any other static file server

### Run locally

```bash
git clone <repository-url>
cd hypernerdgames_service_website_built_by_Quadra
python3 -m http.server 8000
```

Open `http://localhost:8000`. You will be redirected to the home page.

Opening the HTML files directly from the file system also works, but serving over HTTP is recommended.

### External dependencies

| Dependency | Version | Source | Used for |
|------------|---------|--------|----------|
| Three.js | r128 | `cdnjs.cloudflare.com` | Ambient background and card 3D effects |
| Bebas Neue, DM Sans, Barlow Condensed | — | Google Fonts | Typography |

If these cannot be reached, the 3D effects are skipped and fallback fonts are used. The layout and all functionality remain available.

---

## Deployment

Because the site is fully static, it can be hosted on any static platform, such as GitHub Pages, Netlify, Vercel, Cloudflare Pages, or a standard web server.

- **Publish the repository root.** The root `index.html` handles the redirect to the home page.
- **Use HTTPS** so that CDN resources and any future form integration load without warnings.
- **Before going live,** complete the items under [Known Limitations](#known-limitations).

---

## Responsive Design

The layout is designed mobile-first and adapts to each viewport:

| Breakpoint | Behaviour |
|------------|-----------|
| `≤ 1180px` | Navigation collapses into a hamburger menu |
| `≤ 900px` | Two-column stats; About and Contact stack to one column |
| `≤ 560px` | Single-column team and forms; full-width buttons; mobile menu CTA |
| `≤ 360px` | Compact typography and spacing for small phones |
| Landscape, height `≤ 520px` | Reduced hero spacing |

Additional details:

- A shared `--gutter` variable controls horizontal padding across all sections.
- Headings and body text scale with `clamp()`.
- Tap targets are at least 44px on touch devices, and form inputs use a 16px font size to prevent automatic zoom on iOS.
- Game cards scroll horizontally with snap alignment on touch screens.
- Pages are designed not to scroll horizontally at any supported width.

All responsive rules are in `css/responsive.css`.

---

## Customisation

| What to change | Where |
|----------------|-------|
| Brand colours and typefaces | `:root` variables at the top of `css/style.css` |
| Gutter width and menu breakpoint | `--gutter` and `--nav-break` in `css/responsive.css` |
| Game cards | `.game-card` blocks in `pages/home.html`, `pages/games.html`, `pages/genre.html` |
| Team members | `.member` blocks in `pages/about.html` |
| FAQ entries | `<details>` blocks in `pages/help.html` |

### Adding a game

1. Copy an existing `.game-card` block into the Home, Games and Genre pages.
2. Set `data-title` to the game name and `data-genre` to `rpg`, `sci-fi`, or `action`.
3. For a new genre, add a matching `.filter-btn` with the same `data-filter` value.

### Theme persistence

The selected theme is stored in `localStorage` under the key `hn-theme`.

---

## Accessibility

- Semantic landmarks (`nav`, `main`, `footer`) and labelled controls, including the theme toggle, menu button, search field and back-to-top button
- Visible keyboard focus styles
- Native `<details>` elements for the FAQ, which are keyboard-operable by default
- Form fields have associated `<label>` elements and use native validation
- Motion is reduced or disabled when the user requests it

Accessibility has not been formally audited. Please run an audit with a tool such as Lighthouse or axe before a major release.

---

## Browser Support

Targeted at the current and previous major versions of Chrome, Edge, Firefox, Safari and their mobile equivalents. The 3D effects require WebGL. Where WebGL is unavailable, the static design is shown instead.

---

## Known Limitations

- **Contact form is a demo.** `handleForm()` in `js/main.js` shows a confirmation message but does not send any data. Connect it to a backend or email service before launch.
- **Placeholder links.** Game "Explore" links and footer social links use `href="#"`.
- **Placeholder content.** Statistics, team members and game descriptions need to be replaced with final content.
- **Runtime CDN dependencies.** Google Fonts and Three.js are loaded at runtime. Self-hosting them would remove this dependency.

---

## Roadmap

Planned improvements, in suggested priority order:

1. Connect the contact form to a delivery service
2. Replace placeholder links and content with production data
3. Add `integrity` (SRI) attributes to the Three.js script tag
4. Self-host fonts and Three.js to remove third-party runtime dependencies
5. Add per-game detail pages
6. Run and address an accessibility audit

---

## Contributing

1. Branch from `main` using a descriptive name, for example `feature/contact-form` or `fix/mobile-nav`.
2. Keep changes focused, and follow the existing naming and code style.
3. Test at least one phone-sized and one desktop-sized viewport, in both light and dark themes.
4. Use [Conventional Commits](https://www.conventionalcommits.org/), for example `fix(games): ...` or `feat(css): ...`.
5. Open a pull request with a short description and before-and-after screenshots for visual changes.

---

## License

All rights reserved. This code is proprietary to HypernerdGames. Please contact the studio before reusing any part of it.

---

## Credits

Website designed by **<YOUR_NAME>**, Co-owner, **Quadra**, for **HypernerdGames**.
