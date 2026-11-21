# Physical hardware test checklist

✅ **What this is:** Prove the real boxes work before a pilot.  
👥 **Who should read:** Tester with hardware on site.

## Gate node

- [ ] Boots, serial shows `[READY]`
- [ ] Connects to Wi‑Fi (or enters offline buffer)
- [ ] RFID tag read → serial logs tag
- [ ] Valid booking tag → server 200, `gate_open: true`, barrier opens
- [ ] Invalid tag → `gate_open: false`, barrier stays closed, error beep
- [ ] Unplug Wi‑Fi → tag still logs / buffers
- [ ] Restore Wi‑Fi → buffer flush succeeds

## Scale node

- [ ] Boots, HX711 initializes
- [ ] Tare empty platform
- [ ] Known weight matches within tolerance after calibration
- [ ] Serial `GROSS` → server accepts, booking → WEIGHED_GROSS
- [ ] Serial `TARE` → net computed, booking COMPLETED
- [ ] Offline buffer + batch-sync works

## Website (connections only)

- [ ] No firmware viewer page
- [ ] Queue/gate screens update after device posts (after refresh or SSE)
- [ ] Manager can see new bookings in ledger

## Baby recap

- Test gate, then scale, then offline, then website display.  
- Sign off each box before calling hardware “done”.
