import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface CostGraphProps {
  results: {
    legacyCosts: number[];
    hackedCosts: number[];
  };
}

export const CostGraph = ({ results }: CostGraphProps) => {
  const data = results.legacyCosts.map((legacy, year) => ({
    year,
    legacy,
    hacked: results.hackedCosts[year],
  }));

  const formatCurrency = (value: number) => {
    return `$${(value / 1000).toFixed(0)}k`;
  };

  return (
    <div className="w-full">
      <div className="mb-2 text-xs text-slate-600 bg-slate-50 p-2 rounded">
        * Estimates based on 3% inflation and AEMO 2024 ISP projections. Hover over chart for details.
      </div>
      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorLegacy" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6b7280" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#6b7280" stopOpacity={0.1} />
            </linearGradient>
            <linearGradient id="colorHacked" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="year" 
            label={{ value: 'Years', position: 'insideBottom', offset: -5 }}
            stroke="#6b7280"
          />
          <YAxis 
            tickFormatter={formatCurrency}
            label={{ value: 'Cumulative Cost', angle: -90, position: 'insideLeft' }}
            stroke="#6b7280"
          />
          <Tooltip 
            formatter={(value: number | undefined) => value ? `~$${value.toLocaleString()}` : '~$0'}
            contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '0.5rem', color: '#fff' }}
            labelFormatter={(label) => `Year ${label}`}
          />
          <Legend />
          <Area
            type="monotone"
            dataKey="legacy"
            stroke="#6b7280"
            fillOpacity={1}
            fill="url(#colorLegacy)"
            name="Legacy Path"
            strokeWidth={2}
          />
          <Area
            type="monotone"
            dataKey="hacked"
            stroke="#10b981"
            fillOpacity={1}
            fill="url(#colorHacked)"
            name="Optimized Path"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
      </div>
    </div>
  );
};
