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
});
