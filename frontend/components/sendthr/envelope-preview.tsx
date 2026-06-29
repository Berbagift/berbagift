"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSendThrStore } from "@/hooks/use-send-thr-state";
import { PRESET_ENVELOPES } from "@/lib/data/envelopes";
import { useEnvelopes } from "@/lib/api/queries";

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

  // =========================================================================
  // DEV MOCK CONFIGURATION
  // - Set IS_DEV_MODE to true to auto-simulate transitions (Processing -> Success)
  // - Set IS_DEV_MODE to false for testing real API endpoints/backend status integration
  // =========================================================================
  const IS_DEV_MODE = true;

  const handleConfirm = () => {
    state.setStatus('processing');
    if (IS_DEV_MODE) {
      setTimeout(() => {
        state.setStatus('success');
      }, 2000);
    }
  };

  return (
    <div className="flex flex-col h-full justify-between gap-6 lg:sticky lg:top-6">
      {/* Preview Card Container (Container 2a with border) */}
      <div className="border border-border rounded-lg p-6 bg-white dark:bg-card flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-6 text-[#16a34a] shrink-0">
          <i className="fi fi-rr-eye text-base mt-0.5 animate-pulse"></i>
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
