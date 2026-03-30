import type {
  ActivityItem,
  Corridor,
  HomeApi,
  HomePayload,
  MemberProfile,
  MockScenario,
  Money,
  PayEntryPayload,
  PaymentQuote,
  PaymentReceipt,
  PaymentsApi,
  Perk,
  ProfileApi,
  ProfilePayload,
  TripMoment,
  TripsApi,
  TripsPayload,
  User,
  Venue,
  WalletApi,
  WalletPayload,
} from '@corridor/domain';

const corridor: Corridor = {
  id: 'blr-dxb',
  homeCity: 'Bangalore',
  destinationCity: 'Dubai',
  label: 'Bangalore to Dubai',
  rhythm: 'Founder dinners, late arrivals, familiar tables.',
  accent: '#9A7356',
};

const money = (amount: number, currency: Money['currency'] = 'AED'): Money => ({
  amount,
  currency,
});

const baseUser: User = {
  id: 'usr_01',
  firstName: 'Anaya',
  homeCity: 'Bangalore',
  currentCity: 'Dubai',
  memberState: 'verified_for_spend',
  sessionMode: 'member',
};

const guestUser: User = {
  ...baseUser,
  memberState: 'guest',
  sessionMode: 'guest',
};

const previewUser: User = {
  ...baseUser,
  memberState: 'member_preview',
  sessionMode: 'member',
};

const memberProfile: MemberProfile = {
  tier: 'founding',
  statusLine: 'Founding member',
  nextUnlock: 'One more partner spend unlocks Circle airport lounge entry.',
  progress: 0.72,
};

const perks: Perk[] = [
  {
    id: 'perk_1',
    title: 'Arrival supper',
    label: '20 AED back',
    description: 'Members get a quiet-table credit at partner dinners after 8pm.',
    savings: money(20),
    city: 'Dubai',
    category: 'dining',
  },
  {
    id: 'perk_2',
    title: 'Jet lag reset',
    label: 'Priority recovery slot',
    description: 'Skip the line for a partner recovery studio in DIFC.',
    savings: money(35),
    city: 'Dubai',
    category: 'recovery',
  },
];

const venues: Venue[] = [
  {
    id: 'venue_1',
    name: 'Jun’s Table',
    district: 'Downtown Dubai',
    category: 'Dinner',
    vibe: 'Quiet, modern, return-trip reliable',
    distance: '8 min from DIFC',
    priceNote: 'Member supper spot',
    imageTone: 'sand',
    recommendedSpend: money(148),
    featuredPerkId: 'perk_1',
  },
  {
    id: 'venue_2',
    name: 'Aether House',
    district: 'DIFC',
    category: 'Coffee',
    vibe: 'Founder mornings and catch-up meetings',
    distance: '4 min from Gate Ave',
    priceNote: 'Fast informal meetups',
    imageTone: 'ink',
    recommendedSpend: money(34),
  },
  {
    id: 'venue_3',
    name: 'Nami Recovery Club',
    district: 'Business Bay',
    category: 'Recovery',
    vibe: 'Jet lag repair before meetings',
    distance: '12 min from Downtown',
    priceNote: 'Members get priority entry',
    imageTone: 'forest',
    recommendedSpend: money(120),
    featuredPerkId: 'perk_2',
  },
];

const activity: ActivityItem[] = [
  {
    id: 'act_1',
    title: 'Jun’s Table',
    subtitle: 'Dinner for four',
    occurredAt: '2026-03-28T20:10:00.000Z',
    amount: money(186),
    direction: 'debit',
    kind: 'spend',
    status: 'settled',
  },
  {
    id: 'act_2',
    title: 'Travel balance top-up',
    subtitle: 'Card funding',
    occurredAt: '2026-03-28T18:02:00.000Z',
    amount: money(500),
    direction: 'credit',
    kind: 'topup',
    status: 'settled',
  },
  {
    id: 'act_3',
    title: 'Dinner split settled',
    subtitle: 'Repaid by Rohan',
    occurredAt: '2026-03-27T23:18:00.000Z',
    amount: money(58),
    direction: 'credit',
    kind: 'split',
    status: 'settled',
  },
];

const travelSignal = {
  id: 'trip_1',
  routeLabel: 'BLR to DXB',
  windowLabel: 'Apr 4 to Apr 8',
  headline: 'Late next week still looks calm.',
  detail:
    'Morning departures are holding steady, and Downtown dinner inventory is lighter than usual on Thursday.',
  priceHint: 'Fares tracking 6% below your usual window',
  state: 'move' as const,
};

const nextTrip: TripMoment = {
  id: 'next_trip_1',
  city: 'Dubai',
  windowLabel: 'Apr 4 to Apr 8',
  headline: 'This run still looks clean.',
  detail: 'Thursday evening arrivals are lighter than usual, and your usual Downtown dinner window still has room.',
  flightHint: 'Direct in 4h 25m',
  ritual: 'Arrival dinner, Friday coffee, Saturday recovery reset',
  savedPlaceCount: 3,
};

