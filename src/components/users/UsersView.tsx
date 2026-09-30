import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StorageService } from '../../services/storage';
import {
  Users as UsersIcon,
  Shield,
  Plus,
  Key,
  UserCheck,
  X,
  Edit2,
  Trash2,
} from 'lucide-react';
import { Role, User } from '../../types/pos';

export const UsersView: React.FC = () => {
  const { currentUser, switchUser, showToast } = useApp();
  const [users, setUsers] = useState<User[]>(StorageService.getUsers);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [role, setRole] = useState<Role>('cashier');
  const [pin, setPin] = useState('1234');

  const handleSaveUser = () => {
    if (!name || !username) return;
    const newUser: User = {
      id: `u-${Date.now()}`,
      name,
      username,
      role,
      pin,
    };
    const updated = [...users, newUser];
    setUsers(updated);
    StorageService.saveUsers(updated);
    showToast(`Utilisateur ${name} ajouté avec le rôle ${role.toUpperCase()}`, 'success');
    setIsModalOpen(false);
    setName('');
    setUsername('');
    setPin('1234');
  };

  const handleDelete = (id: string) => {
    if (id === currentUser.id) {
      showToast('Impossible de supprimer votre propre compte actif !', 'error');
      return;
    }
    const updated = users.filter((u) => u.id !== id);
    setUsers(updated);
    StorageService.saveUsers(updated);
    showToast('Utilisateur supprimé', 'info');
  };

  const getRoleBadge = (r: Role) => {
    switch (r) {
      case 'admin':
        return 'bg-purple-950 text-purple-400 border-purple-800';
      case 'manager':
        return 'bg-blue-950 text-blue-400 border-blue-800';
      case 'cashier':
        return 'bg-emerald-950 text-emerald-400 border-emerald-800';
      case 'kitchen':
        return 'bg-amber-950 text-amber-400 border-amber-800';
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#070b14] overflow-hidden p-6 select-none">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800 shrink-0">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2.5">
            <UsersIcon className="w-6 h-6 text-blue-400" />
            <span>Gestion des Utilisateurs & Rôles (RBAC)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Contrôle d'accès et permissions : Administrateur, Manager, Caissier et Chef de Cuisine
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs flex items-center gap-2 shadow-lg shadow-blue-600/30 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Nouvel Utilisateur</span>
        </button>
      </div>

      {/* Permissions Matrix Overview */}
      <div className="my-5 p-4 rounded-2xl bg-[#0c1322] border border-slate-800 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
        <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
          <div className="font-black text-purple-400 uppercase">Admin</div>
          <p className="text-[11px] text-slate-400 mt-1">Accès total : Caisse, Stock, Rapports, Paramètres, Utilisateurs.</p>
        </div>
        <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
          <div className="font-black text-blue-400 uppercase">Manager</div>
          <p className="text-[11px] text-slate-400 mt-1">Ventes, Rapports, Clôture Z, Stock & Recettes.</p>
        </div>
        <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
          <div className="font-black text-emerald-400 uppercase">Cashier</div>
          <p className="text-[11px] text-slate-400 mt-1">Écran POS, Tables, Encaissements et Impression.</p>
        </div>
        <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
          <div className="font-black text-amber-400 uppercase">Kitchen</div>
          <p className="text-[11px] text-slate-400 mt-1">Écran KDS uniquement (Préparation & Cuisson).</p>
        </div>
      </div>

      {/* Users Table */}
      <div className="flex-1 overflow-y-auto rounded-2xl border border-slate-800 bg-[#0a0f1d] custom-scrollbar">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] font-black border-b border-slate-800 sticky top-0">
            <tr>
              <th className="p-3.5">Nom complet</th>
              <th className="p-3.5">Identifiant</th>
              <th className="p-3.5">Rôle</th>
              <th className="p-3.5">Code PIN</th>
              <th className="p-3.5 text-center">Basculer de session</th>
              <th className="p-3.5 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-medium">
            {users.map((u) => {
              const isCurrent = u.id === currentUser.id;
              return (
                <tr key={u.id} className="hover:bg-slate-800/40 transition">
                  <td className="p-3.5 font-bold text-white flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center font-black text-blue-400 text-xs uppercase">
                      {u.name.slice(0, 2)}
                    </div>
                    <span>{u.name}</span>
                    {isCurrent && (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-blue-600 text-white">
                        Actuel
                      </span>
                    )}
                  </td>
                  <td className="p-3.5 font-mono text-slate-400">@{u.username}</td>
                  <td className="p-3.5">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase border ${getRoleBadge(u.role)}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="p-3.5 font-mono text-slate-500">••••</td>
                  <td className="p-3.5 text-center">
                    <button
                      onClick={() => switchUser(u.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                        isCurrent
                          ? 'bg-slate-800 text-slate-500 cursor-default'
                          : 'bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white border border-blue-500/30'
                      }`}
                    >
                      {isCurrent ? 'En cours' : 'Se connecter'}
                    </button>
                  </td>
                  <td className="p-3.5 text-center">
                    <button
                      disabled={isCurrent}
                      onClick={() => handleDelete(u.id)}
                      className="p-1.5 rounded-lg bg-slate-800 text-red-400 hover:bg-red-900/40 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-sm bg-[#0c1322] border border-slate-700 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-black text-white">Ajouter un Utilisateur</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1">Nom complet :</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Ahmed Caisse"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Nom d'utilisateur :</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="ahmed"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Rôle et Permissions :</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as Role)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold"
                >
                  <option value="cashier">Caissier (POS & Tables)</option>
                  <option value="kitchen">Cuisine (KDS uniquement)</option>
                  <option value="manager">Manager (Gestion & Clôture)</option>
                  <option value="admin">Administrateur (Tous droits)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Code PIN rapide (4 chiffres) :</label>
                <input
                  type="password"
                  maxLength={6}
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono text-center text-lg tracking-widest"
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
                onClick={handleSaveUser}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white font-black hover:bg-blue-500 shadow-md shadow-blue-600/30"
              >
                Créer Compte
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
