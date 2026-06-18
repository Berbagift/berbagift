"use client";

import React from "react";
import { SummaryCards } from "@/components/sendthr/summary-cards";
import { EnvelopeSelector } from "@/components/sendthr/envelope-selector";
import { EnvelopePreview } from "@/components/sendthr/envelope-preview";

export default function EnvelopeSelectionPage() {
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
