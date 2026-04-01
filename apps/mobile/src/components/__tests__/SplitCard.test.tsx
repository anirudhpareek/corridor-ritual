import { renderWithProviders } from '../../test-utils';
import { SplitCard } from '../SplitCard';

describe('SplitCard', () => {
  it('renders a calm summary for partially settled group activity', () => {
    const { getByText } = renderWithProviders(
      <SplitCard
        split={{
          createdAt: '2026-03-31T22:15:00.000Z',
          id: 'seed_split_juns_table',
          note: 'One guest has already settled back. The rest stay tied to the original table.',
          participants: [
            {
              id: 'participant_1',
              name: 'Rohan',
              share: { amount: 46.5, currency: 'AED' },
              status: 'paid',
            },
            {
              id: 'participant_2',
              name: 'Maya',
              share: { amount: 46.5, currency: 'AED' },
              status: 'pending',
            },
          ],
          receiptId: 'receipt_seed_juns_table',
          requestedBack: { amount: 93, currency: 'AED' },
          status: 'partially_settled',
          subtitle: "Jun's Table · 2 guests",
          title: 'Dinner split still open',
          total: { amount: 186, currency: 'AED' },
          venueName: "Jun's Table",
        }}
      />,
    );

    expect(getByText('Dinner split still open')).toBeTruthy();
    expect(getByText('1 paid · 1 pending')).toBeTruthy();
    expect(getByText('Settled back')).toBeTruthy();
    expect(getByText('AED 46.50')).toBeTruthy();
    expect(getByText(/1 guest still pending/)).toBeTruthy();
  });
});
