import { act, fireEvent, screen } from '@testing-library/react-native';
import { useLocalSearchParams } from 'expo-router';

import { useScenarioStore } from '../../../lib/store/useScenarioStore';
import { resetScenarioStore } from '../../../test-fixtures/resetScenarioStore';
import { renderWithProviders } from '../../../test-utils';
import { SplitDetailScreen } from '../SplitDetailScreen';

describe('SplitDetailScreen', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    resetScenarioStore();
    (useLocalSearchParams as jest.Mock).mockReturnValue({ id: 'split_receipt_success_1' });
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it('renders a persistent split detail with participant states', async () => {
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

    renderWithProviders(<SplitDetailScreen />);

    await act(async () => {
      jest.advanceTimersByTime(50);
    });

    expect(await screen.findByText('Keep the table social, not spreadsheet-heavy.')).toBeTruthy();
    expect(screen.getByText('Who still owes')).toBeTruthy();
    expect(screen.getAllByText('Rohan').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Edit split').length).toBeGreaterThanOrEqual(1);
  });

  it('updates reply state when a participant settles back', async () => {
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

    renderWithProviders(<SplitDetailScreen />);

    await act(async () => {
      jest.advanceTimersByTime(50);
    });

    expect(await screen.findByText('How the table is resolving')).toBeTruthy();

    await act(async () => {
      fireEvent.press(screen.getAllByText('Mark paid')[0]);
      jest.advanceTimersByTime(50);
    });

    expect((await screen.findAllByText('1 paid · 2 pending')).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Partially settled')).toBeTruthy();
    expect(screen.getAllByText('Mark pending').length).toBeGreaterThanOrEqual(1);
  });
});
