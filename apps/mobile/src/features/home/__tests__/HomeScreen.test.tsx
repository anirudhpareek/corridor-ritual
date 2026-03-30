import { act, screen } from '@testing-library/react-native';

import { useScenarioStore } from '../../../lib/store/useScenarioStore';
import { resetScenarioStore } from '../../../test-fixtures/resetScenarioStore';
import { renderWithProviders } from '../../../test-utils';
import { HomeScreen } from '../HomeScreen';

describe('HomeScreen', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    resetScenarioStore();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it('renders the guest corridor home state', async () => {
    useScenarioStore.setState({ scenario: 'guest' });

    renderWithProviders(<HomeScreen />);

    await act(async () => {
      jest.advanceTimersByTime(700);
    });

    expect(await screen.findByText('A calmer way to land in Dubai.')).toBeTruthy();
    expect(screen.getByText('Guest mode')).toBeTruthy();
    expect(screen.getAllByText('Tonight in Dubai').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Browse the corridor before you join.')).toBeTruthy();
    expect(screen.getByText('Arrival supper · 20 AED back')).toBeTruthy();
  });

  it('reflects a queued top-up in the home activity preview', async () => {
    useScenarioStore.setState({ queuedTopUpAmount: 720, scenario: 'pendingFunds' });

    renderWithProviders(<HomeScreen />);

    await act(async () => {
      jest.advanceTimersByTime(700);
    });

    expect(await screen.findByText('Funds still processing')).toBeTruthy();
    expect(screen.getAllByText(/AED.*720/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Recent rhythm')).toBeTruthy();
  });

  it('surfaces sent split requests back into recent rhythm', async () => {
    useScenarioStore.setState({
      scenario: 'verified',
      splitPreviewActivity: {
        amount: {
          amount: 111,
          currency: 'AED',
        },
        direction: 'credit',
        id: 'split_preview_receipt_success',
        kind: 'split',
        occurredAt: '2026-03-29T08:52:00.000Z',
        status: 'pending',
        subtitle: "Jun's Table · 3 guests",
        title: 'Split requests sent',
      },
    });

    renderWithProviders(<HomeScreen />);

    await act(async () => {
      jest.advanceTimersByTime(700);
    });

    expect(await screen.findByText('Split requests sent')).toBeTruthy();
    expect(screen.getByText(/Jun's Table · 3 guests/)).toBeTruthy();
    expect(screen.getByText(/AED.*111/)).toBeTruthy();
  });
});
