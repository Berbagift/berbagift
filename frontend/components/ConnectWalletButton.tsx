"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { isConnected as isFreighterConnected, requestAccess, getNetworkDetails, signMessage } from '@stellar/freighter-api';
import { useWalletStore } from '@/hooks/use-wallet-state';
import axios from 'axios';
import { setAuthToken } from '@/lib/auth';

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
          // 1. Fetch nonce from backend directly
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
          let nonceString;
          try {
            const nonceRes = await axios.post(`${apiUrl}/api/auth/nonce`, { wallet_address: address });
            nonceString = nonceRes.data.data.nonce;
          } catch (err: any) {
            const msg = err.response?.data?.message || err.message;
            alert(`Error getting nonce: ${msg}`);
            return;
          }

          // 2. Prompt Freighter to sign the message
          try {
            const networkPassphrase = targetNetwork === 'PUBLIC'
              ? 'Public Global Stellar Network ; September 2015'
              : 'Testnet Stellar Network ; September 2015';
            const signature = await signMessage(nonceString, { networkPassphrase, address });
            if (!signature) {
              alert("Signature rejected by user.");
              return;
            }

            // Extract string safely across different Freighter API versions
            let signatureStr = typeof signature === 'object' 
              ? (signature as any).signedMessage || (signature as any).signature 
              : signature;
              
            if (typeof signatureStr === 'object' && signatureStr !== null) {
              // Convert Buffer/Uint8Array to base64 string
              if (signatureStr instanceof Uint8Array) {
                signatureStr = Buffer.from(signatureStr).toString('base64');
              } else if (signatureStr.type === 'Buffer' && Array.isArray(signatureStr.data)) {
                signatureStr = Buffer.from(signatureStr.data).toString('base64');
              } else {
                signatureStr = String(signatureStr);
              }
            }
            
            // 3. Send signature to backend for verification
            try {
              const signInRes = await axios.post(`${apiUrl}/api/auth/sign-in`, {
                wallet_address: address,
                signature: signatureStr
              });
              
              // 4. Success! Store the user ID, address, and set auth cookie
              const userId = signInRes.data.data.user_id;
              const accessToken = signInRes.data.data.access_token;
              
              if (accessToken) {
                setAuthToken(accessToken);
              }
              
              connect(address, userId);
              router.push('/dashboard');
            } catch (err: any) {
              const msg = err.response?.data?.message || err.message;
              alert(`Authentication failed: ${msg}`);
              return;
            }
            
          } catch (signErr: any) {
            console.error("Signature error:", signErr);
            alert("Failed to sign message: " + (signErr.message || signErr));
          }
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
