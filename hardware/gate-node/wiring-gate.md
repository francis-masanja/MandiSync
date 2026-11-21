# Gate node wiring

🔌 **What this is:** How to connect the gate ESP32.  
👥 **Who should read:** Installer.

| Peripheral | ESP32 pin | Notes |
|------------|-----------|--------|
| UHF RFID TX | GPIO16 (RX2) | RFID module TX → ESP32 RX2 |
| UHF RFID RX | GPIO17 (TX2) | RFID module RX ← ESP32 TX2 |
| Barrier relay | GPIO23 | Active HIGH — use a proper relay board, not direct solenoid |
| Green LED | GPIO18 | Access granted |
| Red LED | GPIO19 | Standby / denied |
| Buzzer | GPIO5 | Optional beep |
| Power | 5V / GND | Use stable supply; do not power relay coil from 3V3 |

## Baby recap

- RFID on UART2 pins 16/17.  
- Relay on 23 with a real relay module.  
- LEDs 18/19, buzzer 5 optional.  
- Common ground everywhere.
