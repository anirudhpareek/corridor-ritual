import { createRef } from 'react';
import { fireEvent } from '@testing-library/react-native';

import type { PaymentReceipt } from '@corridor/domain';
import { renderWithProviders } from '../../test-utils';
import { money, venue } from '../../test-fixtures/componentFixtures';
import { SplitFollowUpSheet } from '../SplitFollowUpSheet';

const receipt: PaymentReceipt = {
  id: 'receipt_success',
  merchant: venue,
  note: 'Accepted quietly. Your receipt will stay private unless you choose to share it.',
  perkApplied: {
    category: 'dining',
    city: 'Dubai',
    description: 'Members get a quiet-table credit at partner dinners after 8pm.',
    id: 'perk_1',
    label: '20 AED back',
    savings: money(20),
    title: 'Arrival supper',
  },
  status: 'success',
  timestamp: '2026-03-29T08:45:00.000Z',
  total: money(148),
};

describe('SplitFollowUpSheet', () => {
  it('renders the suggested equal split and sends requests', () => {
    const onSendSplit = jest.fn();
    const { getByText } = renderWithProviders(
      <SplitFollowUpSheet onSendSplit={onSendSplit} receipt={receipt} ref={createRef()} />,
    );

    expect(getByText('Split this table')).toBeTruthy();
    expect(getByText('AED 37')).toBeTruthy();
    expect(getByText('Rohan')).toBeTruthy();

    fireEvent.press(getByText('Send 3 requests'));

    expect(onSendSplit).toHaveBeenCalled();
  });
});
