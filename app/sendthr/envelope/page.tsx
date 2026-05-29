"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { SummaryCards } from "@/components/sendthr/summary-cards";
import { EnvelopeSelector } from "@/components/sendthr/envelope-selector";
import { EnvelopePreview } from "@/components/sendthr/envelope-preview";
import { ActionSubmitButton } from "@/components/forms/action-submit-button";

export default function EnvelopeSelectionPage() {
  const router = useRouter();

  const handleConfirm = () => {
    // In a real application, trigger the blockchain transaction flow here
    alert("Transfer Confirmed! Initiating blockchain transaction...");
  };

  return (
    <div className="w-full flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] xl:grid-cols-[1.5fr_1fr] gap-6 items-start">
        {/* Left Column */}
        <div className="flex flex-col w-full">
          <SummaryCards />
          <EnvelopeSelector />
        </div>

        {/* Right Column */}
        <div className="w-full h-full min-h-125">
          <EnvelopePreview />
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="flex items-center justify-end gap-3 mt-4">
        <button
          onClick={() => router.back()}
          className="px-5 py-2.5 rounded-md border border-neutral-5 text-black font-medium text-sm hover:bg-neutral-2 transition-colors flex items-center gap-2"
        >
          <i className="fi fi-rr-angle-small-left text-lg leading-none"></i>
          Back to Previous
        </button>

        <div className="w-auto min-w-[200px]">
          <ActionSubmitButton
            icon="fi-rr-arrow-small-right"
            onClick={handleConfirm}
          >
            Confirm Transfer
          </ActionSubmitButton>
        </div>
      </div>
    </div>
  );
}
