# Scale node wiring

🔌 **What this is:** How to connect the scale ESP32 + HX711.  
👥 **Who should read:** Installer.

| Peripheral | ESP32 pin | Notes |
|------------|-----------|--------|
| HX711 DOUT | GPIO21 | Data |
| HX711 SCK | GPIO22 | Clock |
| HX711 VCC | 5V (module dependent) | Check module rating |
| Load cell | to HX711 E+/E-/A+/A- | Follow load cell colour chart |
| Power | 5V / GND | Stable supply |

## Calibration

1. Upload sketch, open serial 115200.  
2. Empty platform → send `TARE_ZERO`.  
3. Place known weight (e.g. 50 kg) → adjust `SCALE_CALIBRATION_FACTOR` until reading matches.  
4. Send `GROSS` or `TARE` to post a reading.

## Baby recap

- HX711 on 21/22.  
- Tare empty, calibrate with known weight, then post GROSS/TARE.  
- No website needed to capture weight — serial commands drive the node.
