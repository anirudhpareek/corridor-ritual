import type { ActivityItem, MockScenario, PaymentDraft, PaymentReceipt } from '@corridor/domain';

import { useScenarioStore } from '../lib/store/useScenarioStore';

type ScenarioStateOverrides = Partial<{
  dismissedBannerIds: string[];
  lastReceipt: PaymentReceipt | null;
  payDraft: PaymentDraft;
  queuedTopUpAmount: number | null;
  scenario: MockScenario;
  splitPreviewActivity: ActivityItem | null;
}>;

export function resetScenarioStore(overrides: ScenarioStateOverrides = {}) {
  useScenarioStore.setState({
    dismissedBannerIds: [],
    lastReceipt: null,
    payDraft: {
      merchantId: null,
      amountText: '',
    },
    queuedTopUpAmount: null,
    scenario: 'guest',
    splitPreviewActivity: null,
    ...overrides,
  });
}
