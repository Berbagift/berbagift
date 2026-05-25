export function TransferCard() {
  return (
    <div className="bg-white border border-neutral-200 rounded-md p-6 md:p-8 flex flex-col justify-between h-full shadow-[0_2px_8px_-2px_rgba(0,0,0,0.02)]">
      {/* Top Zone */}
      <div className="flex gap-6 mb-8">
        {/* Icon Block */}
        <div className="bg-[#f0fdf4] rounded-xl flex items-center justify-center w-20 h-20 shrink-0 mt-1">
          <i className="fi fi-rr-paper-plane text-3xl text-[#22c55e]"></i>
        </div>
        
        {/* Text Block */}
        <div className="flex flex-col">
          <h3 className="text-2xl md:text-[28px] font-medium text-black mb-2 tracking-tight leading-none">
            Transfer THR Directly
          </h3>
          <p className="text-[15px] md:text-base text-neutral-500 font-medium leading-snug max-w-[360px]">
            Transfer token directly to anyone using their @username. Fast, simple, and secure blockchain mechanism.
          </p>
        </div>
      </div>

      {/* Bottom Zone - Anchored to bottom with large breathing room */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 sm:mt-10">
        {/* Security Badge */}
        <div className="flex items-center gap-2 bg-[#fffbeb] text-[#d97706] px-3 py-1.5 rounded-md text-sm font-medium w-full sm:w-auto">
          <i className="fi fi-rr-shield-check mt-0.5"></i>
          <span>Transfer mechanism using secure blockchain protocol</span>
        </div>
        
        {/* Send Button */}
        <button className="bg-[#16a34a] hover:bg-[#15803d] text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors w-full sm:w-auto justify-center shadow-sm">
          Send THR Now
          <i className="fi fi-rr-angle-small-right text-lg"></i>
        </button>
      </div>
    </div>
  );
}
