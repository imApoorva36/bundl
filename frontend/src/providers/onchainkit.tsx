'use client';

import { OnchainKitProvider } from '@coinbase/onchainkit';
import type { ReactNode } from 'react';
import { baseSepolia } from 'wagmi/chains';

export function Providers(props: { children: ReactNode }) {
  return (
    <OnchainKitProvider
      chain={baseSepolia}
      config={{
        appearance: {
          mode: 'light',
        }
      }}
    >
      {props.children}
    </OnchainKitProvider>
  );
}