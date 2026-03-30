import { fireEvent, screen } from '@testing-library/react-native';

import { AppErrorBoundary } from '../AppErrorBoundary';
import { renderWithProviders } from '../../test-utils';
import { Text } from '../../ui/Text';

function BrokenScreen(): React.JSX.Element {
  throw new Error('Mock crash for boundary coverage.');
}

function StableScreen(): React.JSX.Element {
  return <Text>Recovered content</Text>;
}

describe('AppErrorBoundary', () => {
  it('renders the fallback surface for thrown errors', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);

    renderWithProviders(
      <AppErrorBoundary>
        <BrokenScreen />
      </AppErrorBoundary>,
    );

    expect(screen.getByText('A quiet reset is needed.')).toBeTruthy();
    expect(screen.getByText('Mock crash for boundary coverage.')).toBeTruthy();

    consoleErrorSpy.mockRestore();
  });

  it('can clear the error state and render healthy content again', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);

    function Harness({ crashed }: { crashed: boolean }) {
      return <AppErrorBoundary>{crashed ? <BrokenScreen /> : <StableScreen />}</AppErrorBoundary>;
    }

    const { rerender } = renderWithProviders(<Harness crashed />);

    expect(screen.getByText('Try again')).toBeTruthy();

    rerender(<Harness crashed={false} />);
    fireEvent.press(screen.getByText('Try again'));

    expect(screen.getByText('Recovered content')).toBeTruthy();

    consoleErrorSpy.mockRestore();
  });
});
