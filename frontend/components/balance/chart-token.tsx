"use client";
import { useState, useEffect } from 'react';
import { AdvancedRealTimeChart } from 'react-ts-tradingview-widgets'; // Sesuaikan import kamu

export default function ChartComponent({ activeTokenId, activeRange, rangeMapping }) {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) {
        // Tampilkan loading skeleton atau div kosong dengan ukuran yang sama
        return <div className="w-full h-[400px] md:h-[500px] bg-card animate-pulse" />;
    }

    return (
        <div className="w-full h-[400px] md:h-[500px]">
            <AdvancedRealTimeChart
                symbol={`${activeTokenId}USD`}
                theme="dark"
                autosize
                range={rangeMapping[activeRange] || "1M"}
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