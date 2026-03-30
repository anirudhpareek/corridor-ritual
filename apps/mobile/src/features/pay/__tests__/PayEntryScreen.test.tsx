import { act, screen } from '@testing-library/react-native';

import { useScenarioStore } from '../../../lib/store/useScenarioStore';
import { resetScenarioStore } from '../../../test-fixtures/resetScenarioStore';
import { renderWithProviders } from '../../../test-utils';
import { PayEntryScreen } from '../PayEntryScreen';

describe('PayEntryScreen', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    resetScenarioStore();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it('falls back cleanly to venue selection when camera access is unavailable', async () => {
    useScenarioStore.setState({ scenario: 'verified' });

    renderWithProviders(<PayEntryScreen />);

    await act(async () => {
      jest.advanceTimersByTime(900);
    });

    expect(await screen.findByText('Choose the partner you’re paying.')).toBeTruthy();
    expect(screen.getByText('Start with the venue')).toBeTruthy();
    expect(screen.getByText('Open scanner only at the venue')).toBeTruthy();
    expect(screen.getByText('Choose from full list')).toBeTruthy();
  });
});
