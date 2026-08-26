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
    <header className="h-14 bg-white border-b border-[#E8E8E8] px-5 flex items-center justify-between sticky top-0 z-30 select-none">
      {/* Left: Brand & Title */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-[#1890FF] flex items-center justify-center text-white shadow-xs">
            <Zap className="w-5 h-5 fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base tracking-tight text-[#1F1F1F]">主动运维平台</span>
              <span className="text-xs uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-blue-50 text-[#1890FF] border border-blue-100">
                PROACTIVE O&M
              </span>
            </div>
            <p className="text-xs text-[#8C8C8C] leading-tight">区域运维控制台 · 首页工作台</p>
          </div>
        </div>

        <div className="h-5 w-px bg-[#E8E8E8] hidden md:block" />

        {/* Region Switcher */}
        <div className="relative hidden sm:block">
          <div
            onMouseEnter={() => setShowRegionTip(true)}
            onMouseLeave={() => setShowRegionTip(false)}
            className="flex items-center gap-2 px-3 py-1.5 rounded bg-[#F5F5F5] border border-[#E8E8E8] text-[#595959] text-sm font-medium cursor-not-allowed"
          >
            <MapPin className="w-4 h-4 text-[#1890FF]" />
            <span>{CONFIG_THRESHOLDS.CURRENT_REGION}</span>
            <Lock className="w-3.5 h-3.5 text-[#8C8C8C] ml-0.5" />
            <ChevronDown className="w-3.5 h-3.5 text-[#8C8C8C]" />
          </div>
          {showRegionTip && (
            <div className="absolute top-full left-0 mt-1 z-50 px-3 py-2 rounded bg-[#1F1F1F] text-white text-xs whitespace-nowrap shadow-md animate-in fade-in duration-150">
              🔒 当前登录账号权限范围已锁定：华东区域运维中心 (Demo固定)
            </div>
          )}
        </div>

        {/* Real-time sync status */}
        <div className="hidden lg:flex items-center gap-2 text-sm text-[#595959] bg-[#F6FFED] px-3 py-1.5 rounded border border-[#B7EB8F]">
          <span className="w-2 h-2 rounded-full bg-[#52C41A] animate-pulse" />
          <span className="text-[#389E0D] font-medium text-xs">预测引擎运行中 · 10s前已同步</span>
        </div>
      </div>

      {/* Right: Search, Actions, Profile */}
      <div className="flex items-center gap-3">
        {/* Global Search Input */}
        <div className="relative hidden md:block w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8C8C8C]" />
          <input
            type="text"
            value={searchValue}
            onChange={handleSearchChange}
            placeholder="搜索工单号 / 电站 / 风险..."
            className="w-full pl-9 pr-3 py-1.5 text-sm rounded bg-[#F5F5F5] border border-[#E8E8E8] focus:bg-white focus:border-[#1890FF] focus:ring-1 focus:ring-[#1890FF]/20 outline-hidden text-[#262626] transition-all placeholder:text-[#BFBFBF]"
          />
        </div>

        {/* Notifications */}
        <button
          type="button"
          onClick={onOpenNotifications}
          className="relative p-2 rounded text-[#595959] hover:bg-[#F5F5F5] hover:text-[#262626] transition-colors cursor-pointer"
          title="系统消息通知"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#FF4D4F] ring-2 ring-white" />
        </button>

        {/* Help */}
        <button
          type="button"
          className="p-2 rounded text-[#595959] hover:bg-[#F5F5F5] hover:text-[#262626] transition-colors hidden sm:block cursor-pointer"
          title="运维知识库与帮助"
        >
          <HelpCircle className="w-5 h-5" />
        </button>

        <div className="h-5 w-px bg-[#E8E8E8]" />

        {/* User profile dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2.5 pl-1.5 pr-2.5 py-1.5 rounded hover:bg-[#F5F5F5] transition-colors cursor-pointer text-left"
          >
            <div className="w-7 h-7 rounded bg-[#1890FF] text-white flex items-center justify-center font-bold text-xs shadow-xs">
              {CONFIG_THRESHOLDS.CURRENT_USER_NAME.charAt(0)}
            </div>
            <div className="hidden sm:block text-left leading-tight">
              <div className="text-sm font-semibold text-[#262626] flex items-center gap-1.5">
                {CONFIG_THRESHOLDS.CURRENT_USER_NAME}
                <span className="text-xs px-1.5 py-0.5 bg-blue-50 text-[#1890FF] rounded font-normal">
                  负责人
                </span>
              </div>
              <div className="text-xs text-[#8C8C8C]">{CONFIG_THRESHOLDS.CURRENT_USER_ROLE}</div>
            </div>
            <ChevronDown className="w-4 h-4 text-[#8C8C8C] ml-0.5" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 top-full mt-1 w-52 bg-white rounded-md shadow-lg border border-[#E8E8E8] py-1.5 z-50 text-sm text-[#595959]">
              <div className="px-3.5 py-2.5 border-b border-[#F0F0F0] bg-[#FAFAFA]">
                <p className="font-semibold text-sm text-[#262626]">{CONFIG_THRESHOLDS.CURRENT_USER_NAME}</p>
                <p className="text-xs text-[#8C8C8C]">{CONFIG_THRESHOLDS.CURRENT_USER_ROLE}</p>
                <p className="text-xs text-[#1890FF] font-mono mt-0.5">ID: OP-JS-80221</p>
              </div>
              <div className="py-1">
                <button
                  type="button"
                  onClick={() => setShowUserMenu(false)}
                  className="w-full px-3.5 py-2 text-left hover:bg-[#F5F5F5] flex items-center gap-2.5 text-[#595959] cursor-pointer"
                >
                  <User className="w-4 h-4 text-[#8C8C8C]" />
                  <span>个人工作偏好</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowUserMenu(false)}
                  className="w-full px-3.5 py-2 text-left hover:bg-[#F5F5F5] flex items-center gap-2.5 text-[#595959] cursor-pointer"
                >
                  <Layers className="w-4 h-4 text-[#8C8C8C]" />
                  <span>权限范围配置</span>
                </button>
              </div>
              <div className="border-t border-[#F0F0F0] pt-1">
                <button
                  type="button"
                  onClick={() => setShowUserMenu(false)}
                  className="w-full px-3.5 py-2 text-left hover:bg-red-50 text-[#FF4D4F] flex items-center gap-2.5 cursor-pointer font-medium"
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
