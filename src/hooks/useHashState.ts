import { useState, useEffect, useCallback } from 'react';

interface EnergyState {
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
}

const DEFAULT_STATE: EnergyState = {
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
  hasPool: false,
  hasOldDryer: true,
};

// Parse hash string to state object
const parseHash = (hash: string): EnergyState => {
  const params = new URLSearchParams(hash.replace('#', ''));
  return {
    bill: parseFloat(params.get('bill') || String(DEFAULT_STATE.bill)),
    gasBill: parseFloat(params.get('gas') || String(DEFAULT_STATE.gasBill)),
    petrolBill: parseFloat(params.get('petrol') || String(DEFAULT_STATE.petrolBill)),
    solarSize: parseFloat(params.get('solar') || String(DEFAULT_STATE.solarSize)),
    batterySize: parseFloat(params.get('battery') || String(DEFAULT_STATE.batterySize)),
    isEV: params.get('ev') === 'true',
    isV2H: params.get('v2h') === 'true',
    isHeatPump: params.get('heatpump') === 'true',
    isInduction: params.get('induction') === 'true',
    hasGasHeating: params.get('gasheating') !== 'false',
    hasGasWater: params.get('gaswater') !== 'false',
    hasGasCooking: params.get('gascooking') !== 'false',
    hasPool: params.get('pool') === 'true',
    hasOldDryer: params.get('olddryer') !== 'false',
  };
};

// Serialize state object to hash string
const serializeHash = (state: EnergyState): string => {
  const params = new URLSearchParams();
  params.set('bill', String(state.bill));
  params.set('gas', String(state.gasBill));
  params.set('petrol', String(state.petrolBill));
  params.set('solar', String(state.solarSize));
  params.set('battery', String(state.batterySize));
  params.set('ev', String(state.isEV));
  params.set('v2h', String(state.isV2H));
  params.set('heatpump', String(state.isHeatPump));
  params.set('induction', String(state.isInduction));
  params.set('gasheating', String(state.hasGasHeating));
  params.set('gaswater', String(state.hasGasWater));
  params.set('gascooking', String(state.hasGasCooking));
  params.set('pool', String(state.hasPool));
  params.set('olddryer', String(state.hasOldDryer));
  return `#${params.toString()}`;
};

export const useHashState = (): [EnergyState, (newState: Partial<EnergyState>) => void] => {
  const [state, setState] = useState<EnergyState>(() => {
    if (typeof window !== 'undefined' && window.location.hash) {
      return parseHash(window.location.hash);
    }
    return DEFAULT_STATE;
  });

  // Update URL hash when state changes
  useEffect(() => {
    const hash = serializeHash(state);
    if (window.location.hash !== hash) {
      window.location.hash = hash;
    }
  }, [state]);

  // Listen for hash changes (e.g., browser back/forward)
  useEffect(() => {
    const handleHashChange = () => {
      const newState = parseHash(window.location.hash);
      setState(newState);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const updateState = useCallback((newState: Partial<EnergyState>) => {
    setState((prev) => {
      const updated = { ...prev, ...newState };
      // Disable V2H if EV is disabled
      if ('isEV' in newState && !newState.isEV) {
        updated.isV2H = false;
      }
      return updated;
    });
  }, []);

  return [state, updateState];
};
