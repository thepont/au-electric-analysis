import { Zap, Battery, Car, Flame, Waves, Clock } from 'lucide-react';

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
    timerResistiveHW: boolean;
    timerOldPool: boolean;
    timerStorageHeater: boolean;
    strategies: {
      chargeEvInWindow: boolean;
      chargeBatInWindow: boolean;
      runPoolInWindow: boolean;
      runHotWaterInWindow: boolean;
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

      {/* Strategy Toggles */}
      <div className="pt-4 border-t border-gray-200">
        <h3 className="text-lg font-semibold text-slate-900 tracking-tighter mb-3">Energy Strategy</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* EV Toggle */}
          <button
            onClick={() => updateState({ isEV: !state.isEV })}
            className={`p-4 rounded-lg border-2 transition-all ${
              state.isEV
                ? 'border-emerald-500 bg-emerald-50'
                : 'border-gray-300 bg-white hover:border-gray-400'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Car className={`w-5 h-5 ${state.isEV ? 'text-emerald-600' : 'text-gray-400'}`} />
              <span className={`font-medium ${state.isEV ? 'text-emerald-700' : 'text-gray-600'}`}>
                Electric Vehicle
              </span>
            </div>
          </button>

          {/* V2H Toggle */}
          <button
            onClick={() => updateState({ isV2H: !state.isV2H })}
            disabled={!state.isEV}
            className={`p-4 rounded-lg border-2 transition-all ${
              state.isV2H
                ? 'border-blue-500 bg-blue-50'
                : state.isEV
                ? 'border-gray-300 bg-white hover:border-gray-400'
                : 'border-gray-200 bg-gray-100 cursor-not-allowed opacity-50'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Battery className={`w-5 h-5 ${state.isV2H ? 'text-blue-600' : 'text-gray-400'}`} />
              <span className={`font-medium ${state.isV2H ? 'text-blue-700' : 'text-gray-600'}`}>
                V2H (60 kWh)
              </span>
            </div>
          </button>

          {/* Heat Pump Toggle */}
          <button
            onClick={() => updateState({ isHeatPump: !state.isHeatPump })}
            className={`p-4 rounded-lg border-2 transition-all ${
              state.isHeatPump
                ? 'border-amber-500 bg-amber-50'
                : 'border-gray-300 bg-white hover:border-gray-400'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Flame className={`w-5 h-5 ${state.isHeatPump ? 'text-amber-600' : 'text-gray-400'}`} />
              <span className={`font-medium ${state.isHeatPump ? 'text-amber-700' : 'text-gray-600'}`}>
                Heat Pump
              </span>
            </div>
          </button>

          {/* Induction Toggle */}
          <button
            onClick={() => updateState({ isInduction: !state.isInduction })}
            className={`p-4 rounded-lg border-2 transition-all ${
              state.isInduction
                ? 'border-purple-500 bg-purple-50'
                : 'border-gray-300 bg-white hover:border-gray-400'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Zap className={`w-5 h-5 ${state.isInduction ? 'text-purple-600' : 'text-gray-400'}`} />
              <span className={`font-medium ${state.isInduction ? 'text-purple-700' : 'text-gray-600'}`}>
                Induction Cooking
              </span>
            </div>
          </button>

          {/* Pool Toggle */}
          <button
            onClick={() => updateState({ hasPool: !state.hasPool })}
            className={`p-4 rounded-lg border-2 transition-all ${
              state.hasPool
                ? 'border-cyan-500 bg-cyan-50'
                : 'border-gray-300 bg-white hover:border-gray-400'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Waves className={`w-5 h-5 ${state.hasPool ? 'text-cyan-600' : 'text-gray-400'}`} />
              <span className={`font-medium ${state.hasPool ? 'text-cyan-700' : 'text-gray-600'}`}>
                Pool Pump
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* 11:00 AM Stack Section */}
      <div className="pt-4 border-t border-gray-200">
        <h3 className="text-lg font-semibold text-slate-900 tracking-tighter mb-1">11:00 AM Stack</h3>
        <p className="text-sm text-slate-400 mb-3 uppercase tracking-widest">
          Which devices run during the Free 3 window (11am-2pm)?
        </p>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* EV Charging Window */}
          <button
            onClick={() => updateState({ strategies: { ...state.strategies, chargeEvInWindow: !state.strategies.chargeEvInWindow } })}
            disabled={!state.isEV}
            className={`p-4 rounded-lg border-2 transition-all ${
              state.strategies.chargeEvInWindow
                ? 'border-emerald-500 bg-emerald-50'
                : state.isEV
                ? 'border-gray-300 bg-white hover:border-gray-400'
                : 'border-gray-200 bg-gray-100 cursor-not-allowed opacity-50'
            }`}
          >
            <div className="flex flex-col space-y-1">
              <div className="flex items-center space-x-2">
                <Car className={`w-5 h-5 ${state.strategies.chargeEvInWindow ? 'text-emerald-600' : 'text-gray-400'}`} />
                <span className={`font-medium ${state.strategies.chargeEvInWindow ? 'text-emerald-700' : 'text-gray-600'}`}>
                  Charge EV
                </span>
              </div>
              <span className="text-xs text-gray-500">7.0 kW</span>
            </div>
          </button>

          {/* Battery Charging Window */}
          <button
            onClick={() => updateState({ strategies: { ...state.strategies, chargeBatInWindow: !state.strategies.chargeBatInWindow } })}
            disabled={state.batterySize === 0 && !state.isV2H}
            className={`p-4 rounded-lg border-2 transition-all ${
              state.strategies.chargeBatInWindow
                ? 'border-blue-500 bg-blue-50'
                : (state.batterySize > 0 || state.isV2H)
                ? 'border-gray-300 bg-white hover:border-gray-400'
                : 'border-gray-200 bg-gray-100 cursor-not-allowed opacity-50'
            }`}
          >
            <div className="flex flex-col space-y-1">
              <div className="flex items-center space-x-2">
                <Battery className={`w-5 h-5 ${state.strategies.chargeBatInWindow ? 'text-blue-600' : 'text-gray-400'}`} />
                <span className={`font-medium ${state.strategies.chargeBatInWindow ? 'text-blue-700' : 'text-gray-600'}`}>
                  Charge Battery
                </span>
              </div>
              <span className="text-xs text-gray-500">5.0 kW</span>
            </div>
          </button>

          {/* Pool Pump Window */}
          <button
            onClick={() => updateState({ strategies: { ...state.strategies, runPoolInWindow: !state.strategies.runPoolInWindow } })}
            disabled={!state.hasPool}
            className={`p-4 rounded-lg border-2 transition-all ${
              state.strategies.runPoolInWindow
                ? 'border-cyan-500 bg-cyan-50'
                : state.hasPool
                ? 'border-gray-300 bg-white hover:border-gray-400'
                : 'border-gray-200 bg-gray-100 cursor-not-allowed opacity-50'
            }`}
          >
            <div className="flex flex-col space-y-1">
              <div className="flex items-center space-x-2">
                <Waves className={`w-5 h-5 ${state.strategies.runPoolInWindow ? 'text-cyan-600' : 'text-gray-400'}`} />
                <span className={`font-medium ${state.strategies.runPoolInWindow ? 'text-cyan-700' : 'text-gray-600'}`}>
                  Run Pool Pump
                </span>
              </div>
              <span className="text-xs text-gray-500">1.5 kW</span>
            </div>
          </button>

          {/* Hot Water Window */}
          <button
            onClick={() => updateState({ strategies: { ...state.strategies, runHotWaterInWindow: !state.strategies.runHotWaterInWindow } })}
            disabled={!state.isHeatPump}
            className={`p-4 rounded-lg border-2 transition-all ${
              state.strategies.runHotWaterInWindow
                ? 'border-amber-500 bg-amber-50'
                : state.isHeatPump
                ? 'border-gray-300 bg-white hover:border-gray-400'
                : 'border-gray-200 bg-gray-100 cursor-not-allowed opacity-50'
            }`}
          >
            <div className="flex flex-col space-y-1">
              <div className="flex items-center space-x-2">
                <Flame className={`w-5 h-5 ${state.strategies.runHotWaterInWindow ? 'text-amber-600' : 'text-gray-400'}`} />
                <span className={`font-medium ${state.strategies.runHotWaterInWindow ? 'text-amber-700' : 'text-gray-600'}`}>
                  Heat Hot Water
                </span>
              </div>
              <span className="text-xs text-gray-500">1.0 kW</span>
            </div>
          </button>
        </div>
      </div>

      {/* Legacy Hacks Section */}
      <div className="pt-4 border-t border-gray-200">
        <h3 className="text-lg font-semibold text-slate-900 tracking-tighter mb-1">Legacy Hacks (No Upfront Cost)</h3>
        <p className="text-sm text-slate-400 mb-3 uppercase tracking-widest">
          Keep your old appliances, add smart timers for Free 3 window
        </p>
        <div className="grid md:grid-cols-3 gap-3">
          {/* Timer: Resistive Hot Water */}
          <button
            onClick={() => updateState({ timerResistiveHW: !state.timerResistiveHW })}
            disabled={state.isHeatPump}
            className={`p-4 rounded-lg border-2 transition-all ${
              state.timerResistiveHW
                ? 'border-red-500 bg-red-50'
                : state.isHeatPump
                ? 'border-gray-200 bg-gray-100 cursor-not-allowed opacity-50'
                : 'border-gray-300 bg-white hover:border-gray-400'
            }`}
          >
            <div className="flex flex-col space-y-1">
              <div className="flex items-center space-x-2">
                <Clock className={`w-5 h-5 ${state.timerResistiveHW ? 'text-red-600' : 'text-gray-400'}`} />
                <span className={`font-medium ${state.timerResistiveHW ? 'text-red-700' : 'text-gray-600'}`}>
                  Timer: Resistive HW
                </span>
              </div>
              <span className="text-xs text-gray-500">3.6 kW | $50 cost</span>
            </div>
          </button>

          {/* Timer: Old Pool Pump */}
          <button
            onClick={() => updateState({ timerOldPool: !state.timerOldPool })}
            disabled={state.hasPool && state.strategies.runPoolInWindow}
            className={`p-4 rounded-lg border-2 transition-all ${
              state.timerOldPool
                ? 'border-cyan-500 bg-cyan-50'
                : (state.hasPool && state.strategies.runPoolInWindow)
                ? 'border-gray-200 bg-gray-100 cursor-not-allowed opacity-50'
                : 'border-gray-300 bg-white hover:border-gray-400'
            }`}
          >
            <div className="flex flex-col space-y-1">
              <div className="flex items-center space-x-2">
                <Waves className={`w-5 h-5 ${state.timerOldPool ? 'text-cyan-600' : 'text-gray-400'}`} />
                <span className={`font-medium ${state.timerOldPool ? 'text-cyan-700' : 'text-gray-600'}`}>
                  Timer: Old Pool Pump
                </span>
              </div>
              <span className="text-xs text-gray-500">1.5 kW | $20 cost</span>
            </div>
          </button>

          {/* Timer: Storage Heater */}
          <button
            onClick={() => updateState({ timerStorageHeater: !state.timerStorageHeater })}
            className={`p-4 rounded-lg border-2 transition-all ${
              state.timerStorageHeater
                ? 'border-orange-500 bg-orange-50'
                : 'border-gray-300 bg-white hover:border-gray-400'
            }`}
          >
            <div className="flex flex-col space-y-1">
              <div className="flex items-center space-x-2">
                <Flame className={`w-5 h-5 ${state.timerStorageHeater ? 'text-orange-600' : 'text-gray-400'}`} />
                <span className={`font-medium ${state.timerStorageHeater ? 'text-orange-700' : 'text-gray-600'}`}>
                  Timer: Storage Heater
                </span>
              </div>
              <span className="text-xs text-gray-500">2.0 kW | $0 cost</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
