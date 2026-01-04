/**
 * EnergyHome.OS - 24-Hour Simulation Engine
 * 
 * Generates hourly profiles for Solar, Consumption, Battery, and Temperature
 * following Australian grid physics and OVO Free 3 arbitrage strategies.
 */

/**
 * Calculate solar generation using Gaussian curve
 * @param {number} hour - Hour of day (0-23)
 * @param {string} season - 'Summer' or 'Winter'
 * @param {number} systemSize - Solar system size in kW
 * @returns {number} Solar generation in kW
 */
const calculateSolar = (hour, season, systemSize) => {
  // Peak sun hour is 12 noon
  const peakHour = 12;
  
  // Gaussian parameters
  const sigma = 3.5; // Width of the curve
  const amplitude = season === 'Winter' ? 0.6 : 1.0; // Winter produces 60% of summer
  
  // Gaussian curve: peak at noon, tapering to zero at night
  const gaussian = Math.exp(-Math.pow(hour - peakHour, 2) / (2 * sigma * sigma));
  
  // Solar output in kW (peak output is system size)
  const solarKw = systemSize * gaussian * amplitude;
  
  return solarKw;
};

/**
 * Calculate indoor temperature with thermal decay
 * @param {number} hour - Hour of day (0-23)
 * @param {number} heatingStart - Start hour of heating schedule
 * @param {number} heatingEnd - End hour of heating schedule
 * @param {string} insulation - 'Leaky' or 'Sealed'
 * @param {number} prevTemp - Previous hour's temperature
 * @returns {number} Temperature in Celsius
 */
const calculateTemperature = (hour, heatingStart, heatingEnd, insulation, prevTemp) => {
  const targetTemp = 21; // Target indoor temperature when heating is on
  const ambientTemp = 14; // Outside temperature (simplified)
  const heatingRate = 2.0; // Degrees per hour when heating
  const decayRate = insulation === 'Leaky' ? 0.8 : 0.3; // Degrees per hour when not heating
  
  let temp = prevTemp || 18; // Start at 18°C if no previous
  
  // Check if heating is active
  const isHeatingOn = hour >= heatingStart && hour <= heatingEnd;
  
  if (isHeatingOn) {
    // Heating: approach target temperature
    temp = Math.min(targetTemp, temp + heatingRate);
  } else {
    // Not heating: decay toward ambient
    temp = Math.max(ambientTemp, temp - decayRate);
  }
  
  return temp;
};

/**
 * Generate 24-hour energy profile
 * @param {Object} config - Configuration object
 * @param {number} config.solarSystemKw - Solar system size (e.g., 6.6)
 * @param {number} config.batteryKwh - Battery capacity (e.g., 13.5)
 * @param {Object} config.heatingSchedule - Heating window {start: 17, end: 22}
 * @param {boolean} config.loadShifting - Whether to shift loads to 11am-2pm
 * @param {string} config.season - 'Summer' or 'Winter'
 * @param {string} config.strategy - 'ovo' or 'standard'
 * @param {string} config.insulation - 'Leaky' or 'Sealed'
 * @returns {Array} Array of 24 hourly data points
 */
