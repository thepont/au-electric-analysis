export const OVO_CONFIG = {
  REFERRAL_CODE: "paul8789",
  REFERRAL_URL: "https://www.ovoenergy.com.au/refer/paul8789",
  TESLA_REFERRAL_URL: "https://ts.la/paul511330",
  RATES: { PEAK: 0.58, FREE: 0.00 }
};

export function calculateHackerSavings({ batteryKwh, dailyPeakUsageKwh }) {
  // Logic: Savings = Shifted kWh * (Peak Rate - Free Rate)
  const saturation = Math.min(batteryKwh, dailyPeakUsageKwh);
  return saturation * (OVO_CONFIG.RATES.PEAK - OVO_CONFIG.RATES.FREE) * 365;
}
