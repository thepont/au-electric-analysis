import { Wind, Droplets, Flame, Waves, Shirt, AlertTriangle } from 'lucide-react';

// Pool pump constants
const POOL_PUMP_ANNUAL_KWH = 4000;
const EV_ANNUAL_KWH_COMPARISON = 2700; // ~15,000km driving
const POOL_PUMP_UPGRADE_PAYBACK_YEARS = 1.6;

interface ApplianceAssumption {
  name: string;
  cost: number;
  icon: string;
}

interface AssumptionsPanelProps {
  assumptions: ApplianceAssumption[];
  applianceProfile: {
    hasGasHeating: boolean;
    hasGasWater: boolean;
    hasGasCooking: boolean;
    hasPool: boolean;
    hasOldDryer: boolean;
  };
  updateProfile: (updates: Partial<AssumptionsPanelProps['applianceProfile']>) => void;
}

const iconMap = {
  Wind: Wind,
  Droplets: Droplets,
  Flame: Flame,
  Waves: Waves,
  Shirt: Shirt,
};

export const AssumptionsPanel = ({ assumptions, applianceProfile, updateProfile }: AssumptionsPanelProps) => {
  const formatCurrency = (amount: number) => {
    return `~$${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}/yr`;
  };

  const applianceToggles = [
    { key: 'hasGasHeating', label: 'Gas Heating', assumption: assumptions.find(a => a.name === 'Gas Ducted Heating') },
    { key: 'hasGasWater', label: 'Gas Hot Water', assumption: assumptions.find(a => a.name === 'Gas Hot Water') },
    { key: 'hasGasCooking', label: 'Gas Cooktop', assumption: assumptions.find(a => a.name === 'Gas Cooktop') },
    { key: 'hasPool', label: 'Pool Pump', assumption: assumptions.find(a => a.name === 'Single Speed Pool Pump') },
    { key: 'hasOldDryer', label: 'Vented Dryer', assumption: assumptions.find(a => a.name === 'Vented Dryer') },
  ];

  return (
    <div className="space-y-4">
      {/* Pool Tax Warning */}
      {applianceProfile.hasPool && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-lg font-bold text-red-900 mb-1">
                ⚠️ Priority Alert: The "Pool Tax"
              </h4>
              <p className="text-sm text-red-800 leading-relaxed">
                Your pool is burning more cash than your car. A standard single-speed pump consumes ~{POOL_PUMP_ANNUAL_KWH.toLocaleString()} kWh/year 
                (almost double what an EV uses at ~{EV_ANNUAL_KWH_COMPARISON.toLocaleString()} kWh/year). <strong>Fix the pump BEFORE you buy a battery.</strong> 
                Upgrading to a variable speed pump has the fastest payback in home energy (~{POOL_PUMP_UPGRADE_PAYBACK_YEARS} years).
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Assumptions Description */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
        <p className="text-sm text-slate-600 leading-relaxed">
          Based on your bills, we've estimated your appliance costs using typical Australian usage patterns. 
          <strong> Toggle OFF any appliances you don't have</strong> to refine your savings calculations.
        </p>
      </div>

      {/* Appliance Toggles */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
        {applianceToggles.map(({ key, label, assumption }) => {
          const isActive = applianceProfile[key as keyof typeof applianceProfile];
          const IconComponent = assumption ? iconMap[assumption.icon as keyof typeof iconMap] : null;
          
          return (
            <button
              key={key}
              onClick={() => updateProfile({ [key]: !isActive })}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                isActive
                  ? 'border-emerald-500 bg-emerald-50'
                  : 'border-gray-300 bg-white hover:border-gray-400 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  {IconComponent && (
                    <IconComponent 
                      className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                        isActive ? 'text-emerald-600' : 'text-gray-400'
                      }`} 
                    />
                  )}
                  <div>
                    <div className={`font-medium text-sm ${
                      isActive ? 'text-emerald-900' : 'text-gray-600'
                    }`}>
                      {label}
                    </div>
                    {assumption && isActive && (
                      <div className="text-xs text-emerald-700 mt-1">
                        {formatCurrency(assumption.cost)}
                      </div>
                    )}
                  </div>
                </div>
                <div className={`text-xs font-medium px-2 py-1 rounded ${
                  isActive 
                    ? 'bg-emerald-200 text-emerald-800' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {isActive ? 'ON' : 'OFF'}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
