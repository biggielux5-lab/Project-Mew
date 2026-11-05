/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { PokedexSpecies, PokemonMove, CampaignPokedexEntry } from '../types';
import { storageService, calculatePokemonMaxHp, calculatePokemonMaxPe } from '../services/storageService';
import { POKEMON_TYPES, TYPE_COLORS, DiceRank, PokemonType } from '../data/rulesData';
import { useAuth } from '../context/AuthContext';
import {
  Search,
  Filter,
  Sparkles,
  BookOpen,
  Plus,
  ArrowRight,
  Shield,
  Zap,
  Heart,
  ChevronRight,
  X,
  ExternalLink,
  Info,
  Check,
  Edit2,
  Trash2,
  Eye,
  Compass,
  Award,
  HelpCircle,
  MapPin,
  User,
  CheckCircle2,
} from 'lucide-react';

interface PokedexViewProps {
  onSelectSpeciesForCreation: (species: PokedexSpecies) => void;
}

export const PokedexView: React.FC<PokedexViewProps> = ({ onSelectSpeciesForCreation }) => {
  const { isGM, activeCampaign } = useAuth();
  const [speciesList, setSpeciesList] = useState<PokedexSpecies[]>(() =>
    storageService.getPokedexSpecies()
  );

  const [pokedexMode, setPokedexMode] = useState<'compendium' | 'campaign'>('compendium');
  const [statusFilter, setStatusFilter] = useState<'all' | 'desconhecido' | 'avistado' | 'capturado' | 'conhecido'>('all');

  const [campaignPokedex, setCampaignPokedex] = useState<Record<number, CampaignPokedexEntry>>(() =>
    activeCampaign ? storageService.getCampaignPokedex(activeCampaign.id) : {}
  );

  useEffect(() => {
    if (activeCampaign) {
      setCampaignPokedex(storageService.getCampaignPokedex(activeCampaign.id));
    }
  }, [activeCampaign]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedRarity, setSelectedRarity] = useState<string>('all');
  const [selectedGen, setSelectedGen] = useState<string>('all');
  const [selectedHabitat, setSelectedHabitat] = useState<string>('all');

  // Detail Modal
  const [detailSpecies, setDetailSpecies] = useState<PokedexSpecies | null>(null);

  // New / Edit Species Modal
  const [isSpeciesModalOpen, setIsSpeciesModalOpen] = useState(false);
  const [editingSpecies, setEditingSpecies] = useState<PokedexSpecies | null>(null);

  const habitats = useMemo(() => {
    const set = new Set<string>();
    speciesList.forEach((s) => {
      if (s.habitat) set.add(s.habitat);
    });
    return Array.from(set).sort();
  }, [speciesList]);

  const rarities = ['Comum', 'Incomum', 'Raro', 'Muito raro', 'Lendário'];

  const filteredSpecies = useMemo(() => {
    return speciesList.filter((sp) => {
      const q = searchQuery.toLowerCase().trim();
      const numStr = String(sp.dexNumber);
      const padNum = `#${numStr.padStart(3, '0')}`;
      const matchesQuery =
        !q ||
        sp.name.toLowerCase().includes(q) ||
        padNum.toLowerCase().includes(q) ||
        numStr.includes(q) ||
        sp.types.some((t) => t.toLowerCase().includes(q));

      const matchesType =
        selectedType === 'all' || sp.types.includes(selectedType as PokemonType);

      const matchesRarity =
        selectedRarity === 'all' || sp.rarity === selectedRarity;

      const matchesGen =
        selectedGen === 'all' || sp.generation.toString() === selectedGen;

      const matchesHabitat =
        selectedHabitat === 'all' || sp.habitat === selectedHabitat;

      return matchesQuery && matchesType && matchesRarity && matchesGen && matchesHabitat;
    });
  }, [speciesList, searchQuery, selectedType, selectedRarity, selectedGen, selectedHabitat]);

  const handleSaveSpecies = (species: PokedexSpecies) => {
    storageService.savePokedexSpecies(species);
    setSpeciesList(storageService.getPokedexSpecies());
    setIsSpeciesModalOpen(false);
    setEditingSpecies(null);
    if (detailSpecies?.id === species.id) {
      setDetailSpecies(species);
    }
  };

  const handleUpdateDiscovery = (
    dexNumber: number,
    status: CampaignPokedexEntry['status'],
    seenAtLocation?: string,
    caughtByTrainerName?: string
  ) => {
    if (!activeCampaign) return;
    const current = campaignPokedex[dexNumber];
    const updated = storageService.updateCampaignPokedexEntry(activeCampaign.id, dexNumber, {
      status,
      seenAtLocation: seenAtLocation !== undefined ? seenAtLocation : current?.seenAtLocation,
      caughtByTrainerName: caughtByTrainerName !== undefined ? caughtByTrainerName : current?.caughtByTrainerName,
    });
    setCampaignPokedex((prev) => ({
      ...prev,
      [dexNumber]: updated,
    }));
  };

  // Kanto species (1-151) for the campaign discovery dex
  const kantoSpecies = useMemo(() => {
    return speciesList
      .filter((s) => s.dexNumber >= 1 && s.dexNumber <= 151)
      .sort((a, b) => a.dexNumber - b.dexNumber);
  }, [speciesList]);

  const discoveryStats = useMemo(() => {
    let seen = 0;
    let caught = 0;
    kantoSpecies.forEach((sp) => {
      const entry = campaignPokedex[sp.dexNumber];
      if (entry?.status === 'avistado') seen++;
      else if (entry?.status === 'capturado' || entry?.status === 'conhecido') caught++;
    });
    return {
      total: 151,
      seen,
      caught,
      unknown: 151 - (seen + caught),
    };
  }, [kantoSpecies, campaignPokedex]);

  const filteredCampaignSpecies = useMemo(() => {
    return kantoSpecies.filter((sp) => {
      const q = searchQuery.toLowerCase().trim();
      const numStr = String(sp.dexNumber);
      const matchesQuery = !q || sp.name.toLowerCase().includes(q) || numStr.includes(q);
      if (!matchesQuery) return false;

      const entry = campaignPokedex[sp.dexNumber];
      const status = entry?.status || 'desconhecido';
      if (statusFilter !== 'all') {
        if (statusFilter === 'desconhecido' && status !== 'desconhecido') return false;
        if (statusFilter === 'avistado' && status !== 'avistado') return false;
        if ((statusFilter === 'capturado' || statusFilter === 'conhecido') && status !== 'capturado' && status !== 'conhecido') return false;
      }
      return true;
    });
  }, [kantoSpecies, campaignPokedex, searchQuery, statusFilter]);

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 rounded-2xl bg-[#141522] border border-purple-900/30">
        <div>
          <div className="flex items-center gap-2.5 text-purple-400 font-mono text-xs uppercase tracking-wider font-bold">
            <BookOpen className="w-4 h-4" />
            <span>Compêndio de Espécies • Além da Próxima Rota</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Pokédex Nacional (Gerações 1 a 3)
          </h1>
          <p className="text-slate-400 text-sm mt-1 max-w-2xl">
            Catálogo com atributos originais do sistema (Corpo, Instinto e Energia), características naturais, requisitos de evolução (PEV) e árvores de movimentos organizadas por círculos de poder.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setEditingSpecies(null);
              setIsSpeciesModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-purple-600/90 hover:bg-purple-600 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-purple-950/50 transition-all cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Cadastrar Espécie</span>
          </button>
        </div>
      </div>

      {/* Mode Switcher */}
      <div className="flex border-b border-zinc-800 gap-2">
        <button
          onClick={() => setPokedexMode('compendium')}
          className={`px-4 py-2.5 rounded-t-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${
            pokedexMode === 'compendium'
              ? 'bg-[#151726] text-purple-300 border-t-2 border-purple-500 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Compêndio Nacional (151 Kanto + Expansões)</span>
        </button>

        <button
          onClick={() => setPokedexMode('campaign')}
          className={`px-4 py-2.5 rounded-t-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${
            pokedexMode === 'campaign'
              ? 'bg-[#151726] text-purple-300 border-t-2 border-purple-500 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>Pokédex da Campanha (Descobertas)</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800">
            {discoveryStats.caught + discoveryStats.seen}/151
          </span>
        </button>
      </div>

      {/* MODE 1: COMPÊNDIO NACIONAL */}
      {pokedexMode === 'compendium' && (
        <>
          {/* Filter and Search Bar */}
          <div className="p-4 rounded-xl bg-[#12131d] border border-zinc-800/80 space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Pesquisar por nome ou número (ex: #025, Pikachu, Fogo)..."
                  className="w-full pl-9 pr-4 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Quick Clear */}
              {(selectedType !== 'all' || selectedRarity !== 'all' || selectedGen !== 'all' || selectedHabitat !== 'all') && (
                <button
                  onClick={() => {
                    setSelectedType('all');
                    setSelectedRarity('all');
                    setSelectedGen('all');
                    setSelectedHabitat('all');
                  }}
                  className="px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Limpar Filtros</span>
                </button>
              )}
            </div>

            {/* Filter Dropdowns / Chips */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-zinc-800/60">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                  Geração
                </label>
                <select
                  value={selectedGen}
                  onChange={(e) => setSelectedGen(e.target.value)}
                  className="w-full py-1.5 px-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                >
                  <option value="all">Todas as Gerações</option>
                  <option value="1">Geração 1 (Kanto)</option>
                  <option value="2">Geração 2 (Johto)</option>
                  <option value="3">Geração 3 (Hoenn)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                  Tipo Elemental
                </label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full py-1.5 px-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                >
                  <option value="all">Todos os Tipos</option>
                  {POKEMON_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                  Raridade no RPG
                </label>
                <select
                  value={selectedRarity}
                  onChange={(e) => setSelectedRarity(e.target.value)}
                  className="w-full py-1.5 px-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                >
                  <option value="all">Todas as Raridades</option>
                  {rarities.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                  Habitat Comum
                </label>
                <select
                  value={selectedHabitat}
                  onChange={(e) => setSelectedHabitat(e.target.value)}
                  className="w-full py-1.5 px-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                >
                  <option value="all">Todos os Habitats</option>
                  {habitats.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Results Count & Kanto Progress Badge */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-slate-400 px-1 py-1">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-950/80 border border-purple-800/80 text-purple-300 font-mono text-xs font-bold shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Pokédex de Kanto: 151/151 espécies cadastradas
              </span>
              <span>Exibindo <strong>{filteredSpecies.length}</strong> espécies</span>
            </div>
            <span className="font-mono text-[11px] text-purple-400">Manual de Campo • Além da Próxima Rota</span>
          </div>

          {/* Species Grid */}
          {filteredSpecies.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-[#12131d] border border-zinc-800/80">
              <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-200">Nenhuma espécie encontrada</h3>
              <p className="text-sm text-slate-400 mt-1 max-w-sm mx-auto">
                Tente ajustar os filtros de busca ou cadastre uma nova espécie personalizada para a sua mesa.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredSpecies.map((sp) => {
                const padNum = `#${String(sp.dexNumber).padStart(3, '0')}`;

                return (
                  <div
                    key={sp.id}
                    onClick={() => setDetailSpecies(sp)}
                    className="group relative rounded-xl bg-[#141522] border border-zinc-800/80 hover:border-purple-500/60 transition-all p-4 flex flex-col justify-between hover:shadow-xl hover:shadow-purple-950/20 cursor-pointer overflow-hidden"
                  >
                    {/* Background glow */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/5 rounded-full blur-2xl group-hover:bg-purple-600/10 pointer-events-none transition-all" />

                    <div>
                      {/* Top Bar: Number & Rarity */}
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-mono font-bold text-purple-400 tracking-wider">
                          {padNum}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            sp.rarity === 'Lendário'
                              ? 'bg-amber-950/90 text-amber-300 border border-amber-700/50'
                              : sp.rarity === 'Muito raro'
                              ? 'bg-red-950/80 text-red-300 border border-red-800/40'
                              : sp.rarity === 'Raro'
                              ? 'bg-purple-950/80 text-purple-300 border border-purple-800/40'
                              : 'bg-zinc-800 text-slate-400'
                          }`}
                        >
                          {sp.rarity}
                        </span>
                      </div>

                      {/* Artwork / Sprite */}
                      <div className="w-full h-36 flex items-center justify-center p-2 relative">
                        <img
                          src={sp.spriteUrl}
                          alt={sp.name}
                          className="max-h-full max-w-full object-contain filter drop-shadow-md group-hover:scale-105 transition-transform duration-200"
                          loading="lazy"
                        />
                      </div>

                      {/* Name and Types */}
                      <div className="mt-2 text-center">
                        <h3 className="text-base font-extrabold text-white group-hover:text-purple-300 transition-colors">
                          {sp.name}
                        </h3>
                        <div className="flex items-center justify-center gap-1.5 mt-1.5 flex-wrap">
                          {sp.types.map((type) => {
                            const style = TYPE_COLORS[type] || { bg: 'bg-zinc-700', text: 'text-white', border: 'border-zinc-500' };
                            return (
                              <span
                                key={type}
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${style.bg} ${style.text} ${style.border}`}
                              >
                                {type}
                              </span>
                            );
                          })}
                        </div>
                      </div>

                      {/* Short RPG Attribute Badge */}
                      <div className="mt-3 grid grid-cols-3 gap-1.5 py-1.5 px-2 rounded-lg bg-zinc-900/80 border border-zinc-800 text-center">
                        <div>
                          <div className="text-[9px] uppercase font-bold text-slate-500">Corpo</div>
                          <div className="text-xs font-mono font-bold text-rose-300">{sp.baseAttributes.corpo}</div>
                        </div>
                        <div>
                          <div className="text-[9px] uppercase font-bold text-slate-500">Instinto</div>
                          <div className="text-xs font-mono font-bold text-amber-300">{sp.baseAttributes.instinto}</div>
                        </div>
                        <div>
                          <div className="text-[9px] uppercase font-bold text-slate-500">Energia</div>
                          <div className="text-xs font-mono font-bold text-cyan-300">{sp.baseAttributes.energia}</div>
                        </div>
                      </div>
                    </div>

                    {/* Footer action */}
                    <div className="mt-4 pt-3 border-t border-zinc-800/70 flex items-center justify-between text-xs text-slate-400">
                      <span className="truncate text-[11px] text-slate-500">{sp.habitat}</span>
                      <span className="text-purple-400 group-hover:text-purple-300 font-semibold flex items-center gap-1 shrink-0">
                        Detalhes <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* MODE 2: POKÉDEX DA CAMPANHA (DESCOBERTA & AVISTAMENTOS) */}
      {pokedexMode === 'campaign' && (
        <div className="space-y-6">
          {/* Discovery Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-xl bg-[#141525] border border-purple-900/30">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Total Kanto
              </span>
              <div className="text-2xl font-mono font-black text-white mt-1">151</div>
              <p className="text-[11px] text-slate-500 mt-0.5">Espécies nativas da região</p>
            </div>

            <div className="p-4 rounded-xl bg-[#141525] border border-emerald-900/30">
              <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Capturados
              </span>
              <div className="text-2xl font-mono font-black text-emerald-300 mt-1">
                {discoveryStats.caught}
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {Math.round((discoveryStats.caught / 151) * 100)}% do catálogo
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#141525] border border-amber-900/30">
              <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" /> Avistados
              </span>
              <div className="text-2xl font-mono font-black text-amber-300 mt-1">
                {discoveryStats.seen}
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">Identificados em campo</p>
            </div>

            <div className="p-4 rounded-xl bg-[#141525] border border-zinc-800">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <HelpCircle className="w-3.5 h-3.5" /> Não Descobertos
              </span>
              <div className="text-2xl font-mono font-black text-slate-300 mt-1">
                {discoveryStats.unknown}
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">Ainda por encontrar</p>
            </div>
          </div>

          {/* Discovery Filter and Search Bar */}
          <div className="p-4 rounded-xl bg-[#12131d] border border-zinc-800/80 space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Pesquisar por espécie ou número da Pokédex..."
                  className="w-full pl-9 pr-4 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Status Filters */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {(['all', 'desconhecido', 'avistado', 'capturado'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      statusFilter === st
                        ? 'bg-purple-600 text-white shadow-md'
                        : 'bg-zinc-900 hover:bg-zinc-800 text-slate-400 hover:text-slate-200 border border-zinc-800'
                    }`}
                  >
                    {st === 'all'
                      ? 'Todos (151)'
                      : st === 'desconhecido'
                      ? `Não Descobertos (${discoveryStats.unknown})`
                      : st === 'avistado'
                      ? `Avistados (${discoveryStats.seen})`
                      : `Capturados (${discoveryStats.caught})`}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Campaign Discovery Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredCampaignSpecies.map((sp) => {
              const padNum = `#${String(sp.dexNumber).padStart(3, '0')}`;
              const entry = campaignPokedex[sp.dexNumber];
              const status: CampaignPokedexEntry['status'] = entry?.status || 'desconhecido';
              const isUnknown = status === 'desconhecido';
              const isSeen = status === 'avistado';
              const isCaught = status === 'capturado' || status === 'conhecido';

              return (
                <div
                  key={sp.id}
                  className={`relative rounded-xl border p-4 flex flex-col justify-between transition-all overflow-hidden ${
                    isCaught
                      ? 'bg-[#121820] border-emerald-900/60 shadow-lg shadow-emerald-950/20'
                      : isSeen
                      ? 'bg-[#1a1715] border-amber-900/50'
                      : 'bg-[#0f101a] border-zinc-900 opacity-80'
                  }`}
                >
                  <div>
                    {/* Top Bar: Number & Status Badge */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-mono font-bold text-purple-400 tracking-wider">
                        {padNum}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isCaught
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : isSeen
                            ? 'bg-amber-950 text-amber-300 border border-amber-800'
                            : 'bg-zinc-800 text-zinc-500'
                        }`}
                      >
                        {isCaught ? 'Capturado' : isSeen ? 'Avistado' : 'Não Descoberto'}
                      </span>
                    </div>

                    {/* Sprite Artwork */}
                    <div className="w-full h-32 flex items-center justify-center p-2 relative">
                      <img
                        src={sp.spriteUrl}
                        alt={sp.name}
                        className={`max-h-full max-w-full object-contain filter transition-all ${
                          isUnknown ? 'brightness-0 opacity-20' : 'drop-shadow-md'
                        }`}
                        loading="lazy"
                      />
                    </div>

                    {/* Name */}
                    <div className="mt-2 text-center">
                      <h3
                        onClick={() => setDetailSpecies(sp)}
                        className="text-base font-extrabold text-white hover:text-purple-300 transition-colors cursor-pointer"
                      >
                        {isUnknown ? '???' : sp.name}
                      </h3>
                      {!isUnknown && (
                        <div className="flex items-center justify-center gap-1 mt-1 flex-wrap">
                          {sp.types.map((type) => {
                            const style = TYPE_COLORS[type] || { bg: 'bg-zinc-700', text: 'text-white' };
                            return (
                              <span
                                key={type}
                                className={`text-[9px] font-bold px-2 py-0.2 rounded-full ${style.bg} ${style.text}`}
                              >
                                {type}
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Location seen / Caught info */}
                    {!isUnknown && (
                      <div className="mt-2.5 pt-2 border-t border-zinc-800/60 text-[10px] text-slate-400 space-y-1">
                        {entry?.seenAtLocation && (
                          <div className="flex items-center gap-1 text-slate-300">
                            <MapPin className="w-3 h-3 text-purple-400 shrink-0" />
                            <span className="truncate">Local: {entry.seenAtLocation}</span>
                          </div>
                        )}
                        {entry?.caughtByTrainerName && (
                          <div className="flex items-center gap-1 text-emerald-300">
                            <User className="w-3 h-3 text-emerald-400 shrink-0" />
                            <span className="truncate">Por: {entry.caughtByTrainerName}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Quick Action Controls */}
                  <div className="mt-3 pt-2.5 border-t border-zinc-800/70 flex items-center justify-between gap-1">
                    <select
                      value={status}
                      onChange={(e) =>
                        handleUpdateDiscovery(sp.dexNumber, e.target.value as any)
                      }
                      className="bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-[11px] text-slate-300 font-semibold focus:outline-none focus:border-purple-500 cursor-pointer"
                    >
                      <option value="desconhecido">Não Descoberto</option>
                      <option value="avistado">Avistado</option>
                      <option value="capturado">Capturado</option>
                    </select>

                    <button
                      onClick={() => setDetailSpecies(sp)}
                      className="text-purple-400 hover:text-purple-300 text-xs font-semibold px-2 py-1 rounded bg-zinc-900/60 hover:bg-zinc-800"
                    >
                      Ficha
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* DETAIL MODAL */}
      {detailSpecies && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-4xl bg-[#12131d] border border-purple-900/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            {/* Header */}
            <div className="p-5 border-b border-purple-900/30 bg-[#161726] flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-purple-950/40 border border-purple-500/30 flex items-center justify-center p-1 overflow-hidden shrink-0">
                  <img
                    src={detailSpecies.spriteUrl}
                    alt={detailSpecies.name}
                    className="w-full h-full object-contain filter drop-shadow"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-purple-400">
                      #{String(detailSpecies.dexNumber).padStart(3, '0')}
                    </span>
                    <h2 className="text-xl font-extrabold text-white">{detailSpecies.name}</h2>
                    <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-zinc-800 text-slate-300">
                      Geração {detailSpecies.generation}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-purple-950 text-purple-300 border border-purple-800">
                      {detailSpecies.rarity}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    {detailSpecies.types.map((type) => {
                      const style = TYPE_COLORS[type] || { bg: 'bg-zinc-700', text: 'text-white', border: 'border-zinc-500' };
                      return (
                        <span
                          key={type}
                          className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${style.bg} ${style.text} ${style.border}`}
                        >
                          {type}
                        </span>
                      );
                    })}
                    <span className="text-xs text-slate-400">
                      • Habitat: <strong>{detailSpecies.habitat}</strong>
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setDetailSpecies(null)}
                  className="p-2 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-slate-400 hover:text-white transition-all"
                  title="Fechar"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
              {/* Lore / Description */}
              <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 text-slate-300 text-sm leading-relaxed italic">
                "{detailSpecies.description}"
              </div>

              {/* Base RPG Attributes */}
              <div>
                <h4 className="text-xs uppercase font-extrabold text-slate-400 tracking-wider mb-2.5">
                  Atributos-Base no RPG (Além da Próxima Rota)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-[#161726] border border-rose-950/40 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] uppercase font-bold text-rose-400">Corpo</div>
                      <div className="text-xs text-slate-400">Força física e vitalidade</div>
                    </div>
                    <div className="text-2xl font-mono font-extrabold text-rose-300">
                      {detailSpecies.baseAttributes.corpo}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#161726] border border-amber-950/40 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] uppercase font-bold text-amber-400">Instinto</div>
                      <div className="text-xs text-slate-400">Prontidão, sentidos e reação</div>
                    </div>
                    <div className="text-2xl font-mono font-extrabold text-amber-300">
                      {detailSpecies.baseAttributes.instinto}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#161726] border border-cyan-950/40 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] uppercase font-bold text-cyan-400">Energia</div>
                      <div className="text-xs text-slate-400">Potência especial e reserva</div>
                    </div>
                    <div className="text-2xl font-mono font-extrabold text-cyan-300">
                      {detailSpecies.baseAttributes.energia}
                    </div>
                  </div>
                </div>

                <div className="mt-2 text-xs text-slate-400 bg-zinc-900/40 p-2.5 rounded-lg border border-zinc-800/60 flex items-center justify-between">
                  <span>
                    Valores iniciais no Nível 1: PV <strong>{calculatePokemonMaxHp(detailSpecies.baseAttributes.corpo, 1, 0)}</strong> • PE <strong>{calculatePokemonMaxPe(1, 0)}</strong> • CA <strong>11</strong>
                  </span>
                  <span className="text-[11px] text-purple-400">Cálculo automatizado</span>
                </div>
              </div>

              {/* Natural Traits */}
              <div>
                <h4 className="text-xs uppercase font-extrabold text-slate-400 tracking-wider mb-2">
                  Características Naturais da Espécie
                </h4>
                <div className="space-y-2">
                  {detailSpecies.naturalTraits.map((trait, i) => (
                    <div key={i} className="p-4 rounded-xl bg-[#161726] border border-purple-900/30">
                      <div className="text-sm font-bold text-purple-300 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-purple-400" />
                        {trait.name}
                      </div>
                      <div className="text-xs text-slate-300 mt-1 leading-relaxed">
                        {trait.effect}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Evolutions & PEV requirements */}
              {detailSpecies.evolutions && detailSpecies.evolutions.length > 0 && (
                <div>
                  <h4 className="text-xs uppercase font-extrabold text-slate-400 tracking-wider mb-2">
                    Linha Evolutiva & Requisitos (PEV)
                  </h4>
                  <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 space-y-2">
                    {detailSpecies.evolutions.map((evo, i) => (
                      <div key={i} className="flex items-center gap-3 text-sm">
                        <ArrowRight className="w-4 h-4 text-purple-400 shrink-0" />
                        <span className="font-bold text-white">{evo.targetSpeciesName}</span>
                        <span className="text-xs px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800 font-mono">
                          PEV {evo.costPev}
                        </span>
                        {evo.reqDescription && (
                          <span className="text-xs text-slate-400 italic">
                            ({evo.reqDescription})
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Learnable Moves */}
              <div>
                <h4 className="text-xs uppercase font-extrabold text-slate-400 tracking-wider mb-2">
                  Movimentos Disponíveis ({detailSpecies.learnableMoves.length})
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {detailSpecies.learnableMoves.map((mv) => {
                    const style = TYPE_COLORS[mv.type] || { bg: 'bg-zinc-700', text: 'text-white', border: 'border-zinc-500' };
                    return (
                      <div
                        key={mv.id}
                        className="p-3 rounded-xl bg-[#141522] border border-zinc-800/80 hover:border-zinc-700 transition-all space-y-2"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="text-sm font-bold text-white">{mv.name}</div>
                            <div className="flex items-center gap-1.5 mt-1">
                              <span
                                className={`text-[10px] font-bold px-2 py-0.2 rounded-full border ${style.bg} ${style.text} ${style.border}`}
                              >
                                {mv.type}
                              </span>
                              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-800 text-slate-300">
                                {mv.category}
                              </span>
                              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-purple-950 text-purple-300">
                                {mv.tier}
                              </span>
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="text-xs font-mono font-bold text-purple-300">
                              {mv.damageDice}
                            </div>
                            <div className="text-[10px] font-mono text-cyan-400">
                              {mv.peCost} PE
                            </div>
                          </div>
                        </div>

                        <div className="text-xs text-slate-300 leading-snug">
                          {mv.effect}
                        </div>

                        {mv.resistance && (
                          <div className="text-[10px] text-amber-300 bg-amber-950/30 px-2 py-1 rounded border border-amber-900/40">
                            Resistência: {mv.resistance}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 border-t border-purple-900/30 bg-[#161726] flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isGM && (
                  <button
                    onClick={() => {
                      setEditingSpecies(detailSpecies);
                      setIsSpeciesModalOpen(true);
                    }}
                    className="px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-slate-300 font-bold text-xs flex items-center gap-1.5"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Editar Espécie</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setDetailSpecies(null)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-slate-300 font-bold text-xs"
                >
                  Fechar
                </button>
                <button
                  onClick={() => {
                    const sp = detailSpecies;
                    setDetailSpecies(null);
                    onSelectSpeciesForCreation(sp);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-purple-950/60 cursor-pointer active:scale-95 transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Criar Pokémon desta Espécie</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT SPECIES MODAL */}
      {isSpeciesModalOpen && (
        <SpeciesFormModal
          isOpen={isSpeciesModalOpen}
          initialSpecies={editingSpecies}
          onClose={() => {
            setIsSpeciesModalOpen(false);
            setEditingSpecies(null);
          }}
          onSave={handleSaveSpecies}
        />
      )}
    </div>
  );
};

// Form modal for registering new species into the compendium
interface SpeciesFormModalProps {
  isOpen: boolean;
  initialSpecies: PokedexSpecies | null;
  onClose: () => void;
  onSave: (species: PokedexSpecies) => void;
}

const SpeciesFormModal: React.FC<SpeciesFormModalProps> = ({
  isOpen,
  initialSpecies,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<PokedexSpecies>(() => {
    if (initialSpecies) return { ...initialSpecies };
    return {
      id: 'sp_custom_' + Date.now().toString(36),
      dexNumber: 0,
      name: '',
      generation: 1,
      types: ['Normal'],
      rarity: 'Comum',
      habitat: 'Florestas e Pradarias',
      description: '',
      spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png',
      baseAttributes: {
        corpo: 'd6',
        instinto: 'd6',
        energia: 'd6',
      },
      suggestedSkills: {
        'Ataque Físico': 'd6',
        Agilidade: 'd6',
        Percepção: 'd6',
      },
      naturalTraits: [
        {
          name: 'Sentidos Aguçados',
          effect: 'Recebe bônus em testes de Percepção para notar aproximação de perigos.',
        },
      ],
      learnableMoves: [
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
      evolutions: [],
      custom: true,
    };
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#12131d] border border-purple-900/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-5 border-b border-purple-900/30 bg-[#161726] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-purple-400" />
            <h3 className="text-base font-extrabold text-white">
              {initialSpecies ? 'Editar Espécie' : 'Cadastrar Nova Espécie no Compêndio'}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                Nome da Espécie *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Lucario, Scizor, etc."
                className="w-full py-2 px-3 rounded-lg bg-zinc-900 border border-zinc-800 text-sm text-slate-100 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                Número na Pokédex (ex: 25) *
              </label>
              <input
                type="number"
                value={formData.dexNumber}
                onChange={(e) => setFormData({ ...formData, dexNumber: Number(e.target.value) })}
                className="w-full py-2 px-3 rounded-lg bg-zinc-900 border border-zinc-800 text-sm font-mono text-slate-100 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                Geração
              </label>
              <select
                value={formData.generation}
                onChange={(e) => setFormData({ ...formData, generation: Number(e.target.value) as 1 | 2 | 3 })}
                className="w-full py-2 px-3 rounded-lg bg-zinc-900 border border-zinc-800 text-sm text-slate-100"
              >
                <option value={1}>Geração 1</option>
                <option value={2}>Geração 2</option>
                <option value={3}>Geração 3</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                Raridade
              </label>
              <select
                value={formData.rarity}
                onChange={(e) => setFormData({ ...formData, rarity: e.target.value as any })}
                className="w-full py-2 px-3 rounded-lg bg-zinc-900 border border-zinc-800 text-sm text-slate-100"
              >
                <option value="Comum">Comum</option>
                <option value="Incomum">Incomum</option>
                <option value="Raro">Raro</option>
                <option value="Muito raro">Muito raro</option>
                <option value="Lendário">Lendário</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                Habitat
              </label>
              <input
                type="text"
                value={formData.habitat}
                onChange={(e) => setFormData({ ...formData, habitat: e.target.value })}
                placeholder="Ex: Montanhas e Cavernas"
                className="w-full py-2 px-3 rounded-lg bg-zinc-900 border border-zinc-800 text-sm text-slate-100"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
              URL da Imagem / Sprite Oficial
            </label>
            <input
              type="text"
              value={formData.spriteUrl}
              onChange={(e) => setFormData({ ...formData, spriteUrl: e.target.value })}
              placeholder="https://..."
              className="w-full py-2 px-3 rounded-lg bg-zinc-900 border border-zinc-800 text-sm text-slate-100"
            />
          </div>

          {/* Types Selection */}
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
              Tipos Elementais (Até 2)
            </label>
            <div className="flex flex-wrap gap-1.5 p-2 rounded-lg bg-zinc-900/60 border border-zinc-800">
              {POKEMON_TYPES.map((t) => {
                const isSelected = formData.types.includes(t);
                const style = TYPE_COLORS[t] || { bg: 'bg-zinc-700', text: 'text-white', border: 'border-zinc-500' };
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        if (formData.types.length > 1) {
                          setFormData({
                            ...formData,
                            types: [formData.types[0] === t ? formData.types[1]! : formData.types[0]!],
                          });
                        }
                      } else {
                        if (formData.types.length === 1) {
                          setFormData({
                            ...formData,
                            types: [formData.types[0], t],
                          });
                        }
                      }
                    }}
                    className={`px-2.5 py-1 rounded text-xs font-bold transition-all border ${
                      isSelected
                        ? `${style.bg} ${style.text} ${style.border} ring-2 ring-purple-400`
                        : 'text-slate-400 bg-zinc-800/80 border-zinc-700 hover:bg-zinc-700'
                    }`}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Base RPG Attributes */}
          <div className="p-4 rounded-xl bg-[#161726] border border-purple-900/30 space-y-3">
            <h4 className="text-xs uppercase font-extrabold text-purple-300 tracking-wider">
              Atributos-Base do RPG (d4 a d12)
            </h4>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] uppercase font-bold text-rose-400 block mb-1">
                  Corpo
                </label>
                <select
                  value={formData.baseAttributes.corpo}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      baseAttributes: { ...formData.baseAttributes, corpo: e.target.value as DiceRank },
                    })
                  }
                  className="w-full py-1.5 px-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-sm font-mono font-bold text-rose-300"
                >
                  {['d4', 'd6', 'd8', 'd10', 'd12'].map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-amber-400 block mb-1">
                  Instinto
                </label>
                <select
                  value={formData.baseAttributes.instinto}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      baseAttributes: { ...formData.baseAttributes, instinto: e.target.value as DiceRank },
                    })
                  }
                  className="w-full py-1.5 px-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-sm font-mono font-bold text-amber-300"
                >
                  {['d4', 'd6', 'd8', 'd10', 'd12'].map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-cyan-400 block mb-1">
                  Energia
                </label>
                <select
                  value={formData.baseAttributes.energia}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      baseAttributes: { ...formData.baseAttributes, energia: e.target.value as DiceRank },
                    })
                  }
                  className="w-full py-1.5 px-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-sm font-mono font-bold text-cyan-300"
                >
                  {['d4', 'd6', 'd8', 'd10', 'd12'].map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Natural Trait */}
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
              Característica Natural Principal
            </label>
            <input
              type="text"
              value={formData.naturalTraits[0]?.name || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  naturalTraits: [
                    {
                      name: e.target.value,
                      effect: formData.naturalTraits[0]?.effect || '',
                    },
                  ],
                })
              }
              placeholder="Nome da Característica (ex: Couro Espesso)"
              className="w-full py-2 px-3 rounded-lg bg-zinc-900 border border-zinc-800 text-sm text-slate-100"
            />
            <textarea
              value={formData.naturalTraits[0]?.effect || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  naturalTraits: [
                    {
                      name: formData.naturalTraits[0]?.name || 'Característica Natural',
                      effect: e.target.value,
                    },
                  ],
                })
              }
              placeholder="Efeito e utilidade narrativa ou mecânica..."
              rows={2}
              className="w-full py-2 px-3 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-slate-200"
            />
          </div>

          {/* Lore description */}
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
              Descrição do Compêndio
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descrição ecológica e comportamental no mundo do RPG..."
              rows={3}
              className="w-full py-2 px-3 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-slate-200"
            />
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
            onClick={() => {
              if (!formData.name.trim()) {
                alert('Informe o nome da espécie.');
                return;
              }
              onSave(formData);
            }}
            className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold"
          >
            Salvar Espécie
          </button>
        </div>
      </div>
    </div>
  );
};
