# HypernerdGames Website

The official website for **HypernerdGames**, an independent game studio. The site presents the studio, its game portfolio, genre overview, team, and contact information.

It is a static, dependency-free front end built with HTML, CSS, and vanilla JavaScript, with a Three.js ambient background. There is no build step and no package manager.

---

## Table of Contents

- [Features](#features)
- [Pages](#pages)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Responsive Design](#responsive-design)
- [Configuration and Customisation](#configuration-and-customisation)
- [Browser Support](#browser-support)
- [Known Limitations](#known-limitations)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [Credits](#credits)

---

## Features

- **Responsive layout** that adapts from 320px phones to large desktop displays, in portrait and landscape
- **Mobile navigation** with a hamburger menu below 1180px
- **Live game search and genre filters** on the Games and Genre pages
- **Scroll-reveal animations** and animated statistics counters
- **Light and dark themes**, with the choice saved between visits
- **3D ambient background** and interactive 3D hover effects on game cards (Three.js)
- **Preloader and shutter transition**, which also reacts when the user leaves or returns to the tab
- **Accessible markup** with ARIA labels, keyboard focus styles, and reduced-motion support

---

## Pages

| Page  | File               | Description                                             |
| ----- | ------------------ | ------------------------------------------------------- |
| Home  | `pages/home.html`  | Hero, brand marquee, studio statistics, featured titles |
| Games | `pages/games.html` | Full game catalogue with search and genre filters       |
| Genre | `pages/genre.html` | Genre overview with the same search and filters         |
| About | `pages/about.html` | Studio story, core values, statistics, team             |
| Help  | `pages/help.html`  | FAQ accordion and contact form                          |

`index.html` at the root redirects to `pages/home.html`.

---

## Project Structure

```
.
├── index.html               # Entry point, redirects to pages/home.html
├── README.md
├── css/
│   ├── style.css            # Design tokens, base styles, core components
│   ├── pages.css            # Page header, FAQ, and genre panel styles
│   └── responsive.css       # Responsive layer, loaded last
├── js/
│   ├── main.js              # Preloader, theme, filters, navigation, reveal, counters, forms
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
- An internet connection, for the CDN-hosted dependencies listed below
- Optional: Python 3, or any other static file server

### Run locally

```bash
git clone <repository-url>
cd hypernerdgames_service_website_built_by_Quadra
python3 -m http.server 8000
```

Open `http://localhost:8000` in your browser. You will be redirected to the home page.

Opening the HTML files directly from the file system also works, but serving them over HTTP is recommended.

### External dependencies

Loaded at runtime from a CDN:

| Dependency                            | Version | Source                 |
| ------------------------------------- | ------- | ---------------------- |
| Three.js                              | r128    | `cdnjs.cloudflare.com` |
| Bebas Neue, DM Sans, Barlow Condensed | —       | Google Fonts           |

If these cannot be reached, the 3D background is skipped and fallback fonts are used. All layout and functionality remain available.

---

## Responsive Design

The layout is designed mobile-first and adapts to each viewport:

| Breakpoint                  | Behaviour                                                              |
| --------------------------- | ---------------------------------------------------------------------- |
| `≤ 1180px`                  | Navigation collapses into a hamburger menu                             |
| `≤ 900px`                   | Two-column stats and team grids; About and Contact stack to one column |
| `≤ 560px`                   | Single-column layouts, full-width buttons, mobile menu CTA             |
| `≤ 360px`                   | Compact typography and spacing for small phones                        |
| `landscape, height ≤ 520px` | Reduced hero spacing                                                   |

Additional details:

- A shared `--gutter` variable controls horizontal padding across all sections.
- Headings and body text scale with `clamp()`.
- On touch devices, tap targets are at least 44px and form inputs use a 16px font size to prevent automatic zoom on iOS.
- Game cards scroll horizontally with snap alignment on touch screens.
- No page should scroll horizontally at any supported width.

All responsive rules live in `css/responsive.css`.

---

## Configuration and Customisation

| What to change                   | Where                                                                            |
| -------------------------------- | -------------------------------------------------------------------------------- |
| Brand colours and typefaces      | `:root` variables at the top of `css/style.css`                                  |
| Gutter width and menu breakpoint | `--gutter` and `--nav-break` in `css/responsive.css`                             |
| Game cards                       | `.game-card` blocks in `pages/home.html`, `pages/games.html`, `pages/genre.html` |
| Team members                     | `.member` blocks in `pages/about.html`                                           |
| FAQ entries                      | `<details>` blocks in `pages/help.html`                                          |

### Adding a game

1. Copy an existing `.game-card` block into the games and genre pages.
2. Set `data-title` to the game name and `data-genre` to one of `rpg`, `sci-fi`, or `action`.
3. If you add a new genre, also add a matching `.filter-btn` with the same `data-filter` value.

### Theme persistence

The selected theme is stored in `localStorage` under the key `hn-theme`.

---

## Browser Support

| Browser                                           | Support |
| ------------------------------------------------- | ------- |
| Chrome, Edge (current and previous major version) | Full    |
| Firefox (current)                                 | Full    |
| Safari, iOS Safari (current)                      | Full    |

The 3D effects require WebGL. Where WebGL is unavailable, the site falls back to its static design.

---

## Known Limitations

- **Contact form is a demo.** `handleForm()` in `js/main.js` only displays a confirmation message. It does not send data. Connect it to a backend or email service before launch.
- **Placeholder links.** Game "Explore" links and footer social links currently use `href="#"`.
- **Placeholder content.** Statistics, team members, and game descriptions should be replaced with final content.

---

## Roadmap

- Connect the contact form to a real delivery service
- Replace placeholder links and content with production data
- Add per-game detail pages
- Add an accessibility audit and fix any findings
- Consider self-hosting fonts and Three.js to remove third-party runtime dependencies

---

## Contributing

1. Create a feature branch from `main`.
2. Make focused changes. Follow the existing naming and code style.
3. Test at least one phone-sized and one desktop-sized viewport, in both themes.
4. Use [Conventional Commits](https://www.conventionalcommits.org/) for commit messages, for example `fix(games): ...` or `feat(css): ...`.
5. Open a pull request with a short description and screenshots for visual changes.

---

## Credits

Designed and built by **Quadra** for **HypernerdGames**.
