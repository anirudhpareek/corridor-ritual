import { createRef } from 'react';
import { BottomSheetModal } from '@gorhom/bottom-sheet';

import { ActivityDetailSheet } from '../ActivityDetailSheet';
import { renderWithProviders } from '../../test-utils';

describe('ActivityDetailSheet', () => {
  it('renders a calm receipt explanation for pending split activity', () => {
    const { getByText } = renderWithProviders(
      <ActivityDetailSheet
        item={{
          amount: {
            amount: 111,
            currency: 'AED',
          },
          direction: 'credit',
          id: 'split_1',
          kind: 'split',
          occurredAt: '2026-03-29T08:52:00.000Z',
          status: 'pending',
          subtitle: "Jun's Table · 3 guests",
          title: 'Split requests sent',
        }}
        onSupportPress={() => undefined}
        ref={createRef<BottomSheetModal>()}
      />,
    );

    expect(getByText('Receipt detail')).toBeTruthy();
    expect(getByText('Split requests sent')).toBeTruthy();
    expect(getByText('What happened')).toBeTruthy();
    expect(getByText('Open support')).toBeTruthy();
  });

  it('allows the support CTA to reflect an existing request', () => {
    const { getByText } = renderWithProviders(
      <ActivityDetailSheet
        item={{
          amount: {
            amount: 186,
            currency: 'AED',
          },
          direction: 'debit',
          id: 'act_1',
          kind: 'spend',
          occurredAt: '2026-03-29T08:52:00.000Z',
          status: 'pending',
          subtitle: 'Dinner for four',
          title: "Jun's Table",
        }}
        onSupportPress={() => undefined}
        ref={createRef<BottomSheetModal>()}
        supportActionLabel="View support request"
      />,
    );

    expect(getByText('View support request')).toBeTruthy();
  });
});
