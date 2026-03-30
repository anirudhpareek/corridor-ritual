import { act, screen } from '@testing-library/react-native';

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
});
