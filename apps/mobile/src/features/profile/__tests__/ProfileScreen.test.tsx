import { act, screen } from '@testing-library/react-native';

import { useScenarioStore } from '../../../lib/store/useScenarioStore';
import { resetScenarioStore } from '../../../test-fixtures/resetScenarioStore';
import { renderWithProviders } from '../../../test-utils';
import { ProfileScreen } from '../ProfileScreen';

describe('ProfileScreen', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    resetScenarioStore();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it('renders guest trust state without turning into a settings dump', async () => {
    useScenarioStore.setState({ scenario: 'guest' });

    renderWithProviders(<ProfileScreen />);

    await act(async () => {
      jest.advanceTimersByTime(700);
    });

    expect(await screen.findByText('Trust and account state, kept quiet.')).toBeTruthy();
    expect(screen.getAllByText('Verification not started').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Join the network')).toBeTruthy();
    expect(screen.getByText('Guest browse')).toBeTruthy();
    expect(screen.getByText('Priority member support')).toBeTruthy();
  });

  it('shows the in-review state clearly when verification is pending', async () => {
    useScenarioStore.setState({ scenario: 'verificationPending' });

    renderWithProviders(<ProfileScreen />);

    await act(async () => {
      jest.advanceTimersByTime(700);
    });

    expect((await screen.findAllByText('Verification in review')).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Manual review available')).toBeTruthy();
    expect(screen.getByText('What stays hidden')).toBeTruthy();
  });
});
