/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Módulo Completo de Inventário e Catálogo de Itens do Project Mew
 * Gerencia tanto os modelos centrais (10 categorias, incluindo os 20 itens oficiais do Manual)
 * quanto os inventários funcionais (Treinadores, Estoque Comum, Pokémon, NPCs e Lojas).
 */

import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { InventoryItem, ItemCategory, OfficialItem } from '../types';
import { storageService } from '../services/storageService';
import {
  Backpack,
  Search,
  Plus,
  Minus,
  Trash2,
  Edit3,
  ArrowRightLeft,
  Package,
  Save,
  X,
  User,
  Layers,
  Heart,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { ConfirmDeleteModal } from '../components/ConfirmDeleteModal';

export const InventoryView: React.FC = () => {
  const { activeCampaign, isGM } = useAuth();
  const [activeTab, setActiveTab] = useState<'inventory' | 'catalog'>('inventory');

  // Inventory tab filters
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('Todos');
  const [ownerFilter, setOwnerFilter] = useState<string>('Todos');

  // Catalog tab filters
  const [catalogSearch, setCatalogSearch] = useState('');
  const [catalogCategory, setCatalogCategory] = useState<string>('Todos');

  // Data
  const [items, setItems] = useState<InventoryItem[]>(() =>
    storageService.getInventoryItems(activeCampaign?.id)
  );

  const trainers = useMemo(() => {
    return storageService.getTrainers(activeCampaign?.id);
  }, [activeCampaign?.id]);

  const pokemons = useMemo(() => {
    return storageService.getPokemons(activeCampaign?.id);
  }, [activeCampaign?.id]);

  const officialCatalog = useMemo(() => {
    return storageService.getOfficialItems();
  }, []);

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [transferItem, setTransferItem] = useState<InventoryItem | null>(null);
  const [consumeItem, setConsumeItem] = useState<InventoryItem | null>(null);
  const [selectedTargetPokemonId, setSelectedTargetPokemonId] = useState<string>('');
  const [consumeFeedback, setConsumeFeedback] = useState<string | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Add from catalog modal
  const [catalogItemToAdd, setCatalogItemToAdd] = useState<OfficialItem | null>(null);
  const [targetOwnerType, setTargetOwnerType] = useState<'campaign' | 'trainer'>('campaign');
  const [targetTrainerId, setTargetTrainerId] = useState<string>('');
  const [addQuantity, setAddQuantity] = useState(1);

  const refreshItems = () => {
    setItems(storageService.getInventoryItems(activeCampaign?.id));
  };

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (search) {
        const query = search.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(query);
        const matchesEffect = item.effect.toLowerCase().includes(query);
        if (!matchesName && !matchesEffect) return false;
      }
      if (categoryFilter !== 'Todos' && item.category !== categoryFilter) return false;
      if (ownerFilter !== 'Todos') {
        if (ownerFilter === 'campaign' && item.ownerType !== 'campaign') return false;
        if (ownerFilter !== 'campaign' && item.ownerId !== ownerFilter) return false;
      }
      return true;
    });
  }, [items, search, categoryFilter, ownerFilter]);

  const filteredCatalog = useMemo(() => {
    return officialCatalog.filter((item) => {
      if (catalogSearch) {
        const query = catalogSearch.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(query);
        const matchesOriginal = item.originalName.toLowerCase().includes(query);
        const matchesDesc = item.description.toLowerCase().includes(query);
        const matchesEffect = item.rpgEffect.toLowerCase().includes(query);
        if (!matchesName && !matchesOriginal && !matchesDesc && !matchesEffect) return false;
      }
      if (catalogCategory !== 'Todos' && item.category !== catalogCategory) return false;
      return true;
    });
  }, [officialCatalog, catalogSearch, catalogCategory]);

  const handleCreateItem = () => {
    const newItem: InventoryItem = {
      id: 'inv_' + Date.now().toString(36),
      campaignId: activeCampaign?.id,
      ownerType: 'campaign',
      name: 'Novo Item Customizado',
      category: 'Equipamentos',
      quantity: 1,
      weight: '0.5 kg',
      effect: 'Descrição do efeito em jogo.',
      notes: '',
    };
    setEditingItem(newItem);
    setIsModalOpen(true);
  };

  const handleSaveItem = (item: InventoryItem) => {
    storageService.saveInventoryItem(item);
    refreshItems();
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleDeleteItem = (id: string) => {
    storageService.deleteInventoryItem(id);
    refreshItems();
    setDeleteTargetId(null);
  };

  const handleQuantityChange = (item: InventoryItem, delta: number) => {
    const newQty = item.quantity + delta;
    if (newQty <= 0) {
      setDeleteTargetId(item.id);
    } else {
      item.quantity = newQty;
      storageService.saveInventoryItem(item);
      refreshItems();
    }
  };

  const handleTransfer = (newOwnerType: 'trainer' | 'campaign', newOwnerId?: string) => {
    if (!transferItem) return;
    storageService.transferInventoryItem(transferItem.id, newOwnerType, newOwnerId);
    refreshItems();
    setTransferItem(null);
  };

  const handleExecuteConsume = () => {
    if (!consumeItem) return;
    const res = storageService.consumeInventoryItem(
      consumeItem.id,
      selectedTargetPokemonId || undefined
    );
    setConsumeFeedback(res.message);
    refreshItems();
    setTimeout(() => {
      setConsumeFeedback(null);
      setConsumeItem(null);
      setSelectedTargetPokemonId('');
    }, 2000);
  };

  const handleAddFromCatalog = () => {
    if (!catalogItemToAdd) return;

    const ownerId = targetOwnerType === 'trainer' ? targetTrainerId : undefined;
    const existing = items.find(
      (i) => i.ownerType === targetOwnerType && i.ownerId === ownerId && i.name.toLowerCase() === catalogItemToAdd.name.toLowerCase()
    );

    if (existing) {
      existing.quantity += addQuantity;
      storageService.saveInventoryItem(existing);
    } else {
      const newInv: InventoryItem = {
        id: 'inv_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
        campaignId: activeCampaign?.id,
        ownerType: targetOwnerType,
        ownerId,
        name: catalogItemToAdd.name,
        category: catalogItemToAdd.category,
        quantity: addQuantity,
        effect: catalogItemToAdd.rpgEffect,
        imageUrl: catalogItemToAdd.imageUrl,
        notes: catalogItemToAdd.isOfficialManualPrice ? 'Item Oficial (Manual 1.0)' : undefined,
      };
      storageService.saveInventoryItem(newInv);
    }

    refreshItems();
    setCatalogItemToAdd(null);
    setAddQuantity(1);
  };

  const categoriesList: ItemCategory[] = [
    'Dispositivos de Captura',
    'Medicamentos e Recuperação',
    'Cura de Condições',
    'Recuperação de Energia',
    'Bagas e Alimentos',
    'Itens de Evolução',
    'Itens de Batalha',
    'Itens de Exploração',
    'Itens Importantes e Missão',
    'Itens Personalizados',
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider mb-1">
            <Backpack className="w-4 h-4" />
            Suprimentos & Logística
          </div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            Inventário & Catálogo de Itens
            <span className="text-xs px-2.5 py-0.5 rounded-full font-mono bg-cyan-950 text-cyan-300 border border-cyan-800">
              {items.reduce((sum, i) => sum + i.quantity, 0)} itens ativos
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Gerenciamento real de inventários independentes para Treinadores, Estoque Comum da Campanha e Pokémon,
            com preservação estrita dos 20 itens oficiais do Manual de Campo.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="p-1 rounded-xl bg-[#141525] border border-zinc-800 flex gap-1">
            <button
              onClick={() => setActiveTab('inventory')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                activeTab === 'inventory' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Mochilas & Estoque
            </button>
            <button
              onClick={() => setActiveTab('catalog')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                activeTab === 'catalog' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Catálogo de Modelos ({officialCatalog.length})
            </button>
          </div>

          {activeTab === 'inventory' && (
            <button
              onClick={handleCreateItem}
              className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white flex items-center gap-1.5 cursor-pointer shadow-lg shadow-purple-950/40"
            >
              <Plus className="w-4 h-4" /> Novo Item
            </button>
          )}
        </div>
      </div>

      {/* TAB 1: ACTIVE INVENTORY VIEW */}
      {activeTab === 'inventory' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="p-4 rounded-2xl bg-[#0f101b] border border-zinc-800 flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar itens no inventário por nome ou efeito..."
                className="w-full bg-[#18192a] border border-zinc-700/80 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="flex gap-2 flex-wrap">
              <select
                value={ownerFilter}
                onChange={(e) => setOwnerFilter(e.target.value)}
                className="bg-[#18192a] border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
              >
                <option value="Todos">Todos os Detentores</option>
                <option value="campaign">Estoque Comum da Campanha</option>
                {trainers.map((t) => (
                  <option key={t.id} value={t.id}>
                    Treinador: {t.name}
                  </option>
                ))}
              </select>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-[#18192a] border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
              >
                <option value="Todos">Todas as Categorias</option>
                {categoriesList.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Items Grid */}
          {filteredItems.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-[#0f101b] border border-zinc-800 space-y-3">
              <Package className="w-10 h-10 text-slate-600 mx-auto" />
              <h3 className="text-sm font-bold text-white">Nenhum item encontrado no inventário</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Adicione itens a partir da aba "Catálogo de Modelos" ou crie um novo item personalizado.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredItems.map((item) => {
                const ownerName =
                  item.ownerType === 'campaign'
                    ? 'Estoque da Campanha'
                    : trainers.find((t) => t.id === item.ownerId)?.name || 'Detentor desconhecido';

                const isConsumable =
                  item.category.includes('Medicamento') ||
                  item.category.includes('Bagas') ||
                  item.category.includes('Cura') ||
                  item.category.includes('Energia') ||
                  item.name.toLowerCase().includes('poção') ||
                  item.name.toLowerCase().includes('antídoto');

                return (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl bg-[#12131f] border border-zinc-800/80 hover:border-zinc-700 transition-all flex flex-col justify-between group shadow-sm"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          {item.imageUrl ? (
                            <img src={item.imageUrl} alt={item.name} className="w-8 h-8 object-contain shrink-0" />
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center shrink-0">
                              <Package className="w-4 h-4 text-purple-400" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <h4 className="text-sm font-bold text-white truncate">{item.name}</h4>
                            <span className="text-[10px] text-slate-400 block truncate">{item.category}</span>
                          </div>
                        </div>

                        {/* Quantity Counter */}
                        <div className="flex items-center gap-1 bg-[#1a1b2d] border border-zinc-700/80 rounded-lg p-0.5 shrink-0">
                          <button
                            onClick={() => handleQuantityChange(item, -1)}
                            className="p-1 rounded hover:bg-zinc-700 text-slate-300 hover:text-white cursor-pointer"
                            title="Diminuir"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-mono font-bold px-1.5 text-white min-w-[20px] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleQuantityChange(item, 1)}
                            className="p-1 rounded hover:bg-zinc-700 text-slate-300 hover:text-white cursor-pointer"
                            title="Aumentar"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed mb-2">
                        {item.effect}
                      </p>

                      <div className="flex items-center gap-2 text-[10px] text-slate-400">
                        <span className="flex items-center gap-1 font-medium text-purple-300">
                          <User className="w-3 h-3" /> {ownerName}
                        </span>
                        {item.equipped && (
                          <span className="px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-900 font-bold">
                            Equipado
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 mt-3 border-t border-zinc-800 text-[11px]">
                      <div className="flex items-center gap-1">
                        {isConsumable && (
                          <button
                            onClick={() => {
                              setConsumeItem(item);
                              setSelectedTargetPokemonId(pokemons[0]?.id || '');
                            }}
                            className="px-2 py-1 rounded bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 font-bold text-[10px] flex items-center gap-1 cursor-pointer"
                          >
                            <Heart className="w-3 h-3" /> Usar
                          </button>
                        )}
                        <button
                          onClick={() => setTransferItem(item)}
                          className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-slate-200 font-bold text-[10px] flex items-center gap-1 cursor-pointer"
                        >
                          <ArrowRightLeft className="w-3 h-3" /> Transferir
                        </button>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setEditingItem(item);
                            setIsModalOpen(true);
                          }}
                          className="p-1 rounded text-slate-400 hover:text-white hover:bg-zinc-800"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteTargetId(item.id)}
                          className="p-1 rounded text-rose-400 hover:text-rose-300 hover:bg-rose-950/60"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: CENTRAL CATALOG VIEW */}
      {activeTab === 'catalog' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-[#0f101b] border border-zinc-800 flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={catalogSearch}
                onChange={(e) => setCatalogSearch(e.target.value)}
                placeholder="Pesquisar catálogo oficial por nome, efeito ou preço em PD..."
                className="w-full bg-[#18192a] border border-zinc-700/80 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <select
              value={catalogCategory}
              onChange={(e) => setCatalogCategory(e.target.value)}
              className="bg-[#18192a] border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="Todos">Todas as Categorias</option>
              {categoriesList.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredCatalog.map((catItem) => (
              <div
                key={catItem.id}
                className="p-4 rounded-xl bg-[#12131f] border border-zinc-800/80 hover:border-cyan-800/60 transition-all flex flex-col justify-between group shadow-sm"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {catItem.imageUrl ? (
                        <img src={catItem.imageUrl} alt={catItem.name} className="w-8 h-8 object-contain shrink-0" />
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center shrink-0">
                          <Package className="w-4 h-4 text-cyan-400" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-white truncate">{catItem.name}</h4>
                        <span className="text-[10px] text-slate-400 font-mono">[{catItem.originalName}]</span>
                      </div>
                    </div>

                    <span className="text-xs font-mono font-bold text-amber-300 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-900/40 shrink-0">
                      {catItem.pokedollarsPrice} PD
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed mb-2">
                    {catItem.rpgEffect}
                  </p>

                  <div className="flex items-center gap-2 text-[10px] text-slate-500 flex-wrap">
                    <span>{catItem.category}</span>
                    {catItem.isOfficialManualPrice && (
                      <span className="text-emerald-400 font-bold">Oficial Manual 1.0</span>
                    )}
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-zinc-800 flex justify-end">
                  <button
                    onClick={() => {
                      setCatalogItemToAdd(catItem);
                      setTargetTrainerId(trainers[0]?.id || '');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" /> Adicionar à Mesa
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add From Catalog Modal */}
      {catalogItemToAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm bg-[#12131f] border border-cyan-800/80 rounded-2xl shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-cyan-400" />
                Adicionar "{catalogItemToAdd.name}"
              </h3>
              <button onClick={() => setCatalogItemToAdd(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-300">Destino</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setTargetOwnerType('campaign')}
                    className={`p-2 rounded-lg border text-center font-bold cursor-pointer ${
                      targetOwnerType === 'campaign'
                        ? 'bg-purple-950 border-purple-500 text-purple-200'
                        : 'bg-[#18192a] border-zinc-800 text-slate-400'
                    }`}
                  >
                    Estoque Comum
                  </button>
                  <button
                    onClick={() => setTargetOwnerType('trainer')}
                    className={`p-2 rounded-lg border text-center font-bold cursor-pointer ${
                      targetOwnerType === 'trainer'
                        ? 'bg-purple-950 border-purple-500 text-purple-200'
                        : 'bg-[#18192a] border-zinc-800 text-slate-400'
                    }`}
                  >
                    Mochila de Treinador
                  </button>
                </div>
              </div>

              {targetOwnerType === 'trainer' && (
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Selecione o Treinador</label>
                  <select
                    value={targetTrainerId}
                    onChange={(e) => setTargetTrainerId(e.target.value)}
                    className="w-full bg-[#18192a] border border-zinc-700 rounded-lg px-3 py-1.5 text-white"
                  >
                    {trainers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="space-y-1">
                <label className="font-bold text-slate-300">Quantidade</label>
                <input
                  type="number"
                  min={1}
                  max={99}
                  value={addQuantity}
                  onChange={(e) => setAddQuantity(Math.max(1, Number(e.target.value)))}
                  className="w-full bg-[#18192a] border border-zinc-700 rounded-lg px-3 py-1.5 text-white font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
              <button
                onClick={() => setCatalogItemToAdd(null)}
                className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs text-slate-300 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddFromCatalog}
                className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-xs font-bold text-white cursor-pointer shadow-md"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Consume Item Modal */}
      {consumeItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm bg-[#12131f] border border-emerald-800/80 rounded-2xl shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Heart className="w-4 h-4 text-emerald-400" />
                Usar "{consumeItem.name}"
              </h3>
              <button onClick={() => setConsumeItem(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Selecione o Pokémon alvo para aplicar os efeitos imediatos:
            </p>

            <div className="space-y-1 text-xs">
              <label className="font-bold text-slate-300">Pokémon Alvo</label>
              <select
                value={selectedTargetPokemonId}
                onChange={(e) => setSelectedTargetPokemonId(e.target.value)}
                className="w-full bg-[#18192a] border border-zinc-700 rounded-lg px-3 py-2 text-white"
              >
                {pokemons.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nickname} ({p.species}) — {p.currentHp}/{p.maxHp} PV
                  </option>
                ))}
              </select>
            </div>

            {consumeFeedback && (
              <div className="p-3 rounded-lg bg-emerald-950/80 border border-emerald-800 text-emerald-200 text-xs">
                {consumeFeedback}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
              <button
                onClick={() => setConsumeItem(null)}
                className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs text-slate-300 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleExecuteConsume}
                className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white cursor-pointer shadow-md"
              >
                Aplicar Efeito
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transfer Item Modal */}
      {transferItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm bg-[#12131f] border border-purple-900/50 rounded-2xl shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4 text-purple-400" />
                Transferir "{transferItem.name}"
              </h3>
              <button onClick={() => setTransferItem(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Selecione o novo detentor para este item:
            </p>

            <div className="space-y-2 text-xs">
              <button
                onClick={() => handleTransfer('campaign')}
                className="w-full text-left p-2.5 rounded-lg bg-[#18192a] hover:bg-purple-950/70 border border-zinc-800 hover:border-purple-800 text-white flex items-center justify-between cursor-pointer"
              >
                <span className="font-bold">Estoque Comum da Campanha</span>
                <Layers className="w-4 h-4 text-cyan-400" />
              </button>

              {trainers.map((t) => (
                <button
                  key={t.id}
                  onClick={() => handleTransfer('trainer', t.id)}
                  className="w-full text-left p-2.5 rounded-lg bg-[#18192a] hover:bg-purple-950/70 border border-zinc-800 hover:border-purple-800 text-white flex items-center justify-between cursor-pointer"
                >
                  <span>
                    Treinador: <strong>{t.name}</strong>
                  </span>
                  <User className="w-4 h-4 text-purple-400" />
                </button>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setTransferItem(null)}
                className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs text-slate-300 cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Custom Item Modal */}
      {isModalOpen && editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-[#12131f] border border-purple-900/50 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Package className="w-4 h-4 text-purple-400" />
                {editingItem.id ? 'Editar Item' : 'Criar Novo Item'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-300">Nome do Item</label>
                <input
                  type="text"
                  value={editingItem.name}
                  onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                  className="w-full bg-[#18192a] border border-zinc-700 rounded-lg px-3 py-1.5 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Categoria</label>
                  <select
                    value={editingItem.category}
                    onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value as ItemCategory })}
                    className="w-full bg-[#18192a] border border-zinc-700 rounded-lg px-3 py-1.5 text-white"
                  >
                    {categoriesList.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Quantidade</label>
                  <input
                    type="number"
                    min={1}
                    value={editingItem.quantity}
                    onChange={(e) => setEditingItem({ ...editingItem, quantity: Math.max(1, Number(e.target.value)) })}
                    className="w-full bg-[#18192a] border border-zinc-700 rounded-lg px-3 py-1.5 text-white font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300">Efeito Mecânico no RPG</label>
                <textarea
                  rows={2}
                  value={editingItem.effect}
                  onChange={(e) => setEditingItem({ ...editingItem, effect: e.target.value })}
                  placeholder="Ex: Recupera 2d6 + 4 PV de um Pokémon ferido..."
                  className="w-full bg-[#18192a] border border-zinc-700 rounded-lg px-3 py-1.5 text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300">Notas Adicionais</label>
                <input
                  type="text"
                  value={editingItem.notes || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, notes: e.target.value })}
                  placeholder="Observações narrativas..."
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
                onClick={() => handleSaveItem(editingItem)}
                className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Save className="w-3.5 h-3.5" /> Salvar Item
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTargetId && (
        <ConfirmDeleteModal
          isOpen={!!deleteTargetId}
          entityType="Item"
          entityName={items.find((i) => i.id === deleteTargetId)?.name || 'Item'}
          onClose={() => setDeleteTargetId(null)}
          onConfirm={() => deleteTargetId && handleDeleteItem(deleteTargetId)}
        />
      )}
    </div>
  );
};
