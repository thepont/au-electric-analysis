import { ExternalLink } from 'lucide-react';

export const ReferralLinks = () => {
  return (
    <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-lg shadow-lg p-6 text-white">
      <h2 className="text-2xl font-semibold mb-4">
        Get Started with Partner Programs
      </h2>
      <div className="grid md:grid-cols-2 gap-4">
        {/* OVO Energy */}
        <a
          href="https://www.ovoenergy.com.au/refer/paul8789"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between p-4 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
        >
          <div>
            <h3 className="font-bold text-lg text-emerald-400">OVO Free 3 Plan</h3>
            <p className="text-sm text-gray-300">
              Free electricity 11am-2pm daily
            </p>
          </div>
          <ExternalLink className="w-5 h-5 text-emerald-400" />
        </a>

        {/* Tesla */}
        <a
          href="https://ts.la/paul511330"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between p-4 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
        >
          <div>
            <h3 className="font-bold text-lg text-amber-400">Tesla EV</h3>
            <p className="text-sm text-gray-300">
              Electric vehicle & energy solutions
            </p>
          </div>
          <ExternalLink className="w-5 h-5 text-amber-400" />
        </a>
      </div>
    </div>
  );
};
