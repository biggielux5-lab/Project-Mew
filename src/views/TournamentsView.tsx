/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { storageService } from '../services/storageService';
import { Tournament, TournamentMatch } from '../types';
import {
  Trophy,
  Plus,
  Swords,
  Award,
  Users,
  MapPin,
  Trash2,
  Edit2,
} from 'lucide-react';

export const TournamentsView: React.FC = () => {
  const { activeCampaign, isGM } = useAuth();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);

  // Modals
  const [isTournamentModalOpen, setIsTournamentModalOpen] = useState(false);
  const [tourneyForm, setTourneyForm] = useState<Partial<Tournament>>({
    name: '',
    location: 'Cerulean City',
    rulesFormat: '3v3 Oficial, sem itens da bolsa',
    status: 'Em andamento',
    awardsSummary: '¥ 15.000 + Troféu Comemorativo',
    participants: ['Douglas Ventura', 'Rival Blue', 'Ace Trainer Leo', 'Lass Brenda'],
    matches: [],
  });

  const [isMatchModalOpen, setIsMatchModalOpen] = useState(false);
  const [matchForm, setMatchForm] = useState<Partial<TournamentMatch>>({
    roundNumber: 1,
    trainer1Name: '',
    trainer2Name: '',
    winnerName: '',
    scoreOrDetails: '0 x 0',
    completed: false,
  });

  const reloadData = () => {
    if (!activeCampaign) return;
    const list = storageService.getTournaments(activeCampaign.id);
    setTournaments(list);
    if (selectedTournament) {
      const updated = list.find((t) => t.id === selectedTournament.id) || list[0] || null;
      setSelectedTournament(updated);
    } else if (list.length > 0) {
      setSelectedTournament(list[0]);
    }
  };

  useEffect(() => {
    reloadData();
  }, [activeCampaign]);

  const handleSaveTournament = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCampaign || !tourneyForm.name?.trim()) return;

    const tourney: Tournament = {
      id: tourneyForm.id || `tourney_${Date.now().toString(36)}`,
      campaignId: activeCampaign.id,
      name: tourneyForm.name.trim(),
      location: tourneyForm.location || 'Cidade de Cerulean',
      rulesFormat: tourneyForm.rulesFormat || '3v3 Oficial',
      status: (tourneyForm.status as any) || 'Em andamento',
      awardsSummary: tourneyForm.awardsSummary || '',
      participants: tourneyForm.participants?.filter(Boolean) || [],
      matches: tourneyForm.matches || [],
      gmNotes: tourneyForm.gmNotes,
    };

    storageService.saveTournament(tourney);
    setIsTournamentModalOpen(false);
    reloadData();
    setSelectedTournament(tourney);
  };

  const handleDeleteTournament = (id: string) => {
    if (!confirm('Deseja realmente remover este torneio?')) return;
    const filtered = tournaments.filter((t) => t.id !== id);
    localStorage.setItem(`pm_tournaments_${activeCampaign?.id}`, JSON.stringify(filtered));
    reloadData();
    if (selectedTournament?.id === id) {
      setSelectedTournament(filtered[0] || null);
    }
  };

  const handleSaveMatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTournament || !matchForm.trainer1Name || !matchForm.trainer2Name) return;

    const match: TournamentMatch = {
      id: matchForm.id || `m_${Date.now().toString(36)}`,
      roundNumber: matchForm.roundNumber ?? 1,
      trainer1Name: matchForm.trainer1Name,
      trainer2Name: matchForm.trainer2Name,
      winnerName: matchForm.winnerName,
      scoreOrDetails: matchForm.scoreOrDetails || '0 x 0',
      completed: matchForm.completed ?? false,
    };

    const updatedMatches = matchForm.id
      ? selectedTournament.matches.map((m) => (m.id === matchForm.id ? match : m))
      : [...selectedTournament.matches, match];

    const updatedTourney = { ...selectedTournament, matches: updatedMatches };
    storageService.saveTournament(updatedTourney);
    setIsMatchModalOpen(false);
    reloadData();
    setSelectedTournament(updatedTourney);
  };

  const handleSetMatchWinner = (match: TournamentMatch, winnerName: string) => {
    if (!selectedTournament || !isGM) return;
    const updatedMatches = selectedTournament.matches.map((m) => {
      if (m.id === match.id) {
        return {
          ...m,
          winnerName,
          completed: true,
          scoreOrDetails: winnerName === m.trainer1Name ? '1 x 0' : '0 x 1',
        };
      }
      return m;
    });

    const updatedTourney = { ...selectedTournament, matches: updatedMatches };
    storageService.saveTournament(updatedTourney);
    reloadData();
    setSelectedTournament(updatedTourney);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-950/70 border border-amber-800/50 text-amber-300">
              <Trophy className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-100 tracking-tight">
              Torneios & Copas da Liga
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Chaveamento de confrontos, regras oficiais da Liga, pontuação e consagração de campeões.
          </p>
        </div>

        {isGM && (
          <button
            onClick={() => {
              setTourneyForm({
                name: '',
                location: 'Cerulean City',
                rulesFormat: '3v3 Oficial, sem itens da bolsa',
                status: 'Em andamento',
                awardsSummary: '¥ 15.000 + Troféu Comemorativo',
                participants: ['Douglas Ventura', 'Rival Blue', 'Ace Trainer Leo', 'Lass Brenda'],
                matches: [],
              });
              setIsTournamentModalOpen(true);
            }}
            className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Criar Torneio</span>
          </button>
        )}
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Tournament List */}
        <div className="lg:col-span-4 space-y-3">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Torneios Registrados ({tournaments.length})
          </span>

          {tournaments.map((t) => {
            const isSelected = selectedTournament?.id === t.id;
            return (
              <div
                key={t.id}
                onClick={() => setSelectedTournament(t)}
                className={`p-4 rounded-xl border transition-all cursor-pointer relative group ${
                  isSelected
                    ? 'bg-purple-950/40 border-purple-600/70 shadow-sm'
                    : 'bg-[#11121d] border-zinc-800/80 hover:border-zinc-700 hover:bg-[#141522]'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                        t.status === 'Finalizado'
                          ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60'
                          : 'bg-amber-950/80 text-amber-300 border-amber-800/60'
                      }`}
                    >
                      {t.status}
                    </span>
                    <h3 className="text-sm font-bold text-slate-100 group-hover:text-purple-300 transition-colors">
                      {t.name}
                    </h3>
                  </div>

                  {isGM && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteTournament(t.id);
                        }}
                        className="p-1 text-slate-400 hover:text-rose-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-purple-400" />
                    {t.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3 text-sky-400" />
                    {t.participants.length} duelistas
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Tournament Detail & Bracket */}
        <div className="lg:col-span-8">
          {selectedTournament ? (
            <div className="bg-[#11121d] p-6 rounded-xl border border-zinc-800/80 space-y-6">
              <div className="space-y-3 border-b border-zinc-800/80 pb-4">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800/50">
                      Status: {selectedTournament.status}
                    </span>
                    <h2 className="text-lg font-bold text-slate-100 mt-1">
                      {selectedTournament.name}
                    </h2>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-[#161726] border border-zinc-800">
                    <span className="text-[10px] text-slate-400 font-mono block">Regras de Formato</span>
                    <span className="text-slate-200 font-semibold">{selectedTournament.rulesFormat}</span>
                  </div>
                  <div className="p-3 rounded-lg bg-[#161726] border border-zinc-800">
                    <span className="text-[10px] text-slate-400 font-mono block">Premiação Oficial</span>
                    <span className="text-amber-300 font-bold">{selectedTournament.awardsSummary}</span>
                  </div>
                  <div className="p-3 rounded-lg bg-[#161726] border border-zinc-800">
                    <span className="text-[10px] text-slate-400 font-mono block">Local & Arena</span>
                    <span className="text-slate-200 font-semibold">{selectedTournament.location}</span>
                  </div>
                </div>
              </div>

              {/* Bracket & Matches */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Swords className="w-4 h-4 text-purple-400" />
                    Chaveamento de Partidas ({selectedTournament.matches.length})
                  </h3>

                  {isGM && (
                    <button
                      onClick={() => {
                        setMatchForm({
                          roundNumber: 1,
                          trainer1Name: selectedTournament.participants[0] || 'Treinador A',
                          trainer2Name: selectedTournament.participants[1] || 'Treinador B',
                          winnerName: '',
                          scoreOrDetails: '0 x 0',
                          completed: false,
                        });
                        setIsMatchModalOpen(true);
                      }}
                      className="px-2.5 py-1 bg-purple-600/90 hover:bg-purple-600 text-white font-semibold text-xs rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Adicionar Luta</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedTournament.matches.map((m) => (
                    <div
                      key={m.id}
                      className="p-4 rounded-xl bg-[#141522] border border-zinc-800 space-y-3"
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-purple-400 uppercase tracking-wider">
                          Rodada #{m.roundNumber}
                        </span>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${
                            m.completed
                              ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                              : 'bg-amber-950 text-amber-300 border-amber-800'
                          }`}
                        >
                          {m.completed ? 'Concluída' : 'Pendente'}
                        </span>
                      </div>

                      {/* Duelists comparison */}
                      <div className="space-y-2">
                        <div
                          className={`p-2.5 rounded-lg border text-xs flex items-center justify-between transition-all ${
                            m.winnerName === m.trainer1Name
                              ? 'bg-emerald-950/40 border-emerald-700/80 text-emerald-200 font-bold'
                              : 'bg-zinc-900 border-zinc-800 text-slate-300'
                          }`}
                        >
                          <span>{m.trainer1Name}</span>
                          <span className="font-mono">{m.winnerName === m.trainer1Name ? '✓' : ''}</span>
                        </div>

                        <div
                          className={`p-2.5 rounded-lg border text-xs flex items-center justify-between transition-all ${
                            m.winnerName === m.trainer2Name
                              ? 'bg-emerald-950/40 border-emerald-700/80 text-emerald-200 font-bold'
                              : 'bg-zinc-900 border-zinc-800 text-slate-300'
                          }`}
                        >
                          <span>{m.trainer2Name}</span>
                          <span className="font-mono">{m.winnerName === m.trainer2Name ? '✓' : ''}</span>
                        </div>
                      </div>

                      {/* GM quick outcome trigger */}
                      {isGM && !m.completed && (
                        <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[11px]">
                          <span className="text-slate-400">Declarar Vencedor:</span>
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => handleSetMatchWinner(m, m.trainer1Name)}
                              className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-emerald-900/60 text-slate-300 hover:text-emerald-200 font-semibold"
                            >
                              {m.trainer1Name}
                            </button>
                            <button
                              onClick={() => handleSetMatchWinner(m, m.trainer2Name)}
                              className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-emerald-900/60 text-slate-300 hover:text-emerald-200 font-semibold"
                            >
                              {m.trainer2Name}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center rounded-xl bg-[#11121d] border border-zinc-800/80 text-slate-400 text-xs">
              Selecione um torneio para visualizar a chave de confrontos e resultados.
            </div>
          )}
        </div>
      </div>

      {/* Modal Tournament */}
      {isTournamentModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#12131f] border border-zinc-800 rounded-xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-slate-100">Criar Novo Torneio</h3>
            <form onSubmit={handleSaveTournament} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Nome do Torneio</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Taça dos Campeões de Cerulean"
                  value={tourneyForm.name || ''}
                  onChange={(e) => setTourneyForm({ ...tourneyForm, name: e.target.value })}
                  className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Local / Arena</label>
                  <input
                    type="text"
                    required
                    value={tourneyForm.location || ''}
                    onChange={(e) => setTourneyForm({ ...tourneyForm, location: e.target.value })}
                    className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Premiação</label>
                  <input
                    type="text"
                    placeholder="Ex: ¥ 20.000 + MT Especial"
                    value={tourneyForm.awardsSummary || ''}
                    onChange={(e) => setTourneyForm({ ...tourneyForm, awardsSummary: e.target.value })}
                    className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Regras de Combate</label>
                <input
                  type="text"
                  placeholder="Ex: 3v3 Oficial, sem itens da bolsa"
                  value={tourneyForm.rulesFormat || ''}
                  onChange={(e) => setTourneyForm({ ...tourneyForm, rulesFormat: e.target.value })}
                  className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsTournamentModalOpen(false)}
                  className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-slate-300 rounded-lg text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-lg text-xs"
                >
                  Salvar Torneio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Match */}
      {isMatchModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#12131f] border border-zinc-800 rounded-xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-slate-100">Adicionar Confronto</h3>
            <form onSubmit={handleSaveMatch} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Lutador A</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Douglas Ventura"
                    value={matchForm.trainer1Name || ''}
                    onChange={(e) => setMatchForm({ ...matchForm, trainer1Name: e.target.value })}
                    className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Lutador B</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Rival Blue"
                    value={matchForm.trainer2Name || ''}
                    onChange={(e) => setMatchForm({ ...matchForm, trainer2Name: e.target.value })}
                    className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsMatchModalOpen(false)}
                  className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-slate-300 rounded-lg text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-lg text-xs"
                >
                  Salvar Confronto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
