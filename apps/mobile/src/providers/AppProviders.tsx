import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { PropsWithChildren, useState } from 'react';

import { ThemeProvider } from '../theme';
import { AppErrorBoundary } from './AppErrorBoundary';
import { ToastProvider } from './ToastProvider';

export function AppProviders({ children }: PropsWithChildren) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: false,
            staleTime: 20_000,
          },
        },
      }),
  );

  return (
    <AppErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BottomSheetModalProvider>
          <ThemeProvider>
            <ToastProvider>{children}</ToastProvider>
          </ThemeProvider>
        </BottomSheetModalProvider>
      </QueryClientProvider>
    </AppErrorBoundary>
  );
}
