import { Droplets, Wind, Flame, Waves } from 'lucide-react';

interface CurrentHardwareCardProps {
  currentSetup: {
    hotWater: 'gas' | 'resistive' | 'heatpump';
    heating: 'gas' | 'resistive' | 'rc' | 'none';
    cooking: 'gas' | 'induction';
    pool: 'none' | 'single_speed' | 'variable_speed';
  };
  updateSetup: (updates: Partial<CurrentHardwareCardProps['currentSetup']>) => void;
}

export const CurrentHardwareCard = ({ currentSetup, updateSetup }: CurrentHardwareCardProps) => {
  return (
    <div className="space-y-6">
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-4">
        <p className="text-sm text-slate-600 leading-relaxed">
          <strong>Tell us what you currently have.</strong> This helps us calculate accurate savings based on what you're replacing.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Hot Water */}
        <div className="space-y-2">
          <label className="flex items-center space-x-2 text-sm font-medium text-slate-700">
            <Droplets className="w-4 h-4 text-blue-600" />
            <span>Hot Water</span>
          </label>
          <select
            value={currentSetup.hotWater}
            onChange={(e) => updateSetup({ hotWater: e.target.value as 'gas' | 'resistive' | 'heatpump' })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          >
            <option value="gas">Gas</option>
            <option value="resistive">Electric Resistive</option>
            <option value="heatpump">Heat Pump (already upgraded)</option>
          </select>
        </div>

        {/* Heating */}
        <div className="space-y-2">
          <label className="flex items-center space-x-2 text-sm font-medium text-slate-700">
            <Wind className="w-4 h-4 text-orange-600" />
            <span>Heating</span>
          </label>
          <select
            value={currentSetup.heating}
            onChange={(e) => updateSetup({ heating: e.target.value as 'gas' | 'resistive' | 'rc' | 'none' })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
          >
            <option value="gas">Gas Ducted</option>
            <option value="resistive">Electric Resistive</option>
            <option value="rc">Reverse Cycle (already upgraded)</option>
            <option value="none">No Heating</option>
          </select>
        </div>

        {/* Cooking */}
        <div className="space-y-2">
          <label className="flex items-center space-x-2 text-sm font-medium text-slate-700">
            <Flame className="w-4 h-4 text-red-600" />
            <span>Cooking</span>
          </label>
          <select
            value={currentSetup.cooking}
            onChange={(e) => updateSetup({ cooking: e.target.value as 'gas' | 'induction' })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white"
          >
            <option value="gas">Gas Cooktop</option>
            <option value="induction">Induction (already upgraded)</option>
          </select>
        </div>

        {/* Pool */}
        <div className="space-y-2">
          <label className="flex items-center space-x-2 text-sm font-medium text-slate-700">
            <Waves className="w-4 h-4 text-cyan-600" />
            <span>Pool Pump</span>
          </label>
          <select
            value={currentSetup.pool}
            onChange={(e) => updateSetup({ pool: e.target.value as 'none' | 'single_speed' | 'variable_speed' })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white"
          >
            <option value="none">No Pool</option>
            <option value="single_speed">Single Speed Pump</option>
            <option value="variable_speed">Variable Speed (already upgraded)</option>
          </select>
        </div>
      </div>
    </div>
  );
};
