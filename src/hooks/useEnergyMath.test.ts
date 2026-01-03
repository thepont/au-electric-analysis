import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useEnergyMath } from './useEnergyMath';

describe('useEnergyMath with new appliance profiles', () => {
  const baseInputs = {
    bill: 3000,
    gasBill: 1200,
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
    hasPool: false,
    hasOldDryer: true,
  };

  it('should calculate assumptions based on gas bill', () => {
    const { result } = renderHook(() => useEnergyMath(baseInputs));

    expect(result.current.assumptions).toBeDefined();
    expect(result.current.assumptions.length).toBeGreaterThan(0);
    
    // Should have gas heating assumption
    const gasHeating = result.current.assumptions.find(a => a.name === 'Gas Ducted Heating');
    expect(gasHeating).toBeDefined();
    expect(gasHeating?.cost).toBe(600); // 50% of 1200
  });

  it('should calculate pool pump savings when hasPool is true', () => {
    const { result } = renderHook(() => useEnergyMath({ ...baseInputs, hasPool: true }));

    expect(result.current.poolPumpSavings).toBe(900);
    
    // Should have pool pump in assumptions
    const poolPump = result.current.assumptions.find(a => a.name === 'Single Speed Pool Pump');
    expect(poolPump).toBeDefined();
    expect(poolPump?.cost).toBe(1300);
  });

  it('should not calculate pool pump savings when hasPool is false', () => {
    const { result } = renderHook(() => useEnergyMath({ ...baseInputs, hasPool: false }));

    expect(result.current.poolPumpSavings).toBe(0);
  });

  it('should calculate heat pump dryer savings when hasOldDryer is true', () => {
    const { result } = renderHook(() => useEnergyMath({ ...baseInputs, hasOldDryer: true }));

    expect(result.current.hpDryerSavings).toBe(200);
  });

  it('should calculate gap sealing savings based on gas heating', () => {
    const { result } = renderHook(() => useEnergyMath(baseInputs));

    // Gap sealing saves 15% of 50% of gas bill (heating portion)
    expect(result.current.gapSealingSavings).toBe(1200 * 0.5 * 0.15);
  });

  it('should not calculate gap sealing savings when hasGasHeating is false', () => {
    const { result } = renderHook(() => useEnergyMath({ ...baseInputs, hasGasHeating: false }));

    expect(result.current.gapSealingSavings).toBe(0);
  });

  it('should only include gas appliances in assumptions if they are enabled', () => {
    const inputs = {
      ...baseInputs,
      hasGasHeating: false,
      hasGasWater: true,
      hasGasCooking: false,
    };
    
    const { result } = renderHook(() => useEnergyMath(inputs));

    const gasHeating = result.current.assumptions.find(a => a.name === 'Gas Ducted Heating');
    const gasWater = result.current.assumptions.find(a => a.name === 'Gas Hot Water');
    const gasCooking = result.current.assumptions.find(a => a.name === 'Gas Cooktop');

    expect(gasHeating).toBeUndefined();
    expect(gasWater).toBeDefined();
    expect(gasCooking).toBeUndefined();
  });

  it('should include new savings in total savings calculation', () => {
    const { result } = renderHook(() => useEnergyMath({ ...baseInputs, hasPool: true }));

    const { batSavings, solarSavings, transportSavings, gasSavings, poolPumpSavings, hpDryerSavings, gapSealingSavings, totalSavings } = result.current;

    expect(totalSavings).toBe(batSavings + solarSavings + transportSavings + gasSavings + poolPumpSavings + hpDryerSavings + gapSealingSavings);
  });

  it('should respect hasGasWater when calculating heat pump savings', () => {
    const withGasWater = renderHook(() => 
      useEnergyMath({ ...baseInputs, isHeatPump: true, hasGasWater: true })
    );
    const withoutGasWater = renderHook(() => 
      useEnergyMath({ ...baseInputs, isHeatPump: true, hasGasWater: false })
    );

    expect(withGasWater.result.current.gasSavings).toBeGreaterThan(0);
    expect(withoutGasWater.result.current.gasSavings).toBe(0);
  });

  it('should respect hasGasCooking when calculating induction savings', () => {
    const withGasCooking = renderHook(() => 
      useEnergyMath({ ...baseInputs, isInduction: true, hasGasCooking: true })
    );
    const withoutGasCooking = renderHook(() => 
      useEnergyMath({ ...baseInputs, isInduction: true, hasGasCooking: false })
    );

    expect(withGasCooking.result.current.gasSavings).toBeGreaterThan(0);
    expect(withoutGasCooking.result.current.gasSavings).toBe(0);
  });
});
