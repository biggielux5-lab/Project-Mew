/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { NPC, NpcClassification } from '../types';
import { storageService } from '../services/storageService';
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
  Camera,
  Shield,
  Sparkles,
  Network,
  HeartCrack,
  Package,
  Calendar,
} from 'lucide-react';
import { ConfirmDeleteModal } from '../components/ConfirmDeleteModal';
import { ImageUploadModal } from '../components/ImageUploadModal';

export const NPCsView: React.FC = () => {
  const { activeCampaign, isGM } = useAuth();
  const [search, setSearch] = useState('');
  const [classificationFilter, setClassificationFilter] = useState<string>('Todos');

  // List of NPCs
  const [npcs, setNpcs] = useState<NPC[]>(() =>
    storageService.getNpcs(activeCampaign?.id)
  );

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNpc, setEditingNpc] = useState<NPC | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  const refreshNpcs = () => {
    setNpcs(storageService.getNpcs(activeCampaign?.id));
  };

  const filteredNpcs = useMemo(() => {
    return npcs.filter((n) => {
      if (search) {
        const query = search.toLowerCase();
        const matchesName = n.name.toLowerCase().includes(query);
        const matchesRole = n.roleOrTitle?.toLowerCase().includes(query) || false;
        const matchesLoc = n.location?.toLowerCase().includes(query) || false;
        const matchesFaction = n.factionName?.toLowerCase().includes(query) || false;
        if (!matchesName && !matchesRole && !matchesLoc && !matchesFaction) return false;
      }
      if (classificationFilter !== 'Todos' && n.importance !== classificationFilter) return false;
      return true;
    });
  }, [npcs, search, classificationFilter]);

  const handleCreateNpc = () => {
    const newNpc: NPC = {
      id: 'npc_' + Date.now().toString(36),
      campaignId: activeCampaign?.id || '',
      name: 'Novo Personagem',
      age: 28,
      roleOrTitle: 'Cidadão / Contato Local',
      importance: 'Comum',
      factionName: 'Cidadãos Comuns',
      location: activeCampaign?.publicInfo.region || 'Kanto',
      appearance: 'Descrição da fisionomia, vestimentas e marcas características.',
      personality: 'Comportamento, tom de voz e atitude com estranhos.',
      motivation: 'O que move este personagem no mundo.',
      fears: 'O que o personagem teme perder.',
      relations: 'Vínculos com facções, ginásios ou moradores.',
      goals: 'Metas a curto e longo prazo.',
      secretNotes: 'Segredos confidenciais conhecidos apenas pelo Mestre...',
      isSecretRevealed: false,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300',
      associatedPokemonIds: [],
      inventory: [],
      appearanceHistory: [],
      createdAt: new Date().toISOString(),
    };
    setEditingNpc(newNpc);
    setIsModalOpen(true);
  };

  const handleSaveNpc = (npc: NPC) => {
    storageService.saveNpc(npc);
    refreshNpcs();
    setIsModalOpen(false);
    setEditingNpc(null);
  };

  const handleDeleteNpc = (id: string) => {
    storageService.deleteNpc(id);
    refreshNpcs();
    setDeleteTargetId(null);
  };

  const toggleSecretRevealed = (npc: NPC) => {
    const updated = { ...npc, isSecretRevealed: !npc.isSecretRevealed };
    storageService.saveNpc(updated);
    refreshNpcs();
  };

  const getClassificationBadge = (cls?: NpcClassification) => {
    switch (cls) {
      case 'Líder de Ginásio':
        return 'bg-amber-950 text-amber-300 border-amber-800';
      case 'Antagonista':
        return 'bg-rose-950 text-rose-300 border-rose-800';
      case 'Rival':
        return 'bg-purple-950 text-purple-300 border-purple-800';
      case 'Aliado':
        return 'bg-emerald-950 text-emerald-300 border-emerald-800';
      case 'Importante':
        return 'bg-sky-950 text-sky-300 border-sky-800';
      case 'Comerciante':
        return 'bg-cyan-950 text-cyan-300 border-cyan-800';
      default:
        return 'bg-zinc-800 text-slate-400 border-zinc-700';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <Users className="w-6 h-6 text-purple-400" />
              NPCs & Figuras de Kanto
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-mono font-bold bg-purple-950 text-purple-300 border border-purple-800">
              {npcs.length} Cadastrados
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Registro de autoridades, líderes de ginásio, rivais e figuras da trama com vínculos e segredos.
          </p>
        </div>

        <button
          onClick={handleCreateNpc}
          className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-lg shadow-purple-950/40 transition-all"
        >
          <Plus className="w-4 h-4" /> Cadastrar NPC
        </button>
      </div>

      {/* Filtros e Busca */}
      <div className="p-4 rounded-xl bg-[#131422] border border-zinc-800 space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome do personagem, cargo, facção ou localização..."
            className="w-full bg-[#18192a] border border-zinc-700/80 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-400 shrink-0 font-medium">Classificação:</span>
          {[
            'Todos',
            'Comum',
            'Recorrente',
            'Importante',
            'Rival',
            'Aliado',
            'Antagonista',
            'Líder de Ginásio',
            'Comerciante',
          ].map((cls) => (
            <button
              key={cls}
              onClick={() => setClassificationFilter(cls)}
              className={`px-2.5 py-1 rounded-lg border whitespace-nowrap cursor-pointer transition-colors ${
                classificationFilter === cls
                  ? 'bg-purple-900/60 text-purple-200 border-purple-700 font-bold'
                  : 'bg-zinc-800/80 text-slate-400 border-zinc-700 hover:text-white'
              }`}
            >
              {cls}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de NPCs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredNpcs.map((npc) => (
          <div
            key={npc.id}
            className="p-4 rounded-xl bg-[#141525] border border-zinc-800 hover:border-purple-800/60 flex flex-col justify-between transition-colors space-y-3"
          >
            <div>
              <div className="flex items-start gap-3">
                <img
                  src={npc.avatarUrl}
                  alt={npc.name}
                  className="w-14 h-14 rounded-xl object-cover border border-purple-500/40 shadow-sm shrink-0"
                />

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <h3 className="text-sm font-black text-white truncate">{npc.name}</h3>
                    <span
                      className={`text-[9px] px-2 py-0.2 rounded-full font-mono border ${getClassificationBadge(
                        npc.importance
                      )}`}
                    >
                      {npc.importance || 'Comum'}
                    </span>
                  </div>

                  <div className="text-xs font-semibold text-purple-300 truncate">
                    {npc.roleOrTitle || 'Sem título definido'}
                  </div>

                  <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1 flex-wrap">
                    {npc.location && (
                      <span className="flex items-center gap-0.5">
                        <MapPin className="w-3 h-3 text-purple-400" />
                        {npc.location}
                      </span>
                    )}
                    {npc.factionName && (
                      <span className="flex items-center gap-0.5 text-sky-400 font-semibold">
                        <Network className="w-3 h-3" />
                        {npc.factionName}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-3 space-y-2 text-xs">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Aparência</span>
                  <p className="text-slate-300 text-xs mt-0.5 line-clamp-2">{npc.appearance}</p>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Personalidade & Tom</span>
                  <p className="text-slate-300 text-xs mt-0.5 line-clamp-2">{npc.personality}</p>
                </div>

                {npc.fears && (
                  <div>
                    <span className="text-[10px] font-bold uppercase text-rose-400 tracking-wider flex items-center gap-1">
                      <HeartCrack className="w-3 h-3" /> Medo & Ponto Fraco
                    </span>
                    <p className="text-slate-300 text-xs mt-0.5 line-clamp-2">{npc.fears}</p>
                  </div>
                )}

                {/* Segredos do Mestre */}
                {(isGM || npc.isSecretRevealed) && npc.secretNotes && (
                  <div className="p-2.5 rounded-lg bg-[#111220] border border-purple-900/40 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase text-purple-400 flex items-center gap-1 font-mono">
                        <Lock className="w-3 h-3 text-purple-400" /> Segredo do Mestre
                      </span>
                      {isGM && (
                        <button
                          onClick={() => toggleSecretRevealed(npc)}
                          className="text-[10px] text-purple-300 hover:text-white flex items-center gap-1 cursor-pointer"
                        >
                          {npc.isSecretRevealed ? (
                            <>
                              <Eye className="w-3 h-3 text-emerald-400" /> Revelado
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3 h-3 text-slate-400" /> Oculto
                            </>
                          )}
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-300 italic">{npc.secretNotes}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Botões de Ação */}
            <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-end gap-2">
              <button
                onClick={() => {
                  setEditingNpc(npc);
                  setIsModalOpen(true);
                }}
                className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-slate-300 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" /> Editar
              </button>
              <button
                onClick={() => setDeleteTargetId(npc.id)}
                className="p-1.5 rounded-lg bg-zinc-800 hover:bg-rose-900/60 text-slate-400 hover:text-rose-300 transition-colors cursor-pointer"
                title="Excluir NPC"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit/Create NPC Modal */}
      {isModalOpen && editingNpc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-2xl bg-[#12131f] border border-purple-900/50 rounded-2xl shadow-2xl p-5 space-y-4 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-400" />
                {editingNpc.id ? 'Editar NPC' : 'Novo NPC'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1 sm:col-span-2">
                  <label className="font-bold text-slate-300">Nome do Personagem</label>
                  <input
                    type="text"
                    value={editingNpc.name}
                    onChange={(e) => setEditingNpc({ ...editingNpc, name: e.target.value })}
                    className="w-full bg-[#18192a] border border-zinc-700 rounded-lg px-3 py-1.5 text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Classificação</label>
                  <select
                    value={editingNpc.importance || 'Comum'}
                    onChange={(e) => setEditingNpc({ ...editingNpc, importance: e.target.value as any })}
                    className="w-full bg-[#18192a] border border-zinc-700 rounded-lg px-3 py-1.5 text-white"
                  >
                    <option value="Comum">Comum</option>
                    <option value="Recorrente">Recorrente</option>
                    <option value="Importante">Importante</option>
                    <option value="Rival">Rival</option>
                    <option value="Aliado">Aliado</option>
                    <option value="Antagonista">Antagonista</option>
                    <option value="Líder de Ginásio">Líder de Ginásio</option>
                    <option value="Comerciante">Comerciante</option>
                    <option value="Personagem histórico">Personagem histórico</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Papel / Título</label>
                  <input
                    type="text"
                    value={editingNpc.roleOrTitle || ''}
                    onChange={(e) => setEditingNpc({ ...editingNpc, roleOrTitle: e.target.value })}
                    placeholder="Ex: Oficial de Patrulha"
                    className="w-full bg-[#18192a] border border-zinc-700 rounded-lg px-3 py-1.5 text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Facção de Origem</label>
                  <input
                    type="text"
                    value={editingNpc.factionName || ''}
                    onChange={(e) => setEditingNpc({ ...editingNpc, factionName: e.target.value })}
                    placeholder="Ex: Polícia de Kanto"
                    className="w-full bg-[#18192a] border border-zinc-700 rounded-lg px-3 py-1.5 text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Localização</label>
                  <input
                    type="text"
                    value={editingNpc.location || ''}
                    onChange={(e) => setEditingNpc({ ...editingNpc, location: e.target.value })}
                    placeholder="Ex: Cerulean City"
                    className="w-full bg-[#18192a] border border-zinc-700 rounded-lg px-3 py-1.5 text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300">Aparência Física & Vestimentas</label>
                <textarea
                  rows={2}
                  value={editingNpc.appearance}
                  onChange={(e) => setEditingNpc({ ...editingNpc, appearance: e.target.value })}
                  className="w-full bg-[#18192a] border border-zinc-700 rounded-lg px-3 py-1.5 text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300">Personalidade & Comportamento</label>
                <textarea
                  rows={2}
                  value={editingNpc.personality}
                  onChange={(e) => setEditingNpc({ ...editingNpc, personality: e.target.value })}
                  className="w-full bg-[#18192a] border border-zinc-700 rounded-lg px-3 py-1.5 text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Motivações & Objetivos</label>
                  <input
                    type="text"
                    value={editingNpc.motivation || ''}
                    onChange={(e) => setEditingNpc({ ...editingNpc, motivation: e.target.value })}
                    className="w-full bg-[#18192a] border border-zinc-700 rounded-lg px-3 py-1.5 text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-rose-300">Medos & Fraquezas</label>
                  <input
                    type="text"
                    value={editingNpc.fears || ''}
                    onChange={(e) => setEditingNpc({ ...editingNpc, fears: e.target.value })}
                    className="w-full bg-[#18192a] border border-zinc-700 rounded-lg px-3 py-1.5 text-white"
                  />
                </div>
              </div>

              <div className="space-y-1 p-3 rounded-lg bg-[#111220] border border-purple-900/40">
                <label className="font-bold text-purple-300 flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5" /> Anotações Secretas do Mestre (Confidencial)
                </label>
                <textarea
                  rows={2}
                  value={editingNpc.secretNotes}
                  onChange={(e) => setEditingNpc({ ...editingNpc, secretNotes: e.target.value })}
                  placeholder="Segredos que os jogadores ainda não sabem..."
                  className="w-full bg-[#18192a] border border-zinc-700 rounded-lg px-3 py-1.5 text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300">URL do Avatar</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={editingNpc.avatarUrl}
                    onChange={(e) => setEditingNpc({ ...editingNpc, avatarUrl: e.target.value })}
                    className="flex-1 bg-[#18192a] border border-zinc-700 rounded-lg px-3 py-1.5 text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setIsImageModalOpen(true)}
                    className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-slate-200 font-bold flex items-center gap-1"
                  >
                    <Camera className="w-3.5 h-3.5" /> Foto
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-slate-300 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => handleSaveNpc(editingNpc)}
                className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Save className="w-3.5 h-3.5" /> Salvar NPC
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Upload Modal */}
      {isImageModalOpen && editingNpc && (
        <ImageUploadModal
          isOpen={isImageModalOpen}
          title="Alterar Imagem do NPC"
          currentImageUrl={editingNpc.avatarUrl}
          defaultFallbackUrl="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300"
          onClose={() => setIsImageModalOpen(false)}
          onSave={(url) => {
            setEditingNpc({ ...editingNpc, avatarUrl: url });
            setIsImageModalOpen(false);
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteTargetId && (
        <ConfirmDeleteModal
          isOpen={!!deleteTargetId}
          entityType="NPC"
          entityName={npcs.find((n) => n.id === deleteTargetId)?.name || 'NPC'}
          details="Esta ação removerá este personagem do mundo da campanha."
          onClose={() => setDeleteTargetId(null)}
          onConfirm={() => handleDeleteNpc(deleteTargetId)}
        />
      )}
    </div>
  );
};
