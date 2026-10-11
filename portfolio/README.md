# Ravi Khanai — animated portfolio

Static site (plain HTML/CSS/JS, no build step). Scroll animation uses GSAP + ScrollTrigger, vendored in `vendor/` so it works offline.

```
index.html        page structure
css/style.css     design tokens + layout
js/data.js        ALL text content: journey, projects, skills  ← edit here
js/main.js        rendering + animations + project modal
assets/           portrait, resume PDF, fonts, animated project SVGs
vendor/           gsap.min.js, ScrollTrigger.min.js (GSAP standard license, free for this use)
```

Preview locally: `python3 -m http.server` in this folder, then open http://localhost:8000.
Deploy: upload the whole folder to any static host (it replaces the old single-file `index.html`).

Motion respects `prefers-reduced-motion` (final state shown, no animation). Pointer effects (cursor glow, card tilt, magnetic buttons) only run on mouse devices.
