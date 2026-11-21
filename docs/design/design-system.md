# Design System (Color & Typography)

This document captures the visual language defined in `mandi_app_flow_ui_design_system.md`.

## Color Palette

| Role / Element | Tailwind Token | Hex | Description |
|---|---|---|---|
| **Primary Brand** | `bg-emerald-700` / `text-emerald-700` | `#047857` (500) / `#064e3b` (900) | Core brand color for buttons, active navigation, headers.
| **Primary Hover** | `hover:bg-emerald-800` | `#064e3b` | Darker shade on hover.
| **Accent / Action** | `bg-amber-600` / `text-amber-600` | `#d97706` | Slot reservation tags, key CTAs.
| **Background Light** | `bg-slate-50` | `#f8fafc` | Default screen background (outdoor readability).
| **Card Surface** | `bg-white` | `#ffffff` | Elevated UI cards, forms.
| **Primary Text** | `text-slate-900` | `#0f172a` | High‑contrast body text.
| **Secondary Text** | `text-slate-500` | `#64748b` | Subtitles, labels.
| **Success State** | `text-green-600` / `bg-emerald-50` | `#16a34a` | Validated pass, gate open.
| **Warning State** | `text-orange-600` / `bg-amber-50` | `#ea580c` | Low quota, capacity warnings.
| **Danger State** | `text-red-600` | `#dc2626` | Invalid token, gate locked.

## Typography Hierarchy

| Level | Size (px) | Font‑Weight | Tailwind Classes | Usage |
|---|---|---|---|---|
| **Display Header** | 32 | 700 (Bold) | `text-3xl font-bold tracking-tight` | Hero headlines, pass verification badges |
| **Header 1** | 24 | 600 (SemiBold) | `text-2xl font-semibold` | Page titles, Mandi card titles |
| **Header 2** | 18 | 600 (SemiBold) | `text-lg font-semibold` | Section titles, scale weight numbers |
| **Body Large** | 16 | 400 (Regular) | `text-base font-normal` | Form fields, main body text |
| **Body Regular** | 14 | 400 | `text-sm font-normal` | Descriptive text, table data |
| **Caption / Badge** | 12 | 500 (Medium) | `text-xs font-medium uppercase` | Status badges, RFID tags |

These tokens are applied throughout the app via Tailwind utility classes, ensuring a cohesive, high‑contrast UI suitable for outdoor use.
