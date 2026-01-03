import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AssumptionsPanel } from './AssumptionsPanel';

describe('AssumptionsPanel', () => {
  const mockAssumptions = [
    { name: 'Gas Ducted Heating', cost: 400, icon: 'Wind' },
    { name: 'Gas Hot Water', cost: 280, icon: 'Droplets' },
    { name: 'Single Speed Pool Pump', cost: 1300, icon: 'Waves' },
  ];

  const mockApplianceProfile = {
    hasGasHeating: true,
    hasGasWater: true,
    hasGasCooking: false,
    hasPool: true,
    hasOldDryer: true,
  };

  const mockUpdateProfile = vi.fn();

  it('should display the pool tax warning when hasPool is true', () => {
    render(
      <AssumptionsPanel
        assumptions={mockAssumptions}
        applianceProfile={mockApplianceProfile}
        updateProfile={mockUpdateProfile}
      />
    );

    expect(screen.getByText(/Priority Alert: The "Pool Tax"/)).toBeInTheDocument();
    expect(screen.getByText(/Your pool is burning more cash than your car/)).toBeInTheDocument();
  });

  it('should not display the pool tax warning when hasPool is false', () => {
    render(
      <AssumptionsPanel
        assumptions={mockAssumptions}
        applianceProfile={{ ...mockApplianceProfile, hasPool: false }}
        updateProfile={mockUpdateProfile}
      />
    );

    expect(screen.queryByText(/Priority Alert: The "Pool Tax"/)).not.toBeInTheDocument();
  });

  it('should display appliance toggles with correct status', () => {
    render(
      <AssumptionsPanel
        assumptions={mockAssumptions}
        applianceProfile={mockApplianceProfile}
        updateProfile={mockUpdateProfile}
      />
    );

    // Check for ON toggles
    expect(screen.getByText('Gas Heating')).toBeInTheDocument();
    expect(screen.getByText('Pool Pump')).toBeInTheDocument();
    
    // Verify ON badges exist
    const onBadges = screen.getAllByText('ON');
    expect(onBadges.length).toBeGreaterThan(0);
  });

  it('should call updateProfile when an appliance toggle is clicked', () => {
    render(
      <AssumptionsPanel
        assumptions={mockAssumptions}
        applianceProfile={mockApplianceProfile}
        updateProfile={mockUpdateProfile}
      />
    );

    const gasHeatingButton = screen.getByRole('button', { name: /Gas Heating/ });
    fireEvent.click(gasHeatingButton);

    expect(mockUpdateProfile).toHaveBeenCalledWith({ hasGasHeating: false });
  });

  it('should display cost information for active appliances', () => {
    render(
      <AssumptionsPanel
        assumptions={mockAssumptions}
        applianceProfile={mockApplianceProfile}
        updateProfile={mockUpdateProfile}
      />
    );

    expect(screen.getByText('~$400/yr')).toBeInTheDocument();
    expect(screen.getByText('~$280/yr')).toBeInTheDocument();
    expect(screen.getByText('~$1,300/yr')).toBeInTheDocument();
  });
});
