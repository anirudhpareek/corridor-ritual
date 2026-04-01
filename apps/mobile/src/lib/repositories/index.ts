import type { ActivityItem, MockScenario, SplitRequest } from '@corridor/domain';
import { homeApi, paymentsApi, profileApi, tripsApi, walletApi } from '@corridor/mocks';

import type { CorridorRepositories } from './types';

function splitRequestToActivity(request: SplitRequest): ActivityItem {
  const paidCount = request.participants.filter((participant) => participant.status === 'paid').length;
  const totalParticipants = request.participants.length;

  return {
    id: `activity_${request.id}`,
    title:
      request.status === 'settled'
        ? 'Split settled'
        : request.status === 'partially_settled'
          ? 'Split still settling'
          : 'Split requests sent',
    subtitle:
      request.status === 'pending'
        ? `${request.venueName} · ${totalParticipants} guests`
        : `${request.venueName} · ${paidCount} of ${totalParticipants} repaid`,
    occurredAt: request.createdAt,
    amount: request.requestedBack,
    direction: 'credit',
    kind: 'split',
    status: request.status === 'settled' ? 'settled' : 'pending',
    relatedSplitId: request.id,
  };
}

function prependSplitActivity(activity: ActivityItem[], splitRequests: SplitRequest[]) {
  const splitActivities = splitRequests
    .map(splitRequestToActivity)
    .filter((candidate) => !activity.some((item) => item.id === candidate.id || item.relatedSplitId === candidate.relatedSplitId));

  return [...splitActivities, ...activity];
}

function buildSeedSplitRequest(scenario: MockScenario): SplitRequest[] {
  if (scenario === 'guest' || scenario === 'memberPreview' || scenario === 'verificationPending' || scenario === 'empty' || scenario === 'error') {
    return [];
  }

  return [
    {
      id: 'seed_split_juns_table',
      receiptId: 'receipt_seed_juns_table',
      createdAt: '2026-03-31T22:15:00.000Z',
      title: 'Dinner split still open',
      subtitle: "Jun's Table · 3 guests",
      venueName: "Jun's Table",
      total: {
        amount: 186,
        currency: 'AED',
      },
      requestedBack: {
        amount: 139.5,
        currency: 'AED',
      },
      status: 'partially_settled',
      note: 'One guest has already settled back. The rest stay tied to the original table.',
      participants: [
        {
          id: 'seed_rohan',
          name: 'Rohan',
          share: {
            amount: 46.5,
            currency: 'AED',
          },
          status: 'paid',
          settledAt: '2026-04-01T07:45:00.000Z',
        },
        {
          id: 'seed_maya',
          name: 'Maya',
          share: {
            amount: 46.5,
            currency: 'AED',
          },
          status: 'pending',
        },
        {
          id: 'seed_sara',
          name: 'Sara',
          share: {
            amount: 46.5,
            currency: 'AED',
          },
          status: 'pending',
        },
      ],
    },
  ];
}

function mergeSplitRequests(scenario: MockScenario, requests: SplitRequest[]) {
  const seedRequests = buildSeedSplitRequest(scenario);
  const localIds = new Set(requests.map((request) => request.id));

  return [...requests, ...seedRequests.filter((request) => !localIds.has(request.id))].sort((left, right) =>
    right.createdAt.localeCompare(left.createdAt),
  );
}

export const repositories: CorridorRepositories = {
  home: {
    async getHome({ queuedTopUpAmount, scenario, splitRequests }) {
      const payload = await homeApi.getHome(scenario);
      let nextActivity = prependSplitActivity(payload.activity, splitRequests);

      if (scenario === 'pendingFunds' && queuedTopUpAmount) {
        const pendingTopUpIndex = nextActivity.findIndex((item) => item.kind === 'topup');

        nextActivity =
          pendingTopUpIndex === -1
            ? nextActivity
            : nextActivity.map((item, index) =>
                index === pendingTopUpIndex
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

      return {
        ...payload,
        activity: nextActivity,
      };
    },
  },
  wallet: {
    async getWallet({ queuedTopUpAmount, scenario, splitRequests }) {
      const payload = await walletApi.getWallet(scenario);
      let nextActivity = prependSplitActivity(payload.activity, splitRequests);
      let nextBalance = payload.balance;

      if (scenario === 'pendingFunds' && queuedTopUpAmount) {
        const pendingTopUpIndex = nextActivity.findIndex((item) => item.kind === 'topup' && item.status === 'pending');

        nextBalance = {
          ...nextBalance,
          pending: {
            ...nextBalance.pending,
            amount: queuedTopUpAmount,
          },
        };
        nextActivity =
          pendingTopUpIndex === -1
            ? nextActivity
            : nextActivity.map((item, index) =>
                index === pendingTopUpIndex
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

      return {
        ...payload,
        balance: nextBalance,
        activity: nextActivity,
      };
    },
  },
  trips: {
    getTrips: ({ scenario }) => tripsApi.getTrips(scenario),
  },
  profile: {
    getProfile: ({ scenario }) => profileApi.getProfile(scenario),
  },
  payments: {
    getPayEntry: ({ scenario }) => paymentsApi.getPayEntry(scenario),
    createQuote: ({ amount, merchantId, scenario }) => paymentsApi.createQuote(scenario, merchantId, amount),
    confirmPayment: ({ quote, scenario }) => paymentsApi.confirmPayment(scenario, quote),
  },
  split: {
    async getSplitRequests({ requests, scenario }) {
      return mergeSplitRequests(scenario, requests);
    },
    async getSplitRequest({ requests, scenario, splitId }) {
      return mergeSplitRequests(scenario, requests).find((request) => request.id === splitId) ?? null;
    },
  },
  support: {
    async getSupportRequests({ requests }) {
      return [...requests].sort((left, right) => right.createdAt.localeCompare(left.createdAt));
    },
  },
  saved: {
    async getSavedState({ savedState }) {
      return savedState;
    },
  },
};
