import { createRef } from 'react';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { fireEvent } from '@testing-library/react-native';

import { SupportIssueSheet } from '../SupportIssueSheet';
import { renderWithProviders } from '../../test-utils';

describe('SupportIssueSheet', () => {
  it('renders contextual support paths and submits the selected issue', () => {
    const onSubmit = jest.fn();
    const { getByText } = renderWithProviders(
      <SupportIssueSheet
        item={{
          amount: {
            amount: 186,
            currency: 'AED',
          },
          direction: 'debit',
          id: 'spend_1',
          kind: 'spend',
          occurredAt: '2026-03-29T08:52:00.000Z',
          status: 'pending',
          subtitle: 'Dinner for four',
          title: "Jun's Table",
        }}
        onSubmit={onSubmit}
        ref={createRef<BottomSheetModal>()}
      />,
    );

    expect(getByText('Support request')).toBeTruthy();
    expect(getByText('This payment is pending too long')).toBeTruthy();

    fireEvent.press(getByText('The venue asked for confirmation'));
    fireEvent.press(getByText('Send to support'));

    expect(onSubmit).toHaveBeenCalledWith('The venue asked for confirmation');
  });
});
