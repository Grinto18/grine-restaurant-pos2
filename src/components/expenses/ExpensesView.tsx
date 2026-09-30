import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Receipt,
  Plus,
  Trash2,
  Calendar,
  X,
  CreditCard,
  DollarSign,
} from 'lucide-react';
import { Expense } from '../../types/pos';

export const ExpensesView: React.FC = () => {
  const { expenses, addExpense, settings, currentUser } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [title, setTitle] = useState('');
  const [type, setType] = useState<Expense['type']>('Purchase');
  const [amount, setAmount] = useState<number>(1500);
  const [note, setNote] = useState('');

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  const handleSave = () => {
    if (!title || amount <= 0) return;
    addExpense({
      title,
      type,
      amount: Number(amount),
      date: new Date().toISOString(),
      note,
      recordedBy: currentUser.name,
    });
    setIsModalOpen(false);
    setTitle('');
    setAmount(1500);
    setNote('');
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#070b14] overflow-hidden p-6 select-none">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800 shrink-0">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2.5">
            <Receipt className="w-6 h-6 text-red-400" />
            <span>Gestion des Dépenses & Frais Généraux</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Enregistrement des sorties d’argent (Achats, électricité, maintenance, salaires)
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs flex items-center gap-2 shadow-lg shadow-red-600/30 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Ajouter une Dépense</span>
        </button>
      </div>

      {/* Summary Card */}
      <div className="my-5 p-5 rounded-2xl bg-[#0d1424] border border-slate-800 flex items-center justify-between shadow-lg">
        <div>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Total des Dépenses Enregistrées
          </div>
          <div className="text-3xl font-black text-red-400 mt-1">
            -{totalExpenses} <span className="text-sm text-red-300">{settings.currency}</span>
          </div>
        </div>
        <div className="p-3 bg-red-950/40 border border-red-800/40 rounded-2xl text-red-400">
          <Receipt className="w-8 h-8" />
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto rounded-2xl border border-slate-800 bg-[#0a0f1d] custom-scrollbar">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] font-black tracking-wider border-b border-slate-800 sticky top-0">
            <tr>
              <th className="p-3.5">Date</th>
              <th className="p-3.5">Libellé / Titre</th>
              <th className="p-3.5">Catégorie</th>
              <th className="p-3.5">Responsable</th>
              <th className="p-3.5 text-right">Montant</th>
              <th className="p-3.5">Note</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-medium">
            {expenses.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-500">
                  Aucune dépense enregistrée pour le moment.
                </td>
              </tr>
            ) : (
              expenses.map((exp) => (
                <tr key={exp.id} className="hover:bg-slate-800/40 transition">
                  <td className="p-3.5 font-mono text-slate-400">
                    {new Date(exp.date).toLocaleDateString('fr-FR')} {new Date(exp.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="p-3.5 font-bold text-white">{exp.title}</td>
                  <td className="p-3.5">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 text-[11px] font-bold">
                      {exp.type}
                    </span>
                  </td>
                  <td className="p-3.5 text-slate-300">{exp.recordedBy}</td>
                  <td className="p-3.5 text-right font-black text-red-400">
                    -{exp.amount} {settings.currency}
                  </td>
                  <td className="p-3.5 text-slate-400 text-[11px]">{exp.note || '—'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Expense Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-sm bg-[#0c1322] border border-slate-700 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-black text-white">Nouvelle Dépense</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1">Titre de la dépense :</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Achat viandes, Facture Sonelgaz..."
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Catégorie :</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold"
                >
                  <option value="Purchase">Achat Matières / Ingrédients</option>
                  <option value="Electricity">Électricité / Gaz</option>
                  <option value="Water">Eau</option>
                  <option value="Maintenance">Maintenance & Réparation</option>
                  <option value="Rent">Loyer</option>
                  <option value="Other">Autre frais</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Montant ({settings.currency}) :</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xl font-black text-red-400"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Note / Détail :</label>
                <textarea
                  rows={2}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Facture N°..."
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700"
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-black hover:bg-red-500 shadow-lg shadow-red-600/30"
              >
                Enregistrer Dépense
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
