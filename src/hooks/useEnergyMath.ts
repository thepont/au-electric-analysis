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
  gridExportLimit: number;
  serviceFuse: number;
  hasPool: boolean;
  strategies: {
    chargeEvInWindow: boolean;
    chargeBatInWindow: boolean;
    runPoolInWindow: boolean;
    runHotWaterInWindow: boolean;
  };
}

interface EnergyResults {
  batSavings: number;
  solarSavings: number;
  transportSavings: number;
  gasSavings: number;
  totalSavings: number;
  legacyCosts: number[];
  hackedCosts: number[];
  systemCost: number;
  roiYears: number;
  gridPriceWarning?: string;
  exportClippingLoss?: number;
  maxKw: number;
  peakLoad: number;
  isBreakerTripped: boolean;
  wastedKwh: number;
  actualImportKwh: number;
  requestedImportKwh: number;
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
      gridExportLimit,
      serviceFuse,
      hasPool,
      strategies
    } = inputs;
    
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
    if (isHeatPump) {
      gasElecShift += (gasBill * 0.35) / 4.0; // COP 4.0
    }
    if (isInduction) {
      gasElecShift += (gasBill * 0.15) / 2.0;
    }
    adjustedDailyKwh += gasElecShift / 365;
    
    const dailyPeakNeed = adjustedDailyKwh * 0.45; // 45% of usage is in expensive window

    // Service Fuse Constraint Calculations
    // Calculate Max Grid Draw (kW)
    const maxKw = serviceFuse === 100 
      ? (3 * 63 * 230) / 1000  // 3-Phase: ~43kW
      : (serviceFuse * 230) / 1000;

    // Calculate Peak Instantaneous Load (kW) during 11am-2pm window
    const baseLoad = 0.5; // kW
    let peakLoad = baseLoad;
    
    if (isEV && strategies.chargeEvInWindow) {
      peakLoad += 7.0; // EV charging load
    }
    if (batterySize > 0 && strategies.chargeBatInWindow) {
      peakLoad += 5.0; // Battery charging load
    }
    if (hasPool && strategies.runPoolInWindow) {
      peakLoad += 1.5; // Pool pump load
    }
    if (isHeatPump && strategies.runHotWaterInWindow) {
      peakLoad += 1.0; // Heat pump hot water load
    }

    // Determine Overload
    const isBreakerTripped = peakLoad > maxKw;

    // Calculate "Capped" Savings
    const maxPossibleImportKwh = maxKw * 3; // 3-hour physical limit
    
    // Calculate requested import during free window
    let requestedImportKwh = 0;
    if (isEV && strategies.chargeEvInWindow) {
      requestedImportKwh += 21; // 7kW * 3h = 21 kWh
    }
    if (batterySize > 0 && strategies.chargeBatInWindow) {
      requestedImportKwh += Math.min(batterySize, 15); // 5kW * 3h = 15 kWh max, or battery capacity
    }
    if (hasPool && strategies.runPoolInWindow) {
      requestedImportKwh += 4.5; // 1.5kW * 3h = 4.5 kWh
    }
    if (isHeatPump && strategies.runHotWaterInWindow) {
      requestedImportKwh += 3; // 1kW * 3h = 3 kWh
    }

    const actualImportKwh = Math.min(requestedImportKwh, maxPossibleImportKwh);
    const wastedKwh = requestedImportKwh - actualImportKwh;

    // The "Enabler" Formula (Battery/V2H)
    const usableCapacity = isV2H ? 60 : batterySize;
    const dailyShift = Math.min(usableCapacity, dailyPeakNeed);
    
    // Adjust battery savings for wasted kWh due to fuse constraint
    // The wastedValue represents the annual cost of energy we can't import due to fuse limits
    // We scale it proportionally to the battery savings calculation
    const wastedValue = requestedImportKwh > 0 
      ? (wastedKwh * (PEAK_RATE - FREE_WINDOW) * 365 / requestedImportKwh)
      : 0;
    const batSavings = Math.max(0, dailyShift * (PEAK_RATE - FREE_WINDOW) * 365 - wastedValue);

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
      if (isHeatPump) {
        const heatPumpGasUsage = gasBill * 0.35; // 35% of gas bill is hot water
        const heatPumpElecCost = (heatPumpGasUsage / 4.0) * OFF_PEAK; // COP 4.0, charged at off-peak
        heatPumpSavings = heatPumpGasUsage - heatPumpElecCost;
      }
      
      let inductionSavings = 0;
      if (isInduction) {
        const inductionGasUsage = gasBill * 0.15; // 15% of gas bill is cooking
        const inductionElecCost = (inductionGasUsage / 2.0) * OFF_PEAK; // 50% efficiency, charged at off-peak
        inductionSavings = inductionGasUsage - inductionElecCost;
      }
      
      gasSavings = heatPumpSavings + inductionSavings;
      
      // If all gas appliances are gone, add supply charge savings
      if (isHeatPump && isInduction) {
        gasSavings += GAS_SUPPLY_CHARGE;
      }
    }

    const totalSavings = batSavings + solarSavings + transportSavings + gasSavings;

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
      totalSavings,
      legacyCosts,
      hackedCosts,
      systemCost,
      roiYears,
      gridPriceWarning,
      exportClippingLoss,
      maxKw,
      peakLoad,
      isBreakerTripped,
      wastedKwh,
      actualImportKwh,
      requestedImportKwh,
    };
  }, [
    inputs.bill,
    inputs.gasBill,
    inputs.petrolBill,
    inputs.solarSize,
    inputs.batterySize,
    inputs.isEV,
    inputs.isV2H,
    inputs.isHeatPump,
    inputs.isInduction,
    inputs.gridExportLimit,
    inputs.serviceFuse,
    inputs.hasPool,
    inputs.strategies.chargeEvInWindow,
    inputs.strategies.chargeBatInWindow,
    inputs.strategies.runPoolInWindow,
    inputs.strategies.runHotWaterInWindow,
  ]);
};
