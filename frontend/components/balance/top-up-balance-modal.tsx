'use client';

import React, { useMemo, useState } from 'react';

interface TopUpBalanceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const presetAmounts = [50000, 100000, 250000, 500000];

function formatIdr(amount: number) {
  return `Rp${amount.toLocaleString('id-ID')}`;
}

export function TopUpBalanceModal({ isOpen, onClose }: TopUpBalanceModalProps) {
  const [amount, setAmount] = useState(500000);

  const amountText = useMemo(() => formatIdr(amount), [amount]);

  if (!isOpen) return null;

  const closeModal = () => {
    setAmount(500000);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) closeModal();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="top-up-title"
        className="max-h-[calc(100vh-64px)] w-full max-w-[760px] overflow-y-auto rounded-md border border-border bg-white dark:bg-card p-6 shadow-[0_24px_80px_-24px_rgba(0,0,0,0.35)] md:p-10"
      >
        <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-3">
              <h2 id="top-up-title" className="text-3xl font-semibold text-black dark:text-neutral-1">
                Top up balance
              </h2>
              <p className="text-xl font-medium text-neutral-8">
                Add IDR balance instantly using QRIS payment
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <label htmlFor="top-up-amount" className="text-base font-semibold text-neutral-8">
                Enter amount
              </label>
              <input
                id="top-up-amount"
                value={amountText}
                onChange={(event) => {
                  const nextAmount = Number(event.target.value.replace(/\D/g, ''));
                  setAmount(nextAmount || 0);
                }}
                className="h-16 rounded-md border border-border px-5 text-xl font-semibold text-black dark:text-neutral-1 outline-none transition-colors focus:border-[#16a34a]"
              />

              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {presetAmounts.map((preset) => {
                  const isSelected = amount === preset;

                  return (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setAmount(preset)}
                      className={[
                        'h-12 rounded-full border px-4 text-xl font-semibold transition-colors',
                        isSelected
                          ? 'border-[#dcfce7] bg-[#e8f6ed] text-[#16a34a]'
                          : 'border-border bg-white dark:bg-card text-neutral-8 hover:bg-neutral-2',
                      ].join(' ')}
                    >
                      {formatIdr(preset)}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <span className="text-base font-semibold text-neutral-8">
                Payment Method
              </span>
              <div className="flex items-center gap-6 rounded-md border border-[#16a34a] p-5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://placehold.co/160x72/ffffff/000000?text=QRIS"
                  alt="QRIS logo"
                  className="h-[72px] w-[160px] shrink-0 object-contain"
                />
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <h3 className="text-xl font-semibold text-black dark:text-neutral-1">QRIS Payment</h3>
                  <p className="text-xl font-medium leading-snug text-neutral-8">
                    Pay using any e-wallet or mobile banking app
                  </p>
                </div>
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#16a34a] text-white">
                  <i className="fi fi-rr-check text-xl leading-none" />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <span className="text-base font-semibold text-neutral-8">
                Top up summary
              </span>
              <div className="rounded-md border border-border px-6 py-2">
                <div className="flex items-center justify-between gap-4 border-b border-border py-5 text-xl font-semibold text-black dark:text-neutral-1">
                  <span>Top up amount</span>
                  <span>{amountText}</span>
                </div>
                <div className="flex items-center justify-between gap-4 border-b border-border py-5 text-xl font-semibold text-black dark:text-neutral-1">
                  <span>Platform fee</span>
                  <span>Free</span>
                </div>
                <div className="flex items-center justify-between gap-4 py-5 text-xl font-semibold text-[#16a34a]">
                  <span>Total amount</span>
                  <span>{amountText}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <button
                type="button"
                onClick={closeModal}
                className="h-14 rounded-md border border-[#22c55e] text-xl font-semibold text-[#22c55e] transition-colors hover:bg-[#f0fdf4]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={closeModal}
                className="h-14 rounded-md bg-[#16a34a] text-xl font-semibold text-white transition-colors hover:bg-[#15803d]"
              >
                Continue
              </button>
            </div>
          </div>
      </div>
    </div>
  );
}
