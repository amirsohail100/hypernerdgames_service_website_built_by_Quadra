# HypernerdGames — Official Studio Website

Static marketing website for **HypernerdGames**, an independent game studio.
It is built with plain HTML, CSS and JavaScript, with a Three.js ambient background.
No build step or package manager is needed.

## Pages

| File               | Purpose                                                |
| ------------------ | ------------------------------------------------------ |
| `index.html`       | Redirects to `pages/home.html`                         |
| `pages/home.html`  | Landing page: hero, marquee, stats, featured titles    |
| `pages/games.html` | Full game list with live search and genre filters      |
| `pages/genre.html` | Genre overview panels plus the same search and filters |
| `pages/about.html` | Studio story, pillars, stats and team section          |
| `pages/help.html`  | FAQ accordion and contact form                         |

## Folder structure

```
.
├── index.html
├── README.md
├── css/
│   ├── style.css        # Base design system, components and original breakpoints
│   ├── pages.css        # Page-hero, FAQ and genre-panel styles
│   └── responsive.css   # Responsive layer. Loads last and overrides layout per screen size
├── js/
│   ├── main.js          # Preloader and shutter, theme toggle, filters, nav, scroll reveal, counters, form
│   └── three-bg.js      # Three.js ambient background and 3D card hover scenes
└── pages/
    ├── home.html
    ├── games.html
    ├── genre.html
    ├── about.html
    └── help.html
```

## Running locally

Any static file server works. Using Python:

```bash
cd hypernerdgames_service_website_built_by_Quadra
python3 -m http.server 8000
```

Then open `http://localhost:8000` in a browser. The site redirects to `pages/home.html`.

Opening the HTML files directly also works, but a local server is recommended.

**Internet connection required:** the site loads these from CDNs at runtime:

- Three.js r128 from `cdnjs.cloudflare.com`
- Google Fonts (Bebas Neue, DM Sans, Barlow Condensed)

Without them the 3D background is skipped and fallback fonts are used. The layout still works.

## Responsive design

The layout adapts to every screen size, from 320px phones to large desktops, in portrait and landscape.

- **Navigation:** below 1180px the links move into a hamburger menu. On phones, "Work With Us" appears inside that menu.
- **Fluid spacing:** a shared `--gutter` variable in `responsive.css` sets the side padding everywhere.
- **Fluid type:** headings and body text scale with `clamp()`.
- **Games cards:** horizontal scroll with snap on touch devices. Card width and height adjust to the viewport.
- **Grids:** stats, team and pillars change column count at 900px and 560px. About and contact stack to one column below 900px.
- **Touch:** tap targets are at least 44px on touch devices. Inputs use 16px font size to prevent iOS zoom.
- **Overflow:** no page should scroll sideways. The footer links wrap, and images and SVGs are capped to 100% width.

Breakpoints used: 1180px (menu), 900px (tablet), 560px (phone), 360px (small phone), and landscape height 520px.

## Customisation

- **Colours and fonts:** edit the `:root` variables at the top of `css/style.css`.
- **Gutter and breakpoints:** edit `--gutter` and `--nav-break` in `css/responsive.css`.
- **Games:** each game is a `.game-card` block in `pages/games.html`, `pages/genre.html` and `pages/home.html`. Set `data-title` and `data-genre` (`rpg`, `sci-fi` or `action`) so search and filters work. Add a matching filter button if you add a new genre.
- **Team:** edit the `.member` blocks in `pages/about.html`.
- **Light and dark theme:** the choice is saved in `localStorage` under the key `hn-theme`.

## Known limitations

- **Contact form is a demo.** `handleForm()` in `js/main.js` only shows a toast message and does not send anything. Connect it to a backend or email service before going live.
- **Placeholder links.** The "Explore" links on game cards and the footer social links (`href="#"`) are placeholders. Replace them with real URLs.
- **Stats and team data** are placeholder content.

## Browser support

Modern Chrome, Edge, Firefox and Safari on desktop and mobile. WebGL is needed for the 3D background. If it is missing, the rest of the site still works.

## Credits

Built by Quadra for HypernerdGames.
