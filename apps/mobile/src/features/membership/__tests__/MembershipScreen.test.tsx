import { act, fireEvent, screen } from '@testing-library/react-native';

import { useScenarioStore } from '../../../lib/store/useScenarioStore';
import { resetScenarioStore } from '../../../test-fixtures/resetScenarioStore';
import { renderWithProviders } from '../../../test-utils';
import { MembershipScreen } from '../MembershipScreen';

describe('MembershipScreen', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    resetScenarioStore();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it('renders the curated membership destination for verified members', async () => {
    useScenarioStore.setState({ scenario: 'verified' });

    renderWithProviders(<MembershipScreen />);

    await act(async () => {
      jest.advanceTimersByTime(700);
    });

    expect(await screen.findByText('Stay inside the corridor between trips.')).toBeTruthy();
    expect(screen.getByText('Useful in Dubai')).toBeTruthy();
    expect(screen.getByText('Places that still matter')).toBeTruthy();
    expect(screen.getByText('Arrival supper')).toBeTruthy();
  });

  it('keeps the guest state sparse and aspirational', async () => {
    useScenarioStore.setState({ scenario: 'guest' });

    renderWithProviders(<MembershipScreen />);

    await act(async () => {
      jest.advanceTimersByTime(700);
    });

    expect(await screen.findByText('Guest')).toBeTruthy();
    expect(screen.getByText('Join the network')).toBeTruthy();
    expect(screen.getByText('Useful in Dubai')).toBeTruthy();
  });

  it('opens the saved perk from the membership action rail', async () => {
    useScenarioStore.setState({
      savedState: {
        perkIds: ['perk_1'],
        tripIds: ['next_trip_1'],
        venueIds: ['venue_1'],
      },
      scenario: 'verified',
    });

    renderWithProviders(<MembershipScreen />);

    await act(async () => {
      jest.advanceTimersByTime(700);
    });

    expect(await screen.findByText('Open saved perk')).toBeTruthy();

    await act(async () => {
      fireEvent.press(screen.getByText('Open saved perk'));
    });

    expect((await screen.findAllByText('Member perk')).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Arrival supper').length).toBeGreaterThanOrEqual(1);
  });
});
