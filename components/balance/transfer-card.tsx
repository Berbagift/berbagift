export function TransferCard() {
  return (
    <div className="bg-white border border-neutral-200 rounded-md p-6 md:p-8 flex flex-col justify-between h-full shadow-[0_2px_8px_-2px_rgba(0,0,0,0.02)]">
      {/* Top Zone */}
      <div className="flex gap-6 md:gap-8 mb-10 items-start">
        {/* Icon Block */}
        <div className="bg-[#f0fdf4] rounded-md flex items-center justify-center w-[72px] h-[72px] shrink-0 mt-1">
          <i className="fi fi-rr-paper-plane text-[28px] text-[#22c55e]"></i>
        </div>

        {/* Text Block */}
        <div className="flex flex-col flex-grow">
          <h3 className="text-2xl md:text-[28px] font-medium text-black mb-2.5 tracking-tight leading-none">
            Transfer THR Directly
          </h3>
          <p className="text-[15px] md:text-base text-neutral-500 font-medium leading-relaxed max-w-[540px]">
            Transfer token directly to anyone using their @username. Fast, simple, and secure blockchain mechanism.
          </p>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-5 sm:gap-4 mt-auto border-t border-transparent">
        {/* Security Badge */}
        <div className="flex items-center gap-2.5 bg-[#fffbeb] text-[#d97706] px-3.5 py-1.5 rounded-md text-[14px] md:text-[15px] font-medium w-max shrink-0">
          <i className="fi fi-rr-shield-check mt-0.5 text-base"></i>
          <span>Transfer mechanism using secure blockchain protocol</span>
        </div>

        {/* Send Button */}
        <button className="bg-[#16a34a] hover:bg-[#15803d] text-white px-4 py-2 rounded-md text-[14px] md:text-[15px] font-medium flex items-center gap-1.5 transition-colors w-max shrink-0 shadow-sm">
          Send THR Now
          <i className="fi fi-rr-angle-small-right text-[18px]"></i>
        </button>
      </div>
    </div>
  );
}
