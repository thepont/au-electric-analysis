import type { ReactNode } from 'react';
import { useState } from 'react';
import { Info } from 'lucide-react';

interface TooltipProps {
  content: string;
  children: ReactNode;
}

export const Tooltip = ({ content, children }: TooltipProps) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        className="cursor-help inline-flex items-center"
      >
        {children}
        <Info className="w-4 h-4 ml-1 text-slate-400" />
      </div>
      {isVisible && (
        <div className="absolute z-10 w-64 p-2 text-xs text-white bg-slate-800 rounded-lg shadow-lg -top-2 left-full ml-2 pointer-events-none">
          <div className="absolute w-2 h-2 bg-slate-800 transform rotate-45 -left-1 top-3"></div>
          {content}
        </div>
      )}
    </div>
  );
};
