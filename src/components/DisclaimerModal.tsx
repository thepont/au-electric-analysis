import { AlertTriangle } from 'lucide-react';
import { useEffect, useState } from 'react';

interface DisclaimerModalProps {
  onAccept: () => void;
}

export const DisclaimerModal = ({ onAccept }: DisclaimerModalProps) => {
  // Initialize state - check localStorage only once
  const [isOpen, setIsOpen] = useState(() => {
    const hasAccepted = localStorage.getItem('disclaimerAccepted') === 'true';
    return !hasAccepted;
  });

  // Call onAccept in useEffect if already accepted
  useEffect(() => {
    const hasAccepted = localStorage.getItem('disclaimerAccepted') === 'true';
    if (hasAccepted) {
      onAccept();
    }
  }, [onAccept]);

  const handleAccept = () => {
    localStorage.setItem('disclaimerAccepted', 'true');
    setIsOpen(false);
    onAccept();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center space-x-3 mb-4">
            <AlertTriangle className="w-8 h-8 text-amber-500" />
            <h2 className="text-2xl font-bold text-slate-800">Terms of Use</h2>
          </div>

          {/* Content */}
          <div className="space-y-4 text-slate-700">
            <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded">
              <h3 className="font-semibold text-amber-800 mb-2">⚠️ Not Financial Advice</h3>
              <p className="text-sm">
                This tool is for <strong>educational purposes only</strong>. The calculations and 
                projections provided are estimates and should not be considered financial, investment, 
                or professional advice.
              </p>
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
              <h3 className="font-semibold text-blue-800 mb-2">📊 Market Volatility</h3>
              <p className="text-sm">
                Energy prices (currently assumed at $0.58/kWh peak rate) are <strong>subject to change</strong> by 
                retailers at any time. Actual costs may vary significantly based on your location, 
                retailer, and market conditions.
              </p>
            </div>

            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
              <h3 className="font-semibold text-red-800 mb-2">🚫 No Guarantee</h3>
              <p className="text-sm">
                We <strong>do not guarantee</strong> that your actual electricity bill, savings, or return on 
                investment will match these figures. Results depend on weather patterns, individual usage 
                patterns, system performance, and future tariff changes.
              </p>
            </div>

            <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded">
              <h3 className="font-semibold text-emerald-800 mb-2">💼 Affiliate Disclosure</h3>
              <p className="text-sm">
                We may earn a commission if you use the OVO Energy or Tesla referral links provided 
                in this application. This does not affect the accuracy of the calculations or the 
                information presented.
              </p>
            </div>

            <div className="bg-slate-100 p-4 rounded text-xs text-slate-600">
              <p className="font-semibold mb-2">Data Sources & Assumptions:</p>
              <p>
                Calculations based on AEMO 2024 ISP 'Step Change' scenario and CSIRO GenCost 2024-25. 
                Actual savings will vary based on weather, usage patterns, and tariff changes. 
                Energy inflation assumed at 4% per annum based on AEMO ISP 2024 projections.
              </p>
            </div>
          </div>

          {/* Accept Button */}
          <div className="mt-6">
            <button
              onClick={handleAccept}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              I Understand and Accept
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
