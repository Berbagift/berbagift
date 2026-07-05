'use client';

import { useEffect, useRef } from 'react';
import { createChart, ColorType, IChartApi, ISeriesApi, AreaSeries, LineType, Time, LogicalRange } from 'lightweight-charts';
import { useBinanceKlinesInfinite } from '@/lib/api/queries';

interface LightweightChartProps {
  activeTokenId: string;
  activeRange: string;
}

export function LightweightChart({ activeTokenId, activeRange }: LightweightChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Area"> | null>(null);
  const prevDataLengthRef = useRef<number>(0);
  const isInitialRangeSetRef = useRef<boolean>(false);

  // Fetch real-time price history with infinite scroll capabilities
  const { 
    data: chartData, 
    isLoading, 
    isError, 
    fetchNextPage, 
    isFetchingNextPage, 
    hasNextPage 
  } = useBinanceKlinesInfinite(activeTokenId, activeRange);

  // Ref wrapper to keep scroll callback updated with latest Query state
  const queryStateRef = useRef({ fetchNextPage, isFetchingNextPage, hasNextPage });
  useEffect(() => {
    queryStateRef.current = { fetchNextPage, isFetchingNextPage, hasNextPage };
  }, [fetchNextPage, isFetchingNextPage, hasNextPage]);

  // Reset page point counter and initialization flag when token or timeframe changes
  useEffect(() => {
    prevDataLengthRef.current = 0;
    isInitialRangeSetRef.current = false;
  }, [activeTokenId, activeRange]);

  // Effect to initialize the chart instance
  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Detect initial theme
    const isDark = document.documentElement.classList.contains('dark');
    
    // Create chart
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: isDark ? '#A3A3A3' : '#737373', 
      },
      grid: {
        vertLines: { visible: false }, 
        horzLines: { visible: false },
      },
      rightPriceScale: {
        borderVisible: false,
      },
      timeScale: {
        borderVisible: false,
        timeVisible: true,
      },
      autoSize: true,
    });
    
    chartRef.current = chart;

    // Add Area Series (v5 standard)
    const newSeries = chart.addSeries(AreaSeries, {
        lineColor: '#10b981', // Default green
        topColor: 'rgba(16, 185, 129, 0.2)',
        bottomColor: 'rgba(16, 185, 129, 0.0)',
        lineWidth: 2,
        lineType: LineType.Curved, // Smooth curved line like Shadcn
    });
    
    seriesRef.current = newSeries;

    // Set up Infinite Scroll Listener
    const handleVisibleLogicalRangeChange = (newRange: LogicalRange | null) => {
      if (!newRange) return;

      // Only trigger if the initial visible range has been set to avoid race conditions on mount
      if (!isInitialRangeSetRef.current) return;

      // Trigger next historical fetch when scrolling close to the left edge (index < 10)
      if (newRange.from < 10) {
        const { fetchNextPage: fetchNext, isFetchingNextPage: isFetching, hasNextPage: hasNext } = queryStateRef.current;
        if (hasNext && !isFetching) {
          fetchNext();
        }
      }
    };

    chart.timeScale().subscribeVisibleLogicalRangeChange(handleVisibleLogicalRangeChange);

    // Theme observer
    const observer = new MutationObserver(() => {
        const isDarkNow = document.documentElement.classList.contains('dark');
        chart.applyOptions({
            layout: {
                textColor: isDarkNow ? '#A3A3A3' : '#737373',
            }
        });
    });

    observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class'],
    });

    return () => {
      observer.disconnect();
      chart.timeScale().unsubscribeVisibleLogicalRangeChange(handleVisibleLogicalRangeChange);
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, []);

  // Effect to update the series data when TanStack query fetches new data pages
  useEffect(() => {
    if (!seriesRef.current || !chartRef.current || !chartData) return;

    // Combine all pages in chronological order (oldest page first)
    const reversedPages = [...chartData.pages].reverse();
    const combinedData = reversedPages.flat();

    // Detect if trend is down (compare first and last data point of the newest page/current view)
    const newestPage = chartData.pages[0] || [];
    const isDown = newestPage.length > 1 && newestPage[newestPage.length - 1].close < newestPage[0].close;
    const mainColor = isDown ? '#ef4444' : '#10b981'; // red-500 or emerald-500
    const topColorStr = isDown ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)';
    const bottomColorStr = isDown ? 'rgba(239, 68, 68, 0.0)' : 'rgba(16, 185, 129, 0.0)';

    // Dynamically apply green/red colors based on trend
    seriesRef.current.applyOptions({
      lineColor: mainColor,
      topColor: topColorStr,
      bottomColor: bottomColorStr,
    });

    // Map fetched API data
    const formattedData = combinedData.map((d) => ({
      time: d.time as Time,
      value: d.close, 
    }));

    seriesRef.current.setData(formattedData);

    const totalPoints = formattedData.length;
    const prevPoints = prevDataLengthRef.current;

    // Smooth scroll position retention when older historical points are prepended on the left
    if (prevPoints > 0 && totalPoints > prevPoints) {
      const addedPoints = totalPoints - prevPoints;
      const timeScale = chartRef.current.timeScale();
      const currentRange = timeScale.getVisibleLogicalRange();
      if (currentRange) {
        timeScale.setVisibleLogicalRange({
          from: currentRange.from + addedPoints,
          to: currentRange.to + addedPoints,
        });
      }
    } else if (prevPoints === 0) {
      // Reset Y-axis auto-scaling in case user manually locked it by dragging
      chartRef.current.priceScale('right').applyOptions({
        autoScale: true,
      });

      // First load or timeframe transition zoom configuration
      const visibleConfig: Record<string, number> = {
        '1 Day': 96,
        '1 Week': 168,
        '1 Month': 180,
        '1 Year': 365,
        '3 Year': 156,
        '5 Year': 60,
      };
      const visiblePoints = visibleConfig[activeRange] || 180;
      chartRef.current.timeScale().setVisibleLogicalRange({
        from: totalPoints - Math.min(visiblePoints, totalPoints),
        to: totalPoints,
      });

      // Enable the scroll listener after a short delay to let the initial layout render
      setTimeout(() => {
        isInitialRangeSetRef.current = true;
      }, 200);
    }

    prevDataLengthRef.current = totalPoints;
  }, [chartData, activeRange]);

  return (
    <div className="relative w-full h-[400px] md:h-[500px]">
        {(isLoading || isFetchingNextPage) && (
            <div className="absolute top-4 right-4 z-10 flex items-center gap-2 px-3 py-1.5 bg-neutral-2/80 dark:bg-neutral-900/80 backdrop-blur border border-border rounded-full text-xs text-neutral-6 shadow-sm">
                <div className="w-3.5 h-3.5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                <span>Fetching history...</span>
            </div>
        )}
        {isError && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/50 text-neutral-500">
                Failed to load chart data
            </div>
        )}
        <div 
            ref={chartContainerRef} 
            className="w-full h-full"
        />
    </div>
  );
}
