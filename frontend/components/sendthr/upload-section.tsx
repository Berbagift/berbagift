import Image from 'next/image';
import { useSendThrStore } from '@/hooks/use-send-thr-state';
import { cn } from '@/lib/utils';

export function UploadSection() {
  const state = useSendThrStore();

  const handleSimulatedUpload = () => {
    // Simulate an API upload delay and then add a dummy image
    const newDesign = {
      id: `upload-${Date.now()}`,
      url: 'https://placehold.co/436x624/f8f9fa/16a34a?text=Custom+Design',
      title: `My Custom Design ${state.uploadedDesigns.length + 1}`,
    };
    state.addUploadedDesign(newDesign);
  };

  if (state.uploadedDesigns.length === 0) {
    return (
      <div 
        className="border-2 border-dashed border-border rounded-md p-20 flex flex-col items-center justify-center text-center hover:border-[#16a34a] hover:bg-[#16a34a]/5 transition-colors cursor-pointer w-full"
        onClick={handleSimulatedUpload}
      >
        <div className="w-16 h-16 bg-neutral-2 rounded-full flex items-center justify-center mb-6 text-neutral-8">
          <i className="fi fi-rr-cloud-upload text-3xl mt-1"></i>
        </div>
        <span className="text-base font-medium text-black dark:text-neutral-1 mb-1">Add your own envelope design</span>
        <span className="text-sm text-neutral-6">in PNG or JPG format</span>
        <span className="text-sm text-neutral-6">(minimum size 436 × 624 px)</span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Upload Dropzone Card */}
      <div
        className="border-2 border-dashed border-border rounded-md p-6 flex flex-col items-center justify-center text-center hover:border-[#16a34a] hover:bg-[#16a34a]/5 transition-colors cursor-pointer min-h-[160px]"
        onClick={handleSimulatedUpload}
      >
        <div className="w-10 h-10 bg-neutral-2 rounded-full flex items-center justify-center mb-3 text-neutral-8">
          <i className="fi fi-rr-cloud-upload text-lg mt-1"></i>
        </div>
        <span className="text-sm font-medium text-black dark:text-neutral-1">Upload Design</span>
      </div>

      {/* Uploaded Designs Grid */}
      {state.uploadedDesigns.map((design) => (
        <div
          key={design.id}
          onClick={() => state.setSelectedUploadedDesignId(design.id)}
          className={cn(
            "relative flex flex-col items-start gap-3 p-3 rounded-md border text-left transition-all cursor-pointer overflow-hidden",
            state.selectedUploadedDesignId === design.id ? "border-[#16a34a] bg-[#16a34a]/5" : "border-border hover:border-neutral-8 bg-white dark:bg-card"
          )}
        >
          <div className="relative w-full aspect-[3/2] rounded overflow-hidden bg-neutral-2">
            <Image
              src={design.url}
              alt={design.title}
              fill
              className="object-cover"
            />
            {state.selectedUploadedDesignId === design.id && (
              <div className="absolute top-2 right-2 w-6 h-6 bg-[#16a34a] rounded-full flex items-center justify-center text-white shadow-sm z-10">
                <i className="fi fi-rr-check text-xs mt-[2px]"></i>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between w-full px-1">
            <span className="text-sm font-medium text-black dark:text-neutral-1 truncate pr-2">{design.title}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                state.removeUploadedDesign(design.id);
              }}
              className="w-7 h-7 flex items-center justify-center rounded bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-colors flex-shrink-0"
              title="Delete Design"
            >
              <i className="fi fi-rr-trash text-xs"></i>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
