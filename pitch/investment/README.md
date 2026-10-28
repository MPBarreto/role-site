# Rolê · Investor Pitch

Unlisted presentation route: `/pitch/investment`.

The route is not authenticated. `noindex` discourages indexing, but anyone with the URL can open it; do not add confidential information without access protection.

- The 12 slides use the complete approved reference compositions in `assets/slide-01.webp` through `assets/slide-12.webp`. Slides 11 and 12 are the two complete panels in the latest supplied reference, separated only at its center divider.
- The source composition is kept as a single image per slide so text, scale, crop, and graphic placement remain faithful to the approved references.
- The Vite entry is registered in the site's multi-page build; Vercel rewrites the path to its static HTML.
- The page sets `noindex` metadata and a matching `X-Robots-Tag`; it is not linked from public navigation or included in the sitemap.
- Use the bottom controls, slide numbers, arrow keys, Page Up/Down, Home/End, touch swipes, or `F` for fullscreen. The PDF action opens the browser print dialog.
- Financial and market figures are shown exactly as supplied in the pitch references. Treat projections as management estimates and validate the underlying model and source methodology before external circulation.
