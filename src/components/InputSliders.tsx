import { Zap, Battery, Car, Flame } from 'lucide-react';

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

      {/* Strategy Toggles */}
      <div className="pt-4 border-t border-gray-200">
        <h3 className="text-lg font-semibold text-slate-900 tracking-tighter mb-3">Energy Strategy</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
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
        </div>
      </div>
    </div>
  );
};
