# Glassy‑Clay Refactor Plan for MandiSync

## 🎯 Goal
Refactor the visual layer of MandiSync into the **70 % Glass + 30 % Clay** (Glassy‑Clay) design system while preserving functionality, meeting WCAG AA accessibility, and keeping performance acceptable on low‑end mobile devices.

---
## 📦 Scope & Deliverables

| Deliverable | What it includes |
|-------------|-----------------|
| **Design‑System Token Library** | Tailwind plugin / custom utilities for glass‑clay containers, buttons, inputs, badges, global background. |
| **Component Refactor** | Update all UI components (`FarmerPortal`, `GateControlDesk`, `HardwareBench`, `FirmwareView`, `InteractiveDemoModal`, cards/tables) to use the new tokens. |
| **Accessibility & Contrast** | Verify text‑over‑glass ≥ 4.5:1 contrast; add optional high‑contrast mode. |
| **Performance Benchmark** | Measure FPS & GPU load with `backdrop-filter` on representative low‑spec devices; define acceptable thresholds. |
| **Fallback Styles** | Provide solid‑color or reduced‑blur fallbacks for browsers without `backdrop-filter`. |
| **Documentation** | Add a *Glassy‑Clay Design System* page in `docs/`, usage guidelines, and a developer checklist. |
| **Feature‑Flag & Rollout** | Runtime flag (`ENABLE_GLASSY_CLAY`) + staged A/B test before full rollout. |
| **CI / Lint Integration** | Enforce token usage via Tailwind/Stylelint; CI fails on disallowed styles. |
| **Testing Update** | Extend unit & Playwright visual regression tests to cover new styles. |

---
## 🗂 High‑Level Phases & Milestones

| Phase | Tasks | Owner | Success Criteria |
|------|-------|-------|------------------|
| **0 – Preparation** | Inventory UI surfaces; capture baseline performance & accessibility. | Lead UI Engineer | Inventory complete; baseline metrics recorded. |
| **1 – Token Definition** | Add `glassyClay` utilities to `tailwind.config.js`; define CSS variables; provide `@supports` fallbacks. | Design System Engineer | `npm run build` succeeds; utilities generated. |
| **2 – Prototype Core Surface** | Refactor a single card (e.g., booking entry) using new tokens; benchmark performance; run axe accessibility test. | Front‑End Engineer | FPS ≤ 30 ms drop, contrast ≥ 4.5, no visual regressions. |
| **3 – Full Component Migration** | Systematically replace static backgrounds with glass‑clay tokens; update buttons, inputs, badges. | Front‑End Team | All components render with new tokens; lint passes. |
| **4 – Accessibility & Fallback** | Add high‑contrast toggle; ensure fallback solid backgrounds for unsupported browsers. | Accessibility Engineer | High‑contrast mode works; contrast passes in both modes. |
| **5 – Performance Optimization** | Tune blur radius, cache gradients, test on low‑end devices; ensure ≥ 30 FPS. | Performance Engineer | No > 15 % FPS drop; GPU usage stable. |
| **6 – CI / Lint Integration** | Add Stylelint rule for approved utilities; CI runs lint & type‑check on PRs. | DevOps Engineer | CI passes; disallowed classes flagged. |
| **7 – Testing Expansion** | Add snapshot & Playwright visual regression tests for the new UI. | QA Engineer | All tests pass; visual diff within thresholds. |
| **8 – Feature‑Flag & Staged Rollout** | Wrap new CSS behind `NEXT_PUBLIC_ENABLE_GLASSY_CLAY`; deploy to staging; run A/B test (e.g., 25 % traffic). | Product Owner | Positive or neutral A/B results; no regressions. |
| **9 – Documentation & Handoff** | Write *Glassy‑Clay Design System* doc; add developer checklist; update `CONTRIBUTING.md`. | Technical Writer | Docs live; new contributors onboard in < 30 min. |
| **10 – Release** | Tag version `vX.Y.Z‑glassy‑clay`; deploy to production; monitor for 48 h. | Release Engineer | Deployment successful; performance & error metrics within targets. |

---
## ✅ Developer Checklist (to be added to `docs/development-plan.md`)
1. **Token Usage** – All `bg‑white`, `bg‑slate-*` replaced with glass‑clay utilities (`bg‑glass`, `bg‑glass‑dark`, etc.).
2. **Border & Radius** – Containers use `border‑glass` and `rounded‑glassy` (20‑28 px).
3. **Shadow Composition** – Include composite `shadow‑glassy` (outer glass drop + inner clay inset).
4. **Interactive States** – Hover/active use `scale‑[0.97]` and inner‑shadow adjustments.
5. **Accessibility** – Run `npm run audit:accessibility`; contrast ≥ 4.5:1 on all text over translucent surfaces.
6. **Performance** – Capture Chrome tracing on low‑end device; ensure `backdrop-filter` does not cause > 15 % frame‑time increase.
7. **Fallback** – Verify `@supports` block provides solid background when blur unsupported.
8. **Lint** – `npm run lint` reports no disallowed classes.
9. **Tests** – Unit, integration, and Playwright visual regression tests pass.
10. **Feature Flag** – New UI appears only when `NEXT_PUBLIC_ENABLE_GLASSY_CLAY=true`.

---
## 🛠 Open Questions (need decisions)
- **Blur intensity** – Fixed (`blur(20px)`) vs responsive (smaller on mobile).
- **High‑contrast activation** – Auto‑detect OS setting or explicit UI toggle?
- **A/B rollout size** – 10 %, 25 %, or 50 % of traffic?
- **Design mockup** – Would you like a visual mock of the dashboard before implementation?

---
## 📚 References
- **Glassy‑Clay Tokens** – defined in `tailwind.config.js` under `glassyClay`.
- **Accessibility** – WCAG AA (contrast ≥ 4.5:1, focus visible, ARIA unchanged).
- **Performance** – Target ≥ 30 FPS on low‑spec Android (Chrome DevTools device emulator).

---
*Prepared by the UI/UX Design System Engineer. Use this plan to drive the refactor, track progress via the checklist, and ensure a smooth, performant, and accessible rollout.*