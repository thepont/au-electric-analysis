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
  serviceFuse: number;
  strategies: {
    chargeEvInWindow: boolean;
    chargeBatInWindow: boolean;
    runPoolInWindow: boolean;
    runHotWaterInWindow: boolean;
  };
  currentSetup: {
    hotWater: 'gas' | 'resistive' | 'heatpump';
    heating: 'gas' | 'resistive' | 'rc' | 'none';
    cooking: 'gas' | 'induction';
    pool: 'none' | 'single_speed' | 'variable_speed';
  };
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
  maxKw: number;
  peakLoad: number;
  isBreakerTripped: boolean;
  wastedKwh: number;
  actualImportKwh: number;
  requestedImportKwh: number;
  gasDisconnected: boolean;
  liabilityCosts: {
    hotWater: number;
    heating: number;
    cooking: number;
    pool: number;
  };
  // Waterfall breakdown
  manualShiftSavings: number;
  batteryArbitrageSavings: number;
  // Gas breakdown
  hotWaterSavings: number;
  heatingSavings: number;
  cookingSavings: number;
  gasDisconnectionBonus: number;
  // Current setup info for ROI calculations
  currentHeatingType: 'gas' | 'resistive' | 'rc' | 'none';
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
      gridExportLimit,
      serviceFuse,
      strategies,
      currentSetup
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
    
    // === v15 RETROFIT LOGIC: Differential Calculations ===
    
    // Calculate 10-Year Liability Costs (Cost to Keep Current System)
    const INFLATION_RATE = 1.03;
    const calculateTenYearLiability = (annualCost: number): number => {
      let total = 0;
      for (let year = 1; year <= 10; year++) {
        total += annualCost * Math.pow(INFLATION_RATE, year);
      }
      return total;
    };

    // Hot Water Savings (Differential Logic)
    let hotWaterSavings = 0;
    let hotWaterLiability = 0;
    
    if (isHeatPump && currentSetup.hotWater !== 'heatpump') {
      if (currentSetup.hotWater === 'gas') {
        // Replacing Gas Hot Water with Heat Pump
        const gasHotWaterCost = gasBill * 0.35; // 35% of gas bill
        hotWaterLiability = calculateTenYearLiability(gasHotWaterCost);
        
        // Gas MJ conversion: Typical gas hot water uses ~10 GJ/year
        // Converting to electric with COP 4.0: 10 GJ = 10,000 MJ / 3.6 = 2,778 kWh thermal
        // With COP 4.0: 2,778 / 4.0 = 694.5 kWh electric
        const gasEnergyMJ = (gasHotWaterCost / (gasBill || 1)) * gasBill * 40; // Approx MJ from gas cost
        const newElecKwh = (gasEnergyMJ / 3.6) / 4.0; // MJ to kWh, then apply COP
        const newElecCost = newElecKwh * OFF_PEAK;
        hotWaterSavings = gasHotWaterCost - newElecCost;
      } else if (currentSetup.hotWater === 'resistive') {
        // Replacing Resistive Hot Water with Heat Pump
        // Typical resistive: 3600 kWh/year
        const resistiveKwh = 3600;
        const resistiveCost = resistiveKwh * OFF_PEAK;
        hotWaterLiability = calculateTenYearLiability(resistiveCost);
        
        // Heat pump saves 75% of energy (COP 4.0 means 1/4 the energy)
        hotWaterSavings = resistiveCost * 0.75;
      }
    }

    // Heating Savings (Differential Logic)
    let heatingSavings = 0;
    let heatingLiability = 0;
    
    // Check if we're upgrading heating (RC = Reverse Cycle)
    const isUpgradingHeating = currentSetup.heating !== 'rc' && currentSetup.heating !== 'none';
    
    if (isUpgradingHeating) {
      if (currentSetup.heating === 'gas') {
        // Replacing Gas Heating with Reverse Cycle
        const gasHeatingCost = gasBill * 0.55; // 55% of gas bill for heating
        heatingLiability = calculateTenYearLiability(gasHeatingCost);
        
        // Gas heating to RC with COP 4.5
        const gasEnergyMJ = (gasHeatingCost / (gasBill || 1)) * gasBill * 40;
        const newElecKwh = (gasEnergyMJ / 3.6) / 4.5; // Apply COP 4.5
        const newElecCost = newElecKwh * OFF_PEAK;
        heatingSavings = gasHeatingCost - newElecCost;
      } else if (currentSetup.heating === 'resistive') {
        // Replacing Resistive Heating with Reverse Cycle
        // Typical resistive heating: 2000 kWh/year
        const resistiveKwh = 2000;
        const resistiveCost = resistiveKwh * OFF_PEAK;
        heatingLiability = calculateTenYearLiability(resistiveCost);
        
        // RC with COP 4.5 saves ~78% (1/4.5 = 0.22, so saves 0.78)
        heatingSavings = resistiveCost * 0.78;
      }
    }

    // Cooking Savings (Differential Logic)
    let cookingSavings = 0;
    let cookingLiability = 0;
    
    if (isInduction && currentSetup.cooking === 'gas') {
      // Replacing Gas Cooking with Induction
      const gasCookingCost = gasBill * 0.15; // 15% of gas bill
      cookingLiability = calculateTenYearLiability(gasCookingCost);
      
      // Induction is about 2x as efficient as gas
      const newElecCost = (gasCookingCost / 2.0) * (OFF_PEAK / 0.41); // Adjusted for typical rate
      cookingSavings = gasCookingCost - newElecCost;
    }

    // Pool Savings (Three Options Logic)
    let poolSavings = 0;
    let poolLiability = 0;
    
    if (currentSetup.pool !== 'none') {
      if (currentSetup.pool === 'single_speed') {
        // Single Speed Pump baseline cost
        const singleSpeedKwh = 1.5 * 8 * 365; // 1.5kW * 8h/day * 365 days = 4,380 kWh
        const singleSpeedCost = singleSpeedKwh * OFF_PEAK;
        poolLiability = calculateTenYearLiability(singleSpeedCost);
        
        // Check if user wants to run pool in free window (Timer Hack)
        if (strategies.runPoolInWindow) {
          // Timer Hack: Run during OVO Free Window = $0 cost
          poolSavings = singleSpeedCost; // Save 100%
        } else {
          // Variable Speed Pump upgrade
          const vspKwh = 0.2 * 10 * 365; // 200W * 10h/day * 365 days = 730 kWh
          const vspCost = vspKwh * OFF_PEAK;
          poolSavings = singleSpeedCost - vspCost;
        }
      } else if (currentSetup.pool === 'variable_speed') {
        // Already have VSP - check if can do timer hack
        const vspKwh = 0.2 * 10 * 365;
        const vspCost = vspKwh * OFF_PEAK;
        poolLiability = calculateTenYearLiability(vspCost);
        
        if (strategies.runPoolInWindow) {
          // Can't use timer hack with VSP (VSP is already optimal)
          poolSavings = 0;
        }
      }
    }

    // Gas Disconnection Bonus
    let gasDisconnectionBonus = 0;
    let gasDisconnected = false;
    
    // Check if user STARTED with gas (gasBill > 0)
    if (gasBill > 0) {
      // Track remaining gas appliances after upgrades
      const hasGasAfterUpgrades = 
        (currentSetup.hotWater === 'gas' && !isHeatPump) ||
        (currentSetup.heating === 'gas' && !isUpgradingHeating) ||
        (currentSetup.cooking === 'gas' && !isInduction);
      
      // If NO gas appliances remain, add supply charge savings
      if (!hasGasAfterUpgrades) {
        gasDisconnectionBonus = GAS_SUPPLY_CHARGE;
        gasDisconnected = true;
      }
    }

    // Total Gas-Related Savings
    const gasSavings = hotWaterSavings + heatingSavings + cookingSavings + gasDisconnectionBonus;

    // Appliance Shift (Gas -> Elec) for load calculation
    let gasElecShift = 0;
    if (isHeatPump && currentSetup.hotWater === 'gas') {
      const gasHotWaterCost = gasBill * 0.35;
      const gasEnergyMJ = (gasHotWaterCost / (gasBill || 1)) * gasBill * 40;
      gasElecShift += (gasEnergyMJ / 3.6) / 4.0 / 365; // Daily kWh
    }
    if (isInduction && currentSetup.cooking === 'gas') {
      const gasCookingCost = gasBill * 0.15;
      const gasEnergyMJ = (gasCookingCost / (gasBill || 1)) * gasBill * 40;
      gasElecShift += (gasEnergyMJ / 3.6) / 2.0 / 365; // Daily kWh
    }
    
    const adjustedDailyKwh = dailyTotalKwh + gasElecShift;
    
    // Service Fuse Constraint Calculations
    // Calculate Max Grid Draw (kW)
    const maxKw = serviceFuse === 100 
      ? (3 * 63 * 230) / 1000  // 3-Phase: ~43kW
      : (serviceFuse * 230) / 1000;

    // Calculate Peak Instantaneous Load (kW) during 11am-2pm window
    // Base load varies by household; estimate from daily usage pattern
    // Typical range: 0.2kW (very efficient) to 1.0kW (larger home with always-on devices)
    const baseLoad = Math.min(0.8, adjustedDailyKwh / 24); // Estimate base load from daily average, capped at 0.8kW
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
    // Include base load that runs during the 3-hour window
    let requestedImportKwh = baseLoad * 3; // Base load always runs
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

    // ========================================
    // OVO WATERFALL CALCULATION
    // ========================================
    // This follows the "Waterfall System" to avoid double-counting:
    // 1. Manual shifts reduce peak load FIRST
    // 2. Battery can only attack REMAINING peak load
    // 3. This prevents overestimating ROI by summing independent savings
    
    // Step 1: Calculate initial peak consumption (the "Enemy")
    // Peak window is 4pm-9pm (~45% of daily usage for typical household)
    let peakConsumptionKwh = adjustedDailyKwh * 0.45;
    
    // Step 2: Manual Load Shifting (Subtracts from Peak FIRST)
    // These appliances are moved out of peak via timers (run during 11am-2pm free window)
    // CRITICAL: Manual shifts reduce the battery's opportunity to save
    let manualShiftKwh = 0;
    
    // Pool pump timer hack: Moves 4kWh from peak to free window
    // Single-speed pump: 1.5kW * 8hrs = 12kWh daily, typically ~4kWh would be in peak
    if (hasPool && strategies.runPoolInWindow && currentSetup.pool === 'single_speed') {
      manualShiftKwh += 4.0;
      peakConsumptionKwh -= 4.0;
    }
    
    // Hot water timer hack: Moves 3kWh from peak to free window
    // Heat pump hot water (when isHeatPump is true): ~2.5kWh daily average usage
    // Typically ~1.5kWh would run during peak evening hours when people shower
    // Timer moves this load to the 11am-2pm free window, saving up to 3kWh from peak
    if (isHeatPump && strategies.runHotWaterInWindow) {
      manualShiftKwh += 3.0;
      peakConsumptionKwh -= 3.0;
    }
    
    // Step 3: Data hygiene - ensure we didn't go below zero
    peakConsumptionKwh = Math.max(0, peakConsumptionKwh);
    
    // Step 4: Calculate Manual Shift Savings
    // Savings = kWh shifted * peak rate * days per year
    // Cost to charge = $0.00 (free window)
    const manualShiftSavings = manualShiftKwh * PEAK_RATE * 365;
    
    // Step 5: Battery Arbitrage (Attacks REMAINING Peak only)
    // The battery can only save what's LEFT of the peak after manual shifts
    // This is the key insight: load shifting REDUCES battery ROI
    const usableCapacity = isV2H ? 60 : batterySize;
    const batteryShiftKwh = Math.min(peakConsumptionKwh, usableCapacity);
    
    // Step 6: Calculate Battery Arbitrage Savings
    // Gross savings from arbitrage (buy at $0 during free window, avoid $0.58 peak)
    const grossBatterySavings = batteryShiftKwh * (PEAK_RATE - FREE_WINDOW) * 365;
    
    // Solar Opportunity Cost (The "Hidden Cost")
    // If you have solar generating during the free window (11am-2pm), your inverter
    // will prioritize charging the battery from solar BEFORE grid power.
    // This means you lose feed-in tariff revenue (~5c/kWh) on that solar energy.
    // Conservative estimate: 30% of battery charge comes from solar during free window
    let solarOpportunityCost = 0;
    if (solarSize > 0 && batterySize > 0 && strategies.chargeBatInWindow) {
      solarOpportunityCost = batteryShiftKwh * 0.3 * FEED_IN * 365;
    }
    
    // Fuse Constraint Cost (Physical limit on grid import)
    // If service fuse is too small, we can't import enough energy during free window
    const wastedValue = wastedKwh * (PEAK_RATE - FREE_WINDOW) * 365;
    
    // Net battery arbitrage savings after all costs
    const batteryArbitrageSavings = Math.max(0, 
      grossBatterySavings - wastedValue - solarOpportunityCost
    );
    
    // Step 7: Total Battery Savings (for backward compatibility)
    // This combines manual shifts + battery arbitrage (both use OVO Free 3 window)
    const batSavings = manualShiftSavings + batteryArbitrageSavings;

    
    
    // Solar Formula with Export Clipping
    const solarGen = solarSize * 3.8 * 365;
    const selfUse = Math.min(adjustedDailyKwh * 365 - batteryShiftKwh * 365, solarGen * 0.3);
    
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

    // Other Upgrade Savings (Keep existing logic)
    // Heat Pump Dryer: Saves ~$200/yr if old dryer exists
    const hpDryerSavings = hasOldDryer ? 200 : 0;
    
    // Gap Sealing: Saves 15% of heating bill
    const gapSealingSavings = hasGasHeating ? gasBill * 0.50 * 0.15 : 0;

    const totalSavings = batSavings + solarSavings + transportSavings + gasSavings + poolSavings + hpDryerSavings + gapSealingSavings;

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
      poolPumpSavings: poolSavings,
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
      maxKw,
      peakLoad,
      isBreakerTripped,
      wastedKwh,
      actualImportKwh,
      requestedImportKwh,
      gasDisconnected,
      liabilityCosts: {
        hotWater: hotWaterLiability,
        heating: heatingLiability,
        cooking: cookingLiability,
        pool: poolLiability,
      },
      // Waterfall breakdown
      manualShiftSavings,
      batteryArbitrageSavings,
      // Gas breakdown
      hotWaterSavings,
      heatingSavings,
      cookingSavings,
      gasDisconnectionBonus,
      // Current setup info for ROI calculations
      currentHeatingType: currentSetup.heating,
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
    inputs.hasGasHeating,
    inputs.hasGasWater,
    inputs.hasGasCooking,
    inputs.hasPool,
    inputs.hasOldDryer,
    inputs.gridExportLimit,
    inputs.serviceFuse,
    inputs.strategies.chargeEvInWindow,
    inputs.strategies.chargeBatInWindow,
    inputs.strategies.runPoolInWindow,
    inputs.strategies.runHotWaterInWindow,
    inputs.currentSetup.hotWater,
    inputs.currentSetup.heating,
    inputs.currentSetup.cooking,
    inputs.currentSetup.pool,
  ]);
};
