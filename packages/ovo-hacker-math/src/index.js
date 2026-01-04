export const OVO_CONFIG = {
  REFERRAL_CODE: "paul8789",
  REFERRAL_URL: "https://www.ovoenergy.com.au/refer/paul8789",
  TESLA_REFERRAL_URL: "https://ts.la/paul511330",
  RATES: { PEAK: 0.58, FREE: 0.00 }
};

const DAYS_PER_YEAR = 365;

/**
 * Calculate annual savings from energy arbitrage strategy using OVO Energy 'Free 3' plan.
 * 
 * @param {Object} params - Calculation parameters
 * @param {number} params.batteryKwh - Battery capacity in kilowatt-hours
 * @param {number} params.dailyPeakUsageKwh - Daily energy usage during peak hours in kilowatt-hours
 * @returns {number} Annual savings in dollars
 * @throws {TypeError} If parameters are not positive numbers
 * 
 * @example
 * calculateHackerSavings({ batteryKwh: 13.5, dailyPeakUsageKwh: 10 })
 * // returns 2117.00
 */
export function calculateHackerSavings({ batteryKwh, dailyPeakUsageKwh }) {
  if (typeof batteryKwh !== 'number' || batteryKwh <= 0) {
    throw new TypeError('batteryKwh must be a positive number');
  }
  if (typeof dailyPeakUsageKwh !== 'number' || dailyPeakUsageKwh <= 0) {
    throw new TypeError('dailyPeakUsageKwh must be a positive number');
  }
  
  // Logic: Savings = Shifted kWh * (Peak Rate - Free Rate) * Days per Year
  const saturation = Math.min(batteryKwh, dailyPeakUsageKwh);
  return saturation * (OVO_CONFIG.RATES.PEAK - OVO_CONFIG.RATES.FREE) * DAYS_PER_YEAR;
}
