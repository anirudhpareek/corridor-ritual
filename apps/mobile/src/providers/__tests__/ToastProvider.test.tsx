import { act, fireEvent, screen } from '@testing-library/react-native';
import { Pressable } from 'react-native';

import { useToast } from '../ToastProvider';
import { renderWithProviders } from '../../test-utils';
import { Text } from '../../ui/Text';

function ToastTrigger() {
  const { showToast } = useToast();

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() =>
        showToast({
          title: 'Member demo enabled',
          description: 'Wallet and partner spend are now open in this prototype.',
          tone: 'success',
        })
      }>
      <Text>Trigger toast</Text>
    </Pressable>
  );
}

describe('ToastProvider', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it('shows and clears a toast after the display window', () => {
    renderWithProviders(<ToastTrigger />);

    fireEvent.press(screen.getByText('Trigger toast'));

    expect(screen.getByText('Member demo enabled')).toBeTruthy();
    expect(screen.getByText('Ready')).toBeTruthy();

    act(() => {
      jest.advanceTimersByTime(3200);
    });

    expect(screen.queryByText('Member demo enabled')).toBeNull();
  });
});
