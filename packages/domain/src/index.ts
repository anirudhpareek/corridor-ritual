export type SessionMode = 'guest' | 'member';

export type MemberState = 'guest' | 'member_preview' | 'verified_for_spend';

export type CorridorId = 'blr-dxb';

export type MembershipTier = 'guest' | 'founding' | 'circle';

export type VerificationState = 'unstarted' | 'in_review' | 'verified';

export type CurrencyCode = 'AED' | 'INR';

export type ActivityKind = 'spend' | 'topup' | 'refund' | 'split';

export type ActivityStatus = 'settled' | 'pending' | 'failed';

export type TrustState = 'calm' | 'guest' | 'member_preview' | 'verification_pending' | 'pending_funds';

export type PaymentStatus = 'idle' | 'success' | 'pending' | 'failed';

export type SplitStatus = 'pending' | 'partially_settled' | 'settled';

export type SplitParticipantStatus = 'pending' | 'paid';

export type SupportRequestStatus = 'queued' | 'reviewing';

export type MockScenario =
  | 'guest'
  | 'memberPreview'
  | 'verified'
  | 'verificationPending'
  | 'pendingFunds'
  | 'lowBalance'
  | 'perkEligible'
  | 'paymentSuccess'
  | 'paymentFailed'
  | 'empty'
  | 'error';

export interface Money {
  currency: CurrencyCode;
  amount: number;
}

export interface Corridor {
  id: CorridorId;
  homeCity: string;
  destinationCity: string;
  label: string;
  rhythm: string;
  accent: string;
}

export interface User {
  id: string;
  firstName: string;
  homeCity: string;
  currentCity: string;
  sessionMode: SessionMode;
  memberState: MemberState;
}

export interface MemberProfile {
  tier: MembershipTier;
  statusLine: string;
  nextUnlock: string;
  progress: number;
}

export interface Perk {
  id: string;
  title: string;
  label: string;
  description: string;
  savings: Money;
  city: string;
  category: 'lounge' | 'dining' | 'nightlife' | 'recovery';
}

export interface Venue {
  id: string;
  name: string;
  district: string;
  category: string;
  vibe: string;
  distance: string;
  priceNote: string;
  imageTone: 'sand' | 'ink' | 'forest';
  recommendedSpend: Money;
  featuredPerkId?: string;
}

export interface ActivityItem {
  id: string;
  title: string;
  subtitle: string;
  occurredAt: string;
  amount: Money;
  direction: 'credit' | 'debit';
  kind: ActivityKind;
  status: ActivityStatus;
  relatedSplitId?: string;
}

export interface SplitParticipant {
  id: string;
  name: string;
  share: Money;
  status: SplitParticipantStatus;
  settledAt?: string;
}

export interface SplitRequest {
  id: string;
  receiptId: string;
  createdAt: string;
  title: string;
  subtitle: string;
  venueName: string;
  total: Money;
  requestedBack: Money;
  status: SplitStatus;
  note: string;
  participants: SplitParticipant[];
}

export interface SupportRequestPreview {
  id: string;
  sourceActivityId: string;
  receiptTitle: string;
  receiptSubtitle: string;
  reason: string;
  createdAt: string;
  status: SupportRequestStatus;
  amount: Money;
  direction: 'credit' | 'debit';
  movementKind: ActivityKind;
  movementStatus: ActivityStatus;
}

export interface SavedState {
  venueIds: string[];
  perkIds: string[];
  tripIds: string[];
}

export interface RunReminder {
  id: string;
  city: string;
  venueId: string | null;
  perkId: string | null;
  setAt: string;
}

export interface BalanceSummary {
  available: Money;
  pending: Money;
  rewardsCredit?: Money;
}

export interface TravelSignal {
  id: string;
  routeLabel: string;
  windowLabel: string;
  headline: string;
  detail: string;
  priceHint: string;
  state: 'watch' | 'move' | 'hold';
}

export interface TripMoment {
  id: string;
  city: string;
  windowLabel: string;
  headline: string;
  detail: string;
  flightHint: string;
  ritual: string;
  savedPlaceCount: number;
}

export interface HomePayload {
  user: User;
  corridor: Corridor;
  memberProfile: MemberProfile;
  venues: Venue[];
  perks: Perk[];
  activity: ActivityItem[];
  travelSignal: TravelSignal;
}

export interface WalletPayload {
  user: User;
  balance: BalanceSummary;
  trustState: TrustState;
  verificationState: VerificationState;
  activity: ActivityItem[];
}

export interface PayEntryPayload {
  user: User;
  balance: BalanceSummary;
  merchants: Venue[];
  eligiblePerks: Perk[];
  cameraReady: boolean;
}

export interface TripsPayload {
  user: User;
  corridor: Corridor;
  nextTrip: TripMoment | null;
  travelSignal: TravelSignal | null;
  savedPlaces: Venue[];
  cityPerks: Perk[];
}

export interface FundingMethod {
  id: string;
  label: string;
  detail: string;
  state: 'ready' | 'needs_verification' | 'disabled';
}

export interface ProfilePayload {
  user: User;
  corridor: Corridor;
  memberProfile: MemberProfile;
  trustState: TrustState;
  verificationState: VerificationState;
  paymentMethods: FundingMethod[];
  supportStatus: string;
  supportDetail: string;
  privacyNote: string;
}

export interface PaymentDraft {
  merchantId: string | null;
  amountText: string;
  note?: string;
}

export interface PaymentQuote {
  merchant: Venue;
  amount: Money;
  subtotal: Money;
  perkApplied: Perk | null;
  total: Money;
  balanceAfter: Money;
}

export interface PaymentReceipt {
  id: string;
  merchant: Venue;
  total: Money;
  status: PaymentStatus;
  note: string;
  perkApplied: Perk | null;
  timestamp: string;
}

export interface HomeApi {
  getHome: (scenario: MockScenario) => Promise<HomePayload>;
}

export interface WalletApi {
  getWallet: (scenario: MockScenario) => Promise<WalletPayload>;
}

export interface TripsApi {
  getTrips: (scenario: MockScenario) => Promise<TripsPayload>;
}

export interface ProfileApi {
  getProfile: (scenario: MockScenario) => Promise<ProfilePayload>;
}

export interface PaymentsApi {
  getPayEntry: (scenario: MockScenario) => Promise<PayEntryPayload>;
  createQuote: (scenario: MockScenario, merchantId: string, amount: number) => Promise<PaymentQuote>;
  confirmPayment: (scenario: MockScenario, quote: PaymentQuote) => Promise<PaymentReceipt>;
}
