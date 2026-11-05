/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { storageService } from '../services/storageService';
import { WorldCalendar, WorldEvent, ReputationRecord, RivalryRecord } from '../types';
import {
  Calendar,
  Clock,
  CloudSun,
  Plus,
  Trash2,
  Edit2,
  Eye,
  EyeOff,
  TrendingUp,
  TrendingDown,
  Swords,
  Shield,
  MapPin,
  Users,
} from 'lucide-react';

export const WorldStateView: React.FC = () => {
  const { activeCampaign, isGM } = useAuth();
  const [activeTab, setActiveTab] = useState<'calendar' | 'events' | 'reputation' | 'rivalries'>('calendar');

  // Data States
  const [calendar, setCalendar] = useState<WorldCalendar>({
    day: 14,
    month: 10,
    year: 2026,
    hour: 15,
    minute: 30,
    season: 'Outono',
    weather: 'Ensolarado',
    worldNotes: 'Clima estável com brisa litorânea.',
  });
  const [events, setEvents] = useState<WorldEvent[]>([]);
  const [reputations, setReputations] = useState<ReputationRecord[]>([]);
  const [rivalries, setRivalries] = useState<RivalryRecord[]>([]);
  const [showGmSecrets, setShowGmSecrets] = useState(false);

  // Modals
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [eventForm, setEventForm] = useState<Partial<WorldEvent>>({
    title: '',
    date: '15/10/2026',
    location: 'Cerulean City',
    triggerCondition: '',
    duration: '1 dia',
    involvedCharacters: [],
    consequences: '',
    visibility: 'Público',
    status: 'Programado',
    requiresGmConfirmation: false,
    executed: false,
    gmNotes: '',
  });

  const [isRepModalOpen, setIsRepModalOpen] = useState(false);
  const [repForm, setRepForm] = useState<Partial<ReputationRecord>>({
    trainerName: 'Grupo',
    targetGroupOrNpc: '',
    standing: 'Neutro',
    score: 0,
    notes: '',
    eventsHistory: [],
  });

  const [isRivalModalOpen, setIsRivalModalOpen] = useState(false);
  const [rivalForm, setRivalForm] = useState<Partial<RivalryRecord>>({
    rivalName: '',
    trainerName: 'Grupo',
    firstEncounterDate: '10/09/2026',
    firstEncounterLocation: 'Pallet Town',
    battlesCount: 1,
    trainerWins: 0,
    rivalWins: 1,
    currentStance: 'Rivalidade Saudável',
    logEntries: [],
  });

  const reloadData = () => {
    if (!activeCampaign) return;
    if (activeCampaign.calendar) {
      setCalendar(activeCampaign.calendar);
    }
    setEvents(storageService.getWorldEvents(activeCampaign.id));
    setReputations(storageService.getReputations(activeCampaign.id));
    setRivalries(storageService.getRivalries(activeCampaign.id));
  };

  useEffect(() => {
    reloadData();
  }, [activeCampaign]);

  // Calendar time advancement (minutes)
  const handleAdvanceTime = (minutes: number) => {
    if (!activeCampaign || !isGM) return;
    const updated = storageService.advanceCalendarTime(activeCampaign.id, minutes);
    setCalendar(updated);
  };

  // Weather update
  const handleUpdateWeather = (newWeather: WorldCalendar['weather']) => {
    if (!activeCampaign || !isGM) return;
    const updated = storageService.advanceCalendarTime(activeCampaign.id, 0, newWeather);
    setCalendar(updated);
  };

  // Events
  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCampaign || !eventForm.title?.trim()) return;

    const newEvent: WorldEvent = {
      id: eventForm.id || `wev_${Date.now().toString(36)}`,
      campaignId: activeCampaign.id,
      title: eventForm.title.trim(),
      date: eventForm.date || 'Hoje',
      location: eventForm.location || 'Kanto',
      triggerCondition: eventForm.triggerCondition || '',
      duration: eventForm.duration || '1 dia',
      involvedCharacters: eventForm.involvedCharacters || [],
      consequences: eventForm.consequences || '',
      visibility: (eventForm.visibility as any) || 'Público',
      status: (eventForm.status as any) || 'Programado',
      requiresGmConfirmation: eventForm.requiresGmConfirmation ?? false,
      executed: eventForm.executed ?? false,
      gmNotes: eventForm.gmNotes,
    };

    storageService.saveWorldEvent(newEvent);
    setIsEventModalOpen(false);
    reloadData();
  };

  const handleDeleteEvent = (id: string) => {
    if (!confirm('Deseja realmente remover este evento do mundo?')) return;
    storageService.deleteWorldEvent(id);
    reloadData();
  };

  const handleToggleEventStatus = (ev: WorldEvent, newStatus: WorldEvent['status']) => {
    if (!isGM) return;
    const updated: WorldEvent = { ...ev, status: newStatus };
    storageService.saveWorldEvent(updated);
    reloadData();
  };

  // Reputation
  const handleSaveReputation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCampaign || !repForm.targetGroupOrNpc?.trim()) return;

    const rep: ReputationRecord = {
      id: repForm.id || `rep_${Date.now().toString(36)}`,
      campaignId: activeCampaign.id,
      trainerId: repForm.trainerId || 'group',
      trainerName: repForm.trainerName || 'Grupo',
      targetGroupOrNpc: repForm.targetGroupOrNpc.trim(),
      standing: (repForm.standing as any) || 'Neutro',
      score: repForm.score ?? 0,
      notes: repForm.notes || '',
      eventsHistory: repForm.eventsHistory || [],
    };

    storageService.saveReputation(rep);
    setIsRepModalOpen(false);
    reloadData();
  };

  const handleAdjustRepScore = (rep: ReputationRecord, delta: number) => {
    if (!isGM) return;
    const newScore = Math.max(-100, Math.min(100, rep.score + delta));
    let standing: ReputationRecord['standing'] = 'Neutro';
    if (newScore >= 80) standing = 'Herói';
    else if (newScore >= 50) standing = 'Respeitado';
    else if (newScore >= 20) standing = 'Reconhecido';
    else if (newScore <= -80) standing = 'Odiado';
    else if (newScore <= -50) standing = 'Hostil';
    else if (newScore <= -20) standing = 'Desconfiado';

    const updated: ReputationRecord = {
      ...rep,
      score: newScore,
      standing,
    };
    storageService.saveReputation(updated);
    reloadData();
  };

  // Rivalries
  const handleSaveRivalry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCampaign || !rivalForm.rivalName?.trim()) return;

    const riv: RivalryRecord = {
      id: rivalForm.id || `riv_${Date.now().toString(36)}`,
      campaignId: activeCampaign.id,
      trainerId: rivalForm.trainerId || 'trainer_group',
      trainerName: rivalForm.trainerName || 'Grupo',
      rivalName: rivalForm.rivalName.trim(),
      firstEncounterDate: rivalForm.firstEncounterDate || 'Recentemente',
      firstEncounterLocation: rivalForm.firstEncounterLocation || 'Kanto',
      battlesCount: rivalForm.battlesCount ?? 0,
      trainerWins: rivalForm.trainerWins ?? 0,
      rivalWins: rivalForm.rivalWins ?? 0,
      currentStance: (rivalForm.currentStance as any) || 'Rivalidade Saudável',
      logEntries: rivalForm.logEntries || [],
    };

    storageService.saveRivalry(riv);
    setIsRivalModalOpen(false);
    reloadData();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-purple-950/70 border border-purple-800/50 text-purple-300">
              <Calendar className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-100 tracking-tight">
              Estado do Mundo & Linha do Tempo
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Tempo em jogo, clima dinâmico, eventos mundiais, rivalidades e reputações regionais.
          </p>
        </div>

        {isGM && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowGmSecrets(!showGmSecrets)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer ${
                showGmSecrets
                  ? 'bg-rose-950/60 border-rose-700/80 text-rose-300'
                  : 'bg-zinc-900 border-zinc-700 text-slate-400 hover:text-slate-200'
              }`}
            >
              {showGmSecrets ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              <span>{showGmSecrets ? 'Gatilhos Secretos Visíveis' : 'Gatilhos Ocultos'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-zinc-800/80 pb-2">
        <button
          onClick={() => setActiveTab('calendar')}
          className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
            activeTab === 'calendar'
              ? 'bg-purple-600 text-white'
              : 'text-slate-400 hover:text-slate-200 hover:bg-zinc-800/60'
          }`}
        >
          Calendário & Clima
        </button>
        <button
          onClick={() => setActiveTab('events')}
          className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
            activeTab === 'events'
              ? 'bg-purple-600 text-white'
              : 'text-slate-400 hover:text-slate-200 hover:bg-zinc-800/60'
          }`}
        >
          Eventos & Consequências ({events.length})
        </button>
        <button
          onClick={() => setActiveTab('reputation')}
          className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
            activeTab === 'reputation'
              ? 'bg-purple-600 text-white'
              : 'text-slate-400 hover:text-slate-200 hover:bg-zinc-800/60'
          }`}
        >
          Reputação Regional ({reputations.length})
        </button>
        <button
          onClick={() => setActiveTab('rivalries')}
          className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
            activeTab === 'rivalries'
              ? 'bg-purple-600 text-white'
              : 'text-slate-400 hover:text-slate-200 hover:bg-zinc-800/60'
          }`}
        >
          Rivalidades & Duelos ({rivalries.length})
        </button>
      </div>

      {/* Tab: Calendar & Weather */}
      {activeTab === 'calendar' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 p-6 rounded-2xl bg-[#11121d] border border-zinc-800/80 space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-400" />
                Relógio de Campanha
              </span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-950/80 text-purple-300 border border-purple-800/50">
                Estação: {calendar.season}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-[#161726] border border-zinc-800">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Data Atual</span>
                <span className="text-lg font-extrabold text-slate-100">
                  Dia {calendar.day}/{calendar.month}, Ano {calendar.year}
                </span>
              </div>
              <div className="p-4 rounded-xl bg-[#161726] border border-zinc-800">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Horário do Dia</span>
                <span className="text-2xl font-black text-purple-300 font-mono tracking-wider">
                  {String(calendar.hour).padStart(2, '0')}:{String(calendar.minute).padStart(2, '0')}
                </span>
              </div>
            </div>

            {/* Advance Time Controls */}
            {isGM && (
              <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 space-y-2">
                <span className="text-xs font-bold text-slate-300 block">
                  Avançar Tempo em Jogo (Apenas Mestre)
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleAdvanceTime(60)}
                    className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-slate-200 text-xs font-semibold rounded-lg transition-all"
                  >
                    +1 Hora
                  </button>
                  <button
                    onClick={() => handleAdvanceTime(240)}
                    className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-slate-200 text-xs font-semibold rounded-lg transition-all"
                  >
                    +4 Horas (Descanso Curto)
                  </button>
                  <button
                    onClick={() => handleAdvanceTime(480)}
                    className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-slate-200 text-xs font-semibold rounded-lg transition-all"
                  >
                    +8 Horas (Descanso Longo)
                  </button>
                  <button
                    onClick={() => handleAdvanceTime(1440)}
                    className="px-3 py-1.5 bg-purple-600/80 hover:bg-purple-600 text-white text-xs font-semibold rounded-lg transition-all"
                  >
                    +1 Dia Completo
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Dynamic Weather Card */}
          <div className="p-6 rounded-2xl bg-[#11121d] border border-zinc-800/80 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <CloudSun className="w-4 h-4 text-amber-400" />
                Condição Climática
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[#161726] border border-zinc-800 text-center space-y-2">
              <CloudSun className="w-10 h-10 text-amber-400 mx-auto" />
              <div className="text-sm font-bold text-slate-100">{calendar.weather}</div>
              <p className="text-[11px] text-slate-400 leading-snug">
                Afeta testes ambientais, visibilidade em rotas e golpes elementais.
              </p>
            </div>

            {isGM && (
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Definir Clima
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {(
                    [
                      'Ensolarado',
                      'Nublado',
                      'Chuva Leve',
                      'Tempestade',
                      'Névoa Espessa',
                      'Calor Intenso',
                    ] as WorldCalendar['weather'][]
                  ).map((w) => (
                    <button
                      key={w}
                      onClick={() => handleUpdateWeather(w)}
                      className="p-2 text-left bg-zinc-900 hover:bg-zinc-800 rounded-lg text-slate-300 text-[11px] truncate border border-zinc-800/80 transition-colors"
                    >
                      {w}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: World Events */}
      {activeTab === 'events' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">
              Eventos que ocorrem independente da vontade dos heróis, alterando o tabuleiro político e natural.
            </span>
            {isGM && (
              <button
                onClick={() => {
                  setEventForm({
                    title: '',
                    date: '15/10/2026',
                    location: 'Cerulean City',
                    triggerCondition: '',
                    duration: '1 dia',
                    involvedCharacters: [],
                    consequences: '',
                    visibility: 'Público',
                    status: 'Programado',
                    requiresGmConfirmation: false,
                    executed: false,
                    gmNotes: '',
                  });
                  setIsEventModalOpen(true);
                }}
                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Novo Evento</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {events.map((ev) => (
              <div
                key={ev.id}
                className="p-5 rounded-xl bg-[#11121d] border border-zinc-800/80 space-y-3 relative group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded border ${
                          ev.status === 'Concluído'
                            ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60'
                            : ev.status === 'Em andamento'
                            ? 'bg-amber-950/80 text-amber-300 border-amber-800/60'
                            : 'bg-zinc-800 text-slate-300 border-zinc-700'
                        }`}
                      >
                        {ev.status}
                      </span>
                      <span className="text-[10px] text-purple-400 font-mono">
                        Local: {ev.location}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-100">{ev.title}</h3>
                  </div>

                  {isGM && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => {
                          setEventForm(ev);
                          setIsEventModalOpen(true);
                        }}
                        className="p-1 text-slate-400 hover:text-slate-200"
                        title="Editar Evento"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteEvent(ev.id)}
                        className="p-1 text-slate-400 hover:text-rose-400"
                        title="Excluir Evento"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="p-2.5 rounded-lg bg-zinc-900/80 border border-zinc-800/80 text-xs space-y-1">
                  {ev.date && (
                    <div className="text-[11px] text-slate-300">
                      <span className="text-slate-500 font-semibold">Data Prevista: </span>
                      {ev.date}
                    </div>
                  )}
                  {ev.triggerCondition && (
                    <div className="text-[11px] text-amber-300/90">
                      <span className="text-amber-500 font-semibold">Gatilho: </span>
                      {ev.triggerCondition}
                    </div>
                  )}
                  <div className="text-[11px] text-slate-300">
                    <span className="text-slate-500 font-semibold">Consequência no Mundo: </span>
                    {ev.consequences}
                  </div>
                </div>

                {isGM && showGmSecrets && ev.gmNotes && (
                  <div className="p-2 rounded bg-rose-950/30 border border-rose-900/50 text-[11px] text-rose-300 font-mono">
                    <span className="font-bold">Segredo GM: </span>
                    {ev.gmNotes}
                  </div>
                )}

                {isGM && (
                  <div className="flex items-center justify-between pt-2 border-t border-zinc-800/60 text-xs">
                    <span className="text-[11px] text-slate-400">Alterar Status:</span>
                    <div className="flex gap-1.5">
                      {ev.status !== 'Em andamento' && (
                        <button
                          onClick={() => handleToggleEventStatus(ev, 'Em andamento')}
                          className="px-2 py-0.5 rounded bg-amber-950/70 text-amber-300 border border-amber-800/50 text-[10px] font-bold"
                        >
                          Ativar
                        </button>
                      )}
                      {ev.status !== 'Concluído' && (
                        <button
                          onClick={() => handleToggleEventStatus(ev, 'Concluído')}
                          className="px-2 py-0.5 rounded bg-emerald-950/70 text-emerald-300 border border-emerald-800/50 text-[10px] font-bold"
                        >
                          Concluir
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Reputation */}
      {activeTab === 'reputation' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">
              Escala de reputação (-100 a +100) junto a facções, guildas e cidades.
            </span>
            {isGM && (
              <button
                onClick={() => {
                  setRepForm({
                    trainerName: 'Grupo',
                    targetGroupOrNpc: '',
                    standing: 'Neutro',
                    score: 0,
                    notes: '',
                    eventsHistory: [],
                  });
                  setIsRepModalOpen(true);
                }}
                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nova Reputação</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reputations.map((rep) => {
              const isPositive = rep.score > 0;
              const isNegative = rep.score < 0;

              return (
                <div
                  key={rep.id}
                  className="p-5 rounded-xl bg-[#11121d] border border-zinc-800/80 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-100">{rep.targetGroupOrNpc}</h3>
                      <span className="text-xs font-semibold text-purple-400">
                        {rep.standing}
                      </span>
                    </div>

                    <div
                      className={`text-sm font-extrabold px-2.5 py-0.5 rounded-lg border font-mono ${
                        isPositive
                          ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60'
                          : isNegative
                          ? 'bg-rose-950/80 text-rose-300 border-rose-800/60'
                          : 'bg-zinc-800 text-slate-300 border-zinc-700'
                      }`}
                    >
                      {rep.score > 0 ? `+${rep.score}` : rep.score}
                    </div>
                  </div>

                  <p className="text-xs text-slate-400">{rep.notes}</p>

                  {isGM && (
                    <div className="flex items-center justify-between pt-2 border-t border-zinc-800/60">
                      <span className="text-[11px] text-slate-400">Ajustar Pontuação:</span>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => handleAdjustRepScore(rep, -10)}
                          className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-rose-900/60 text-slate-300 hover:text-rose-200 text-xs font-bold"
                        >
                          -10
                        </button>
                        <button
                          onClick={() => handleAdjustRepScore(rep, +10)}
                          className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-emerald-900/60 text-slate-300 hover:text-emerald-200 text-xs font-bold"
                        >
                          +10
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab: Rivalries */}
      {activeTab === 'rivalries' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">
              Rivalidades declaradas, postura e placar de vitórias em confrontos.
            </span>
            {isGM && (
              <button
                onClick={() => {
                  setRivalForm({
                    rivalName: '',
                    trainerName: 'Grupo',
                    firstEncounterDate: '10/09/2026',
                    firstEncounterLocation: 'Pallet Town',
                    battlesCount: 1,
                    trainerWins: 0,
                    rivalWins: 1,
                    currentStance: 'Rivalidade Saudável',
                    logEntries: [],
                  });
                  setIsRivalModalOpen(true);
                }}
                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nova Rivalidade</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rivalries.map((riv) => (
              <div
                key={riv.id}
                className="p-5 rounded-xl bg-[#11121d] border border-zinc-800/80 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Swords className="w-4 h-4 text-purple-400" />
                    <h3 className="text-sm font-bold text-slate-100">
                      {riv.rivalName} <span className="text-slate-400 font-normal">vs</span> {riv.trainerName}
                    </h3>
                  </div>

                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-800/60">
                    {riv.currentStance}
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-zinc-900/80 border border-zinc-800 text-xs flex items-center justify-between">
                  <span>Placar de Duelos:</span>
                  <span className="font-mono font-bold text-slate-200">
                    Treinador {riv.trainerWins} × {riv.rivalWins} Rival ({riv.battlesCount} lutas)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal Event */}
      {isEventModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#12131f] border border-zinc-800 rounded-xl max-w-lg w-full p-5 space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl">
            <h3 className="text-sm font-bold text-slate-100">
              {eventForm.id ? 'Editar Evento do Mundo' : 'Registrar Novo Evento do Mundo'}
            </h3>

            <form onSubmit={handleSaveEvent} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Título do Evento</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Cerco ao Silph Co."
                  value={eventForm.title || ''}
                  onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                  className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Local</label>
                  <input
                    type="text"
                    required
                    value={eventForm.location || ''}
                    onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                    className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Status</label>
                  <select
                    value={eventForm.status || 'Programado'}
                    onChange={(e) => setEventForm({ ...eventForm, status: e.target.value as any })}
                    className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-purple-500"
                  >
                    <option value="Programado">Programado</option>
                    <option value="Em andamento">Em andamento</option>
                    <option value="Concluído">Concluído</option>
                    <option value="Cancelado">Cancelado</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Consequências Mecânicas ou Narrativas
                </label>
                <textarea
                  rows={2}
                  placeholder="Ex: Rotas 7 e 8 bloqueadas..."
                  value={eventForm.consequences || ''}
                  onChange={(e) => setEventForm({ ...eventForm, consequences: e.target.value })}
                  className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-rose-300 block mb-1">
                  Notas do Mestre
                </label>
                <input
                  type="text"
                  value={eventForm.gmNotes || ''}
                  onChange={(e) => setEventForm({ ...eventForm, gmNotes: e.target.value })}
                  className="w-full px-3 py-1.5 bg-rose-950/20 border border-rose-900/60 rounded-lg text-xs text-rose-200 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsEventModalOpen(false)}
                  className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-slate-300 rounded-lg text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-lg text-xs"
                >
                  Salvar Evento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Reputação */}
      {isRepModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#12131f] border border-zinc-800 rounded-xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-slate-100">Registrar Reputação</h3>
            <form onSubmit={handleSaveReputation} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Facção ou Cidade</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Polícia de Cerulean"
                  value={repForm.targetGroupOrNpc || ''}
                  onChange={(e) => setRepForm({ ...repForm, targetGroupOrNpc: e.target.value })}
                  className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Pontuação (-100 a +100)</label>
                  <input
                    type="number"
                    min="-100"
                    max="100"
                    value={repForm.score ?? 0}
                    onChange={(e) => setRepForm({ ...repForm, score: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Postura</label>
                  <select
                    value={repForm.standing || 'Neutro'}
                    onChange={(e) => setRepForm({ ...repForm, standing: e.target.value as any })}
                    className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-purple-500"
                  >
                    <option value="Herói">Herói</option>
                    <option value="Respeitado">Respeitado</option>
                    <option value="Reconhecido">Reconhecido</option>
                    <option value="Neutro">Neutro</option>
                    <option value="Desconfiado">Desconfiado</option>
                    <option value="Hostil">Hostil</option>
                    <option value="Odiado">Odiado</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsRepModalOpen(false)}
                  className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-slate-300 rounded-lg text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-lg text-xs"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
