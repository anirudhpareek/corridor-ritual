import type {
  HomePayload,
  MockScenario,
  PayEntryPayload,
  PaymentQuote,
  PaymentReceipt,
  ProfilePayload,
  SavedState,
  SplitRequest,
  SupportRequestPreview,
  TripsPayload,
  WalletPayload,
} from '@corridor/domain';

export type HomeRepositoryInput = {
  scenario: MockScenario;
  queuedTopUpAmount: number | null;
  splitRequests: SplitRequest[];
};

export type WalletRepositoryInput = {
  scenario: MockScenario;
  queuedTopUpAmount: number | null;
  splitRequests: SplitRequest[];
};

export type TripsRepositoryInput = {
  scenario: MockScenario;
};

export type ProfileRepositoryInput = {
  scenario: MockScenario;
};

export type PaymentsRepositoryInput = {
  scenario: MockScenario;
};

export type SupportRepositoryInput = {
  requests: SupportRequestPreview[];
};

export type SplitRepositoryInput = {
  scenario: MockScenario;
  requests: SplitRequest[];
};

export type SplitRequestRepositoryInput = {
  scenario: MockScenario;
  requests: SplitRequest[];
  splitId: string;
};

export type SavedStateRepositoryInput = {
  savedState: SavedState;
};

export interface HomeRepository {
  getHome: (input: HomeRepositoryInput) => Promise<HomePayload>;
}

export interface WalletRepository {
  getWallet: (input: WalletRepositoryInput) => Promise<WalletPayload>;
}

export interface TripsRepository {
  getTrips: (input: TripsRepositoryInput) => Promise<TripsPayload>;
}

export interface ProfileRepository {
  getProfile: (input: ProfileRepositoryInput) => Promise<ProfilePayload>;
}

export interface PaymentsRepository {
  getPayEntry: (input: PaymentsRepositoryInput) => Promise<PayEntryPayload>;
  createQuote: (input: PaymentsRepositoryInput & { merchantId: string; amount: number }) => Promise<PaymentQuote>;
  confirmPayment: (input: PaymentsRepositoryInput & { quote: PaymentQuote }) => Promise<PaymentReceipt>;
}

export interface SplitRepository {
  getSplitRequests: (input: SplitRepositoryInput) => Promise<SplitRequest[]>;
  getSplitRequest: (input: SplitRequestRepositoryInput) => Promise<SplitRequest | null>;
}

export interface SupportRepository {
  getSupportRequests: (input: SupportRepositoryInput) => Promise<SupportRequestPreview[]>;
}

export interface SavedStateRepository {
  getSavedState: (input: SavedStateRepositoryInput) => Promise<SavedState>;
}

export interface CorridorRepositories {
  home: HomeRepository;
  wallet: WalletRepository;
  trips: TripsRepository;
  profile: ProfileRepository;
  payments: PaymentsRepository;
  split: SplitRepository;
  support: SupportRepository;
  saved: SavedStateRepository;
}
