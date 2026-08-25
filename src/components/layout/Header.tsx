import React, { useState } from 'react';
import { 
  Zap, 
  MapPin, 
  Search, 
  Bell, 
  HelpCircle, 
  Activity, 
  User, 
  Check, 
  Layers, 
  RefreshCw,
  Lock,
  ChevronDown
} from 'lucide-react';
import { CONFIG_THRESHOLDS } from '../../types';

interface HeaderProps {
  onSearch?: (query: string) => void;
  onOpenNotifications?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onSearch, onOpenNotifications }) => {
  const [searchValue, setSearchValue] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showRegionTip, setShowRegionTip] = useState(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
    onSearch?.(e.target.value);
  };

  return (
    <header className="h-13 bg-white border-b border-[#E8E8E8] px-4 flex items-center justify-between sticky top-0 z-30 select-none">
      {/* Left: Brand & Title */}
      <div className="flex items-center gap-3.5">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-[#1890FF] flex items-center justify-center text-white">
            <Zap className="w-4 h-4 fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-[13px] tracking-tight text-[#1F1F1F]">主动运维平台</span>
              <span className="text-[10px] uppercase font-semibold tracking-wider px-1.5 py-0.2 rounded bg-blue-50 text-[#1890FF] border border-blue-100">
                PROACTIVE O&M
              </span>
            </div>
            <p className="text-[10px] text-[#8C8C8C] leading-none">区域运维控制台 · 首页工作台</p>
          </div>
        </div>

        <div className="h-4 w-px bg-[#E8E8E8] hidden md:block" />

        {/* Region Switcher */}
        <div className="relative hidden sm:block">
          <div
            onMouseEnter={() => setShowRegionTip(true)}
            onMouseLeave={() => setShowRegionTip(false)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#F5F5F5] border border-[#E8E8E8] text-[#595959] text-xs font-medium cursor-not-allowed"
          >
            <MapPin className="w-3.5 h-3.5 text-[#1890FF]" />
            <span>{CONFIG_THRESHOLDS.CURRENT_REGION}</span>
            <Lock className="w-3 h-3 text-[#8C8C8C] ml-0.5" />
            <ChevronDown className="w-3 h-3 text-[#8C8C8C]" />
          </div>
          {showRegionTip && (
            <div className="absolute top-full left-0 mt-1 z-50 px-2.5 py-1.5 rounded bg-[#1F1F1F] text-white text-[11px] whitespace-nowrap shadow-md animate-in fade-in duration-150">
              🔒 当前登录账号权限范围已锁定：华东区域运维中心 (Demo固定)
            </div>
          )}
        </div>

        {/* Real-time sync status */}
        <div className="hidden lg:flex items-center gap-1.5 text-xs text-[#595959] bg-[#F6FFED] px-2.5 py-1 rounded border border-[#B7EB8F]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#52C41A] animate-pulse" />
          <span className="text-[#389E0D] font-medium text-[11px]">预测引擎运行中 · 10s前已同步</span>
        </div>
      </div>

      {/* Right: Search, Actions, Profile */}
      <div className="flex items-center gap-2.5">
        {/* Global Search Input */}
        <div className="relative hidden md:block w-60">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#8C8C8C]" />
          <input
            type="text"
            value={searchValue}
            onChange={handleSearchChange}
            placeholder="搜索工单号 / 电站 / 风险..."
            className="w-full pl-8 pr-3 py-1 text-xs rounded bg-[#F5F5F5] border border-[#E8E8E8] focus:bg-white focus:border-[#1890FF] focus:ring-1 focus:ring-[#1890FF]/20 outline-hidden text-[#262626] transition-all placeholder:text-[#BFBFBF]"
          />
        </div>

        {/* Notifications */}
        <button
          type="button"
          onClick={onOpenNotifications}
          className="relative p-1.5 rounded text-[#595959] hover:bg-[#F5F5F5] hover:text-[#262626] transition-colors cursor-pointer"
          title="系统消息通知"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[#FF4D4F] ring-1 ring-white" />
        </button>

        {/* Help */}
        <button
          type="button"
          className="p-1.5 rounded text-[#595959] hover:bg-[#F5F5F5] hover:text-[#262626] transition-colors hidden sm:block cursor-pointer"
          title="运维知识库与帮助"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        <div className="h-4 w-px bg-[#E8E8E8]" />

        {/* User profile dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 pl-1 pr-2 py-1 rounded hover:bg-[#F5F5F5] transition-colors cursor-pointer text-left"
          >
            <div className="w-6 h-6 rounded bg-[#1890FF] text-white flex items-center justify-center font-bold text-[11px]">
              {CONFIG_THRESHOLDS.CURRENT_USER_NAME.charAt(0)}
            </div>
            <div className="hidden sm:block text-left leading-tight">
              <div className="text-xs font-semibold text-[#262626] flex items-center gap-1">
                {CONFIG_THRESHOLDS.CURRENT_USER_NAME}
                <span className="text-[10px] px-1 py-0.2 bg-blue-50 text-[#1890FF] rounded font-normal">
                  负责人
                </span>
              </div>
              <div className="text-[10px] text-[#8C8C8C]">{CONFIG_THRESHOLDS.CURRENT_USER_ROLE}</div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-[#8C8C8C] ml-0.5" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-md shadow-lg border border-[#E8E8E8] py-1 z-50 text-xs text-[#595959]">
              <div className="px-3 py-2 border-b border-[#F0F0F0] bg-[#FAFAFA]">
                <p className="font-semibold text-[#262626]">{CONFIG_THRESHOLDS.CURRENT_USER_NAME}</p>
                <p className="text-[11px] text-[#8C8C8C]">{CONFIG_THRESHOLDS.CURRENT_USER_ROLE}</p>
                <p className="text-[10px] text-[#1890FF] font-mono mt-0.5">ID: OP-JS-80221</p>
              </div>
              <div className="py-0.5">
                <button
                  type="button"
                  onClick={() => setShowUserMenu(false)}
                  className="w-full px-3 py-1.5 text-left hover:bg-[#F5F5F5] flex items-center gap-2 text-[#595959] cursor-pointer"
                >
                  <User className="w-3.5 h-3.5 text-[#8C8C8C]" />
                  <span>个人工作偏好</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowUserMenu(false)}
                  className="w-full px-3 py-1.5 text-left hover:bg-[#F5F5F5] flex items-center gap-2 text-[#595959] cursor-pointer"
                >
                  <Layers className="w-3.5 h-3.5 text-[#8C8C8C]" />
                  <span>权限范围配置</span>
                </button>
              </div>
              <div className="border-t border-[#F0F0F0] pt-0.5">
                <button
                  type="button"
                  onClick={() => setShowUserMenu(false)}
                  className="w-full px-3 py-1.5 text-left hover:bg-red-50 text-[#FF4D4F] flex items-center gap-2 cursor-pointer"
                >
                  <span>退出登录</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
