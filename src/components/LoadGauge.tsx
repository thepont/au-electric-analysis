import { AlertTriangle } from 'lucide-react';
import { Tooltip } from './Tooltip';

// Use the same peak rate as in useEnergyMath for consistency
const PEAK_RATE = 0.58;

interface LoadGaugeProps {
  peakLoad: number;
  maxKw: number;
  isBreakerTripped: boolean;
  wastedKwh: number;
  serviceFuse: number;
}

export const LoadGauge = ({ peakLoad, maxKw, isBreakerTripped, wastedKwh, serviceFuse }: LoadGaugeProps) => {
  const loadPercentage = Math.min((peakLoad / maxKw) * 100, 100);
  const isWarning = loadPercentage > 80 && !isBreakerTripped;
  const isDanger = isBreakerTripped;

  return (
    <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 p-8">
      <h2 className="text-2xl font-semibold text-slate-900 tracking-tighter mb-4 flex items-center">
        <span className="w-2 h-8 bg-blue-600 rounded mr-3"></span>
        Load Gauge
      </h2>

      <div className="space-y-4">
        {/* Load Bar */}
        <div>
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium text-slate-700">
              Current Load: {peakLoad.toFixed(1)} kW
            </span>
            <span className="text-sm font-medium text-slate-700">
              Limit: {maxKw.toFixed(1)} kW
            </span>
          </div>
          
          <div className="w-full h-8 bg-gray-200 rounded-lg overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                isDanger ? 'bg-red-500' : isWarning ? 'bg-amber-500' : 'bg-green-500'
              }`}
              style={{ width: `${loadPercentage}%` }}
            />
          </div>
          
          <div className="flex justify-between mt-1 text-xs text-slate-400">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Status Message */}
        {isDanger && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <div className="flex items-start">
              <AlertTriangle className="w-5 h-5 text-red-600 mr-2 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-800">
                  ⚠️ Breaker Trip Warning!
                </p>
                <p className="text-sm text-red-700 mt-1">
                  Your load ({peakLoad.toFixed(1)} kW) exceeds your {serviceFuse}A fuse limit ({maxKw.toFixed(1)} kW).
                  The breaker would trip, preventing this charging strategy.
                </p>
              </div>
            </div>
          </div>
        )}

        {isWarning && !isDanger && (
          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded">
            <p className="text-sm text-amber-800">
              ⚠️ <strong>Approaching Limit:</strong> You're using {loadPercentage.toFixed(0)}% of your fuse capacity. Consider upgrading for more headroom.
            </p>
          </div>
        )}

        {!isDanger && !isWarning && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
            <p className="text-sm text-green-800">
              ✅ <strong>Safe Operation:</strong> Your load is within safe limits ({loadPercentage.toFixed(0)}% capacity).
            </p>
          </div>
        )}

        {/* 3-Phase Upsell */}
        {(isDanger || wastedKwh > 0) && serviceFuse !== 100 && (
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
            <div className="flex items-start">
              <div className="flex-1">
                <p className="text-sm font-semibold text-blue-800 mb-2">
                  💡 Upgrade to 3-Phase Power
                </p>
                <p className="text-sm text-blue-700 mb-2">
                  Upgrading to 3-Phase (100A / ~43kW) would unlock this capacity and prevent overloads.
                </p>
                <Tooltip content="Upgrading to 3-Phase may trigger a move to 'Demand Tariffs' depending on your DNSP. Some networks charge based on your highest single spike in 5-minute intervals, which could add $50/month in demand charges, potentially wiping out your arbitrage savings. Check your energy fact sheet first.">
                  <span className="text-xs text-blue-600 cursor-help underline">
                    ⚠️ Warning: May trigger Demand Tariffs
                  </span>
                </Tooltip>
              </div>
            </div>
          </div>
        )}

        {/* Capacity Waste */}
        {wastedKwh > 0 && (
          <div className="bg-slate-50 border-l-4 border-slate-400 p-4 rounded">
            <p className="text-sm text-slate-800">
              📊 <strong>Wasted Capacity:</strong> {wastedKwh.toFixed(1)} kWh/day cannot be imported due to fuse constraints.
              This reduces your potential savings by ~${(wastedKwh * PEAK_RATE * 365).toFixed(0)}/year.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
