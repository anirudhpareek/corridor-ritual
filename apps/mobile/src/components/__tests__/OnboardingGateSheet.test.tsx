import { createRef } from 'react';
import { act, fireEvent } from '@testing-library/react-native';

import { OnboardingGateSheet } from '../OnboardingGateSheet';
import { useScenarioStore } from '../../lib/store/useScenarioStore';
import { resetScenarioStore } from '../../test-fixtures/resetScenarioStore';
import { renderWithProviders } from '../../test-utils';

describe('OnboardingGateSheet', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    resetScenarioStore();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it('shows the key value changes before joining', () => {
    const { getByText } = renderWithProviders(
      <OnboardingGateSheet onJoined={() => undefined} ref={createRef()} />,
    );

    expect(getByText('Travel balance')).toBeTruthy();
    expect(getByText('Partner checkout')).toBeTruthy();
    expect(getByText('Perks that matter')).toBeTruthy();
  });

  it('continues the original intent after joining when requested', () => {
    const afterJoin = jest.fn();
    const onJoined = jest.fn();
    const { getByText } = renderWithProviders(
      <OnboardingGateSheet afterJoin={afterJoin} onJoined={onJoined} ref={createRef()} />,
    );

    fireEvent.press(getByText('Enter member preview'));

    act(() => {
      jest.advanceTimersByTime(220);
    });

    expect(onJoined).toHaveBeenCalled();
    expect(afterJoin).toHaveBeenCalled();
    expect(useScenarioStore.getState().scenario).toBe('memberPreview');
  });
});
