import { createRef } from 'react';
import { BottomSheetModal } from '@gorhom/bottom-sheet';

import { PerkDetailSheet } from '../PerkDetailSheet';
import { money, venue } from '../../test-fixtures/componentFixtures';
import { renderWithProviders } from '../../test-utils';

describe('PerkDetailSheet', () => {
  it('renders the perk brief and associated partner context', () => {
    const { getByText } = renderWithProviders(
      <PerkDetailSheet
        onPrimaryAction={() => undefined}
        onSetReminder={() => undefined}
        perk={{
          category: 'dining',
          city: 'Dubai',
          description: 'Members get a quiet-table credit at partner dinners after 8pm.',
          id: 'perk_1',
          label: '20 AED back',
          savings: money(20),
          title: 'Arrival supper',
        }}
        ref={createRef<BottomSheetModal>()}
        venue={venue}
      />,
    );

    expect(getByText('Member perk')).toBeTruthy();
    expect(getByText('Arrival supper')).toBeTruthy();
    expect(getByText('Quiet value')).toBeTruthy();
    expect(getByText("Jun's Table")).toBeTruthy();
    expect(getByText('Set for tonight')).toBeTruthy();
    expect(getByText('Use this perk')).toBeTruthy();
  });
});
