import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

describe('App', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  it('should render the main container with bg-slate-50 class', () => {
    const { container } = render(<App />);
    const mainDiv = container.firstChild as HTMLElement;
    expect(mainDiv).toHaveClass('bg-slate-50');
  });

  it('should display Annual Saving with text-emerald-600 class after accepting disclaimer', () => {
    render(<App />);
    
    // Accept the disclaimer first
    const acceptButton = screen.getByText('I Understand and Accept');
    fireEvent.click(acceptButton);
    
    // Find the table header for "Annual Saving (Est.)"
    const annualSavingHeader = screen.getByText(/Annual Saving/);
    expect(annualSavingHeader).toBeInTheDocument();
    
    // Find the first emerald-colored savings value in the table
    // The ROITable uses text-emerald-600 for the OVO Free 3 Plan row
    const savingsElements = document.querySelectorAll('.text-emerald-600');
    expect(savingsElements.length).toBeGreaterThan(0);
  });
});
