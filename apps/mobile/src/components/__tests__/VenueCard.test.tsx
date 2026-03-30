import { VenueCard } from '../VenueCard';
import { renderWithProviders } from '../../test-utils';
import { venue } from '../../test-fixtures/componentFixtures';

describe('VenueCard', () => {
  it('renders partner venue details', () => {
    const { getByText } = renderWithProviders(<VenueCard venue={venue} />);

    expect(getByText("Jun's Table")).toBeTruthy();
    expect(getByText('Downtown Dubai')).toBeTruthy();
    expect(getByText('Member supper spot')).toBeTruthy();
    expect(getByText('Perk live')).toBeTruthy();
    expect(getByText('AED 148')).toBeTruthy();
  });
});
