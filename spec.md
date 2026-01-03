# EnergyHome.OS - Project Specification

## 1. Project Overview

**Name:** EnergyHome.OS  
**Type:** Static Single Page Application (SPA)  
**Goal:** A "Hacker's Dashboard" for Australian homeowners to calculate the ROI of energy arbitrage strategies (Solar + Battery + OVO Free 3 Plan) versus traditional energy models.  
**Tone:** Professional, high-tech, "Dark Mode" aesthetic (Slate/Emerald/Amber).

## 2. Tech Stack

- **Framework:** React (Vite)
- **Styling:** Tailwind CSS (Class-based, responsive)
- **Charts:** Recharts (AreaChart, BarChart)
- **Icons:** Lucide-React
- **Deployment:** GitHub Pages (via GitHub Actions)
- **State:** URL Hash Persistence (No backend database)

## 3. Mathematical Engine (The "UseEnergyMath" Hook)

The core value of this app is specific Australian market logic. Do not use generic solar formulas.

### A. Constants (2026 Projections)

- **PEAK_RATE:** $0.58 (OVO Peak 4pm-9pm)
- **OFF_PEAK:** $0.24 (Standard Grid)
- **FREE_WINDOW:** $0.00 (OVO Free 3: 11am-2pm)
- **EV_RATE:** $0.08 (OVO EV Plan: 12am-6am)
- **FEED_IN:** $0.05 (Solar Export)
- **PETROL_PRICE:** $2.15/L
- **PETROL_EFFICIENCY:** 9.5 L/100km
- **EV_EFFICIENCY:** 18.5 kWh/100km
- **GAS_SUPPLY_CHARGE:** $350/yr (Saved if gas is disconnected)

### B. User Inputs (State)

- **bill:** Annual Electricity Bill ($)
- **gasBill:** Annual Gas Bill ($)
- **petrolBill:** Annual Petrol Bill ($)
- **solarSize:** kW (Slider 0-20)
- **batterySize:** kWh (Slider 0-40)
- **isEV:** Boolean
- **isV2H:** Boolean (Dependent on isEV)
- **isHeatPump:** Boolean (Replaces Gas Hot Water)
- **isInduction:** Boolean (Replaces Gas Cooking)

### C. Logic Pipeline

#### Baseline Usage Calculation:
```
dailyTotalKwh = bill / 365 / ((PEAK_RATE + OFF_PEAK) / 2)
dailyPeakNeed = dailyTotalKwh * 0.45 (45% of usage is in expensive window)
```

#### Appliance Shift (Gas -> Elec):
- If **isHeatPump:** Add `(gasBill * 0.35) / 4.0` to Elec Load. (COP 4.0)
- If **isInduction:** Add `(gasBill * 0.15) / 2.0` to Elec Load.
- If **Gas Disconnected** (All gas appliances gone): Add `GAS_SUPPLY_CHARGE` to savings.

#### The "Enabler" Formula (Battery/V2H):
```
usableCapacity = isV2H ? 60 : batterySize
dailyShift = Math.min(usableCapacity, dailyPeakNeed)
```
**Crucial:** We cannot shift more than we use.
```
batteryDailyValue = dailyShift * (PEAK_RATE - FREE_WINDOW)
```
**Note:** Value is derived from the SPREAD (58c - 0c), not just export avoidance.

#### Transport Delta:
```
legacyTransport = (annualKm / 100) * PETROL_EFFICIENCY * PETROL_PRICE
newTransport = (annualKm / 100) * EV_EFFICIENCY * EV_RATE
transportSavings = legacyTransport - newTransport
```

## 4. UI Requirements

### A. The Dashboard (Input)

- Use range sliders with direct numerical input fields next to them for precision.
- "Strategy Toggles" (EV, V2H, Heat Pump) should look like active/inactive cards.
- **Dynamic Logic:** isV2H toggle must be disabled if isEV is false.

### B. The "Race" Graph (Recharts AreaChart)

- **X-Axis:** 15 Years.
- **Series 1 (Grey):** "Legacy Path" (Accumulated Bill + Petrol + Gas * Inflation).
- **Series 2 (Green):** "Optimized Path" (Upfront Cost + (Reduced Bill * Inflation)).
- **Goal:** Visually show the "Crossover Point" (Break-even year).

### C. The ROI Receipt (Leaderboard)

A table sorting investments by Payback Period.

**Columns:** Strategy Name | Upfront Cost | Annual Saving | Payback (Years).

**Referral Injection:**
- **Row 1:** "OVO Free 3 Plan" -> Cost $0 -> Saving (Calculated) -> Link: https://www.ovoenergy.com.au/refer/paul8789
- **Row 2:** "Tesla EV Switch" -> Cost $15k -> Saving (Transport Delta) -> Link: https://ts.la/paul511330

## 5. Technical Requirements

- **URL Persistence:** Implement useUrlState hook. Update URL parameters on slider change so users can share their specific scenario.
- **Responsive:** Mobile-first design. Charts must resize gracefully.
- **CI/CD:** Create `.github/workflows/deploy.yml` for automated deployment to GitHub Pages.

## 6. Deployment Config

Base URL must be configured in `vite.config.js` for GitHub Pages compatibility.