const wait = (scenario: MockScenario) =>
  new Promise((resolve, reject) => {
    const timeout = scenario === 'empty' ? 220 : 540;

    setTimeout(() => {
      if (scenario === 'error') {
        reject(new Error('Mock provider timed out.'));
        return;
      }

      resolve(true);
    }, timeout);
  });

const balanceByScenario = (scenario: MockScenario) => {
  if (scenario === 'guest') {
    return {
      available: money(0),
      pending: money(0),
    };
  }

  if (scenario === 'memberPreview' || scenario === 'verificationPending') {
    return {
      available: money(0),
      pending: money(0),
    };
  }

  if (scenario === 'lowBalance') {
    return {
      available: money(42),
      pending: money(0),
      rewardsCredit: money(12),
    };
  }

  if (scenario === 'pendingFunds') {
    return {
      available: money(184),
      pending: money(420),
      rewardsCredit: money(16),
    };
  }

  return {
    available: money(684),
    pending: money(0),
    rewardsCredit: money(16),
  };
};

const buildHome = (scenario: MockScenario): HomePayload => ({
  user: scenario === 'guest' ? guestUser : scenario === 'memberPreview' || scenario === 'verificationPending' ? previewUser : baseUser,
  corridor,
  memberProfile: scenario === 'guest'
    ? {
        tier: 'guest',
        statusLine: 'Browse the corridor before you join.',
        nextUnlock: 'Verify only when you are ready to spend in-network.',
        progress: 0.18,
  }
    : scenario === 'memberPreview'
      ? {
          tier: 'founding',
          statusLine: 'Member preview',
          nextUnlock: 'Verify spend to turn on funding and partner checkout.',
          progress: 0.42,
        }
      : scenario === 'verificationPending'
        ? {
            tier: 'founding',
            statusLine: 'Verification in review',
            nextUnlock: 'Spend unlocks as soon as your checks clear.',
            progress: 0.42,
          }
      : memberProfile,
  venues: scenario === 'empty' ? [] : venues,
  perks: scenario === 'empty' || scenario === 'guest' ? perks.slice(0, 1) : perks,
  activity: scenario === 'guest' || scenario === 'empty' ? [] : activity,
  travelSignal,
});

const buildWallet = (scenario: MockScenario): WalletPayload => ({
  user: scenario === 'guest' ? guestUser : scenario === 'memberPreview' || scenario === 'verificationPending' ? previewUser : baseUser,
  balance: balanceByScenario(scenario),
  trustState:
    scenario === 'guest'
      ? 'guest'
      : scenario === 'memberPreview'
        ? 'member_preview'
      : scenario === 'verificationPending'
        ? 'verification_pending'
        : scenario === 'pendingFunds'
          ? 'pending_funds'
          : 'calm',
  verificationState:
    scenario === 'verificationPending'
      ? 'in_review'
      : scenario === 'guest' || scenario === 'memberPreview'
        ? 'unstarted'
        : 'verified',
  activity:
    scenario === 'guest' || scenario === 'memberPreview' || scenario === 'verificationPending' || scenario === 'empty'
      ? []
      : scenario === 'pendingFunds'
        ? [
            {
              ...activity[1],
              id: 'act_pending_topup',
              occurredAt: '2026-03-29T06:10:00.000Z',
              status: 'pending',
            },
            ...activity.slice(0, 2),
          ]
        : activity,
});

const buildPayEntry = (scenario: MockScenario): PayEntryPayload => ({
  user: scenario === 'guest' ? guestUser : scenario === 'memberPreview' || scenario === 'verificationPending' ? previewUser : baseUser,
  balance: balanceByScenario(scenario),
  merchants: scenario === 'empty' ? [] : venues,
  eligiblePerks: scenario === 'perkEligible' || scenario === 'paymentSuccess' || scenario === 'paymentFailed' ? perks : perks.slice(0, 1),
  cameraReady: scenario !== 'guest',
});

const buildTrips = (scenario: MockScenario): TripsPayload => ({
  user: scenario === 'guest' ? guestUser : scenario === 'memberPreview' || scenario === 'verificationPending' ? previewUser : baseUser,
  corridor,
  nextTrip: scenario === 'empty' ? null : nextTrip,
  travelSignal: scenario === 'empty' ? null : travelSignal,
  savedPlaces: scenario === 'empty' ? [] : venues,
  cityPerks: scenario === 'guest' ? perks.slice(0, 1) : scenario === 'empty' ? [] : perks,
});

