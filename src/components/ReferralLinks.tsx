import { ExternalLink } from 'lucide-react';

export const ReferralLinks = () => {
  return (
    <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 p-8">
      <h2 className="text-2xl font-semibold text-slate-900 tracking-tighter mb-4">
        Get Started with Partner Programs
      </h2>
      <div className="grid md:grid-cols-2 gap-4">
        {/* OVO Energy */}
        <a
          href="https://www.ovoenergy.com.au/refer/paul8789"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
        >
          <div>
            <h3 className="font-bold text-lg text-emerald-600">OVO Free 3 Plan</h3>
            <p className="text-sm text-slate-400">
              Free electricity 11am-2pm daily
            </p>
          </div>
          <ExternalLink className="w-5 h-5 text-emerald-600" />
        </a>

        {/* Tesla */}
        <a
          href="https://ts.la/paul511330"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
        >
          <div>
            <h3 className="font-bold text-lg text-amber-500">Tesla EV</h3>
            <p className="text-sm text-slate-400">
              Electric vehicle & energy solutions
            </p>
          </div>
          <ExternalLink className="w-5 h-5 text-amber-500" />
        </a>
      </div>
    </div>
  );
};
