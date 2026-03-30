import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PropsWithChildren, useEffect } from 'react';
import { render } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ToastProvider } from './providers/ToastProvider';
import { ThemeProvider } from './theme';

export function renderWithProviders(children: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        gcTime: Infinity,
        retry: false,
      },
    },
  });

  function Wrapper({ children: content }: PropsWithChildren) {
    useEffect(() => {
      return () => {
        queryClient.clear();
      };
    }, []);

    return (
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <BottomSheetModalProvider>
            <ThemeProvider>
              <ToastProvider>{content}</ToastProvider>
            </ThemeProvider>
          </BottomSheetModalProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    );
  }

  return render(children, { wrapper: Wrapper });
}
