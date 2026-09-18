# Development Guide (Baby‑Friendly Edition)

## 📦 Project Overview (Baby Version)
> **Baby:** This app lets farmers book a spot to bring their crops, shows a gate screen to let trucks in, tracks the weigh‑bridge, and shows a live queue. All of that lives in a web app built with **Next.js** and **Tailwind**.

---

## 1️⃣ Project Setup & Clean‑up (Baby Version)
- **What to do:**
  1. Run `npm install` (clean now, no vulnerable deps).
  2. Commit the fresh `package.json`, `docs/` and the new CI file.
  3. Push to a branch called `setup/base`.
- **Why:** Gives everybody a safe starting point.

**Baby Summary:** Install, commit, push – we’re ready to play!

---

## 2️⃣ Core Feature Stabilization (Baby Version)
- **What to make:**
  - Unit tests for each API route (`/api/v1/...`).
  - Playwright UI tests for the five tabs (Farmer, Gate, Weigh, Queue, Firmware).
  - Run `npm run type-check` in CI to guarantee TypeScript sanity.
- **How:**
  - Add `jest`/`vitest` config, write a test for `GET /api/v1/queue/status` that checks the JSON shape.
  - In `tests/ui/` create a Playwright script that clicks each tab and asserts the main header appears.
  - Add those scripts to `package.json` (`"test": "vitest run"`).

**Baby Summary:** Write tiny tests for the back‑end and front‑end, then let the CI run them.

---

## 3️⃣ Documentation & Onboarding (Baby Version)
- **What to make:**
  - A friendly `README` that points newbies to `npm run dev`.
  - A `CONTRIBUTING.md` that explains the folder layout (app, components, lib, docs).
  - A short video demo (optional) showing the flow.
- **How:**
  - Copy the existing `docs/` content into the repo root as `README.md` sections.
  - Write `CONTRIBUTING.md` with bullet points about cloning, installing, running, testing.
  - Record a 30‑second screen capture and drop it in `docs/demo.mp4`.

**Baby Summary:** Make a friendly guide and a quick video so new devs can hop on.

---

## 4️⃣ Optional AI / Gemini Integration (Baby Version)
- **What to make (optional):**
  - A lazy‑load wrapper (`lib/ai.ts`) that only imports `@google/genai` when an env flag `ENABLE_GEMINI=true` is set.
  - Mock implementation for local testing.
- **How:**
  - `export async function getGenAI(){ if(process.env.ENABLE_GEMINI!=="true") return null; const {GoogleGenAI}=await import('@google/genai'); return new GoogleGenAI({apiKey:process.env.GEMINI_API_KEY}); }`
  - Add a test that verifies the function returns `null` when the flag is off.

**Baby Summary:** If you ever need AI, add a tiny optional piece that turns on only with a flag.

---

## 5️⃣ CI/CD & Release Pipeline (Baby Version)
- **What to set up:**
  - GitHub Actions workflow (`.github/workflows/ci.yml`) already added.
  - Optional release workflow that builds the app and publishes a Docker image or Vercel preview.
- **How:**
  - Add a new workflow `release.yml` that triggers on tag pushes, runs `npm run build`, then `docker build` and pushes to Docker Hub.

**Baby Summary:** CI already checks our code; later we’ll add a tiny release step to ship it.

---

## 6️⃣ Monitoring & Observability (Baby Version)
- **What to add:**
  - Basic request logger (e.g., `morgan` or a custom Next.js logger).
  - Export metrics like queue length and weigh‑bridge status to a simple JSON endpoint (`/api/v1/metrics`).
- **How:**
  - Install `morgan`, add middleware in `app/api/v1/queue/status/route.ts`.
  - Create `app/api/v1/metrics/route.ts` that returns the same `metrics` object from the queue status.

**Baby Summary:** Log what’s happening and expose a tiny metrics endpoint.

---

## 7️⃣ Continuous Improvement (Baby Version)
- **What to do:**
  - Run `npm audit` weekly, update deps.
  - Collect user feedback from the Farmer portal and iterate.
  - Keep the design‑system docs up‑to‑date.

**Baby Summary:** Keep checking for bugs, listen to users, and update the style guide.

---

*All sections include a "baby version" – a super‑short, plain‑language recap for anyone who just wants the gist. Happy coding! 🤓🚀
