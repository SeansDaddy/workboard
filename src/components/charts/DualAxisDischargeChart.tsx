import React, { useMemo } from 'react';
import * as echarts from 'echarts';
import { EChartBase } from './EChartBase';
import { DailyDischargeStat } from '../../types';

interface DualAxisDischargeChartProps {
  data: DailyDischargeStat[];
  height?: number | string;
}

export const DualAxisDischargeChart: React.FC<DualAxisDischargeChartProps> = ({
  data,
  height = 240
}) => {
  const options: echarts.EChartsOption = useMemo(() => {
    const dates = data.map((d) => d.date);
    const counts = data.map((d) => d.dischargeCount);
    const energy = data.map((d) => d.dischargeEnergyMWh);

    return {
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(255, 255, 255, 0.98)',
        borderColor: '#e2e8f0',
        borderWidth: 1,
        textStyle: {
          color: '#1e293b',
          fontSize: 12
        },
        formatter: (params: any) => {
          if (!Array.isArray(params) || params.length === 0) return '';
          const date = params[0].axisValue;
          let content = `<div class="font-semibold text-slate-800 border-b border-slate-100 pb-1 mb-1.5">${date} 放电数据</div>`;
          params.forEach((item: any) => {
            const isCount = item.seriesName === '放电次数';
            const unit = isCount ? ' 次' : ' MWh';
            content += `<div class="flex items-center justify-between gap-4 text-xs py-0.5">
              <span class="flex items-center gap-1.5 text-slate-600">
                <span class="inline-block w-2.5 h-2.5 rounded-sm" style="background-color: ${item.color}"></span>
                ${item.seriesName}:
              </span>
              <span class="font-semibold text-slate-900">${item.value}${unit}</span>
            </div>`;
          });
          return content;
        }
      },
      legend: {
        data: ['放电次数', '放电电量'],
        right: 12,
        top: 0,
        itemWidth: 12,
        itemHeight: 8,
        textStyle: {
          color: '#64748b',
          fontSize: 12
        }
      },
      grid: {
        top: 36,
        left: 45,
        right: 55,
        bottom: 24
      },
      xAxis: {
        type: 'category',
        data: dates,
        axisLine: { lineStyle: { color: '#cbd5e1' } },
        axisLabel: { color: '#64748b', fontSize: 11 },
        axisTick: { alignWithLabel: true }
      },
      yAxis: [
        {
          type: 'value',
          name: '次数 (次)',
          nameTextStyle: { color: '#94a3b8', fontSize: 11, align: 'right' },
          min: 600,
          max: 1000,
          splitLine: {
            lineStyle: { color: '#f1f5f9', type: 'dashed' }
          },
          axisLabel: { color: '#64748b', fontSize: 11 }
        },
        {
          type: 'value',
          name: '电量 (MWh)',
          nameTextStyle: { color: '#94a3b8', fontSize: 11, align: 'left' },
          min: 1000,
          max: 1800,
          splitLine: { show: false },
          axisLabel: { color: '#64748b', fontSize: 11 }
        }
      ],
      series: [
        {
          name: '放电次数',
          type: 'bar',
          data: counts,
          barWidth: 10,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#38bdf8' },
              { offset: 1, color: '#0284c7' }
            ]),
            borderRadius: [3, 3, 0, 0]
          }
        },
        {
          name: '放电电量',
          type: 'line',
          yAxisIndex: 1,
          data: energy,
          smooth: true,
          symbol: 'circle',
          symbolSize: 6,
          itemStyle: {
            color: '#f59e0b',
            borderWidth: 2,
            borderColor: '#ffffff'
          },
          lineStyle: {
            color: '#f59e0b',
            width: 2.5
          }
        }
      ]
    };
  }, [data]);

  return <EChartBase options={options} height={height} />;
};
