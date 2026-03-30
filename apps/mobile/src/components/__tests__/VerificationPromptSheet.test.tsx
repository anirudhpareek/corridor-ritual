import { createRef } from 'react';
import { act, fireEvent } from '@testing-library/react-native';

import { useScenarioStore } from '../../lib/store/useScenarioStore';
import { resetScenarioStore } from '../../test-fixtures/resetScenarioStore';
import { renderWithProviders } from '../../test-utils';
import { VerificationPromptSheet } from '../VerificationPromptSheet';

describe('VerificationPromptSheet', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    resetScenarioStore({ scenario: 'memberPreview' });
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it('promotes member preview into verified spend and continues the original intent', () => {
    const afterVerified = jest.fn();
    const onVerified = jest.fn();
    const { getByText } = renderWithProviders(
      <VerificationPromptSheet afterVerified={afterVerified} onVerified={onVerified} ref={createRef()} />,
    );

    fireEvent.press(getByText('Enable verified spend demo'));

    act(() => {
      jest.advanceTimersByTime(220);
    });

    expect(onVerified).toHaveBeenCalled();
    expect(afterVerified).toHaveBeenCalled();
    expect(useScenarioStore.getState().scenario).toBe('verified');
  });

  it('can switch the flow into verification review', () => {
    const onPendingReview = jest.fn();
    const { getByText } = renderWithProviders(
      <VerificationPromptSheet onPendingReview={onPendingReview} onVerified={() => undefined} ref={createRef()} />,
    );

    fireEvent.press(getByText('Show review state'));

    expect(onPendingReview).toHaveBeenCalled();
    expect(useScenarioStore.getState().scenario).toBe('verificationPending');
  });
});
