import { router } from 'expo-router';
import type { PaymentReceipt } from '@corridor/domain';
import { fireEvent, screen } from '@testing-library/react-native';

import { useScenarioStore } from '../../../lib/store/useScenarioStore';
import { resetScenarioStore } from '../../../test-fixtures/resetScenarioStore';
import { renderWithProviders } from '../../../test-utils';
import { venue } from '../../../test-fixtures/componentFixtures';
import { PayStatusScreen } from '../PayStatusScreen';

function buildReceipt(status: PaymentReceipt['status']): PaymentReceipt {
  return {
    id: `receipt_${status}`,
    merchant: venue,
    note:
      status === 'success'
        ? 'Accepted quietly. Your receipt will stay private unless you choose to share it.'
        : 'The venue did not receive a final confirmation. No duplicate charge was created.',
    perkApplied:
      status === 'success'
        ? {
            category: 'dining',
            city: 'Dubai',
            description: 'Members get a quiet-table credit at partner dinners after 8pm.',
            id: 'perk_1',
            label: '20 AED back',
            savings: {
              amount: 20,
              currency: 'AED',
            },
            title: 'Arrival supper',
          }
        : null,
    status,
    timestamp: '2026-03-29T08:45:00.000Z',
    total: {
      amount: 148,
      currency: 'AED',
    },
  };
}

describe('PayStatusScreen', () => {
  beforeEach(() => {
    resetScenarioStore();
  });

  it('renders the success state receipt', () => {
    useScenarioStore.setState({
      lastReceipt: buildReceipt('success'),
    });

    renderWithProviders(<PayStatusScreen />);

    expect(screen.getByText('Paid quietly.')).toBeTruthy();
    expect(screen.getAllByText("Jun's Table").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Member perk')).toBeTruthy();
    expect(screen.getByText('Arrival supper')).toBeTruthy();
    expect(screen.getAllByText('Split this table').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Done')).toBeTruthy();
  });

  it('renders the failed state with retry affordances', () => {
    useScenarioStore.setState({
      lastReceipt: buildReceipt('failed'),
    });

    renderWithProviders(<PayStatusScreen />);

    expect(screen.getByText('Final confirmation did not land.')).toBeTruthy();
    expect(screen.getByText('Retry payment')).toBeTruthy();
    expect(screen.getByText('Back to pay')).toBeTruthy();
  });

  it('renders the pending state with a calm exit path', () => {
    useScenarioStore.setState({
      lastReceipt: buildReceipt('pending'),
    });

    renderWithProviders(<PayStatusScreen />);

    expect(screen.getByText('Still settling.')).toBeTruthy();
    expect(screen.getByText('Back to home')).toBeTruthy();
    expect(screen.getByText('Payment in motion')).toBeTruthy();
  });

  it('creates a pending split activity and returns home when split requests are sent', () => {
    useScenarioStore.setState({
      lastReceipt: buildReceipt('success'),
    });

    renderWithProviders(<PayStatusScreen />);

    fireEvent.press(screen.getByText('Send 3 requests'));

    expect(useScenarioStore.getState().splitRequests[0]?.title).toBe('Split requests sent');
    expect(useScenarioStore.getState().splitRequests[0]?.subtitle).toBe("Jun's Table · 3 guests");
    expect(useScenarioStore.getState().splitRequests[0]?.requestedBack.amount).toBe(111);
    expect(router.replace).toHaveBeenCalledWith('/split/split_receipt_success_1');
  });
});
