import type { ActivityItem, MockScenario, PaymentDraft, PaymentReceipt } from '@corridor/domain';
import { create } from 'zustand';

type ScenarioStore = {
  scenario: MockScenario;
  payDraft: PaymentDraft;
  lastReceipt: PaymentReceipt | null;
  queuedTopUpAmount: number | null;
  splitPreviewActivity: ActivityItem | null;
  dismissedBannerIds: string[];
  setScenario: (scenario: MockScenario) => void;
  dismissBanner: (id: string) => void;
  resetBanners: () => void;
  setPayMerchant: (merchantId: string | null) => void;
  setPayAmountText: (amountText: string) => void;
  clearPayDraft: () => void;
  setReceipt: (receipt: PaymentReceipt | null) => void;
  promoteToMember: () => void;
  enableVerifiedSpend: () => void;
  showVerificationReview: () => void;
  queueTopUp: (amount: number) => void;
  createSplitPreview: (receipt: PaymentReceipt, participantCount: number) => void;
  clearSplitPreview: () => void;
};

const initialDraft: PaymentDraft = {
  merchantId: null,
  amountText: '',
};

export const useScenarioStore = create<ScenarioStore>((set) => ({
  scenario: 'guest',
  payDraft: initialDraft,
  lastReceipt: null,
  queuedTopUpAmount: null,
  splitPreviewActivity: null,
  dismissedBannerIds: [],
  setScenario: (scenario) =>
    set((state) => ({
      scenario,
      queuedTopUpAmount: scenario === 'pendingFunds' ? state.queuedTopUpAmount : null,
    })),
  dismissBanner: (id) =>
    set((state) => ({
      dismissedBannerIds: state.dismissedBannerIds.includes(id)
        ? state.dismissedBannerIds
        : [...state.dismissedBannerIds, id],
    })),
  resetBanners: () => set({ dismissedBannerIds: [] }),
  setPayMerchant: (merchantId) =>
    set((state) => ({
      payDraft: {
        ...state.payDraft,
        merchantId,
      },
    })),
  setPayAmountText: (amountText) =>
    set((state) => ({
      payDraft: {
        ...state.payDraft,
        amountText,
      },
    })),
  clearPayDraft: () => set({ payDraft: initialDraft }),
  setReceipt: (receipt) => set({ lastReceipt: receipt }),
  promoteToMember: () => set({ scenario: 'memberPreview', queuedTopUpAmount: null }),
  enableVerifiedSpend: () => set({ scenario: 'verified', queuedTopUpAmount: null }),
  showVerificationReview: () => set({ scenario: 'verificationPending', queuedTopUpAmount: null }),
  queueTopUp: (amount) => set({ scenario: 'pendingFunds', queuedTopUpAmount: amount }),
  createSplitPreview: (receipt, participantCount) =>
    set({
      splitPreviewActivity: {
        id: `split_preview_${receipt.id}`,
        title: 'Split requests sent',
        subtitle: `${receipt.merchant.name} · ${participantCount} guests`,
        occurredAt: '2026-03-29T08:52:00.000Z',
        amount: {
          ...receipt.total,
          amount: Math.round((receipt.total.amount * (participantCount / (participantCount + 1))) * 100) / 100,
        },
        direction: 'credit',
        kind: 'split',
        status: 'pending',
      },
    }),
  clearSplitPreview: () => set({ splitPreviewActivity: null }),
}));
