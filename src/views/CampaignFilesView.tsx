/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { storageService } from '../services/storageService';
import { CampaignFileReference } from '../types';
import {
  FolderOpen,
  Plus,
  Eye,
  EyeOff,
  Trash2,
  ExternalLink,
  FileText,
  Image as ImageIcon,
  Map,
  Book,
  Search,
} from 'lucide-react';

export const CampaignFilesView: React.FC = () => {
  const { activeCampaign, isGM } = useAuth();
  const [files, setFiles] = useState<CampaignFileReference[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showPrivateOnly, setShowPrivateOnly] = useState(false);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState<Partial<CampaignFileReference>>({
    name: '',
    category: 'Mapas',
    fileType: 'image',
    description: '',
    fileUrl: '',
    isPublic: true,
  });

  const reloadData = () => {
    if (!activeCampaign) return;
    setFiles(storageService.getCampaignFiles(activeCampaign.id));
  };

  useEffect(() => {
    reloadData();
  }, [activeCampaign]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCampaign || !form.name?.trim()) return;

    const record: CampaignFileReference = {
      id: form.id || `file_${Date.now().toString(36)}`,
      campaignId: activeCampaign.id,
      name: form.name.trim(),
      category: (form.category as any) || 'Mapas',
      fileType: form.fileType || 'image',
      description: form.description || '',
      fileUrl: form.fileUrl || 'https://images.unsplash.com/photo-1524654458049-e36be0721fa2?w=800',
      isPublic: form.isPublic ?? true,
      createdAt: new Date().toISOString().split('T')[0],
    };

    storageService.saveCampaignFile(record);
    setIsModalOpen(false);
    reloadData();
  };

  const handleDelete = (id: string) => {
    if (!confirm('Deseja realmente remover este arquivo da central?')) return;
    storageService.deleteCampaignFile(id);
    reloadData();
  };

  const filteredFiles = files.filter((f) => {
    if (!f.isPublic && !isGM) return false;
    if (showPrivateOnly && f.isPublic) return false;

    const matchesCat = selectedCategory === 'all' || f.category === selectedCategory;
    const matchesSearch =
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCat && matchesSearch;
  });

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'Mapas':
        return Map;
      case 'Documentos':
        return Book;
      case 'Handouts':
        return FileText;
      default:
        return ImageIcon;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-purple-950/70 border border-purple-800/50 text-purple-300">
              <FolderOpen className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-100 tracking-tight">
              Central de Arquivos & Referências
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Galeria de mapas regionais, cartas misteriosas, fichas de facções e handouts da mesa.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isGM && (
            <button
              onClick={() => setShowPrivateOnly(!showPrivateOnly)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer ${
                showPrivateOnly
                  ? 'bg-rose-950/60 border-rose-700/80 text-rose-300'
                  : 'bg-zinc-900 border-zinc-700 text-slate-400 hover:text-slate-200'
              }`}
            >
              {showPrivateOnly ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              <span>{showPrivateOnly ? 'Somente Privados' : 'Todos Visíveis'}</span>
            </button>
          )}

          {isGM && (
            <button
              onClick={() => {
                setForm({
                  name: '',
                  category: 'Mapas',
                  fileType: 'image',
                  description: '',
                  fileUrl: '',
                  isPublic: true,
                });
                setIsModalOpen(true);
              }}
              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Adicionar Arquivo</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-[#11121d] rounded-xl border border-zinc-800/80 space-y-3">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nome ou descrição de arquivo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs">
          {[
            'all',
            'Mapas',
            'Documentos',
            'Handouts',
            'Regras Adicionais',
            'Imagens',
            'Tokens',
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
              {cat === 'all' ? 'Todos os Arquivos' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Files Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredFiles.length === 0 ? (
          <div className="col-span-full p-8 text-center rounded-xl bg-[#11121d] border border-zinc-800/80 text-slate-400 text-xs">
            Nenhum arquivo encontrado na biblioteca.
          </div>
        ) : (
          filteredFiles.map((f) => {
            const Icon = getCategoryIcon(f.category);

            return (
              <div
                key={f.id}
                className="p-4 rounded-xl bg-[#11121d] border border-zinc-800/80 space-y-3 flex flex-col justify-between relative group"
              >
                <div className="space-y-3">
                  {f.fileUrl ? (
                    <div className="w-full h-36 rounded-lg bg-zinc-950 overflow-hidden relative">
                      <img
                        src={f.fileUrl}
                        alt={f.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-2 left-2 flex items-center gap-1.5">
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-black/70 backdrop-blur-xs text-purple-300 border border-purple-800/50">
                          {f.category}
                        </span>
                        {!f.isPublic && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-rose-950/80 text-rose-300 border border-rose-800/60">
                            Segredo GM
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-24 rounded-lg bg-zinc-900 flex items-center justify-center text-zinc-600">
                      <Icon className="w-8 h-8" />
                    </div>
                  )}

                  <div>
                    <h3 className="text-sm font-bold text-slate-100 group-hover:text-purple-300 transition-colors">
                      {f.name}
                    </h3>
                    <p className="text-xs text-slate-400 leading-snug mt-1 line-clamp-2">
                      {f.description}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-zinc-800/60 flex items-center justify-between text-xs">
                  <span className="text-[10px] text-slate-500 font-mono">{f.createdAt}</span>

                  <div className="flex items-center gap-1">
                    {f.fileUrl && (
                      <a
                        href={f.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 text-purple-400 hover:text-purple-300 transition-colors"
                        title="Abrir em Nova Aba"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                    {isGM && (
                      <button
                        onClick={() => handleDelete(f.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 transition-colors"
                        title="Excluir"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#12131f] border border-zinc-800 rounded-xl max-w-lg w-full p-5 space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl">
            <h3 className="text-sm font-bold text-slate-100">Adicionar Arquivo / Handout</h3>

            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Nome do Documento</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Mapa das Galerias Subterrâneas"
                  value={form.name || ''}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Categoria</label>
                  <select
                    value={form.category || 'Mapas'}
                    onChange={(e) => setForm({ ...form, category: e.target.value as any })}
                    className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-purple-500"
                  >
                    <option value="Mapas">Mapas</option>
                    <option value="Documentos">Documentos</option>
                    <option value="Handouts">Handouts</option>
                    <option value="Regras Adicionais">Regras Adicionais</option>
                    <option value="Imagens">Imagens</option>
                    <option value="Tokens">Tokens</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">URL do Arquivo / Imagem</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={form.fileUrl || ''}
                    onChange={(e) => setForm({ ...form, fileUrl: e.target.value })}
                    className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Descrição</label>
                <textarea
                  rows={2}
                  placeholder="Anotações contextuais sobre o arquivo..."
                  value={form.description || ''}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isPublicCheck"
                  checked={form.isPublic ?? true}
                  onChange={(e) => setForm({ ...form, isPublic: e.target.checked })}
                  className="rounded border-zinc-700 bg-zinc-900 text-purple-600 focus:ring-0"
                />
                <label htmlFor="isPublicCheck" className="text-xs text-slate-300 select-none">
                  Visível publicamente aos jogadores
                </label>
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
                  Salvar Arquivo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
