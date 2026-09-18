# Architecture Overview

MandiSync is a **Next.js 15** application built with TypeScript and Tailwind CSS. It follows a modular monorepo‑style layout:

- **`app/`** – Next.js app router entry points and API routes.
- **`components/`** – Re‑usable UI components for each functional tab.
- **`lib/`** – Core business logic, type definitions, and low‑level utilities (audio, crypto, spatial, db, firmware, web‑serial).
- **`hooks/`** – Custom React hooks (e.g. `use-mobile`).
- **`public/`** (implicit) – Static assets.

The frontend renders a tabbed interface (`FARMER`, `GATE`, `WEIGH`, `QUEUE`, `FIRMWARE`). State is managed locally with React hooks and synced with backend REST APIs under `app/api/v1/`.

Key runtime integrations:

- **Google Gemini** (`@google/genai`) for AI features (future extensions).
- **Firebase tools** for deployment and hosting (dev dependency).
- **Lucide React** icons.
- **Tailwind CSS 4** for styling.

The project is designed to run locally with `bun` (lockfile present) or `npm`/`pnpm`. It assumes a backend service exposing the same API routes.
