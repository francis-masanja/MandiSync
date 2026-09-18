# Component Reference

MandiSync UI is composed of five main tab components located in `components/`:

| Component | Purpose | Props |
|-----------|---------|-------|
| **FarmerPortal** | Allows farmers to view existing bookings, create new ones, and refresh data. | `mandis: Mandi[]`, `activeBookings: Booking[]`, `onBookingCreated: () => void`, `onRefreshData: () => void` |
| **GateControlDesk** | Displays RFID gate verification status and associated bookings. | `bookings: Booking[]`, `logs: TelemetryLog[]`, `onRefreshData: () => void` |
| **HardwareBench** | Shows real‑time weighbridge data (gross, tare, net) and lets users interact with hardware simulated data. | `bookings: Booking[]`, `logs: TelemetryLog[]`, `onRefreshData: () => void` |
| **FirmwareView** | Presents the ESP32 C++ firmware code and compilation details (currently a placeholder). | *none* |
| **InteractiveDemoModal** | Modal walkthrough that demonstrates the four‑phase demo flow. | `isOpen: boolean`, `onClose: () => void`, `onRefreshData: () => void` |

All components use Tailwind CSS for styling and Lucide icons for visual cues. They are rendered conditionally in `app/page.tsx` based on the `activeTab` state.
