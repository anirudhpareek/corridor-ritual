import type { PaymentQuote, PaymentReceipt } from '@corridor/domain';
import { useMutation, useQuery } from '@tanstack/react-query';

import { repositories } from './repositories';
import { useScenarioStore } from './store/useScenarioStore';

export function useHomeQuery() {
  const scenario = useScenarioStore((state) => state.scenario);
  const queuedTopUpAmount = useScenarioStore((state) => state.queuedTopUpAmount);
  const splitRequests = useScenarioStore((state) => state.splitRequests);

  return useQuery({
    queryKey: ['home', scenario, queuedTopUpAmount, splitRequests],
    queryFn: () =>
      repositories.home.getHome({
        scenario,
        queuedTopUpAmount,
        splitRequests,
      }),
  });
}

export function useWalletQuery() {
  const scenario = useScenarioStore((state) => state.scenario);
  const queuedTopUpAmount = useScenarioStore((state) => state.queuedTopUpAmount);
  const splitRequests = useScenarioStore((state) => state.splitRequests);

  return useQuery({
    queryKey: ['wallet', scenario, queuedTopUpAmount, splitRequests],
    queryFn: () =>
      repositories.wallet.getWallet({
        scenario,
        queuedTopUpAmount,
        splitRequests,
      }),
  });
}

export function usePayEntryQuery() {
  const scenario = useScenarioStore((state) => state.scenario);

  return useQuery({
    queryKey: ['pay-entry', scenario],
    queryFn: () => repositories.payments.getPayEntry({ scenario }),
  });
}

export function useTripsQuery() {
  const scenario = useScenarioStore((state) => state.scenario);

  return useQuery({
    queryKey: ['trips', scenario],
    queryFn: () => repositories.trips.getTrips({ scenario }),
  });
}

export function useProfileQuery() {
  const scenario = useScenarioStore((state) => state.scenario);

  return useQuery({
    queryKey: ['profile', scenario],
    queryFn: () => repositories.profile.getProfile({ scenario }),
  });
}

export function useSplitRequestsQuery() {
  const scenario = useScenarioStore((state) => state.scenario);
  const splitRequests = useScenarioStore((state) => state.splitRequests);

  return useQuery({
    queryKey: ['splits', scenario, splitRequests],
    queryFn: () =>
      repositories.split.getSplitRequests({
        scenario,
        requests: splitRequests,
      }),
  });
}

export function useSplitRequestQuery(splitId: string | undefined) {
  const scenario = useScenarioStore((state) => state.scenario);
  const splitRequests = useScenarioStore((state) => state.splitRequests);

  return useQuery({
    enabled: Boolean(splitId),
    queryKey: ['split', scenario, splitId, splitRequests],
    queryFn: () =>
      repositories.split.getSplitRequest({
        scenario,
        requests: splitRequests,
        splitId: splitId ?? '',
      }),
  });
}

export function useSupportRequestsQuery() {
  const supportPreviews = useScenarioStore((state) => state.supportPreviews);

  return useQuery({
    queryKey: ['support-requests', supportPreviews],
    queryFn: () =>
      repositories.support.getSupportRequests({
        requests: supportPreviews,
      }),
  });
}

export function useSavedStateQuery() {
  const savedState = useScenarioStore((state) => state.savedState);

  return useQuery({
    queryKey: ['saved-state', savedState],
    queryFn: () =>
      repositories.saved.getSavedState({
        savedState,
      }),
  });
}

export function useQuotePayment() {
  const scenario = useScenarioStore((state) => state.scenario);

  return useMutation<PaymentQuote, Error, { merchantId: string; amount: number }>({
    mutationFn: ({ merchantId, amount }: { merchantId: string; amount: number }) =>
      repositories.payments.createQuote({
        amount,
        merchantId,
        scenario,
      }),
  });
}

export function useConfirmPayment() {
  const scenario = useScenarioStore((state) => state.scenario);

  return useMutation<PaymentReceipt, Error, PaymentQuote>({
    mutationFn: (quote: PaymentQuote) =>
      repositories.payments.confirmPayment({
        quote,
        scenario,
      }),
  });
}
