import { createRef } from 'react';
import { BottomSheetModal } from '@gorhom/bottom-sheet';

import { SupportRequestDetailSheet } from '../SupportRequestDetailSheet';
import { renderWithProviders } from '../../test-utils';

describe('SupportRequestDetailSheet', () => {
  it('renders a receipt-anchored support explanation for queued requests', () => {
    const { getByText } = renderWithProviders(
      <SupportRequestDetailSheet
        preview={{
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
        }}
        ref={createRef<BottomSheetModal>()}
      />,
    );

    expect(getByText('Support request detail')).toBeTruthy();
    expect(getByText('The venue asked for confirmation')).toBeTruthy();
    expect(getByText('Attached receipt')).toBeTruthy();
    expect(getByText('What support is doing')).toBeTruthy();
    expect(getByText('What you should do now')).toBeTruthy();
  });
});
