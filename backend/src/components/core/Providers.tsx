"use client";

import { ReactNode } from 'react';
import { LaunchProvider } from '@/contexts/LaunchContext';
import { WalletContextProvider } from '@/contexts/WalletContext';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <WalletContextProvider>
      <LaunchProvider>
        {children}
      </LaunchProvider>
    </WalletContextProvider>
  );
}
