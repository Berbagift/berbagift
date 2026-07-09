"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { isConnected as isFreighterConnected, requestAccess, getNetworkDetails, signMessage } from '@stellar/freighter-api';
import { useWalletStore } from '@/hooks/use-wallet-state';
import { setAuthToken } from '@/lib/auth';
import { apiClient, getErrorMessage } from '@/lib/api/client';

type SignaturePayload = {
  signedMessage?: unknown;
  signature?: unknown;
  type?: string;
  data?: number[];
};

function signatureToString(signature: unknown): string {
  const payload =
    signature && typeof signature === 'object'
      ? (signature as SignaturePayload).signedMessage ?? (signature as SignaturePayload).signature ?? signature
      : signature;

  if (payload instanceof Uint8Array) {
    return Buffer.from(payload).toString('base64');
  }

  if (
    payload &&
    typeof payload === 'object' &&
    (payload as SignaturePayload).type === 'Buffer' &&
    Array.isArray((payload as SignaturePayload).data)
  ) {
    return Buffer.from((payload as SignaturePayload).data ?? []).toString('base64');
  }

  return String(payload);
}

export function ConnectWalletButton() {
  const router = useRouter();
  const [isConnecting, setIsConnecting] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { connect, isConnected: isWalletConnected, publicKey } = useWalletStore();

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setMounted(true), 0);
    return () => window.clearTimeout(timeoutId);
  }, []);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      const { isConnected } = await isFreighterConnected();
      if (isConnected) {
        const expectedNetwork = process.env.NEXT_PUBLIC_STELLAR_NETWORK?.toUpperCase() || 'TESTNET';

        let networkDetails;
        try {
          networkDetails = await getNetworkDetails();
        } catch (err) {
          console.error("getNetworkDetails error:", err);
        }

        const { network, error: networkError } = networkDetails || {};

        // Freighter typically uses 'PUBLIC' instead of 'MAINNET'
        const targetNetwork = expectedNetwork === 'MAINNET' ? 'PUBLIC' : expectedNetwork;

        if (!network || networkError) {
          alert("Error fetching network details: " + (networkError || "Wallet not ready"));
          return;
        }

        if (network?.toUpperCase() !== targetNetwork) {
          alert(`Please switch your Freighter wallet network to ${targetNetwork}. Current network: ${network}`);
          return;
        }

        const { address, error } = await requestAccess();
        if (address) {
          // 1. Fetch nonce from backend via centralized apiClient
          let nonceString;
          try {
            const nonceRes = await apiClient.post('/auth/nonce', { wallet_address: address });
            nonceString = nonceRes.data.data.nonce;
          } catch (err) {
            alert(`Error getting nonce: ${getErrorMessage(err)}`);
            return;
          }

          // 2. Prompt Freighter to sign the message
          try {
            // Use the networkPassphrase returned from getNetworkDetails to ensure a perfect match
            const networkPassphrase = networkDetails?.networkPassphrase;

            const signResult = await signMessage(nonceString, { networkPassphrase, address });
            // @ts-ignore - Handle various Freighter API version return types
            if (!signResult || signResult.error || (!signResult.signedMessage && !signResult.signature && typeof signResult === 'object' && !Buffer.isBuffer(signResult) && !(signResult instanceof Uint8Array))) {
              // @ts-ignore
              alert("Signature failed or rejected by user: " + (signResult?.error || ""));
              return;
            }

            const signatureStr = signatureToString(signResult);

            // 3. Send signature to backend for verification
            try {
              const signInRes = await apiClient.post('/auth/sign-in', {
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
              window.location.href = '/dashboard';
            } catch (err) {
              alert(`Authentication failed: ${getErrorMessage(err)}`);
              return;
            }

          } catch (signErr) {
            console.error("Signature error:", signErr);
            alert("Failed to sign message: " + getErrorMessage(signErr));
          }
        } else {
          console.error("Freighter error:", error);
          alert(getErrorMessage(error) || "Failed to connect Freighter.");
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
      <Button disabled className="rounded-full shadow-none font-medium px-6">
        Connect Wallet
      </Button>
    );
  }

  if (isWalletConnected) {
    const displayAddress = publicKey
      ? `${publicKey.substring(0, 4)}....${publicKey.substring(publicKey.length - 4)}`
      : "Dashboard";

    return (
      <Button
        onClick={() => router.push('/dashboard')}
        className="rounded-full shadow-none font-medium px-6"
      >
        {displayAddress}
      </Button>
    );
  }

  return (
    <Button
      onClick={handleConnect}
      disabled={isConnecting}
      className="rounded-full shadow-none font-medium px-6"
    >
      {isConnecting ? "Connecting..." : "Connect Wallet"}
    </Button>
  );
}
