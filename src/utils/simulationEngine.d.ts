/**
 * EnergyHome.OS - 24-Hour Simulation Engine
 * TypeScript definitions
 */

export interface SimulationConfig {
  solarSystemKw?: number;
  batteryKwh?: number;
  heatingSchedule?: {
    start: number;
    end: number;
  };
  loadShifting?: boolean;
  season?: 'Summer' | 'Winter';
  strategy?: 'standard' | 'ovo';
  insulation?: 'Sealed' | 'Leaky';
}

export interface HourlyData {
  hour: number;
  hourLabel: string;
  solar: number;
  consumption: number;
  baseLoad: number;
  heatingLoad: number;
  shiftableLoad: number;
  batterySoC: number;
  batterySoCPercent: number;
  batteryActivity: number;
  gridImport: number;
  gridExport: number;
  temperature: number;
  isFreeWindow: boolean;
  isHeatingHour: boolean;
}

export interface DailySummary {
  totalSolar: number;
  totalConsumption: number;
  totalGridImport: number;
  totalGridExport: number;
  gridIndependence: number;
  wastedSolar: number;
  peakGridUsage: number;
  minTemp: number;
  maxTemp: number;
  comfortWarning: string | null;
}

export function generateDailyProfile(config: SimulationConfig): HourlyData[];
export function calculateDailySummary(hourlyData: HourlyData[]): DailySummary;
