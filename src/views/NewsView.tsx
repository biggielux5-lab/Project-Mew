/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { storageService } from '../services/storageService';
import { NewsRumor } from '../types';
import {
  Radio,
  Plus,
  Search,
  Star,
  CheckCircle,
  AlertTriangle,
  Trash2,
  Edit2,
  Calendar,
  Eye,
  EyeOff,
} from 'lucide-react';

export const NewsView: React.FC = () => {
  const { activeCampaign, isGM } = useAuth();
  const [news, setNews] = useState<NewsRumor[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [filterType, setFilterType] = useState<'all' | 'verified' | 'rumors'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showGmNotes, setShowGmNotes] = useState(false);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState<Partial<NewsRumor>>({
    title: '',
    origin: 'Rádio Oficial de Kanto',
    category: 'Liga Pokémon',
    content: '',
    location: 'Cerulean City',
    visibility: 'Público',
    reliabilityPercent: 85,
    date: '14/10/2026',
  });

  const reloadData = () => {
    if (!activeCampaign) return;
    setNews(storageService.getNewsRumors(activeCampaign.id));
  };

  useEffect(() => {
    reloadData();
  }, [activeCampaign]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCampaign || !form.title?.trim()) return;

    const record: NewsRumor = {
      id: form.id || `news_${Date.now().toString(36)}`,
      campaignId: activeCampaign.id,
      title: form.title.trim(),
      origin: form.origin || 'Rádio Oficial de Kanto',
      category: (form.category as any) || 'Liga Pokémon',
      content: form.content || '',
      location: form.location,
      visibility: (form.visibility as any) || 'Público',
      reliabilityPercent: form.reliabilityPercent ?? 80,
      date: form.date || '14/10/2026',
      createdAt: new Date().toISOString(),
    };

    storageService.saveNewsRumor(record);
    setIsModalOpen(false);
    reloadData();
  };

  const handleDelete = (id: string) => {
    if (!confirm('Deseja realmente remover esta publicação?')) return;
    storageService.deleteNewsRumor(id);
    reloadData();
  };

  const filteredNews = news.filter((item) => {
    if (item.visibility === 'Mestre Apenas' && !isGM) return false;

    const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
    const isRumorItem = item.category === 'Rumor' || item.category === 'Falso / Desinformação';
    const matchesType =
      filterType === 'all' ||
      (filterType === 'verified' && !isRumorItem) ||
      (filterType === 'rumors' && isRumorItem);
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.origin.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCat && matchesType && matchesSearch;
  });

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'Liga Pokémon':
        return 'bg-purple-950/80 text-purple-300 border-purple-800/60';
      case 'Oficial':
        return 'bg-blue-950/80 text-blue-300 border-blue-800/60';
      case 'Rumor':
        return 'bg-amber-950/80 text-amber-300 border-amber-800/60';
      case 'Evento Local':
        return 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60';
      case 'Falso / Desinformação':
        return 'bg-rose-950/80 text-rose-300 border-rose-800/60';
      case 'Segredo do Mestre':
        return 'bg-red-950/80 text-red-300 border-red-800/60';
      default:
        return 'bg-zinc-800 text-slate-300 border-zinc-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-purple-950/70 border border-purple-800/50 text-purple-300">
              <Radio className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-100 tracking-tight">
              Mural de Notícias & Rádio de Kanto
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Boletins oficiais da Liga, informes policiais, fofocas de tavernas e cotações de mercado.
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
                setForm({
                  title: '',
                  origin: 'Rádio Oficial de Kanto',
                  category: 'Liga Pokémon',
                  content: '',
                  location: 'Cerulean City',
                  visibility: 'Público',
                  reliabilityPercent: 85,
                  date: '14/10/2026',
                });
                setIsModalOpen(true);
              }}
              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Publicar Notícia / Rumor</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-[#11121d] rounded-xl border border-zinc-800/80 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por manchete, origem ou conteúdo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="flex gap-1.5 text-xs">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterType === 'all'
                  ? 'bg-purple-600 text-white'
                  : 'bg-zinc-900 text-slate-400 hover:text-slate-200'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilterType('verified')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterType === 'verified'
                  ? 'bg-purple-600 text-white'
                  : 'bg-zinc-900 text-slate-400 hover:text-slate-200'
              }`}
            >
              Oficiais & Liga
            </button>
            <button
              onClick={() => setFilterType('rumors')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterType === 'rumors'
                  ? 'bg-purple-600 text-white'
                  : 'bg-zinc-900 text-slate-400 hover:text-slate-200'
              }`}
            >
              Rumores & Becos
            </button>
          </div>
        </div>

        {/* Category tags */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs">
          {[
            'all',
            'Liga Pokémon',
            'Oficial',
            'Evento Local',
            'Rumor',
            'Falso / Desinformação',
            'Segredo do Mestre',
          ].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all whitespace-nowrap cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-purple-600 text-white'
                  : 'bg-zinc-800/80 text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat === 'all' ? 'Todas as Categorias' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* News Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredNews.length === 0 ? (
          <div className="col-span-full p-8 text-center rounded-xl bg-[#11121d] border border-zinc-800/80 text-slate-400 text-xs">
            Nenhuma notícia encontrada com os filtros selecionados.
          </div>
        ) : (
          filteredNews.map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-xl bg-[#11121d] border border-zinc-800/80 flex flex-col justify-between space-y-3 relative group"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <span
                    className={`text-[9px] font-bold px-2 py-0.5 rounded border ${getCategoryColor(
                      item.category
                    )}`}
                  >
                    {item.category}
                  </span>

                  {item.reliabilityPercent !== undefined && (
                    <span className="text-[10px] font-mono font-bold text-amber-400">
                      {item.reliabilityPercent}% Verídico
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-bold text-slate-100 group-hover:text-purple-300 transition-colors">
                  {item.title}
                </h3>

                <p className="text-xs text-slate-300 leading-relaxed">{item.content}</p>
              </div>

              <div className="space-y-2 pt-3 border-t border-zinc-800/60">
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span className="font-semibold text-purple-400 truncate max-w-[150px]">
                    {item.origin}
                  </span>
                  <span className="flex items-center gap-1 font-mono">
                    <Calendar className="w-3 h-3 text-slate-500" />
                    {item.date}
                  </span>
                </div>

                {isGM && (
                  <div className="flex justify-end gap-1 pt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => {
                        setForm(item);
                        setIsModalOpen(true);
                      }}
                      className="p-1 text-slate-400 hover:text-slate-100"
                      title="Editar"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1 text-slate-400 hover:text-rose-400"
                      title="Excluir"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#12131f] border border-zinc-800 rounded-xl max-w-lg w-full p-5 space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl">
            <h3 className="text-sm font-bold text-slate-100">
              {form.id ? 'Editar Notícia / Rumor' : 'Publicar Nova Notícia ou Fofoca'}
            </h3>

            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Manchete</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Silph Co. suspende exportação de Master Balls"
                  value={form.title || ''}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Origem / Fonte</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Rádio Goldenrod / Marinheiro Ébrio"
                    value={form.origin || ''}
                    onChange={(e) => setForm({ ...form, origin: e.target.value })}
                    className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Categoria</label>
                  <select
                    value={form.category || 'Liga Pokémon'}
                    onChange={(e) => setForm({ ...form, category: e.target.value as any })}
                    className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-purple-500"
                  >
                    <option value="Liga Pokémon">Liga Pokémon</option>
                    <option value="Oficial">Oficial</option>
                    <option value="Evento Local">Evento Local</option>
                    <option value="Rumor">Rumor</option>
                    <option value="Falso / Desinformação">Falso / Desinformação</option>
                    <option value="Segredo do Mestre">Segredo do Mestre</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Texto do Artigo</label>
                <textarea
                  rows={3}
                  required
                  placeholder="O relato ou anúncio completo que os jogadores podem ler..."
                  value={form.content || ''}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Confiabilidade (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={form.reliabilityPercent ?? 80}
                    onChange={(e) => setForm({ ...form, reliabilityPercent: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Visibilidade</label>
                  <select
                    value={form.visibility || 'Público'}
                    onChange={(e) => setForm({ ...form, visibility: e.target.value as any })}
                    className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-purple-500"
                  >
                    <option value="Público">Público</option>
                    <option value="Rumor">Rumor</option>
                    <option value="Mestre Apenas">Mestre Apenas</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
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
