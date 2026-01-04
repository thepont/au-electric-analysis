import {
  ComposedChart,
  Area,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface DailyChartProps {
  data: Array<{
    hour: number;
    hourLabel: string;
    solar: number;
    consumption: number;
    baseLoad: number;
    heatingLoad: number;
    shiftableLoad: number;
    batterySoCPercent: number;
    gridImport: number;
    temperature: number;
  }>;
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: {
      hourLabel: string;
      solar: number;
      consumption: number;
      baseLoad: number;
      heatingLoad: number;
      shiftableLoad: number;
      gridImport: number;
      batterySoCPercent: number;
      temperature: number;
    };
  }>;
}

const CustomTooltip = ({ active, payload }: TooltipProps) => {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;
  
  return (
    <div className="bg-white p-4 rounded-lg shadow-lg border border-slate-200">
      <p className="font-semibold text-slate-900 mb-2">{data.hourLabel}</p>
      <div className="space-y-1 text-sm">
        <p className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-orange-500"></span>
          <span className="text-slate-600">Solar:</span>
          <span className="font-medium text-slate-900">{data.solar.toFixed(2)} kW</span>
        </p>
        <p className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-blue-500"></span>
          <span className="text-slate-600">Consumption:</span>
          <span className="font-medium text-slate-900">{data.consumption.toFixed(2)} kW</span>
        </p>
        <p className="flex items-center gap-2 ml-5 text-xs">
          <span className="text-slate-500">Base:</span>
          <span className="text-slate-700">{data.baseLoad.toFixed(2)} kW</span>
        </p>
        <p className="flex items-center gap-2 ml-5 text-xs">
          <span className="text-slate-500">Heating:</span>
          <span className="text-slate-700">{data.heatingLoad.toFixed(2)} kW</span>
        </p>
        <p className="flex items-center gap-2 ml-5 text-xs">
          <span className="text-slate-500">Shiftable:</span>
          <span className="text-slate-700">{data.shiftableLoad.toFixed(2)} kW</span>
        </p>
        <p className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-red-500"></span>
          <span className="text-slate-600">Grid Import:</span>
          <span className="font-medium text-slate-900">{data.gridImport.toFixed(2)} kW</span>
        </p>
        <p className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
          <span className="text-slate-600">Battery:</span>
          <span className="font-medium text-slate-900">{data.batterySoCPercent.toFixed(1)}%</span>
        </p>
        <p className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-slate-400"></span>
          <span className="text-slate-600">Temperature:</span>
          <span className="font-medium text-slate-900">{data.temperature.toFixed(1)}°C</span>
        </p>
      </div>
    </div>
  );
};

export const DailyChart = ({ data }: DailyChartProps) => {
  return (
    <ResponsiveContainer width="100%" height={500}>
      <ComposedChart
        data={data}
        margin={{ top: 20, right: 60, bottom: 20, left: 20 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        
        {/* X-Axis: Hours */}
        <XAxis
          dataKey="hourLabel"
          stroke="#64748b"
          tick={{ fill: '#64748b', fontSize: 12 }}
          tickLine={{ stroke: '#94a3b8' }}
        />
        
        {/* Left Y-Axis: Power (kW) */}
        <YAxis
          yAxisId="power"
          stroke="#64748b"
          tick={{ fill: '#64748b', fontSize: 12 }}
          tickLine={{ stroke: '#94a3b8' }}
          label={{ 
            value: 'Power (kW)', 
            angle: -90, 
            position: 'insideLeft',
            style: { fill: '#64748b', fontSize: 14, fontWeight: 600 }
          }}
        />
        
        {/* Right Y-Axis: Battery % and Temperature */}
        <YAxis
          yAxisId="percent"
          orientation="right"
          stroke="#10b981"
          tick={{ fill: '#10b981', fontSize: 12 }}
          tickLine={{ stroke: '#10b981' }}
          domain={[0, 100]}
          label={{ 
            value: 'Battery SoC (%) / Temp (°C)', 
            angle: 90, 
            position: 'insideRight',
            style: { fill: '#10b981', fontSize: 14, fontWeight: 600 }
          }}
        />
        
        <Tooltip content={<CustomTooltip />} />
        
        <Legend 
          verticalAlign="top" 
          height={50}
          iconType="square"
          wrapperStyle={{ paddingBottom: '20px' }}
        />
        
        {/* Temperature Line (Faint Background) */}
        <Line
          yAxisId="percent"
          type="monotone"
          dataKey="temperature"
          stroke="#94a3b8"
          strokeWidth={1}
          strokeDasharray="5 5"
          dot={false}
          name="Indoor Temp (°C)"
          opacity={0.4}
        />
        
        {/* Solar Generation Area (Orange) */}
        <Area
          yAxisId="power"
          type="monotone"
          dataKey="solar"
          fill="#f97316"
          stroke="#ea580c"
          fillOpacity={0.5}
          strokeWidth={2}
          name="Solar Generation"
        />
        
        {/* Consumption Layers (Stacked Blue Areas) */}
        <Area
          yAxisId="power"
          type="monotone"
          dataKey="baseLoad"
          stackId="consumption"
          fill="#3b82f6"
          stroke="#2563eb"
          fillOpacity={0.3}
          strokeWidth={1}
          name="Base Load"
        />
        <Area
          yAxisId="power"
          type="monotone"
          dataKey="heatingLoad"
          stackId="consumption"
          fill="#1d4ed8"
          stroke="#1e40af"
          fillOpacity={0.4}
          strokeWidth={1}
          name="Heating/Cooling"
        />
        <Area
          yAxisId="power"
          type="monotone"
          dataKey="shiftableLoad"
          stackId="consumption"
          fill="#60a5fa"
          stroke="#3b82f6"
          fillOpacity={0.5}
          strokeWidth={1}
          name="Shiftable Loads (EV/Pool/HW)"
        />
        
        {/* Grid Import Bar (Red - The "Pain" Bar) */}
        <Bar
          yAxisId="power"
          dataKey="gridImport"
          fill="#ef4444"
          opacity={0.8}
          name="Grid Import (Pain!)"
        />
        
        {/* Battery State of Charge Line (Green) */}
        <Line
          yAxisId="percent"
          type="monotone"
          dataKey="batterySoCPercent"
          stroke="#10b981"
          strokeWidth={3}
          dot={false}
          name="Battery SoC (%)"
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
};
