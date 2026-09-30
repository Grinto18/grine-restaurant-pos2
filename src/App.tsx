import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { PosTerminal } from './components/pos/PosTerminal';
import { TablesView } from './components/tables/TablesView';
import { KitchenDisplay } from './components/kds/KitchenDisplay';
import { OrdersView } from './components/orders/OrdersView';
import { InventoryView } from './components/inventory/InventoryView';
import { ReportsView } from './components/reports/ReportsView';
import { ExpensesView } from './components/expenses/ExpensesView';
import { CashRegisterView } from './components/register/CashRegisterView';
import { UsersView } from './components/users/UsersView';
import { SettingsView } from './components/settings/SettingsView';
import { PaymentModal } from './components/pos/PaymentModal';
import { ReceiptModal } from './components/pos/ReceiptModal';
import { TableSelectModal } from './components/tables/TableSelectModal';
import { LoginModal } from './components/auth/LoginModal';
import { WindowsInstallerModal } from './components/desktop/WindowsInstallerModal';
import { ToastContainer } from './components/common/ToastContainer';

const MainLayout: React.FC = () => {
  const {
    activeTab,
    hasPermission,
    cart,
    setIsPaymentModalOpen,
    isRTL,
  } = useApp();

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [isWindowsModalOpen, setIsWindowsModalOpen] = useState(false);

  // Global Keyboard shortcuts for Windows POS terminal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // ESC: Close open modals
      if (e.key === 'Escape') {
        setIsLoginModalOpen(false);
        setIsTableModalOpen(false);
        setIsWindowsModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const renderActiveView = () => {
    switch (activeTab) {
      case 'pos':
        return <PosTerminal onOpenTableModal={() => setIsTableModalOpen(true)} />;
      case 'tables':
        return <TablesView />;
      case 'orders':
        return <OrdersView />;
      case 'kds':
        return <KitchenDisplay />;
      case 'products':
      case 'inventory':
        return hasPermission(['admin', 'manager']) ? <InventoryView /> : <PosTerminal onOpenTableModal={() => setIsTableModalOpen(true)} />;
      case 'reports':
        return hasPermission(['admin', 'manager']) ? <ReportsView /> : <PosTerminal onOpenTableModal={() => setIsTableModalOpen(true)} />;
      case 'expenses':
        return hasPermission(['admin', 'manager']) ? <ExpensesView /> : <PosTerminal onOpenTableModal={() => setIsTableModalOpen(true)} />;
      case 'shifts':
        return <CashRegisterView />;
      case 'users':
        return hasPermission(['admin']) ? <UsersView /> : <PosTerminal onOpenTableModal={() => setIsTableModalOpen(true)} />;
      case 'settings':
        return hasPermission(['admin']) ? <SettingsView /> : <PosTerminal onOpenTableModal={() => setIsTableModalOpen(true)} />;
      default:
        return <PosTerminal onOpenTableModal={() => setIsTableModalOpen(true)} />;
    }
  };

  return (
    <div className={`flex h-screen w-screen overflow-hidden bg-[#120a05] text-[#fef3c7] font-['Cairo',sans-serif] ${isRTL ? 'font-arabic' : 'font-sans'}`}>
      {/* Dark Sidebar */}
      <Sidebar
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
        onOpenWindowsModal={() => setIsWindowsModalOpen(true)}
      />

      {/* Main App Container */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Header */}
        <Header />

        {/* View Content (POS / Tables / Orders / KDS / Inventory / etc.) */}
        <main className="flex-1 flex overflow-hidden">
          {renderActiveView()}
        </main>
      </div>

      {/* Modals & Dialogs */}
      <PaymentModal />
      <ReceiptModal />
      <TableSelectModal
        isOpen={isTableModalOpen}
        onClose={() => setIsTableModalOpen(false)}
      />
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
      <WindowsInstallerModal
        isOpen={isWindowsModalOpen}
        onClose={() => setIsWindowsModalOpen(false)}
      />

      {/* Touch Toasts */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
