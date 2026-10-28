# The MudBrew Cafe — Studio, Arena & Dining

An intentional sanctuary combining artisanal wheel throwing, miniature indoor terrain crawling, and thoughtful culinary craft under warm acoustic arches.

![The MudBrew Cafe Preview](docs/preview.png)

---

## 🌟 Brand Intro & Application Architecture

The application is built with **React + Vite** and features a premium animated loading intro on the first visit of each tab session:

- **Animated Brand Intro (`CafeIntro.jsx`)**:
  - Full-viewport warm terracotta canvas (`#C06539`).
  - Subtle fade-in and scale-up of the botanical logo.
  - Soft opacity reveal of the `MUD BREW` wordmark and subtitle.
  - Understated minimal loading progress indicator.
  - Expanding circular/fade transition into the café homepage.
  - **`sessionStorage` Caching**: Plays smoothly once per browser tab session; subsequent navigations and refreshes instantly display the homepage.
  - **Accessibility**: Detects `prefers-reduced-motion` and provides an instant graceful fade.
  - **Fail-Safe**: Hard timeout guarantee prevents permanent loading states.
- **Complete Café Homepage (`HomePage.jsx`)**:
  - Full artisanal wheel pottery studio booking.
  - 40 ft micro RC rock crawling arena.
  - Warm acoustic curved plaster dining sanctuary.
  - Studio pantry menu highlights.
  - Direct delivery partner portals (Swiggy, Zomato, Magicpin) & table inquiry form.

---

## 📁 Project Directory Structure

```text
The MudBrew/
├── public/
│   └── logo.png         # Botanical logo asset (terracotta & ivory)
├── src/
│   ├── assets/
│   │   └── logo.png     # Local asset reference
│   ├── components/
│   │   ├── CafeIntro.jsx # Reusable animated loading brand intro component
│   │   ├── CafeIntro.css # Keyframes, circular unmasking & reduced motion styles
│   │   └── HomePage.jsx  # Preserved homepage sections, layout & interactions
│   ├── App.jsx          # Root lifecycle controller
│   └── main.jsx         # React mounting entry point
├── docs/
│   ├── DESIGN.md        # Terracotta & Kiln design system tokens & specifications
│   └── preview.png      # High-resolution design preview
├── index.html           # HTML template with Google Fonts & Tailwind CDN configuration
├── vite.config.js       # Vite React plugin configuration
├── package.json         # React 18 & Vite 6 build scripts
└── .gitignore           # Git ignore rules
```

---

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview
```

---

## 🎨 Design System

Design tokens and styling specifications are documented in [`docs/DESIGN.md`](docs/DESIGN.md):
- **Aesthetic**: Tactile & Earthy Editorial Minimalism (Raw bisque clay, sage botanical, sand linen).
- **Typography**: *Playfair Display* (Editorial serifs) & *Inter* (Utilitarian body).
- **Styling**: Tailwind CSS with custom palette extensions.
