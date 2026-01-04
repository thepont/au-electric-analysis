import { useState, useMemo } from 'react';
import { DailyChart } from './DailyChart';
import { generateDailyProfile, calculateDailySummary } from '../utils/simulationEngine';
import { Sun, Moon, Zap, Thermometer, Battery, AlertTriangle } from 'lucide-react';

// Energy rate constants (Australian market rates 2026)
const PEAK_RATE = 0.58; // OVO Peak 4pm-9pm

interface EnergySimulatorProps {
  solarSystemKw?: number;
  batteryKwh?: number;
  strategies?: {
    chargeEvInWindow: boolean;
    chargeBatInWindow: boolean;
    runPoolInWindow: boolean;
    runHotWaterInWindow: boolean;
  };
  isEV?: boolean;
  isHeatPump?: boolean;
  hasPool?: boolean;
}

export const EnergySimulator = (props: EnergySimulatorProps = {}) => {
  const { 
    solarSystemKw: propSolarSize, 
    batteryKwh: propBatterySize,
    strategies = {
      chargeEvInWindow: false,
      chargeBatInWindow: false,
      runPoolInWindow: false,
      runHotWaterInWindow: false,
    },
    isEV = false,
    isHeatPump = false,
    hasPool = false,
  } = props;
  
  // Use props if provided, otherwise use local state
  const [localSolarSystemKw, setLocalSolarSystemKw] = useState(propSolarSize ?? 6.6);
  const [localBatteryKwh, setLocalBatteryKwh] = useState(propBatterySize ?? 13.5);
  
  const solarSystemKw = propSolarSize !== undefined ? propSolarSize : localSolarSystemKw;
  const batteryKwh = propBatterySize !== undefined ? propBatterySize : localBatteryKwh;
  
  const [heatingStart, setHeatingStart] = useState(17);
  const [heatingEnd, setHeatingEnd] = useState(22);
  const [season, setSeason] = useState<'Summer' | 'Winter'>('Summer');
  const [strategy, setStrategy] = useState<'standard' | 'ovo'>('ovo');
  const [insulation, setInsulation] = useState<'Sealed' | 'Leaky'>('Sealed');

  // Calculate if any loads are being shifted
  const hasAnyLoadShifting = strategies.chargeEvInWindow || strategies.chargeBatInWindow || strategies.runPoolInWindow || strategies.runHotWaterInWindow;

  // Generate simulation data
  const hourlyData = useMemo(() => {
    return generateDailyProfile({
      solarSystemKw,
      batteryKwh,
      heatingSchedule: { start: heatingStart, end: heatingEnd },
      loadShifting: hasAnyLoadShifting,
      season,
      strategy,
      insulation,
    });
  }, [solarSystemKw, batteryKwh, heatingStart, heatingEnd, hasAnyLoadShifting, season, strategy, insulation]);

  // Calculate summary stats
  const summary = useMemo(() => {
    return calculateDailySummary(hourlyData);
  }, [hourlyData]);

  return (
    <div className="space-y-6">
      {/* Configuration Panel */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 p-8">
        <h2 className="text-2xl font-semibold text-slate-900 tracking-tighter mb-6 flex items-center">
          <span className="w-2 h-8 bg-amber-500 rounded mr-3"></span>
          24-Hour Energy Simulation
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* System Configuration */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-800 mb-3">System Configuration</h3>
            
            {/* Solar System Size */}
            <div>
              <label className="flex items-center text-sm font-medium text-slate-700 mb-2">
                <Sun className="w-4 h-4 mr-2 text-orange-500" />
                Solar System Size: {solarSystemKw} kW
              </label>
              <input
                type="range"
                min="0"
                max="20"
                step="0.1"
                value={solarSystemKw}
                onChange={(e) => setLocalSolarSystemKw(parseFloat(e.target.value))}
                disabled={propSolarSize !== undefined}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              {propSolarSize !== undefined && (
                <p className="text-xs text-slate-500 mt-1">Synced with Your Energy Setup</p>
              )}
            </div>

            {/* Battery Capacity */}
            <div>
              <label className="flex items-center text-sm font-medium text-slate-700 mb-2">
                <Battery className="w-4 h-4 mr-2 text-emerald-500" />
                Battery Capacity: {batteryKwh} kWh
              </label>
              <input
                type="range"
                min="0"
                max="40"
                step="0.5"
                value={batteryKwh}
                onChange={(e) => setLocalBatteryKwh(parseFloat(e.target.value))}
                disabled={propBatterySize !== undefined}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              {propBatterySize !== undefined && (
                <p className="text-xs text-slate-500 mt-1">Synced with Your Energy Setup</p>
              )}
            </div>

            {/* Season Toggle */}
            <div>
              <label className="flex items-center text-sm font-medium text-slate-700 mb-2">
                {season === 'Summer' ? (
                  <Sun className="w-4 h-4 mr-2 text-amber-500" />
                ) : (
                  <Moon className="w-4 h-4 mr-2 text-blue-500" />
                )}
                Season
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setSeason('Summer')}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                    season === 'Summer'
                      ? 'bg-amber-500 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  ☀️ Summer
                </button>
                <button
                  onClick={() => setSeason('Winter')}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                    season === 'Winter'
                      ? 'bg-blue-500 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  🌙 Winter
                </button>
              </div>
            </div>

            {/* Strategy Toggle */}
            <div>
              <label className="flex items-center text-sm font-medium text-slate-700 mb-2">
                <Zap className="w-4 h-4 mr-2 text-purple-500" />
                Charging Strategy
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setStrategy('standard')}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-colors ${
                    strategy === 'standard'
                      ? 'bg-slate-700 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Standard
                </button>
                <button
                  onClick={() => setStrategy('ovo')}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-colors ${
                    strategy === 'ovo'
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  OVO Free 3
                </button>
              </div>
            </div>
          </div>

          {/* Behavior Configuration */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-800 mb-3">Behavior Configuration</h3>
            
            {/* Heating Schedule */}
            <div>
              <label className="flex items-center text-sm font-medium text-slate-700 mb-2">
                <Thermometer className="w-4 h-4 mr-2 text-red-500" />
                When do you run the heater?
              </label>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="text-xs text-slate-600">Start</label>
                  <input
                    type="range"
                    min="0"
                    max="23"
                    step="1"
                    value={heatingStart}
                    onChange={(e) => setHeatingStart(parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-red-500"
                  />
                  <div className="text-center text-sm font-medium text-slate-900 mt-1">
                    {heatingStart.toString().padStart(2, '0')}:00
                  </div>
                </div>
                <span className="text-slate-400">to</span>
                <div className="flex-1">
                  <label className="text-xs text-slate-600">End</label>
                  <input
                    type="range"
                    min="0"
                    max="23"
                    step="1"
                    value={heatingEnd}
                    onChange={(e) => setHeatingEnd(parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-red-500"
                  />
                  <div className="text-center text-sm font-medium text-slate-900 mt-1">
                    {heatingEnd.toString().padStart(2, '0')}:00
                  </div>
                </div>
              </div>
            </div>

            {/* Load Shifting Status Display */}
            <div>
              <label className="flex items-center text-sm font-medium text-slate-700 mb-2">
                <Zap className="w-4 h-4 mr-2 text-blue-500" />
                Loads Shifted to 11am-2pm Free Window
              </label>
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                {hasAnyLoadShifting ? (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-emerald-700 mb-2">
                      ✅ Smart Load Shifting Active
                    </p>
                    <div className="space-y-1 text-xs text-slate-600">
                      {strategies.chargeEvInWindow && isEV && (
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                          <span>EV Charging (7.0 kW)</span>
                        </div>
                      )}
                      {strategies.chargeBatInWindow && batteryKwh > 0 && (
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                          <span>Battery Charging (5.0 kW)</span>
                        </div>
                      )}
                      {strategies.runPoolInWindow && hasPool && (
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                          <span>Pool Pump (1.5 kW)</span>
                        </div>
                      )}
                      {strategies.runHotWaterInWindow && isHeatPump && (
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                          <span>Hot Water (1.0 kW)</span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-red-700">
                    <p className="font-medium mb-1">⚠️ No Load Shifting</p>
                    <p className="text-xs text-slate-600">
                      Configure loads in the "11:00 AM Stack" section above to take advantage of the free electricity window.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Insulation Quality */}
            <div>
              <label className="flex items-center text-sm font-medium text-slate-700 mb-2">
                <Thermometer className="w-4 h-4 mr-2 text-slate-500" />
                Insulation Quality
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setInsulation('Sealed')}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-colors ${
                    insulation === 'Sealed'
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  🏠 Sealed
                </button>
                <button
                  onClick={() => setInsulation('Leaky')}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-colors ${
                    insulation === 'Leaky'
                      ? 'bg-red-500 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  🌬️ Leaky
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chart Visualization */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 p-8">
        <h3 className="text-xl font-semibold text-slate-900 tracking-tighter mb-4">
          24-Hour Power Flow
        </h3>
        <DailyChart data={hourlyData} />
      </div>

      {/* The "Hacker" Verdict */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2.5rem] shadow-lg border border-slate-700 p-8">
        <h3 className="text-2xl font-bold text-white tracking-tighter mb-6 flex items-center">
          <Zap className="w-6 h-6 mr-3 text-amber-500" />
          The Hacker&apos;s Verdict
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Free Power Captured - THE KEY METRIC */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
            <div className="text-slate-400 text-sm mb-1">Free Power Captured</div>
            <div className={`text-3xl font-bold ${
              summary.freePowerCaptured >= 10 ? 'text-emerald-400' :
              summary.freePowerCaptured >= 5 ? 'text-amber-400' :
              'text-red-400'
            }`}>
              {summary.freePowerCaptured.toFixed(1)} kWh
            </div>
            <div className="text-xs text-slate-500 mt-1">
              11am-2pm free window
            </div>
          </div>

          {/* Peak PAID Grid Import */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
            <div className="text-slate-400 text-sm mb-1">Peak Paid Import</div>
            <div className={`text-3xl font-bold ${
              summary.peakPaidGridUsage === 0 ? 'text-emerald-400' :
              summary.peakPaidGridUsage < 3 ? 'text-amber-400' :
              'text-red-400'
            }`}>
              {summary.peakPaidGridUsage.toFixed(2)} kW
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Outside free window
            </div>
          </div>

          {/* Grid Independence */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
            <div className="text-slate-400 text-sm mb-1">Grid Independence</div>
            <div className={`text-3xl font-bold ${
              summary.gridIndependence >= 95 ? 'text-emerald-400' :
              summary.gridIndependence >= 80 ? 'text-amber-400' :
              'text-red-400'
            }`}>
              {summary.gridIndependence.toFixed(1)}%
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Excluding free imports
            </div>
          </div>

          {/* Temperature Range */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
            <div className="text-slate-400 text-sm mb-1">Indoor Temp Range</div>
            <div className={`text-3xl font-bold ${
              summary.minTemp >= 18 ? 'text-emerald-400' :
              summary.minTemp >= 16 ? 'text-amber-400' :
              'text-red-400'
            }`}>
              {summary.minTemp}°C - {summary.maxTemp}°C
            </div>
          </div>
        </div>

        {/* Insights and Warnings */}
        <div className="space-y-3">
          {summary.freePowerCaptured >= 10 && summary.gridIndependence >= 95 && (
            <div className="bg-emerald-500/20 border border-emerald-500/50 rounded-xl p-4 text-emerald-100">
              <span className="font-bold">🎉 Perfect Optimization!</span> You&apos;re capturing {summary.freePowerCaptured.toFixed(1)} kWh of free power during 11am-2pm and achieving {summary.gridIndependence.toFixed(1)}% independence from paid grid imports.
            </div>
          )}
          
          {summary.freePowerCaptured < 10 && hasAnyLoadShifting && (
            <div className="bg-amber-500/20 border border-amber-500/50 rounded-xl p-4 text-amber-100">
              <span className="font-bold">💡 Optimize Free Power:</span> You&apos;re only capturing {summary.freePowerCaptured.toFixed(1)} kWh during the free window. Consider adding more devices to the "11:00 AM Stack" (EV, Pool, Hot Water) to maximize free electricity usage.
            </div>
          )}
          
          {!hasAnyLoadShifting && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 text-red-100">
              <span className="font-bold">⚠️ Missing Free Power!</span> You&apos;re not using the 11am-2pm free window. Enable devices in the "11:00 AM Stack" section above to capture up to 15 kWh/day of FREE electricity and save ${(summary.paidGridImport * PEAK_RATE).toFixed(0)}/day!
            </div>
          )}

          {summary.peakPaidGridUsage > 5 && (
            <div className="bg-amber-500/20 border border-amber-500/50 rounded-xl p-4 text-amber-100">
              <span className="font-bold">🔌 High Paid Grid Usage:</span> Peak paid import is {summary.peakPaidGridUsage.toFixed(2)} kW. Shift more loads to the free window or increase battery capacity to reduce expensive grid imports.
            </div>
          )}

          {summary.comfortWarning && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 text-red-100 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-bold">⚠️ Comfort Warning:</span> {summary.comfortWarning}. 
                {insulation === 'Leaky' && (
                  <span> Consider upgrading insulation or extending heating hours to maintain comfort.</span>
                )}
              </div>
            </div>
          )}
          
          {summary.wastedSolar > 20 && (
            <div className="bg-amber-500/20 border border-amber-500/50 rounded-xl p-4 text-amber-100">
              <span className="font-bold">☀️ Solar Clipping:</span> You&apos;re exporting {summary.wastedSolar.toFixed(1)} kWh/day. Consider a larger battery or shifting more loads to the free window to capture this energy.
            </div>
          )}
        </div>

        {/* Daily Summary Stats */}
        <div className="mt-6 pt-6 border-t border-white/20">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
            <div>
              <div className="text-slate-400 mb-1">Total Solar</div>
              <div className="text-white font-medium">{summary.totalSolar.toFixed(1)} kWh</div>
            </div>
            <div>
              <div className="text-slate-400 mb-1">Total Consumption</div>
              <div className="text-white font-medium">{summary.totalConsumption.toFixed(1)} kWh</div>
            </div>
            <div>
              <div className="text-emerald-400 mb-1 font-medium">Free Import</div>
              <div className="text-emerald-200 font-bold">{summary.freeGridImport.toFixed(1)} kWh</div>
            </div>
            <div>
              <div className="text-red-400 mb-1 font-medium">Paid Import</div>
              <div className="text-red-200 font-bold">{summary.paidGridImport.toFixed(1)} kWh</div>
            </div>
            <div>
              <div className="text-slate-400 mb-1">Grid Export</div>
              <div className="text-white font-medium">{summary.totalGridExport.toFixed(1)} kWh</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
