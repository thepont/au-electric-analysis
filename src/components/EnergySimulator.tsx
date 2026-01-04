import { useState, useMemo } from 'react';
import { DailyChart } from './DailyChart';
import { generateDailyProfile, calculateDailySummary } from '../utils/simulationEngine';
import { Sun, Moon, Zap, Thermometer, Battery, AlertTriangle } from 'lucide-react';

// Energy rate constants (Australian market rates 2026)
const PEAK_RATE = 0.58; // OVO Peak 4pm-9pm

interface EnergySimulatorProps {
  solarSystemKw?: number;
  batteryKwh?: number;
}

export const EnergySimulator = (props: EnergySimulatorProps = {}) => {
  const { solarSystemKw: propSolarSize, batteryKwh: propBatterySize } = props;
  
  // Use props if provided, otherwise use local state
  const [localSolarSystemKw, setLocalSolarSystemKw] = useState(propSolarSize ?? 6.6);
  const [localBatteryKwh, setLocalBatteryKwh] = useState(propBatterySize ?? 13.5);
  
  const solarSystemKw = propSolarSize !== undefined ? propSolarSize : localSolarSystemKw;
  const batteryKwh = propBatterySize !== undefined ? propBatterySize : localBatteryKwh;
  
  const [heatingStart, setHeatingStart] = useState(17);
  const [heatingEnd, setHeatingEnd] = useState(22);
  const [loadShifting, setLoadShifting] = useState(true); // Default to smart load shifting
  const [season, setSeason] = useState<'Summer' | 'Winter'>('Summer');
  const [strategy, setStrategy] = useState<'standard' | 'ovo'>('ovo');
  const [insulation, setInsulation] = useState<'Sealed' | 'Leaky'>('Sealed');

  // Generate simulation data
  const hourlyData = useMemo(() => {
    return generateDailyProfile({
      solarSystemKw,
      batteryKwh,
      heatingSchedule: { start: heatingStart, end: heatingEnd },
      loadShifting,
      season,
      strategy,
      insulation,
    });
  }, [solarSystemKw, batteryKwh, heatingStart, heatingEnd, loadShifting, season, strategy, insulation]);

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

            {/* Load Shifting Toggle */}
            <div>
              <label className="flex items-center text-sm font-medium text-slate-700 mb-2">
                <Zap className="w-4 h-4 mr-2 text-blue-500" />
                Load Shifting Strategy
              </label>
              <button
                onClick={() => setLoadShifting(!loadShifting)}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-all ${
                  loadShifting
                    ? 'bg-emerald-500 text-white shadow-lg'
                    : 'bg-red-100 text-red-800 border-2 border-red-300'
                }`}
              >
                {loadShifting ? (
                  <span className="flex items-center justify-center gap-2">
                    ✅ Smart: Pool/EV/HW run at 11am (Free!)
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    ⚠️ Lazy: Pool/EV/HW run at 7pm (Expensive!)
                  </span>
                )}
              </button>
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
          {/* Grid Independence */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
            <div className="text-slate-400 text-sm mb-1">Grid Independence</div>
            <div className={`text-3xl font-bold ${
              summary.gridIndependence >= 80 ? 'text-emerald-400' :
              summary.gridIndependence >= 50 ? 'text-amber-400' :
              'text-red-400'
            }`}>
              {summary.gridIndependence.toFixed(1)}%
            </div>
          </div>

          {/* Peak Grid Usage */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
            <div className="text-slate-400 text-sm mb-1">Peak Grid Import</div>
            <div className={`text-3xl font-bold ${
              summary.peakGridUsage === 0 ? 'text-emerald-400' :
              summary.peakGridUsage < 3 ? 'text-amber-400' :
              'text-red-400'
            }`}>
              {summary.peakGridUsage.toFixed(2)} kW
            </div>
          </div>

          {/* Wasted Solar */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
            <div className="text-slate-400 text-sm mb-1">Solar Export</div>
            <div className={`text-3xl font-bold ${
              summary.wastedSolar < 5 ? 'text-emerald-400' :
              summary.wastedSolar < 15 ? 'text-amber-400' :
              'text-red-400'
            }`}>
              {summary.wastedSolar.toFixed(1)} kWh
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
          {summary.gridIndependence >= 80 && (
            <div className="bg-emerald-500/20 border border-emerald-500/50 rounded-xl p-4 text-emerald-100">
              <span className="font-bold">🎉 Excellent!</span> You&apos;re achieving high grid independence. Your system is well-optimized.
            </div>
          )}
          
          {!loadShifting && (
            <div className="bg-amber-500/20 border border-amber-500/50 rounded-xl p-4 text-amber-100">
              <span className="font-bold">💡 Pro Tip:</span> Enable Load Shifting to move Pool/EV/Hot Water to the 11am-2pm free window and save ${(summary.totalGridImport * PEAK_RATE).toFixed(0)}/day!
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

          {summary.wastedSolar > 15 && (
            <div className="bg-orange-500/20 border border-orange-500/50 rounded-xl p-4 text-orange-100">
              <span className="font-bold">☀️ Solar Clipping:</span> You&apos;re exporting {summary.wastedSolar.toFixed(1)} kWh/day. 
              Consider a larger battery or more load shifting to capture this energy.
            </div>
          )}

          {strategy === 'ovo' && summary.gridIndependence < 50 && (
            <div className="bg-purple-500/20 border border-purple-500/50 rounded-xl p-4 text-purple-100">
              <span className="font-bold">🔋 Battery Size:</span> Your battery might be too small for OVO arbitrage. 
              Consider upgrading to at least 15 kWh to maximize savings.
            </div>
          )}
        </div>

        {/* Daily Summary Stats */}
        <div className="mt-6 pt-6 border-t border-white/20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-slate-400 mb-1">Total Solar</div>
              <div className="text-white font-medium">{summary.totalSolar.toFixed(1)} kWh</div>
            </div>
            <div>
              <div className="text-slate-400 mb-1">Total Consumption</div>
              <div className="text-white font-medium">{summary.totalConsumption.toFixed(1)} kWh</div>
            </div>
            <div>
              <div className="text-slate-400 mb-1">Grid Import</div>
              <div className="text-white font-medium">{summary.totalGridImport.toFixed(1)} kWh</div>
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
