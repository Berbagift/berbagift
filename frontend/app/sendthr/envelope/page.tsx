"use client";

import React from "react";
import { SummaryCards } from "@/components/sendthr/summary-cards";
import { EnvelopeSelector } from "@/components/sendthr/envelope-selector";
import { EnvelopePreview } from "@/components/sendthr/envelope-preview";
import { useSendThrStore } from "@/hooks/use-send-thr-state";
import { StatusState } from "@/components/shared/status-state";

export default function EnvelopeSelectionPage() {
  const status = useSendThrStore((state) => state.status);
  const setStatus = useSendThrStore((state) => state.setStatus);

  if (status === "processing") {
    return (
      <StatusState
        icon="fi-rr-time-forward"
        title="Sending your THR securely through the network."
        iconColorClass="text-neutral-600 dark:text-neutral-400"
        bgColorClass="bg-neutral-100 dark:bg-neutral-800/40"
        className="py-24 animate-in fade-in duration-500"
      />
    );
  }

  if (status === "success") {
    return (
      <StatusState
        icon="fi-rr-time-check"
        title="Your THR has been sent successfully."
        iconColorClass="text-emerald-600 dark:text-emerald-400"
        bgColorClass="bg-emerald-50 dark:bg-emerald-950/20"
        buttonText="Done"
        onButtonClick={() => setStatus("form")}
        className="py-24 animate-in fade-in duration-500"
      />
    );
  }

  if (status === "error") {
    return (
      <StatusState
        icon="fi-rr-time-delete"
        title="Transfer failed. Please check your balance and try again."
        iconColorClass="text-red-500"
        bgColorClass="bg-red-50 dark:bg-red-950/20"
        buttonText="Try Again"
        onButtonClick={() => setStatus("form")}
        className="py-24 animate-in fade-in duration-500"
      />
    );
  }

  return (
    <div className="w-full flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] xl:grid-cols-[1.4fr_1fr] gap-6 items-stretch">
        {/* Left Column - Container Utama */}
        <div className="border border-border rounded-lg p-6 bg-white dark:bg-card flex flex-col gap-6 h-full">
          <SummaryCards />
          <EnvelopeSelector />
        </div>

        {/* Right Column - Container Kedua */}
        <div className="w-full h-full">
          <EnvelopePreview />
        </div>
      </div>
    </div>
  );
}
