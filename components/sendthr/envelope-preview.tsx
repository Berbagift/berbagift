import React from "react";
import Image from "next/image";
import { useSendThrStore } from "@/hooks/use-send-thr-state";
import { PRESET_ENVELOPES } from "@/lib/data/envelopes";
import { cn } from "@/lib/utils";

export function EnvelopePreview() {
  const state = useSendThrStore();

  // Determine active background image
  let bgUrl = PRESET_ENVELOPES[0].imageUrl;
  if (state.uploadMode === "preset" && state.selectedTemplateId) {
    const preset = PRESET_ENVELOPES.find(
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

  return (
    <div className="border border-neutral-5 rounded-md p-6 bg-white dark:bg-card flex flex-col h-full min-h-[600px] lg:sticky lg:top-6">
      <div className="flex items-center gap-2 mb-6 text-[#16a34a]">
        <i className="fi fi-rr-eye text-sm"></i>
        <span className="text-base font-medium">Live Preview</span>
      </div>

      <div className="relative w-full flex-1 rounded-xl overflow-hidden shadow-sm border border-neutral-5 flex items-center justify-center p-8 text-center bg-neutral-2">
        {/* Background Image */}
        <Image
          src={bgUrl}
          alt="Envelope Preview Background"
          fill
          className="object-cover opacity-80"
          priority
        />

        {/* Foreground Content */}
        <div className="relative z-10 flex flex-col items-center max-w-[80%] bg-white dark:bg-card/70 backdrop-blur-md p-8 rounded-2xl shadow-sm border border-white/50">
          <div className="w-16 h-16 bg-[#16a34a]/10 text-[#16a34a] rounded-full flex items-center justify-center mb-6">
            <i className="fi fi-rr-gift text-2xl mt-1"></i>
          </div>

          <span className="text-sm text-neutral-8 font-medium mb-1">To</span>
          <h3 className="text-2xl font-bold text-black dark:text-neutral-1 mb-6">
            {recipientName}
          </h3>

          <span className="text-sm text-neutral-8 font-medium mb-2">
            You&apos;re Receiving
          </span>
          <div className="text-3xl font-bold text-[#16a34a] mb-2 drop-shadow-sm">
            {state.amount || "0.00"} {state.activeToken.symbol}
          </div>
          <div className="text-sm font-medium text-neutral-8 mb-6">
            ≈ {state.getFiatEquivalent(state.amount || "0")}
          </div>

          {state.message && (
            <div className="w-full pt-4 border-t border-neutral-8/20">
              <p className="text-sm text-neutral-8 italic">
                &quot;{state.message}&quot;
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
