import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

interface EChartBaseProps {
  options: echarts.EChartsOption;
  height?: string | number;
  width?: string | number;
  className?: string;
  onEvents?: Record<string, (params: any) => void>;
}

export const EChartBase: React.FC<EChartBaseProps> = ({
  options,
  height = '100%',
  width = '100%',
  className = '',
  onEvents
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current);
    }

    const chart = chartInstance.current;
    chart.setOption(options, true);

    // Bind custom events
    if (onEvents) {
      Object.keys(onEvents).forEach((eventName) => {
        chart.off(eventName);
        chart.on(eventName, onEvents[eventName]);
      });
    }

    const resizeObserver = new ResizeObserver(() => {
      chart.resize();
    });
    resizeObserver.observe(chartRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [options, onEvents]);

  useEffect(() => {
    return () => {
      if (chartInstance.current) {
        chartInstance.current.dispose();
        chartInstance.current = null;
      }
    };
  }, []);

  return (
    <div
      ref={chartRef}
      className={className}
      style={{
        height: typeof height === 'number' ? `${height}px` : height,
        width: typeof width === 'number' ? `${width}px` : width,
        minHeight: typeof height === 'number' ? `${height}px` : undefined,
      }}
    />
  );
};
