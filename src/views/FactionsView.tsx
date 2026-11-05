import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Trash2, 
  Edit3, 
  Eye, 
  EyeOff, 
  MapPin, 
  Lock, 
  Save, 
  X, 
  Shield, 
  Sparkles,
  Network,
  Share2,
  Tag,
  Building,
  Flag,
  Calendar,
  AlertTriangle,
  Award
} from 'lucide-react';
import { Faction, RelationshipConnection, NPC, TrainerSheet } from '../types';
import { storageService } from '../services/storageService';

interface FactionsViewProps {
  campaignId: string;
  isGm?: boolean;
}

export const FactionsView: React.FC<FactionsViewProps> = ({ campaignId, isGm = true }) => {
  const [activeTab, setActiveTab] = useState<'factions' | 'graph' | 'reputations'>('factions');
  const [factions, setFactions] = useState<Faction[]>(() => storageService.getFactions(campaignId));
  const [relationships, setRelationships] = useState<RelationshipConnection[]>(() => storageService.getRelationships(campaignId));
  const [selectedFaction, setSelectedFaction] = useState<Faction | null>(factions[0] || null);
  const [search, setSearch] = useState('');
  const [showGmSecrets, setShowGmSecrets] = useState<boolean>(isGm);

  // Modal State for Faction
  const [isFactionModalOpen, setIsFactionModalOpen] = useState(false);
  const [factionForm, setFactionForm] = useState<Partial<Faction>>({});

  // Modal State for Relationship
  const [isRelModalOpen, setIsRelModalOpen] = useState(false);
  const [relForm, setRelForm] = useState<Partial<RelationshipConnection>>({
    relationshipType: 'Aliado',
    intensity: 1,
    state: 'Ativo',
    isSecretFromPlayers: false,
  });

  const refreshData = () => {
    setFactions(storageService.getFactions(campaignId));
    setRelationships(storageService.getRelationships(campaignId));
  };

  const handleSaveFaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!factionForm.name?.trim()) return;

    const newFaction: Faction = {
      id: factionForm.id || `fac_${Date.now()}`,
      campaignId,
      name: factionForm.name.trim(),
      symbolUrl: factionForm.symbolUrl || 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=200',
      objective: factionForm.objective || '',
      hierarchy: Array.isArray(factionForm.hierarchy) ? factionForm.hierarchy : (factionForm.hierarchy as any || '').split(',').map((h: string) => h.trim()).filter(Boolean),
      leaderName: factionForm.leaderName || '',
      resources: factionForm.resources || '',
      headquartersLocation: factionForm.headquartersLocation || '',
      controlledLocationIds: factionForm.controlledLocationIds || [],
      influenceLevel: Number(factionForm.influenceLevel) || 5,
      relationsNotes: factionForm.relationsNotes || '',
      gmSecrets: factionForm.gmSecrets || '',
      isKnownToPlayers: factionForm.isKnownToPlayers ?? true,
      history: factionForm.history || '',
      updatedAt: new Date().toISOString(),
    };

    storageService.saveFaction(newFaction);
    setIsFactionModalOpen(false);
    refreshData();
    setSelectedFaction(newFaction);
  };

  const handleDeleteFaction = (id: string) => {
    if (confirm('Deseja excluir esta organização/facção?')) {
      storageService.deleteFaction(id);
      refreshData();
      setSelectedFaction(null);
    }
  };

  const handleSaveRelationship = (e: React.FormEvent) => {
    e.preventDefault();
    if (!relForm.sourceName || !relForm.targetName) return;

    const newRel: RelationshipConnection = {
      id: relForm.id || `rel_${Date.now()}`,
      campaignId,
      sourceType: relForm.sourceType || 'npc',
      sourceId: relForm.sourceId || `src_${Date.now()}`,
      sourceName: relForm.sourceName,
      targetType: relForm.targetType || 'npc',
      targetId: relForm.targetId || `trg_${Date.now()}`,
      targetName: relForm.targetName,
      relationshipType: relForm.relationshipType || 'Aliado',
      description: relForm.description || '',
      intensity: Number(relForm.intensity) || 1,
      establishedDate: relForm.establishedDate || new Date().toISOString().split('T')[0],
      state: relForm.state || 'Ativo',
      gmSecrets: relForm.gmSecrets || '',
      isSecretFromPlayers: relForm.isSecretFromPlayers ?? false,
    };

    storageService.saveRelationship(newRel);
    setIsRelModalOpen(false);
    refreshData();
  };

  const handleDeleteRelationship = (id: string) => {
    if (confirm('Deseja remover esta conexão relacional?')) {
      storageService.deleteRelationship(id);
      refreshData();
    }
  };

  const filteredFactions = factions.filter((f) => {
    if (!isGm && !f.isKnownToPlayers) return false;
    return f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.objective.toLowerCase().includes(search.toLowerCase()) ||
      (f.headquartersLocation && f.headquartersLocation.toLowerCase().includes(search.toLowerCase()));
  });

  const visibleRelationships = relationships.filter((r) => {
    if (!isGm && r.isSecretFromPlayers) return false;
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Network className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold text-white tracking-wide">Facções, Organizações & Teia de Relações</h1>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Mapeamento dinâmico de poder em Kanto: sindicatos, divisões científicas, alianças políticas e rivalidades.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isGm && (
            <button
              onClick={() => setShowGmSecrets(!showGmSecrets)}
              className={`px-3 py-2 text-xs font-semibold rounded-lg border transition-colors flex items-center gap-1.5 ${
                showGmSecrets
                  ? 'bg-purple-500/10 border-purple-500/30 text-purple-300'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
              }`}
            >
              {showGmSecrets ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              <span>Segredos do Mestre</span>
            </button>
          )}

          {isGm && (
            <button
              onClick={() => {
                setFactionForm({
                  name: '',
                  objective: '',
                  hierarchy: [],
                  influenceLevel: 5,
                  isKnownToPlayers: true,
                });
                setIsFactionModalOpen(true);
              }}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-purple-600 hover:bg-purple-500 text-white transition-colors flex items-center gap-1.5 shadow-md shadow-purple-900/30"
            >
              <Plus className="w-4 h-4" />
              Nova Facção
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 space-x-2 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('factions')}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 transition-all ${
            activeTab === 'factions'
              ? 'border-purple-500 text-purple-400 bg-purple-500/5 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Building className="w-4 h-4" />
          Organizações ({filteredFactions.length})
        </button>
        <button
          onClick={() => setActiveTab('graph')}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 transition-all ${
            activeTab === 'graph'
              ? 'border-purple-500 text-purple-400 bg-purple-500/5 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Share2 className="w-4 h-4" />
          Grafo de Relações ({visibleRelationships.length})
        </button>
      </div>

      {/* TAB 1: FACTIONS */}
      {activeTab === 'factions' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Factions List */}
          <div className="lg:col-span-1 space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Buscar facção ou objetivo..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 pl-9 pr-3 py-1.5 text-xs rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {filteredFactions.map((fac) => {
                const isSelected = selectedFaction?.id === fac.id;
                return (
                  <button
                    key={fac.id}
                    onClick={() => setSelectedFaction(fac)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-purple-500/10 border-purple-500/40 text-white shadow-md'
                        : 'bg-slate-900/70 border-slate-800 text-slate-300 hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm truncate pr-2">{fac.name}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800/60 shrink-0">
                        Poder {fac.influenceLevel}/10
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mt-1 line-clamp-1">{fac.objective}</div>
                    {fac.headquartersLocation && (
                      <div className="text-[11px] text-purple-400 mt-2 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span>{fac.headquartersLocation}</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Faction Detail */}
          <div className="lg:col-span-2">
            {selectedFaction ? (
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
                <div className="flex items-start justify-between border-b border-slate-800 pb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                      <Flag className="w-6 h-6 text-purple-400" />
                      <span>{selectedFaction.name}</span>
                    </h2>
                    <div className="text-xs text-slate-400 mt-1">
                      Sede: <strong className="text-slate-200">{selectedFaction.headquartersLocation || 'Desconhecida'}</strong> · Líder/Comandante: <strong className="text-purple-300">{selectedFaction.leaderName || 'Não divulgado'}</strong>
                    </div>
                  </div>

                  {isGm && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setFactionForm(selectedFaction);
                          setIsFactionModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-slate-300 hover:text-white"
                        title="Editar Facção"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteFaction(selectedFaction.id)}
                        className="p-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-300"
                        title="Excluir Facção"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Objective */}
                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-1">
                  <div className="text-xs font-bold uppercase tracking-wider text-purple-400">
                    Objetivo Central
                  </div>
                  <p className="text-sm text-slate-200 leading-relaxed font-medium">
                    {selectedFaction.objective}
                  </p>
                </div>

                {/* Hierarchy & Resources */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-4 space-y-2">
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Estrutura & Cadeia de Comando
                    </div>
                    <ul className="text-xs text-slate-300 space-y-1.5 list-disc pl-4">
                      {selectedFaction.hierarchy?.map((rank, idx) => (
                        <li key={idx}>{rank}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-4 space-y-2">
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Recursos & Arsenal Disponível
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {selectedFaction.resources || 'Informações logísticas confidenciais.'}
                    </p>
                  </div>
                </div>

                {/* Relations with others */}
                <div className="space-y-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Relações Políticas & Postura
                  </div>
                  <p className="text-xs text-slate-300 bg-slate-950/30 p-3 rounded-lg border border-slate-800/80 leading-relaxed">
                    {selectedFaction.relationsNotes || 'Neutro perante civis e treinadores comuns.'}
                  </p>
                </div>

                {/* GM Secrets */}
                {showGmSecrets && selectedFaction.gmSecrets && (
                  <div className="space-y-2 bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
                    <div className="text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
                      <Lock className="w-4 h-4" />
                      Segredos Confidenciais do Mestre
                    </div>
                    <p className="text-xs text-purple-200/90 leading-relaxed italic">
                      {selectedFaction.gmSecrets}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-12 text-center text-slate-400 text-sm">
                Selecione uma facção para inspecionar hierarquia, recursos e segredos.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: RELATIONSHIPS GRAPH & LIST */}
      {activeTab === 'graph' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Conexões Relacionais em Kanto</h3>
              <p className="text-xs text-slate-400">
                Laços de aliança, inimizades juradas, lealdades familiares e pactos mercantis entre NPCs, grupos e facções.
              </p>
            </div>

            {isGm && (
              <button
                onClick={() => {
                  setRelForm({
                    relationshipType: 'Aliado',
                    intensity: 1,
                    state: 'Ativo',
                    isSecretFromPlayers: false,
                  });
                  setIsRelModalOpen(true);
                }}
                className="px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                Nova Conexão
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {visibleRelationships.map((rel) => {
              const isPositive = rel.intensity >= 0;
              return (
                <div
                  key={rel.id}
                  className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-lg space-y-3 relative overflow-hidden"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">{rel.sourceName}</span>
                        <span className="text-xs text-slate-500">⇄</span>
                        <span className="font-bold text-sm text-white">{rel.targetName}</span>
                      </div>
                      <div className="text-xs text-purple-400 font-semibold mt-0.5">
                        {rel.relationshipType} ({rel.state})
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded border ${
                          isPositive
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        }`}
                      >
                        Intensidade: {rel.intensity > 0 ? `+${rel.intensity}` : rel.intensity}
                      </span>

                      {isGm && (
                        <button
                          onClick={() => handleDeleteRelationship(rel.id)}
                          className="text-slate-500 hover:text-rose-400 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/60">
                    {rel.description}
                  </p>

                  {showGmSecrets && rel.gmSecrets && (
                    <div className="text-[11px] text-purple-300/90 italic bg-purple-500/5 p-2 rounded border border-purple-500/20">
                      <span className="font-bold">Segredo do Mestre: </span>
                      {rel.gmSecrets}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL: NOVA FACÇÃO */}
      {isFactionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <form
            onSubmit={handleSaveFaction}
            className="bg-slate-900 border border-slate-700 rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base">
                {factionForm.id ? 'Editar Facção' : 'Cadastrar Nova Facção'}
              </h3>
              <button
                type="button"
                onClick={() => setIsFactionModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300">Nome da Facção / Organização</label>
              <input
                type="text"
                required
                value={factionForm.name || ''}
                onChange={(e) => setFactionForm({ ...factionForm, name: e.target.value })}
                placeholder="Ex: Associação de Pescadores de Kanto"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 mt-1"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300">Objetivo Principal</label>
              <textarea
                rows={2}
                value={factionForm.objective || ''}
                onChange={(e) => setFactionForm({ ...factionForm, objective: e.target.value })}
                placeholder="Qual o propósito fundamental desta facção?"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300">Sede Principal</label>
                <input
                  type="text"
                  value={factionForm.headquartersLocation || ''}
                  onChange={(e) => setFactionForm({ ...factionForm, headquartersLocation: e.target.value })}
                  placeholder="Ex: Cidade de Vermilion"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-300">Nível de Poder (1 a 10)</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={factionForm.influenceLevel || 5}
                  onChange={(e) => setFactionForm({ ...factionForm, influenceLevel: parseInt(e.target.value) || 1 })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 mt-1"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300">Hierarquia (separada por vírgula)</label>
              <input
                type="text"
                value={Array.isArray(factionForm.hierarchy) ? factionForm.hierarchy.join(', ') : factionForm.hierarchy || ''}
                onChange={(e) => setFactionForm({ ...factionForm, hierarchy: e.target.value.split(',').map(s => s.trim()) })}
                placeholder="Ex: Grão-Mestre, Capitães, Aprendizes"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 mt-1"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300">Recursos & Arsenal</label>
              <input
                type="text"
                value={factionForm.resources || ''}
                onChange={(e) => setFactionForm({ ...factionForm, resources: e.target.value })}
                placeholder="Ex: Barcos pesqueiros, redes eletrificadas, laboratório móvel"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 mt-1"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-purple-300">Segredos do Mestre (Oculto)</label>
              <textarea
                rows={2}
                value={factionForm.gmSecrets || ''}
                onChange={(e) => setFactionForm({ ...factionForm, gmSecrets: e.target.value })}
                placeholder="Informações confidenciais que os jogadores ainda não sabem..."
                className="w-full bg-slate-950 border border-purple-500/30 rounded-lg px-3 py-2 text-xs text-purple-200 focus:outline-none focus:border-purple-400 mt-1"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsFactionModalOpen(false)}
                className="px-4 py-2 text-xs text-slate-300 hover:text-white bg-slate-800 rounded-lg"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-500 rounded-lg"
              >
                Salvar Facção
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: NOVA CONEXÃO RELACIONAL */}
      {isRelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <form
            onSubmit={handleSaveRelationship}
            className="bg-slate-900 border border-slate-700 rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base">Nova Conexão Relacional</h3>
              <button
                type="button"
                onClick={() => setIsRelModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300">Origem (Nome)</label>
                <input
                  type="text"
                  required
                  value={relForm.sourceName || ''}
                  onChange={(e) => setRelForm({ ...relForm, sourceName: e.target.value })}
                  placeholder="Ex: Brock"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-300">Alvo (Nome)</label>
                <input
                  type="text"
                  required
                  value={relForm.targetName || ''}
                  onChange={(e) => setRelForm({ ...relForm, targetName: e.target.value })}
                  placeholder="Ex: Douglas Ventura"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300">Tipo de Relação</label>
                <select
                  value={relForm.relationshipType || 'Aliado'}
                  onChange={(e) => setRelForm({ ...relForm, relationshipType: e.target.value as any })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 mt-1"
                >
                  <option value="Aliado">Aliado</option>
                  <option value="Rival">Rival</option>
                  <option value="Inimigo">Inimigo</option>
                  <option value="Mentor">Mentor</option>
                  <option value="Subordinado">Subordinado</option>
                  <option value="Comercial">Comercial</option>
                  <option value="Neutro">Neutro</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-300">Intensidade (-5 a +5)</label>
                <input
                  type="number"
                  min="-5"
                  max="5"
                  value={relForm.intensity ?? 1}
                  onChange={(e) => setRelForm({ ...relForm, intensity: parseInt(e.target.value) || 0 })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 mt-1"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300">Descrição do Vínculo</label>
              <textarea
                rows={3}
                value={relForm.description || ''}
                onChange={(e) => setRelForm({ ...relForm, description: e.target.value })}
                placeholder="Como essa relação começou e qual o estado atual dela?"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 mt-1"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsRelModalOpen(false)}
                className="px-4 py-2 text-xs text-slate-300 hover:text-white bg-slate-800 rounded-lg"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-500 rounded-lg"
              >
                Salvar Relação
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
