import type { MockScenario, PaymentDraft, PaymentReceipt, RunReminder, SavedState, SplitParticipant, SplitRequest, SupportRequestPreview } from '@corridor/domain';
import { create } from 'zustand';

const suggestedGuests = ['Rohan', 'Maya', 'Sara', 'Dev', 'Isha'] as const;

const initialDraft: PaymentDraft = {
  merchantId: null,
  amountText: '',
};

const initialSavedState: SavedState = {
  perkIds: [],
  tripIds: [],
  venueIds: [],
};

function roundCurrency(amount: number) {
  return Math.round(amount * 100) / 100;
}

function buildEqualParticipants(receipt: PaymentReceipt, participantCount: number): SplitParticipant[] {
  const equalShare = roundCurrency(receipt.total.amount / (participantCount + 1));

  return suggestedGuests.slice(0, participantCount).map((guest, index) => ({
    id: `participant_${receipt.id}_${index + 1}`,
    name: guest,
    share: {
      ...receipt.total,
      amount: equalShare,
    },
    status: 'pending',
  }));
}

function deriveSplitStatus(participants: SplitParticipant[]): SplitRequest['status'] {
  const paidCount = participants.filter((participant) => participant.status === 'paid').length;

  if (paidCount === 0) {
    return 'pending';
  }

  if (paidCount === participants.length) {
    return 'settled';
  }

  return 'partially_settled';
}

function splitRequestedBack(receipt: PaymentReceipt, participants: SplitParticipant[]) {
  return {
    ...receipt.total,
    amount: roundCurrency(participants.reduce((total, participant) => total + participant.share.amount, 0)),
  };
}

type ScenarioStore = {
  scenario: MockScenario;
  payDraft: PaymentDraft;
  lastReceipt: PaymentReceipt | null;
  queuedTopUpAmount: number | null;
  splitRequests: SplitRequest[];
  supportPreviews: SupportRequestPreview[];
  savedState: SavedState;
  runReminder: RunReminder | null;
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
  createSplitRequest: (receipt: PaymentReceipt, participants: SplitParticipant[]) => string;
  updateSplitParticipants: (splitId: string, participants: SplitParticipant[]) => void;
  toggleSplitParticipantPaid: (splitId: string, participantId: string) => void;
  createSupportPreview: (params: {
    amount: SupportRequestPreview['amount'];
    direction: SupportRequestPreview['direction'];
    movementKind: SupportRequestPreview['movementKind'];
    movementStatus: SupportRequestPreview['movementStatus'];
    reason: string;
    sourceActivityId: string;
    receiptSubtitle: string;
    receiptTitle: string;
  }) => SupportRequestPreview;
  toggleVenueSaved: (venueId: string) => void;
  togglePerkSaved: (perkId: string) => void;
  toggleTripSaved: (tripId: string) => void;
  setRunReminder: (reminder: RunReminder | null) => void;
  clearRunReminder: () => void;
  clearSplitRequests: () => void;
  clearSupportPreviews: () => void;
  resetSavedState: () => void;
  seedSplitRequestFromReceipt: (receipt: PaymentReceipt, participantCount: number) => string;
};

