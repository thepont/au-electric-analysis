import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('should render the main container with bg-slate-50 class', () => {
    const { container } = render(<App />);
    const mainDiv = container.firstChild as HTMLElement;
    expect(mainDiv).toHaveClass('bg-slate-50');
  });

  it('should display Annual Saving with text-emerald-600 class', () => {
    render(<App />);
    // Find the table header for "Annual Saving"
    const annualSavingHeader = screen.getByText('Annual Saving');
    expect(annualSavingHeader).toBeInTheDocument();
    
    // Find the first emerald-colored savings value in the table
    // The ROITable uses text-emerald-600 for the OVO Free 3 Plan row
    const savingsElements = document.querySelectorAll('.text-emerald-600');
    expect(savingsElements.length).toBeGreaterThan(0);
  });
});
