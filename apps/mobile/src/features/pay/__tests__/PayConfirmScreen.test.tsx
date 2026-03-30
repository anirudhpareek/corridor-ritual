import { act, screen } from '@testing-library/react-native';

import { useScenarioStore } from '../../../lib/store/useScenarioStore';
import { resetScenarioStore } from '../../../test-fixtures/resetScenarioStore';
import { renderWithProviders } from '../../../test-utils';
import { PayConfirmScreen } from '../PayConfirmScreen';

describe('PayConfirmScreen', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    resetScenarioStore();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it('renders a clear error state when the pay context fails to load', async () => {
    useScenarioStore.setState({
      payDraft: {
        merchantId: 'venue_1',
        amountText: '148',
      },
      scenario: 'error',
    });

    renderWithProviders(<PayConfirmScreen />);

    await act(async () => {
      jest.advanceTimersByTime(900);
    });

    expect(await screen.findByText('Couldn’t prepare the payment')).toBeTruthy();
    expect(screen.getByText('Try again')).toBeTruthy();
  });

  it('asks member preview users to verify before paying', async () => {
    useScenarioStore.setState({
      payDraft: {
        merchantId: 'venue_1',
        amountText: '148',
      },
      scenario: 'memberPreview',
    });

    renderWithProviders(<PayConfirmScreen />);

    await act(async () => {
      jest.advanceTimersByTime(900);
    });

    expect(await screen.findByText('Verify to pay')).toBeTruthy();
  });

  it('shows a paused review state while verification is still in review', async () => {
    useScenarioStore.setState({
      payDraft: {
        merchantId: 'venue_1',
        amountText: '148',
      },
      scenario: 'verificationPending',
    });

    renderWithProviders(<PayConfirmScreen />);

    await act(async () => {
      jest.advanceTimersByTime(900);
    });

    expect(await screen.findByText('Verification in review')).toBeTruthy();
  });
});
