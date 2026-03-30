import { createRef } from 'react';
import { BottomSheetModal } from '@gorhom/bottom-sheet';

import { VenueDetailSheet } from '../VenueDetailSheet';
import { money, venue } from '../../test-fixtures/componentFixtures';
import { renderWithProviders } from '../../test-utils';

describe('VenueDetailSheet', () => {
  it('renders the curated partner brief and member perk', () => {
    const { getByText } = renderWithProviders(
      <VenueDetailSheet
        onPrimaryAction={() => undefined}
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

    expect(getByText('Partner venue')).toBeTruthy();
    expect(getByText("Jun's Table")).toBeTruthy();
    expect(getByText('Why it stays in the corridor')).toBeTruthy();
    expect(getByText('Arrival supper')).toBeTruthy();
    expect(getByText('Pay this partner')).toBeTruthy();
  });
});
