import type { Money, Venue } from '@corridor/domain';

export const money = (amount: number, currency: Money['currency'] = 'AED'): Money => ({
  amount,
  currency,
});

export const venue: Venue = {
  category: 'Dinner',
  distance: '8 min from DIFC',
  district: 'Downtown Dubai',
  featuredPerkId: 'perk_1',
  id: 'venue_1',
  imageTone: 'sand',
  name: "Jun's Table",
  priceNote: 'Member supper spot',
  recommendedSpend: money(148),
  vibe: 'Quiet, modern, return-trip reliable',
};
