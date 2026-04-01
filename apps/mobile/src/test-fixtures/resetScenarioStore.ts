import type { MockScenario, PaymentDraft, PaymentReceipt, SavedState, SplitRequest, SupportRequestPreview } from '@corridor/domain';

import { useScenarioStore } from '../lib/store/useScenarioStore';

type ScenarioStateOverrides = Partial<{
  dismissedBannerIds: string[];
  lastReceipt: PaymentReceipt | null;
  payDraft: PaymentDraft;
  queuedTopUpAmount: number | null;
  scenario: MockScenario;
  splitRequests: SplitRequest[];
  supportPreviews: SupportRequestPreview[];
  savedState: SavedState;
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
    splitRequests: [],
    savedState: {
      perkIds: [],
      tripIds: [],
      venueIds: [],
    },
    supportPreviews: [],
    ...overrides,
  });
}
