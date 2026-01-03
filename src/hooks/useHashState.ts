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
  gridExportLimit: number;
  serviceFuse: number;
  hasPool: boolean;
  strategies: {
    chargeEvInWindow: boolean;
    chargeBatInWindow: boolean;
    runPoolInWindow: boolean;
    runHotWaterInWindow: boolean;
  };
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
  gridExportLimit: 5,
  serviceFuse: 63,
  hasPool: false,
  strategies: {
    chargeEvInWindow: false,
    chargeBatInWindow: false,
    runPoolInWindow: false,
    runHotWaterInWindow: false,
  },
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
    gridExportLimit: parseFloat(params.get('exportLimit') || String(DEFAULT_STATE.gridExportLimit)),
    serviceFuse: parseFloat(params.get('fuse') || String(DEFAULT_STATE.serviceFuse)),
    hasPool: params.get('pool') === 'true',
    strategies: {
      chargeEvInWindow: params.get('evWindow') === 'true',
      chargeBatInWindow: params.get('batWindow') === 'true',
      runPoolInWindow: params.get('poolWindow') === 'true',
      runHotWaterInWindow: params.get('hwWindow') === 'true',
    },
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
  params.set('exportLimit', String(state.gridExportLimit));
  params.set('fuse', String(state.serviceFuse));
  params.set('pool', String(state.hasPool));
  params.set('evWindow', String(state.strategies.chargeEvInWindow));
  params.set('batWindow', String(state.strategies.chargeBatInWindow));
  params.set('poolWindow', String(state.strategies.runPoolInWindow));
  params.set('hwWindow', String(state.strategies.runHotWaterInWindow));
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
