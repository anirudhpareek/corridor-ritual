import { act, fireEvent, screen } from '@testing-library/react-native';

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
      splitRequests: [
        {
          createdAt: '2026-04-01T09:30:00.000Z',
          id: 'split_receipt_success_1',
          note: 'Requests stay tied to the original table so replies settle back into the corridor cleanly.',
          participants: [
            {
              id: 'participant_1',
              name: 'Rohan',
              share: { amount: 37, currency: 'AED' },
              status: 'pending',
            },
            {
              id: 'participant_2',
              name: 'Maya',
              share: { amount: 37, currency: 'AED' },
              status: 'pending',
            },
            {
              id: 'participant_3',
              name: 'Sara',
              share: { amount: 37, currency: 'AED' },
              status: 'pending',
            },
          ],
          receiptId: 'receipt_success',
          requestedBack: { amount: 111, currency: 'AED' },
          status: 'pending',
          subtitle: "Jun's Table · 3 guests",
          title: 'Split requests sent',
          total: { amount: 148, currency: 'AED' },
          venueName: "Jun's Table",
        },
      ],
    });

    renderWithProviders(<WalletScreen />);

    await act(async () => {
      jest.advanceTimersByTime(700);
    });

    expect(await screen.findByText('Split requests sent')).toBeTruthy();
    expect(screen.getByText(/Jun's Table · 3 guests/)).toBeTruthy();
    expect(screen.getByText(/AED.*111/)).toBeTruthy();
  });

  it('opens split activity in a summary sheet before routing deeper', async () => {
    useScenarioStore.setState({
      scenario: 'verified',
      splitRequests: [
        {
          createdAt: '2026-04-01T09:30:00.000Z',
          id: 'split_receipt_success_1',
          note: 'Requests stay tied to the original table so replies settle back into the corridor cleanly.',
          participants: [
            {
              id: 'participant_1',
              name: 'Rohan',
              share: { amount: 37, currency: 'AED' },
              status: 'pending',
            },
            {
              id: 'participant_2',
              name: 'Maya',
              share: { amount: 37, currency: 'AED' },
              status: 'pending',
            },
            {
              id: 'participant_3',
              name: 'Sara',
              share: { amount: 37, currency: 'AED' },
              status: 'pending',
            },
          ],
          receiptId: 'receipt_success',
          requestedBack: { amount: 111, currency: 'AED' },
          status: 'pending',
          subtitle: "Jun's Table · 3 guests",
          title: 'Split requests sent',
          total: { amount: 148, currency: 'AED' },
          venueName: "Jun's Table",
        },
      ],
    });

    renderWithProviders(<WalletScreen />);

    await act(async () => {
      jest.advanceTimersByTime(700);
    });

    expect((await screen.findAllByText('Split requests sent')).length).toBeGreaterThanOrEqual(1);

    await act(async () => {
      fireEvent.press(screen.getByText('Split requests sent'));
    });

    expect(await screen.findByText('Split summary')).toBeTruthy();
    expect(screen.getByText('Open split')).toBeTruthy();
  });

  it('opens the attached support request instead of starting a new one', async () => {
    useScenarioStore.setState({
      scenario: 'verified',
      supportPreviews: [
        {
          amount: { amount: 500, currency: 'AED' },
          createdAt: '2026-04-01T10:15:00.000Z',
          direction: 'credit',
          id: 'support_topup_1',
          movementKind: 'topup',
          movementStatus: 'settled',
          reason: 'I need help with this receipt',
          receiptSubtitle: 'Card funding',
          receiptTitle: 'Travel balance top-up',
          sourceActivityId: 'act_2',
          status: 'queued',
        },
      ],
    });

    renderWithProviders(<WalletScreen />);

    await act(async () => {
      jest.advanceTimersByTime(700);
    });

    expect(await screen.findByText('Trust, without the noise.')).toBeTruthy();

    await act(async () => {
      fireEvent.press(screen.getByText('Travel balance top-up'));
    });

    expect(await screen.findByText('View support request')).toBeTruthy();

    await act(async () => {
      fireEvent.press(screen.getByText('View support request'));
    });

    expect(await screen.findByText('Support request detail')).toBeTruthy();
    expect(screen.getAllByText('Travel balance top-up').length).toBeGreaterThanOrEqual(1);
  });
});
