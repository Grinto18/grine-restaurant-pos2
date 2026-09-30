import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StorageService } from '../../services/storage';
import {
  Settings as SettingsIcon,
  Download,
  Upload,
  RefreshCw,
  Printer,
  Globe,
  Shield,
  Activity,
  Check,
} from 'lucide-react';
import { Language, RestaurantSettings } from '../../types/pos';

export const SettingsView: React.FC = () => {
  const {
    settings,
    updateSettings,
    language,
    setLanguage,
    auditLogs,
    showToast,
  } = useApp();

  const [form, setForm] = useState<RestaurantSettings>({ ...settings });
  const [activeTab, setActiveTab] = useState<'general' | 'hardware' | 'backup' | 'audit'>('general');

  const handleSave = () => {
    updateSettings(form);
  };

  const handleExportBackup = () => {
    const json = StorageService.exportDatabaseBackup();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GRINE_RESTAURANT_BACKUP_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    showToast('Sauvegarde de la base de données exportée avec succès !', 'success');
  };

  const handleRestoreFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const ok = StorageService.restoreDatabaseBackup(content);
      if (ok) {
        showToast('Restauration réussie ! Rechargement en cours...', 'success');
        setTimeout(() => window.location.reload(), 800);
      } else {
        showToast('Fichier de sauvegarde invalide !', 'error');
      }
    };
    reader.readAsText(file);
  };

  const handleResetDefaults = () => {
    if (window.confirm('ATTENTION : Voulez-vous vraiment réinitialiser toutes les données aux valeurs par défaut ?')) {
      StorageService.resetToFactoryDefaults();
      showToast('Base réinitialisée ! Rechargement...', 'info');
      setTimeout(() => window.location.reload(), 600);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#070b14] overflow-hidden p-6 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800 shrink-0">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2.5">
            <SettingsIcon className="w-6 h-6 text-blue-400" />
            <span>Paramètres Système & Sécurité</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Configuration du restaurant, imprimantes thermiques 80mm, sauvegardes et journal d’audit
          </p>
        </div>

        <button
          onClick={handleSave}
          className="py-2.5 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs flex items-center gap-2 shadow-lg shadow-blue-600/30 transition"
        >
          <Check className="w-4 h-4" />
          <span>Enregistrer les Modifications</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 my-4 shrink-0 bg-slate-900 p-1 rounded-xl border border-slate-800 w-fit">
        <button
          onClick={() => setActiveTab('general')}
          className={`px-4 py-2 rounded-lg text-xs font-black transition ${
            activeTab === 'general' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          Général & Identité
        </button>
        <button
          onClick={() => setActiveTab('hardware')}
          className={`px-4 py-2 rounded-lg text-xs font-black transition ${
            activeTab === 'hardware' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          Imprimantes & Caisse
        </button>
        <button
          onClick={() => setActiveTab('backup')}
          className={`px-4 py-2 rounded-lg text-xs font-black transition ${
            activeTab === 'backup' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          Sauvegarde & Restauration
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2 rounded-lg text-xs font-black transition ${
            activeTab === 'audit' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          Journal d’Audit ({auditLogs.length})
        </button>
      </div>

      {/* Tab Panels */}
      <div className="flex-1 overflow-y-auto rounded-3xl border border-slate-800 bg-[#0a0f1d] p-6 custom-scrollbar">
        {activeTab === 'general' && (
          <div className="max-w-2xl space-y-4 text-xs">
            <div>
              <label className="block text-slate-400 font-bold mb-1">Nom de l'établissement :</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-black text-sm"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-bold mb-1">Slogan / Sous-titre :</label>
              <input
                type="text"
                value={form.tagline}
                onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 font-bold mb-1">Adresse :</label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold"
                />
              </div>
              <div>
                <label className="block text-slate-400 font-bold mb-1">Téléphone de contact :</label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-slate-400 font-bold mb-1">Devise :</label>
                <input
                  type="text"
                  value={form.currency}
                  onChange={(e) => setForm({ ...form, currency: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-black text-amber-400"
                />
              </div>
              <div>
                <label className="block text-slate-400 font-bold mb-1">Taux TVA (%) :</label>
                <input
                  type="number"
                  value={form.taxRate}
                  onChange={(e) => setForm({ ...form, taxRate: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold"
                />
              </div>
              <div>
                <label className="block text-slate-400 font-bold mb-1">Frais de Service (%) :</label>
                <input
                  type="number"
                  value={form.serviceChargeRate}
                  onChange={(e) => setForm({ ...form, serviceChargeRate: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 font-bold mb-1">Langue par défaut :</label>
              <div className="flex gap-2">
                {[
                  { id: 'fr', label: 'Français 🇫🇷' },
                  { id: 'ar', label: 'العربية 🇸🇦' },
                  { id: 'en', label: 'English 🇬🇧' },
                ].map((l) => (
                  <button
                    key={l.id}
                    onClick={() => {
                      setForm({ ...form, language: l.id as Language });
                      setLanguage(l.id as Language);
                    }}
                    className={`py-2 px-4 rounded-xl font-bold border transition ${
                      form.language === l.id
                        ? 'bg-blue-600 text-white border-blue-500 shadow'
                        : 'bg-slate-900 text-slate-300 border-slate-800'
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'hardware' && (
          <div className="max-w-2xl space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-blue-950/20 border border-blue-800/40 text-blue-300 space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-blue-200">
                <Printer className="w-4 h-4" />
                <span>Configuration des Imprimantes Thermiques ESC/POS Windows</span>
              </div>
              <p>
                Le système génère des tickets optimisés pour rouleaux de 80mm avec coupe automatique (Full/Partial Cut) et ouverture du tiroir-caisse RJ11.
              </p>
            </div>

            <div>
              <label className="block text-slate-400 font-bold mb-1">Nom de l'imprimante Caisse (Windows) :</label>
              <input
                type="text"
                value={form.printerName}
                onChange={(e) => setForm({ ...form, printerName: e.target.value })}
                placeholder="Thermal_Printer"
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-bold mb-1">Nom de l'imprimante Cuisine (KOT) :</label>
              <input
                type="text"
                value={form.kitchenPrinterName}
                onChange={(e) => setForm({ ...form, kitchenPrinterName: e.target.value })}
                placeholder="Kitchen_POS80"
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-bold mb-1">Largeur du papier :</label>
              <select
                value={form.receiptWidth}
                onChange={(e) => setForm({ ...form, receiptWidth: e.target.value as any })}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold"
              >
                <option value="80mm">80 mm (Standard Restaurant - Recommandé)</option>
                <option value="58mm">58 mm (Compact)</option>
              </select>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <input
                type="checkbox"
                id="autoPrint"
                checked={form.autoPrintReceipt}
                onChange={(e) => setForm({ ...form, autoPrintReceipt: e.target.checked })}
                className="w-4 h-4 rounded text-blue-600 bg-slate-900 border-slate-700"
              />
              <label htmlFor="autoPrint" className="text-white font-bold cursor-pointer">
                Imprimer automatiquement le ticket lors de chaque encaissement
              </label>
            </div>
          </div>
        )}

        {activeTab === 'backup' && (
          <div className="max-w-xl space-y-6 text-xs">
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Download className="w-4 h-4 text-emerald-400" />
                <span>Exporter une Copie de Sauvegarde Complète</span>
              </h4>
              <p className="text-slate-400">
                Génère un fichier JSON sécurisé contenant tous les produits, recettes, tables, ventes, caisses et configurations.
              </p>
              <button
                onClick={handleExportBackup}
                className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition"
              >
                <Download className="w-4 h-4" />
                <span>Télécharger la Sauvegarde (.json)</span>
              </button>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Upload className="w-4 h-4 text-blue-400" />
                <span>Restaurer une Base de Données</span>
              </h4>
              <p className="text-slate-400">
                Importez un fichier de sauvegarde préalablement exporté.
              </p>
              <label className="inline-flex items-center gap-2 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black cursor-pointer shadow-lg shadow-blue-600/30 transition">
                <Upload className="w-4 h-4" />
                <span>Sélectionner le fichier JSON...</span>
                <input type="file" accept=".json" onChange={handleRestoreFile} className="hidden" />
              </label>
            </div>

            <div className="p-5 rounded-2xl bg-red-950/20 border border-red-800/40 space-y-3 text-red-300">
              <h4 className="text-sm font-bold text-red-200 flex items-center gap-2">
                <RefreshCw className="w-4 h-4" />
                <span>Remise à Zéro (Données d'Usine)</span>
              </h4>
              <p className="text-red-400">
                Efface toutes les ventes et réinitialise les stocks et paramètres au menu algérien de base.
              </p>
              <button
                onClick={handleResetDefaults}
                className="py-2 px-3.5 rounded-xl bg-red-800/60 hover:bg-red-700 text-white font-bold transition"
              >
                Réinitialiser la Base
              </button>
            </div>
          </div>
        )}

        {activeTab === 'audit' && (
          <div className="space-y-3">
            <h4 className="text-sm font-black text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-amber-400" />
              <span>Journal des Activités Sensibles (Audit Logs)</span>
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] font-black border-b border-slate-800">
                  <tr>
                    <th className="p-3">Horodatage</th>
                    <th className="p-3">Utilisateur</th>
                    <th className="p-3">Action</th>
                    <th className="p-3">Détails</th>
                    <th className="p-3 text-center">Type</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-800/40 transition">
                      <td className="p-3 font-mono text-slate-400">
                        {new Date(log.timestamp).toLocaleTimeString('fr-FR')} {new Date(log.timestamp).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="p-3 font-bold text-white">{log.userName}</td>
                      <td className="p-3 font-semibold text-blue-300">{log.action}</td>
                      <td className="p-3 text-slate-300">{log.details}</td>
                      <td className="p-3 text-center">
                        <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] font-bold uppercase text-slate-400">
                          {log.type}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
