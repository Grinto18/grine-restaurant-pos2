import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Wallet,
  ArrowDownCircle,
  ArrowUpCircle,
  CheckCircle2,
  Clock,
  Printer,
  AlertCircle,
} from 'lucide-react';

export const CashRegisterView: React.FC = () => {
  const {
    shifts,
    currentShift,
    openNewShift,
    closeCurrentShift,
    settings,
    currentUser,
  } = useApp();

  const [openingInput, setOpeningInput] = useState<number>(20000);
  const [closingInput, setClosingInput] = useState<number>(currentShift?.expectedCash || 20000);
  const [closingNotes, setClosingNotes] = useState<string>('');
  const [isClosingModalOpen, setIsClosingModalOpen] = useState(false);

  const handleOpenShift = () => {
    openNewShift(Number(openingInput));
  };

  const handleCloseShift = () => {
    closeCurrentShift(Number(closingInput), closingNotes);
    setIsClosingModalOpen(false);
  };

  const difference = currentShift ? closingInput - currentShift.expectedCash : 0;

  return (
    <div className="flex-1 flex flex-col h-full bg-[#070b14] overflow-hidden p-6 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800 shrink-0">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2.5">
            <Wallet className="w-6 h-6 text-amber-400" />
            <span>Gestion de la Caisse & Clôture de Session (Rapport Z)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Ouverture du tiroir-caisse, suivi des encaissements physiques et réconciliation de fin de journée
          </p>
        </div>

        <div>
          {currentShift ? (
            <button
              onClick={() => {
                setClosingInput(currentShift.expectedCash);
                setIsClosingModalOpen(true);
              }}
              className="py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs flex items-center gap-2 shadow-lg shadow-red-600/30 transition"
            >
              <span>Clôturer la Caisse (Z)</span>
            </button>
          ) : (
            <button
              onClick={handleOpenShift}
              className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition"
            >
              <span>Ouvrir une Nouvelle Caisse</span>
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-5 space-y-6 custom-scrollbar">
        {/* Active Shift Dashboard */}
        {currentShift ? (
          <div className="p-6 rounded-3xl bg-[#0c1322] border border-slate-800 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
              <div className="flex items-center gap-2.5">
                <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping"></span>
                <span className="text-xs font-black uppercase text-emerald-400 tracking-wider">
                  Session Caisse Active
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  (Ouverte par {currentShift.openedBy} à {new Date(currentShift.openedAt).toLocaleTimeString('fr-FR')})
                </span>
              </div>

              <div className="text-xs font-bold text-slate-300">
                Fond initial : <span className="font-black text-white">{currentShift.openingCash} {settings.currency}</span>
              </div>
            </div>

            {/* Calculations Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Expected Cash in Drawer */}
              <div className="p-4 rounded-2xl bg-[#090e1a] border border-slate-700/80">
                <span className="text-[11px] font-bold text-slate-400 uppercase">
                  Espèces Théoriques en Caisse
                </span>
                <div className="text-2xl font-black text-amber-400 mt-1">
                  {currentShift.expectedCash} {settings.currency}
                </div>
                <div className="text-[10px] text-slate-500 mt-1">
                  Fond + Ventes Espèces - Dépenses
                </div>
              </div>

              {/* Cash Sales */}
              <div className="p-4 rounded-2xl bg-[#090e1a] border border-slate-700/80">
                <span className="text-[11px] font-bold text-slate-400 uppercase">
                  Ventes Espèces Récoltées
                </span>
                <div className="text-2xl font-black text-emerald-400 mt-1">
                  +{currentShift.cashSales} {settings.currency}
                </div>
                <div className="text-[10px] text-slate-500 mt-1">
                  Paiements en liquide
                </div>
              </div>

              {/* Card Sales */}
              <div className="p-4 rounded-2xl bg-[#090e1a] border border-slate-700/80">
                <span className="text-[11px] font-bold text-slate-400 uppercase">
                  Ventes Carte CIB / Dahabia
                </span>
                <div className="text-2xl font-black text-blue-400 mt-1">
                  {currentShift.cardSales} {settings.currency}
                </div>
                <div className="text-[10px] text-slate-500 mt-1">
                  Paiements électroniques
                </div>
              </div>

              {/* Expenses taken from drawer */}
              <div className="p-4 rounded-2xl bg-[#090e1a] border border-slate-700/80">
                <span className="text-[11px] font-bold text-slate-400 uppercase">
                  Sorties de Caisse (Dépenses)
                </span>
                <div className="text-2xl font-black text-red-400 mt-1">
                  -{currentShift.totalExpenses} {settings.currency}
                </div>
                <div className="text-[10px] text-slate-500 mt-1">
                  Achats / Frais urgents
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 rounded-3xl bg-[#0c1322] border border-slate-800 text-center max-w-lg mx-auto space-y-4 shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-slate-900 mx-auto flex items-center justify-center text-3xl">
              💼
            </div>
            <div>
              <h3 className="text-lg font-black text-white">Aucune caisse ouverte actuellement</h3>
              <p className="text-xs text-slate-400 mt-1">
                Saisissez le fond de caisse initial pour commencer à enregistrer les ventes
              </p>
            </div>

            <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 text-left space-y-2">
              <label className="block text-xs font-bold text-slate-400 uppercase">
                Fond de Caisse Initial ({settings.currency}) :
              </label>
              <input
                type="number"
                value={openingInput}
                onChange={(e) => setOpeningInput(Number(e.target.value))}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-xl font-black text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-right font-mono"
              />
            </div>

            <button
              onClick={handleOpenShift}
              className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm shadow-xl shadow-emerald-600/30 transition"
            >
              Valider l'ouverture du tiroir-caisse
            </button>
          </div>
        )}

        {/* History of Past Shifts */}
        <div className="p-6 rounded-3xl bg-[#0a0f1d] border border-slate-800 space-y-4">
          <h3 className="text-sm font-black text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-400" />
            <span>Historique des Sessions & Clôtures Précédentes</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] font-black tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-3">Date d'ouverture</th>
                  <th className="p-3">Caissier</th>
                  <th className="p-3 text-right">Fond Initial</th>
                  <th className="p-3 text-right">Ventes Espèces</th>
                  <th className="p-3 text-right">Ventes Carte</th>
                  <th className="p-3 text-right">Théorique</th>
                  <th className="p-3 text-right">Réel Compté</th>
                  <th className="p-3 text-right">Écart</th>
                  <th className="p-3 text-center">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {shifts.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-800/30 transition">
                    <td className="p-3 font-mono text-slate-300">
                      {new Date(s.openedAt).toLocaleDateString('fr-FR')} {new Date(s.openedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="p-3 font-bold text-white">{s.openedBy}</td>
                    <td className="p-3 text-right font-mono">{s.openingCash} {settings.currency}</td>
                    <td className="p-3 text-right font-mono text-emerald-400">+{s.cashSales}</td>
                    <td className="p-3 text-right font-mono text-blue-400">+{s.cardSales}</td>
                    <td className="p-3 text-right font-mono font-bold text-amber-400">{s.expectedCash}</td>
                    <td className="p-3 text-right font-mono font-bold text-white">
                      {s.actualCash !== undefined ? `${s.actualCash} ${settings.currency}` : '—'}
                    </td>
                    <td className="p-3 text-right font-mono">
                      {s.difference !== undefined ? (
                        <span className={`font-bold ${s.difference === 0 ? 'text-emerald-400' : s.difference < 0 ? 'text-red-400' : 'text-blue-400'}`}>
                          {s.difference > 0 ? `+${s.difference}` : s.difference}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="p-3 text-center">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          s.status === 'open'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {s.status === 'open' ? 'En cours' : 'Clôturée'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal: Close Shift */}
      {isClosingModalOpen && currentShift && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-[#0c1322] border border-slate-700 rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-black text-white border-b border-slate-800 pb-3">
              Clôture de Caisse (Rapport Z)
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">Total Espèces Attendu :</span>
                <span className="text-base font-black text-amber-400">
                  {currentShift.expectedCash} {settings.currency}
                </span>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">
                  Montant physique réel compté dans le tiroir ({settings.currency}) :
                </label>
                <input
                  type="number"
                  value={closingInput}
                  onChange={(e) => setClosingInput(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-xl font-black text-white text-right"
                />
              </div>

              <div
                className={`p-3 rounded-xl border flex justify-between items-center ${
                  difference === 0
                    ? 'bg-emerald-950/40 border-emerald-800 text-emerald-400'
                    : difference < 0
                    ? 'bg-red-950/40 border-red-800 text-red-400'
                    : 'bg-blue-950/40 border-blue-800 text-blue-400'
                }`}
              >
                <span className="font-bold">Écart de caisse :</span>
                <span className="font-black text-base">
                  {difference > 0 ? `+${difference}` : difference} {settings.currency}
                </span>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Notes / Justificatif :</label>
                <textarea
                  rows={2}
                  value={closingNotes}
                  onChange={(e) => setClosingNotes(e.target.value)}
                  placeholder="Ex: Fond recompté, pas d'anomalie..."
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setIsClosingModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs hover:bg-slate-700"
              >
                Annuler
              </button>
              <button
                onClick={handleCloseShift}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-black text-xs hover:bg-red-500 shadow-lg shadow-red-600/30"
              >
                Confirmer la Clôture Z
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