export const useScenarioStore = create<ScenarioStore>((set, get) => ({
  scenario: 'guest',
  payDraft: initialDraft,
  lastReceipt: null,
  queuedTopUpAmount: null,
  splitRequests: [],
  supportPreviews: [],
  savedState: initialSavedState,
  runReminder: null,
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
  createSplitRequest: (receipt, participants) => {
    const splitId = `split_${receipt.id}_${get().splitRequests.length + 1}`;
    const nextParticipants = participants.length ? participants : buildEqualParticipants(receipt, 3);

    set((state) => ({
      splitRequests: [
        {
          id: splitId,
          receiptId: receipt.id,
          createdAt: '2026-04-01T09:30:00.000Z',
          title: 'Split requests sent',
          subtitle: `${receipt.merchant.name} · ${nextParticipants.length} guests`,
          venueName: receipt.merchant.name,
          total: receipt.total,
          requestedBack: splitRequestedBack(receipt, nextParticipants),
          status: deriveSplitStatus(nextParticipants),
          note: 'Requests stay tied to the original table so replies settle back into the corridor cleanly.',
          participants: nextParticipants,
        },
        ...state.splitRequests,
      ],
    }));

    return splitId;
  },
  updateSplitParticipants: (splitId, participants) =>
    set((state) => ({
      splitRequests: state.splitRequests.map((request) =>
        request.id === splitId
          ? {
              ...request,
              participants,
              requestedBack: {
                ...request.requestedBack,
                amount: roundCurrency(participants.reduce((total, participant) => total + participant.share.amount, 0)),
              },
              status: deriveSplitStatus(participants),
              subtitle: `${request.venueName} · ${participants.length} guests`,
            }
          : request,
      ),
    })),
  toggleSplitParticipantPaid: (splitId, participantId) =>
    set((state) => ({
      splitRequests: state.splitRequests.map((request) => {
        if (request.id !== splitId) {
          return request;
        }

        const nextParticipants = request.participants.map((participant) =>
          participant.id === participantId
            ? {
                ...participant,
                status: participant.status === 'paid' ? ('pending' as const) : ('paid' as const),
                settledAt: participant.status === 'paid' ? undefined : '2026-04-01T10:10:00.000Z',
              }
            : participant,
        );

        return {
          ...request,
          participants: nextParticipants,
          status: deriveSplitStatus(nextParticipants),
        };
      }),
    })),
  createSupportPreview: ({ amount, direction, movementKind, movementStatus, reason, sourceActivityId, receiptSubtitle, receiptTitle }) => {
    const preview: SupportRequestPreview = {
      id: `support_${receiptTitle}_${get().supportPreviews.length + 1}`,
      sourceActivityId,
      receiptTitle,
      receiptSubtitle,
      reason,
      createdAt: '2026-04-01T10:15:00.000Z',
      status: movementStatus === 'failed' ? ('reviewing' as const) : ('queued' as const),
      amount,
      direction,
      movementKind,
      movementStatus,
    };

    set((state) => ({
      supportPreviews: [preview, ...state.supportPreviews].slice(0, 6),
    }));

    return preview;
  },
  toggleVenueSaved: (venueId) =>
    set((state) => ({
      savedState: {
        ...state.savedState,
        venueIds: state.savedState.venueIds.includes(venueId)
          ? state.savedState.venueIds.filter((id) => id !== venueId)
          : [...state.savedState.venueIds, venueId],
      },
    })),
  togglePerkSaved: (perkId) =>
    set((state) => ({
      savedState: {
        ...state.savedState,
        perkIds: state.savedState.perkIds.includes(perkId)
          ? state.savedState.perkIds.filter((id) => id !== perkId)
          : [...state.savedState.perkIds, perkId],
      },
    })),
  toggleTripSaved: (tripId) =>
    set((state) => ({
      savedState: {
        ...state.savedState,
        tripIds: state.savedState.tripIds.includes(tripId)
          ? state.savedState.tripIds.filter((id) => id !== tripId)
          : [...state.savedState.tripIds, tripId],
      },
    })),
  setRunReminder: (reminder) => set({ runReminder: reminder }),
  clearRunReminder: () => set({ runReminder: null }),
  clearSplitRequests: () => set({ splitRequests: [] }),
  clearSupportPreviews: () => set({ supportPreviews: [] }),
  resetSavedState: () => set({ savedState: initialSavedState }),
  seedSplitRequestFromReceipt: (receipt, participantCount) => {
    const splitId = `seed_${receipt.id}`;

    if (get().splitRequests.some((request) => request.id === splitId)) {
      return splitId;
    }

    const seededParticipants = buildEqualParticipants(receipt, participantCount).map((participant, index) =>
      index === 0
        ? {
            ...participant,
            settledAt: '2026-04-01T07:45:00.000Z',
            status: 'paid' as const,
          }
        : participant,
    );

    set((state) => ({
      splitRequests: [
        ...state.splitRequests,
        {
          id: splitId,
          receiptId: receipt.id,
          createdAt: '2026-03-31T22:15:00.000Z',
          title: 'Dinner split still open',
          subtitle: `${receipt.merchant.name} · ${participantCount} guests`,
          venueName: receipt.merchant.name,
          total: receipt.total,
          requestedBack: splitRequestedBack(receipt, seededParticipants),
          status: deriveSplitStatus(seededParticipants),
          note: 'One guest has already settled back. The rest stay tied to the original table.',
          participants: seededParticipants,
        },
      ],
    }));

    return splitId;
  },
}));
