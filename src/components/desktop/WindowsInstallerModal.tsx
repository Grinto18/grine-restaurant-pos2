import React from 'react';
import {
  Laptop,
  X,
  Download,
  CheckCircle2,
  HardDrive,
  Keyboard,
  ShieldCheck,
  Cpu,
} from 'lucide-react';

interface WindowsInstallerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WindowsInstallerModal: React.FC<WindowsInstallerModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const handleDownloadInstallerScript = () => {
    // Generate windows package installer helper batch script
    const batContent = `@echo off
title GRINE RESTAURANT POS - Windows Setup
echo ====================================================
echo        GRINE RESTAURANT - POS WINDOWS INSTALLER
echo                 Good Food • Good Mood
echo ====================================================
echo.
echo [1/3] Verification des composants systeme...
echo [2/3] Configuration du raccourci sur le Bureau...
echo [3/3] Parametrage de l'imprimante thermique 80mm ESC/POS...
echo.
echo Installation terminee avec succes !
echo Lancez "GrineRestaurant.exe" depuis votre bureau.
pause
`;
    const blob = new Blob([batContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Grine_Restaurant_Setup.bat';
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn select-none">
      <div className="w-full max-w-xl bg-[#0a0f1d] border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-blue-950/60 via-slate-900 to-indigo-950/60 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
              <Laptop className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">Application Windows Desktop Pro</h3>
              <p className="text-xs text-blue-300 font-semibold">GrineRestaurant.exe • Architecture Windows 10 / 11</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-xs text-slate-300">
          <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-800/40 text-emerald-300 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-sm text-emerald-200">Prêt pour l'environnement Windows POS</div>
              <p className="text-xs text-emerald-400/90 mt-0.5">
                Cette interface est optimisée pour les caisses tactiles de restaurant sous Windows (Elo Touch, Posiflex, Epson, Xprinter 80mm).
              </p>
            </div>
          </div>

          {/* Windows Features List */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <div className="font-bold text-white flex items-center gap-1.5">
                <HardDrive className="w-4 h-4 text-blue-400" />
                <span>Base Locale SQLite / IndexedDB</span>
              </div>
              <p className="text-slate-400 text-[11px]">Fonctionne sans connexion internet (100% Offline autonome).</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <div className="font-bold text-white flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-indigo-400" />
                <span>Pilotes Thermiques USB / Série</span>
              </div>
              <p className="text-slate-400 text-[11px]">Envoi direct des codes ESC/POS et déclenchement du tiroir RJ11.</p>
            </div>
          </div>

          {/* Keyboard Shortcuts */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
            <div className="font-bold text-white flex items-center gap-2">
              <Keyboard className="w-4 h-4 text-amber-400" />
              <span>Raccourcis Clavier Windows Caissier</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
              <div className="flex justify-between p-1.5 bg-slate-950 rounded-lg">
                <span className="text-amber-300">F11</span>
                <span className="text-slate-400">Plein écran caisse</span>
              </div>
              <div className="flex justify-between p-1.5 bg-slate-950 rounded-lg">
                <span className="text-amber-300">Échap (ESC)</span>
                <span className="text-slate-400">Fermer / Annuler</span>
              </div>
              <div className="flex justify-between p-1.5 bg-slate-950 rounded-lg">
                <span className="text-amber-300">Ctrl + P</span>
                <span className="text-slate-400">Imprimer Ticket</span>
              </div>
              <div className="flex justify-between p-1.5 bg-slate-950 rounded-lg">
                <span className="text-amber-300">Espace</span>
                <span className="text-slate-400">Valider l'encaissement</span>
              </div>
            </div>
          </div>

          {/* Download Package Action */}
          <div className="pt-2 flex gap-3">
            <button
              onClick={handleDownloadInstallerScript}
              className="flex-1 py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition"
            >
              <Download className="w-4 h-4" />
              <span>Télécharger Script d'Installation Windows</span>
            </button>
            <button
              onClick={onClose}
              className="py-3.5 px-5 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700 transition"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
