import { MembershipStatusCard } from '../MembershipStatusCard';
import { renderWithProviders } from '../../test-utils';

describe('MembershipStatusCard', () => {
  it('shows tier and next unlock copy', () => {
    const { getByText } = renderWithProviders(
      <MembershipStatusCard
        profile={{
          nextUnlock: 'One more partner spend unlocks Circle airport lounge entry.',
          progress: 0.72,
          statusLine: 'Founding member',
          tier: 'founding',
        }}
      />,
    );

    expect(getByText('Membership')).toBeTruthy();
    expect(getByText('Founding')).toBeTruthy();
    expect(getByText('One more partner spend unlocks Circle airport lounge entry.')).toBeTruthy();
  });
});
