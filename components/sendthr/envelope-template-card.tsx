import React from 'react';
import Image from 'next/image';
import { EnvelopeTemplate } from '@/lib/data/envelopes';
import { cn } from '@/lib/utils';

interface EnvelopeTemplateCardProps {
  template: EnvelopeTemplate;
  isSelected: boolean;
  onSelect: () => void;
}

export function EnvelopeTemplateCard({ template, isSelected, onSelect }: EnvelopeTemplateCardProps) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        "relative flex flex-col items-start gap-3 p-3 rounded-md border text-left transition-all overflow-hidden",
        isSelected ? "border-[#16a34a] bg-[#16a34a]/5" : "border-neutral-5 hover:border-neutral-8 bg-white"
      )}
    >
      <div className="relative w-full aspect-[3/2] rounded overflow-hidden bg-neutral-2">
        <Image
          src={template.imageUrl}
          alt={template.title}
          fill
          className="object-cover"
        />
        {isSelected && (
          <div className="absolute top-2 right-2 w-6 h-6 bg-[#16a34a] rounded-full flex items-center justify-center text-white shadow-sm z-10">
            <i className="fi fi-rr-check text-xs mt-[2px]"></i>
          </div>
        )}
      </div>
      <span className="text-sm font-medium text-black px-1">{template.title}</span>
    </button>
  );
}
