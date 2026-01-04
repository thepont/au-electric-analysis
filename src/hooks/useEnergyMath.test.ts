import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useEnergyMath } from './useEnergyMath';

const DEFAULT_CURRENT_SETUP = {
  hotWater: 'gas' as const,
  heating: 'gas' as const,
  cooking: 'gas' as const,
  pool: 'none' as const,
};

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
        hasGasHeating: true,
        hasGasWater: true,
        hasGasCooking: true,
        hasOldDryer: false,
        serviceFuse: 63,
        hasPool: false,
        strategies: {
          chargeEvInWindow: false,
          chargeBatInWindow: false,
          runPoolInWindow: false,
          runHotWaterInWindow: false,
        },
        currentSetup: DEFAULT_CURRENT_SETUP,
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
        hasGasHeating: true,
        hasGasWater: true,
        hasGasCooking: true,
        hasOldDryer: false,
        gridExportLimit: 5, // 5kW limit
        serviceFuse: 63,
        hasPool: false,
        strategies: {
          chargeEvInWindow: false,
          chargeBatInWindow: false,
          runPoolInWindow: false,
          runHotWaterInWindow: false,
        },
        currentSetup: DEFAULT_CURRENT_SETUP,
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
        hasGasHeating: true,
        hasGasWater: true,
        hasGasCooking: true,
        hasOldDryer: false,
        gridExportLimit: 0, // No export allowed
        serviceFuse: 63,
        hasPool: false,
        strategies: {
          chargeEvInWindow: false,
          chargeBatInWindow: false,
          runPoolInWindow: false,
          runHotWaterInWindow: false,
        },
        currentSetup: DEFAULT_CURRENT_SETUP,
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
        hasGasHeating: true,
        hasGasWater: true,
        hasGasCooking: true,
        hasOldDryer: false,
        gridExportLimit: 10, // Three Phase limit
        serviceFuse: 63,
        hasPool: false,
        strategies: {
          chargeEvInWindow: false,
          chargeBatInWindow: false,
          runPoolInWindow: false,
          runHotWaterInWindow: false,
        },
        currentSetup: DEFAULT_CURRENT_SETUP,
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
        hasGasHeating: true,
        hasGasWater: true,
        hasGasCooking: true,
        hasOldDryer: false,
        gridExportLimit: 5,
        serviceFuse: 63,
        hasPool: false,
        strategies: {
          chargeEvInWindow: false,
          chargeBatInWindow: false,
          runPoolInWindow: false,
          runHotWaterInWindow: false,
        },
        currentSetup: DEFAULT_CURRENT_SETUP,
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
        hasGasHeating: true,
        hasGasWater: true,
        hasGasCooking: true,
        hasOldDryer: false,
        gridExportLimit: 5,
        serviceFuse: 63,
        hasPool: false,
        strategies: {
          chargeEvInWindow: false,
          chargeBatInWindow: false,
          runPoolInWindow: false,
          runHotWaterInWindow: false,
        },
        currentSetup: DEFAULT_CURRENT_SETUP,
      };

      const { result } = renderHook(() => useEnergyMath(inputs));

      // 63A * 230V / 1000 = 14.49 kW
      expect(result.current.maxKw).toBeCloseTo(14.49, 2);
      // Base load is now calculated dynamically: min(0.8, dailyKwh/24)
      // With bill=$3000, average rate ~$0.41/kWh: dailyKwh ≈ 20kWh, base ≈ 0.8kW
      expect(result.current.peakLoad).toBeCloseTo(0.8, 1); // Dynamic base load
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
        hasGasHeating: true,
        hasGasWater: true,
        hasGasCooking: true,
        hasOldDryer: false,
        gridExportLimit: 5,
        serviceFuse: 100,
        hasPool: false,
        strategies: {
          chargeEvInWindow: false,
          chargeBatInWindow: false,
          runPoolInWindow: false,
          runHotWaterInWindow: false,
        },
        currentSetup: DEFAULT_CURRENT_SETUP,
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
        hasGasHeating: true,
        hasGasWater: true,
        hasGasCooking: true,
        hasOldDryer: false,
        gridExportLimit: 5,
        serviceFuse: 63,
        hasPool: true,
        strategies: {
          chargeEvInWindow: true,  // 7.0 kW
          chargeBatInWindow: true, // 5.0 kW
          runPoolInWindow: true,   // 1.5 kW
          runHotWaterInWindow: true, // 1.0 kW
        },
        currentSetup: DEFAULT_CURRENT_SETUP,
      };

      const { result } = renderHook(() => useEnergyMath(inputs));

      // Peak load = base(~0.8) + 7.0 + 5.0 + 1.5 + 1.0 ≈ 15.3 kW
      expect(result.current.peakLoad).toBeCloseTo(15.3, 1);
      
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
        hasGasHeating: true,
        hasGasWater: true,
        hasGasCooking: true,
        hasOldDryer: false,
        gridExportLimit: 5,
        serviceFuse: 80,
        hasPool: false,
        strategies: {
          chargeEvInWindow: true,  // 7.0 kW
          chargeBatInWindow: true, // 5.0 kW
          runPoolInWindow: false,
          runHotWaterInWindow: false,
        },
        currentSetup: DEFAULT_CURRENT_SETUP,
      };

      const { result } = renderHook(() => useEnergyMath(inputs));

      // Peak load = base(~0.8) + 7.0 + 5.0 = 12.8 kW
      expect(result.current.peakLoad).toBeCloseTo(12.8, 1);
      
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
        hasGasHeating: true,
        hasGasWater: true,
        hasGasCooking: true,
        hasOldDryer: false,
        gridExportLimit: 5,
        serviceFuse: 63, // 14.49 kW max
        hasPool: true,
        strategies: {
          chargeEvInWindow: true,  // 21 kWh requested (7kW * 3h)
          chargeBatInWindow: true, // 13.5 kWh requested (min of battery capacity or 15)
          runPoolInWindow: true,   // 4.5 kWh requested (1.5kW * 3h)
          runHotWaterInWindow: true, // 3 kWh requested (1kW * 3h)
        },
        currentSetup: DEFAULT_CURRENT_SETUP,
      };

      const { result } = renderHook(() => useEnergyMath(inputs));

      // Requested = base(~0.8*3=2.4) + 21 + 13.5 + 4.5 + 3 ≈ 44.4 kWh
      expect(result.current.requestedImportKwh).toBeCloseTo(44.4, 1);
      
      // Max possible = 14.49 kW * 3h = 43.47 kWh
      expect(result.current.actualImportKwh).toBeCloseTo(43.47, 1);
      
      // Waste ≈ 44.4 - 43.47 ≈ 0.9 kWh
      expect(result.current.wastedKwh).toBeCloseTo(0.9, 1);
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
        hasGasHeating: true,
        hasGasWater: true,
        hasGasCooking: true,
        hasOldDryer: false,
        gridExportLimit: 5,
        serviceFuse: 63, // 14.49 kW max = 43.47 kWh over 3h
        hasPool: true,
        strategies: {
          chargeEvInWindow: true,  // 21 kWh requested
          chargeBatInWindow: true, // 15 kWh requested (5kW * 3h)
          runPoolInWindow: true,   // 4.5 kWh requested
          runHotWaterInWindow: true, // 3 kWh requested
        },
        currentSetup: DEFAULT_CURRENT_SETUP,
      };

      const { result } = renderHook(() => useEnergyMath(inputs));

      // Requested = base(~0.8*3=2.4) + 21 + 15 + 4.5 + 3 ≈ 45.9 kWh
      expect(result.current.requestedImportKwh).toBeCloseTo(45.9, 1);
      
      // Max possible = ~43.47 kWh
      expect(result.current.actualImportKwh).toBeCloseTo(43.47, 1);
      
      // Wasted ≈ 45.9 - 43.47 ≈ 2.4 kWh
      expect(result.current.wastedKwh).toBeCloseTo(2.4, 1);
    });
  });
});
