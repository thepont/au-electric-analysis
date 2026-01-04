# EnergyHome.OS

![EnergyHome.OS Dashboard](https://github.com/user-attachments/assets/87d3002e-1f97-4a3e-9539-2da448c8880c)

A "Hacker's Dashboard" for Australian homeowners to calculate the ROI of energy arbitrage strategies (Solar + Battery + OVO Free 3 Plan + EV) versus traditional energy models.

## 🚀 Features

- **Australian-Specific Calculations**: Uses real Australian energy rates and market conditions
- **Interactive ROI Dashboard**: Real-time calculations with adjustable inputs
- **15-Year Cost Projections**: Visualize when your energy investment pays off
- **URL State Sharing**: Share your specific scenario via URL
- **Multiple Strategies**: Compare Solar, Battery, EV, Heat Pump, and Induction cooking
- **Dark Mode UI**: Professional Slate/Emerald/Amber aesthetic

## 🛠️ Tech Stack

- **Framework**: Vite + React + TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide-React
- **Deployment**: GitHub Pages (via GitHub Actions)

## 📊 What It Calculates

- **Battery Savings**: Peak rate arbitrage using OVO Free 3 plan (11am-2pm free electricity)
- **Solar Savings**: Generation, self-use, and feed-in tariff calculations
- **EV Transport Savings**: Petrol vs electric vehicle costs
- **Gas Conversion**: Savings from Heat Pump and Induction cooking
- **ROI Analysis**: Payback periods for each strategy

## 🏃 Getting Started

### Development

```bash
npm install
npm run dev
```

### Build

```bash
npm run build
npm run preview
```

### Deploy

The app automatically deploys to GitHub Pages when merged to `main` via GitHub Actions.

### Preview Deployments

Pull requests automatically get preview deployments! When you open or update a PR:

1. The preview workflow builds your changes
2. Deploys to `https://thepont.github.io/au-electric-analysis/preview/pr-{number}/`
3. Comments on your PR with the preview URL and commit SHA
4. Updates automatically on new commits
5. Cleans up when the PR is closed

This allows reviewers and contributors to test changes live before merging.

## 📖 Documentation

See [spec.md](spec.md) for complete project specification and implementation details.

## 🔗 Referral Links

- **OVO Energy Free 3 Plan**: https://www.ovoenergy.com.au/refer/paul8789
- **Tesla EV**: https://ts.la/paul511330

## 📝 License

MIT

