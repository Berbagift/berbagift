import React from 'react';
import { useSendThrStore } from '@/hooks/use-send-thr-state';
import { PRESET_ENVELOPES } from '@/lib/data/envelopes';
import { EnvelopeTemplateCard } from './envelope-template-card';
import { UploadSection } from './upload-section';
import { cn } from '@/lib/utils';

export function EnvelopeSelector() {
  const state = useSendThrStore();

  return (
    <div className="border border-border rounded-md p-4 sm:p-5 md:p-6 bg-white dark:bg-card flex flex-col gap-4 sm:gap-6">
      {/* Tabs */}
      <div className="flex flex-col sm:flex-row items-center bg-white dark:bg-card border border-border rounded-md overflow-hidden">
        <button
          onClick={() => state.setUploadMode('preset')}
          className={cn(
            "w-full sm:flex-1 flex items-center justify-center gap-2 py-3 sm:py-4 text-sm sm:text-base font-medium transition-colors",
            state.uploadMode === 'preset' 
              ? "text-[#16a34a] bg-neutral-2/50 dark:bg-neutral-10/50" 
              : "text-neutral-6 hover:text-black dark:text-neutral-1 hover:bg-neutral-2 dark:hover:bg-neutral-10"
          )}
        >
          <i className="fi fi-rr-magic-wand text-lg mt-0.5"></i>
          Choose Envelope Design
        </button>
        
        {/* Divider */}
        <div className="w-full sm:w-[1px] h-[1px] sm:h-8 bg-neutral-5 shrink-0"></div>

        <button
          onClick={() => state.setUploadMode('upload')}
          className={cn(
            "w-full sm:flex-1 flex items-center justify-center gap-2 py-3 sm:py-4 text-sm sm:text-base font-medium transition-colors",
            state.uploadMode === 'upload' 
              ? "text-[#16a34a] bg-neutral-2/50 dark:bg-neutral-10/50" 
              : "text-neutral-6 hover:text-black dark:text-neutral-1 hover:bg-neutral-2 dark:hover:bg-neutral-10"
          )}
        >
          <i className="fi fi-rr-cloud-upload text-lg mt-0.5"></i>
          Upload Your Own Design
        </button>
      </div>

      {/* Content */}
      <div className="pt-2">
        {state.uploadMode === 'preset' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {PRESET_ENVELOPES.map((template) => (
              <EnvelopeTemplateCard
                key={template.id}
                template={template}
                isSelected={state.selectedTemplateId === template.id}
                onSelect={() => state.setSelectedTemplateId(template.id)}
              />
            ))}
          </div>
        ) : (
          <UploadSection />
        )}
      </div>
    </div>
  );
}
