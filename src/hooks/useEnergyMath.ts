import { useMemo } from 'react';

// Rate constants (2026 Projections)
const PEAK_RATE = 0.58;      // OVO Peak 4pm-9pm
const OFF_PEAK = 0.24;       // Standard Grid
const FREE_WINDOW = 0.00;    // OVO Free 3: 11am-2pm
const EV_RATE = 0.08;        // OVO EV Plan: 12am-6am
const FEED_IN = 0.05;        // Solar Export
const PETROL_PRICE = 2.15;   // $/L
const PETROL_EFFICIENCY = 9.5;    // L/100km
const EV_EFFICIENCY = 18.5;       // kWh/100km
const GAS_SUPPLY_CHARGE = 350;    // $/yr

interface EnergyInputs {
  bill: number;
  gasBill: number;
  petrolBill: number;
  solarSize: number;
  batterySize: number;
  isEV: boolean;
  isV2H: boolean;
  isHeatPump: boolean;
  isInduction: boolean;
  hasGasHeating: boolean;
  hasGasWater: boolean;
  hasGasCooking: boolean;
  hasPool: boolean;
  hasOldDryer: boolean;
  gridExportLimit: number;
}

interface ApplianceAssumption {
  name: string;
  cost: number;
  icon: string;
}

interface EnergyResults {
  batSavings: number;
  solarSavings: number;
  transportSavings: number;
  gasSavings: number;
  poolPumpSavings: number;
  hpDryerSavings: number;
  gapSealingSavings: number;
  totalSavings: number;
  legacyCosts: number[];
  hackedCosts: number[];
  systemCost: number;
  roiYears: number;
  gridPriceWarning?: string;
  assumptions: ApplianceAssumption[];
  exportClippingLoss?: number;
}

