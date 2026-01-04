import { useHashState } from './hooks/useHashState';
import { useEnergyMath } from './hooks/useEnergyMath';
import { InputSliders } from './components/InputSliders';
import { AssumptionsPanel } from './components/AssumptionsPanel';
import { ROITable } from './components/ROITable';
import { CostGraph } from './components/CostGraph';
import { ReferralLinks } from './components/ReferralLinks';
import { DisclaimerModal } from './components/DisclaimerModal';
import { LoadGauge } from './components/LoadGauge';
import { CurrentHardwareCard } from './components/CurrentHardwareCard';
import { Zap } from 'lucide-react';
import { useState } from 'react';

function App() {
  const [state, updateState] = useHashState();
  const results = useEnergyMath(state);
  const [hasAcceptedDisclaimer, setHasAcceptedDisclaimer] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      <DisclaimerModal onAccept={() => setHasAcceptedDisclaimer(true)} />
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="backdrop-blur-xl bg-white/80 sticky top-0 z-10 -mx-4 px-4 py-6 mb-10 border-b border-slate-200">
          <div className="max-w-7xl mx-auto text-center">
            <div className="flex items-center justify-center space-x-3 mb-3">
              <Zap className="w-10 h-10 text-amber-500" />
              <h1 className="text-5xl font-bold text-slate-900 tracking-tighter">
                EnergyHome<span className="text-emerald-600">.OS</span>
              </h1>
            </div>
            <p className="text-xl text-slate-900">
              Australian Solar/Battery/EV Arbitrage ROI Dashboard
            </p>
            <p className="text-sm text-slate-400 mt-2 uppercase tracking-widest">
              Hacker's Guide to Energy Independence
            </p>
          </div>
        </header>

        <div className="space-y-6">
          {/* Input Controls */}
          <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 p-8">
            <h2 className="text-2xl font-semibold text-slate-900 tracking-tighter mb-4 flex items-center">
              <span className="w-2 h-8 bg-emerald-600 rounded mr-3"></span>
              Your Energy Setup
            </h2>
            <InputSliders state={state} updateState={updateState} />
          </div>

          {/* Current Hardware Card */}
          <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 p-8">
            <h2 className="text-2xl font-semibold text-slate-900 tracking-tighter mb-4 flex items-center">
              <span className="w-2 h-8 bg-purple-600 rounded mr-3"></span>
              Current Hardware
            </h2>
            <CurrentHardwareCard
              currentSetup={state.currentSetup}
              updateSetup={(updates) => updateState({ currentSetup: { ...state.currentSetup, ...updates } })}
            />
          </div>

          {/* Load Gauge */}
          {hasAcceptedDisclaimer && (
            <LoadGauge
              peakLoad={results.peakLoad}
              maxKw={results.maxKw}
              isBreakerTripped={results.isBreakerTripped}
              wastedKwh={results.wastedKwh}
              serviceFuse={state.serviceFuse}
            />
          )}

          {/* Assumptions Panel */}
          {hasAcceptedDisclaimer && (
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 p-8">
              <h2 className="text-2xl font-semibold text-slate-900 tracking-tighter mb-4 flex items-center">
                <span className="w-2 h-8 bg-blue-600 rounded mr-3"></span>
                Your Current Setup (Estimated)
              </h2>
              <AssumptionsPanel 
                assumptions={results.assumptions}
                applianceProfile={{
                  hasGasHeating: state.hasGasHeating,
                  hasGasWater: state.hasGasWater,
                  hasGasCooking: state.hasGasCooking,
                  hasPool: state.hasPool,
                  hasOldDryer: state.hasOldDryer,
                }}
                updateProfile={(updates) => updateState(updates)}
              />
            </div>
          )}

          {/* ROI Leaderboard */}
          {hasAcceptedDisclaimer && (
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 p-8">
              <h2 className="text-2xl font-semibold text-slate-900 tracking-tighter mb-4 flex items-center">
                <span className="w-2 h-8 bg-amber-500 rounded mr-3"></span>
                ROI Leaderboard
              </h2>
              <ROITable results={results} />
            </div>
          )}

          {/* Cost Graph - The Race */}
          {hasAcceptedDisclaimer && (
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 p-8">
              <h2 className="text-2xl font-semibold text-slate-900 tracking-tighter mb-2 flex items-center">
                <span className="w-2 h-8 bg-slate-900 rounded mr-3"></span>
                15-Year Cost Race
              </h2>
              <p className="text-sm text-slate-400 mb-4 uppercase tracking-widest">
                Watch the crossover point where your investment pays off
              </p>
              <CostGraph results={results} />
            </div>
          )}

          {/* Referral Links */}
          <ReferralLinks />
        </div>

        {/* Footer */}
        <footer className="mt-10 text-slate-400">
          {/* Mandatory Disclaimer */}
          <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 p-6 mb-4">
            <p className="text-sm text-center text-slate-900">
              <strong>⚖️ Legal Disclaimer:</strong> Calculations based on AEMO 2024 ISP 'Step Change' scenario 
              and CSIRO GenCost 2024-25. Actual savings will vary based on weather, usage patterns, and tariff changes. 
              All figures are estimates and should not be considered financial advice.
            </p>
          </div>
          
          <div className="text-center text-sm">
            <p className="mb-2">
              Built with Vite + React + Tailwind + Recharts
            </p>
            <p className="text-xs text-slate-400 uppercase tracking-widest">
              Share your scenario via URL • All calculations run locally in browser
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;
