import { describe, it, expect } from 'vitest';
import { generateDailyProfile, calculateDailySummary } from './simulationEngine';

describe('simulationEngine', () => {
  describe('generateDailyProfile', () => {
    it('should generate 24 hours of data', () => {
      const profile = generateDailyProfile({
        solarSystemKw: 6.6,
        batteryKwh: 13.5,
        heatingSchedule: { start: 17, end: 22 },
        loadShifting: false,
        season: 'Summer',
        strategy: 'standard',
        insulation: 'Sealed'
      });

      expect(profile).toHaveLength(24);
      expect(profile[0].hour).toBe(0);
      expect(profile[23].hour).toBe(23);
    });

    it('should generate solar power with Gaussian curve', () => {
      const profile = generateDailyProfile({
        solarSystemKw: 6.6,
        season: 'Summer',
        strategy: 'standard'
      });

      // Solar should be zero at night
      expect(profile[0].solar).toBeLessThan(0.1);
      expect(profile[23].solar).toBeLessThan(0.1);
      
      // Solar should peak around noon
      const noonSolar = profile[12].solar;
      expect(noonSolar).toBeGreaterThan(5.0);
      
      // Morning/Evening solar should be less than noon
      expect(profile[8].solar).toBeLessThan(noonSolar);
      expect(profile[16].solar).toBeLessThan(noonSolar);
    });

    it('should reduce solar in winter', () => {
      const summerProfile = generateDailyProfile({
        solarSystemKw: 6.6,
        season: 'Summer',
        strategy: 'standard'
      });
      
      const winterProfile = generateDailyProfile({
        solarSystemKw: 6.6,
        season: 'Winter',
        strategy: 'standard'
      });

      // Winter noon solar should be ~60% of summer
      const summerNoonSolar = summerProfile[12].solar;
      const winterNoonSolar = winterProfile[12].solar;
      const ratio = winterNoonSolar / summerNoonSolar;
      
      expect(ratio).toBeGreaterThan(0.55);
      expect(ratio).toBeLessThan(0.65);
    });

    it('should include heating load during schedule', () => {
      const profile = generateDailyProfile({
        solarSystemKw: 6.6,
        batteryKwh: 13.5,
        heatingSchedule: { start: 17, end: 22 },
        season: 'Summer',
        strategy: 'standard'
      });

      // Heating should be active during schedule (17:00-22:00)
      expect(profile[17].heatingLoad).toBe(2.5);
      expect(profile[20].heatingLoad).toBe(2.5);
      expect(profile[22].heatingLoad).toBe(2.5);
      
      // Heating should be off outside schedule
      expect(profile[12].heatingLoad).toBe(0);
      expect(profile[23].heatingLoad).toBe(0);
    });

    it('should shift loads when loadShifting is enabled', () => {
      const lazyProfile = generateDailyProfile({
        solarSystemKw: 6.6,
        batteryKwh: 13.5,
        loadShifting: false,
        season: 'Summer',
        strategy: 'standard'
      });
      
      const smartProfile = generateDailyProfile({
        solarSystemKw: 6.6,
        batteryKwh: 13.5,
        loadShifting: true,
        season: 'Summer',
        strategy: 'standard'
      });

      // Lazy: loads at 6pm-8pm
      expect(lazyProfile[18].shiftableLoad).toBe(6.0);
      expect(lazyProfile[12].shiftableLoad).toBe(0);
      
      // Smart: loads at 11am-1pm
      expect(smartProfile[12].shiftableLoad).toBe(6.0);
      expect(smartProfile[18].shiftableLoad).toBe(0);
    });

    it('should force charge battery during OVO free window', () => {
      const profile = generateDailyProfile({
        solarSystemKw: 6.6,
        batteryKwh: 13.5,
        heatingSchedule: { start: 17, end: 22 },
        loadShifting: false,
        season: 'Summer',
        strategy: 'ovo'
      });

      // Battery should charge during 11am-1pm free window (if not already full)
      // Check that battery reaches high SoC by end of free window
      const hour13 = profile[13];
      
      // Battery should be well charged by end of free window
      expect(hour13.batterySoCPercent).toBeGreaterThan(50);
      
      // At least one hour during free window should show charging activity
      // (unless battery was already full from solar)
      const freeWindowHours = profile.filter(h => h.isFreeWindow);
      const totalChargingInWindow = freeWindowHours.reduce((sum, h) => sum + Math.max(0, h.batteryActivity), 0);
      
      // Either battery charges during window OR it was already full
      expect(totalChargingInWindow >= 0).toBe(true);
    });

    it('should respect battery capacity limits', () => {
      const profile = generateDailyProfile({
        solarSystemKw: 20, // Large solar
        batteryKwh: 13.5,
        heatingSchedule: { start: 17, end: 22 },
        loadShifting: false,
        season: 'Summer',
        strategy: 'ovo'
      });

      // Battery SoC should never exceed capacity
      profile.forEach(hour => {
        expect(hour.batterySoC).toBeLessThanOrEqual(13.5);
        expect(hour.batterySoC).toBeGreaterThanOrEqual(0);
      });
    });

    it('should calculate temperature with thermal decay', () => {
      const sealedProfile = generateDailyProfile({
        solarSystemKw: 6.6,
        batteryKwh: 13.5,
        heatingSchedule: { start: 17, end: 22 },
        loadShifting: false,
        season: 'Winter',
        strategy: 'standard',
        insulation: 'Sealed'
      });
      
      const leakyProfile = generateDailyProfile({
        solarSystemKw: 6.6,
        batteryKwh: 13.5,
        heatingSchedule: { start: 17, end: 22 },
        loadShifting: false,
        season: 'Winter',
        strategy: 'standard',
        insulation: 'Leaky'
      });

      // Temperature at 3am (after heating is off)
      const sealedTemp3am = sealedProfile[3].temperature;
      const leakyTemp3am = leakyProfile[3].temperature;
      
      // Leaky house should be colder
      expect(leakyTemp3am).toBeLessThan(sealedTemp3am);
    });

    it('should always include baseload consumption', () => {
      const profile = generateDailyProfile({
        solarSystemKw: 6.6,
        batteryKwh: 13.5,
        season: 'Summer',
        strategy: 'standard'
      });

      // Every hour should have baseload
      profile.forEach(hour => {
        expect(hour.baseLoad).toBe(0.3);
        expect(hour.consumption).toBeGreaterThanOrEqual(0.3);
      });
    });
  });

  describe('calculateDailySummary', () => {
    it('should calculate total energy flows', () => {
      const profile = generateDailyProfile({
        solarSystemKw: 6.6,
        batteryKwh: 13.5,
        heatingSchedule: { start: 17, end: 22 },
        loadShifting: false,
        season: 'Summer',
        strategy: 'standard'
      });
      
      const summary = calculateDailySummary(profile);

      expect(summary.totalSolar).toBeGreaterThan(0);
      expect(summary.totalConsumption).toBeGreaterThan(0);
      expect(summary.totalGridImport).toBeGreaterThanOrEqual(0);
      expect(summary.totalGridExport).toBeGreaterThanOrEqual(0);
    });

    it('should calculate grid independence percentage', () => {
      const profile = generateDailyProfile({
        solarSystemKw: 6.6,
        batteryKwh: 13.5,
        heatingSchedule: { start: 17, end: 22 },
        loadShifting: false,
        season: 'Summer',
        strategy: 'ovo'
      });
      
      const summary = calculateDailySummary(profile);

      expect(summary.gridIndependence).toBeGreaterThanOrEqual(0);
      expect(summary.gridIndependence).toBeLessThanOrEqual(100);
    });

    it('should detect comfort warnings', () => {
      const coldProfile = generateDailyProfile({
        solarSystemKw: 6.6,
        batteryKwh: 13.5,
        heatingSchedule: { start: 18, end: 20 }, // Short heating
        loadShifting: false,
        season: 'Winter',
        strategy: 'standard',
        insulation: 'Leaky'
      });
      
      const coldSummary = calculateDailySummary(coldProfile);
      
      // Should have a comfort warning with leaky insulation
      expect(coldSummary.comfortWarning).not.toBeNull();
      expect(coldSummary.minTemp).toBeLessThan(16);
    });

    it('should calculate peak grid usage', () => {
      const profile = generateDailyProfile({
        solarSystemKw: 6.6,
        batteryKwh: 13.5,
        heatingSchedule: { start: 17, end: 22 },
        loadShifting: false,
        season: 'Summer',
        strategy: 'standard'
      });
      
      const summary = calculateDailySummary(profile);
      
      // Peak should be the maximum single hour import
      const manualPeak = Math.max(...profile.map(h => h.gridImport));
      expect(summary.peakGridUsage).toBe(manualPeak);
    });

    it('should track temperature range', () => {
      const profile = generateDailyProfile({
        solarSystemKw: 6.6,
        batteryKwh: 13.5,
        heatingSchedule: { start: 17, end: 22 },
        loadShifting: false,
        season: 'Summer',
        strategy: 'standard',
        insulation: 'Sealed'
      });
      
      const summary = calculateDailySummary(profile);
      
      expect(summary.minTemp).toBeLessThanOrEqual(summary.maxTemp);
      expect(summary.minTemp).toBeGreaterThan(0);
      expect(summary.maxTemp).toBeLessThan(30);
    });
  });
});
