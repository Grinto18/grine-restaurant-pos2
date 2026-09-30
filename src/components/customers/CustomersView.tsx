import React, { useMemo, useState } from 'react';
import { Plus, Search, Trash2, X } from 'lucide-react';
import { Customer } from '../../types/pos';
import { StorageService } from '../../services/storage';
import { useApp } from '../../context/AppContext';

export const CustomersView: React.FC = () => {
  const { orders, showToast } = useApp();
  const [customers,setCustomers] = useState<Customer[]>(StorageService.getCustomers());
  const [search,setSearch] = useState(''); const [open,setOpen] = useState(false);
  const [form,setForm] = useState({name:'',phone:'',address:'',notes:''});
  const filtered=useMemo(()=>customers.filter(c=>`${c.name} ${c.phone}`.toLowerCase().includes(search.toLowerCase())),[customers,search]);
  const save=()=>{if(!form.name.trim()||!form.phone.trim()){showToast('Nom et téléphone requis','warning');return;} const next=[{...form,id:`customer-${Date.now()}`,createdAt:new Date().toISOString()},...customers];setCustomers(next);StorageService.saveCustomers(next);setOpen(false);setForm({name:'',phone:'',address:'',notes:''});showToast('Client enregistré','success')};
  const remove=(id:string)=>{if(!confirm('Supprimer cette fiche client ?'))return;const next=customers.filter(c=>c.id!==id);setCustomers(next);StorageService.saveCustomers(next)};
  return <section className="flex-1 overflow-y-auto bg-[#120a05] p-5 md:p-7 custom-scrollbar"><div className="flex justify-between items-end gap-4 mb-5"><div><p className="text-xs uppercase tracking-[.25em] text-amber-500">Relation client</p><h2 className="text-2xl font-black text-white">Clients</h2></div><button onClick={()=>setOpen(true)} className="min-h-11 px-4 rounded-xl bg-amber-600 text-white font-black flex items-center gap-2"><Plus size={18}/> Nouveau client</button></div>
  <div className="relative mb-4"><Search className="absolute left-3 top-3 text-stone-500" size={18}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Nom ou téléphone" className="w-full min-h-11 pl-10 pr-4 rounded-xl border border-[#3b2615] bg-[#1b1109] text-white outline-none focus:border-amber-500"/></div>
  <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3">{filtered.map(c=>{const own=orders.filter(o=>o.customerId===c.id);return <article key={c.id} className="rounded-2xl border border-[#3b2615] bg-[#1b1109] p-4"><div className="flex justify-between"><div><h3 className="font-black text-white">{c.name}</h3><p className="text-sm text-amber-400 mt-1">{c.phone}</p></div><button onClick={()=>remove(c.id)} className="w-11 h-11 rounded-xl text-rose-400 hover:bg-rose-950/40"><Trash2 className="mx-auto" size={17}/></button></div><p className="text-xs text-stone-400 mt-3">{c.address||'Adresse non renseignée'}</p><div className="mt-4 pt-3 border-t border-[#352113] flex justify-between text-xs"><span className="text-stone-500">{own.length} commandes</span><b className="text-emerald-400">{own.reduce((s,o)=>s+o.total,0).toLocaleString('fr-DZ')} DA</b></div></article>})}</div>
  {open&&<div className="fixed inset-0 z-50 bg-black/80 grid place-items-center p-4"><div className="w-full max-w-lg rounded-3xl bg-[#1b1109] border border-[#4b301a] p-5"><div className="flex justify-between mb-4"><h3 className="text-white font-black text-lg">Nouveau client</h3><button onClick={()=>setOpen(false)} className="w-11 h-11"><X className="mx-auto text-stone-400"/></button></div><div className="grid gap-3">{[['name','Nom complet'],['phone','Téléphone'],['address','Adresse de livraison'],['notes','Notes']].map(([key,label])=><input key={key} value={form[key as keyof typeof form]} onChange={e=>setForm({...form,[key]:e.target.value})} placeholder={label} className="min-h-12 rounded-xl bg-[#120a05] border border-[#422915] px-4 text-white outline-none focus:border-amber-500"/>)}<button onClick={save} className="min-h-12 rounded-xl bg-amber-600 text-white font-black">Enregistrer le client</button></div></div></div>}
  </section>
};
