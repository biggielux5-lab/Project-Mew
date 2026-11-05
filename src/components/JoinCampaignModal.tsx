/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { storageService } from '../services/storageService';
import { Campaign } from '../types';
import { KeyRound, X, Check } from 'lucide-react';

interface JoinCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJoined: (camp: Campaign) => void;
}

export const JoinCampaignModal: React.FC<JoinCampaignModalProps> = ({ isOpen, onClose, onJoined }) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const camp = storageService.joinCampaignByCode(code);
      onJoined(camp);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Código inválido.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-[#12131d] border border-purple-900/40 rounded-2xl shadow-2xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-purple-900/20 pb-4">
          <div className="flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-purple-400" />
            <h3 className="font-extrabold text-white text-base">Entrar em Campanha por Código</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleJoin} className="space-y-4">
          <p className="text-xs text-slate-400 leading-relaxed">
            Solicite o código de convite ao Mestre da sua mesa (ex: <code className="text-purple-300 font-mono">MEW-KANTO</code>) para vincular seu perfil à campanha.
          </p>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Código de Convite</label>
            <input
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="MEW-XXXX"
              className="w-full bg-[#181928] border border-purple-900/40 rounded-lg px-3 py-2.5 text-center font-mono font-bold tracking-widest text-lg text-white uppercase focus:outline-none focus:border-purple-500"
            />
          </div>

          {error && <div className="text-xs text-rose-400 font-medium bg-rose-950/30 p-2.5 rounded-lg border border-rose-900/40">{error}</div>}

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-slate-300 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white transition-all shadow-md"
            >
              Ingressar na Mesa
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
