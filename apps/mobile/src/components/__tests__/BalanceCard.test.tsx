import { BalanceCard } from '../BalanceCard';
import { renderWithProviders } from '../../test-utils';
import { money } from '../../test-fixtures/componentFixtures';

describe('BalanceCard', () => {
  it('renders calm balance details', () => {
    const { getByText } = renderWithProviders(
      <BalanceCard
        balance={{
          available: money(684),
          pending: money(120),
          rewardsCredit: money(16),
        }}
        onAddMoney={jest.fn()}
      />,
    );

    expect(getByText('Travel balance')).toBeTruthy();
    expect(getByText('AED 684')).toBeTruthy();
    expect(getByText('AED 120')).toBeTruthy();
    expect(getByText('Add money')).toBeTruthy();
  });
});
