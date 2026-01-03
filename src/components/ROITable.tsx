import { Tooltip } from './Tooltip';

// Estimation prefix for compliance with ACL s18
const ESTIMATION_PREFIX = '~';

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
    {
      name: 'OVO Free 3 Plan',
      cost: 0,
      saving: results.batSavings,
      link: 'https://www.ovoenergy.com.au/refer/paul8789',
      color: 'emerald',
    },
    {
      name: 'Solar System',
      cost: results.systemCost > 0 ? Math.round(results.solarSavings / results.totalSavings * results.systemCost) : 0,
      saving: results.solarSavings,
      link: null,
      color: 'yellow',
    },
    {
      name: 'Tesla EV Switch',
      cost: 15000,
      saving: results.transportSavings,
      link: 'https://ts.la/paul511330',
      color: 'blue',
    },
    {
      name: 'Gas Conversion',
      cost: results.gasSavings > 0 ? 5500 : 0,
      saving: results.gasSavings,
      link: null,
      color: 'orange',
    },
    {
      name: 'Variable Speed Pool Pump',
      cost: 1500,
      saving: results.poolPumpSavings,
      link: null,
      color: 'cyan',
    },
    {
      name: 'Heat Pump Dryer',
      cost: 1200,
      saving: results.hpDryerSavings,
      link: null,
      color: 'purple',
    },
    {
      name: 'Draught Proofing',
      cost: 300,
      saving: results.gapSealingSavings,
      link: null,
      color: 'teal',
    },
  ].filter(s => s.saving > 0 || s.name === 'OVO Free 3 Plan');

  return (
    <div className="overflow-x-auto">
      {results.gridPriceWarning && (
        <div className="mb-4 bg-amber-50 border-l-4 border-amber-500 p-3 rounded">
          <p className="text-sm text-amber-800">
            ⚠️ <strong>Warning:</strong> {results.gridPriceWarning}
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
