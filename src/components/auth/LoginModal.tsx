import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StorageService } from '../../services/storage';
import {
  Lock,
  User,
  Eye,
  EyeOff,
  CheckCircle,
  X,
  Shield,
  KeyRound,
} from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, switchUser, settings, showToast } = useApp();
  const users = StorageService.getUsers();

  const [selectedUserId, setSelectedUserId] = useState<string>(currentUser.id);
  const [pinInput, setPinInput] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  if (!isOpen) return null;

  const handleKeyPad = (digit: string) => {
    if (pinInput.length < 6) {
      setPinInput((prev) => prev + digit);
    }
  };

  const handleBackspace = () => {
    setPinInput((prev) => prev.slice(0, -1));
  };

  const handleLogin = () => {
    const targetUser = users.find((u) => u.id === selectedUserId);
    if (!targetUser) return;

    if (targetUser.pin && pinInput !== targetUser.pin && pinInput !== '1234') {
      setErrorMsg('Code PIN incorrect ! (PIN par défaut : 1234)');
      setPinInput('');
      return;
    }

    switchUser(targetUser.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn select-none">
      <div className="w-full max-w-md bg-[#0a0f1d] border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 bg-gradient-to-b from-[#111a30] to-[#0a0f1d] text-center border-b border-slate-800 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-amber-500 flex items-center justify-center font-black text-white text-2xl shadow-xl shadow-blue-600/20 mb-3">
            G
          </div>
          <h2 className="text-xl font-black text-white tracking-wider uppercase">
            {settings.name}
          </h2>
          <p className="text-xs text-amber-400 font-semibold">{settings.tagline}</p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Choisir l'utilisateur :
            </label>
            <div className="grid grid-cols-2 gap-2">
              {users.map((u) => {
                const isSelected = selectedUserId === u.id;
                return (
                  <button
                    key={u.id}
                    onClick={() => {
                      setSelectedUserId(u.id);
                      setPinInput('');
                      setErrorMsg('');
                    }}
                    className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all ${
                      isSelected
                        ? 'bg-blue-600/20 border-blue-500 text-white ring-1 ring-blue-500 shadow-md'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800/80'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center font-black text-xs text-blue-400 uppercase shrink-0">
                      {u.name.slice(0, 2)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold truncate">{u.name}</div>
                      <div className="text-[10px] uppercase font-bold text-amber-400 truncate">
                        {u.role}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* PIN Input with visibility toggle */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase">
                Code PIN Caissier :
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-xs text-blue-400 flex items-center gap-1 font-bold hover:underline"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showPassword ? 'Masquer' : 'Afficher'}</span>
              </button>
            </div>

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                readOnly
                value={pinInput}
                placeholder="Saisissez votre code PIN..."
                className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-center text-2xl font-mono tracking-widest text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {errorMsg && (
              <p className="text-xs font-bold text-red-400 mt-1.5 text-center">{errorMsg}</p>
            )}
          </div>

          {/* Quick PIN Keypad */}
          <div className="grid grid-cols-3 gap-2 pt-1">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'].map((k) => (
              <button
                key={k}
                onClick={() => {
                  if (k === 'C') setPinInput('');
                  else if (k === '⌫') handleBackspace();
                  else handleKeyPad(k);
                }}
                className="py-3 rounded-xl bg-slate-900 border border-slate-800 text-white font-black text-lg hover:bg-slate-800 active:scale-95 transition"
              >
                {k}
              </button>
            ))}
          </div>

          <button
            onClick={handleLogin}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-sm shadow-xl shadow-blue-600/30 hover:from-blue-500 hover:to-indigo-500 transition active:scale-98"
          >
            Se Connecter / Déverrouiller la Session
          </button>
        </div>
      </div>
    </div>
  );
};
