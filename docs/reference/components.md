# Component Reference

Feature components live under `src/features/`, grouped by domain.

| Component | Location | Purpose | Props |
|-----------|----------|---------|-------|
| **FarmerPortal** | `src/features/farmer/FarmerPortal.tsx` | Booking wizard, mandi quota, QR pass, and receipt screens. | `mandis?: Mandi[]`, `activeBookings?: Booking[]`, `onBookingCreated?: (booking: Booking) => void`, `onRefreshData?: () => void` |
| **QrCodeCard** | `src/features/farmer/QrCodeCard.tsx` | Renders a booking pass QR token. | `data: string`, `size?: number`, `title?: string`, `className?: string` |
| **GateControlDesk** | `src/features/gate/GateControlDesk.tsx` | RFID/QR gate verification, barrier animation, and telemetry terminal. | `bookings?: Booking[]`, `logs?: TelemetryLog[]`, `onRefreshData?: () => void` |
| **QueueLedger** | `src/features/queue/QueueLedger.tsx` | Live queue and aggregate metrics. | `bookings?: Booking[]` |
| **Navigation** | `src/features/shell/Navigation.tsx` | Role-filtered sidebar, top bar, mobile bottom nav, user menu, and role guide launcher. | none |
| **Breadcrumb** | `src/features/shell/Breadcrumb.tsx` | Role-aware route breadcrumbs. | none |
| **Providers** | `src/features/system/Providers.tsx` | Client boundary that mounts NextAuth and the clay theme provider, then installs runtime log capture. | `children: React.ReactNode` |
| **ThemeProvider** | `src/features/system/ThemeProvider.tsx` | Persisted light/dark theme with DOM class sync and cross-tab updates. | `children: React.ReactNode` |
| **ThemeToggle** | `src/features/system/ThemeToggle.tsx` | Clay pill toggle for the active theme. | `compact?: boolean` |
| **RoleGuide** | `src/features/system/RoleGuide.tsx` | Role-scoped walkthrough modal opened from the shell. | `role: UserRole`, `open: boolean`, `onClose: () => void` |
| **SettingsPanel** | `src/features/system/SettingsPanel.tsx` | Profile, access scope, appearance, and diagnostics sections. | none |
| **LogsPanel** | `src/features/system/LogsPanel.tsx` | Verbose toggle, filterable log list, export, and clear. | none |
| **ClaySwitch** | `src/features/system/ClaySwitch.tsx` | Accessible clay switch used by diagnostics. | `checked`, `onChange`, `label`, `description?` |

All components use Tailwind CSS with the Pure Clay token layer in `src/app/globals.css` and Lucide
icons for visual cues. The runtime logger lives in `src/shared/logger.ts`; role helpers live in
`src/shared/roles.ts`.

The former **HardwareBench** (virtual weighbridge), **FirmwareView**, and public
**InteractiveDemoModal** were removed from the web UI. The guided walkthrough now ships as the
role-scoped `RoleGuide` inside each authenticated shell, and devices communicate only through the
telemetry API endpoints listed in `docs/reference/api.md`; firmware and device tooling live in
`hardware/`.
