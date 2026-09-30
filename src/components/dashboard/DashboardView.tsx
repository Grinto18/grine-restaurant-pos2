import React from 'react';
import { BarChart3, Banknote, ChefHat, CircleAlert, ReceiptText, Utensils } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const money = (value: number) => `${new Intl.NumberFormat('fr-DZ').format(value)} DA`;

export const DashboardView: React.FC = () => {
  const { orders, tables, products } = useApp();
  const today = new Date().toDateString();
  const todayOrders = orders.filter(o => new Date(o.createdAt).toDateString() === today);
  const paid = todayOrders.filter(o => ['paid', 'completed'].includes(o.status));
  const revenue = paid.reduce((sum, o) => sum + o.total, 0);
  const stats = [
    ['Chiffre du jour', money(revenue), Banknote, 'text-emerald-400'],
    ['Commandes', String(todayOrders.length), ReceiptText, 'text-amber-400'],
    ['Ticket moyen', money(paid.length ? Math.round(revenue / paid.length) : 0), BarChart3, 'text-sky-400'],
    ['Tables ouvertes', String(tables.filter(t => t.status === 'occupied').length), Utensils, 'text-orange-400'],
    ['Cuisine en attente', String(orders.filter(o => ['pending','cooking'].includes(o.status)).length), ChefHat, 'text-rose-400'],
    ['Stock faible', String(products.filter(p => p.stock <= p.minStock).length), CircleAlert, 'text-yellow-300'],
  ] as const;
  const top = new Map<string, number>();
  paid.flatMap(o => o.items).forEach(i => top.set(i.productName, (top.get(i.productName) || 0) + i.quantity));
  const ranking = [...top].sort((a,b) => b[1]-a[1]).slice(0,5);
  const max = Math.max(1, ...ranking.map(r => r[1]));
  return <section className="flex-1 overflow-y-auto bg-[#120a05] p-5 md:p-7 custom-scrollbar">
    <div className="mb-6"><p className="text-xs uppercase tracking-[.28em] text-amber-500">Pilotage en direct</p><h2 className="text-2xl font-black text-white">Tableau de bord</h2></div>
    <div className="grid grid-cols-2 xl:grid-cols-3 gap-3">{stats.map(([label,value,Icon,color]) => <div key={label} className="rounded-2xl border border-[#3b2615] bg-[#1b1109] p-4 flex justify-between items-start"><div><p className="text-xs text-stone-400">{label}</p><p className="mt-2 text-2xl font-black text-white">{value}</p></div><Icon className={`w-6 h-6 ${color}`}/></div>)}</div>
    <div className="mt-5 grid lg:grid-cols-[1.35fr_.65fr] gap-4">
      <div className="rounded-3xl border border-[#3b2615] bg-[#1b1109] p-5"><h3 className="font-black text-white mb-5">Produits les plus servis aujourd’hui</h3>{ranking.length ? <div className="space-y-4">{ranking.map(([name,qty],i)=><div key={name}><div className="flex justify-between text-xs mb-1.5"><span className="text-stone-200">{i+1}. {name}</span><b className="text-amber-400">{qty}</b></div><div className="h-2 rounded-full bg-[#342011]"><div className="h-full rounded-full bg-amber-600" style={{width:`${qty/max*100}%`}}/></div></div>)}</div>:<p className="py-10 text-center text-stone-500">Les ventes du jour apparaissent ici.</p>}</div>
      <div className="rounded-3xl border border-[#3b2615] bg-[#1b1109] p-5"><h3 className="font-black text-white">État du service</h3><div className="mt-5 space-y-3 text-sm"><div className="flex justify-between"><span className="text-stone-400">Terminées</span><b className="text-emerald-400">{todayOrders.filter(o=>['paid','completed'].includes(o.status)).length}</b></div><div className="flex justify-between"><span className="text-stone-400">Annulées</span><b className="text-rose-400">{todayOrders.filter(o=>o.status==='cancelled').length}</b></div><div className="flex justify-between"><span className="text-stone-400">Remises</span><b className="text-amber-400">{money(paid.reduce((s,o)=>s+o.discountAmount,0))}</b></div></div></div>
    </div>
  </section>;
};
