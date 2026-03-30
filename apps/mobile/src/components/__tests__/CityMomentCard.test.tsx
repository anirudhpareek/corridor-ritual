import { CityMomentCard } from '../CityMomentCard';
import { renderWithProviders } from '../../test-utils';
import { money, venue } from '../../test-fixtures/componentFixtures';

describe('CityMomentCard', () => {
  it('renders the featured venue and perk for the current city moment', () => {
    const { getByText } = renderWithProviders(
      <CityMomentCard
        city="Dubai"
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

    expect(getByText('Tonight in Dubai')).toBeTruthy();
    expect(getByText("Jun's Table")).toBeTruthy();
    expect(getByText('Perk live')).toBeTruthy();
    expect(getByText('Arrival supper · 20 AED back')).toBeTruthy();
  });
});
