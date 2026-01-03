import { useHashState } from './hooks/useHashState';
import { useEnergyMath } from './hooks/useEnergyMath';
import { InputSliders } from './components/InputSliders';
import { ROITable } from './components/ROITable';
import { CostGraph } from './components/CostGraph';
import { ReferralLinks } from './components/ReferralLinks';
import { Zap } from 'lucide-react';

function App() {
  const [state, updateState] = useHashState();
  const results = useEnergyMath(state);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-10">
          <div className="flex items-center justify-center space-x-3 mb-3">
            <Zap className="w-10 h-10 text-emerald-400" />
            <h1 className="text-5xl font-bold text-white">
              EnergyHome<span className="text-emerald-400">.OS</span>
            </h1>
          </div>
          <p className="text-xl text-slate-300">
            Australian Solar/Battery/EV Arbitrage ROI Dashboard
          </p>
          <p className="text-sm text-slate-400 mt-2">
            Hacker's Guide to Energy Independence
          </p>
        </header>

        <div className="space-y-6">
          {/* Input Controls */}
          <div className="bg-white rounded-xl shadow-2xl p-6">
            <h2 className="text-2xl font-semibold text-slate-800 mb-4 flex items-center">
              <span className="w-2 h-8 bg-emerald-500 rounded mr-3"></span>
              Your Energy Setup
            </h2>
            <InputSliders state={state} updateState={updateState} />
          </div>

          {/* ROI Leaderboard */}
          <div className="bg-white rounded-xl shadow-2xl p-6">
            <h2 className="text-2xl font-semibold text-slate-800 mb-4 flex items-center">
              <span className="w-2 h-8 bg-amber-500 rounded mr-3"></span>
              ROI Leaderboard
            </h2>
            <ROITable results={results} />
          </div>

          {/* Cost Graph - The Race */}
          <div className="bg-white rounded-xl shadow-2xl p-6">
            <h2 className="text-2xl font-semibold text-slate-800 mb-2 flex items-center">
              <span className="w-2 h-8 bg-blue-500 rounded mr-3"></span>
              15-Year Cost Race
            </h2>
            <p className="text-sm text-slate-600 mb-4">
              Watch the crossover point where your investment pays off
            </p>
            <CostGraph results={results} />
          </div>

          {/* Referral Links */}
          <ReferralLinks />
        </div>

        {/* Footer */}
        <footer className="text-center mt-10 text-slate-400 text-sm">
          <p className="mb-2">
            Built with Vite + React + Tailwind + Recharts
          </p>
          <p className="text-xs text-slate-500">
            Share your scenario via URL • All calculations run locally in browser
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;
