/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { SessionRecord } from '../types';
import { storageService } from '../services/storageService';
import {
  FileText,
  Plus,
  Calendar,
  Award,
  Trash2,
  X,
  Clock,
  MapPin,
  Users,
  Search,
  Eye,
  EyeOff,
  AlertTriangle,
} from 'lucide-react';
import { ConfirmDeleteModal } from '../components/ConfirmDeleteModal';

interface SessionsViewProps {
  onRefreshCampaigns: () => void;
}

export const SessionsView: React.FC<SessionsViewProps> = ({ onRefreshCampaigns }) => {
  const { activeCampaign, isGM } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<SessionRecord | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showGmNotes, setShowGmNotes] = useState(false);

  // Form State
  const [sessionNumber, setSessionNumber] = useState((activeCampaign?.sessions.length || 0) + 1);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [durationHours, setDurationHours] = useState(3.5);
  const [summary, setSummary] = useState('');
  const [xpAwarded, setXpAwarded] = useState(2);
  const [visitedLocations, setVisitedLocations] = useState('');
  const [playerDecisions, setPlayerDecisions] = useState('');
  const [consequences, setConsequences] = useState('');
  const [notes, setNotes] = useState('');
  const [gmPrivateNotes, setGmPrivateNotes] = useState('');

  if (!activeCampaign) return null;

  const handleCreateSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    storageService.addSession(activeCampaign.id, {
      sessionNumber,
      title: title.trim(),
      date,
      durationHours,
      summary,
      xpAwarded,
      visitedLocations: visitedLocations ? visitedLocations.split(',').map((s) => s.trim()) : [],
      playerDecisions: playerDecisions || undefined,
      consequences: consequences || undefined,
      notes,
      gmPrivateNotes,
    });

    onRefreshCampaigns();
    setModalOpen(false);
    setTitle('');
    setSummary('');
    setVisitedLocations('');
    setPlayerDecisions('');
    setConsequences('');
    setNotes('');
    setGmPrivateNotes('');
  };

  const filteredSessions = activeCampaign.sessions.filter(
    (s) =>
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.visitedLocations && s.visitedLocations.some((loc) => loc.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-150">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2 border-b border-zinc-800/60">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-400" />
            Diário de Sessões & Consequências
          </h2>
          <p className="text-xs text-slate-400">
            Histórico das partidas, locais visitados, decisões dramáticas e concessão oficial de XP.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isGM && (
            <button
              onClick={() => setShowGmNotes(!showGmNotes)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer ${
                showGmNotes
                  ? 'bg-rose-950/60 border-rose-700/80 text-rose-300'
                  : 'bg-zinc-900 border-zinc-700 text-slate-400 hover:text-slate-200'
              }`}
            >
              {showGmNotes ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              <span>{showGmNotes ? 'Segredos GM Visíveis' : 'Segredos Ocultos'}</span>
            </button>
          )}

          {isGM && (
            <button
              onClick={() => {
                setSessionNumber(activeCampaign.sessions.length + 1);
                setModalOpen(true);
              }}
              className="px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 font-bold text-xs text-white shadow-sm flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Registrar Sessão
            </button>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Filtrar sessões por título, resumo ou local..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-3 py-2 bg-[#11121d] border border-zinc-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500"
        />
      </div>

      {/* Session Cards */}
      <div className="space-y-4">
        {filteredSessions.map((s) => (
          <div
            key={s.id}
            className="p-5 rounded-2xl bg-[#11121d] border border-zinc-800/80 hover:border-zinc-700/90 flex flex-col justify-between space-y-4 transition-all"
          >
            <div>
              <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-purple-950 text-purple-300 border border-purple-800">
                    Sessão {s.sessionNumber}
                  </span>
                  <h3 className="text-base font-extrabold text-white">{s.title}</h3>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1 text-slate-400 font-mono">
                    <Calendar className="w-3.5 h-3.5 text-purple-400" /> {s.date}
                  </span>
                  {s.durationHours && (
                    <span className="flex items-center gap-1 text-slate-400 font-mono">
                      <Clock className="w-3.5 h-3.5 text-sky-400" /> {s.durationHours}h
                    </span>
                  )}
                  <span className="flex items-center gap-1 font-mono font-bold text-amber-300 bg-amber-950/40 border border-amber-800/40 px-2 py-0.5 rounded">
                    <Award className="w-3.5 h-3.5" /> +{s.xpAwarded} XP
                  </span>

                  {isGM && (
                    <button
                      onClick={() => setSessionToDelete(s)}
                      className="p-1 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                      title="Excluir registro da sessão"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Visited locations */}
              {s.visitedLocations && s.visitedLocations.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap mt-2">
                  <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-purple-400" />
                    Locais:
                  </span>
                  {s.visitedLocations.map((loc, i) => (
                    <span
                      key={i}
                      className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 text-slate-300 border border-zinc-800"
                    >
                      {loc}
                    </span>
                  ))}
                </div>
              )}

              <p className="text-xs text-slate-300 leading-relaxed mt-3">{s.summary}</p>

              {/* Player Decisions & Consequences */}
              {(s.playerDecisions || s.consequences) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 pt-3 border-t border-zinc-800/60 text-xs">
                  {s.playerDecisions && (
                    <div className="p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800/80">
                      <span className="text-[10px] text-sky-400 font-bold uppercase block">
                        Decisões dos Jogadores
                      </span>
                      <p className="text-slate-300 text-[11px] mt-0.5 leading-snug">
                        {s.playerDecisions}
                      </p>
                    </div>
                  )}

                  {s.consequences && (
                    <div className="p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800/80">
                      <span className="text-[10px] text-amber-400 font-bold uppercase block">
                        Consequências Geradas
                      </span>
                      <p className="text-slate-300 text-[11px] mt-0.5 leading-snug">
                        {s.consequences}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {s.notes && (
                <div className="mt-3 p-3 rounded-xl bg-black/40 border border-zinc-800/80 text-xs text-slate-400">
                  <strong className="text-purple-300 font-semibold">Notas Públicas:</strong> {s.notes}
                </div>
              )}

              {/* GM Private Secrets */}
              {isGM && showGmNotes && s.gmPrivateNotes && (
                <div className="mt-3 p-3 rounded-xl bg-rose-950/30 border border-rose-900/50 text-xs text-rose-200">
                  <strong className="text-rose-400 font-semibold flex items-center gap-1.5 mb-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Notas Secretas do Mestre:
                  </strong>
                  {s.gmPrivateNotes}
                </div>
              )}
            </div>
          </div>
        ))}

        {filteredSessions.length === 0 && (
          <div className="p-12 text-center rounded-2xl bg-[#11121d] border border-zinc-800/80 space-y-3">
            <FileText className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="font-bold text-slate-300 text-sm">Nenhuma sessão encontrada</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Ao final de cada partida, anote o resumo dos eventos, duração e consequências para o mundo.
            </p>
          </div>
        )}
      </div>

      {/* New Session Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-[#12131d] border border-zinc-800 rounded-2xl shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-400" />
                <h3 className="font-extrabold text-white text-base">Registrar Sessão {sessionNumber}</h3>
              </div>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSession} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Título da Sessão *</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ex: O Ataque à Rota 9..."
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Data</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Duração (Horas)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    max="12"
                    value={durationHours}
                    onChange={(e) => setDurationHours(parseFloat(e.target.value) || 3)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">XP Concedido</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[1, 2, 3].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setXpAwarded(val)}
                        className={`py-1.5 rounded-lg border font-mono font-bold text-xs ${
                          xpAwarded === val
                            ? 'bg-purple-600 text-white border-purple-400'
                            : 'bg-zinc-800 text-slate-400 border-zinc-700'
                        }`}
                      >
                        +{val} XP
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Locais Visitados (separados por vírgula)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Cerulean City, Rota 4, Caverna dos Diglett"
                  value={visitedLocations}
                  onChange={(e) => setVisitedLocations(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Resumo Narrativo</label>
                <textarea
                  rows={3}
                  required
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="O que os treinadores descobriram, quais decisões tomaram e quem enfrentaram..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Decisões Chave dos Jogadores
                  </label>
                  <input
                    type="text"
                    placeholder="Decidiram poupar o ladrão..."
                    value={playerDecisions}
                    onChange={(e) => setPlayerDecisions(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Consequências Imediatas
                  </label>
                  <input
                    type="text"
                    placeholder="A polícia aumentou patrulha..."
                    value={consequences}
                    onChange={(e) => setConsequences(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-rose-300 block mb-1">
                  Notas Secretas do Mestre (Privadas)
                </label>
                <textarea
                  rows={2}
                  value={gmPrivateNotes}
                  onChange={(e) => setGmPrivateNotes(e.target.value)}
                  placeholder="Segredos que os jogadores ainda não sabem sobre esta sessão..."
                  className="w-full bg-rose-950/20 border border-rose-900/60 rounded-lg px-3 py-2 text-xs text-rose-200"
                />
              </div>

              <div className="pt-3 border-t border-zinc-800 flex justify-end gap-2">
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
                  Salvar Sessão
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {sessionToDelete && (
        <ConfirmDeleteModal
          isOpen={true}
          entityType="Registro de Sessão"
          entityName={`Sessão ${sessionToDelete.sessionNumber}: ${sessionToDelete.title}`}
          details="O resumo, dados e registro desta sessão serão excluídos permanentemente da campanha."
          onClose={() => setSessionToDelete(null)}
          onConfirm={() => {
            storageService.deleteSession(activeCampaign.id, sessionToDelete.id);
            onRefreshCampaigns();
            setSessionToDelete(null);
          }}
        />
      )}
    </div>
  );
};
