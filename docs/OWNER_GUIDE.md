# Laptop House — Owner Handover & Administration Manual

## 1. Operating Credentials
- **Portal URL:** Click **Staff Portal** in header or visit `#admin`
- **Default Laboratory PIN:** `1234`
- **Center Point Location:** Shop No. LGF B1, Sangam Tower, Naza Market, Lalbagh, Lucknow (26.8485° N, 80.9425° E)

## 2. Managing the 25km Service Boundary
- The application automatically blocks doorstep technician pickup and local refurbished machine delivery if the customer's coordinates or selected Pincode is greater than 25 km from Naza Market.
- Customers outside 25 km are instructed to visit the Sangam Tower counter in person or send their device via courier.

## 3. Repair Tickets & Job Sheets
- When a customer logs a service request, a unique Job Sheet ID (e.g. `LH-8049`) is generated and saved to persistent storage.
- In the Staff Portal under **Repair Job Tickets**, click **Advance Stage** to progress the repair status from *Received* $\rightarrow$ *Microscope Diagnostic* $\rightarrow$ *Parts Replaced & Burn-in* $\rightarrow$ *Ready for Pickup*.
- Customers can track this in real-time from the public homepage without calling your counter.

## 4. Refurbished Laptop Stock
- Machine prices are fixed with snapshots at checkout.
- Orders capture the customer's name, phone, verified delivery address, and distance in kilometers.
