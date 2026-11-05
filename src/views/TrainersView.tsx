/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { TrainerSheet } from '../types';
import { useAuth } from '../context/AuthContext';
import { UserCheck, Plus, Heart, Shield, Search, Edit3, Dices } from 'lucide-react';

interface TrainersViewProps {
  trainers: TrainerSheet[];
  onOpenTrainer: (sheet: TrainerSheet) => void;
  onNewTrainer: () => void;
  onQuickRoll: (attrName: string, attrDice: any, skillName: string, skillDice: any) => void;
}

export const TrainersView: React.FC<TrainersViewProps> = ({
  trainers,
  onOpenTrainer,
  onNewTrainer,
  onQuickRoll,
}) => {
  const { isGM, currentUser } = useAuth();
  const [search, setSearch] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'mine'>('all');

  const myTrainersCount = trainers.filter((t) => t.ownerId === currentUser?.id).length;

  const filtered = trainers.filter((t) => {
    if (filterMode === 'mine' && t.ownerId !== currentUser?.id) return false;
    return (
      (t.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (t.className || '').toLowerCase().includes(search.toLowerCase()) ||
      (t.origin || '').toLowerCase().includes(search.toLowerCase()) ||
      (t.ownerName || '').toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2 border-b border-zinc-800/60">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-purple-400" />
            Treinadores
          </h2>
          <p className="text-xs text-slate-400">
            Fichas de personagens com atributos, 24 perícias e progressão de Além da Próxima Rota.
          </p>
        </div>

        <button
          onClick={onNewTrainer}
          className="px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 font-bold text-xs text-white shadow-sm flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Novo Treinador
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1 p-0.5 rounded-lg bg-zinc-900 border border-zinc-800 w-full sm:w-auto">
          <button
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors flex-1 sm:flex-initial ${
              filterMode === 'all'
                ? 'bg-purple-950/80 text-purple-200 border border-purple-800/60'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Todos ({trainers.length})
          </button>
          <button
            onClick={() => setFilterMode('mine')}
            className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors flex-1 sm:flex-initial ${
              filterMode === 'mine'
                ? 'bg-purple-950/80 text-purple-200 border border-purple-800/60'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Meus Personagens ({myTrainersCount})
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome, classe, origem..."
            className="w-full bg-[#13141f] border border-zinc-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((t) => {
          const isOwner = t.ownerId === currentUser?.id;
          return (
            <div
              key={t.id}
              className="rounded-xl bg-[#13141f] border border-zinc-800/80 hover:border-zinc-700 transition-all flex flex-col justify-between group"
            >
              <div className="p-4 space-y-3">
                {/* Header */}
                <div className="flex items-start gap-3">
                  <img
                    src={t.avatarUrl}
                    alt={t.name}
                    className="w-12 h-12 rounded-lg object-cover border border-purple-500/30 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <h3 className="font-bold text-white text-sm truncate">{t.name}</h3>
                      <span className="text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded bg-zinc-800 text-purple-300 shrink-0">
                        Nv {t.level}
                      </span>
                    </div>

                    <div className="text-xs text-slate-400 truncate mt-0.5">
                      {t.className || 'Sem classe'} {t.trackName ? `• ${t.trackName}` : ''}
                    </div>

                    <div className="text-[11px] text-purple-300/80 mt-0.5">
                      Origem: {t.origin}
                    </div>
                  </div>
                </div>

                {/* Vitals */}
                <div className="grid grid-cols-3 gap-2 py-2 px-2.5 rounded-lg bg-black/30 border border-zinc-800/60 text-center">
                  <div>
                    <span className="text-[9px] font-bold text-rose-400 block">PV</span>
                    <span className="text-xs font-mono font-bold text-white">
                      {t.currentHp}/{t.maxHp}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-blue-400 block">DEFESA</span>
                    <span className="text-xs font-mono font-bold text-white">{t.defense}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-purple-400 block">INICIATIVA</span>
                    <span className="text-xs font-mono font-bold text-white">
                      {t.corpo}+{t.skills['Reflexos'] || 'd4'}
                    </span>
                  </div>
                </div>

                {/* Attributes */}
                <div className="flex items-center justify-between text-[11px] px-2 py-1 bg-zinc-900/40 rounded text-slate-300 font-mono">
                  <span>Corpo: <strong className="text-purple-300">{t.corpo}</strong></span>
                  <span>Mente: <strong className="text-indigo-300">{t.mente}</strong></span>
                  <span>Presença: <strong className="text-pink-300">{t.presenca}</strong></span>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="p-3 border-t border-zinc-800/60 bg-[#0f1018] flex items-center justify-between">
                <span className="text-[10px] text-slate-400 truncate max-w-[150px]">
                  {isOwner ? '✓ Seu Personagem' : `Jogador: ${t.ownerName}`}
                </span>

                <button
                  onClick={() => onOpenTrainer(t)}
                  className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-slate-200 text-xs font-semibold transition-colors flex items-center gap-1 border border-zinc-700/60"
                >
                  <Edit3 className="w-3 h-3 text-purple-400" />
                  Abrir Ficha
                </button>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="col-span-full py-12 text-center text-xs text-slate-500">
            Nenhum treinador encontrado com os filtros selecionados.
          </div>
        )}
      </div>
    </div>
  );
};
