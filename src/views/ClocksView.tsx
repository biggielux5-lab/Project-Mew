/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { WorldClock } from '../types';
import { WorldClockWidget } from '../components/WorldClockWidget';
import { storageService } from '../services/storageService';
import { Clock, Plus, Lock, ShieldAlert, Sparkles, X } from 'lucide-react';
import { ConfirmDeleteModal } from '../components/ConfirmDeleteModal';

interface ClocksViewProps {
  onAdvanceClock: (clock: WorldClock, delta: number) => void;
  onRefreshCampaigns: () => void;
}

export const ClocksView: React.FC<ClocksViewProps> = ({ onAdvanceClock, onRefreshCampaigns }) => {
  const { activeCampaign, isGM } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [clockToDelete, setClockToDelete] = useState<WorldClock | null>(null);

  // New Clock Form
  const [name, setName] = useState('');
  const [segments, setSegments] = useState<4 | 6>(6);
  const [objective, setObjective] = useState('');
  const [consequence, setConsequence] = useState('');
  const [isSecret, setIsSecret] = useState(false);

  if (!activeCampaign) return null;

  const clocks = activeCampaign.clocks.filter((c) => !c.isSecret || isGM);

  const handleCreateClock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    storageService.addClock(activeCampaign.id, {
      name,
      totalSegments: segments,
      filledSegments: 0,
      objective,
      consequence,
      isSecret,
    });

    onRefreshCampaigns();
    setModalOpen(false);
    setName('');
    setObjective('');
    setConsequence('');
    setIsSecret(false);
  };

  const handleDeleteClock = (clockId: string) => {
    const found = clocks.find((c) => c.id === clockId);
    if (found) {
      setClockToDelete(found);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-150">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2 border-b border-zinc-800/60">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Clock className="w-5 h-5 text-purple-400" />
            Relógios do Mundo
          </h2>
          <p className="text-xs text-slate-400">
            Acompanhe o avanço de facções, perigos do cenário e eventos iminentes (Seção 54).
          </p>
        </div>

        {isGM && (
          <button
            onClick={() => setModalOpen(true)}
            className="px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 font-bold text-xs text-white shadow-sm flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Novo Relógio
          </button>
        )}
      </div>

      {/* Clocks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {clocks.map((clock) => (
          <WorldClockWidget
            key={clock.id}
            clock={clock}
            isGM={isGM}
            onAdvance={onAdvanceClock}
            onDelete={isGM ? handleDeleteClock : undefined}
          />
        ))}

        {clocks.length === 0 && (
          <div className="col-span-full p-12 text-center rounded-2xl cris-panel space-y-3">
            <Clock className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="font-bold text-slate-300 text-sm">Nenhum relógio ativo na campanha</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              O Mestre pode criar relógios de 4 ou 6 segmentos para representar movimentos da Equipe Rocket, mudanças climáticas ou rituais ancestrais.
            </p>
            {isGM && (
              <button
                onClick={() => setModalOpen(true)}
                className="mt-2 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white inline-flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Criar Primeiro Relógio
              </button>
            )}
          </div>
        )}
      </div>

      {/* New Clock Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-[#12131d] border border-purple-900/40 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-purple-900/20 pb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-purple-400" />
                <h3 className="font-extrabold text-white text-base">Novo Relógio de Acontecimento</h3>
              </div>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateClock} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Nome do Relógio *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: A empresa fecha o vale, A matilha muda de território..."
                  className="w-full bg-[#181928] border border-purple-900/30 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Número de Segmentos</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSegments(4)}
                    className={`py-2 rounded-lg border font-mono font-bold text-xs ${
                      segments === 4
                        ? 'bg-purple-600 text-white border-purple-400'
                        : 'bg-zinc-800 text-slate-400 border-zinc-700'
                    }`}
                  >
                    4 Segmentos (Ameaça Rápida)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSegments(6)}
                    className={`py-2 rounded-lg border font-mono font-bold text-xs ${
                      segments === 6
                        ? 'bg-purple-600 text-white border-purple-400'
                        : 'bg-zinc-800 text-slate-400 border-zinc-700'
                    }`}
                  >
                    6 Segmentos (Conflito Maior)
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Objetivo da Força (O que ela quer?)
                </label>
                <input
                  type="text"
                  value={objective}
                  onChange={(e) => setObjective(e.target.value)}
                  placeholder="Ex: Tomar o laboratório e capturar o espécime raro"
                  className="w-full bg-[#181928] border border-purple-900/30 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Virada Dramática (O que acontece quando completa?)
                </label>
                <textarea
                  rows={2}
                  value={consequence}
                  onChange={(e) => setConsequence(e.target.value)}
                  placeholder="Ex: O perímetro de segurança colapsa e Pokémon selvagens invadem o centro urbano..."
                  className="w-full bg-[#181928] border border-purple-900/30 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer text-xs text-amber-300 pt-1">
                <input
                  type="checkbox"
                  checked={isSecret}
                  onChange={(e) => setIsSecret(e.target.checked)}
                  className="rounded bg-zinc-800 text-purple-600"
                />
                <span className="flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5" />
                  Relógio Secreto (Visível apenas para o Mestre)
                </span>
              </label>

              <div className="pt-3 border-t border-purple-900/20 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-slate-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white shadow-md"
                >
                  Criar Relógio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {clockToDelete && (
        <ConfirmDeleteModal
          isOpen={true}
          entityType="Relógio do Mundo"
          entityName={clockToDelete.name}
          details={`Este relógio (${clockToDelete.filledSegments}/${clockToDelete.totalSegments} segmentos preenchidos) e suas consequências serão removidos da campanha.`}
          onClose={() => setClockToDelete(null)}
          onConfirm={() => {
            storageService.deleteClock(activeCampaign.id, clockToDelete.id);
            onRefreshCampaigns();
            setClockToDelete(null);
          }}
        />
      )}
    </div>
  );
};
