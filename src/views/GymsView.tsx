import React, { useState } from 'react';
import { 
  Award, 
  Shield, 
  Trophy, 
  Plus, 
  Calendar,
  Sparkles,
  MapPin,
  CheckCircle2
} from 'lucide-react';
import { GymBadge, GymMatchRecord, TrainerSheet } from '../types';
import { getGymBadges, recordGymMatch } from '../services/storageService';

interface GymsViewProps {
  campaignId: string;
  trainers: TrainerSheet[];
  onRefreshCampaign?: () => void;
}

export const GymsView: React.FC<GymsViewProps> = ({ campaignId, trainers, onRefreshCampaign }) => {
  const [gyms, setGyms] = useState<GymBadge[]>(() => getGymBadges(campaignId));
  const [selectedGym, setSelectedGym] = useState<GymBadge | null>(gyms[0] || null);
  
  // Match Recording Modal
  const [showMatchModal, setShowMatchModal] = useState<boolean>(false);
  const [matchTrainerId, setMatchTrainerId] = useState<string>(trainers[0]?.id || '');
  const [matchOutcome, setMatchOutcome] = useState<'Vitória' | 'Derrota' | 'Empate'>('Vitória');
  const [matchNotes, setMatchNotes] = useState<string>('');

  const refreshData = () => {
    const list = getGymBadges(campaignId);
    setGyms(list);
    if (selectedGym) {
      const updated = list.find((g: GymBadge) => g.id === selectedGym.id);
      if (updated) setSelectedGym(updated);
    }
    if (onRefreshCampaign) onRefreshCampaign();
  };

  const handleRecordMatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGym) return;
    const trainer = trainers.find((t: TrainerSheet) => t.id === matchTrainerId);
    if (!trainer) return;

    recordGymMatch(
      selectedGym.id,
      {
        id: `match_${Date.now()}`,
        date: new Date().toISOString(),
        trainerId: trainer.id,
        trainerName: trainer.name,
        outcome: matchOutcome,
        notes: matchNotes,
        badgeAwarded: matchOutcome === 'Vitória',
      }
    );

    setShowMatchModal(false);
    setMatchNotes('');
    refreshData();
  };

  const totalBadgesEarned = gyms.reduce(
    (acc: number, g: GymBadge) => acc + (g.matchHistory?.filter((m: GymMatchRecord) => m.outcome === 'Vitória').length || 0),
    0
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Trophy className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold text-white tracking-wide">Ginásios Oficiais & Circuito da Liga</h1>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Os 8 Ginásios de Kanto, líderes oficiais, regras de desafio e registro histórico de confrontos por insígnia.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-slate-950/80 border border-slate-800 px-4 py-2.5 rounded-xl">
          <Award className="w-5 h-5 text-amber-400" />
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Insígnias Conquistadas</div>
            <div className="text-base font-bold text-white">{totalBadgesEarned} vitórias oficiais</div>
          </div>
        </div>
      </div>

      {/* Gyms Grid & Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Badges List */}
        <div className="lg:col-span-1 space-y-2.5">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
            Circuito das 8 Insígnias
          </div>
          <div className="space-y-2">
            {gyms.map((gym: GymBadge, idx: number) => {
              const isSelected = selectedGym?.id === gym.id;
              const hasVictory = gym.matchHistory?.some((m: GymMatchRecord) => m.outcome === 'Vitória');
              return (
                <button
                  key={gym.id}
                  onClick={() => setSelectedGym(gym)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-amber-500/10 border-amber-500/40 text-white shadow-md'
                      : 'bg-slate-900/70 border-slate-800 text-slate-300 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-400 w-4">{idx + 1}.</span>
                    <div>
                      <div className="text-sm font-semibold flex items-center gap-2">
                        <span>{gym.gymName}</span>
                        {hasVictory && <Award className="w-3.5 h-3.5 text-amber-400" />}
                      </div>
                      <div className="text-xs text-slate-400">
                        {gym.badgeName} · {gym.leaderName}
                      </div>
                    </div>
                  </div>

                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    {gym.specialtyType}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Gym Detail */}
        <div className="lg:col-span-2">
          {selectedGym ? (
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
              <div className="flex items-start justify-between border-b border-slate-800 pb-4">
                <div>
                  <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                    {selectedGym.badgeName}
                  </div>
                  <h2 className="text-2xl font-bold text-white mt-0.5">{selectedGym.gymName}</h2>
                  <div className="text-xs text-slate-400 mt-1">
                    Líder Oficial: <strong className="text-slate-200">{selectedGym.leaderName}</strong> · Cidade: <strong className="text-slate-200">{selectedGym.city}</strong> · Especialista em: <strong className="text-amber-300">{selectedGym.specialtyType}</strong>
                  </div>
                </div>

                <button
                  onClick={() => setShowMatchModal(true)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors flex items-center gap-1.5 shadow-md shadow-amber-900/30"
                >
                  <Plus className="w-4 h-4" />
                  Registrar Desafio
                </button>
              </div>

              {/* Gym Leader Rules and Team */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Regras Oficiais & Requisitos
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {selectedGym.rulesNotes || selectedGym.requirements || 'Combate oficial da Liga Pokémon de Kanto.'}
                  </p>
                </div>

                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Time Pokémon do Líder
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {selectedGym.leaderPokemonNames && selectedGym.leaderPokemonNames.length > 0 ? (
                      selectedGym.leaderPokemonNames.map((poke: string, idx: number) => (
                        <span
                          key={idx}
                          className="text-xs px-2.5 py-1 rounded bg-slate-800 text-slate-200 border border-slate-700"
                        >
                          {poke}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400 italic">Informação confidencial da Liga</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Match History for this Gym */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Histórico de Desafios do Grupo ({selectedGym.matchHistory?.length || 0})
                </h3>

                {(!selectedGym.matchHistory || selectedGym.matchHistory.length === 0) ? (
                  <div className="p-6 text-center text-xs text-slate-400 bg-slate-950/40 border border-slate-800/80 rounded-xl">
                    Nenhum treinador do grupo desafiou este ginásio ainda.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-800/60 bg-slate-950/50 border border-slate-800/80 rounded-xl overflow-hidden">
                    {selectedGym.matchHistory.map((m: GymMatchRecord) => (
                      <div key={m.id} className="p-3.5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span
                            className={`text-xs font-bold px-2.5 py-0.5 rounded uppercase tracking-wider ${
                              m.outcome === 'Vitória'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : m.outcome === 'Derrota'
                                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                            }`}
                          >
                            {m.outcome}
                          </span>
                          <div>
                            <div className="text-sm font-semibold text-slate-200">{m.trainerName}</div>
                            {m.notes && <div className="text-xs text-slate-400 mt-0.5">{m.notes}</div>}
                          </div>
                        </div>

                        <div className="text-xs text-slate-400">
                          {new Date(m.date).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-12 text-center text-slate-400 text-sm">
              Selecione um ginásio para visualizar detalhes do líder e histórico.
            </div>
          )}
        </div>
      </div>

      {/* RECORD MATCH MODAL */}
      {showMatchModal && selectedGym && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <form
            onSubmit={handleRecordMatch}
            className="bg-slate-900 border border-slate-700 rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-white text-base">Registrar Batalha Oficial</h3>
                <div className="text-xs text-slate-400">{selectedGym.gymName} ({selectedGym.leaderName})</div>
              </div>
              <button
                type="button"
                onClick={() => setShowMatchModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300">Treinador Desafiante</label>
              <select
                value={matchTrainerId}
                onChange={(e) => setMatchTrainerId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 mt-1"
              >
                {trainers.map((t: TrainerSheet) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300">Resultado do Confronto</label>
              <select
                value={matchOutcome}
                onChange={(e) => setMatchOutcome(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 mt-1"
              >
                <option value="Vitória">Vitória (Insígnia Conquistada!)</option>
                <option value="Derrota">Derrota</option>
                <option value="Empate">Empate / Interrompida</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300">Notas & Destaques da Luta</label>
              <textarea
                rows={3}
                value={matchNotes}
                onChange={(e) => setMatchNotes(e.target.value)}
                placeholder="Ex: Pikachu superou o Onix com um golpe certeiro no chifre após a quebra do solo."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 mt-1"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowMatchModal(false)}
                className="px-4 py-2 text-xs text-slate-300 hover:text-white bg-slate-800 rounded-lg"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-lg"
              >
                Salvar Registro
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
