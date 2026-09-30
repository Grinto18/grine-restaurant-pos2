import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  BarChart3,
  TrendingUp,
  CreditCard,
  Banknote,
  ShoppingBag,
  Percent,
  Calendar,
  Printer,
  Award,
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const { orders, products, categories, settings } = useApp();
  const [dateRange, setDateRange] = useState<'today' | 'yesterday' | 'week' | 'month' | 'all'>('today');

  // Filter orders by date range
  const filteredOrders = orders.filter((order) => {
    if (order.status !== 'paid' && order.status !== 'completed') return false;

    const orderDate = new Date(order.createdAt);
    const now = new Date();

    if (dateRange === 'today') {
      return orderDate.toDateString() === now.toDateString();
    }
    if (dateRange === 'yesterday') {
      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      return orderDate.toDateString() === yesterday.toDateString();
    }
    if (dateRange === 'week') {
      const weekAgo = new Date(now);
      weekAgo.setDate(now.getDate() - 7);
      return orderDate >= weekAgo;
    }
    if (dateRange === 'month') {
      return (
        orderDate.getMonth() === now.getMonth() &&
        orderDate.getFullYear() === now.getFullYear()
      );
    }
    return true;
  });

  // Aggregations
  const totalRevenue = filteredOrders.reduce((sum, o) => sum + o.total, 0);
  const totalOrdersCount = filteredOrders.length;
  const avgOrderValue = totalOrdersCount > 0 ? Math.round(totalRevenue / totalOrdersCount) : 0;

  const cashSales = filteredOrders
    .filter((o) => o.paymentMethod === 'cash')
    .reduce((sum, o) => sum + o.total, 0);

  const cardSales = filteredOrders
    .filter((o) => o.paymentMethod === 'card')
    .reduce((sum, o) => sum + o.total, 0);

  const totalDiscounts = filteredOrders.reduce((sum, o) => sum + o.discountAmount, 0);

  // Approximate food cost & gross profit
  let totalFoodCost = 0;
  filteredOrders.forEach((o) => {
    o.items.forEach((item) => {
      const p = products.find((prod) => prod.id === item.productId);
      const unitCost = p?.costPrice || Math.round(item.price * 0.45);
      totalFoodCost += unitCost * item.quantity;
    });
  });
  const grossProfit = Math.max(0, totalRevenue - totalFoodCost);
  const profitMargin = totalRevenue > 0 ? Math.round((grossProfit / totalRevenue) * 100) : 0;

  // Top Selling Dishes
  const itemMap: { [prodId: string]: { name: string; qty: number; revenue: number } } = {};
  filteredOrders.forEach((o) => {
    o.items.forEach((item) => {
      if (!itemMap[item.productId]) {
        itemMap[item.productId] = { name: item.productName, qty: 0, revenue: 0 };
      }
      itemMap[item.productId].qty += item.quantity;
      itemMap[item.productId].revenue += item.price * item.quantity;
    });
  });

  const topProducts = Object.values(itemMap)
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  const handlePrintZReport = () => {
    window.print();
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#070b14] overflow-hidden p-6 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800 shrink-0">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2.5">
            <BarChart3 className="w-6 h-6 text-blue-400" />
            <span>Tableau de Bord & Rapport des Ventes</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Indicateurs de performance commerciale, chiffre d’affaires, encaissements et rentabilité
          </p>
        </div>

        {/* Date Range Selector */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-bold">
            {(['today', 'yesterday', 'week', 'month', 'all'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`px-3 py-1.5 rounded-lg transition ${
                  dateRange === range
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {range === 'today'
                  ? "Aujourd'hui"
                  : range === 'yesterday'
                  ? 'Hier'
                  : range === 'week'
                  ? '7 Jours'
                  : range === 'month'
                  ? 'Ce Mois'
                  : 'Tout'}
              </button>
            ))}
          </div>

          <button
            onClick={handlePrintZReport}
            className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center gap-1.5 transition"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimer Rapport</span>
          </button>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="flex-1 overflow-y-auto py-5 space-y-6 custom-scrollbar">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Revenue */}
          <div className="p-4 rounded-2xl bg-[#0d1424] border border-slate-800 flex flex-col justify-between shadow-lg">
            <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
              <span>Chiffre d’Affaires</span>
              <span className="p-2 rounded-xl bg-blue-600/20 text-blue-400">
                <TrendingUp className="w-4 h-4" />
              </span>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-black text-amber-400">
                {totalRevenue} <span className="text-xs font-bold text-amber-300">{settings.currency}</span>
              </div>
              <div className="text-[11px] text-emerald-400 font-semibold mt-1">
                {totalOrdersCount} commandes réglées
              </div>
            </div>
          </div>

          {/* Average Order */}
          <div className="p-4 rounded-2xl bg-[#0d1424] border border-slate-800 flex flex-col justify-between shadow-lg">
            <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
              <span>Panier Moyen</span>
              <span className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400">
                <ShoppingBag className="w-4 h-4" />
              </span>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-black text-white">
                {avgOrderValue} <span className="text-xs font-bold text-slate-400">{settings.currency}</span>
              </div>
              <div className="text-[11px] text-slate-400 font-semibold mt-1">
                Moyenne par client
              </div>
            </div>
          </div>

          {/* Cash vs Card */}
          <div className="p-4 rounded-2xl bg-[#0d1424] border border-slate-800 flex flex-col justify-between shadow-lg">
            <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
              <span>Modes de Paiement</span>
              <span className="p-2 rounded-xl bg-emerald-600/20 text-emerald-400">
                <Banknote className="w-4 h-4" />
              </span>
            </div>
            <div className="mt-2 space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">💵 Espèces :</span>
                <span className="font-black text-emerald-400">{cashSales} {settings.currency}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">💳 Carte CIB :</span>
                <span className="font-black text-blue-400">{cardSales} {settings.currency}</span>
              </div>
            </div>
          </div>

          {/* Gross Profit */}
          <div className="p-4 rounded-2xl bg-[#0d1424] border border-slate-800 flex flex-col justify-between shadow-lg">
            <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
              <span>Marge Brute Estimée</span>
              <span className="p-2 rounded-xl bg-purple-600/20 text-purple-400">
                <Percent className="w-4 h-4" />
              </span>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-black text-emerald-400">
                +{grossProfit} <span className="text-xs font-bold">{settings.currency}</span>
              </div>
              <div className="text-[11px] text-slate-400 font-semibold mt-1">
                Taux de marge : ~{profitMargin}%
              </div>
            </div>
          </div>
        </div>

        {/* Breakdown Section: Top Products & Recent Paid Orders */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top 5 Products */}
          <div className="p-5 rounded-2xl bg-[#0a0f1d] border border-slate-800 space-y-4">
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              <span>Plats les Plus Vendus (Top 5)</span>
            </h3>

            {topProducts.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">Aucune vente enregistrée sur cette période.</p>
            ) : (
              <div className="space-y-3">
                {topProducts.map((item, index) => (
                  <div key={item.name} className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800/80">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-slate-800 text-blue-400 font-black text-xs flex items-center justify-center">
                        {index + 1}
                      </div>
                      <span className="font-bold text-white text-xs">{item.name}</span>
                    </div>

                    <div className="text-right">
                      <div className="font-black text-amber-400 text-xs">
                        {item.revenue} {settings.currency}
                      </div>
                      <div className="text-[10px] text-slate-400">{item.qty} portions vendues</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Orders List */}
          <div className="p-5 rounded-2xl bg-[#0a0f1d] border border-slate-800 space-y-4">
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-400" />
              <span>Dernières Commandes Réglées</span>
            </h3>

            {filteredOrders.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">Aucune commande sur cette période.</p>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto custom-scrollbar pr-1">
                {filteredOrders.slice(0, 10).map((o) => (
                  <div key={o.id} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800/80 text-xs">
                    <div>
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <span>Ticket #{o.orderNumber}</span>
                        <span className="text-[10px] text-slate-400 font-normal">
                          ({o.tableName || 'À Emporter'})
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {new Date(o.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} • Caissier: {o.cashierName}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-black text-amber-400">
                        {o.total} {settings.currency}
                      </div>
                      <div className="text-[10px] uppercase font-bold text-emerald-400">
                        {o.paymentMethod}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
