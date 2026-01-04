// (No imports needed - removed unused Car, Battery, Flame, Waves icons)

interface InputSlidersProps {
  state: {
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
    currentSetup: {
      hotWater: 'gas' | 'resistive' | 'heatpump';
      heating: 'gas' | 'resistive' | 'rc' | 'none';
      cooking: 'gas' | 'induction';
      pool: 'none' | 'single_speed' | 'variable_speed';
      dryer: 'vented' | 'heatpump';
    };
  };
  updateState: (newState: Partial<InputSlidersProps['state']>) => void;
}

export const InputSliders = ({ state, updateState }: InputSlidersProps) => {
  return (
    <div className="space-y-6">
      {/* Annual Bills Section */}
      <div className="grid md:grid-cols-3 gap-4">
        {/* Electricity Bill */}
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2 uppercase tracking-widest">
            Annual Electricity Bill
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              min="500"
              max="15000"
              step="100"
              value={state.bill}
              onChange={(e) => updateState({ bill: parseFloat(e.target.value) || 0 })}
              className="w-24 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <span className="text-sm text-gray-600">$</span>
          </div>
          <input
            type="range"
            min="500"
            max="15000"
            step="100"
            value={state.bill}
            onChange={(e) => updateState({ bill: parseFloat(e.target.value) })}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600 mt-2"
          />
        </div>

        {/* Service Fuse */}
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2 uppercase tracking-widest">
            Grid Connection (Amps)
          </label>
          <select
            value={state.serviceFuse}
            onChange={(e) => updateState({ serviceFuse: parseFloat(e.target.value) })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="63">63A (Single Phase)</option>
            <option value="80">80A (Single XL)</option>
            <option value="100">100A (3-Phase / 3x63A)</option>
          </select>
        </div>

        {/* Gas Bill */}
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2 uppercase tracking-widest">
            Annual Gas Bill
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              min="0"
              max="5000"
              step="50"
              value={state.gasBill}
              onChange={(e) => updateState({ gasBill: parseFloat(e.target.value) || 0 })}
              className="w-24 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
            <span className="text-sm text-gray-600">$</span>
          </div>
          <input
            type="range"
            min="0"
            max="5000"
            step="50"
            value={state.gasBill}
            onChange={(e) => updateState({ gasBill: parseFloat(e.target.value) })}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-600 mt-2"
          />
        </div>
      </div>

      {/* Petrol Bill Row */}
      <div className="grid md:grid-cols-3 gap-4">
        {/* Petrol Bill */}
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2 uppercase tracking-widest">
            Annual Petrol Bill
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              min="0"
              max="10000"
              step="100"
              value={state.petrolBill}
              onChange={(e) => updateState({ petrolBill: parseFloat(e.target.value) || 0 })}
              className="w-24 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <span className="text-sm text-gray-600">$</span>
          </div>
          <input
            type="range"
            min="0"
            max="10000"
            step="100"
            value={state.petrolBill}
            onChange={(e) => updateState({ petrolBill: parseFloat(e.target.value) })}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600 mt-2"
          />
        </div>
      </div>

      {/* System Size Section */}
      <div className="grid md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
        {/* Solar Size */}
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2 uppercase tracking-widest">
            Solar System Size
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              min="0"
              max="20"
              step="0.5"
              value={state.solarSize}
              onChange={(e) => updateState({ solarSize: parseFloat(e.target.value) || 0 })}
              className="w-24 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            />
            <span className="text-sm text-gray-600">kW</span>
          </div>
          <input
            type="range"
            min="0"
            max="20"
            step="0.5"
            value={state.solarSize}
            onChange={(e) => updateState({ solarSize: parseFloat(e.target.value) })}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-yellow-500 mt-2"
          />
        </div>

        {/* Battery Size */}
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2 uppercase tracking-widest">
            Battery Capacity
            {state.isV2H && <span className="ml-2 text-xs text-amber-500">(V2H: 60 kWh)</span>}
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              min="0"
              max="40"
              step="0.5"
              value={state.batterySize}
              onChange={(e) => updateState({ batterySize: parseFloat(e.target.value) || 0 })}
              className="w-24 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
              disabled={state.isV2H}
            />
            <span className="text-sm text-gray-600">kWh</span>
          </div>
          <input
            type="range"
            min="0"
            max="40"
            step="0.5"
            value={state.batterySize}
            onChange={(e) => updateState({ batterySize: parseFloat(e.target.value) })}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600 mt-2"
            disabled={state.isV2H}
          />
        </div>
      </div>

      {/* Grid Export Limit Section */}
      <div className="pt-4 border-t border-gray-200">
        <label className="block text-sm font-medium text-slate-400 mb-2 uppercase tracking-widest">
          Grid Export Limit (DNSP)
        </label>
        <select
          value={state.gridExportLimit}
          onChange={(e) => updateState({ gridExportLimit: parseFloat(e.target.value) })}
          className="w-full md:w-80 px-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
        >
          <option value="0">0 kW (Strict Limit / No Export)</option>
          <option value="5">5 kW (Single Phase Standard)</option>
          <option value="10">10 kW (Three Phase)</option>
          <option value="999">Unlimited</option>
        </select>
        
        {/* Export Clipping Warning */}
        {state.solarSize > 0 && state.gridExportLimit < 999 && (() => {
          // Calculate estimated base load in kW (average power during daytime)
          const dailyKwh = state.bill / 365 / 0.41; // Using average rate
          const estimatedBaseLoadKw = dailyKwh / 24 * 0.4; // ~40% of daily usage during sun hours
          const peakSolarKw = state.solarSize; // Peak solar generation
          const potentialExportKw = peakSolarKw - estimatedBaseLoadKw;
          
          // Show warning if potential export exceeds limit
          if (potentialExportKw > state.gridExportLimit) {
            return (
              <div className="mt-3 bg-amber-50 border-l-4 border-amber-500 p-3 rounded">
                <p className="text-sm text-amber-800">
                  ⚠️ <strong>Export Clipping Active:</strong> Your {state.solarSize}kW system may exceed the {state.gridExportLimit}kW export limit during peak sun hours. You are losing potential income.
                </p>
              </div>
            );
          }
          return null;
        })()}
      </div>
    </div>
  );
};
