import React from 'react';
import { useApp } from '../context/AppContext';
import {
  UtensilsCrossed,
  LayoutGrid,
  ChefHat,
  Boxes,
  BarChart3,
  Users,
  Settings,
  Receipt,
  Wallet,
  LogOut,
  Maximize2,
  Minimize2,
  Laptop,
  ShoppingBag,
  Sparkles,
} from 'lucide-react';
import { Role } from '../types/pos';

interface SidebarProps {
  onOpenLoginModal: () => void;
  onOpenWindowsModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onOpenLoginModal, onOpenWindowsModal }) => {
  const {
    activeTab,
    setActiveTab,
    currentUser,
    orders,
    tables,
  } = useApp();

  const [isFullscreen, setIsFullscreen] = React.useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  // Pending KDS orders counter
  const pendingKitchenCount = orders.filter(
    (o) => o.status === 'pending' || o.status === 'cooking'
  ).length;

  // Occupied tables counter
  const occupiedTablesCount = tables.filter((t) => t.status === 'occupied').length;

  interface NavItem {
    id: string;
    label: string;
    labelFr: string;
    icon: React.ReactNode;
    roles: Role[];
    badge?: number;
    badgeColor?: string;
  }

  const navItems: NavItem[] = [
    {
      id: 'pos',
      label: 'نقطة البيع (POS)',
      labelFr: 'Vente POS',
      icon: <UtensilsCrossed className="w-5 h-5" />,
      roles: ['admin', 'manager', 'cashier'],
    },
    {
      id: 'tables',
      label: 'الطاولات',
      labelFr: 'Tables',
      icon: <LayoutGrid className="w-5 h-5" />,
      roles: ['admin', 'manager', 'cashier'],
      badge: occupiedTablesCount,
      badgeColor: 'bg-emerald-500',
    },
    {
      id: 'orders',
      label: 'الطلبات',
      labelFr: 'Commandes',
      icon: <ShoppingBag className="w-5 h-5" />,
      roles: ['admin', 'manager', 'cashier'],
      badge: orders.length,
      badgeColor: 'bg-amber-600',
    },
    {
      id: 'kds',
      label: 'المطبخ KDS',
      labelFr: 'Cuisine KDS',
      icon: <ChefHat className="w-5 h-5" />,
      roles: ['admin', 'manager', 'cashier', 'kitchen'],
      badge: pendingKitchenCount,
      badgeColor: 'bg-amber-500 animate-pulse',
    },
    {
      id: 'products',
      label: 'المنتجات',
      labelFr: 'Produits',
      icon: <Sparkles className="w-5 h-5" />,
      roles: ['admin', 'manager'],
    },
    {
      id: 'inventory',
      label: 'المخزون',
      labelFr: 'Stock & Ingrédients',
      icon: <Boxes className="w-5 h-5" />,
      roles: ['admin', 'manager'],
    },
    {
      id: 'expenses',
      label: 'المصاريف',
      labelFr: 'Dépenses',
      icon: <Receipt className="w-5 h-5" />,
      roles: ['admin', 'manager'],
    },
    {
      id: 'reports',
      label: 'التقارير',
      labelFr: 'Rapports',
      icon: <BarChart3 className="w-5 h-5" />,
      roles: ['admin', 'manager'],
    },
    {
      id: 'shifts',
      label: 'الصندوق',
      labelFr: 'Caisse & Clôture',
      icon: <Wallet className="w-5 h-5" />,
      roles: ['admin', 'manager', 'cashier'],
    },
    {
      id: 'settings',
      label: 'الإعدادات',
      labelFr: 'Paramètres',
      icon: <Settings className="w-5 h-5" />,
      roles: ['admin'],
    },
  ];

  return (
    <aside className="w-64 bg-[#140d07] border-l border-[#3a2514] flex flex-col h-screen select-none shrink-0 z-30 transition-all font-['Cairo',sans-serif]">
      {/* Brand Luxury Crest */}
      <div className="p-4 border-b border-[#362111] bg-[#1a1109] flex items-center gap-3">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-300 flex items-center justify-center shadow-lg shadow-amber-950/60 shrink-0 font-black text-[#140d07] text-2xl border border-yellow-200/50">
          G
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-sm font-black tracking-wider text-[#fffdfa] truncate uppercase">
            GRINE RESTAURANT
          </h1>
          <p className="text-[11px] font-bold text-amber-400 truncate flex items-center gap-1.5 mt-0.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400/50"></span>
            Good Food • Good Mood
          </p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
        {navItems
          .filter((item) => item.roles.includes(currentUser.role))
          .map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all duration-150 ${
                  isActive
                    ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-lg shadow-amber-950/70 border-r-4 border-yellow-300 font-black'
                    : 'text-[#f3e5d3]/80 hover:text-white hover:bg-[#25170d]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`${isActive ? 'text-white' : 'text-amber-400/80'}`}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`text-[10px] font-black px-2 py-0.5 rounded-full text-white shadow-sm ${
                      item.badgeColor || 'bg-amber-600'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
      </nav>

      {/* Quick Desktop Utilities */}
      <div className="p-3 border-t border-[#362111] space-y-2 bg-[#120a05]">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={toggleFullscreen}
            className="flex items-center justify-center gap-1.5 text-xs font-bold py-2 px-2 rounded-xl bg-[#24170d] text-amber-200/90 border border-[#3e2715] hover:text-white hover:bg-[#322012] transition"
            title="ملء الشاشة (F11)"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            <span>{isFullscreen ? 'تصغير' : 'ملء الشاشة'}</span>
          </button>

          <button
            onClick={onOpenWindowsModal}
            className="flex items-center justify-center gap-1.5 text-xs font-bold py-2 px-2 rounded-xl bg-amber-950/60 text-amber-300 border border-amber-800/40 hover:bg-amber-900/60 hover:text-white transition"
            title="تطبيق Windows .EXE"
          >
            <Laptop className="w-3.5 h-3.5 text-amber-400" />
            <span>Windows</span>
          </button>
        </div>

        {/* Current User Session Card */}
        <div className="flex items-center justify-between p-2 rounded-xl bg-[#1c1209] border border-[#3b2514]">
          <button
            onClick={onOpenLoginModal}
            className="flex items-center gap-2.5 text-right min-w-0 flex-1 hover:opacity-90 transition"
            title="تغيير المستخدم / تسجيل الخروج"
          >
            <div className="w-8 h-8 rounded-lg bg-[#2e1d10] border border-[#52351d] flex items-center justify-center text-xs font-black text-amber-400 uppercase shrink-0">
              {currentUser.name.slice(0, 2)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-white truncate">{currentUser.name}</div>
              <div className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 truncate">
                {currentUser.role}
              </div>
            </div>
          </button>

          <button
            onClick={onOpenLoginModal}
            className="p-1.5 text-stone-400 hover:text-red-400 hover:bg-red-950/40 rounded-lg transition"
            title="تبديل الجلسة"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        <div className="text-center text-[10px] font-bold text-amber-400/70">
          GRINE POS • v2.4 Pro Windows
        </div>
      </div>
    </aside>
  );
};
