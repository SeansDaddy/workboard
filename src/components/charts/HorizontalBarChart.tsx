import React, { useMemo } from 'react';
import * as echarts from 'echarts';
import { EChartBase } from './EChartBase';
import { OperationsMetrics } from '../../types';

interface HorizontalBarChartProps {
  data: OperationsMetrics['regionalRiskTop5'];
  height?: number | string;
}

export const HorizontalBarChart: React.FC<HorizontalBarChartProps> = ({
  data,
  height = 140
}) => {
  const options: echarts.EChartsOption = useMemo(() => {
    // Reverse for top-down display in horizontal bar
    const reversed = [...data].reverse();
    const categories = reversed.map((d) => d.region);
    const warnings = reversed.map((d) => d.warningCount);
    const alarms = reversed.map((d) => d.alarmCount);

    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        backgroundColor: 'rgba(255, 255, 255, 0.98)',
        borderColor: '#e2e8f0',
        borderWidth: 1,
        textStyle: { color: '#1e293b', fontSize: 12 },
        formatter: (params: any) => {
          if (!Array.isArray(params) || params.length === 0) return '';
          const region = params[0].axisValue;
          let content = `<div class="font-semibold text-slate-800 border-b border-slate-100 pb-1 mb-1">${region} 风险分布</div>`;
          let sum = 0;
          params.forEach((item: any) => {
            sum += item.value;
            content += `<div class="flex items-center justify-between gap-4 text-xs py-0.5">
              <span class="flex items-center gap-1.5 text-slate-600">
                <span class="inline-block w-2.5 h-2.5 rounded-sm" style="background:${item.color}"></span>
                ${item.seriesName}:
              </span>
              <span class="font-semibold text-slate-900">${item.value} 起</span>
            </div>`;
          });
          content += `<div class="mt-1 pt-1 border-t border-slate-100 text-xs font-semibold text-slate-700 flex justify-between">
            <span>合计:</span><span>${sum} 起</span>
          </div>`;
          return content;
        }
      },
      legend: {
        data: ['预警 (潜在预测)', '告警 (已发生)'],
        top: 0,
        right: 0,
        itemWidth: 10,
        itemHeight: 8,
        textStyle: { color: '#64748b', fontSize: 11 }
      },
      grid: {
        top: 24,
        left: 45,
        right: 25,
        bottom: 5
      },
      xAxis: {
        type: 'value',
        show: false,
        splitLine: { show: false }
      },
      yAxis: {
        type: 'category',
        data: categories,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: '#475569', fontSize: 11, fontWeight: 'bold' }
      },
      series: [
        {
          name: '预警 (潜在预测)',
          type: 'bar',
          stack: 'total',
          barWidth: 10,
          itemStyle: {
            color: '#f59e0b',
            borderRadius: [0, 0, 0, 0]
          },
          data: warnings
        },
        {
          name: '告警 (已发生)',
          type: 'bar',
          stack: 'total',
          barWidth: 10,
          itemStyle: {
            color: '#ef4444',
            borderRadius: [0, 3, 3, 0]
          },
          data: alarms
        }
      ]
    };
  }, [data]);

  return <EChartBase options={options} height={height} />;
};
