import React from 'react';

export interface FilterChipItem {
  key: string;
  label: string;
  count: number;
  badgeColor?: 'default' | 'danger' | 'warning' | 'primary' | 'success';
}

interface FilterChipsProps {
  items: FilterChipItem[];
  activeKey: string;
  onChange: (key: string) => void;
}

export const FilterChips: React.FC<FilterChipsProps> = ({
  items,
  activeKey,
  onChange,
}) => {
  return (
    <div className="inline-flex items-center gap-1.5 flex-wrap">
      {items.map((item) => {
        const isActive = activeKey === item.key;
        
        let colorClasses = 'bg-white text-[#595959] hover:bg-[#F5F5F5] border-[#E8E8E8]';
        let badgeClasses = 'bg-[#F0F0F0] text-[#595959]';

        if (isActive) {
          colorClasses = 'bg-[#1890FF] text-white border-[#1890FF] font-medium';
          badgeClasses = 'bg-white text-[#1890FF] font-semibold';
        } else if (item.badgeColor === 'danger') {
          colorClasses = 'bg-white text-[#595959] hover:bg-[#FFF1F0] border-[#E8E8E8] hover:border-[#FFA39E]';
          badgeClasses = 'bg-[#FFF1F0] text-[#F5222D] font-bold border border-[#FFA39E]';
        } else if (item.badgeColor === 'warning') {
          colorClasses = 'bg-white text-[#595959] hover:bg-[#FFF7E6] border-[#E8E8E8] hover:border-[#FFD591]';
          badgeClasses = 'bg-[#FFF7E6] text-[#FA8C16] font-bold border border-[#FFD591]';
        }

        return (
          <button
            key={item.key}
            type="button"
            onClick={() => onChange(isActive && item.key !== 'all' ? 'all' : item.key)}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs border transition-colors cursor-pointer select-none ${colorClasses}`}
          >
            <span>{item.label}</span>
            <span className={`inline-flex items-center justify-center min-w-[16px] h-3.5 px-1 rounded-full text-[10px] tabular-nums leading-none ${badgeClasses}`}>
              {item.count}
            </span>
          </button>
        );
      })}
    </div>
  );
};
