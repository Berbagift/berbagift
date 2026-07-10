"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSendThrStore } from "@/hooks/use-send-thr-state";
import { PRESET_ENVELOPES } from "@/lib/data/envelopes";
import { useEnvelopes } from "@/lib/api/queries";
import { usersService } from "@/lib/api/services/users";


export function EnvelopePreview() {
  const router = useRouter();
  const state = useSendThrStore();
  const { data: envelopes } = useEnvelopes();
  const presetEnvelopes = envelopes?.length ? envelopes : PRESET_ENVELOPES;

  // Determine active background image
  let bgUrl = presetEnvelopes[0].imageUrl;
  if (state.uploadMode === "preset" && state.selectedTemplateId) {
    const preset = presetEnvelopes.find(
      (p) => p.id === state.selectedTemplateId,
    );
    if (preset) bgUrl = preset.imageUrl;
  } else if (state.uploadMode === "upload" && state.selectedUploadedDesignId) {
    const custom = state.uploadedDesigns.find(
      (d) => d.id === state.selectedUploadedDesignId,
    );
    if (custom) bgUrl = custom.url;
  }

  // Recipient Display Logic
  const primaryRecipient = state.recipients[0];
  const additionalCount =
    state.recipients.length > 1 ? state.recipients.length - 1 : 0;

  const recipientName = primaryRecipient
    ? `${primaryRecipient.username}${additionalCount > 0 ? ` +${additionalCount}` : ""}`
    : "Recipient Name";



  /**
   * Resolve the active envelope image to a File/Blob for Pinata upload.
   * - preset: fetch the URL from CDN as a blob
   * - upload: already stored as a blob URL in uploadedDesigns
   */
  const getEnvelopeFile = async (): Promise<File> => {
    if (state.uploadMode === "upload" && state.selectedUploadedDesignId) {
      const custom = state.uploadedDesigns.find(
        (d) => d.id === state.selectedUploadedDesignId
      );
      if (custom) {
        const res = await fetch(custom.url);
        const blob = await res.blob();
        const ext = blob.type.includes("png") ? "png" : "jpg";
        return new File([blob], `envelope-custom.${ext}`, { type: blob.type });
      }
    }
    // Preset: fetch image by URL
    const res = await fetch(bgUrl);
    const blob = await res.blob();
    const ext = blob.type.includes("png") ? "png" : "jpg";
    return new File([blob], `envelope-preset.${ext}`, { type: blob.type });
  };

  const handleConfirm = async () => {
    if (state.recipients.length === 0) {
      alert("Please add at least one recipient.");
      return;
    }

    state.setStatus("processing");

    // ── Pre-flight: Get live Freighter address & verify network ───────────────
    // IMPORTANT: must get address BEFORE building the transaction so the same
    // key is used as both the source account and the signer.
    const { requestAccess, getNetwork, signTransaction } = await import("@stellar/freighter-api");
    const { config } = await import("@/lib/stellar/transactions");

    const { address: senderAddress, error: addrErr } = await requestAccess();
    if (addrErr || !senderAddress) {
      state.setStatus("error");
      alert("Could not read address from Freighter. Please unlock your wallet and try again.");
      return;
    }

    const { network: freighterNetwork } = await getNetwork();
    const expectedNetwork = process.env.NEXT_PUBLIC_STELLAR_NETWORK || "TESTNET";
    if (freighterNetwork && freighterNetwork.toUpperCase() !== expectedNetwork.toUpperCase()) {
      state.setStatus("error");
      alert(`Wallet is on ${freighterNetwork} but app expects ${expectedNetwork}. Please switch networks in Freighter.`);
      return;
    }

    try {
      // ── Step 1: Resolve usernames → wallet addresses ──────────────────────
      console.debug('[BagiTHR] senderAddress (from Freighter):', senderAddress);

      const resolvedRecipients: Array<{
        walletAddress: string;
        username: string;
      }> = [];

      for (const rec of state.recipients) {
        try {
          const userData = await usersService.getUserByUsername(rec.username);
          resolvedRecipients.push({
            walletAddress: userData.wallet_address,
            username: rec.username,
          });
        } catch {
          throw new Error(`Username not found or invalid: @${rec.username}`);
        }
      }

      // ── Step 2: Upload envelope image to Pinata IPFS ──────────────────────
      const { pinFileToIPFS, pinJSONToIPFS } = await import("@/lib/pinata.js");

      let tokenUri: string;
      try {
        const envelopeFile = await getEnvelopeFile();
        const imageHash = await pinFileToIPFS(envelopeFile, {
          name: `BagiTHR-envelope-${Date.now()}`,
        });

        // Pin NFT metadata JSON to IPFS (OpenSea-compatible format)
        const metadataHash = await pinJSONToIPFS(
          {
            name: "BagiTHR NFT",
            description: state.message || "A BagiTHR gift sent via BagiTHR Platform",
            image: `ipfs://${imageHash}`,
            attributes: [
              { trait_type: "Token", value: state.activeToken.symbol },
              { trait_type: "Amount", value: state.amount },
              {
                trait_type: "Recipients",
                value: resolvedRecipients.map((r) => r.username).join(", "),
              },
            ],
          },
          { name: `BagiTHR-metadata-${Date.now()}` }
        );
        tokenUri = `ipfs://${metadataHash}`;
      } catch (pinErr: any) {
        throw new Error(
          "Failed to upload envelope to IPFS. Check your Pinata API keys. Details: " +
            (pinErr?.message || pinErr)
        );
      }

      // ── Step 3: Build recipients payload for Soroban contract ─────────────
      const totalAmount = parseFloat(state.amount);
      const amountPerRecipient = (
        totalAmount / resolvedRecipients.length
      ).toFixed(7);

      const nftRecipients = resolvedRecipients.map((r) => ({
        walletAddress: r.walletAddress,
        amount: amountPerRecipient,
        message: state.message || "Selamat Hari Raya! 🎁",
        tokenUri,
      }));

      // ── Step 4: Build Soroban transaction (use senderAddress from Freighter) ─
      const { buildNftGiftTx, submitNftGiftTx } = await import(
        "@/lib/stellar/nft-gift"
      );
      // senderAddress was fetched live from Freighter BEFORE this step,
      // guaranteeing it's the same key that will sign the transaction.
      const xdr = await buildNftGiftTx(
        senderAddress,
        state.activeToken.id, // 'XLM' or 'RPK'
        nftRecipients
      );

      // ── Step 5: Sign via Freighter (same address used to build the tx) ───────
      const { signedTxXdr, error: signError } = await signTransaction(xdr, {
        networkPassphrase: config.networkPassphrase,
        address: senderAddress,
      });

      if (signError) {
        throw new Error(signError.message || "Transaction signing rejected by user");
      }
      if (!signedTxXdr) {
        throw new Error("Freighter returned empty signed XDR");
      }

      const signedXdr = signedTxXdr;

      // ── Step 6: Submit to Soroban RPC ──────────────────────────────────────
      const result = await submitNftGiftTx(signedXdr);

      state.setTxHash(result.hash);
      state.setStatus("success");
      // Form state will be reset when the user clicks "Done" on the success screen.
    } catch (err: any) {
      console.error("Transaction failed:", err);
      alert(err.message || "Transaction failed. Please try again.");
      state.setStatus("error");
    }
  };

  return (
    <div className="flex flex-col h-full justify-between gap-6 lg:sticky lg:top-6">
      {/* Preview Card Container (Container 2a with border) */}
      <div className="border border-border rounded-lg p-6 bg-white dark:bg-card flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-6 text-[#16a34a] shrink-0">
          <i className="fi fi-rr-eye text-base mt-0.5"></i>
          <span className="text-base font-medium">Live Preview</span>
        </div>

        {/* Centered preview block */}
        <div className="flex-1 flex items-center justify-center">
          {/* Outer container with fixed aspect ratio matching Figma 436x624 */}
          <div className="relative w-full aspect-[436/624] max-w-[436px] rounded-lg overflow-hidden flex items-center justify-center p-8 text-center bg-neutral-2">
            {/* Background Image */}
            <Image
              src={bgUrl}
              alt="Envelope Preview Background"
              fill
              className="object-cover opacity-90"
              priority
            />

            {/* Foreground Content - Directly over the background (no card wrapper) */}
            <div className="relative z-10 flex flex-col items-center justify-center h-full w-full gap-8 p-4">
              {/* Gift Icon */}
              <div className="text-[#16a34a] mb-2 flex items-center justify-center">
                <i className="fi fi-rr-gift text-[48px] leading-none"></i>
              </div>

              <div className="flex flex-col items-center text-center gap-1">
                <span className="text-[20px] font-normal text-black leading-none">To</span>
                <h3 className="text-[30px] font-semibold text-black leading-tight tracking-tight">
                  {recipientName}
                </h3>
              </div>

              <div className="flex flex-col items-center text-center gap-1.5">
                <span className="text-[20px] font-medium text-black leading-none">
                  You&apos;re Receiving
                </span>
                <div className="text-[30px] font-semibold text-[#16a34a] leading-none tracking-tight">
                  {state.amount || "0.00"} {state.activeToken.symbol}
                </div>
                <div className="text-[20px] font-medium text-black leading-none mt-1">
                  = {state.getFiatEquivalent(state.amount || "0")}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons (Container 2b outside the preview card border) */}
      <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
        <button
          onClick={() => router.back()}
          className="w-full sm:flex-1 h-12 rounded-lg border border-[#16a34a] hover:bg-[#16a34a]/5 dark:hover:bg-[#16a34a]/10 bg-white dark:bg-card text-[#16a34a] font-medium text-[15px] transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          Back to Previous
        </button>

        <button
          onClick={handleConfirm}
          className="w-full sm:flex-1 h-12 rounded-lg bg-[#16a34a] hover:bg-[#15803d] text-white font-medium text-[15px] transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          Confirm Transfer
        </button>
      </div>
    </div>
  );
}
