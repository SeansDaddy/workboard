import React, { useMemo } from 'react';
import * as echarts from 'echarts';
import { EChartBase } from './EChartBase';

interface DonutItem {
  name: string;
  count: number;
  percentage?: number;
  color: string;
}

interface DonutChartProps {
  data: DonutItem[];
  centerTitle?: string;
  centerSubtitle?: string;
  height?: number | string;
  radius?: [string, string];
  unit?: string;
}

export const DonutChart: React.FC<DonutChartProps> = ({
  data,
  centerTitle,
  centerSubtitle = '电站总数',
  height = 200,
  radius = ['52%', '72%'],
  unit = '座'
}) => {
  const options: echarts.EChartsOption = useMemo(() => {
    const total = data.reduce((acc, curr) => acc + curr.count, 0);
    const displayCenter = centerTitle !== undefined ? centerTitle : `${total}`;

    return {
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(255, 255, 255, 0.98)',
        borderColor: '#e2e8f0',
        borderWidth: 1,
        textStyle: { color: '#1e293b', fontSize: 12 },
        formatter: (params: any) => {
          const item = data.find((d) => d.name === params.name);
          const pct = item?.percentage ?? ((params.value / total) * 100).toFixed(1);
          return `<div class="text-xs">
            <span class="inline-block w-2.5 h-2.5 rounded-full mr-1.5" style="background:${params.color}"></span>
            <span class="font-semibold text-slate-800">${params.name}</span>: 
            <span class="font-bold text-slate-900 ml-1">${params.value} ${unit}</span>
            <span class="text-slate-500 ml-1">(${pct}%)</span>
          </div>`;
        }
      },
      legend: {
        orient: 'vertical',
        right: '4%',
        top: 'center',
        itemWidth: 8,
        itemHeight: 8,
        icon: 'circle',
        itemGap: 10,
        textStyle: {
          color: '#475569',
          fontSize: 12,
          rich: {
            name: { width: 90, color: '#334155' },
            val: { width: 45, fontWeight: 'bold', color: '#0f172a', align: 'right' },
            pct: { width: 45, color: '#64748b', align: 'right' }
          }
        },
        formatter: (name: string) => {
          const item = data.find((d) => d.name === name);
          if (!item) return name;
          const pct = item.percentage ?? ((item.count / total) * 100).toFixed(1);
          return `{name|${name}} {val|${item.count}${unit}} {pct|${pct}%}`;
        }
      },
      graphic: [
        {
          type: 'text',
          left: '26%',
          top: '40%',
          style: {
            text: displayCenter,
            textAlign: 'center',
            fill: '#0f172a',
            fontSize: 20,
            fontWeight: 'bold'
          }
        },
        {
          type: 'text',
          left: '26%',
          top: '56%',
          style: {
            text: centerSubtitle,
            textAlign: 'center',
            fill: '#64748b',
            fontSize: 11
          }
        }
      ],
      series: [
        {
          name: '分布',
          type: 'pie',
          center: ['28%', '50%'],
          radius: radius,
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 4,
            borderColor: '#ffffff',
            borderWidth: 2
          },
          label: { show: false },
          emphasis: {
            scale: true,
            scaleSize: 5,
            label: { show: false }
          },
          data: data.map((d) => ({
            name: d.name,
            value: d.count,
            itemStyle: { color: d.color }
          }))
        }
      ]
    };
  }, [data, centerTitle, centerSubtitle, radius, unit]);

  return <EChartBase options={options} height={height} />;
};
