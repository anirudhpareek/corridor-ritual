import { PartnerSpotlightCard } from '../PartnerSpotlightCard';
import { renderWithProviders } from '../../test-utils';
import { money, venue } from '../../test-fixtures/componentFixtures';

describe('PartnerSpotlightCard', () => {
  it('renders the featured partner context for payment', () => {
    const { getByText } = renderWithProviders(
      <PartnerSpotlightCard
        onPress={() => undefined}
        perk={{
          category: 'dining',
          city: 'Dubai',
          description: 'Members get a quiet-table credit at partner dinners after 8pm.',
          id: 'perk_1',
          label: '20 AED back',
          savings: money(20),
          title: 'Arrival supper',
        }}
        venue={venue}
      />,
    );

    expect(getByText('Featured partner')).toBeTruthy();
    expect(getByText("Jun's Table")).toBeTruthy();
    expect(getByText('Pay here')).toBeTruthy();
    expect(getByText('Arrival supper · 20 AED back')).toBeTruthy();
  });
});
