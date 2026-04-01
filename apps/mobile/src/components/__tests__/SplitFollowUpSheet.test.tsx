import { createRef } from 'react';
import { fireEvent } from '@testing-library/react-native';

import type { SplitParticipant } from '@corridor/domain';
import { renderWithProviders } from '../../test-utils';
import { money } from '../../test-fixtures/componentFixtures';
import { SplitFollowUpSheet } from '../SplitFollowUpSheet';

describe('SplitFollowUpSheet', () => {
  it('renders the suggested equal split and sends requests', () => {
    const onSubmit = jest.fn();
    const { getByText } = renderWithProviders(
      <SplitFollowUpSheet
        onSubmit={onSubmit}
        ref={createRef()}
        source={{
          id: 'receipt_success',
          total: money(148),
          venueName: "Jun's Table",
        }}
      />,
    );

    expect(getByText('Split this table')).toBeTruthy();
    expect(getByText('Rohan')).toBeTruthy();
    expect(getByText('Requested back')).toBeTruthy();

    fireEvent.press(getByText('Send 3 requests'));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.arrayContaining<SplitParticipant>([
        expect.objectContaining({
          name: 'Rohan',
          share: expect.objectContaining({ amount: 37 }),
        }),
      ]),
    );
  });
});
