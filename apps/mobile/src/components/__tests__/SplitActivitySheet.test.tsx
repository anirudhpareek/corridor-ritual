import { createRef } from 'react';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { fireEvent } from '@testing-library/react-native';

import { renderWithProviders } from '../../test-utils';
import { SplitActivitySheet } from '../SplitActivitySheet';

describe('SplitActivitySheet', () => {
  it('renders a compact split summary and opens the full split flow', () => {
    const onOpenSplit = jest.fn();
    const { getByText } = renderWithProviders(
      <SplitActivitySheet
        onOpenSplit={onOpenSplit}
        ref={createRef<BottomSheetModal>()}
        split={{
          createdAt: '2026-03-31T22:15:00.000Z',
          id: 'seed_split_juns_table',
          note: 'One guest has already settled back. The rest stay tied to the original table.',
          participants: [
            {
              id: 'participant_1',
              name: 'Rohan',
              share: { amount: 46.5, currency: 'AED' },
              status: 'paid',
            },
            {
              id: 'participant_2',
              name: 'Maya',
              share: { amount: 46.5, currency: 'AED' },
              status: 'pending',
            },
          ],
          receiptId: 'receipt_seed_juns_table',
          requestedBack: { amount: 93, currency: 'AED' },
          status: 'partially_settled',
          subtitle: "Jun's Table · 2 guests",
          title: 'Dinner split still open',
          total: { amount: 186, currency: 'AED' },
          venueName: "Jun's Table",
        }}
      />,
    );

    expect(getByText('Split summary')).toBeTruthy();
    expect(getByText('Dinner split still open')).toBeTruthy();
    expect(getByText('1 paid · 1 pending')).toBeTruthy();
    expect(getByText('Open split')).toBeTruthy();

    fireEvent.press(getByText('Open split'));

    expect(onOpenSplit).toHaveBeenCalled();
  });
});
