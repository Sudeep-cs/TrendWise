'use client';

import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from 'next-themes';
import { SWRConfig } from 'swr';
import { handleApiError } from '@/lib/api';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <SWRConfig
          value={{
            fetcher: (url: string) => fetch(url).then((res) => res.json()),
            onError: (error) => {
              console.error('SWR Error:', error);
              // You can add global error handling here
            },
            revalidateOnFocus: false,
            revalidateOnReconnect: true,
            shouldRetryOnError: (error) => {
              // Don't retry on 4xx errors
              return error.status >= 500;
            },
            errorRetryCount: 3,
            errorRetryInterval: 1000,
          }}
        >
          {children}
        </SWRConfig>
      </ThemeProvider>
    </SessionProvider>
  );
}

