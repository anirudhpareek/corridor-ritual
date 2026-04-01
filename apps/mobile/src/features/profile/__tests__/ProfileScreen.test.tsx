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
    expect(screen.getAllByText('Priority member support').length).toBeGreaterThanOrEqual(1);
  });

  it('shows the in-review state clearly when verification is pending', async () => {
    useScenarioStore.setState({ scenario: 'verificationPending' });

    renderWithProviders(<ProfileScreen />);

    await act(async () => {
      jest.advanceTimersByTime(700);
    });

    expect((await screen.findAllByText('Verification in review')).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Manual review available').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('What stays hidden')).toBeTruthy();
  });

  it('reflects receipt-linked support previews in the support row copy', async () => {
    useScenarioStore.setState({
      scenario: 'verified',
      supportPreviews: [
        {
          amount: {
            amount: 186,
            currency: 'AED',
          },
          createdAt: '2026-03-31T10:15:00.000Z',
          direction: 'debit',
          id: 'support_1',
          movementKind: 'spend',
          movementStatus: 'pending',
          reason: 'The venue asked for confirmation',
          receiptSubtitle: 'Dinner for four',
          receiptTitle: "Jun's Table",
          sourceActivityId: 'act_1',
          status: 'queued',
        },
      ],
    });

    renderWithProviders(<ProfileScreen />);

    await act(async () => {
      jest.advanceTimersByTime(700);
    });

    expect(await screen.findByText('1 receipt-linked request already attached here.')).toBeTruthy();
  });
});
