import React from 'react';
import { OperationsMetrics } from '../../types';
import { RingProgress } from '../charts/RingProgress';
import { DualAxisDischargeChart } from '../charts/DualAxisDischargeChart';
import { DonutChart } from '../charts/DonutChart';
import { 
  BarChart3, 
  Cloud, 
  Power, 
  Zap, 
  TrendingUp, 
  ArrowUpRight, 
  Settings2, 
  Activity,
  Layers,
  AlertOctagon,
  Info
} from 'lucide-react';

interface DashboardModuleProps {
  metrics: OperationsMetrics;
}

export const DashboardModule: React.FC<DashboardModuleProps> = ({ metrics }) => {
  const { cloudRate, powerOnRate, dischargeSummary, strategyDistribution, realtimeStatusDistribution } = metrics;

  return (
    <div className="space-y-3.5">
      {/* 看板头部说明 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded bg-emerald-50 text-[#52C41A] border border-emerald-200">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-[#1F1F1F]">运营看板 · 储能资产健康度与运行态势</h2>
              <span className="text-[10px] text-[#52C41A] bg-[#F6FFED] px-1.5 py-0.2 rounded border border-[#B7EB8F] font-medium">
                5 块核心磁贴
              </span>
            </div>
            <p className="text-[11px] text-[#8C8C8C]">
              覆盖资产接入(上云/上电)、充放电出力、运行策略配置与当下物理态势
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-[11px] text-[#8C8C8C] bg-white px-2.5 py-1 rounded border border-[#E8E8E8]">
          <Info className="w-3.5 h-3.5 text-[#1890FF]" />
          <span>运行策略反映长期模式，实时状态反映物理当下，独立统计互不混淆</span>
        </div>
      </div>

      {/* 第一行: 上云率 (Tile 1) + 上电率 (Tile 2) + 放电统计 (Tile 3) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
        {/* Tile 1: 上云率 */}
        <div className="md:col-span-3 bg-white rounded-lg p-3.5 border border-[#E8E8E8] shadow-none flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#262626] flex items-center gap-1.5">
              <Cloud className="w-4 h-4 text-[#1890FF]" />
              上云率
            </span>
            <span className="text-[11px] font-medium text-[#52C41A] bg-[#F6FFED] px-1.5 py-0.2 rounded border border-[#B7EB8F] flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> +{cloudRate.dailyChange}%
            </span>
          </div>

          <div className="flex items-center justify-around my-2">
            <RingProgress
              percentage={cloudRate.percentage}
              size={96}
              strokeWidth={8}
              color="#1890FF"
              trackColor="#F0F0F0"
              label={`${cloudRate.percentage}%`}
              sublabel="已接入"
            />
            <div className="space-y-1.5 text-left text-xs pl-2">
              <div>
                <span className="text-[11px] text-[#8C8C8C] block">已接入电站</span>
                <span className="text-base font-bold text-[#1F1F1F] tabular-nums">
                  {cloudRate.connectedStations} <span className="text-xs font-normal text-[#8C8C8C]">座</span>
                </span>
              </div>
              <div>
                <span className="text-[11px] text-[#8C8C8C] block">规划总电站</span>
                <span className="text-sm font-medium text-[#595959] tabular-nums">
                  {cloudRate.totalStations} <span className="text-xs font-normal text-[#8C8C8C]">座</span>
                </span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-[#F0F0F0] flex items-center justify-between text-[11px] text-[#8C8C8C]">
            <span>口径: 接入云平台数 / 区域总数</span>
            <span className="text-[#1890FF] font-medium">健康</span>
          </div>
        </div>

        {/* Tile 2: 上电率 */}
        <div className="md:col-span-3 bg-white rounded-lg p-3.5 border border-[#E8E8E8] shadow-none flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#262626] flex items-center gap-1.5">
              <Power className="w-4 h-4 text-[#52C41A]" />
              上电率
            </span>
            <span className="text-[11px] font-medium text-[#52C41A] bg-[#F6FFED] px-1.5 py-0.2 rounded border border-[#B7EB8F] flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> +{powerOnRate.dailyChange}%
            </span>
          </div>

          <div className="flex items-center justify-around my-2">
            <RingProgress
              percentage={powerOnRate.percentage}
              size={96}
              strokeWidth={8}
              color="#52C41A"
              trackColor="#F0F0F0"
              label={`${powerOnRate.percentage}%`}
              sublabel="可监控"
            />
            <div className="space-y-1.5 text-left text-xs pl-2">
              <div>
                <span className="text-[11px] text-[#8C8C8C] block">上电受控电站</span>
                <span className="text-base font-bold text-[#1F1F1F] tabular-nums">
                  {powerOnRate.monitoredStations} <span className="text-xs font-normal text-[#8C8C8C]">座</span>
                </span>
              </div>
              <div>
                <span className="text-[11px] text-[#8C8C8C] block">离线/检修中</span>
                <span className="text-sm font-medium text-[#F5222D] tabular-nums">
                  {powerOnRate.offlineStations} <span className="text-xs font-normal text-[#8C8C8C]">座</span>
                </span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-[#F0F0F0] flex items-center justify-between text-[11px] text-[#8C8C8C]">
            <span>口径: 处于可监控状态电站比例</span>
            <span className="text-[#52C41A] font-medium">正常受控</span>
          </div>
        </div>

        {/* Tile 3: 放电统计 (近 14 天双轴图) */}
        <div className="md:col-span-6 bg-white rounded-lg p-3.5 border border-[#E8E8E8] shadow-none flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#1F1F1F] flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-[#FA8C16]" />
                放电统计 (近14天趋势)
              </span>
              <span className="text-[10px] text-[#8C8C8C]">双指标联动分析</span>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="text-[#8C8C8C]">
                今日放电: <span className="font-semibold text-[#1F1F1F]">{dischargeSummary.todayCount}</span> 次
              </span>
              <span className="text-[#8C8C8C]">
                放电量: <span className="font-semibold text-[#FA8C16]">{dischargeSummary.todayEnergyMWh}</span> MWh
              </span>
            </div>
          </div>

          <div className="h-44 w-full">
            <DualAxisDischargeChart data={dischargeSummary.dailyTrend} height={176} />
          </div>
        </div>
      </div>

      {/* 第二行: 运行策略分布 (Tile 4) + 实时状态分布 (Tile 5) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {/* Tile 4: 运行策略分布 */}
        <div className="bg-white rounded-lg p-3.5 border border-[#E8E8E8] shadow-none">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <Settings2 className="w-4 h-4 text-[#1890FF]" />
              <span className="text-xs font-semibold text-[#1F1F1F]">运行策略分布 (长期配置健康度)</span>
            </div>
            <span className="text-[10px] text-[#8C8C8C] bg-[#F5F5F5] px-1.5 py-0.5 rounded border border-[#E8E8E8]">
              按电站台账配置
            </span>
          </div>

          <div className="h-48 w-full">
            <DonutChart
              data={strategyDistribution}
              centerTitle={`${cloudRate.connectedStations}`}
              centerSubtitle="已配置电站"
              height={190}
            />
          </div>

          <div className="mt-1 pt-2 border-t border-[#F0F0F0] grid grid-cols-4 gap-2 text-center text-[11px]">
            {strategyDistribution.map((st) => (
              <div key={st.name} className="p-1 rounded bg-[#FAFAFA] border border-[#E8E8E8]">
                <span className="text-[#8C8C8C] block truncate">{st.name}</span>
                <span className="font-semibold text-[#262626]">{st.count}座</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tile 5: 实时状态分布 */}
        <div className="bg-white rounded-lg p-3.5 border border-[#E8E8E8] shadow-none">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-[#52C41A]" />
              <span className="text-xs font-semibold text-[#1F1F1F]">实时物理状态分布 (当下物理运行态势)</span>
            </div>
            <span className="text-[10px] text-[#CF1322] bg-[#FFF1F0] px-1.5 py-0.5 rounded border border-[#FFA39E] font-medium flex items-center gap-1">
              <AlertOctagon className="w-3 h-3" />
              故障 8 座 (1.7%)
            </span>
          </div>

          <div className="h-48 w-full">
            <DonutChart
              data={realtimeStatusDistribution}
              centerTitle="484"
              centerSubtitle="在线监测电站"
              height={190}
            />
          </div>

          <div className="mt-1 pt-2 border-t border-[#F0F0F0] grid grid-cols-4 gap-2 text-center text-[11px]">
            {realtimeStatusDistribution.map((st) => (
              <div key={st.name} className={`p-1 rounded border ${st.name === '故障' ? 'bg-[#FFF1F0] border-[#FFA39E] text-[#CF1322]' : 'bg-[#FAFAFA] border-[#E8E8E8]'}`}>
                <span className="text-[#8C8C8C] block truncate">{st.name}</span>
                <span className={`font-semibold ${st.name === '故障' ? 'text-[#CF1322]' : 'text-[#262626]'}`}>{st.count}座</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
