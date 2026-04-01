import { createRef } from 'react';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { fireEvent } from '@testing-library/react-native';

import { SupportCenterSheet } from '../SupportCenterSheet';
import { renderWithProviders } from '../../test-utils';

describe('SupportCenterSheet', () => {
  it('renders receipt-linked support previews when they exist and opens request detail', () => {
    const { getByLabelText, getByText } = renderWithProviders(
      <SupportCenterSheet
        detail="Receipts, refunds, and venue issues stay tied to your corridor activity."
        headline="Priority member support"
        previews={[
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
        ]}
        ref={createRef<BottomSheetModal>()}
      />,
    );

    expect(getByText('Help and receipts')).toBeTruthy();
    expect(getByText('Priority member support')).toBeTruthy();
    expect(getByText("Jun's Table")).toBeTruthy();
    expect(getByText('The venue asked for confirmation')).toBeTruthy();

    fireEvent.press(getByLabelText("Open support request for Jun's Table"));

    expect(getByText('Support request detail')).toBeTruthy();
    expect(getByText('Attached receipt')).toBeTruthy();
  });
});
