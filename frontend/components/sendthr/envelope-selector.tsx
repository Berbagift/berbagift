import React, { useState } from 'react';
import { useSendThrStore } from '@/hooks/use-send-thr-state';
import { PRESET_ENVELOPES } from '@/lib/data/envelopes';
import { EnvelopeTemplateCard } from './envelope-template-card';
import { UploadSection } from './upload-section';
import { cn } from '@/lib/utils';
import { useEnvelopes } from '@/lib/api/queries';

const PAGE_SIZE = 3;

export function EnvelopeSelector() {
  const state = useSendThrStore();
  const { data: envelopes } = useEnvelopes();
  const presetEnvelopes = envelopes?.length ? envelopes : PRESET_ENVELOPES;
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(presetEnvelopes.length / PAGE_SIZE);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const displayedEnvelopes = presetEnvelopes.slice(startIndex, startIndex + PAGE_SIZE);

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
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
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayedEnvelopes.map((template) => (
                <EnvelopeTemplateCard
                  key={template.id}
                  template={template}
                  isSelected={state.selectedTemplateId === template.id}
                  onSelect={() => state.setSelectedTemplateId(template.id)}
                />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-2">
                <button
                  id="envelope-page-prev"
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  className="w-10 h-10 border border-border rounded-md flex items-center justify-center text-neutral-7 dark:text-neutral-3 hover:bg-neutral-2 dark:hover:bg-neutral-800 disabled:opacity-50 disabled:hover:bg-transparent transition-colors cursor-pointer"
                >
                  <i className="fi fi-rr-angle-left mt-0.5" />
                </button>
                
                {Array.from({ length: totalPages }).map((_, i) => {
                  const page = i + 1;
                  const isActive = page === currentPage;
                  return (
                    <button
                      id={`envelope-page-${page}`}
                      key={page}
                      type="button"
                      onClick={() => setCurrentPage(page)}
                      className={cn(
                        "w-10 h-10 rounded-md font-medium text-sm transition-colors cursor-pointer",
                        isActive 
                          ? "bg-[#16a34a] text-white border border-[#16a34a]" 
                          : "border border-border text-neutral-7 dark:text-neutral-3 hover:bg-neutral-2 dark:hover:bg-neutral-800"
                      )}
                    >
                      {page}
                    </button>
                  );
                })}

                <button
                  id="envelope-page-next"
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  className="w-10 h-10 border border-border rounded-md flex items-center justify-center text-neutral-7 dark:text-neutral-3 hover:bg-neutral-2 dark:hover:bg-neutral-800 disabled:opacity-50 disabled:hover:bg-transparent transition-colors cursor-pointer"
                >
                  <i className="fi fi-rr-angle-right mt-0.5" />
                </button>
              </div>
            )}
          </div>
        ) : (
          <UploadSection />
        )}
      </div>
    </div>
  );
}
