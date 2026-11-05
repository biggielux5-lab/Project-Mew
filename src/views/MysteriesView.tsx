/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { storageService } from '../services/storageService';
import { Mystery, Clue } from '../types';
import {
  Search,
  Plus,
  Eye,
  EyeOff,
  AlertTriangle,
  HelpCircle,
  Trash2,
  Edit2,
  User,
  MapPin,
} from 'lucide-react';

export const MysteriesView: React.FC = () => {
  const { activeCampaign, isGM } = useAuth();
  const [mysteries, setMysteries] = useState<Mystery[]>([]);
  const [selectedMystery, setSelectedMystery] = useState<Mystery | null>(null);
  const [activeTab, setActiveTab] = useState<'board' | 'clues'>('board');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showGmSecrets, setShowGmSecrets] = useState(false);

  // Edit / Create Modals
  const [isMysteryModalOpen, setIsMysteryModalOpen] = useState(false);
  const [mysteryForm, setMysteryForm] = useState<Partial<Mystery>>({
    title: '',
    centralQuestion: '',
    revelations: '',
    status: 'Aberto',
    hypotheses: [''],
    suspectNpcIds: [],
    clues: [],
    gmNotes: '',
    consequences: '',
    isRevealedToPlayers: true,
  });

  const [isClueModalOpen, setIsClueModalOpen] = useState(false);
  const [clueForm, setClueForm] = useState<Partial<Clue>>({
    title: '',
    content: '',
    status: 'Não descoberta',
    locationFound: '',
    sourceNpcName: '',
    isMisdirection: false,
    playerNotes: '',
    gmSecretTruth: '',
  });

  const reloadData = () => {
    if (!activeCampaign) return;
    const list = storageService.getMysteries(activeCampaign.id);
    setMysteries(list);
    if (selectedMystery) {
      const updated = list.find((m) => m.id === selectedMystery.id) || list[0] || null;
      setSelectedMystery(updated);
    } else if (list.length > 0) {
      setSelectedMystery(list[0]);
    }
  };

  useEffect(() => {
    reloadData();
  }, [activeCampaign]);

  const handleSaveMystery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCampaign || !mysteryForm.title?.trim()) return;

    const newMystery: Mystery = {
      id: mysteryForm.id || `myst_${Date.now().toString(36)}`,
      campaignId: activeCampaign.id,
      title: mysteryForm.title.trim(),
      centralQuestion: mysteryForm.centralQuestion || '',
      revelations: mysteryForm.revelations || '',
      status: (mysteryForm.status as any) || 'Aberto',
      hypotheses: mysteryForm.hypotheses?.filter((h) => h.trim().length > 0) || [],
      suspectNpcIds: mysteryForm.suspectNpcIds || [],
      relatedLocationIds: mysteryForm.relatedLocationIds || [],
      clues: mysteryForm.clues || [],
      consequences: mysteryForm.consequences || '',
      gmNotes: mysteryForm.gmNotes || '',
      isRevealedToPlayers: mysteryForm.isRevealedToPlayers ?? true,
      createdAt: new Date().toISOString(),
    };

    storageService.saveMystery(newMystery);
    setIsMysteryModalOpen(false);
    reloadData();
    setSelectedMystery(newMystery);
  };

  const handleDeleteMystery = (id: string) => {
    if (!confirm('Deseja realmente remover esta linha de investigação e todas as pistas vinculadas?')) return;
    storageService.deleteMystery(id);
    reloadData();
    if (selectedMystery?.id === id) {
      setSelectedMystery(null);
    }
  };

  const handleSaveClue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMystery || !clueForm.title?.trim()) return;

    const clue: Clue = {
      id: clueForm.id || `clue_${Date.now().toString(36)}`,
      mysteryId: selectedMystery.id,
      title: clueForm.title.trim(),
      content: clueForm.content || '',
      status: (clueForm.status as Clue['status']) || 'Não descoberta',
      discoveredDate: clueForm.status !== 'Não descoberta' ? (clueForm.discoveredDate || new Date().toISOString().split('T')[0]) : undefined,
      locationFound: clueForm.locationFound,
      sourceNpcName: clueForm.sourceNpcName,
      isMisdirection: clueForm.isMisdirection || false,
      playerNotes: clueForm.playerNotes,
      gmSecretTruth: clueForm.gmSecretTruth,
    };

    const updatedClues = clueForm.id
      ? selectedMystery.clues.map((c) => (c.id === clueForm.id ? clue : c))
      : [...selectedMystery.clues, clue];

    const updatedMystery = { ...selectedMystery, clues: updatedClues };
    storageService.saveMystery(updatedMystery);
    setIsClueModalOpen(false);
    reloadData();
    setSelectedMystery(updatedMystery);
  };

  const handleUpdateClueStatus = (clueId: string, status: Clue['status']) => {
    if (!selectedMystery) return;
    storageService.updateClueStatus(selectedMystery.id, clueId, status);
    reloadData();
  };

  const handleDeleteClue = (clueId: string) => {
    if (!selectedMystery) return;
    const updatedClues = selectedMystery.clues.filter((c) => c.id !== clueId);
    const updatedMystery = { ...selectedMystery, clues: updatedClues };
    storageService.saveMystery(updatedMystery);
    reloadData();
    setSelectedMystery(updatedMystery);
  };

  const filteredMysteries = mysteries.filter((m) => {
    const matchesSearch =
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.centralQuestion.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || m.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: Clue['status']) => {
    switch (status) {
      case 'Confirmada':
        return 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60';
      case 'Descoberta':
        return 'bg-sky-950/80 text-sky-300 border-sky-800/60';
      case 'Interpretada':
        return 'bg-amber-950/80 text-amber-300 border-amber-800/60';
      case 'Descartada':
        return 'bg-rose-950/80 text-rose-300 border-rose-800/60';
      default:
        return 'bg-zinc-800/90 text-slate-400 border-zinc-700/60';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-purple-950/70 border border-purple-800/50 text-purple-300">
              <Search className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-100 tracking-tight">
              Mistérios & Linhas de Investigação
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Quadro de pistas, suspeitos, deduções e verdades ocultas da campanha.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isGM && (
            <button
              onClick={() => setShowGmSecrets(!showGmSecrets)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer ${
                showGmSecrets
                  ? 'bg-rose-950/60 border-rose-700/80 text-rose-300'
                  : 'bg-zinc-900 border-zinc-700 text-slate-400 hover:text-slate-200'
              }`}
              title="Revelar/ocultar segredos do Mestre"
            >
              {showGmSecrets ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              <span>{showGmSecrets ? 'Segredos GM Visíveis' : 'Segredos GM Ocultos'}</span>
            </button>
          )}

          {isGM && (
            <button
              onClick={() => {
                setMysteryForm({
                  title: '',
                  centralQuestion: '',
                  revelations: '',
                  status: 'Aberto',
                  hypotheses: [''],
                  suspectNpcIds: [],
                  clues: [],
                  gmNotes: '',
                  consequences: '',
                  isRevealedToPlayers: true,
                });
                setIsMysteryModalOpen(true);
              }}
              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs rounded-lg transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Novo Mistério</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Mystery Selector */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-3 bg-[#11121d] rounded-xl border border-zinc-800/80 space-y-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar mistério ou pergunta..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="flex gap-1.5 text-xs overflow-x-auto pb-1">
              {['all', 'Aberto', 'Em investigação', 'Solucionado'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all whitespace-nowrap cursor-pointer ${
                    statusFilter === st
                      ? 'bg-purple-600 text-white'
                      : 'bg-zinc-800/80 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {st === 'all' ? 'Todos' : st}
                </button>
              ))}
            </div>
          </div>

          {/* Mysteries List */}
          <div className="space-y-2">
            {filteredMysteries.length === 0 ? (
              <div className="p-6 text-center rounded-xl bg-[#11121d] border border-zinc-800/80 text-slate-400 text-xs">
                Nenhum mistério encontrado com os filtros atuais.
              </div>
            ) : (
              filteredMysteries.map((m) => {
                const isSelected = selectedMystery?.id === m.id;
                const discoveredClues = m.clues.filter((c) => c.status !== 'Não descoberta').length;
                const totalClues = m.clues.length;

                return (
                  <div
                    key={m.id}
                    onClick={() => setSelectedMystery(m)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer relative group ${
                      isSelected
                        ? 'bg-purple-950/40 border-purple-600/70 shadow-sm'
                        : 'bg-[#11121d] border-zinc-800/80 hover:border-zinc-700 hover:bg-[#141522]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                              m.status === 'Solucionado'
                                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60'
                                : m.status === 'Em investigação'
                                ? 'bg-amber-950/80 text-amber-300 border-amber-800/60'
                                : 'bg-zinc-800 text-slate-300 border-zinc-700'
                            }`}
                          >
                            {m.status}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {discoveredClues}/{totalClues} pistas
                          </span>
                        </div>
                        <h3 className="text-xs font-bold text-slate-100 group-hover:text-purple-300 transition-colors">
                          {m.title}
                        </h3>
                      </div>

                      {isGM && (
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setMysteryForm(m);
                              setIsMysteryModalOpen(true);
                            }}
                            className="p-1 text-slate-400 hover:text-slate-100 transition-colors"
                            title="Editar"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteMystery(m.id);
                            }}
                            className="p-1 text-slate-400 hover:text-rose-400 transition-colors"
                            title="Excluir"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-400 italic line-clamp-2 mt-1.5">
                      "{m.centralQuestion}"
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Selected Mystery Details */}
        <div className="lg:col-span-8">
          {selectedMystery ? (
            <div className="space-y-5 bg-[#11121d] p-5 sm:p-6 rounded-xl border border-zinc-800/80">
              {/* Header */}
              <div className="space-y-2 border-b border-zinc-800/80 pb-4">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        selectedMystery.status === 'Solucionado'
                          ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60'
                          : selectedMystery.status === 'Em investigação'
                          ? 'bg-amber-950/80 text-amber-300 border-amber-800/60'
                          : 'bg-zinc-800 text-slate-300 border-zinc-700'
                      }`}
                    >
                      {selectedMystery.status}
                    </span>
                    <h2 className="text-lg font-bold text-slate-100">{selectedMystery.title}</h2>
                  </div>

                  {isGM && (
                    <button
                      onClick={() => {
                        setClueForm({
                          title: '',
                          content: '',
                          status: 'Não descoberta',
                          locationFound: '',
                          sourceNpcName: '',
                          isMisdirection: false,
                          playerNotes: '',
                          gmSecretTruth: '',
                        });
                        setIsClueModalOpen(true);
                      }}
                      className="px-2.5 py-1 bg-purple-600/90 hover:bg-purple-600 text-white font-semibold text-xs rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Adicionar Pista</span>
                    </button>
                  )}
                </div>

                <div className="p-3 rounded-lg bg-[#161726] border border-purple-900/40">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">
                    Pergunta Central da Investigação
                  </span>
                  <p className="text-sm font-semibold text-purple-200 mt-0.5">
                    {selectedMystery.centralQuestion}
                  </p>
                </div>

                {selectedMystery.revelations && (
                  <p className="text-xs text-slate-300 leading-relaxed">{selectedMystery.revelations}</p>
                )}
              </div>

              {/* GM Secret Truth Section */}
              {isGM && showGmSecrets && selectedMystery.gmNotes && (
                <div className="p-3.5 rounded-lg bg-rose-950/30 border border-rose-800/50 space-y-1">
                  <div className="flex items-center gap-1.5 text-rose-300 font-bold text-xs uppercase tracking-wider">
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    <span>Verdade Oculta (Apenas Mestre)</span>
                  </div>
                  <p className="text-xs text-rose-200/90 leading-relaxed font-mono">
                    {selectedMystery.gmNotes}
                  </p>
                </div>
              )}

              {/* Tabs */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                  <div className="flex gap-4">
                    <button
                      onClick={() => setActiveTab('board')}
                      className={`text-xs font-bold pb-2 transition-all relative ${
                        activeTab === 'board'
                          ? 'text-purple-300 border-b-2 border-purple-500'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Quadro de Hipóteses
                    </button>
                    <button
                      onClick={() => setActiveTab('clues')}
                      className={`text-xs font-bold pb-2 transition-all relative ${
                        activeTab === 'clues'
                          ? 'text-purple-300 border-b-2 border-purple-500'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Pistas & Evidências ({selectedMystery.clues.length})
                    </button>
                  </div>
                </div>

                {activeTab === 'board' && (
                  <div className="p-4 rounded-xl bg-[#141522] border border-zinc-800/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                        <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                        Hipóteses Levantadas
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {selectedMystery.hypotheses.length} registradas
                      </span>
                    </div>

                    {selectedMystery.hypotheses.length === 0 ? (
                      <p className="text-xs text-slate-500 italic">
                        Nenhuma hipótese formalizada pelos investigadores ainda.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {selectedMystery.hypotheses.map((h, i) => (
                          <div
                            key={i}
                            className="p-2.5 rounded-lg bg-zinc-900/90 border border-zinc-800 text-xs text-slate-200 flex items-start gap-2"
                          >
                            <span className="text-purple-400 font-bold font-mono">#{i + 1}</span>
                            <span className="leading-snug">{h}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'clues' && (
                  <div className="space-y-3">
                    {selectedMystery.clues.length === 0 ? (
                      <div className="p-8 text-center rounded-xl bg-[#141522] border border-zinc-800/80 text-slate-400 text-xs">
                        Nenhuma pista registrada para este mistério.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {selectedMystery.clues.map((clue) => {
                          const isHiddenToPlayers = clue.status === 'Não descoberta' && !isGM;
                          if (isHiddenToPlayers) return null;

                          return (
                            <div
                              key={clue.id}
                              className={`p-3.5 rounded-xl border space-y-2 relative transition-all ${
                                clue.status === 'Não descoberta'
                                  ? 'bg-zinc-900/60 border-dashed border-zinc-700/60 opacity-75'
                                  : 'bg-[#141522] border-zinc-800/90'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span
                                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${getStatusBadge(
                                        clue.status
                                      )}`}
                                    >
                                      {clue.status}
                                    </span>
                                    {isGM && clue.isMisdirection && (
                                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-red-950/80 text-red-300 border border-red-800/60">
                                        Pista Falsa
                                      </span>
                                    )}
                                  </div>
                                  <h4 className="text-xs font-bold text-slate-100">{clue.title}</h4>
                                </div>

                                {isGM && (
                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={() => {
                                        setClueForm(clue);
                                        setIsClueModalOpen(true);
                                      }}
                                      className="p-1 text-slate-400 hover:text-slate-200"
                                      title="Editar Pista"
                                    >
                                      <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteClue(clue.id)}
                                      className="p-1 text-slate-400 hover:text-rose-400"
                                      title="Excluir Pista"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                )}
                              </div>

                              <p className="text-xs text-slate-300 leading-snug">{clue.content}</p>

                              {/* Clue origin & meta */}
                              <div className="pt-2 border-t border-zinc-800/60 flex items-center justify-between text-[10px] text-slate-400">
                                <div className="flex items-center gap-3">
                                  {clue.locationFound && (
                                    <span className="flex items-center gap-1">
                                      <MapPin className="w-3 h-3 text-purple-400" />
                                      {clue.locationFound}
                                    </span>
                                  )}
                                  {clue.sourceNpcName && (
                                    <span className="flex items-center gap-1">
                                      <User className="w-3 h-3 text-sky-400" />
                                      {clue.sourceNpcName}
                                    </span>
                                  )}
                                </div>

                                {isGM && (
                                  <select
                                    value={clue.status}
                                    onChange={(e) =>
                                      handleUpdateClueStatus(clue.id, e.target.value as Clue['status'])
                                    }
                                    className="bg-zinc-900 border border-zinc-700 rounded px-1.5 py-0.5 text-[10px] text-slate-200 focus:outline-none focus:border-purple-500 cursor-pointer"
                                  >
                                    <option value="Não descoberta">Não descoberta</option>
                                    <option value="Descoberta">Descoberta</option>
                                    <option value="Interpretada">Interpretada</option>
                                    <option value="Confirmada">Confirmada</option>
                                    <option value="Descartada">Descartada</option>
                                  </select>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-12 text-center rounded-xl bg-[#11121d] border border-zinc-800/80 text-slate-400 text-xs">
              Selecione um mistério ao lado para inspecionar hipóteses, pistas e deduções.
            </div>
          )}
        </div>
      </div>

      {/* Mystery Form Modal */}
      {isMysteryModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#12131f] border border-zinc-800 rounded-xl max-w-lg w-full p-5 space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl">
            <h3 className="text-sm font-bold text-slate-100">
              {mysteryForm.id ? 'Editar Linha de Investigação' : 'Criar Nova Linha de Investigação'}
            </h3>

            <form onSubmit={handleSaveMystery} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Título do Mistério</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: O Naufrágio do S.S. Anne"
                  value={mysteryForm.title || ''}
                  onChange={(e) => setMysteryForm({ ...mysteryForm, title: e.target.value })}
                  className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Pergunta Central da Trama
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Quem saboteou os motores na saída de Vermilion?"
                  value={mysteryForm.centralQuestion || ''}
                  onChange={(e) => setMysteryForm({ ...mysteryForm, centralQuestion: e.target.value })}
                  className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Status</label>
                <select
                  value={mysteryForm.status || 'Aberto'}
                  onChange={(e) => setMysteryForm({ ...mysteryForm, status: e.target.value as any })}
                  className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-purple-500"
                >
                  <option value="Aberto">Aberto</option>
                  <option value="Em investigação">Em investigação</option>
                  <option value="Solucionado">Solucionado</option>
                  <option value="Arquivado">Arquivado</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-rose-300 block mb-1">
                  Verdade Oculta (Apenas o Mestre pode ver)
                </label>
                <textarea
                  rows={2}
                  placeholder="A revelação canônica real para o mestre..."
                  value={mysteryForm.gmNotes || ''}
                  onChange={(e) => setMysteryForm({ ...mysteryForm, gmNotes: e.target.value })}
                  className="w-full px-3 py-1.5 bg-rose-950/20 border border-rose-900/60 rounded-lg text-xs text-rose-200 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsMysteryModalOpen(false)}
                  className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-slate-300 rounded-lg text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-lg text-xs"
                >
                  Salvar Mistério
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Clue Form Modal */}
      {isClueModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#12131f] border border-zinc-800 rounded-xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-slate-100">
              {clueForm.id ? 'Editar Pista' : 'Registrar Nova Pista'}
            </h3>

            <form onSubmit={handleSaveClue} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Título da Pista</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Pegadas de botas de borracha no convés"
                  value={clueForm.title || ''}
                  onChange={(e) => setClueForm({ ...clueForm, title: e.target.value })}
                  className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">O que a pista revela</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Detalhes físicos ou dedução observada..."
                  value={clueForm.content || ''}
                  onChange={(e) => setClueForm({ ...clueForm, content: e.target.value })}
                  className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Local Encontrado</label>
                  <input
                    type="text"
                    placeholder="Ex: Porto de Vermilion"
                    value={clueForm.locationFound || ''}
                    onChange={(e) => setClueForm({ ...clueForm, locationFound: e.target.value })}
                    className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">NPC de Origem</label>
                  <input
                    type="text"
                    placeholder="Ex: Ralph"
                    value={clueForm.sourceNpcName || ''}
                    onChange={(e) => setClueForm({ ...clueForm, sourceNpcName: e.target.value })}
                    className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Status Inicial</label>
                  <select
                    value={clueForm.status || 'Não descoberta'}
                    onChange={(e) => setClueForm({ ...clueForm, status: e.target.value as Clue['status'] })}
                    className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-purple-500"
                  >
                    <option value="Não descoberta">Não descoberta (Secreta)</option>
                    <option value="Descoberta">Descoberta</option>
                    <option value="Interpretada">Interpretada</option>
                    <option value="Confirmada">Confirmada</option>
                    <option value="Descartada">Descartada</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-5">
                  <input
                    type="checkbox"
                    id="isMisdirectionCheck"
                    checked={clueForm.isMisdirection || false}
                    onChange={(e) => setClueForm({ ...clueForm, isMisdirection: e.target.checked })}
                    className="rounded border-zinc-700 bg-zinc-900 text-purple-600 focus:ring-0"
                  />
                  <label htmlFor="isMisdirectionCheck" className="text-xs text-slate-300 select-none">
                    Pista Falsa / Despiste
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsClueModalOpen(false)}
                  className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-slate-300 rounded-lg text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-lg text-xs"
                >
                  Salvar Pista
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
