import { useMutation, useQuery } from '@tanstack/react-query';
import { homeApi, paymentsApi, profileApi, tripsApi, walletApi } from '@corridor/mocks';

import { useScenarioStore } from './store/useScenarioStore';

export function useHomeQuery() {
  const scenario = useScenarioStore((state) => state.scenario);
  const queuedTopUpAmount = useScenarioStore((state) => state.queuedTopUpAmount);
  const splitPreviewActivity = useScenarioStore((state) => state.splitPreviewActivity);

  return useQuery({
    queryKey: ['home', scenario, queuedTopUpAmount, splitPreviewActivity?.id],
    queryFn: async () => {
      const payload = await homeApi.getHome(scenario);
      let nextActivity = payload.activity;

      if (scenario === 'pendingFunds' && queuedTopUpAmount) {
        const pendingActivityIndex = nextActivity.findIndex((item) => item.kind === 'topup');

        nextActivity =
          pendingActivityIndex === -1
            ? nextActivity
            : nextActivity.map((item, index) =>
                index === pendingActivityIndex
                  ? {
                      ...item,
                      occurredAt: '2026-03-29T06:10:00.000Z',
                      status: 'pending' as const,
                      amount: {
                        ...item.amount,
                        amount: queuedTopUpAmount,
                      },
                    }
                  : item,
              );
      }

      if (splitPreviewActivity && !nextActivity.some((item) => item.id === splitPreviewActivity.id)) {
        nextActivity = [splitPreviewActivity, ...nextActivity];
      }

      return {
        ...payload,
        activity: nextActivity,
      };
    },
  });
}

export function useWalletQuery() {
  const scenario = useScenarioStore((state) => state.scenario);
  const queuedTopUpAmount = useScenarioStore((state) => state.queuedTopUpAmount);
  const splitPreviewActivity = useScenarioStore((state) => state.splitPreviewActivity);

  return useQuery({
    queryKey: ['wallet', scenario, queuedTopUpAmount, splitPreviewActivity?.id],
    queryFn: async () => {
      const payload = await walletApi.getWallet(scenario);
      let nextActivity = payload.activity;
      let nextBalance = payload.balance;

      if (scenario === 'pendingFunds' && queuedTopUpAmount) {
        const pendingActivityIndex = nextActivity.findIndex(
          (item) => item.kind === 'topup' && item.status === 'pending',
        );

        nextBalance = {
          ...nextBalance,
          pending: {
            ...nextBalance.pending,
            amount: queuedTopUpAmount,
          },
        };
        nextActivity =
          pendingActivityIndex === -1
            ? nextActivity
            : nextActivity.map((item, index) =>
                index === pendingActivityIndex
                  ? {
                      ...item,
                      amount: {
                        ...item.amount,
                        amount: queuedTopUpAmount,
                      },
                    }
                  : item,
              );
      }

      if (splitPreviewActivity && !nextActivity.some((item) => item.id === splitPreviewActivity.id)) {
        nextActivity = [splitPreviewActivity, ...nextActivity];
      }

      return {
        ...payload,
        balance: nextBalance,
        activity: nextActivity,
      };
    },
  });
}

export function usePayEntryQuery() {
  const scenario = useScenarioStore((state) => state.scenario);

  return useQuery({
    queryKey: ['pay-entry', scenario],
    queryFn: () => paymentsApi.getPayEntry(scenario),
  });
}

export function useTripsQuery() {
  const scenario = useScenarioStore((state) => state.scenario);

  return useQuery({
    queryKey: ['trips', scenario],
    queryFn: () => tripsApi.getTrips(scenario),
  });
}

export function useProfileQuery() {
  const scenario = useScenarioStore((state) => state.scenario);

  return useQuery({
    queryKey: ['profile', scenario],
    queryFn: () => profileApi.getProfile(scenario),
  });
}

export function useQuotePayment() {
  const scenario = useScenarioStore((state) => state.scenario);

  return useMutation({
    mutationFn: ({ merchantId, amount }: { merchantId: string; amount: number }) =>
      paymentsApi.createQuote(scenario, merchantId, amount),
  });
}

export function useConfirmPayment() {
  const scenario = useScenarioStore((state) => state.scenario);

  return useMutation({
    mutationFn: paymentsApi.confirmPayment.bind(paymentsApi, scenario),
  });
}
