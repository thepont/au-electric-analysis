[![OVO Credit](https://img.shields.io/badge/OVO_Energy-$120_Credit-10b981?style=for-the-badge&logo=leaf&logoColor=white&link=https://www.ovoenergy.com.au/refer/paul8789)](https://www.ovoenergy.com.au/refer/paul8789)
[![Tesla Discount](https://img.shields.io/badge/Tesla-$350_Discount-e11d48?style=for-the-badge&logo=tesla&logoColor=white&link=https://ts.la/paul511330)](https://ts.la/paul511330)
[![Build Status](https://img.shields.io/badge/Strategy-Verified_2026-blue?style=for-the-badge)](https://thepont.github.io/au-electric-analysis/)

# @thepont/ovo-hacker-math

A utility library to calculate the ROI of shifting energy loads using the OVO Energy 'The One Plan' (EV Upgrade).

## Description

This zero-dependency library provides core arbitrage logic for the OVO Energy 'Free 3' Battery Strategy, enabling homeowners to calculate potential savings from time-shifting their energy consumption using home batteries during free electricity periods.

## Installation

```bash
npm install @thepont/ovo-hacker-math
```

## Usage

### Importing Configuration

```javascript
import { OVO_CONFIG, calculateHackerSavings } from '@thepont/ovo-hacker-math';

// Access referral code
console.log(OVO_CONFIG.REFERRAL_CODE); // "paul8789"
console.log(OVO_CONFIG.REFERRAL_URL); // "https://www.ovoenergy.com.au/refer/paul8789"
console.log(OVO_CONFIG.TESLA_REFERRAL_URL); // "https://ts.la/paul511330"

// Check rates
console.log(OVO_CONFIG.RATES.PEAK); // 0.58
console.log(OVO_CONFIG.RATES.FREE); // 0.00
```

### Calculating Savings

```javascript
import { calculateHackerSavings } from '@thepont/ovo-hacker-math';

const savings = calculateHackerSavings({
  batteryKwh: 13.5,        // Tesla Powerwall capacity
  dailyPeakUsageKwh: 10    // Daily usage during peak hours
});

console.log(`Annual savings: $${savings.toFixed(2)}`);
// Output: Annual savings: $2117.00
```

## How It Works

The OVO Energy 'Free 3' plan offers free electricity during a 3-hour window (typically 11am-2pm). This library calculates the annual savings by:

1. Determining how much energy can be shifted (minimum of battery capacity and daily peak usage)
2. Multiplying by the difference between peak rate ($0.58/kWh) and free rate ($0.00/kWh)
3. Scaling to annual savings (× 365 days)

**Formula:**
```
Annual Savings = min(batteryKwh, dailyPeakUsageKwh) × (Peak Rate - Free Rate) × 365
```

## API Reference

### `OVO_CONFIG`

An object containing OVO Energy configuration constants:

- `REFERRAL_CODE`: String - OVO Energy referral code
- `REFERRAL_URL`: String - OVO Energy referral link
- `TESLA_REFERRAL_URL`: String - Tesla referral link
- `RATES`: Object
  - `PEAK`: Number - Peak electricity rate ($/kWh)
  - `FREE`: Number - Free electricity rate ($/kWh)

### `calculateHackerSavings({ batteryKwh, dailyPeakUsageKwh })`

Calculates annual savings from energy arbitrage strategy.

**Parameters:**
- `batteryKwh` (Number): Battery capacity in kilowatt-hours
- `dailyPeakUsageKwh` (Number): Daily energy usage during peak hours in kilowatt-hours

**Returns:** Number - Annual savings in dollars

## Get Started with OVO Energy

Sign up using the referral code to get **$120 credit**:

👉 [Join OVO Energy](https://www.ovoenergy.com.au/refer/paul8789) (Code: `paul8789`)

## Get a Tesla Powerwall

Looking for a home battery? Get **$350 off** your Tesla order:

👉 [Order Tesla Products](https://ts.la/paul511330)

## License

MIT