const buildProfile = (scenario: MockScenario): ProfilePayload => ({
  user: scenario === 'guest' ? guestUser : scenario === 'memberPreview' || scenario === 'verificationPending' ? previewUser : baseUser,
  corridor,
  memberProfile:
    scenario === 'guest'
      ? {
          tier: 'guest',
          statusLine: 'Guest browse',
          nextUnlock: 'Join when you want to keep the corridor close across trips.',
          progress: 0.18,
        }
      : scenario === 'memberPreview'
        ? {
            tier: 'founding',
            statusLine: 'Member preview',
            nextUnlock: 'Verify when you are ready to unlock funding and partner spend.',
            progress: 0.42,
          }
        : scenario === 'verificationPending'
          ? {
              tier: 'founding',
              statusLine: 'Verification in review',
              nextUnlock: 'Spend unlocks as soon as your checks clear.',
              progress: 0.42,
            }
          : memberProfile,
  trustState:
    scenario === 'guest'
      ? 'guest'
      : scenario === 'memberPreview'
        ? 'member_preview'
        : scenario === 'verificationPending'
          ? 'verification_pending'
          : scenario === 'pendingFunds'
            ? 'pending_funds'
            : 'calm',
  verificationState:
    scenario === 'verificationPending'
      ? 'in_review'
      : scenario === 'guest' || scenario === 'memberPreview'
        ? 'unstarted'
        : 'verified',
  paymentMethods:
    scenario === 'guest'
      ? [
          {
            id: 'funding_preview',
            label: 'Funding method',
            detail: 'Available after you join and verify for spend.',
            state: 'disabled',
          },
        ]
      : scenario === 'memberPreview' || scenario === 'verificationPending'
        ? [
            {
              id: 'funding_locked',
              label: 'Funding method',
              detail: 'Verification unlocks your first funding source.',
              state: 'needs_verification',
            },
          ]
        : [
            {
              id: 'card_1',
              label: 'Visa ending in 2034',
              detail: 'Primary funding method for corridor top-ups.',
              state: 'ready',
            },
          ],
  supportStatus: scenario === 'verificationPending' ? 'Manual review available' : 'Priority member support',
  supportDetail:
    scenario === 'guest'
      ? 'Browse freely, then reach out once you are ready to activate the corridor.'
      : scenario === 'verificationPending'
        ? 'If verification pauses, support can clarify what happens next without exposing rail details.'
        : 'Receipts, refunds, and venue issues stay tied to your corridor activity.',
  privacyNote: 'Wallet rails stay abstracted. Primary surfaces show only the states you need to trust.',
});

const findVenue = (merchantId: string) => venues.find((venue) => venue.id === merchantId) ?? venues[0];

const findPerkForVenue = (venue: Venue, scenario: MockScenario) => {
  if (scenario === 'lowBalance' || scenario === 'guest') {
    return null;
  }

  return perks.find((perk) => perk.id === venue.featuredPerkId) ?? perks[0] ?? null;
};

export const homeApi: HomeApi = {
  async getHome(scenario) {
    await wait(scenario);
    return buildHome(scenario);
  },
};

export const walletApi: WalletApi = {
  async getWallet(scenario) {
    await wait(scenario);
    return buildWallet(scenario);
  },
};

export const tripsApi: TripsApi = {
  async getTrips(scenario) {
    await wait(scenario);
    return buildTrips(scenario);
  },
};

export const profileApi: ProfileApi = {
  async getProfile(scenario) {
    await wait(scenario);
    return buildProfile(scenario);
  },
};

export const paymentsApi: PaymentsApi = {
  async getPayEntry(scenario) {
    await wait(scenario);
    return buildPayEntry(scenario);
  },
  async createQuote(scenario, merchantId, amount) {
    await wait(scenario);

    const merchant = findVenue(merchantId);
    const subtotal = money(amount);
    const perkApplied = findPerkForVenue(merchant, scenario);
    const total = money(Math.max(subtotal.amount - (perkApplied?.savings.amount ?? 0), 0));
    const available = balanceByScenario(scenario).available.amount;

    return {
      merchant,
      amount: subtotal,
      subtotal,
      perkApplied,
      total,
      balanceAfter: money(Math.max(available - total.amount, 0)),
    };
  },
  async confirmPayment(scenario, quote) {
    await wait(scenario);

    const status = scenario === 'paymentFailed' ? 'failed' : scenario === 'pendingFunds' ? 'pending' : 'success';
    const note =
      status === 'success'
        ? 'Accepted quietly. Your receipt will stay private unless you choose to share it.'
        : status === 'pending'
          ? 'We are waiting for settlement confirmation. Your venue already sees the payment intent.'
          : 'The venue did not receive a final confirmation. No duplicate charge was created.';

    const receipt: PaymentReceipt = {
      id: `pay_${quote.merchant.id}`,
      merchant: quote.merchant,
      total: quote.total,
      status,
      note,
      perkApplied: quote.perkApplied,
      timestamp: '2026-03-29T08:45:00.000Z',
    };

    return receipt;
  },
};

export const scenarios: MockScenario[] = [
  'guest',
  'memberPreview',
  'verified',
  'verificationPending',
  'pendingFunds',
  'lowBalance',
  'perkEligible',
  'paymentSuccess',
  'paymentFailed',
  'empty',
  'error',
];
