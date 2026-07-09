"use client";
import { useState, useEffect } from 'react';

// Define allowed range values for the TradingView widget
type Range = "1M" | "1D" | "5D" | "3M" | "6M" | "YTD" | "12M" | "60M" | "ALL" | undefined;
import { AdvancedRealTimeChart } from 'react-ts-tradingview-widgets'; // Sesuaikan import kamu



interface ChartComponentProps {
  activeTokenId: string;
  activeRange: string;
  // Mapping from any activeRange key to a valid Range value
  rangeMapping: Record<string, Range>;
}

export default function ChartComponent({ activeTokenId, activeRange, rangeMapping }: ChartComponentProps) {
    const [isMounted, setIsMounted] = useState(false);
    const [theme, setTheme] = useState<'light' | 'dark'>('dark');

    useEffect(() => {
        const isDark = document.documentElement.classList.contains('dark');
        const timeoutId = window.setTimeout(() => {
            setIsMounted(true);
            setTheme(isDark ? 'dark' : 'light');
        }, 0);

        const observer = new MutationObserver(() => {
            const isDarkNow = document.documentElement.classList.contains('dark');
            setTheme(isDarkNow ? 'dark' : 'light');
        });

        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class'],
        });

        return () => {
            window.clearTimeout(timeoutId);
            observer.disconnect();
        };
    }, []);

    if (!isMounted) {
        // Tampilkan loading skeleton atau div kosong dengan ukuran yang sama
        return <div className="w-full h-[400px] md:h-[500px] bg-emerald-50/50 dark:bg-emerald-900/10 rounded-xl animate-pulse" />;
    }

    return (
        <div className="w-full h-[400px] md:h-[500px]">
            <AdvancedRealTimeChart
                symbol={`${activeTokenId}USD`}
                theme={theme}
                autosize
                range={(rangeMapping[activeRange] ?? "1M") as Range}
                // Tambahkan baris di bawah ini untuk mengunci interval ke harian
                interval={activeRange === "1M" ? "D" : undefined}
                hide_side_toolbar={true}
                hide_top_toolbar={true}
                hide_legend={true}
                withdateranges={false}
                allow_symbol_change={false}
                save_image={false}
                details={false}
                calendar={false}
                disabled_features={["create_volume_indicator_by_default"]}
            />
        </div>
    );
}
