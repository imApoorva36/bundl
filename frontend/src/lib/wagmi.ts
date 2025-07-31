import { http, cookieStorage, createConfig, createStorage } from 'wagmi';
import { baseSepolia } from 'wagmi/chains';
import { metaMask, walletConnect, injected } from 'wagmi/connectors';

export function getConfig() {
  return createConfig({
    chains: [baseSepolia],
    connectors: [
      metaMask(),
      injected(),
      walletConnect({
        projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'your-project-id',
      }),
    ],
    storage: createStorage({
      storage: cookieStorage,
    }),
    ssr: true,
    transports: {
      [baseSepolia.id]: http('https://sepolia.base.org'),
    },
  });
}
