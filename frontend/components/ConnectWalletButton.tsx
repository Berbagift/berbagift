"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { isConnected as isFreighterConnected, requestAccess, getNetworkDetails } from '@stellar/freighter-api';
import { useWalletStore } from '@/hooks/use-wallet-state';

export function ConnectWalletButton() {
  const router = useRouter();
  const [isConnecting, setIsConnecting] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { connect, isConnected: isWalletConnected } = useWalletStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      if (await isFreighterConnected()) {
        const expectedNetwork = process.env.NEXT_PUBLIC_STELLAR_NETWORK?.toUpperCase() || 'TESTNET';
        const { network, error: networkError } = await getNetworkDetails();
        
        // Freighter typically uses 'PUBLIC' instead of 'MAINNET'
        const targetNetwork = expectedNetwork === 'MAINNET' ? 'PUBLIC' : expectedNetwork;

        if (networkError) {
          alert("Error fetching network details: " + networkError);
          return;
        }

        if (network?.toUpperCase() !== targetNetwork) {
          alert(`Please switch your Freighter wallet network to ${targetNetwork}. Current network: ${network}`);
          return;
        }

        const { address, error } = await requestAccess();
        if (address) {
          connect(address);
          router.push('/dashboard');
        } else {
          console.error("Freighter error:", error);
          alert(error || "Failed to connect Freighter.");
        }
      } else {
        alert("Please install the Freighter wallet extension to continue.");
      }
    } catch (error) {
      console.error("Error connecting wallet:", error);
    } finally {
      setIsConnecting(false);
    }
  };

  if (!mounted) {
    return (
      <Button disabled className="rounded-full shadow-none font-medium px-6 transition-all hover:-translate-y-0.5">
        Connect Wallet
      </Button>
    );
  }

  if (isWalletConnected) {
    return (
      <Button 
        onClick={() => router.push('/dashboard')}
        className="rounded-full shadow-none font-medium px-6 transition-all hover:-translate-y-0.5"
      >
        Dashboard
      </Button>
    );
  }

  return (
    <Button 
      onClick={handleConnect}
      disabled={isConnecting}
      className="rounded-full shadow-none font-medium px-6 transition-all hover:-translate-y-0.5"
    >
      {isConnecting ? "Connecting..." : "Connect Wallet"}
    </Button>
  );
}
