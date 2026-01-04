import { Droplet, Flame, Zap, Waves, Wind, Car, Battery, Sun } from 'lucide-react';

interface ApplianceConfigurationProps {
  state: {
    currentSetup: {
      hotWater: 'gas' | 'resistive' | 'heatpump';
      heating: 'gas' | 'resistive' | 'rc' | 'none';
      cooking: 'gas' | 'induction';
      pool: 'none' | 'single_speed' | 'variable_speed';
      dryer: 'vented' | 'heatpump';
    };
    isEV: boolean;
    isV2H: boolean;
    isHeatPump: boolean;
    isInduction: boolean;
    hasPool: boolean;
    strategies: {
      chargeEvInWindow: boolean;
      chargeBatInWindow: boolean;
      runHotWaterInWindow: boolean;
      runPoolInWindow: boolean;
    };
    batterySize: number;
    solarSize: number;
  };
  updateState: (newState: any) => void;
}

export const ApplianceConfiguration = ({ state, updateState }: ApplianceConfigurationProps) => {
  return (
    <div className="space-y-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-900 tracking-tighter mb-2">Appliance Configuration</h3>
        <p className="text-sm text-slate-600">
          Configure your energy generation, storage, and consumption appliances. Tell us what you have now, if you're planning to upgrade, and if you want to shift the load to the free window.
        </p>
      </div>

      {/* Solar System */}
      <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
        <div className="flex items-center space-x-2 mb-4">
          <Sun className="w-5 h-5 text-amber-500" />
          <h4 className="font-semibold text-slate-900">Solar System</h4>
        </div>
        
        <div className="grid md:grid-cols-2 gap-4">
          {/* Current or Planned Size */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-2 uppercase tracking-wider">
              Current or Planned Size
            </label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  min="0"
                  max="20"
                  step="0.5"
                  value={state.solarSize}
                  onChange={(e) => updateState({ solarSize: parseFloat(e.target.value) || 0 })}
                  className="w-24 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
                <span className="text-sm text-gray-600">kW</span>
                {state.solarSize === 0 && (
                  <span className="text-xs text-amber-600 ml-2">← Set to 0 if no solar</span>
                )}
              </div>
              <input
                type="range"
                min="0"
                max="20"
                step="0.5"
                value={state.solarSize}
                onChange={(e) => updateState({ solarSize: parseFloat(e.target.value) })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>
          </div>
          
          {/* Upgrade Info */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-2 uppercase tracking-wider">
              Further Upgrades
            </label>
            <div className="text-sm text-gray-600 px-4 py-3 bg-white border border-gray-300 rounded-lg">
              See ROI table below for upgrade options
            </div>
          </div>
        </div>
      </div>

      {/* Battery Storage */}
      <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
        <div className="flex items-center space-x-2 mb-4">
          <Battery className="w-5 h-5 text-blue-600" />
          <h4 className="font-semibold text-slate-900">Battery Storage</h4>
        </div>
        
        <div className="grid md:grid-cols-3 gap-4">
          {/* Current or Planned Capacity */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-2 uppercase tracking-wider">
              Current or Planned Capacity
            </label>
            {state.isV2H ? (
              <div>
                <div className="text-sm text-gray-600 px-4 py-2 bg-white border border-gray-300 rounded-lg">
                  Using V2H (60 kWh)
                </div>
                <p className="text-xs text-gray-500 mt-1">V2H provides battery storage</p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min="0"
                    max="40"
                    step="0.5"
                    value={state.batterySize}
                    onChange={(e) => updateState({ batterySize: parseFloat(e.target.value) || 0 })}
                    className="w-24 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <span className="text-sm text-gray-600">kWh</span>
                  {state.batterySize === 0 && (
                    <span className="text-xs text-amber-600">← Set to 0 if no battery</span>
                  )}
                </div>
                <input
                  type="range"
                  min="0"
                  max="40"
                  step="0.5"
                  value={state.batterySize}
                  onChange={(e) => updateState({ batterySize: parseFloat(e.target.value) })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>
            )}
          </div>
          
          {/* Upgrade Info */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-2 uppercase tracking-wider">
              Further Upgrades
            </label>
            <div className="text-sm text-gray-600 px-4 py-3 bg-white border border-gray-300 rounded-lg">
              See ROI table below for upgrade options
            </div>
          </div>

          {/* Do you plan to shift the load? */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-2 uppercase tracking-wider">
              Charge during 11am-2pm?
            </label>
            <button
              onClick={() => updateState({ 
                strategies: { 
                  ...state.strategies, 
                  chargeBatInWindow: !state.strategies.chargeBatInWindow 
                } 
              })}
              disabled={state.batterySize === 0 && !state.isV2H}
              className={`w-full px-4 py-2 rounded-lg border-2 transition-all text-sm font-medium relative ${
                state.strategies.chargeBatInWindow
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : (state.batterySize > 0 || state.isV2H)
                  ? 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                  : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              {state.strategies.chargeBatInWindow && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">✓</span>
                </span>
              )}
              Charge Free (5.0 kW)
            </button>
            {(state.batterySize === 0 && !state.isV2H) && (
              <p className="text-xs text-gray-500 mt-1">Requires battery</p>
            )}
          </div>
        </div>
      </div>

      {/* Electric Vehicle */}
      <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
        <div className="flex items-center space-x-2 mb-4">
          <Car className="w-5 h-5 text-emerald-600" />
          <h4 className="font-semibold text-slate-900">Electric Vehicle</h4>
        </div>
        
        <div className="grid md:grid-cols-3 gap-4">
          {/* What do you have now? */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-2 uppercase tracking-wider">
              What do you have now?
            </label>
            <select
              value={state.isEV ? 'haveEV' : 'noEV'}
              onChange={(e) => updateState({ isEV: e.target.value === 'haveEV' })}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="noEV">No Electric Vehicle</option>
              <option value="haveEV">Have Electric Vehicle</option>
            </select>
          </div>

          {/* Do you plan to upgrade? */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-2 uppercase tracking-wider">
              Plan to upgrade?
            </label>
            <button
              onClick={() => updateState({ isV2H: !state.isV2H })}
              disabled={!state.isEV}
              className={`w-full px-4 py-2 rounded-lg border-2 transition-all text-sm font-medium relative ${
                state.isV2H
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : state.isEV
                  ? 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                  : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              {state.isV2H && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">✓</span>
                </span>
              )}
              Add V2H (60 kWh)
            </button>
            {!state.isEV && (
              <p className="text-xs text-gray-500 mt-1">Requires EV first</p>
            )}
            {state.isEV && (
              <p className="text-xs text-gray-500 mt-1">Vehicle-to-Home backup</p>
            )}
          </div>

          {/* Do you plan to shift the load? */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-2 uppercase tracking-wider">
              Charge during 11am-2pm?
            </label>
            <button
              onClick={() => updateState({ 
                strategies: { 
                  ...state.strategies, 
                  chargeEvInWindow: !state.strategies.chargeEvInWindow 
                } 
              })}
              disabled={!state.isEV}
              className={`w-full px-4 py-2 rounded-lg border-2 transition-all text-sm font-medium relative ${
                state.strategies.chargeEvInWindow
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                  : state.isEV
                  ? 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                  : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              {state.strategies.chargeEvInWindow && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">✓</span>
                </span>
              )}
              Charge Free (7.0 kW)
            </button>
            {!state.isEV && (
              <p className="text-xs text-gray-500 mt-1">Requires EV</p>
            )}
          </div>
        </div>
      </div>



      {/* Hot Water */}
      <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
        <div className="flex items-center space-x-2 mb-4">
          <Droplet className="w-5 h-5 text-blue-600" />
          <h4 className="font-semibold text-slate-900">Hot Water</h4>
        </div>
        
        <div className="grid md:grid-cols-3 gap-4">
          {/* What do you have now? */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-2 uppercase tracking-wider">
              What do you have now?
            </label>
            <select
              value={state.currentSetup.hotWater}
              onChange={(e) => updateState({ 
                currentSetup: { 
                  ...state.currentSetup, 
                  hotWater: e.target.value as 'gas' | 'resistive' | 'heatpump'
                } 
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="gas">Gas Hot Water</option>
              <option value="resistive">Electric Resistive</option>
              <option value="heatpump">Heat Pump (upgraded)</option>
            </select>
          </div>

          {/* Do you plan to upgrade? */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-2 uppercase tracking-wider">
              Plan to upgrade?
            </label>
            <button
              onClick={() => updateState({ isHeatPump: !state.isHeatPump })}
              disabled={state.currentSetup.hotWater === 'heatpump'}
              className={`w-full px-4 py-2 rounded-lg border-2 transition-all text-sm font-medium relative ${
                state.isHeatPump
                  ? 'border-amber-500 bg-amber-50 text-amber-700'
                  : state.currentSetup.hotWater === 'heatpump'
                  ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
              }`}
            >
              {state.isHeatPump && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">✓</span>
                </span>
              )}
              {state.currentSetup.hotWater === 'heatpump' 
                ? 'Already Upgraded' 
                : 'Upgrade to Heat Pump'}
            </button>
          </div>

          {/* Do you plan to shift the load? */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-2 uppercase tracking-wider">
              Shift load to 11am-2pm?
            </label>
            <button
              onClick={() => updateState({ 
                strategies: { 
                  ...state.strategies, 
                  runHotWaterInWindow: !state.strategies.runHotWaterInWindow 
                } 
              })}
              disabled={state.currentSetup.hotWater !== 'heatpump' && !state.isHeatPump}
              className={`w-full px-4 py-2 rounded-lg border-2 transition-all text-sm font-medium relative ${
                state.strategies.runHotWaterInWindow
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                  : (state.currentSetup.hotWater === 'heatpump' || state.isHeatPump)
                  ? 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                  : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              {state.strategies.runHotWaterInWindow && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">✓</span>
                </span>
              )}
              Heat Free (1.0 kW)
            </button>
            {(state.currentSetup.hotWater !== 'heatpump' && !state.isHeatPump) && (
              <p className="text-xs text-gray-500 mt-1">Requires heat pump</p>
            )}
          </div>
        </div>
      </div>

      {/* Heating */}
      <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
        <div className="flex items-center space-x-2 mb-4">
          <Flame className="w-5 h-5 text-orange-600" />
          <h4 className="font-semibold text-slate-900">Heating</h4>
        </div>
        
        <div className="grid md:grid-cols-3 gap-4">
          {/* What do you have now? */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-2 uppercase tracking-wider">
              What do you have now?
            </label>
            <select
              value={state.currentSetup.heating}
              onChange={(e) => updateState({ 
                currentSetup: { 
                  ...state.currentSetup, 
                  heating: e.target.value as 'gas' | 'resistive' | 'rc' | 'none'
                } 
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="gas">Gas Ducted</option>
              <option value="resistive">Electric Resistive</option>
              <option value="rc">Reverse Cycle (upgraded)</option>
              <option value="none">No Heating</option>
            </select>
          </div>

          {/* Do you plan to upgrade? */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-2 uppercase tracking-wider">
              Plan to upgrade?
            </label>
            <div className="text-sm text-gray-600 px-4 py-2 bg-white border border-gray-300 rounded-lg">
              {state.currentSetup.heating === 'rc' 
                ? '✓ Already have Reverse Cycle' 
                : 'Calculated in ROI table'}
            </div>
          </div>

          {/* Do you plan to shift the load? */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-2 uppercase tracking-wider">
              Shift load to 11am-2pm?
            </label>
            <div className="text-sm text-gray-600 px-4 py-2 bg-white border border-gray-300 rounded-lg">
              Pre-heat during free window
            </div>
          </div>
        </div>
      </div>

      {/* Cooking */}
      <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
        <div className="flex items-center space-x-2 mb-4">
          <Zap className="w-5 h-5 text-purple-600" />
          <h4 className="font-semibold text-slate-900">Cooking</h4>
        </div>
        
        <div className="grid md:grid-cols-2 gap-4">
          {/* What do you have now? */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-2 uppercase tracking-wider">
              What do you have now?
            </label>
            <select
              value={state.currentSetup.cooking}
              onChange={(e) => updateState({ 
                currentSetup: { 
                  ...state.currentSetup, 
                  cooking: e.target.value as 'gas' | 'induction'
                } 
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="gas">Gas Cooktop</option>
              <option value="induction">Induction (upgraded)</option>
            </select>
          </div>

          {/* Do you plan to upgrade? */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-2 uppercase tracking-wider">
              Plan to upgrade?
            </label>
            <button
              onClick={() => updateState({ isInduction: !state.isInduction })}
              disabled={state.currentSetup.cooking === 'induction'}
              className={`w-full px-4 py-2 rounded-lg border-2 transition-all text-sm font-medium relative ${
                state.isInduction
                  ? 'border-purple-500 bg-purple-50 text-purple-700'
                  : state.currentSetup.cooking === 'induction'
                  ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
              }`}
            >
              {state.isInduction && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">✓</span>
                </span>
              )}
              {state.currentSetup.cooking === 'induction' 
                ? 'Already Upgraded' 
                : 'Upgrade to Induction'}
            </button>
          </div>
        </div>
      </div>

      {/* Pool Pump */}
      <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
        <div className="flex items-center space-x-2 mb-4">
          <Waves className="w-5 h-5 text-cyan-600" />
          <h4 className="font-semibold text-slate-900">Pool Pump</h4>
        </div>
        
        <div className="grid md:grid-cols-3 gap-4">
          {/* What do you have now? */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-2 uppercase tracking-wider">
              What do you have now?
            </label>
            <select
              value={state.currentSetup.pool}
              onChange={(e) => {
                const newValue = e.target.value as 'none' | 'single_speed' | 'variable_speed';
                updateState({ 
                  currentSetup: { 
                    ...state.currentSetup, 
                    pool: newValue
                  },
                  hasPool: newValue !== 'none'
                });
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            >
              <option value="none">No Pool</option>
              <option value="single_speed">Single Speed Pump</option>
              <option value="variable_speed">Variable Speed (upgraded)</option>
            </select>
          </div>

          {/* Do you plan to upgrade? */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-2 uppercase tracking-wider">
              Plan to upgrade?
            </label>
            <div className="text-sm text-gray-600 px-4 py-2 bg-white border border-gray-300 rounded-lg">
              {state.currentSetup.pool === 'none' 
                ? 'No pool' 
                : state.currentSetup.pool === 'variable_speed'
                ? '✓ Already variable speed'
                : 'Calculated in ROI table'}
            </div>
          </div>

          {/* Do you plan to shift the load? */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-2 uppercase tracking-wider">
              Shift load to 11am-2pm?
            </label>
            <button
              onClick={() => updateState({ 
                strategies: { 
                  ...state.strategies, 
                  runPoolInWindow: !state.strategies.runPoolInWindow 
                } 
              })}
              disabled={!state.hasPool}
              className={`w-full px-4 py-2 rounded-lg border-2 transition-all text-sm font-medium relative ${
                state.strategies.runPoolInWindow
                  ? 'border-cyan-500 bg-cyan-50 text-cyan-700'
                  : state.hasPool
                  ? 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                  : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              {state.strategies.runPoolInWindow && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-cyan-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">✓</span>
                </span>
              )}
              Run Free (1.5 kW)
            </button>
            {!state.hasPool && (
              <p className="text-xs text-gray-500 mt-1">No pool configured</p>
            )}
          </div>
        </div>
      </div>

      {/* Dryer */}
      <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
        <div className="flex items-center space-x-2 mb-4">
          <Wind className="w-5 h-5 text-indigo-600" />
          <h4 className="font-semibold text-slate-900">Clothes Dryer</h4>
        </div>
        
        <div className="grid md:grid-cols-2 gap-4">
          {/* What do you have now? */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-2 uppercase tracking-wider">
              What do you have now?
            </label>
            <select
              value={state.currentSetup.dryer}
              onChange={(e) => updateState({ 
                currentSetup: { 
                  ...state.currentSetup, 
                  dryer: e.target.value as 'vented' | 'heatpump'
                } 
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="vented">Vented Dryer</option>
              <option value="heatpump">Heat Pump (upgraded)</option>
            </select>
          </div>

          {/* Do you plan to upgrade? */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-2 uppercase tracking-wider">
              Plan to upgrade?
            </label>
            <div className="text-sm text-gray-600 px-4 py-2 bg-white border border-gray-300 rounded-lg">
              {state.currentSetup.dryer === 'heatpump' 
                ? '✓ Already heat pump' 
                : 'Calculated in ROI table'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
