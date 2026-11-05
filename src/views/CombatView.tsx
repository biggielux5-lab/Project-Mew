/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  CombatSession,
  Combatant,
  PokemonSheet,
  TrainerSheet,
  PokemonMove,
  CombatLogEntry,
} from '../types';
import { storageService, calculatePokemonDefense, calculateTrainerDefense } from '../services/storageService';
import { useAuth } from '../context/AuthContext';
import { CONDITIONS, TYPE_COLORS, DiceRank } from '../data/rulesData';
import {
  Swords,
  Shield,
  Zap,
  Heart,
  Play,
  RotateCcw,
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  Sparkles,
  Target,
  Dices,
  AlertCircle,
  ArrowRight,
  UserCheck,
  ChevronRight,
  X,
  Volume2,
  RefreshCw,
  Award,
} from 'lucide-react';

interface CombatViewProps {
  onOpenDiceRoller?: (params?: any) => void;
  onOpenPokemonSheet?: (sheet: PokemonSheet) => void;
  onOpenTrainerSheet?: (sheet: TrainerSheet) => void;
}

export const CombatView: React.FC<CombatViewProps> = ({
  onOpenDiceRoller,
  onOpenPokemonSheet,
  onOpenTrainerSheet,
}) => {
  const { activeCampaign, isGM, currentUser } = useAuth();

  const [sessions, setSessions] = useState<CombatSession[]>(() =>
    storageService.getCombatSessions(activeCampaign?.id)
  );

  const [activeSessionId, setActiveSessionId] = useState<string>(() => {
    const list = storageService.getCombatSessions(activeCampaign?.id);
    return list[0]?.id || '';
  });

  // Reload sessions on campaign change
  useEffect(() => {
    const list = storageService.getCombatSessions(activeCampaign?.id);
    setSessions(list);
    if (!list.some((s) => s.id === activeSessionId)) {
      setActiveSessionId(list[0]?.id || '');
    }
  }, [activeCampaign]);

  const activeSession = sessions.find((s) => s.id === activeSessionId) || null;

  // New Combat Modal
  const [isNewCombatOpen, setIsNewCombatOpen] = useState(false);

  // Attack Execution Modal
  const [attackModal, setAttackModal] = useState<{
    open: boolean;
    attacker: Combatant | null;
    target: Combatant | null;
  }>({
    open: false,
    attacker: null,
    target: null,
  });

  // Capture Modal
  const [captureModal, setCaptureModal] = useState<{
    open: boolean;
    target: Combatant | null;
    trainer: Combatant | null;
  }>({
    open: false,
    target: null,
    trainer: null,
  });

  // Quick stat adjust
  const handleUpdateCombatant = (combatantId: string, updates: Partial<Combatant>) => {
    if (!activeSession) return;
    const updatedSession = storageService.updateCombatantStats(activeSession.id, combatantId, updates);
    if (updatedSession) {
      setSessions(storageService.getCombatSessions(activeCampaign?.id));
    }
  };

  const handleNextTurn = () => {
    if (!activeSession || activeSession.combatants.length === 0) return;

    let nextTurn = activeSession.currentTurnIndex + 1;
    let nextRound = activeSession.round;

    if (nextTurn >= activeSession.combatants.length) {
      nextTurn = 0;
      nextRound += 1;

      // Reset action trackers for new round
      activeSession.combatants = activeSession.combatants.map((c) => ({
        ...c,
        mainActionUsed: false,
        movementUsed: false,
        reactionUsed: false,
        defensiveReactionUsedThisRound: false,
      }));

      storageService.addCombatLog(activeSession.id, {
        round: nextRound,
        type: 'round_change',
        message: `--- Início da Rodada ${nextRound} --- Ações renovadas para todos os combatentes.`,
      });
    }

    const currentCombatant = activeSession.combatants[nextTurn];
    storageService.addCombatLog(activeSession.id, {
      round: nextRound,
      type: 'turn_change',
      message: `Turno de ${currentCombatant?.name || 'Combatente'} (Iniciativa ${currentCombatant?.initiative || 0}).`,
    });

    const updated: CombatSession = {
      ...activeSession,
      round: nextRound,
      currentTurnIndex: nextTurn,
    };

    storageService.updateCombatSession(updated);
    setSessions(storageService.getCombatSessions(activeCampaign?.id));
  };

  const handleRollAllInitiative = () => {
    if (!activeSession) return;

    const updatedCombatants = activeSession.combatants.map((c) => {
      // Roll 1d10 + Agility / Instinct rank bonus
      const baseRoll = Math.floor(Math.random() * 10) + 1;
      const bonus = c.type === 'pokemon' ? 2 : 1;
      const total = baseRoll + bonus;
      return {
        ...c,
        initiative: total,
        hasRolledInitiative: true,
      };
    });

    // Sort descending by initiative
    updatedCombatants.sort((a, b) => b.initiative - a.initiative);

    const updatedSession: CombatSession = {
      ...activeSession,
      combatants: updatedCombatants,
      currentTurnIndex: 0,
    };

    storageService.updateCombatSession(updatedSession);
    storageService.addCombatLog(activeSession.id, {
      round: activeSession.round,
      type: 'general',
      message: 'Iniciativas roladas e ordenadas para toda a cena de combate!',
    });

    setSessions(storageService.getCombatSessions(activeCampaign?.id));
  };

  const handleToggleCondition = (combatant: Combatant, cond: string) => {
    const exists = combatant.conditions.includes(cond);
    const updated = exists
      ? combatant.conditions.filter((c) => c !== cond)
      : [...combatant.conditions, cond];

    handleUpdateCombatant(combatant.id, { conditions: updated });

    if (activeSession) {
      storageService.addCombatLog(activeSession.id, {
        round: activeSession.round,
        type: 'general',
        message: `${combatant.name} ${exists ? 'recuperou-se da condição' : 'recebeu a condição'} "${cond}".`,
      });
    }
  };

  const handleDeleteSession = (id: string) => {
    if (confirm('Deseja encerrar e excluir este encontro de combate?')) {
      storageService.deleteCombatSession(id);
      const list = storageService.getCombatSessions(activeCampaign?.id);
      setSessions(list);
      setActiveSessionId(list[0]?.id || '');
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Top Banner / Session Switcher */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-5 rounded-2xl bg-[#141522] border border-purple-900/30">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-purple-950/60 border border-purple-800/40 text-purple-400">
            <Swords className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-purple-400">
                Sistema de Combate Tático • Além da Próxima Rota
              </span>
              {activeSession && (
                <span className="text-xs px-2 py-0.5 rounded-full font-mono font-bold bg-purple-900/40 text-purple-300 border border-purple-700/40">
                  Rodada {activeSession.round}
                </span>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white">
              {activeSession ? activeSession.name : 'Nenhum Combate Ativo'}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {sessions.length > 1 && (
            <select
              value={activeSessionId}
              onChange={(e) => setActiveSessionId(e.target.value)}
              className="py-2 px-3 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
            >
              {sessions.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} (R{s.round})
                </option>
              ))}
            </select>
          )}

          <button
            onClick={() => setIsNewCombatOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-purple-950/50 cursor-pointer active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Combate</span>
          </button>

          {activeSession && (
            <button
              onClick={() => handleDeleteSession(activeSession.id)}
              className="p-2 rounded-xl bg-zinc-900 hover:bg-red-950/50 hover:text-red-300 text-slate-400 border border-zinc-800 transition-all"
              title="Encerrar / Excluir Combate"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {!activeSession ? (
        <div className="p-12 text-center rounded-2xl bg-[#12131d] border border-zinc-800/80">
          <Swords className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-200">Nenhum encontro de combate configurado</h3>
          <p className="text-sm text-slate-400 mt-1 max-w-sm mx-auto">
            Inicie um novo combate para selecionar treinadores, seus parceiros Pokémon ativos e adversários selvagens ou rivais.
          </p>
          <button
            onClick={() => setIsNewCombatOpen(true)}
            className="mt-4 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs inline-flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Iniciar Combate Agora</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Combatants Column (2 Cols) */}
          <div className="lg:col-span-2 space-y-4">
            {/* Round Controls */}
            <div className="p-4 rounded-xl bg-[#141522] border border-zinc-800/80 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-slate-400">Rodada:</span>
                  <span className="text-lg font-mono font-extrabold text-purple-400">
                    {activeSession.round}
                  </span>
                </div>
                <div className="h-4 w-px bg-zinc-800" />
                <div className="text-xs text-slate-400">
                  Combatente Atual:{' '}
                  <strong className="text-white">
                    {activeSession.combatants[activeSession.currentTurnIndex]?.name || 'Nenhum'}
                  </strong>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleRollAllInitiative}
                  className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/60 text-xs font-semibold text-slate-300 flex items-center gap-1.5 cursor-pointer"
                  title="Rolar iniciativa com base no Instinto/Agilidade e ordenar ordem de turnos"
                >
                  <Dices className="w-3.5 h-3.5 text-purple-400" />
                  <span>Rolar Iniciativas</span>
                </button>

                <button
                  onClick={handleNextTurn}
                  className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-md shadow-purple-950/40 cursor-pointer active:scale-95"
                >
                  <span>Avançar Turno</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Combatant Cards List */}
            <div className="space-y-3">
              {activeSession.combatants.map((cbt, idx) => {
                const isCurrentTurn = idx === activeSession.currentTurnIndex;
                const effectiveDef = cbt.defensiveReactionUsedThisRound
                  ? cbt.defense + 2
                  : cbt.defense;

                return (
                  <div
                    key={cbt.id}
                    className={`rounded-xl border transition-all p-4 ${
                      isCurrentTurn
                        ? 'bg-[#18192a] border-purple-500/80 ring-1 ring-purple-500/40 shadow-lg shadow-purple-950/30'
                        : cbt.isEnemy
                        ? 'bg-[#141522] border-red-950/40 hover:border-red-800/40'
                        : 'bg-[#141522] border-zinc-800/80 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      {/* Left: Avatar, Name & Turn Marker */}
                      <div className="flex items-center gap-3">
                        {/* Initiative badge */}
                        <div
                          className={`w-9 h-9 rounded-lg flex flex-col items-center justify-center font-mono font-bold shrink-0 ${
                            isCurrentTurn
                              ? 'bg-purple-600 text-white'
                              : 'bg-zinc-900 border border-zinc-800 text-slate-400'
                          }`}
                          title="Valor de Iniciativa"
                        >
                          <span className="text-[9px] uppercase leading-none opacity-80">INI</span>
                          <span className="text-xs leading-none">{cbt.initiative}</span>
                        </div>

                        {/* Avatar */}
                        <div className="relative w-11 h-11 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center p-1 shrink-0 overflow-hidden">
                          {cbt.avatarUrl ? (
                            <img
                              src={cbt.avatarUrl}
                              alt={cbt.name}
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <Swords className="w-5 h-5 text-slate-500" />
                          )}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-extrabold text-white">{cbt.name}</h3>
                            {cbt.isEnemy ? (
                              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-red-950/80 text-red-300 border border-red-800/50">
                                Inimigo / Selvagem
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-purple-950/80 text-purple-300 border border-purple-800/50">
                                Aliado
                              </span>
                            )}
                            {cbt.type === 'trainer' && (
                              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-800 text-slate-300">
                                Treinador
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-3 text-xs mt-1 text-slate-400">
                            <span className="flex items-center gap-1 font-mono">
                              <Shield className="w-3.5 h-3.5 text-cyan-400" />
                              Defesa:{' '}
                              <strong
                                className={
                                  cbt.defensiveReactionUsedThisRound
                                    ? 'text-cyan-300 font-bold'
                                    : 'text-slate-200'
                                }
                              >
                                {effectiveDef}
                              </strong>
                              {cbt.defensiveReactionUsedThisRound && (
                                <span className="text-[10px] text-cyan-400 font-bold">(+2 Reação)</span>
                              )}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right: HP & PE Bars & Quick Adjust */}
                      <div className="flex items-center gap-4 self-end sm:self-auto">
                        {/* HP Tracker */}
                        <div className="w-32 space-y-1">
                          <div className="flex items-center justify-between text-[11px] font-mono">
                            <span className="text-rose-400 font-bold flex items-center gap-1">
                              <Heart className="w-3 h-3" /> PV
                            </span>
                            <span className="text-slate-300">
                              {cbt.currentHp} / {cbt.maxHp}
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
                            <div
                              className="h-full bg-rose-500 transition-all duration-300"
                              style={{
                                width: `${Math.min(100, Math.max(0, (cbt.currentHp / cbt.maxHp) * 100))}%`,
                              }}
                            />
                          </div>
                          <div className="flex items-center justify-end gap-1 pt-0.5">
                            <button
                              onClick={() =>
                                handleUpdateCombatant(cbt.id, {
                                  currentHp: Math.max(0, cbt.currentHp - 1),
                                })
                              }
                              className="w-5 h-5 rounded bg-zinc-900 hover:bg-zinc-800 text-slate-400 text-xs font-bold flex items-center justify-center border border-zinc-800"
                              title="-1 PV"
                            >
                              -1
                            </button>
                            <button
                              onClick={() =>
                                handleUpdateCombatant(cbt.id, {
                                  currentHp: Math.min(cbt.maxHp, cbt.currentHp + 1),
                                })
                              }
                              className="w-5 h-5 rounded bg-zinc-900 hover:bg-zinc-800 text-slate-400 text-xs font-bold flex items-center justify-center border border-zinc-800"
                              title="+1 PV"
                            >
                              +1
                            </button>
                          </div>
                        </div>

                        {/* PE Tracker for Pokemon */}
                        {cbt.type === 'pokemon' && cbt.maxPe !== undefined && (
                          <div className="w-24 space-y-1">
                            <div className="flex items-center justify-between text-[11px] font-mono">
                              <span className="text-cyan-400 font-bold flex items-center gap-1">
                                <Zap className="w-3 h-3" /> PE
                              </span>
                              <span className="text-slate-300">
                                {cbt.currentPe} / {cbt.maxPe}
                              </span>
                            </div>
                            <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
                              <div
                                className="h-full bg-cyan-400 transition-all duration-300"
                                style={{
                                  width: `${Math.min(100, Math.max(0, ((cbt.currentPe || 0) / cbt.maxPe) * 100))}%`,
                                }}
                              />
                            </div>
                            <div className="flex items-center justify-end gap-1 pt-0.5">
                              <button
                                onClick={() =>
                                  handleUpdateCombatant(cbt.id, {
                                    currentPe: Math.max(0, (cbt.currentPe || 0) - 1),
                                  })
                                }
                                className="w-5 h-5 rounded bg-zinc-900 hover:bg-zinc-800 text-slate-400 text-xs font-bold flex items-center justify-center border border-zinc-800"
                                title="-1 PE"
                              >
                                -1
                              </button>
                              <button
                                onClick={() =>
                                  handleUpdateCombatant(cbt.id, {
                                    currentPe: Math.min(cbt.maxPe || 5, (cbt.currentPe || 0) + 1),
                                  })
                                }
                                className="w-5 h-5 rounded bg-zinc-900 hover:bg-zinc-800 text-slate-400 text-xs font-bold flex items-center justify-center border border-zinc-800"
                                title="+1 PE"
                              >
                                +1
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Economy Tracker (Ação Principal, Movimento, Reação) */}
                    <div className="mt-3 pt-3 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {/* Ação Principal */}
                        <button
                          onClick={() =>
                            handleUpdateCombatant(cbt.id, { mainActionUsed: !cbt.mainActionUsed })
                          }
                          className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition-all ${
                            cbt.mainActionUsed
                              ? 'bg-zinc-800/80 text-slate-500 line-through'
                              : 'bg-purple-950/80 text-purple-300 border border-purple-800/50 hover:bg-purple-900/60'
                          }`}
                        >
                          {cbt.mainActionUsed ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
                          ) : (
                            <Circle className="w-3.5 h-3.5 text-purple-400" />
                          )}
                          <span>Ação Principal</span>
                        </button>

                        {/* Movimento */}
                        <button
                          onClick={() =>
                            handleUpdateCombatant(cbt.id, { movementUsed: !cbt.movementUsed })
                          }
                          className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition-all ${
                            cbt.movementUsed
                              ? 'bg-zinc-800/80 text-slate-500 line-through'
                              : 'bg-zinc-900 text-slate-300 border border-zinc-800 hover:bg-zinc-800'
                          }`}
                        >
                          {cbt.movementUsed ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-slate-500" />
                          ) : (
                            <Circle className="w-3.5 h-3.5 text-slate-500" />
                          )}
                          <span>Movimento</span>
                        </button>

                        {/* Reação Defensiva (+2 Defesa) */}
                        <button
                          onClick={() => {
                            const nextState = !cbt.defensiveReactionUsedThisRound;
                            handleUpdateCombatant(cbt.id, {
                              reactionUsed: nextState,
                              defensiveReactionUsedThisRound: nextState,
                            });
                          }}
                          className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition-all ${
                            cbt.defensiveReactionUsedThisRound
                              ? 'bg-cyan-950/90 text-cyan-200 border border-cyan-700/60 font-bold'
                              : 'bg-zinc-900 text-slate-400 border border-zinc-800 hover:bg-zinc-800'
                          }`}
                          title="Reação Defensiva: +2 na Defesa contra ataques físicos percebidos nesta rodada"
                        >
                          <Shield className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Reação (+2 Defesa)</span>
                        </button>
                      </div>

                      {/* Combat Action Buttons */}
                      <div className="flex items-center gap-2">
                        {/* Atacar / Movimento */}
                        <button
                          onClick={() =>
                            setAttackModal({
                              open: true,
                              attacker: cbt,
                              target: activeSession.combatants.find((x) => x.id !== cbt.id) || null,
                            })
                          }
                          className="px-3 py-1 rounded-lg bg-purple-600/90 hover:bg-purple-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm active:scale-95"
                        >
                          <Swords className="w-3.5 h-3.5" />
                          <span>Atacar / Usar Movimento</span>
                        </button>

                        {/* Capturar Pokémon (se for alvo selvagem/inimigo) */}
                        {cbt.isEnemy && cbt.type === 'pokemon' && (
                          <button
                            onClick={() =>
                              setCaptureModal({
                                open: true,
                                target: cbt,
                                trainer:
                                  activeSession.combatants.find(
                                    (x) => !x.isEnemy && x.type === 'trainer'
                                  ) || null,
                              })
                            }
                            className="px-3 py-1 rounded-lg bg-amber-600/90 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm active:scale-95"
                          >
                            <Target className="w-3.5 h-3.5" />
                            <span>Capturar</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Conditions pills */}
                    <div className="mt-2.5 pt-2 border-t border-zinc-800/40 flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] uppercase font-bold text-slate-500 mr-1">
                        Condições:
                      </span>
                      {CONDITIONS.map((cond) => {
                        const active = cbt.conditions.includes(cond.name);
                        return (
                          <button
                            key={cond.name}
                            onClick={() => handleToggleCondition(cbt, cond.name)}
                            title={cond.effect}
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition-all ${
                              active
                                ? 'bg-rose-950 text-rose-300 border border-rose-800 ring-1 ring-rose-500/40'
                                : 'bg-zinc-900/60 text-slate-500 hover:text-slate-300'
                            }`}
                          >
                            {cond.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Combat Log & Environment (1 Col) */}
          <div className="space-y-4">
            {/* Environment notes */}
            {activeSession.environmentNotes && (
              <div className="p-4 rounded-xl bg-[#141522] border border-purple-900/30 space-y-1">
                <span className="text-[10px] uppercase font-bold text-purple-400 tracking-wider">
                  Cenário & Cobertura
                </span>
                <p className="text-xs text-slate-300 leading-relaxed italic">
                  "{activeSession.environmentNotes}"
                </p>
              </div>
            )}

            {/* Combat Action Log Timeline */}
            <div className="rounded-xl bg-[#141522] border border-zinc-800/80 p-4 space-y-3 flex flex-col h-[520px]">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80">
                <div className="flex items-center gap-2">
                  <Swords className="w-4 h-4 text-purple-400" />
                  <h3 className="text-xs uppercase font-extrabold text-slate-200 tracking-wider">
                    Registro de Batalha (Log)
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-slate-500">
                  {activeSession.actionLog.length} eventos
                </span>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2 pr-1 text-xs">
                {activeSession.actionLog.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">Nenhum evento registrado ainda.</div>
                ) : (
                  [...activeSession.actionLog].reverse().map((entry) => (
                    <div
                      key={entry.id}
                      className={`p-2.5 rounded-lg border text-xs leading-snug space-y-1 ${
                        entry.type === 'round_change'
                          ? 'bg-purple-950/40 border-purple-800/50 text-purple-200 font-bold'
                          : entry.type === 'attack'
                          ? 'bg-zinc-900/80 border-rose-950/40 text-slate-200'
                          : entry.type === 'capture'
                          ? 'bg-amber-950/40 border-amber-800/50 text-amber-200 font-bold'
                          : 'bg-zinc-900/60 border-zinc-800 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                        <span>R{entry.round}</span>
                        <span>{entry.timestamp}</span>
                      </div>
                      <div>{entry.message}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* NEW COMBAT MODAL */}
      {isNewCombatOpen && (
        <NewCombatModal
          isOpen={isNewCombatOpen}
          campaignId={activeCampaign?.id}
          onClose={() => setIsNewCombatOpen(false)}
          onCreated={(newSess) => {
            setIsNewCombatOpen(false);
            setSessions(storageService.getCombatSessions(activeCampaign?.id));
            setActiveSessionId(newSess.id);
          }}
        />
      )}

      {/* ATTACK RESOLUTION MODAL */}
      {attackModal.open && attackModal.attacker && (
        <AttackResolutionModal
          isOpen={attackModal.open}
          sessionId={activeSession?.id || ''}
          round={activeSession?.round || 1}
          attacker={attackModal.attacker}
          allCombatants={activeSession?.combatants || []}
          initialTarget={attackModal.target}
          onClose={() => setAttackModal({ open: false, attacker: null, target: null })}
          onResolved={() => {
            setAttackModal({ open: false, attacker: null, target: null });
            setSessions(storageService.getCombatSessions(activeCampaign?.id));
          }}
        />
      )}

      {/* CAPTURE MODAL */}
      {captureModal.open && captureModal.target && (
        <CaptureResolutionModal
          isOpen={captureModal.open}
          sessionId={activeSession?.id || ''}
          round={activeSession?.round || 1}
          targetPokemon={captureModal.target}
          trainers={activeSession?.combatants.filter((c) => !c.isEnemy && c.type === 'trainer') || []}
          onClose={() => setCaptureModal({ open: false, target: null, trainer: null })}
          onCaptured={(pokemonSheet) => {
            setCaptureModal({ open: false, target: null, trainer: null });
            setSessions(storageService.getCombatSessions(activeCampaign?.id));
          }}
        />
      )}
    </div>
  );
};

// Modal for setting up a brand new combat encounter
interface NewCombatModalProps {
  isOpen: boolean;
  campaignId?: string;
  onClose: () => void;
  onCreated: (session: CombatSession) => void;
}

const NewCombatModal: React.FC<NewCombatModalProps> = ({
  isOpen,
  campaignId,
  onClose,
  onCreated,
}) => {
  const [name, setName] = useState('Confronto na Rota');
  const [environmentNotes, setEnvironmentNotes] = useState('Terreno irregular com árvores baixas e rochedos.');

  const availableTrainers = storageService.getTrainers(campaignId);
  const availablePokemons = storageService.getPokemons(campaignId);
  const pokedexSpecies = storageService.getPokedexSpecies();

  const [selectedTrainerIds, setSelectedTrainerIds] = useState<string[]>(
    availableTrainers.map((t) => t.id)
  );
  const [selectedPokemonIds, setSelectedPokemonIds] = useState<string[]>(
    availablePokemons.slice(0, 2).map((p) => p.id)
  );

  // Wild combatants to spawn
  const [wildCount, setWildCount] = useState<number>(1);
  const [wildSpeciesId, setWildSpeciesId] = useState<string>(pokedexSpecies[0]?.id || '');

  if (!isOpen) return null;

  const handleCreate = () => {
    const combatants: Combatant[] = [];

    // Add selected trainers
    selectedTrainerIds.forEach((tId) => {
      const tr = availableTrainers.find((t) => t.id === tId);
      if (tr) {
        combatants.push({
          id: 'cbt_tr_' + tr.id,
          type: 'trainer',
          sheetId: tr.id,
          name: tr.name,
          avatarUrl: tr.avatarUrl,
          initiative: 10 + Math.floor(Math.random() * 6),
          hasRolledInitiative: true,
          currentHp: tr.currentHp,
          maxHp: tr.maxHp,
          defense: tr.defense,
          defensiveReactionUsedThisRound: false,
          mainActionUsed: false,
          movementUsed: false,
          reactionUsed: false,
          conditions: [],
          status: 'active',
          isEnemy: false,
        });
      }
    });

    // Add selected Pokémon
    selectedPokemonIds.forEach((pId) => {
      const pk = availablePokemons.find((p) => p.id === pId);
      if (pk) {
        combatants.push({
          id: 'cbt_pk_' + pk.id,
          type: 'pokemon',
          sheetId: pk.id,
          trainerId: pk.trainerId,
          name: `${pk.nickname} (${pk.species})`,
          avatarUrl: pk.spriteUrl,
          initiative: 11 + Math.floor(Math.random() * 6),
          hasRolledInitiative: true,
          currentHp: pk.currentHp,
          maxHp: pk.maxHp,
          currentPe: pk.currentPe,
          maxPe: pk.maxPe,
          defense: pk.defense,
          defensiveReactionUsedThisRound: false,
          mainActionUsed: false,
          movementUsed: false,
          reactionUsed: false,
          conditions: pk.conditions,
          status: 'active',
          isEnemy: false,
        });
      }
    });

    // Add wild enemies
    const wildSp = pokedexSpecies.find((s) => s.id === wildSpeciesId) || pokedexSpecies[0];
    if (wildSp) {
      for (let i = 1; i <= wildCount; i++) {
        combatants.push({
          id: 'cbt_wild_' + Date.now().toString(36) + '_' + i,
          type: 'pokemon',
          name: `${wildSp.name} Selvagem ${wildCount > 1 ? '#' + i : ''}`,
          avatarUrl: wildSp.spriteUrl,
          initiative: 9 + Math.floor(Math.random() * 6),
          hasRolledInitiative: true,
          currentHp: 24,
          maxHp: 24,
          currentPe: 3,
          maxPe: 3,
          defense: 10,
          defensiveReactionUsedThisRound: false,
          mainActionUsed: false,
          movementUsed: false,
          reactionUsed: false,
          conditions: [],
          status: 'active',
          isEnemy: true,
        });
      }
    }

    // Sort descending by initiative
    combatants.sort((a, b) => b.initiative - a.initiative);

    const session = storageService.createCombatSession({
      name,
      campaignId,
      environmentNotes,
      combatants,
    });

    onCreated(session);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#12131d] border border-purple-900/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-5 border-b border-purple-900/30 bg-[#161726] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Swords className="w-5 h-5 text-purple-400" />
            <h3 className="text-base font-extrabold text-white">Configurar Encontro de Combate</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
              Nome do Combate *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Emboscada da Equipe Rocket na Rota 9"
              className="w-full py-2 px-3 rounded-lg bg-zinc-900 border border-zinc-800 text-sm text-slate-100 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
              Descrição do Cenário & Efeitos de Terreno
            </label>
            <textarea
              value={environmentNotes}
              onChange={(e) => setEnvironmentNotes(e.target.value)}
              placeholder="Ex: Névoa densa, cobertura leve por rochas, poças de água..."
              rows={2}
              className="w-full py-2 px-3 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-slate-200"
            />
          </div>

          {/* Select Trainers */}
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
              Treinadores Aliados Participantes
            </label>
            <div className="space-y-1.5 p-2 rounded-lg bg-zinc-900/60 border border-zinc-800">
              {availableTrainers.map((tr) => (
                <label key={tr.id} className="flex items-center gap-2 text-xs text-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedTrainerIds.includes(tr.id)}
                    onChange={(e) => {
                      if (e.target.checked) setSelectedTrainerIds([...selectedTrainerIds, tr.id]);
                      else setSelectedTrainerIds(selectedTrainerIds.filter((id) => id !== tr.id));
                    }}
                    className="accent-purple-600 rounded"
                  />
                  <span>
                    <strong>{tr.name}</strong> ({tr.className} Nv.{tr.level})
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Select Pokemon */}
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
              Pokémon Aliados em Campo (1 por Treinador)
            </label>
            <div className="space-y-1.5 p-2 rounded-lg bg-zinc-900/60 border border-zinc-800">
              {availablePokemons.map((pk) => (
                <label key={pk.id} className="flex items-center gap-2 text-xs text-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedPokemonIds.includes(pk.id)}
                    onChange={(e) => {
                      if (e.target.checked) setSelectedPokemonIds([...selectedPokemonIds, pk.id]);
                      else setSelectedPokemonIds(selectedPokemonIds.filter((id) => id !== pk.id));
                    }}
                    className="accent-purple-600 rounded"
                  />
                  <span>
                    <strong>{pk.nickname}</strong> ({pk.species} • {pk.types.join('/')} • Nv.{pk.level})
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Spawn Wild / Enemy Pokemon */}
          <div className="p-4 rounded-xl bg-[#161726] border border-purple-900/30 space-y-3">
            <h4 className="text-xs uppercase font-extrabold text-purple-300 tracking-wider">
              Adicionar Adversários Selvagens / Inimigos
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  Espécie (da Pokédex)
                </label>
                <select
                  value={wildSpeciesId}
                  onChange={(e) => setWildSpeciesId(e.target.value)}
                  className="w-full py-1.5 px-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-slate-200"
                >
                  {pokedexSpecies.map((sp) => (
                    <option key={sp.id} value={sp.id}>
                      #{String(sp.dexNumber).padStart(3, '0')} {sp.name} ({sp.rarity})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  Quantidade
                </label>
                <input
                  type="number"
                  min={1}
                  max={6}
                  value={wildCount}
                  onChange={(e) => setWildCount(Math.max(1, Math.min(6, Number(e.target.value))))}
                  className="w-full py-1.5 px-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-slate-200"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-purple-900/30 bg-[#161726] flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-slate-300 text-xs font-bold"
          >
            Cancelar
          </button>
          <button
            onClick={handleCreate}
            className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md shadow-purple-950/50"
          >
            Iniciar Combate
          </button>
        </div>
      </div>
    </div>
  );
};

// Modal for resolving attacks and moves with real test rolls vs target defense
interface AttackResolutionModalProps {
  isOpen: boolean;
  sessionId: string;
  round: number;
  attacker: Combatant;
  allCombatants: Combatant[];
  initialTarget: Combatant | null;
  onClose: () => void;
  onResolved: () => void;
}

const AttackResolutionModal: React.FC<AttackResolutionModalProps> = ({
  isOpen,
  sessionId,
  round,
  attacker,
  allCombatants,
  initialTarget,
  onClose,
  onResolved,
}) => {
  const [selectedTargetId, setSelectedTargetId] = useState<string>(
    initialTarget?.id || allCombatants.find((c) => c.id !== attacker.id)?.id || ''
  );

  // If attacker has a PokemonSheet or TrainerSheet, get their moves
  const sheet = attacker.sheetId ? storageService.getPokemon(attacker.sheetId) : null;
  const moves: PokemonMove[] = sheet?.moves || [
    {
      id: 'mv_default_basic',
      name: 'Investida / Golpe Físico',
      type: 'Normal',
      category: 'Físico',
      tier: 'Básico',
      damageDice: '1d4',
      peCost: 0,
      range: 'Corpo a corpo',
      effect: 'Ataque corporal direto.',
    },
    {
      id: 'mv_default_strong',
      name: 'Golpe Especial Carregado',
      type: 'Normal',
      category: 'Especial',
      tier: 'Forte',
      damageDice: '1d8',
      peCost: 2,
      range: 'Perto',
      effect: 'Disparo de energia concentrada.',
    },
  ];

  const [selectedMoveId, setSelectedMoveId] = useState<string>(moves[0]?.id || '');
  const [testRoll, setTestRoll] = useState<number>(0);
  const [hasRolled, setHasRolled] = useState(false);
  const [damageRoll, setDamageRoll] = useState<number>(0);

  const target = allCombatants.find((c) => c.id === selectedTargetId) || null;
  const selectedMove = moves.find((m) => m.id === selectedMoveId) || moves[0];

  const targetEffectiveDef = target
    ? target.defensiveReactionUsedThisRound
      ? target.defense + 2
      : target.defense
    : 10;

  const isHit = testRoll >= targetEffectiveDef;

  const handleRollTest = () => {
    // Roll attack: 1d10 + skill rank bonus
    const roll = Math.floor(Math.random() * 10) + 1 + 2; // base + rank bonus
    setTestRoll(roll);
    setHasRolled(true);

    // Roll damage if hit
    let sides = 4;
    if (selectedMove.damageDice.includes('d12')) sides = 12;
    else if (selectedMove.damageDice.includes('d10')) sides = 10;
    else if (selectedMove.damageDice.includes('d8')) sides = 8;
    else if (selectedMove.damageDice.includes('d6')) sides = 6;
    else if (selectedMove.damageDice.includes('d4')) sides = 4;

    const dmg = Math.floor(Math.random() * sides) + 1;
    setDamageRoll(dmg);
  };

  const handleApplyResolution = () => {
    if (!target) return;

    // Deduct PE from attacker if move costs PE
    if (attacker.type === 'pokemon' && selectedMove.peCost > 0) {
      storageService.updateCombatantStats(sessionId, attacker.id, {
        currentPe: Math.max(0, (attacker.currentPe || 0) - selectedMove.peCost),
        mainActionUsed: true,
      });
    } else {
      storageService.updateCombatantStats(sessionId, attacker.id, {
        mainActionUsed: true,
      });
    }

    if (isHit) {
      const newHp = Math.max(0, target.currentHp - damageRoll);
      storageService.updateCombatantStats(sessionId, target.id, {
        currentHp: newHp,
      });

      storageService.addCombatLog(sessionId, {
        round,
        type: 'attack',
        message: `⚔️ ${attacker.name} usou "${selectedMove.name}" contra ${target.name}! Teste ${testRoll} vs Defesa ${targetEffectiveDef}: ACERTO! Causou ${damageRoll} de dano (${target.name} agora com ${newHp}/${target.maxHp} PV).`,
      });
    } else {
      storageService.addCombatLog(sessionId, {
        round,
        type: 'attack',
        message: `🛡️ ${attacker.name} tentou "${selectedMove.name}" contra ${target.name}, mas errou (Teste ${testRoll} vs Defesa ${targetEffectiveDef}).`,
      });
    }

    onResolved();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg bg-[#12131d] border border-purple-900/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        <div className="p-5 border-b border-purple-900/30 bg-[#161726] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Swords className="w-5 h-5 text-purple-400" />
            <h3 className="text-base font-extrabold text-white">Resolução de Ataque / Movimento</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-300 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Atacante</span>
              <strong className="text-white text-sm">{attacker.name}</strong>
            </div>
            <ArrowRight className="w-4 h-4 text-purple-400" />
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Alvo Escolhido</span>
              <strong className="text-white text-sm">{target?.name || 'Nenhum'}</strong>
            </div>
          </div>

          {/* Target Selector */}
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
              Selecionar Alvo
            </label>
            <select
              value={selectedTargetId}
              onChange={(e) => {
                setSelectedTargetId(e.target.value);
                setHasRolled(false);
              }}
              className="w-full py-2 px-3 rounded-lg bg-zinc-900 border border-zinc-800 text-sm text-slate-100 focus:outline-none focus:border-purple-500"
            >
              {allCombatants
                .filter((c) => c.id !== attacker.id)
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} (Defesa: {c.defensiveReactionUsedThisRound ? c.defense + 2 : c.defense}
                    {c.defensiveReactionUsedThisRound ? ' [+2 Reação]' : ''})
                  </option>
                ))}
            </select>
          </div>

          {/* Move Selector */}
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
              Movimento / Golpe a Executar
            </label>
            <select
              value={selectedMoveId}
              onChange={(e) => {
                setSelectedMoveId(e.target.value);
                setHasRolled(false);
              }}
              className="w-full py-2 px-3 rounded-lg bg-zinc-900 border border-zinc-800 text-sm text-slate-100"
            >
              {moves.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.tier} • Dano: {m.damageDice} • Custo: {m.peCost} PE)
                </option>
              ))}
            </select>
          </div>

          {/* Move Summary Card */}
          <div className="p-3 rounded-xl bg-[#161726] border border-purple-900/30 text-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-purple-300">{selectedMove.name}</span>
              <span className="font-mono text-cyan-400 font-bold">{selectedMove.peCost} PE</span>
            </div>
            <p className="text-slate-300 leading-snug">{selectedMove.effect}</p>
          </div>

          {/* Roll outcome area */}
          {!hasRolled ? (
            <button
              onClick={handleRollTest}
              className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-950/50 cursor-pointer active:scale-95"
            >
              <Dices className="w-4 h-4" />
              <span>Rolar Teste de Ataque vs Defesa {targetEffectiveDef}</span>
            </button>
          ) : (
            <div
              className={`p-4 rounded-xl border text-center space-y-2 ${
                isHit
                  ? 'bg-purple-950/40 border-purple-600/60 text-purple-200'
                  : 'bg-zinc-900/80 border-zinc-700 text-slate-400'
              }`}
            >
              <div className="text-xs uppercase font-extrabold tracking-wider">
                {isHit ? '🎉 ACERTO!' : '❌ FALHA NO ATAQUE'}
              </div>
              <div className="text-sm">
                Resultado do Teste: <strong className="text-white text-base font-mono">{testRoll}</strong> vs Defesa{' '}
                <strong className="text-white font-mono">{targetEffectiveDef}</strong>
              </div>
              {isHit && (
                <div className="pt-2 border-t border-purple-800/40 text-xs">
                  Dano rolado ({selectedMove.damageDice}):{' '}
                  <strong className="text-rose-400 text-lg font-mono font-extrabold">
                    {damageRoll}
                  </strong>{' '}
                  pontos de dano
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-purple-900/30 bg-[#161726] flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-slate-300 text-xs font-bold"
          >
            Cancelar
          </button>
          <button
            disabled={!hasRolled}
            onClick={handleApplyResolution}
            className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white text-xs font-bold shadow-md shadow-purple-950/50"
          >
            Aplicar no Combate
          </button>
        </div>
      </div>
    </div>
  );
};

// Modal for Capturing Wild Pokémon according to Além da Próxima Rota rules
interface CaptureResolutionModalProps {
  isOpen: boolean;
  sessionId: string;
  round: number;
  targetPokemon: Combatant;
  trainers: Combatant[];
  onClose: () => void;
  onCaptured: (sheet: PokemonSheet) => void;
}

const CaptureResolutionModal: React.FC<CaptureResolutionModalProps> = ({
  isOpen,
  sessionId,
  round,
  targetPokemon,
  trainers,
  onClose,
  onCaptured,
}) => {
  const [selectedTrainerId, setSelectedTrainerId] = useState<string>(trainers[0]?.id || '');
  const [ballType, setBallType] = useState<'poke' | 'great' | 'ultra'>('poke');
  const [creativeBonus, setCreativeBonus] = useState(false);
  const [nickname, setNickname] = useState(targetPokemon.name.replace(' Selvagem', ''));

  // Target base CA by rarity
  const baseCA = 10; // Default Comum 10, Incomum 12, Raro 14, Muito raro 16

  // Modifiers
  const hpPercent = (targetPokemon.currentHp / targetPokemon.maxHp) * 100;
  const hpModifier = hpPercent <= 25 ? 4 : hpPercent <= 50 ? 2 : 0;
  const ballModifier = ballType === 'ultra' ? 4 : ballType === 'great' ? 2 : 0;
  const creativeModifier = creativeBonus ? 2 : 0;

  const totalBonus = hpModifier + ballModifier + creativeModifier;

  const [hasRolled, setHasRolled] = useState(false);
  const [rollValue, setRollValue] = useState<number>(0);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleRollCapture = () => {
    // 1d10 + skill rank (e.g. +2) + total bonus
    const baseDie = Math.floor(Math.random() * 10) + 1;
    const finalRoll = baseDie + 2 + totalBonus;
    setRollValue(finalRoll);
    setHasRolled(true);
    setIsSuccess(finalRoll >= baseCA);
  };

  const handleConfirmCapture = () => {
    const trainerCombatant = trainers.find((t) => t.id === selectedTrainerId);
    const trainerSheetId = trainerCombatant?.sheetId;

    // Create persistent Pokémon Sheet
    const newSheet: PokemonSheet = {
      id: 'poke_' + Date.now().toString(36),
      campaignId: storageService.getCombatSession(sessionId)?.campaignId || '',
      ownerId: trainerSheetId ? (storageService.getTrainer(trainerSheetId)?.ownerId || 'user_player') : 'user_player',
      trainerId: trainerSheetId,
      nickname: nickname.trim() || targetPokemon.name,
      species: targetPokemon.name.replace(' Selvagem', '').trim(),
      types: ['Normal'],
      level: 1,
      xp: 0,
      pev: 0,
      evolutionsCount: 0,
      spriteUrl: targetPokemon.avatarUrl,
      corpo: 'd6',
      instinto: 'd6',
      energia: 'd6',
      maxHp: targetPokemon.maxHp,
      currentHp: targetPokemon.currentHp,
      maxPe: targetPokemon.maxPe || 4,
      currentPe: targetPokemon.currentPe || 4,
      defense: targetPokemon.defense,
      skills: {
        'Ataque Físico': 'd6',
        Agilidade: 'd6',
        Percepção: 'd6',
        Resistência: 'd6',
      },
      naturalTrait: {
        name: 'Instinto Selvagem',
        effect: 'Acabou de ser capturado e demonstra cautela natural.',
      },
      personality: 'Curioso e atento.',
      bondStage: 1,
      moves: [
        {
          id: 'mv_starter_1',
          name: 'Investida',
          type: 'Normal',
          category: 'Físico',
          tier: 'Básico',
          damageDice: '1d4',
          peCost: 0,
          range: 'Corpo a corpo',
          effect: 'Ataque básico sem custo de energia.',
        },
      ],
      conditions: targetPokemon.conditions,
      notes: `Capturado na Rodada ${round} do combate.`,
    };

    storageService.savePokemon(newSheet);

    // Remove or neutralize from combat
    storageService.updateCombatantStats(sessionId, targetPokemon.id, {
      status: 'neutralized',
      isEnemy: false,
    });

    storageService.addCombatLog(sessionId, {
      round,
      type: 'capture',
      message: `✨ SUCESSO DE CAPTURA! ${trainerCombatant?.name || 'O Treinador'} capturou ${targetPokemon.name} com sucesso! O Pokémon foi vinculado à equipe.`,
    });

    onCaptured(newSheet);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg bg-[#12131d] border border-amber-900/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        <div className="p-5 border-b border-amber-900/30 bg-[#1a1726] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-extrabold text-white">Tentativa de Captura de Pokémon</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
            <img
              src={targetPokemon.avatarUrl}
              alt={targetPokemon.name}
              className="w-12 h-12 object-contain"
            />
            <div>
              <h4 className="text-sm font-extrabold text-white">{targetPokemon.name}</h4>
              <div className="text-xs text-slate-400">
                PV Atual: <strong>{targetPokemon.currentHp}</strong> / {targetPokemon.maxHp} (
                {Math.round(hpPercent)}%)
              </div>
            </div>
          </div>

          {/* Trainer who throws the ball */}
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
              Treinador que Lança a Poké Bola
            </label>
            <select
              value={selectedTrainerId}
              onChange={(e) => setSelectedTrainerId(e.target.value)}
              className="w-full py-2 px-3 rounded-lg bg-zinc-900 border border-zinc-800 text-sm text-slate-100"
            >
              {trainers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          {/* Ball type */}
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
              Tipo de Esfera de Captura
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setBallType('poke')}
                className={`p-2 rounded-lg text-xs font-bold border transition-all ${
                  ballType === 'poke'
                    ? 'bg-purple-950 text-purple-300 border-purple-600'
                    : 'bg-zinc-900 text-slate-400 border-zinc-800'
                }`}
              >
                Poké Bola (+0)
              </button>
              <button
                type="button"
                onClick={() => setBallType('great')}
                className={`p-2 rounded-lg text-xs font-bold border transition-all ${
                  ballType === 'great'
                    ? 'bg-blue-950 text-blue-300 border-blue-600'
                    : 'bg-zinc-900 text-slate-400 border-zinc-800'
                }`}
              >
                Grande Bola (+2)
              </button>
              <button
                type="button"
                onClick={() => setBallType('ultra')}
                className={`p-2 rounded-lg text-xs font-bold border transition-all ${
                  ballType === 'ultra'
                    ? 'bg-amber-950 text-amber-300 border-amber-600'
                    : 'bg-zinc-900 text-slate-400 border-zinc-800'
                }`}
              >
                Ultra Bola (+4)
              </button>
            </div>
          </div>

          {/* Creative opportunity toggle */}
          <label className="flex items-center gap-2 p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 text-xs text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={creativeBonus}
              onChange={(e) => setCreativeBonus(e.target.checked)}
              className="accent-purple-600 rounded"
            />
            <span>
              <strong>Oportunidade Tática / Criativa (+2)</strong>: Isca alimentar, distração ou elemento cênico favorável.
            </span>
          </label>

          {/* Modifiers breakdown */}
          <div className="p-3 rounded-xl bg-[#161726] border border-amber-900/30 text-xs space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span>Dificuldade Base (CA):</span>
              <strong className="text-white font-mono">{baseCA}</strong>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Bônus por PV Baixo:</span>
              <strong className="text-rose-400 font-mono">+{hpModifier}</strong>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Bônus do Dispositivo:</span>
              <strong className="text-cyan-400 font-mono">+{ballModifier}</strong>
            </div>
            {creativeBonus && (
              <div className="flex items-center justify-between text-slate-400">
                <span>Oportunidade Criativa:</span>
                <strong className="text-amber-400 font-mono">+2</strong>
              </div>
            )}
            <div className="pt-2 border-t border-zinc-800 flex items-center justify-between font-bold text-white">
              <span>Bônus Total no Teste:</span>
              <span className="text-amber-300 font-mono">+{totalBonus}</span>
            </div>
          </div>

          {/* Roll capture */}
          {!hasRolled ? (
            <button
              onClick={handleRollCapture}
              className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-950/50 cursor-pointer active:scale-95"
            >
              <Target className="w-4 h-4" />
              <span>Lançar Esfera (Rolar Teste de Captura)</span>
            </button>
          ) : (
            <div
              className={`p-4 rounded-xl border text-center space-y-2 ${
                isSuccess
                  ? 'bg-emerald-950/40 border-emerald-600/60 text-emerald-200'
                  : 'bg-rose-950/40 border-rose-800/60 text-rose-300'
              }`}
            >
              <div className="text-xs uppercase font-extrabold tracking-wider">
                {isSuccess ? '🌟 O POKÉMON FOI CAPTURADO!' : '💨 O POKÉMON ESCAPOU DA ESFERA!'}
              </div>
              <div className="text-sm">
                Resultado: <strong className="text-white text-base font-mono">{rollValue}</strong> vs CA{' '}
                <strong className="text-white font-mono">{baseCA}</strong>
              </div>

              {isSuccess && (
                <div className="pt-2 text-left space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400">
                    Apelido do Novo Companheiro:
                  </label>
                  <input
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    className="w-full py-1.5 px-3 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-slate-100"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-amber-900/30 bg-[#161726] flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-slate-300 text-xs font-bold"
          >
            Fechar
          </button>
          {isSuccess && (
            <button
              onClick={handleConfirmCapture}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-950/50"
            >
              Vincular à Equipe do Treinador
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
