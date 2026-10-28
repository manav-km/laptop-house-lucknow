# Laptop House — Technical Specification & Agent Guidelines

## Business Identity
- **Legal Entity:** Laptop House (Specialized Chip-Level IT Lab)
- **Location:** Shop No. LGF B1, Sangam Tower, Naza Computer Market, Lalbagh, Hazratganj, Lucknow, UP 226001
- **Contact:** +91 75650 01234 (WhatsApp / Primary) | +91 99849 99994
- **Working Hours:** Mon–Sat: 10:30 AM – 8:30 PM | Sunday: Closed
- **Geographic Coordinates:** 26.8485° N, 80.9425° E
- **Geofence Policy:** Local Doorstep Pickup and Local Refurbished Delivery strictly restricted to 25 km radius. Outside 25 km requires customer walk-in or courier consignment.

## Architecture
- Static SPA with high-performance Vanilla JS, CSS Custom Properties, and HTML5 Web Storage / IndexedDB backend simulator.
- Real-time GPS & Pincode Geofencing Engine calculating Haversine distance from Naza Market.
- Interactive Diagnostic Cost Estimator calculating price snapshots based on device brand, architecture, and fault symptom.
- Live Ticket Tracker allowing customers to check status with Job Sheet IDs (e.g., `LH-2026-0819`).
- Secure Owner Administration Portal with PIN authentication (`1234` default demo key) to manage inventory, update ticket statuses, and view customer requests.
