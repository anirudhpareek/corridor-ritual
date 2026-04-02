import { router } from 'expo-router';
import { act, fireEvent, screen } from '@testing-library/react-native';

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
    jest.clearAllMocks();
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
    expect(screen.getAllByText('Recent rhythm').length).toBeGreaterThanOrEqual(1);
  });

  it('surfaces active group split in its own home module', async () => {
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

    renderWithProviders(<HomeScreen />);

    await act(async () => {
      jest.advanceTimersByTime(700);
    });

    expect(await screen.findByText('One table still moving')).toBeTruthy();
    expect(screen.getAllByText('Split requests sent').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/AED.*111/)).toBeTruthy();
  });

  it('opens the split summary sheet from the home group activity module', async () => {
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

    renderWithProviders(<HomeScreen />);

    await act(async () => {
      jest.advanceTimersByTime(700);
    });

    expect((await screen.findAllByText('Split requests sent')).length).toBeGreaterThanOrEqual(1);

    await act(async () => {
      fireEvent.press(screen.getAllByText('Split requests sent')[0]);
    });

    expect(await screen.findByText('Split summary')).toBeTruthy();
    expect(screen.getAllByText('Open split').length).toBeGreaterThanOrEqual(1);
  });

  it('reframes the group activity module once the table is fully closed out', async () => {
    useScenarioStore.setState({
      scenario: 'verified',
      splitRequests: [
        {
          createdAt: '2026-04-01T09:30:00.000Z',
          id: 'split_receipt_success_settled',
          note: 'Everyone replied and the table is now resolved.',
          participants: [
            {
              id: 'participant_1',
              name: 'Rohan',
              settledAt: '2026-04-01T10:10:00.000Z',
              share: { amount: 37, currency: 'AED' },
              status: 'paid',
            },
            {
              id: 'participant_2',
              name: 'Maya',
              settledAt: '2026-04-01T10:15:00.000Z',
              share: { amount: 37, currency: 'AED' },
              status: 'paid',
            },
            {
              id: 'participant_3',
              name: 'Sara',
              settledAt: '2026-04-01T10:18:00.000Z',
              share: { amount: 37, currency: 'AED' },
              status: 'paid',
            },
          ],
          receiptId: 'receipt_success',
          requestedBack: { amount: 111, currency: 'AED' },
          status: 'settled',
          subtitle: "Jun's Table · 3 guests",
          title: 'Split settled',
          total: { amount: 148, currency: 'AED' },
          venueName: "Jun's Table",
        },
      ],
    });

    renderWithProviders(<HomeScreen />);

    await act(async () => {
      jest.advanceTimersByTime(700);
    });

    expect(await screen.findByText('Last table closed out')).toBeTruthy();
    expect(screen.getByText('Review split')).toBeTruthy();
  });

  it('reflects live receipt-linked support count in the recent rhythm section', async () => {
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

    renderWithProviders(<HomeScreen />);

    await act(async () => {
      jest.advanceTimersByTime(700);
    });

    expect(await screen.findByText('1 request live')).toBeTruthy();
  });

  it('opens the saved venue from the kept-close module', async () => {
    useScenarioStore.setState({
      savedState: {
        perkIds: ['perk_1'],
        tripIds: ['trip_1'],
        venueIds: ['venue_1'],
      },
      scenario: 'verified',
    });

    renderWithProviders(<HomeScreen />);

    await act(async () => {
      jest.advanceTimersByTime(700);
    });

    expect(await screen.findByText('Open saved place')).toBeTruthy();

    await act(async () => {
      fireEvent.press(screen.getByText('Open saved place'));
    });

    expect((await screen.findAllByText('Partner venue')).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Jun['’]s Table/).length).toBeGreaterThanOrEqual(1);
  });

  it('turns a tonight reminder into a prefilled pay intent', async () => {
    useScenarioStore.setState({
      runReminder: {
        city: 'Dubai',
        id: 'reminder_venue_1',
        perkId: 'perk_1',
        setAt: '2026-04-02T12:15:00.000Z',
        venueId: 'venue_1',
      },
      scenario: 'verified',
    });

    renderWithProviders(<HomeScreen />);

    await act(async () => {
      jest.advanceTimersByTime(700);
    });

    expect(await screen.findByText('Ready tonight')).toBeTruthy();

    await act(async () => {
      fireEvent.press(screen.getByText('Pay this partner'));
    });

    expect(useScenarioStore.getState().payDraft.merchantId).toBe('venue_1');
    expect(useScenarioStore.getState().payDraft.amountText).toBe('148');
    expect(router.push).toHaveBeenCalledWith('/pay/confirm');
  });
});
