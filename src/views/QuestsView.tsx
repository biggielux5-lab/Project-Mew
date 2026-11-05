import React, { useState } from 'react';
import { 
  CheckSquare, 
  Square, 
  Plus, 
  Target, 
  Gift, 
  Lock, 
  Eye, 
  EyeOff, 
  User,
  MapPin
} from 'lucide-react';
import { Quest, QuestObjective } from '../types';
import { getQuests, saveQuest, toggleQuestObjective } from '../services/storageService';

interface QuestsViewProps {
  campaignId: string;
  isGm?: boolean;
}

export const QuestsView: React.FC<QuestsViewProps> = ({ campaignId, isGm = true }) => {
  const [quests, setQuests] = useState<Quest[]>(() => getQuests(campaignId));
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(quests[0] || null);
  const [showGmSecrets, setShowGmSecrets] = useState<boolean>(isGm);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  
  // Modal for new quest
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newLocations, setNewLocations] = useState('');
  const [newRewardMoney, setNewRewardMoney] = useState<number>(500);
  const [newRewardItems, setNewRewardItems] = useState<string>('');
  const [newSecrets, setNewSecrets] = useState('');
  const [newObjectives, setNewObjectives] = useState<string[]>(['']);

  const refreshQuests = () => {
    const list = getQuests(campaignId);
    setQuests(list);
    if (selectedQuest) {
      const updated = list.find((q: Quest) => q.id === selectedQuest.id);
      if (updated) setSelectedQuest(updated);
    }
  };

  const handleToggle = (questId: string, objId: string) => {
    toggleQuestObjective(questId, objId);
    refreshQuests();
  };

  const handleCreateQuest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const questObjList: QuestObjective[] = newObjectives
      .filter((o: string) => o.trim().length > 0)
      .map((desc: string, idx: number) => ({
        id: `obj_${Date.now()}_${idx}`,
        text: desc.trim(),
        completed: false
      }));

    const newQuest: Quest = {
      id: `quest_${Date.now()}`,
      campaignId,
      title: newTitle.trim(),
      description: newDesc.trim(),
      status: 'Em andamento',
      involvedNpcIds: [],
      locations: newLocations.split(',').map((l: string) => l.trim()).filter(Boolean),
      rewards: {
        pokedollars: newRewardMoney,
        items: newRewardItems.split(',').map((i: string) => i.trim()).filter(Boolean),
      },
      objectives: questObjList,
      gmSecrets: newSecrets.trim() || undefined,
    };

    saveQuest(newQuest);
    setShowCreateModal(false);
    setNewTitle('');
    setNewDesc('');
    setNewLocations('');
    setNewRewardMoney(500);
    setNewRewardItems('');
    setNewSecrets('');
    setNewObjectives(['']);
    refreshQuests();
    setSelectedQuest(newQuest);
  };

  const filteredQuests = quests.filter((q: Quest) => {
    if (filterStatus === 'all') return true;
    return q.status === filterStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Target className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold text-white tracking-wide">Missões & Objetivos da Campanha</h1>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Rastreador de metas do grupo, pedidos de NPCs, etapas de investigação e recompensas de jornada.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowGmSecrets(!showGmSecrets)}
            className={`px-3 py-2 text-xs font-semibold rounded-lg border transition-colors flex items-center gap-1.5 ${
              showGmSecrets
                ? 'bg-purple-500/10 border-purple-500/30 text-purple-300'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
            }`}
          >
            {showGmSecrets ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span>Notas Ocultas do Mestre</span>
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-sky-600 hover:bg-sky-500 text-white transition-colors flex items-center gap-1.5 shadow-md shadow-sky-900/30"
          >
            <Plus className="w-4 h-4" />
            Nova Missão
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-xs font-medium">
        <button
          onClick={() => setFilterStatus('all')}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            filterStatus === 'all' ? 'bg-sky-500/10 text-sky-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Todas ({quests.length})
        </button>
        <button
          onClick={() => setFilterStatus('Em andamento')}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            filterStatus === 'Em andamento' ? 'bg-sky-500/10 text-sky-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Em Andamento ({quests.filter((q: Quest) => q.status === 'Em andamento').length})
        </button>
        <button
          onClick={() => setFilterStatus('Concluída')}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            filterStatus === 'Concluída' ? 'bg-emerald-500/10 text-emerald-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Concluídas ({quests.filter((q: Quest) => q.status === 'Concluída').length})
        </button>
      </div>

      {/* Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quests List */}
        <div className="lg:col-span-1 space-y-2">
          {filteredQuests.length === 0 ? (
            <div className="p-8 text-center text-slate-400 bg-slate-900/40 border border-slate-800 rounded-xl text-xs">
              Nenhuma missão encontrada neste filtro.
            </div>
          ) : (
            filteredQuests.map((quest: Quest) => {
              const isSelected = selectedQuest?.id === quest.id;
              const completedCount = quest.objectives.filter((o: QuestObjective) => o.completed).length;
              const totalCount = quest.objectives.length;
              return (
                <button
                  key={quest.id}
                  onClick={() => setSelectedQuest(quest)}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    isSelected
                      ? 'bg-sky-500/10 border-sky-500/40 text-white shadow-md'
                      : 'bg-slate-900/70 border-slate-800 text-slate-300 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold truncate pr-2">{quest.title}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                        quest.status === 'Concluída'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : quest.status === 'Falhou'
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          : 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                      }`}
                    >
                      {quest.status}
                    </span>
                  </div>

                  <div className="text-xs text-slate-400 line-clamp-1">
                    {quest.description}
                  </div>

                  {totalCount > 0 && (
                    <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
                      <span>Progresso: {completedCount}/{totalCount} etapas</span>
                      <div className="w-20 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-sky-400 h-full rounded-full transition-all"
                          style={{ width: `${(completedCount / totalCount) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Quest Detail Pane */}
        <div className="lg:col-span-2">
          {selectedQuest ? (
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
              <div className="flex items-start justify-between border-b border-slate-800 pb-4">
                <div>
                  <h2 className="text-2xl font-bold text-white">{selectedQuest.title}</h2>
                  <div className="text-xs text-slate-400 mt-1 flex flex-wrap gap-3">
                    {selectedQuest.locations && selectedQuest.locations.length > 0 && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-sky-400" />
                        Locais: <strong className="text-slate-200">{selectedQuest.locations.join(', ')}</strong>
                      </span>
                    )}
                  </div>
                </div>

                <span
                  className={`text-xs font-bold px-3 py-1 rounded-lg uppercase tracking-wider ${
                    selectedQuest.status === 'Concluída'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                  }`}
                >
                  {selectedQuest.status}
                </span>
              </div>

              {/* Description */}
              <div className="text-sm text-slate-300 leading-relaxed bg-slate-950/50 p-4 rounded-xl border border-slate-800/80">
                {selectedQuest.description}
              </div>

              {/* Objectives List */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Etapas & Objetivos ({selectedQuest.objectives.length})
                </h3>
                <div className="space-y-2">
                  {selectedQuest.objectives.map((obj: QuestObjective) => (
                    <button
                      key={obj.id}
                      onClick={() => handleToggle(selectedQuest.id, obj.id)}
                      className={`w-full text-left p-3 rounded-lg border flex items-center gap-3 transition-colors ${
                        obj.completed
                          ? 'bg-emerald-500/5 border-emerald-500/20 text-slate-400'
                          : 'bg-slate-950/70 border-slate-800 text-slate-200 hover:border-slate-700'
                      }`}
                    >
                      {obj.completed ? (
                        <CheckSquare className="w-5 h-5 text-emerald-400 shrink-0" />
                      ) : (
                        <Square className="w-5 h-5 text-slate-500 shrink-0" />
                      )}
                      <span className={`text-sm ${obj.completed ? 'line-through text-slate-400' : 'text-slate-200'}`}>
                        {obj.text}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Rewards */}
              {selectedQuest.rewards && (
                <div className="space-y-2 bg-amber-500/5 border border-amber-500/20 rounded-xl p-4">
                  <div className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <Gift className="w-4 h-4" />
                    Recompensas Prometidas
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1 text-xs text-amber-300">
                    {selectedQuest.rewards.pokedollars && (
                      <span className="px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/20 font-bold">
                        ¥ {selectedQuest.rewards.pokedollars.toLocaleString('pt-BR')} PD
                      </span>
                    )}
                    {selectedQuest.rewards.items?.map((item: string, idx: number) => (
                      <span key={idx} className="px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/20">
                        {item}
                      </span>
                    ))}
                    {selectedQuest.rewards.other && (
                      <span className="px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/20">
                        {selectedQuest.rewards.other}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* GM Secrets */}
              {showGmSecrets && selectedQuest.gmSecrets && (
                <div className="space-y-2 bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
                  <div className="text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
                    <Lock className="w-4 h-4" />
                    Notas Confidenciais do Mestre
                  </div>
                  <p className="text-xs text-purple-200/90 leading-relaxed italic">
                    {selectedQuest.gmSecrets}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-12 text-center text-slate-400 text-sm">
              Selecione uma missão para visualizar suas etapas e recompensas.
            </div>
          )}
        </div>
      </div>

      {/* CREATE MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <form
            onSubmit={handleCreateQuest}
            className="bg-slate-900 border border-slate-700 rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base">Nova Missão da Campanha</h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300">Título da Missão</label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Ex: O Enigma da Floresta de Viridian"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 mt-1"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300">Descrição & Contexto</label>
              <textarea
                rows={3}
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Descreva a situação, o problema a ser resolvido e o objetivo principal do grupo."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 mt-1"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300">Localidades Envolvidas</label>
              <input
                type="text"
                value={newLocations}
                onChange={(e) => setNewLocations(e.target.value)}
                placeholder="Ex: Rota 2, Monte Lua, Cidade de Pewter"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 mt-1"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-300">Etapas / Objetivos</label>
                <button
                  type="button"
                  onClick={() => setNewObjectives([...newObjectives, ''])}
                  className="text-[11px] text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Adicionar Etapa
                </button>
              </div>
              <div className="space-y-2">
                {newObjectives.map((obj: string, i: number) => (
                  <input
                    key={i}
                    type="text"
                    value={obj}
                    onChange={(e) => {
                      const updated = [...newObjectives];
                      updated[i] = e.target.value;
                      setNewObjectives(updated);
                    }}
                    placeholder={`Etapa ${i + 1}`}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300">Recompensa (¥ PD)</label>
                <input
                  type="number"
                  value={newRewardMoney}
                  onChange={(e) => setNewRewardMoney(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-300">Itens Prometidos</label>
                <input
                  type="text"
                  value={newRewardItems}
                  onChange={(e) => setNewRewardItems(e.target.value)}
                  placeholder="Ex: 2x Superpoção, 1x Corda"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 mt-1"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-purple-300">Notas Secretas do Mestre</label>
              <textarea
                rows={2}
                value={newSecrets}
                onChange={(e) => setNewSecrets(e.target.value)}
                placeholder="Revelações futuras ou reviravoltas..."
                className="w-full bg-slate-950 border border-purple-500/30 rounded-lg px-3 py-2 text-xs text-purple-200 focus:outline-none focus:border-purple-400 mt-1"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-xs text-slate-300 hover:text-white bg-slate-800 rounded-lg"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-lg"
              >
                Criar Missão
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
