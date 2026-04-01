import { act, screen } from '@testing-library/react-native';

import { useScenarioStore } from '../../../lib/store/useScenarioStore';
import { resetScenarioStore } from '../../../test-fixtures/resetScenarioStore';
import { renderWithProviders } from '../../../test-utils';
import { TripsScreen } from '../TripsScreen';

describe('TripsScreen', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    resetScenarioStore();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it('renders the guest trip briefing without turning into booking clutter', async () => {
    useScenarioStore.setState({ scenario: 'guest' });

    renderWithProviders(<TripsScreen />);

    await act(async () => {
      jest.advanceTimersByTime(700);
    });

    expect(await screen.findByText('Keep the corridor close before you land.')).toBeTruthy();
    expect(screen.getByText('Guest mode')).toBeTruthy();
    expect(screen.getByText('Dubai is next')).toBeTruthy();
    expect(screen.getAllByText('Ready on arrival').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Useful this run')).toBeTruthy();
  });

  it('shows a sparse empty state when no trip context exists', async () => {
    useScenarioStore.setState({ scenario: 'empty' });

    renderWithProviders(<TripsScreen />);

    await act(async () => {
      jest.advanceTimersByTime(400);
    });

    expect((await screen.findAllByText('No trip saved yet')).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('No saved places yet')).toBeTruthy();
    expect(screen.getByText('No active city benefits')).toBeTruthy();
  });

  it('reflects saved trip and venue state across the briefing', async () => {
    useScenarioStore.setState({
      savedState: {
        perkIds: ['perk_1'],
        tripIds: ['next_trip_1'],
        venueIds: ['venue_1'],
      },
      scenario: 'verified',
    });

    renderWithProviders(<TripsScreen />);

    await act(async () => {
      jest.advanceTimersByTime(700);
    });

    expect(await screen.findByText('Run saved')).toBeTruthy();
    expect(screen.getAllByText('Saved').length).toBeGreaterThanOrEqual(2);
  });
});