export const useEnergyMath = (inputs: EnergyInputs): EnergyResults => {
  return useMemo(() => {
    const { 
      bill, 
      gasBill, 
      petrolBill, 
      solarSize, 
      batterySize, 
      isEV, 
      isV2H, 
      isHeatPump, 
      isInduction,
      hasGasHeating,
      hasGasWater,
      hasGasCooking,
      hasPool,
      hasOldDryer,
      gridExportLimit 
    } = inputs;
    
    // Build assumptions array based on current setup
    const assumptions: ApplianceAssumption[] = [];
    
    if (gasBill > 0) {
      // Typical AU Split: 50% Heat, 35% Water, 15% Cook
      if (hasGasHeating) {
        assumptions.push({ 
          name: "Gas Ducted Heating", 
          cost: gasBill * 0.50, 
          icon: "Wind" 
        });
      }
      if (hasGasWater) {
        assumptions.push({ 
          name: "Gas Hot Water", 
          cost: gasBill * 0.35, 
          icon: "Droplets" 
        });
      }
      if (hasGasCooking) {
        assumptions.push({ 
          name: "Gas Cooktop", 
          cost: gasBill * 0.15, 
          icon: "Flame" 
        });
      }
    }
    
    if (hasPool) {
      // Single speed pump: ~1.5kW * 8hrs * 365 = ~4,300kWh ($1,300/yr)
      assumptions.push({ 
        name: "Single Speed Pool Pump", 
        cost: 1300, 
        icon: "Waves" 
      });
    }
    
    if (hasOldDryer) {
      // Vented dryer: ~4kWh per load * 3 loads/week = ~$250/yr
      assumptions.push({ 
        name: "Vented Dryer", 
        cost: 250, 
        icon: "Shirt" 
      });
    }
    
    // Validate grid price against realistic bounds (ACL s18 compliance)
    let gridPriceWarning: string | undefined;
    const impliedGridPrice = (PEAK_RATE + OFF_PEAK) / 2; // Average rate
    if (impliedGridPrice > 1.00 || impliedGridPrice < 0.15) {
      gridPriceWarning = "This rate deviates significantly from Australian averages.";
    }
    
    // Baseline Usage Calculation
    const dailyTotalKwh = bill / 365 / ((PEAK_RATE + OFF_PEAK) / 2);
    let adjustedDailyKwh = dailyTotalKwh;
    
    // Appliance Shift (Gas -> Elec)
    let gasElecShift = 0;
    if (isHeatPump && hasGasWater) {
      gasElecShift += (gasBill * 0.35) / 4.0; // COP 4.0
    }
    if (isInduction && hasGasCooking) {
      gasElecShift += (gasBill * 0.15) / 2.0;
    }
    adjustedDailyKwh += gasElecShift / 365;
    
    const dailyPeakNeed = adjustedDailyKwh * 0.45; // 45% of usage is in expensive window

    // The "Enabler" Formula (Battery/V2H)
    const usableCapacity = isV2H ? 60 : batterySize;
    const dailyShift = Math.min(usableCapacity, dailyPeakNeed);
    const batSavings = dailyShift * (PEAK_RATE - FREE_WINDOW) * 365;

    // Solar Formula with Export Clipping
    const solarGen = solarSize * 3.8 * 365;
    const selfUse = Math.min(adjustedDailyKwh * 365 - dailyShift * 365, solarGen * 0.3);
    
    // Calculate export clipping loss
    let exportClippingLoss = 0;
    let actualExportKwh = solarGen - selfUse;
    
    if (gridExportLimit < 999 && solarSize > 0) {
      // Calculate estimated base load during peak sun hours (11am-2pm)
      const dailyBaseLoadKw = adjustedDailyKwh / 24; // Average kW throughout the day
      const peakSunBaseLoadKw = dailyBaseLoadKw * 0.6; // Assume slightly higher usage during day
      
      // Peak solar generation capacity
      const peakSolarKw = solarSize;
      
      // If peak solar exceeds (base load + export limit), we have clipping
      const excessCapacityKw = Math.max(0, peakSolarKw - peakSunBaseLoadKw - gridExportLimit);
      
      if (excessCapacityKw > 0) {
        // Conservative estimate: 2.5 hours of peak sun where clipping occurs
        const clippingHoursPerDay = 2.5;
        const annualClippingDays = 365;
        exportClippingLoss = excessCapacityKw * clippingHoursPerDay * annualClippingDays;
        
        // Reduce actual export by clipping loss
        actualExportKwh = Math.max(0, actualExportKwh - exportClippingLoss);
      }
    }
    
    const exportVal = actualExportKwh * FEED_IN;
    const solarSavings = (selfUse * OFF_PEAK) + exportVal;

    // Transport Delta
    let transportSavings = 0;
    if (isEV) {
      const annualKm = (petrolBill / PETROL_PRICE) / PETROL_EFFICIENCY * 100;
      const legacyTransport = (annualKm / 100) * PETROL_EFFICIENCY * PETROL_PRICE;
      const newTransport = (annualKm / 100) * EV_EFFICIENCY * EV_RATE;
      transportSavings = legacyTransport - newTransport;
    }

    // Gas Savings
    let gasSavings = 0;
    if (isHeatPump || isInduction) {
      // Savings from converting gas appliances
      let heatPumpSavings = 0;
      if (isHeatPump && hasGasWater) {
        const heatPumpGasUsage = gasBill * 0.35; // 35% of gas bill is hot water
        const heatPumpElecCost = (heatPumpGasUsage / 4.0) * OFF_PEAK; // COP 4.0, charged at off-peak
        heatPumpSavings = heatPumpGasUsage - heatPumpElecCost;
      }
      
      let inductionSavings = 0;
      if (isInduction && hasGasCooking) {
        const inductionGasUsage = gasBill * 0.15; // 15% of gas bill is cooking
        const inductionElecCost = (inductionGasUsage / 2.0) * OFF_PEAK; // 50% efficiency, charged at off-peak
        inductionSavings = inductionGasUsage - inductionElecCost;
      }
      
      gasSavings = heatPumpSavings + inductionSavings;
      
      // If all gas appliances are gone (either never had them or replacing them), add supply charge savings
      const noGasHeating = !hasGasHeating;
      const noGasWater = !hasGasWater || isHeatPump;
      const noGasCooking = !hasGasCooking || isInduction;
      
      if (noGasHeating && noGasWater && noGasCooking) {
        gasSavings += GAS_SUPPLY_CHARGE;
      }
    }

    // New Upgrade Savings
    // Pool Pump: Variable speed pump saves ~$900/yr if pool exists
    const poolPumpSavings = hasPool ? 900 : 0;
    
    // Heat Pump Dryer: Saves ~$200/yr if old dryer exists
    const hpDryerSavings = hasOldDryer ? 200 : 0;
    
    // Gap Sealing: Saves 15% of heating bill
    const gapSealingSavings = hasGasHeating ? gasBill * 0.50 * 0.15 : 0;

    const totalSavings = batSavings + solarSavings + transportSavings + gasSavings + poolPumpSavings + hpDryerSavings + gapSealingSavings;

    // Calculate system costs
    const solarCost = solarSize * 1000;
    const batteryCost = batterySize * 1200;
    const evCost = isEV ? 15000 : 0;
    const heatPumpCost = isHeatPump ? 3500 : 0;
    const inductionCost = isInduction ? 2000 : 0;
    const systemCost = solarCost + batteryCost + evCost + heatPumpCost + inductionCost;

    // Calculate 15-year projections with 3% inflation
    const inflation = 1.03;
    const legacyCosts: number[] = [0];
    const hackedCosts: number[] = [systemCost];
    
    for (let year = 1; year <= 15; year++) {
      const inflationFactor = Math.pow(inflation, year);
      const legacyAnnual = (bill + gasBill + petrolBill) * inflationFactor;
      const hackedAnnual = (bill + gasBill + petrolBill - totalSavings) * inflationFactor;
      
      legacyCosts.push(legacyCosts[year - 1] + legacyAnnual);
      hackedCosts.push(hackedCosts[year - 1] + hackedAnnual);
    }

    // Calculate ROI (years to break even)
    const roiYears = totalSavings > 0 ? systemCost / totalSavings : 999;

    return {
      batSavings,
      solarSavings,
      transportSavings,
      gasSavings,
      poolPumpSavings,
      hpDryerSavings,
      gapSealingSavings,
      totalSavings,
      legacyCosts,
      hackedCosts,
      systemCost,
      roiYears,
      gridPriceWarning,
      assumptions,
      exportClippingLoss,
    };
  }, [inputs]);
};
