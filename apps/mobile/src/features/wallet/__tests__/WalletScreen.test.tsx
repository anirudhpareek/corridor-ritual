import { act, screen } from '@testing-library/react-native';

import { useScenarioStore } from '../../../lib/store/useScenarioStore';
import { resetScenarioStore } from '../../../test-fixtures/resetScenarioStore';
import { renderWithProviders } from '../../../test-utils';
import { WalletScreen } from '../WalletScreen';

describe('WalletScreen', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    resetScenarioStore();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it('shows a separated pending-funds state', async () => {
    useScenarioStore.setState({ queuedTopUpAmount: 720, scenario: 'pendingFunds' });

    renderWithProviders(<WalletScreen />);

    await act(async () => {
      jest.advanceTimersByTime(700);
    });

    expect(await screen.findByText('Trust, without the noise.')).toBeTruthy();
    expect(screen.getByText('Funds still processing')).toBeTruthy();
    expect(screen.getByText('Pending arrival')).toBeTruthy();
    expect(screen.getAllByText(/AED.*720/).length).toBeGreaterThanOrEqual(3);
    expect(screen.getByText(/on the way\. We hold it separately until settlement completes\./)).toBeTruthy();
  });

  it('keeps member preview clearly pre-spend', async () => {
    useScenarioStore.setState({ scenario: 'memberPreview' });

    renderWithProviders(<WalletScreen />);

    await act(async () => {
      jest.advanceTimersByTime(700);
    });

    expect(await screen.findByText('Member preview')).toBeTruthy();
    expect(screen.getAllByText('Verify to unlock spend').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Verify to activate balance')).toBeTruthy();
    expect(screen.getAllByText('AED 0').length).toBeGreaterThanOrEqual(2);
  });

  it('shows a pending split request inside recent activity', async () => {
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

    renderWithProviders(<WalletScreen />);

    await act(async () => {
      jest.advanceTimersByTime(700);
    });

    expect(await screen.findByText('Split requests sent')).toBeTruthy();
    expect(screen.getByText(/Jun's Table · 3 guests/)).toBeTruthy();
    expect(screen.getByText(/AED.*111/)).toBeTruthy();
  });
});
