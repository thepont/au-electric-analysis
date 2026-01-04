import { Tooltip } from './Tooltip';

// Estimation prefix for compliance with ACL s18
const ESTIMATION_PREFIX = '~';

// Upfront cost constants (2026 estimates)
const REVERSE_CYCLE_INSTALL_COST = 5500; // Mid-range split system installation

interface ROITableProps {
  results: {
    batSavings: number;
    solarSavings: number;
    transportSavings: number;
    gasSavings: number;
    poolPumpSavings: number;
    hpDryerSavings: number;
    gapSealingSavings: number;
    totalSavings: number;
    systemCost: number;
    roiYears: number;
    gridPriceWarning?: string;
    gasDisconnected: boolean;
    liabilityCosts: {
      hotWater: number;
      heating: number;
      cooking: number;
      pool: number;
    };
    // Waterfall breakdown
    manualShiftSavings: number;
    batteryArbitrageSavings: number;
    // Gas breakdown
    hotWaterSavings: number;
    heatingSavings: number;
    cookingSavings: number;
    gasDisconnectionBonus: number;
    // Current setup info
    currentHeatingType: 'gas' | 'resistive' | 'rc' | 'none';
  };
}

export const ROITable = ({ results }: ROITableProps) => {
  const formatCurrency = (amount: number) => {
    return `${ESTIMATION_PREFIX}$${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  const formatYears = (years: number) => {
    if (years > 100) return 'N/A';
    return `${ESTIMATION_PREFIX}${years.toFixed(1)} years`;
  };

  const strategies = [
    // OVO Free 3 Plan - Manual Shifts (Timer Hacks)
    {
      name: 'OVO Free 3 - Load Shifting',
      cost: 0,
      liability: 0,
      saving: results.manualShiftSavings,
      link: results.manualShiftSavings > 0 ? 'https://www.ovoenergy.com.au/refer/paul8789' : null,
      color: 'emerald',
      description: 'Pool pump & hot water timers during free window (11am-2pm)',
    },
    // OVO Free 3 Plan - Battery Arbitrage
    {
      name: 'OVO Free 3 - Battery Arbitrage',
      cost: 0,
      liability: 0,
      saving: results.batteryArbitrageSavings,
      link: results.batteryArbitrageSavings > 0 ? 'https://www.ovoenergy.com.au/refer/paul8789' : null,
      color: 'emerald',
      description: 'Battery discharge during peak (4pm-9pm), charge during free window',
    },
    {
      name: 'Solar System',
      cost: results.systemCost > 0 ? Math.round(results.solarSavings / results.totalSavings * results.systemCost) : 0,
      liability: 0, // Solar doesn't replace anything
      saving: results.solarSavings,
      link: null,
      color: 'yellow',
    },
    {
      name: 'Tesla EV Switch',
      cost: 15000,
      liability: 0, // Transport doesn't have a legacy liability (petrol is consumed, not an asset)
      saving: results.transportSavings,
      link: 'https://ts.la/paul511330',
      color: 'blue',
    },
    // Gas Conversion - Hot Water
    {
      name: 'Heat Pump Hot Water',
      cost: results.hotWaterSavings > 0 ? 3500 : 0,
      liability: results.liabilityCosts.hotWater,
      saving: results.hotWaterSavings,
      link: null,
      color: 'orange',
    },
    // Gas Conversion - Heating
    {
      name: 'Reverse Cycle Heating',
      cost: results.heatingSavings > 0 
        ? (results.currentHeatingType === 'rc' ? 0 : REVERSE_CYCLE_INSTALL_COST)
        : 0,
      liability: results.liabilityCosts.heating,
      saving: results.heatingSavings,
      link: null,
      color: 'orange',
    },
    // Gas Conversion - Cooking
    {
      name: 'Induction Cooktop',
      cost: results.cookingSavings > 0 ? 2000 : 0,
      liability: results.liabilityCosts.cooking,
      saving: results.cookingSavings,
      link: null,
      color: 'orange',
    },
    // Gas Disconnection Bonus
    {
      name: 'Gas Supply Elimination',
      cost: 0,
      liability: 0,
      saving: results.gasDisconnectionBonus,
      link: null,
      color: 'orange',
      description: 'Annual supply charge savings after removing all gas appliances',
    },
    {
      name: 'Variable Speed Pool Pump',
      cost: 1500,
      liability: results.liabilityCosts.pool,
      saving: results.poolPumpSavings,
      link: null,
      color: 'cyan',
    },
    {
      name: 'Heat Pump Dryer',
      cost: 1200,
      liability: 0, // Dryer liability not calculated (not critical)
      saving: results.hpDryerSavings,
      link: null,
      color: 'purple',
    },
    {
      name: 'Draught Proofing',
      cost: 300,
      liability: 0, // Gap sealing doesn't replace anything
      saving: results.gapSealingSavings,
      link: null,
      color: 'teal',
    },
  ].filter(s => s.saving > 0);

  return (
    <div className="overflow-x-auto">
      {results.gridPriceWarning && (
        <div className="mb-4 bg-amber-50 border-l-4 border-amber-500 p-3 rounded">
          <p className="text-sm text-amber-800">
            ⚠️ <strong>Warning:</strong> {results.gridPriceWarning}
          </p>
        </div>
      )}
      
      {/* Gas Disconnection Badge */}
      {results.gasDisconnected && (
        <div className="mb-4 bg-emerald-50 border-l-4 border-emerald-500 p-3 rounded">
          <p className="text-sm text-emerald-800">
            ✅ <strong>Gas Supply Eliminated:</strong> You've upgraded all gas appliances! Saving an additional $350/year in supply charges.
          </p>
        </div>
      )}
      
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-slate-100">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-widest">
              Strategy
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-widest">
              Upfront Cost
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-widest">
              <Tooltip content="10-year cost if you keep the old system. Shows the hidden cost of not upgrading.">
                <span>10-Yr Liability</span>
              </Tooltip>
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-widest">
              <Tooltip content="Estimated based on current energy rates. Subject to change by retailers.">
                <span>Annual Saving (Est.)</span>
              </Tooltip>
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-widest">
              <Tooltip content="Approximate time to recover initial investment. Assumes 4% energy inflation per AEMO ISP 2024.">
                <span>Payback (Est.)</span>
              </Tooltip>
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-slate-400 uppercase tracking-widest">
              Action
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {strategies.map((strategy, idx) => {
            const payback = strategy.saving > 0 ? strategy.cost / strategy.saving : 999;
            const colorMap: Record<string, string> = {
              emerald: 'text-emerald-600',
              yellow: 'text-yellow-600',
              blue: 'text-blue-600',
              orange: 'text-orange-600',
              cyan: 'text-cyan-600',
              purple: 'text-purple-600',
              teal: 'text-teal-600',
            };
            
            return (
              <tr key={idx} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {strategy.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-700">
                  {formatCurrency(strategy.cost)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-rose-600 font-medium">
                  {strategy.liability > 0 ? formatCurrency(strategy.liability) : '—'}
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-semibold ${colorMap[strategy.color]}`}>
                  {formatCurrency(strategy.saving)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-700 font-semibold">
                  {formatYears(payback)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                  {strategy.link ? (
                    <a
                      href={strategy.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-3 py-1 rounded-md text-white font-medium transition-colors hover:opacity-90"
                      style={{
                        backgroundColor: strategy.color === 'emerald' ? '#059669' : 
                                       strategy.color === 'blue' ? '#2563eb' : '#6b7280'
                      }}
                    >
                      Get Started
                    </a>
                  ) : (
                    <span className="text-gray-400 text-xs">—</span>
                  )}
                </td>
              </tr>
            );
          })}
          <tr className="bg-slate-800 text-white font-bold">
            <td className="px-6 py-4 whitespace-nowrap text-sm">
              Total Optimized Strategy
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
              {formatCurrency(results.systemCost)}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
              {formatCurrency(
                results.liabilityCosts.hotWater + 
                results.liabilityCosts.heating + 
                results.liabilityCosts.cooking + 
                results.liabilityCosts.pool
              )}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
              {formatCurrency(results.totalSavings)}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
              {formatYears(results.roiYears)}
            </td>
            <td></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};
