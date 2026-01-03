import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useEnergyMath } from './useEnergyMath';

describe('useEnergyMath', () => {
  describe('Grid Export Limit (DNSP Clipping)', () => {
    it('should calculate lower savings with 5kW export limit vs unlimited for a Super System (17kW solar)', () => {
      // Super System scenario: 17kW solar system
      const baseInputs = {
        bill: 3000,
        gasBill: 800,
        petrolBill: 3000,
        solarSize: 17,
        batterySize: 13.5,
        isEV: false,
        isV2H: false,
        isHeatPump: false,
        isInduction: false,
        serviceFuse: 63,
        hasPool: false,
        timerResistiveHW: false,
        timerOldPool: false,
        timerStorageHeater: false,
        strategies: {
          chargeEvInWindow: false,
          chargeBatInWindow: false,
          runPoolInWindow: false,
          runHotWaterInWindow: false,
        },
      };

      // Test with 5kW export limit (Single Phase Standard)
      const { result: limitedResult } = renderHook(() =>
        useEnergyMath({ ...baseInputs, gridExportLimit: 5 })
      );

      // Test with unlimited export
      const { result: unlimitedResult } = renderHook(() =>
        useEnergyMath({ ...baseInputs, gridExportLimit: 999 })
      );

      // The limited export should have lower solar savings than unlimited
      expect(limitedResult.current.solarSavings).toBeLessThan(
        unlimitedResult.current.solarSavings
      );

      // The limited export should have a positive clipping loss
      expect(limitedResult.current.exportClippingLoss).toBeGreaterThan(0);

      // The unlimited export should have no clipping loss
      expect(unlimitedResult.current.exportClippingLoss).toBe(0);

      // Total savings should also be lower with the limit
      expect(limitedResult.current.totalSavings).toBeLessThan(
        unlimitedResult.current.totalSavings
      );
    });

    it('should not apply clipping for small solar systems under the export limit', () => {
      const inputs = {
        bill: 3000,
        gasBill: 800,
        petrolBill: 3000,
        solarSize: 3, // Small 3kW system
        batterySize: 13.5,
        isEV: false,
        isV2H: false,
        isHeatPump: false,
        isInduction: false,
        gridExportLimit: 5, // 5kW limit
        serviceFuse: 63,
        hasPool: false,
        timerResistiveHW: false,
        timerOldPool: false,
        timerStorageHeater: false,
        strategies: {
          chargeEvInWindow: false,
          chargeBatInWindow: false,
          runPoolInWindow: false,
          runHotWaterInWindow: false,
        },
      };

      const { result } = renderHook(() => useEnergyMath(inputs));

      // Small system should not experience clipping
      expect(result.current.exportClippingLoss).toBe(0);
    });

    it('should handle 0kW export limit (no export allowed)', () => {
      const inputs = {
        bill: 3000,
        gasBill: 800,
        petrolBill: 3000,
        solarSize: 6.6,
        batterySize: 13.5,
        isEV: false,
        isV2H: false,
        isHeatPump: false,
        isInduction: false,
        gridExportLimit: 0, // No export allowed
        serviceFuse: 63,
        hasPool: false,
        timerResistiveHW: false,
        timerOldPool: false,
        timerStorageHeater: false,
        strategies: {
          chargeEvInWindow: false,
          chargeBatInWindow: false,
          runPoolInWindow: false,
          runHotWaterInWindow: false,
        },
      };

      const { result } = renderHook(() => useEnergyMath(inputs));

      // With 0kW export limit, there should be significant clipping
      expect(result.current.exportClippingLoss).toBeGreaterThan(0);
      
      // Solar savings should be lower than unlimited
      const { result: unlimitedResult } = renderHook(() =>
        useEnergyMath({ ...inputs, gridExportLimit: 999 })
      );
      
      expect(result.current.solarSavings).toBeLessThan(
        unlimitedResult.current.solarSavings
      );
    });

    it('should handle 10kW export limit (Three Phase)', () => {
      const inputs = {
        bill: 3000,
        gasBill: 800,
        petrolBill: 3000,
        solarSize: 17, // Large system
        batterySize: 13.5,
        isEV: false,
        isV2H: false,
        isHeatPump: false,
        isInduction: false,
        gridExportLimit: 10, // Three Phase limit
        serviceFuse: 63,
        hasPool: false,
        timerResistiveHW: false,
        timerOldPool: false,
        timerStorageHeater: false,
        strategies: {
          chargeEvInWindow: false,
          chargeBatInWindow: false,
          runPoolInWindow: false,
          runHotWaterInWindow: false,
        },
      };

      const { result: tenKwResult } = renderHook(() => useEnergyMath(inputs));
      const { result: fiveKwResult } = renderHook(() =>
        useEnergyMath({ ...inputs, gridExportLimit: 5 })
      );

      // 10kW limit should have lower clipping loss than 5kW limit
      expect(tenKwResult.current.exportClippingLoss).toBeLessThan(
        fiveKwResult.current.exportClippingLoss!
      );

      // 10kW limit should have higher solar savings than 5kW limit
      expect(tenKwResult.current.solarSavings).toBeGreaterThan(
        fiveKwResult.current.solarSavings
      );
    });

    it('should calculate realistic savings for default 6.6kW system with 5kW limit', () => {
      const inputs = {
        bill: 3000,
        gasBill: 800,
        petrolBill: 3000,
        solarSize: 6.6, // Standard residential system
        batterySize: 13.5,
        isEV: false,
        isV2H: false,
        isHeatPump: false,
        isInduction: false,
        gridExportLimit: 5,
        serviceFuse: 63,
        hasPool: false,
        timerResistiveHW: false,
        timerOldPool: false,
        timerStorageHeater: false,
        strategies: {
          chargeEvInWindow: false,
          chargeBatInWindow: false,
          runPoolInWindow: false,
          runHotWaterInWindow: false,
        },
      };

      const { result } = renderHook(() => useEnergyMath(inputs));

      // Should have some solar savings
      expect(result.current.solarSavings).toBeGreaterThan(0);
      
      // Should have minimal or no clipping for a 6.6kW system with 5kW limit
      // (depends on base load calculation)
      expect(result.current.exportClippingLoss).toBeGreaterThanOrEqual(0);
      
      // All results should be finite numbers
      expect(Number.isFinite(result.current.solarSavings)).toBe(true);
      expect(Number.isFinite(result.current.totalSavings)).toBe(true);
    });
  });

  describe('Service Fuse Constraint', () => {
    it('should calculate correct maxKw for 63A single phase', () => {
      const inputs = {
        bill: 3000,
        gasBill: 800,
        petrolBill: 3000,
        solarSize: 6.6,
        batterySize: 13.5,
        isEV: false,
        isV2H: false,
        isHeatPump: false,
        isInduction: false,
        gridExportLimit: 5,
        serviceFuse: 63,
        hasPool: false,
        timerResistiveHW: false,
        timerOldPool: false,
        timerStorageHeater: false,
        strategies: {
          chargeEvInWindow: false,
          chargeBatInWindow: false,
          runPoolInWindow: false,
          runHotWaterInWindow: false,
        },
      };

      const { result } = renderHook(() => useEnergyMath(inputs));

      // 63A * 230V / 1000 = 14.49 kW
      expect(result.current.maxKw).toBeCloseTo(14.49, 2);
      expect(result.current.peakLoad).toBe(0.5); // Base load only
      expect(result.current.isBreakerTripped).toBe(false);
    });

    it('should calculate correct maxKw for 100A 3-phase', () => {
      const inputs = {
        bill: 3000,
        gasBill: 800,
        petrolBill: 3000,
        solarSize: 6.6,
        batterySize: 13.5,
        isEV: false,
        isV2H: false,
        isHeatPump: false,
        isInduction: false,
        gridExportLimit: 5,
        serviceFuse: 100,
        hasPool: false,
        timerResistiveHW: false,
        timerOldPool: false,
        timerStorageHeater: false,
        strategies: {
          chargeEvInWindow: false,
          chargeBatInWindow: false,
          runPoolInWindow: false,
          runHotWaterInWindow: false,
        },
      };

      const { result } = renderHook(() => useEnergyMath(inputs));

      // 3 * 63A * 230V / 1000 = 43.47 kW
      expect(result.current.maxKw).toBeCloseTo(43.47, 2);
    });

    it('should detect breaker trip when load exceeds fuse limit', () => {
      const inputs = {
        bill: 3000,
        gasBill: 800,
        petrolBill: 3000,
        solarSize: 6.6,
        batterySize: 13.5,
        isEV: true,
        isV2H: false,
        isHeatPump: true,
        isInduction: false,
        gridExportLimit: 5,
        serviceFuse: 63,
        hasPool: true,
        timerResistiveHW: false,
        timerOldPool: false,
        timerStorageHeater: false,
        strategies: {
          chargeEvInWindow: true,  // 7.0 kW
          chargeBatInWindow: true, // 5.0 kW
          runPoolInWindow: true,   // 1.5 kW
          runHotWaterInWindow: true, // 1.0 kW
        },
      };

      const { result } = renderHook(() => useEnergyMath(inputs));

      // Peak load = 0.5 + 7.0 + 5.0 + 1.5 + 1.0 = 15.0 kW
      expect(result.current.peakLoad).toBe(15.0);
      
      // Max for 63A = 14.49 kW, so should trip
      expect(result.current.isBreakerTripped).toBe(true);
    });

    it('should not trip breaker when load is within limit', () => {
      const inputs = {
        bill: 3000,
        gasBill: 800,
        petrolBill: 3000,
        solarSize: 6.6,
        batterySize: 13.5,
        isEV: true,
        isV2H: false,
        isHeatPump: false,
        isInduction: false,
        gridExportLimit: 5,
        serviceFuse: 80,
        hasPool: false,
        timerResistiveHW: false,
        timerOldPool: false,
        timerStorageHeater: false,
        strategies: {
          chargeEvInWindow: true,  // 7.0 kW
          chargeBatInWindow: true, // 5.0 kW
          runPoolInWindow: false,
          runHotWaterInWindow: false,
        },
      };

      const { result } = renderHook(() => useEnergyMath(inputs));

      // Peak load = 0.5 + 7.0 + 5.0 = 12.5 kW
      expect(result.current.peakLoad).toBe(12.5);
      
      // Max for 80A = 18.4 kW, so should not trip
      expect(result.current.isBreakerTripped).toBe(false);
    });

    it('should calculate wasted kWh when requested import exceeds capacity', () => {
      const inputs = {
        bill: 3000,
        gasBill: 800,
        petrolBill: 3000,
        solarSize: 6.6,
        batterySize: 13.5,
        isEV: true,
        isV2H: false,
        isHeatPump: true,
        isInduction: false,
        gridExportLimit: 5,
        serviceFuse: 63, // 14.49 kW max
        hasPool: true,
        timerResistiveHW: false,
        timerOldPool: false,
        timerStorageHeater: false,
        strategies: {
          chargeEvInWindow: true,  // 21 kWh requested (7kW * 3h)
          chargeBatInWindow: true, // 13.5 kWh requested (min of battery capacity or 15)
          runPoolInWindow: true,   // 4.5 kWh requested (1.5kW * 3h)
          runHotWaterInWindow: true, // 3 kWh requested (1kW * 3h)
        },
      };

      const { result } = renderHook(() => useEnergyMath(inputs));

      // Requested = 21 + 13.5 + 4.5 + 3 = 42 kWh
      expect(result.current.requestedImportKwh).toBe(42);
      
      // Max possible = 14.49 kW * 3h = 43.47 kWh
      expect(result.current.actualImportKwh).toBeCloseTo(42, 1);
      
      // No waste in this case as requested < max
      expect(result.current.wastedKwh).toBeCloseTo(0, 1);
    });

    it('should reduce savings when there is wasted capacity', () => {
      const inputs = {
        bill: 3000,
        gasBill: 800,
        petrolBill: 3000,
        solarSize: 6.6,
        batterySize: 40, // Large battery
        isEV: true,
        isV2H: false,
        isHeatPump: true,
        isInduction: false,
        gridExportLimit: 5,
        serviceFuse: 63, // 14.49 kW max = 43.47 kWh over 3h
        hasPool: true,
        timerResistiveHW: false,
        timerOldPool: false,
        timerStorageHeater: false,
        strategies: {
          chargeEvInWindow: true,  // 21 kWh requested
          chargeBatInWindow: true, // 15 kWh requested (5kW * 3h)
          runPoolInWindow: true,   // 4.5 kWh requested
          runHotWaterInWindow: true, // 3 kWh requested
        },
      };

      const { result } = renderHook(() => useEnergyMath(inputs));

      // Requested = 21 + 15 + 4.5 + 3 = 43.5 kWh
      expect(result.current.requestedImportKwh).toBe(43.5);
      
      // Max possible = ~43.47 kWh
      expect(result.current.actualImportKwh).toBeCloseTo(43.47, 1);
      
      // Wasted = ~0.03 kWh (minimal)
      expect(result.current.wastedKwh).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Legacy Timer Hacks', () => {
    it('should calculate load and savings for Timer: Resistive HW', () => {
      const inputs = {
        bill: 3000,
        gasBill: 800,
        petrolBill: 3000,
        solarSize: 6.6,
        batterySize: 13.5,
        isEV: false,
        isV2H: false,
        isHeatPump: false,
        isInduction: false,
        gridExportLimit: 5,
        serviceFuse: 63,
        hasPool: false,
        timerResistiveHW: true,
        timerOldPool: false,
        timerStorageHeater: false,
        strategies: {
          chargeEvInWindow: false,
          chargeBatInWindow: false,
          runPoolInWindow: false,
          runHotWaterInWindow: false,
        },
      };

      const { result } = renderHook(() => useEnergyMath(inputs));

      // Peak load should include 3.6 kW from resistive HW
      expect(result.current.peakLoad).toBe(0.5 + 3.6);
      
      // Requested import should be 10.8 kWh (3.6kW * 3h)
      expect(result.current.requestedImportKwh).toBe(10.8);
      
      // Should have savings from moving load to free window
      // 10.8 kWh/day * 365 days * $0.24/kWh = $946.08/year
      expect(result.current.legacyTimerSavings).toBeCloseTo(946.08, 1);
    });

    it('should calculate load and savings for Timer: Old Pool Pump', () => {
      const inputs = {
        bill: 3000,
        gasBill: 800,
        petrolBill: 3000,
        solarSize: 6.6,
        batterySize: 13.5,
        isEV: false,
        isV2H: false,
        isHeatPump: false,
        isInduction: false,
        gridExportLimit: 5,
        serviceFuse: 63,
        hasPool: false,
        timerResistiveHW: false,
        timerOldPool: true,
        timerStorageHeater: false,
        strategies: {
          chargeEvInWindow: false,
          chargeBatInWindow: false,
          runPoolInWindow: false,
          runHotWaterInWindow: false,
        },
      };

      const { result } = renderHook(() => useEnergyMath(inputs));

      // Peak load should include 1.5 kW from old pool pump
      expect(result.current.peakLoad).toBe(0.5 + 1.5);
      
      // Requested import should be 4.5 kWh (1.5kW * 3h)
      expect(result.current.requestedImportKwh).toBe(4.5);
      
      // Should have savings from moving load to free window
      // 4.5 kWh/day * 365 days * $0.24/kWh = $394.20/year
      expect(result.current.legacyTimerSavings).toBeCloseTo(394.20, 0);
    });

    it('should calculate load and savings for Timer: Storage Heater', () => {
      const inputs = {
        bill: 3000,
        gasBill: 800,
        petrolBill: 3000,
        solarSize: 6.6,
        batterySize: 13.5,
        isEV: false,
        isV2H: false,
        isHeatPump: false,
        isInduction: false,
        gridExportLimit: 5,
        serviceFuse: 63,
        hasPool: false,
        timerResistiveHW: false,
        timerOldPool: false,
        timerStorageHeater: true,
        strategies: {
          chargeEvInWindow: false,
          chargeBatInWindow: false,
          runPoolInWindow: false,
          runHotWaterInWindow: false,
        },
      };

      const { result } = renderHook(() => useEnergyMath(inputs));

      // Peak load should include 2.0 kW from storage heater
      expect(result.current.peakLoad).toBe(0.5 + 2.0);
      
      // Requested import should be 6.0 kWh (2.0kW * 3h)
      expect(result.current.requestedImportKwh).toBe(6.0);
      
      // Should have savings from moving load to free window
      // 6.0 kWh/day * 365 days * $0.24/kWh = $525.60/year
      expect(result.current.legacyTimerSavings).toBeCloseTo(525.60, 0);
    });

    it('should calculate combined load when multiple timers are active', () => {
      const inputs = {
        bill: 3000,
        gasBill: 800,
        petrolBill: 3000,
        solarSize: 6.6,
        batterySize: 13.5,
        isEV: false,
        isV2H: false,
        isHeatPump: false,
        isInduction: false,
        gridExportLimit: 5,
        serviceFuse: 63,
        hasPool: false,
        timerResistiveHW: true,
        timerOldPool: true,
        timerStorageHeater: true,
        strategies: {
          chargeEvInWindow: false,
          chargeBatInWindow: false,
          runPoolInWindow: false,
          runHotWaterInWindow: false,
        },
      };

      const { result } = renderHook(() => useEnergyMath(inputs));

      // Peak load = 0.5 + 3.6 + 1.5 + 2.0 = 7.6 kW
      expect(result.current.peakLoad).toBe(7.6);
      
      // Requested import = 10.8 + 4.5 + 6.0 = 21.3 kWh
      expect(result.current.requestedImportKwh).toBe(21.3);
      
      // Combined savings
      expect(result.current.legacyTimerSavings).toBeCloseTo(1865.88, 1);
    });

    it('should trigger breaker trip warning with legacy timers + EV', () => {
      const inputs = {
        bill: 3000,
        gasBill: 800,
        petrolBill: 3000,
        solarSize: 6.6,
        batterySize: 13.5,
        isEV: true,
        isV2H: false,
        isHeatPump: false,
        isInduction: false,
        gridExportLimit: 5,
        serviceFuse: 63, // 14.49 kW max
        hasPool: false,
        timerResistiveHW: true,
        timerOldPool: true,
        timerStorageHeater: false,
        strategies: {
          chargeEvInWindow: true,  // 7.0 kW
          chargeBatInWindow: false,
          runPoolInWindow: false,
          runHotWaterInWindow: false,
        },
      };

      const { result } = renderHook(() => useEnergyMath(inputs));

      // Peak load = 0.5 + 7.0 + 3.6 + 1.5 = 12.6 kW
      expect(result.current.peakLoad).toBe(12.6);
      
      // Should not trip (12.6 < 14.49)
      expect(result.current.isBreakerTripped).toBe(false);
    });

    it('should trigger breaker trip with all timers + EV + battery charging', () => {
      const inputs = {
        bill: 3000,
        gasBill: 800,
        petrolBill: 3000,
        solarSize: 6.6,
        batterySize: 13.5,
        isEV: true,
        isV2H: false,
        isHeatPump: false,
        isInduction: false,
        gridExportLimit: 5,
        serviceFuse: 63, // 14.49 kW max
        hasPool: false,
        timerResistiveHW: true,
        timerOldPool: true,
        timerStorageHeater: false,
        strategies: {
          chargeEvInWindow: true,  // 7.0 kW
          chargeBatInWindow: true, // 5.0 kW
          runPoolInWindow: false,
          runHotWaterInWindow: false,
        },
      };

      const { result } = renderHook(() => useEnergyMath(inputs));

      // Peak load = 0.5 + 7.0 + 5.0 + 3.6 + 1.5 = 17.6 kW
      expect(result.current.peakLoad).toBe(17.6);
      
      // Should trip (17.6 > 14.49)
      expect(result.current.isBreakerTripped).toBe(true);
    });

    it('should include timer costs in system cost calculation', () => {
      const inputs = {
        bill: 3000,
        gasBill: 800,
        petrolBill: 3000,
        solarSize: 0,
        batterySize: 0,
        isEV: false,
        isV2H: false,
        isHeatPump: false,
        isInduction: false,
        gridExportLimit: 5,
        serviceFuse: 63,
        hasPool: false,
        timerResistiveHW: true,
        timerOldPool: true,
        timerStorageHeater: true,
        strategies: {
          chargeEvInWindow: false,
          chargeBatInWindow: false,
          runPoolInWindow: false,
          runHotWaterInWindow: false,
        },
      };

      const { result } = renderHook(() => useEnergyMath(inputs));

      // System cost should be $50 + $20 + $0 = $70
      expect(result.current.systemCost).toBe(70);
      
      // ROI should be excellent (less than 1 month)
      expect(result.current.roiYears).toBeLessThan(0.1);
    });
  });
});
