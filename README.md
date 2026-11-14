# Origin — Strength & Performance Gym

An editorial, responsive landing page for **Origin Strength & Performance Gym** (Ambattur, Chennai) built with vanilla HTML5, modern CSS Grid/Flexbox, and lightweight JavaScript.

## Project Directory Structure

```
origin/
├── assets/                     # Production web assets
│   ├── images/                 # Active, web-optimized gym photography
│   │   └── responsive/         # 480w & 800w device variants
│   ├── fonts/                  # Local brand typography (Forega Sport)
│   ├── videos/                 # Web-optimized background video clips
│   └── favicon.svg             # Brand SVG favicon
├── css/
│   └── style.css               # Modular design system & stylesheets
├── js/
│   └── main.js                 # Interactions, animations & navigation
├── docs/
│   └── gym_details.pdf         # Gym pricing, tiers, and operational specifications
├── source-media/               # Raw photoshoot archive, source video & frames (local)
├── images -> assets/images     # Convenience symlink for legacy path compatibility
├── index.html                  # Main production landing page
├── package.json                # Project scripts
└── server.py                   # Development server with HTTP Range request support
```

## Running Locally

To run the local development server:

```bash
python3 server.py 8080
# or
python3 -m http.server 8080 --bind 127.0.0.1
```

Then visit [http://localhost:8080](http://localhost:8080).

## Gym Information

- **Location:** 110A Trios Tower, Menambedu, Ambattur, Chennai 600053
- **Phones:** 96420 76707 / 93443 76707
- **Timings:**
  - Monday – Saturday: 5:30 AM – 10:00 PM
  - Sunday: 5:30 AM – 2:00 PM
- **Instagram:** [@origin_strengthandperformance](https://www.instagram.com/origin_strengthandperformance/)
