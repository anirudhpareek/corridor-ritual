import { PendingStateBlock } from '../PendingStateBlock';
import { renderWithProviders } from '../../test-utils';
import { money } from '../../test-fixtures/componentFixtures';

describe('PendingStateBlock', () => {
  it('renders pending settlement amount', () => {
    const { getByText } = renderWithProviders(<PendingStateBlock amount={money(420)} />);

    expect(getByText('Pending arrival')).toBeTruthy();
    expect(getByText('No action needed')).toBeTruthy();
    expect(getByText(/AED 420/)).toBeTruthy();
  });

  it('renders payment-specific settlement copy when used for merchant payments', () => {
    const { getByText } = renderWithProviders(<PendingStateBlock amount={money(148)} kind="payment" />);

    expect(getByText('Payment in motion')).toBeTruthy();
    expect(getByText('Settlement in progress')).toBeTruthy();
    expect(getByText(/reserved for this venue/)).toBeTruthy();
  });
});
