export function IdrBalanceCard() {
  return (
    <div className="bg-white border border-neutral-200 rounded-md p-6 md:p-8 flex flex-col justify-between h-full shadow-[0_2px_8px_-2px_rgba(0,0,0,0.02)]">
      {/* Top Section */}
      <div className="flex items-start justify-between relative mb-8">
        <div className="flex gap-4 items-start">
          {/* Icon Block */}
          <div className="bg-[#f3e8ff] rounded-xl flex items-center justify-center w-16 h-16 shrink-0 mt-1">
            <i className="fi fi-rr-credit-card text-2xl text-[#a855f7]"></i>
          </div>
          
          {/* Text Block */}
          <div className="flex flex-col pt-1">
            <span className="text-[15px] text-neutral-500 font-medium mb-1">
              Your IDR Balance
            </span>
            <span className="text-3xl md:text-[32px] font-semibold text-black leading-none tracking-tight">
              Rp 1.595.000
            </span>
          </div>
        </div>

        {/* Visibility Toggle - Anchored Top Right */}
        <button className="w-10 h-10 border border-neutral-100 rounded-md flex items-center justify-center text-neutral-400 hover:bg-neutral-50 hover:text-neutral-600 transition-colors shrink-0 absolute right-0 top-0">
          <i className="fi fi-rr-eye text-base"></i>
        </button>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3 mt-auto">
        <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-[#22c55e] text-[#22c55e] rounded-md text-sm font-medium hover:bg-[#f0fdf4] transition-colors shadow-sm h-[42px]">
          Withdraw <i className="fi fi-rr-money-bill-wave"></i>
        </button>
        <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#22c55e] hover:bg-[#16a34a] text-white rounded-md text-sm font-medium transition-colors shadow-sm h-[42px]">
          Top Up Balance <i className="fi fi-rr-plus-small text-lg"></i>
        </button>
      </div>
    </div>
  );
}
