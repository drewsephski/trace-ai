# Trace Landing Page Audit

Date: 2026-06-30
URL inspected in Dia: http://127.0.0.1:5173/
Code inspected: packages/landing

## Screenshots

- 01-hero.png: Dia hero capture.
- 02-features.png: Dia capture after attempting to jump to #features; server returned connection/refused/unreachable state.
- 03-product-preview.png: Dia capture after scroll; final accepted capture shows the download section because the page jumped near the bottom.

## Rating

Overall: 7/10.

The page has a strong core message and a clean technical-product tone. It quickly explains "one local workspace for coding agents" and supports that with local-first, approvals, agent runtime, and download details. The typography, spacing, and restrained palette fit a developer desktop tool.

The score is held back by execution issues: the wordmark renders as a broken image in the live Dia capture, the first viewport shows very little product surface, the MacBook preview is difficult to inspect when reached, and the dev server became unreliable during the audit.

## Step Notes

1. Hero: mostly healthy. The headline is clear, the CTA hierarchy is right, and the local-first badge is useful. The broken wordmark is a visible trust issue, and the hero uses too much empty vertical space before showing the product.
2. Product preview: weak. The MacBook-scroll treatment is polished in concept, but at the inspected viewport the actual app UI is too small and far away to sell the product.
3. Feature/flow content: structurally healthy in code and accessibility tree. Sections are ordered sensibly: supported agents, capabilities, workflow, principles, downloads. Copy is concise and mostly concrete.
4. Download section: healthy. The OS matrix is clear and efficient. It repeats the broken wordmark in the footer.
5. Runtime reliability: weak. `http://127.0.0.1:5173/` rendered initially, then later showed connection/refused/unreachable behavior while the Vite process remained alive. Root requests to `[::1]:5173` returned 404 while module assets still served.

## Accessibility Risks

- The broken wordmark image has alt text, so screen readers still get "Trace", but sighted users see a broken asset.
- Link semantics and heading structure are good in the Dia accessibility tree.
- Contrast appears acceptable for primary text and CTAs, but muted gray footnotes and nav text should be checked against WCAG contrast, especially on the dark background.
- The large scroll-based MacBook animation should be tested with keyboard navigation and reduced-motion settings, even though CSS includes a global reduced-motion rule.

## Priority Recommendations

1. Fix the brand asset rendering in nav and footer.
2. Make the product visible in the first viewport, or at least show a clear screenshot crop before the fold.
3. Replace or tame the MacBook-scroll interaction if it keeps hiding the interface or creating long empty scroll zones.
4. Add a small proof point near the hero CTA: supported agents, no account, approvals, local files, or a short "open a folder, run agents, approve changes" line.
5. Clean up the dev-server/root-route issue before judging production readiness.
