/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Biblioteca Central de Movimentos do Project Mew
 * Apresenta dados oficiais dos videogames (Gens I a IX) e a escala de adaptação ao RPG Além da Próxima Rota 1.0
 * Inclui importador ao vivo e busca instantânea com a PokéAPI oficial.
 */

import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { LibraryMove, PokemonType, MoveTier, MoveCategory, MoveRange, MoveAdaptationStatus } from '../types';
import { storageService } from '../services/storageService';
import { POKEMON_TYPES, TYPE_COLORS } from '../data/rulesData';
import {
  Search,
  Filter,
  Plus,
  Trash2,
  Edit3,
  Dices,
  Sparkles,
  Zap,
  Shield,
  Swords,
  Info,
  X,
  Save,
  Globe,
  Loader2,
  CheckCircle2,
  HelpCircle,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  BookOpen,
} from 'lucide-react';
import { ConfirmDeleteModal } from '../components/ConfirmDeleteModal';

interface MoveLibraryViewProps {
  onQuickRoll?: (attrName: string, attrDice: any, skillName: string, skillDice: any) => void;
}

export const MoveLibraryView: React.FC<MoveLibraryViewProps> = ({ onQuickRoll }) => {
  const { activeCampaign, isGM } = useAuth();
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<string>('Todos');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [selectedTier, setSelectedTier] = useState<string>('Todos');
  const [selectedGen, setSelectedGen] = useState<string>('Todos');
  const [selectedStatus, setSelectedStatus] = useState<string>('Todos');
  const [page, setPage] = useState(1);
  const itemsPerPage = 20;

  // Modals state
  const [selectedMoveDetail, setSelectedMoveDetail] = useState<LibraryMove | null>(null);
  const [detailTab, setDetailTab] = useState<'rpg' | 'videogame'>('rpg');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMove, setEditingMove] = useState<LibraryMove | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // PokéAPI live search importer
  const [isPokeApiModalOpen, setIsPokeApiModalOpen] = useState(false);
  const [pokeApiQuery, setPokeApiQuery] = useState('');
  const [isFetchingPokeApi, setIsFetchingPokeApi] = useState(false);
  const [pokeApiResult, setPokeApiResult] = useState<LibraryMove | null>(null);
  const [pokeApiError, setPokeApiError] = useState<string | null>(null);
  const [pokeApiSuccessMsg, setPokeApiSuccessMsg] = useState<string | null>(null);

  // Moves list
  const [moves, setMoves] = useState<LibraryMove[]>(() =>
    storageService.getLibraryMoves(activeCampaign?.id, isGM)
  );

  const refreshMoves = () => {
    setMoves(storageService.getLibraryMoves(activeCampaign?.id, isGM));
  };

  const filteredMoves = useMemo(() => {
    return moves.filter((m) => {
      if (search) {
        const query = search.toLowerCase();
        const matchesName = m.name.toLowerCase().includes(query);
        const matchesOriginal = m.originalName?.toLowerCase().includes(query);
        const matchesEffect = m.effect.toLowerCase().includes(query);
        const matchesSpecies = m.learnableBy?.some((s) => s.toLowerCase().includes(query));
        if (!matchesName && !matchesOriginal && !matchesEffect && !matchesSpecies) return false;
      }
      if (selectedType !== 'Todos' && m.type !== selectedType) return false;
      if (selectedCategory !== 'Todos' && m.category !== selectedCategory) return false;
      if (selectedTier !== 'Todos' && m.tier !== selectedTier) return false;
      if (selectedGen !== 'Todos' && m.generation !== Number(selectedGen)) return false;
      if (selectedStatus !== 'Todos') {
        const status = m.adaptationStatus || 'approved';
        if (status !== selectedStatus) return false;
      }
      return true;
    });
  }, [moves, search, selectedType, selectedCategory, selectedTier, selectedGen, selectedStatus]);

  const totalPages = Math.ceil(filteredMoves.length / itemsPerPage) || 1;
  const paginatedMoves = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    return filteredMoves.slice(start, start + itemsPerPage);
  }, [filteredMoves, page]);

  const handleCreateMove = () => {
    const newMove: LibraryMove = {
      id: 'custom_mv_' + Date.now().toString(36),
      campaignId: activeCampaign?.id,
      name: 'Novo Golpe Customizado',
      type: 'Normal',
      category: 'Físico',
      tier: 'Comum',
      damageDice: '1d6',
      peCost: 1,
      range: 'Corpo a corpo',
      testType: 'Corpo + Ataque Físico vs Defesa',
      effect: 'Descrição do efeito em combate.',
      adaptationStatus: 'gm_adapted',
      isCustom: true,
      isGmOnly: false,
    };
    setEditingMove(newMove);
    setIsModalOpen(true);
  };

  const handleSaveModal = (move: LibraryMove) => {
    storageService.saveCustomMove(move);
    refreshMoves();
    setIsModalOpen(false);
    setEditingMove(null);
  };

  const handleDeleteMove = (id: string) => {
    storageService.deleteCustomMove(id);
    refreshMoves();
    setDeleteTargetId(null);
  };

  const handleSearchPokeApi = async () => {
    if (!pokeApiQuery.trim()) return;
    setIsFetchingPokeApi(true);
    setPokeApiError(null);
    setPokeApiSuccessMsg(null);
    setPokeApiResult(null);

    try {
      const move = await storageService.fetchMoveFromPokeApi(pokeApiQuery.trim());
      setPokeApiResult(move);
      setPokeApiSuccessMsg(`Movimento "${move.name}" carregado com sucesso da PokéAPI!`);
      refreshMoves();
    } catch (err: any) {
      setPokeApiError(err?.message || 'Falha ao buscar movimento na PokéAPI.');
    } finally {
      setIsFetchingPokeApi(false);
    }
  };

  const handleApproveSuggestedMove = (move: LibraryMove) => {
    const updated = { ...move, adaptationStatus: 'approved' as const, campaignId: activeCampaign?.id };
    storageService.saveCustomMove(updated);
    refreshMoves();
    if (selectedMoveDetail?.id === move.id) {
      setSelectedMoveDetail(updated);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-purple-400 uppercase tracking-wider mb-1">
            <Swords className="w-4 h-4" />
            Compêndio de Movimentos
          </div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            Biblioteca de Movimentos Pokémon
            <span className="text-xs px-2.5 py-0.5 rounded-full font-mono bg-purple-950 text-purple-300 border border-purple-800">
              {filteredMoves.length} golpes
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Catálogo completo combinando parâmetros oficiais dos videogames (Gens I a IX) com a escala do
            Manual de Campo (d4/0 PE a d12/4 PE) e importador direto da PokéAPI.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => {
              setPokeApiQuery('');
              setPokeApiError(null);
              setPokeApiSuccessMsg(null);
              setPokeApiResult(null);
              setIsPokeApiModalOpen(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-800/80 text-xs font-bold text-cyan-200 flex items-center gap-2 transition-colors cursor-pointer shadow-sm"
          >
            <Globe className="w-4 h-4 text-cyan-400" />
            Buscar na PokéAPI
          </button>

          {isGM && (
            <button
              onClick={handleCreateMove}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white flex items-center gap-2 transition-colors cursor-pointer shadow-lg shadow-purple-950/50"
            >
              <Plus className="w-4 h-4" />
              Criar Golpe
            </button>
          )}
        </div>
      </div>

      {/* Regra de Potência Oficial Banner */}
      <div className="p-4 rounded-xl bg-[#141525] border border-purple-900/30 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-purple-400 shrink-0" />
          <span className="font-bold text-slate-200">Escala de Potência Além da Próxima Rota 1.0:</span>
        </div>
        <div className="flex items-center gap-3 flex-wrap font-mono text-[11px]">
          <span className="px-2 py-0.5 rounded bg-zinc-800/80 text-slate-300">Básico: <strong>1d4 (0 PE)</strong></span>
          <span className="px-2 py-0.5 rounded bg-zinc-800/80 text-slate-300">Comum: <strong>1d6 (1 PE)</strong></span>
          <span className="px-2 py-0.5 rounded bg-zinc-800/80 text-slate-300">Forte: <strong>1d8 (2 PE)</strong></span>
          <span className="px-2 py-0.5 rounded bg-zinc-800/80 text-slate-300">Assinatura: <strong>1d10 (3 PE)</strong></span>
          <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-200 border border-purple-800">Supremo: <strong>1d12 (4 PE)</strong></span>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="p-4 rounded-2xl bg-[#0f101b] border border-zinc-800 space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Buscar por nome em português, nome original (inglês), efeito ou espécie que aprende..."
            className="w-full bg-[#18192a] border border-zinc-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 text-xs">
          {/* Type filter */}
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Tipo</label>
            <select
              value={selectedType}
              onChange={(e) => {
                setSelectedType(e.target.value);
                setPage(1);
              }}
              className="w-full bg-[#18192a] border border-zinc-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-purple-500"
            >
              <option value="Todos">Todos os Tipos</option>
              {POKEMON_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Category filter */}
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Categoria</label>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setPage(1);
              }}
              className="w-full bg-[#18192a] border border-zinc-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-purple-500"
            >
              <option value="Todos">Todas as Categorias</option>
              <option value="Físico">Físico</option>
              <option value="Especial">Especial</option>
              <option value="Status">Status / Suporte</option>
            </select>
          </div>

          {/* Tier filter */}
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Potência (RPG)</label>
            <select
              value={selectedTier}
              onChange={(e) => {
                setSelectedTier(e.target.value);
                setPage(1);
              }}
              className="w-full bg-[#18192a] border border-zinc-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-purple-500"
            >
              <option value="Todos">Todas as Potências</option>
              <option value="Básico">Básico (1d4, 0 PE)</option>
              <option value="Comum">Comum (1d6, 1 PE)</option>
              <option value="Forte">Forte (1d8, 2 PE)</option>
              <option value="Assinatura">Assinatura (1d10, 3 PE)</option>
              <option value="Supremo">Supremo (1d12, 4 PE)</option>
            </select>
          </div>

          {/* Gen filter */}
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Geração</label>
            <select
              value={selectedGen}
              onChange={(e) => {
                setSelectedGen(e.target.value);
                setPage(1);
              }}
              className="w-full bg-[#18192a] border border-zinc-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-purple-500"
            >
              <option value="Todos">Todas as Gerações</option>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((g) => (
                <option key={g} value={g}>
                  Geração {g}
                </option>
              ))}
            </select>
          </div>

          {/* Adaptation Status */}
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Adaptação RPG</label>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setPage(1);
              }}
              className="w-full bg-[#18192a] border border-zinc-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-purple-500"
            >
              <option value="Todos">Todos os Status</option>
              <option value="approved">Aprovados pela Campanha</option>
              <option value="suggested">Adaptação Sugerida (IA / Import)</option>
              <option value="gm_adapted">Customizado pelo Mestre</option>
            </select>
          </div>
        </div>
      </div>

      {/* Moves Grid */}
      {filteredMoves.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[#0f101b] border border-zinc-800 space-y-3">
          <BookOpen className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-white">Nenhum movimento encontrado</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Tente ajustar os filtros ou use a ferramenta "Buscar na PokéAPI" para importar novos golpes diretamente.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {paginatedMoves.map((m) => {
            const style = TYPE_COLORS[m.type];
            const isApproved = m.adaptationStatus === 'approved' || !m.adaptationStatus;

            return (
              <div
                key={m.id}
                onClick={() => {
                  setSelectedMoveDetail(m);
                  setDetailTab('rpg');
                }}
                className="p-4 rounded-xl bg-[#12131f] border border-zinc-800/80 hover:border-purple-700/60 transition-all cursor-pointer flex flex-col justify-between group shadow-sm hover:shadow-md"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-sm font-bold text-white truncate group-hover:text-purple-300 transition-colors">
                          {m.name}
                        </span>
                        {m.originalName && m.originalName !== m.name && (
                          <span className="text-[10px] text-slate-500 font-mono">
                            [{m.originalName}]
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${style?.bg || 'bg-zinc-700'} ${style?.text || 'text-white'}`}
                      >
                        {m.type}
                      </span>
                    </div>
                  </div>

                  {/* RPG Tags */}
                  <div className="flex items-center gap-2 text-[11px] font-mono mb-2 flex-wrap text-slate-300">
                    <span className="px-1.5 py-0.5 rounded bg-purple-950/70 border border-purple-900/60 text-purple-300 font-bold">
                      {m.tier} ({m.damageDice})
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-slate-300">
                      {m.peCost} PE
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-slate-400">
                      {m.category}
                    </span>
                    {m.generation && (
                      <span className="px-1.5 py-0.5 rounded bg-zinc-800/80 text-slate-500 text-[10px]">
                        Gen {m.generation}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                    {m.effect}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 mt-3 border-t border-zinc-800/80 text-[11px]">
                  <div className="flex items-center gap-2">
                    {m.vgPower !== undefined && m.vgPower !== null && (
                      <span className="text-slate-500 font-mono text-[10px]">
                        VG: {m.vgPower} Pwr / {m.vgAccuracy ?? 100}% Prec
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {m.isCustom && isGM && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingMove(m);
                          setIsModalOpen(true);
                        }}
                        className="p-1 rounded text-slate-400 hover:text-white hover:bg-zinc-800"
                        title="Editar golpe"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {m.isCustom && isGM && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteTargetId(m.id);
                        }}
                        className="p-1 rounded text-rose-400 hover:text-rose-300 hover:bg-rose-950/60"
                        title="Excluir golpe customizado"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <span className="text-[10px] text-purple-400 font-bold group-hover:translate-x-0.5 transition-transform">
                      Ver Ficha →
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-zinc-800 pt-4 text-xs">
          <span className="text-slate-400">
            Página <strong>{page}</strong> de <strong>{totalPages}</strong> ({filteredMoves.length} movimentos)
          </span>

          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center gap-1 cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Anterior
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center gap-1 cursor-pointer"
            >
              Próxima <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Move Detail Modal (RPG vs. Videogame Tabs) */}
      {selectedMoveDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-2xl bg-[#10111d] border border-purple-900/40 rounded-2xl shadow-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-zinc-800 pb-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl font-black text-white">{selectedMoveDetail.name}</h2>
                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${TYPE_COLORS[selectedMoveDetail.type]?.bg || 'bg-zinc-700'} ${TYPE_COLORS[selectedMoveDetail.type]?.text || 'text-white'}`}
                  >
                    {selectedMoveDetail.type}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-md font-mono bg-purple-950 text-purple-300 border border-purple-900">
                    {selectedMoveDetail.tier}
                  </span>
                </div>
                {selectedMoveDetail.originalName && (
                  <p className="text-xs text-slate-400 mt-1">
                    Nome Oficial (Inglês): <strong>{selectedMoveDetail.originalName}</strong>
                  </p>
                )}
              </div>

              <button
                onClick={() => setSelectedMoveDetail(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Layer Tabs */}
            <div className="flex border-b border-zinc-800 gap-4 text-xs font-bold">
              <button
                onClick={() => setDetailTab('rpg')}
                className={`pb-2 transition-colors relative cursor-pointer ${
                  detailTab === 'rpg' ? 'text-purple-300 border-b-2 border-purple-500' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                1. Adaptação RPG (Manual de Campo 1.0)
              </button>
              <button
                onClick={() => setDetailTab('videogame')}
                className={`pb-2 transition-colors relative cursor-pointer ${
                  detailTab === 'videogame' ? 'text-cyan-300 border-b-2 border-cyan-500' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                2. Dados Oficiais dos Videogames
              </button>
            </div>

            {/* Content Tab 1: RPG Adaptation */}
            {detailTab === 'rpg' && (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="p-3 rounded-xl bg-[#161726] border border-zinc-800">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Potência & Dano</span>
                    <strong className="text-sm text-purple-300 font-mono">{selectedMoveDetail.damageDice}</strong>
                    <span className="text-[10px] text-slate-500 block">({selectedMoveDetail.tier})</span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#161726] border border-zinc-800">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Custo de PE</span>
                    <strong className="text-sm text-amber-300 font-mono">{selectedMoveDetail.peCost} PE</strong>
                  </div>
                  <div className="p-3 rounded-xl bg-[#161726] border border-zinc-800">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Alcance</span>
                    <strong className="text-sm text-slate-200">{selectedMoveDetail.range}</strong>
                  </div>
                  <div className="p-3 rounded-xl bg-[#161726] border border-zinc-800">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Categoria</span>
                    <strong className="text-sm text-slate-200">{selectedMoveDetail.category}</strong>
                  </div>
                </div>

                <div className="space-y-2 p-3.5 rounded-xl bg-[#161726] border border-zinc-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Teste Mecânico do RPG
                  </span>
                  <div className="text-sm text-white font-mono bg-[#0c0d15] p-2.5 rounded-lg border border-zinc-800">
                    {selectedMoveDetail.testType || 'Corpo + Ataque Físico vs Defesa'}
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Efeito Mecânico & Regras
                  </span>
                  <p className="text-slate-200 p-3 rounded-xl bg-[#161726] border border-zinc-800 leading-relaxed">
                    {selectedMoveDetail.effect}
                  </p>
                </div>

                {selectedMoveDetail.resistance && (
                  <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-800/40 text-amber-200 text-xs">
                    <strong>Resistência do Alvo:</strong> {selectedMoveDetail.resistance}
                  </div>
                )}

                {selectedMoveDetail.narrativeDescription && (
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Descrição Narrativa
                    </span>
                    <p className="text-slate-300 italic p-3 rounded-xl bg-[#161726] border border-zinc-800">
                      "{selectedMoveDetail.narrativeDescription}"
                    </p>
                  </div>
                )}

                {/* Approval Action for GMs */}
                {isGM && selectedMoveDetail.adaptationStatus === 'suggested' && (
                  <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-800 flex items-center justify-between gap-3">
                    <div>
                      <span className="text-xs font-bold text-purple-200 block">Adaptação Sugerida</span>
                      <span className="text-[10px] text-purple-300">
                        Esta adaptação foi gerada automaticamente. Deseja aprová-la como regra oficial da campanha?
                      </span>
                    </div>
                    <button
                      onClick={() => handleApproveSuggestedMove(selectedMoveDetail)}
                      className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 font-bold text-white text-xs shrink-0 cursor-pointer"
                    >
                      Aprovar para a Campanha
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Content Tab 2: Videogame Stats */}
            {detailTab === 'videogame' && (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="p-3 rounded-xl bg-[#161726] border border-zinc-800">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Potência (Power)</span>
                    <strong className="text-sm text-cyan-300 font-mono">
                      {selectedMoveDetail.vgPower !== null && selectedMoveDetail.vgPower !== undefined
                        ? selectedMoveDetail.vgPower
                        : '—'}
                    </strong>
                  </div>
                  <div className="p-3 rounded-xl bg-[#161726] border border-zinc-800">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Precisão (Accuracy)</span>
                    <strong className="text-sm text-cyan-300 font-mono">
                      {selectedMoveDetail.vgAccuracy !== null && selectedMoveDetail.vgAccuracy !== undefined
                        ? `${selectedMoveDetail.vgAccuracy}%`
                        : '—'}
                    </strong>
                  </div>
                  <div className="p-3 rounded-xl bg-[#161726] border border-zinc-800">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">PP Original</span>
                    <strong className="text-sm text-slate-200 font-mono">{selectedMoveDetail.vgPp ?? 20}</strong>
                  </div>
                  <div className="p-3 rounded-xl bg-[#161726] border border-zinc-800">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Prioridade</span>
                    <strong className="text-sm text-slate-200 font-mono">{selectedMoveDetail.vgPriority ?? 0}</strong>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div className="p-3 rounded-xl bg-[#161726] border border-zinc-800">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Alvo nos Jogos</span>
                    <strong className="text-xs text-slate-200">{selectedMoveDetail.vgTarget || 'Um oponente'}</strong>
                  </div>
                  <div className="p-3 rounded-xl bg-[#161726] border border-zinc-800">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Introdução</span>
                    <strong className="text-xs text-slate-200">Geração {selectedMoveDetail.generation || 1}</strong>
                  </div>
                </div>

                {selectedMoveDetail.learnableBy && selectedMoveDetail.learnableBy.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Espécies que aprendem nos jogos:
                    </span>
                    <div className="flex flex-wrap gap-1.5 p-3 rounded-xl bg-[#161726] border border-zinc-800">
                      {selectedMoveDetail.learnableBy.map((sp) => (
                        <span key={sp} className="px-2 py-0.5 rounded bg-zinc-800 text-slate-300 font-medium text-[11px]">
                          {sp}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-[11px] text-slate-400">
                  <strong>Fonte dos Dados:</strong> {selectedMoveDetail.dataSource || 'PokéAPI v2 & Cartuchos Oficiais Nintendo / Game Freak'}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-zinc-800">
              <button
                onClick={() => setSelectedMoveDetail(null)}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-white cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PokéAPI Live Search & Importer Modal */}
      {isPokeApiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-[#12131f] border border-cyan-800/80 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white">Importador ao Vivo — PokéAPI</h3>
              </div>
              <button onClick={() => setIsPokeApiModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Consulte qualquer movimento oficial das Gerações I a IX pelo nome (ex: <em>hydro-pump</em>, <em>spore</em>, <em>dragon-dance</em>, <em>close-combat</em>).
            </p>

            <div className="flex gap-2">
              <input
                type="text"
                value={pokeApiQuery}
                onChange={(e) => setPokeApiQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearchPokeApi()}
                placeholder="Ex: Flamethrower, Earthquake, Volt Tackle..."
                className="flex-1 bg-[#18192a] border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
              <button
                disabled={isFetchingPokeApi || !pokeApiQuery.trim()}
                onClick={handleSearchPokeApi}
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-xs font-bold text-white flex items-center gap-1.5 cursor-pointer shadow-md shrink-0"
              >
                {isFetchingPokeApi ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                Consultar
              </button>
            </div>

            {pokeApiError && (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-300 text-xs">
                {pokeApiError}
              </div>
            )}

            {pokeApiSuccessMsg && (
              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{pokeApiSuccessMsg}</span>
              </div>
            )}

            {pokeApiResult && (
              <div className="p-4 rounded-xl bg-[#161726] border border-zinc-800 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <strong className="text-white text-sm">{pokeApiResult.name}</strong>
                  <span className="px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 font-mono text-[10px]">
                    {pokeApiResult.tier} ({pokeApiResult.damageDice}, {pokeApiResult.peCost} PE)
                  </span>
                </div>
                <p className="text-slate-300 text-xs leading-relaxed">{pokeApiResult.effect}</p>
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-zinc-800">
                  <span>VG: {pokeApiResult.vgPower ?? '—'} Pwr</span>
                  <span>Geração {pokeApiResult.generation}</span>
                  <span className="text-emerald-400 font-bold">Salvo no Catálogo Local</span>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setIsPokeApiModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-white cursor-pointer"
              >
                Concluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Move Modal (Edit / Create) */}
      {isModalOpen && editingMove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-[#12131f] border border-purple-900/40 rounded-2xl shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                {editingMove.isCustom ? 'Editar Golpe Customizado' : 'Criar Golpe Customizado'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-300">Nome do Golpe</label>
                <input
                  type="text"
                  value={editingMove.name}
                  onChange={(e) => setEditingMove({ ...editingMove, name: e.target.value })}
                  className="w-full bg-[#18192a] border border-zinc-700 rounded-lg px-3 py-1.5 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Tipo</label>
                  <select
                    value={editingMove.type}
                    onChange={(e) => setEditingMove({ ...editingMove, type: e.target.value as PokemonType })}
                    className="w-full bg-[#18192a] border border-zinc-700 rounded-lg px-3 py-1.5 text-white"
                  >
                    {POKEMON_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Categoria</label>
                  <select
                    value={editingMove.category}
                    onChange={(e) => setEditingMove({ ...editingMove, category: e.target.value as MoveCategory })}
                    className="w-full bg-[#18192a] border border-zinc-700 rounded-lg px-3 py-1.5 text-white"
                  >
                    <option value="Físico">Físico</option>
                    <option value="Especial">Especial</option>
                    <option value="Status">Status / Suporte</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Potência (Além da Próxima Rota)</label>
                  <select
                    value={editingMove.tier}
                    onChange={(e) => {
                      const tier = e.target.value as MoveTier;
                      const diceMap: Record<MoveTier, string> = {
                        Básico: '1d4',
                        Comum: '1d6',
                        Forte: '1d8',
                        Assinatura: '1d10',
                        Supremo: '1d12',
                      };
                      const peMap: Record<MoveTier, number> = {
                        Básico: 0,
                        Comum: 1,
                        Forte: 2,
                        Assinatura: 3,
                        Supremo: 4,
                      };
                      setEditingMove({
                        ...editingMove,
                        tier,
                        damageDice: diceMap[tier] || '1d6',
                        peCost: peMap[tier] ?? 1,
                      });
                    }}
                    className="w-full bg-[#18192a] border border-zinc-700 rounded-lg px-3 py-1.5 text-white"
                  >
                    <option value="Básico">Básico (1d4, 0 PE)</option>
                    <option value="Comum">Comum (1d6, 1 PE)</option>
                    <option value="Forte">Forte (1d8, 2 PE)</option>
                    <option value="Assinatura">Assinatura (1d10, 3 PE)</option>
                    <option value="Supremo">Supremo (1d12, 4 PE)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Alcance</label>
                  <select
                    value={editingMove.range}
                    onChange={(e) => setEditingMove({ ...editingMove, range: e.target.value as MoveRange })}
                    className="w-full bg-[#18192a] border border-zinc-700 rounded-lg px-3 py-1.5 text-white"
                  >
                    <option value="Corpo a corpo">Corpo a corpo</option>
                    <option value="Perto">Perto</option>
                    <option value="Médio">Médio</option>
                    <option value="Longe">Longe</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300">Fórmula de Teste</label>
                <input
                  type="text"
                  value={editingMove.testType || ''}
                  onChange={(e) => setEditingMove({ ...editingMove, testType: e.target.value })}
                  placeholder="Ex: Corpo + Ataque Físico vs Defesa"
                  className="w-full bg-[#18192a] border border-zinc-700 rounded-lg px-3 py-1.5 text-white font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300">Efeito Mecânico</label>
                <textarea
                  rows={3}
                  value={editingMove.effect}
                  onChange={(e) => setEditingMove({ ...editingMove, effect: e.target.value })}
                  placeholder="Descreva o impacto, condições provocadas ou modificadores..."
                  className="w-full bg-[#18192a] border border-zinc-700 rounded-lg px-3 py-1.5 text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300">Resistência Exigida (Opcional)</label>
                <input
                  type="text"
                  value={editingMove.resistance || ''}
                  onChange={(e) => setEditingMove({ ...editingMove, resistance: e.target.value })}
                  placeholder="Ex: Corpo + Vigor CA 12"
                  className="w-full bg-[#18192a] border border-zinc-700 rounded-lg px-3 py-1.5 text-white"
                />
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
                onClick={() => handleSaveModal(editingMove)}
                className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Save className="w-3.5 h-3.5" /> Salvar Golpe
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTargetId && (
        <ConfirmDeleteModal
          isOpen={!!deleteTargetId}
          entityType="Golpe Customizado"
          entityName={moves.find((m) => m.id === deleteTargetId)?.name || 'Golpe'}
          onClose={() => setDeleteTargetId(null)}
          onConfirm={() => deleteTargetId && handleDeleteMove(deleteTargetId)}
        />
      )}
    </div>
  );
};
