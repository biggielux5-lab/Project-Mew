/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { PokemonMove, LibraryMove, PokemonType } from '../types';
import { storageService } from '../services/storageService';
import { POKEMON_TYPES, TYPE_COLORS } from '../data/rulesData';
import { Search, Zap, Plus, X, Filter, Sparkles, BookOpen } from 'lucide-react';

interface MovePickerModalProps {
  isOpen: boolean;
  campaignId?: string;
  onClose: () => void;
  onSelectMove: (move: PokemonMove) => void;
  currentMoveIds?: string[];
}

export const MovePickerModal: React.FC<MovePickerModalProps> = ({
  isOpen,
  campaignId,
  onClose,
  onSelectMove,
  currentMoveIds = [],
}) => {
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<string>('Todos');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [selectedTier, setSelectedTier] = useState<string>('Todos');

  const moves = useMemo(() => {
    return storageService.getLibraryMoves(campaignId, true);
  }, [campaignId, isOpen]);

  const filteredMoves = useMemo(() => {
    return moves.filter((m) => {
      if (search) {
        const query = search.toLowerCase();
        const matchesName = m.name.toLowerCase().includes(query);
        const matchesEffect = m.effect.toLowerCase().includes(query);
        if (!matchesName && !matchesEffect) return false;
      }
      if (selectedType !== 'Todos' && m.type !== selectedType) return false;
      if (selectedCategory !== 'Todos' && m.category !== selectedCategory) return false;
      if (selectedTier !== 'Todos' && m.tier !== selectedTier) return false;
      return true;
    });
  }, [moves, search, selectedType, selectedCategory, selectedTier]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-3xl max-h-[88vh] bg-[#0f101c] border border-purple-900/50 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-4 bg-[#141525] border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-purple-400" />
            <div>
              <h3 className="text-base font-bold text-white">Biblioteca de Golpes</h3>
              <p className="text-xs text-slate-400">
                Selecione um golpe para adicionar ao repertório do Pokémon.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-slate-400 hover:text-white cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters */}
        <div className="p-3 bg-[#111220] border-b border-zinc-800/80 space-y-2.5">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome do golpe ou efeito..."
              className="w-full bg-[#18192a] border border-zinc-700/80 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap text-xs">
            {/* Tipo */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="bg-[#18192a] border border-zinc-700/80 rounded-lg px-2.5 py-1 text-slate-200"
            >
              <option value="Todos">Todos os Tipos</option>
              {POKEMON_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>

            {/* Categoria */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-[#18192a] border border-zinc-700/80 rounded-lg px-2.5 py-1 text-slate-200"
            >
              <option value="Todos">Todas as Categorias</option>
              <option value="Físico">Físico</option>
              <option value="Especial">Especial</option>
              <option value="Suporte">Suporte</option>
            </select>

            {/* Potência / Tier */}
            <select
              value={selectedTier}
              onChange={(e) => setSelectedTier(e.target.value)}
              className="bg-[#18192a] border border-zinc-700/80 rounded-lg px-2.5 py-1 text-slate-200"
            >
              <option value="Todos">Todas as Potências</option>
              <option value="Básico">Básico (1d4, 0 PE)</option>
              <option value="Comum">Comum (1d6, 1 PE)</option>
              <option value="Forte">Forte (1d8, 2 PE)</option>
              <option value="Assinatura">Assinatura (1d10, 3 PE)</option>
              <option value="Supremo">Supremo (1d12, 4 PE)</option>
            </select>
          </div>
        </div>

        {/* Moves List */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2">
          {filteredMoves.length > 0 ? (
            filteredMoves.map((m) => {
              const alreadyHas = currentMoveIds.includes(m.id);
              const typeStyle = TYPE_COLORS[m.type] || { bg: 'bg-zinc-700', text: 'text-white' };

              return (
                <div
                  key={m.id}
                  className="p-3 rounded-xl bg-[#141525] border border-zinc-800/80 hover:border-purple-800/60 flex items-center justify-between gap-3 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-xs font-black text-white">{m.name}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.2 rounded-full ${typeStyle.bg} ${typeStyle.text}`}>
                        {m.type}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-800 text-purple-300">
                        {m.category}
                      </span>
                      <span className="text-[10px] font-mono font-bold text-amber-400">
                        {m.tier} ({m.damageDice})
                      </span>
                      <span className="text-[10px] font-mono text-cyan-300">
                        {m.peCost > 0 ? `${m.peCost} PE` : '0 PE (Livre)'}
                      </span>
                      <span className="text-[10px] text-slate-400">Alcance: {m.range}</span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">{m.effect}</p>
                    {m.resistance && (
                      <div className="text-[10px] text-amber-300/90 mt-0.5">
                        Resistência: {m.resistance}
                      </div>
                    )}

                    {(m.vgPower !== undefined || m.vgAccuracy !== undefined || m.vgPp !== undefined) && (
                      <div className="flex items-center gap-2.5 mt-1.5 pt-1.5 border-t border-zinc-800/60 text-[10px] text-slate-400 flex-wrap">
                        <span className="text-purple-400/80 font-bold uppercase tracking-wider text-[9px]">Oficial VG:</span>
                        {m.vgPower !== undefined && m.vgPower !== null && (
                          <span>Poder: <strong className="text-slate-200">{m.vgPower}</strong></span>
                        )}
                        {m.vgAccuracy !== undefined && m.vgAccuracy !== null && (
                          <span>Precisão: <strong className="text-slate-200">{m.vgAccuracy}%</strong></span>
                        )}
                        {m.vgPp !== undefined && m.vgPp !== null && (
                          <span>PP: <strong className="text-slate-200">{m.vgPp}</strong></span>
                        )}
                        {m.generation && (
                          <span className="text-zinc-500">Gen {m.generation}</span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="shrink-0">
                    {alreadyHas ? (
                      <span className="text-[11px] font-mono text-slate-500 px-2 py-1 bg-zinc-900 rounded">
                        Já Aprendido
                      </span>
                    ) : (
                      <button
                        onClick={() => {
                          onSelectMove(m);
                          onClose();
                        }}
                        className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" /> Adicionar
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-xs text-slate-400">
              Nenhum golpe encontrado para os filtros selecionados.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#111220] border-t border-zinc-800 flex items-center justify-between text-xs text-slate-400">
          <span>{filteredMoves.length} golpes disponíveis</span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-slate-300 cursor-pointer"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
