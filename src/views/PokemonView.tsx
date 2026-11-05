/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { PokemonSheet, PokemonMove } from '../types';
import { TYPE_COLORS } from '../data/rulesData';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Plus, Heart, Zap, Shield, Search, Edit3, HeartHandshake } from 'lucide-react';

interface PokemonViewProps {
  pokemons: PokemonSheet[];
  onOpenPokemon: (sheet: PokemonSheet) => void;
  onNewPokemon: () => void;
  onExecuteMove: (move: PokemonMove) => void;
}

export const PokemonView: React.FC<PokemonViewProps> = ({
  pokemons,
  onOpenPokemon,
  onNewPokemon,
}) => {
  const { isGM, currentUser } = useAuth();
  const [search, setSearch] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'mine'>('all');

  const myPokemonsCount = pokemons.filter((p) => p.ownerId === currentUser?.id).length;

  const filtered = pokemons.filter((p) => {
    if (filterMode === 'mine' && p.ownerId !== currentUser?.id) return false;
    return (
      p.nickname.toLowerCase().includes(search.toLowerCase()) ||
      p.species.toLowerCase().includes(search.toLowerCase()) ||
      p.types.some((t) => t.toLowerCase().includes(search.toLowerCase()))
    );
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2 border-b border-zinc-800/60">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            Pokémon
          </h2>
          <p className="text-xs text-slate-400">
            Parceiros de equipe com movimentos, atributos e estágios de vínculo.
          </p>
        </div>

        <button
          onClick={onNewPokemon}
          className="px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 font-bold text-xs text-white shadow-sm flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Adicionar Pokémon
        </button>
      </div>

      {/* Filter and Search */}
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
            Todos ({pokemons.length})
          </button>
          <button
            onClick={() => setFilterMode('mine')}
            className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors flex-1 sm:flex-initial ${
              filterMode === 'mine'
                ? 'bg-purple-950/80 text-purple-200 border border-purple-800/60'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Meus Pokémon ({myPokemonsCount})
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por apelido, espécie, tipo..."
            className="w-full bg-[#13141f] border border-zinc-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((p) => {
          const isOwner = p.ownerId === currentUser?.id;

          return (
            <div
              key={p.id}
              className="rounded-xl bg-[#13141f] border border-zinc-800/80 hover:border-zinc-700 transition-all flex flex-col justify-between group"
            >
              <div className="p-4 space-y-3">
                {/* Header */}
                <div className="flex items-start gap-3">
                  <div className="w-14 h-14 rounded-lg bg-black/40 border border-zinc-800 flex items-center justify-center p-1 shrink-0 overflow-hidden">
                    <img
                      src={p.spriteUrl}
                      alt={p.species}
                      className="w-full h-full object-contain filter drop-shadow"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <h3 className="font-bold text-white text-sm truncate">{p.nickname}</h3>
                      <span className="text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded bg-zinc-800 text-purple-300 shrink-0">
                        Nv {p.level}
                      </span>
                    </div>

                    <div className="text-xs text-slate-400 truncate mt-0.5">{p.species}</div>

                    <div className="flex items-center gap-1 mt-1 flex-wrap">
                      {p.types.map((tp) => {
                        const style = TYPE_COLORS[tp] || { bg: 'bg-zinc-700', text: 'text-white' };
                        return (
                          <span
                            key={tp}
                            className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${style.bg} ${style.text}`}
                          >
                            {tp}
                          </span>
                        );
                      })}
                      <span className="text-[9px] text-slate-400 ml-1">
                        Vínculo {p.bondStage}/4
                      </span>
                    </div>
                  </div>
                </div>

                {/* Vitals */}
                <div className="grid grid-cols-3 gap-2 py-2 px-2.5 rounded-lg bg-black/30 border border-zinc-800/60 text-center">
                  <div>
                    <span className="text-[9px] font-bold text-rose-400 block">PV</span>
                    <span className="text-xs font-mono font-bold text-white">
                      {p.currentHp}/{p.maxHp}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-cyan-400 block">PE</span>
                    <span className="text-xs font-mono font-bold text-white">
                      {p.currentPe}/{p.maxPe}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-blue-400 block">DEFESA</span>
                    <span className="text-xs font-mono font-bold text-white">{p.defense}</span>
                  </div>
                </div>

                {/* Trait snippet */}
                <p className="text-xs text-slate-400 truncate">
                  <strong className="text-slate-300">{p.naturalTrait?.name || 'Traço'}:</strong>{' '}
                  {p.naturalTrait?.effect || 'Sem efeito especial registrado.'}
                </p>
              </div>

              {/* Bottom Actions */}
              <div className="p-3 border-t border-zinc-800/60 bg-[#0f1018] flex items-center justify-between">
                <span className="text-[10px] text-slate-400 truncate max-w-[150px]">
                  {isOwner ? '✓ Seu Pokémon' : 'Equipe da Mesa'}
                </span>

                <button
                  onClick={() => onOpenPokemon(p)}
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
            Nenhum Pokémon encontrado com os filtros selecionados.
          </div>
        )}
      </div>
    </div>
  );
};
