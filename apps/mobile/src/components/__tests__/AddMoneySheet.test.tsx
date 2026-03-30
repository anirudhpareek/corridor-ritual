import { createRef } from 'react';
import { fireEvent } from '@testing-library/react-native';

import { AddMoneySheet } from '../AddMoneySheet';
import { useScenarioStore } from '../../lib/store/useScenarioStore';
import { resetScenarioStore } from '../../test-fixtures/resetScenarioStore';
import { renderWithProviders } from '../../test-utils';

describe('AddMoneySheet', () => {
  beforeEach(() => {
    resetScenarioStore({ scenario: 'verified' });
  });

  it('updates the queued amount when a funding option is selected', () => {
    const { getByText } = renderWithProviders(<AddMoneySheet onQueued={() => undefined} ref={createRef()} />);

    expect(getByText('Queue AED 420')).toBeTruthy();

    fireEvent.press(getByText('AED 720'));

    expect(getByText('Queue AED 720')).toBeTruthy();
  });

  it('stores the selected top-up amount when queued', () => {
    const onQueued = jest.fn();
    const { getByText } = renderWithProviders(<AddMoneySheet onQueued={onQueued} ref={createRef()} />);

    fireEvent.press(getByText('AED 180'));
    fireEvent.press(getByText('Queue AED 180'));

    expect(onQueued).toHaveBeenCalledWith('AED 180');
    expect(useScenarioStore.getState().scenario).toBe('pendingFunds');
    expect(useScenarioStore.getState().queuedTopUpAmount).toBe(180);
  });
});