export const generateDailyProfile = (config) => {
  const {
    solarSystemKw = 6.6,
    batteryKwh = 13.5,
    heatingSchedule = { start: 17, end: 22 },
    loadShifting = false,
    season = 'Summer',
    strategy = 'standard',
    insulation = 'Sealed'
  } = config;
  
  const hours = Array.from({ length: 24 }, (_, i) => i);
  let currentSoC = 0; // Start with empty battery (or could be 20%)
  let currentTemp = 18; // Start temperature
  
  const hourlyData = hours.map(h => {
    // === STEP 1: Calculate Consumption (The "Layer Cake") ===
    
    // Baseload: Always on (fridge, wifi, etc.)
    let consumption = 0.3;
    
    // Heating/Cooling: Active during schedule
    const isHeatingHour = h >= heatingSchedule.start && h <= heatingSchedule.end;
    if (isHeatingHour) {
      consumption += 2.5; // Heating load
    }
    
    // Shiftable Loads (Pool/EV/Hot Water)
    if (loadShifting) {
      // Shifted to 11am-2pm (OVO Free Window)
      if (h >= 11 && h <= 13) {
        consumption += 6.0; // Big load during free window
      }
    } else {
      // Not shifted - run during peak evening hours (The "Lazy" profile)
      if (h >= 18 && h <= 20) {
        consumption += 6.0; // Big load during expensive peak
      }
    }
    
    // === STEP 2: Calculate Solar Generation ===
    const solar = calculateSolar(h, season, solarSystemKw);
    
    // === STEP 3: Calculate Battery Physics ===
    let gridImport = 0;
    let gridExport = 0;
    let batteryActivity = 0; // Positive = charging, Negative = discharging
    
    // OVO Free Window: 11am-2pm
    const isFreeWindow = h >= 11 && h <= 13;
    
    if (isFreeWindow && strategy === 'ovo') {
      // === OVO STRATEGY: Force charge battery from grid during free window ===
      const roomInBattery = batteryKwh - currentSoC;
      const maxChargeRate = 5.0; // Inverter limit (5kW)
      const chargeAmount = Math.min(roomInBattery, maxChargeRate);
      
      batteryActivity = chargeAmount;
      currentSoC += chargeAmount;
      
      // Grid import = Consumption + Battery Charging - Solar
      const totalNeed = consumption + chargeAmount;
      const netFromGrid = totalNeed - solar;
      
      if (netFromGrid > 0) {
        gridImport = netFromGrid;
      } else {
        // Solar covers everything + exports
        gridExport = Math.abs(netFromGrid);
      }
    } else {
      // === STANDARD STRATEGY: Solar self-consumption with battery ===
      const net = solar - consumption;
      
      if (net > 0) {
        // Surplus: Charge battery, then export excess
        const roomInBattery = batteryKwh - currentSoC;
        const chargeAmount = Math.min(net, roomInBattery);
        
        batteryActivity = chargeAmount;
        currentSoC += chargeAmount;
        
        gridExport = net - chargeAmount;
      } else {
        // Deficit: Discharge battery, then import from grid
        const deficit = Math.abs(net);
        const availableInBattery = currentSoC;
        const dischargeAmount = Math.min(deficit, availableInBattery);
        
        batteryActivity = -dischargeAmount;
        currentSoC -= dischargeAmount;
        
        gridImport = deficit - dischargeAmount;
      }
    }
    
    // === STEP 4: Calculate Temperature (Comfort Coefficient) ===
    currentTemp = calculateTemperature(
      h,
      heatingSchedule.start,
      heatingSchedule.end,
      insulation,
      currentTemp
    );
    
    // === STEP 5: Calculate Layer Breakdown ===
    const baseLoad = 0.3;
    const heatingLoad = isHeatingHour ? 2.5 : 0;
    let shiftableLoad = 0;
    if (loadShifting && h >= 11 && h <= 13) {
      shiftableLoad = 6.0;
    } else if (!loadShifting && h >= 18 && h <= 20) {
      shiftableLoad = 6.0;
    }
    
    return {
      hour: h,
      hourLabel: `${h.toString().padStart(2, '0')}:00`,
      solar: parseFloat(solar.toFixed(2)),
      consumption: parseFloat(consumption.toFixed(2)),
      baseLoad: parseFloat(baseLoad.toFixed(2)),
      heatingLoad: parseFloat(heatingLoad.toFixed(2)),
      shiftableLoad: parseFloat(shiftableLoad.toFixed(2)),
      batterySoC: parseFloat(currentSoC.toFixed(2)),
      batterySoCPercent: parseFloat(((currentSoC / batteryKwh) * 100).toFixed(1)),
      batteryActivity: parseFloat(batteryActivity.toFixed(2)),
      gridImport: parseFloat(gridImport.toFixed(2)),
      gridExport: parseFloat(gridExport.toFixed(2)),
      temperature: parseFloat(currentTemp.toFixed(1)),
      isFreeWindow,
      isHeatingHour
    };
  });
  
  return hourlyData;
};

/**
 * Calculate daily summary statistics
 * @param {Array} hourlyData - Array from generateDailyProfile
 * @returns {Object} Summary statistics
 */
export const calculateDailySummary = (hourlyData) => {
  const totalSolar = hourlyData.reduce((sum, h) => sum + h.solar, 0);
  const totalConsumption = hourlyData.reduce((sum, h) => sum + h.consumption, 0);
  const totalGridImport = hourlyData.reduce((sum, h) => sum + h.gridImport, 0);
  const totalGridExport = hourlyData.reduce((sum, h) => sum + h.gridExport, 0);
  const peakGridImport = Math.max(...hourlyData.map(h => h.gridImport));
  
  // Grid Independence: % of consumption covered by solar+battery (not grid)
  const gridIndependence = totalConsumption > 0 
    ? ((totalConsumption - totalGridImport) / totalConsumption) * 100 
    : 0;
  
  // Wasted Solar: Energy exported when battery is full
  const wastedSolar = totalGridExport;
  
  // Peak Grid Usage: Maximum single-hour import
  const peakGridUsage = peakGridImport;
  
  // Temperature warnings
  const minTemp = Math.min(...hourlyData.map(h => h.temperature));
  const comfortWarning = minTemp < 16 ? `Temperature drops to ${minTemp.toFixed(1)}°C` : null;
  
  return {
    totalSolar: parseFloat(totalSolar.toFixed(2)),
    totalConsumption: parseFloat(totalConsumption.toFixed(2)),
    totalGridImport: parseFloat(totalGridImport.toFixed(2)),
    totalGridExport: parseFloat(totalGridExport.toFixed(2)),
    gridIndependence: parseFloat(gridIndependence.toFixed(1)),
    wastedSolar: parseFloat(wastedSolar.toFixed(2)),
    peakGridUsage: parseFloat(peakGridUsage.toFixed(2)),
    minTemp: parseFloat(minTemp.toFixed(1)),
    maxTemp: parseFloat(Math.max(...hourlyData.map(h => h.temperature)).toFixed(1)),
    comfortWarning
  };
};
