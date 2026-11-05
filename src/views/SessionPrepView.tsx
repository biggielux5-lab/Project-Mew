/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { storageService } from '../services/storageService';
import { PrepScene, NarrativePendingItem } from '../types';
import {
  FileText,
  Plus,
  CheckCircle,
  MapPin,
  MoveUp,
  MoveDown,
  Trash2,
  Edit2,
  AlertTriangle,
} from 'lucide-react';

export const SessionPrepView: React.FC = () => {
  const { activeCampaign, isGM } = useAuth();
  const [scenes, setScenes] = useState<PrepScene[]>([]);
  const [pendingItems, setPendingItems] = useState<NarrativePendingItem[]>([]);
  const [activeTab, setActiveTab] = useState<'scenes' | 'pending'>('scenes');

  // Modals
  const [isSceneModalOpen, setIsSceneModalOpen] = useState(false);
  const [sceneForm, setSceneForm] = useState<Partial<PrepScene>>({
    title: '',
    objective: '',
    narrativeDescription: '',
    involvedNpcNames: [''],
    locationName: '',
    plannedEncounters: [''],
    cluesToReveal: [''],
    rewards: [''],
    potentialConsequences: [''],
    hooksForNextScene: [''],
    status: 'Pendente',
    gmSecretNotes: '',
  });

  const [isPendingModalOpen, setIsPendingModalOpen] = useState(false);
  const [pendingForm, setPendingForm] = useState<Partial<NarrativePendingItem>>({
    title: '',
    priority: 'Média',
    resolved: false,
    description: '',
  });

  const reloadData = () => {
    if (!activeCampaign) return;
    setScenes(storageService.getPrepScenes(activeCampaign.id));
    setPendingItems(storageService.getNarrativePending(activeCampaign.id));
  };

  useEffect(() => {
    reloadData();
  }, [activeCampaign]);

  const handleSaveScene = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCampaign || !sceneForm.title?.trim()) return;

    const scene: PrepScene = {
      id: sceneForm.id || `scene_${Date.now().toString(36)}`,
      campaignId: activeCampaign.id,
      order: sceneForm.order ?? scenes.length + 1,
      title: sceneForm.title.trim(),
      objective: sceneForm.objective || '',
      narrativeDescription: sceneForm.narrativeDescription || '',
      involvedNpcNames: sceneForm.involvedNpcNames?.filter(Boolean) || [],
      locationName: sceneForm.locationName || 'Kanto',
      plannedEncounters: sceneForm.plannedEncounters?.filter(Boolean) || [],
      cluesToReveal: sceneForm.cluesToReveal?.filter(Boolean) || [],
      rewards: sceneForm.rewards?.filter(Boolean) || [],
      potentialConsequences: sceneForm.potentialConsequences?.filter(Boolean) || [],
      hooksForNextScene: sceneForm.hooksForNextScene?.filter(Boolean) || [],
      status: (sceneForm.status as any) || 'Pendente',
      gmSecretNotes: sceneForm.gmSecretNotes,
    };

    storageService.savePrepScene(scene);
    setIsSceneModalOpen(false);
    reloadData();
  };

  const handleDeleteScene = (id: string) => {
    if (!confirm('Deseja realmente remover esta cena da preparação?')) return;
    storageService.deletePrepScene(id);
    reloadData();
  };

  const handleToggleSceneComplete = (sc: PrepScene) => {
    const nextStatus: PrepScene['status'] = sc.status === 'Concluída' ? 'Pendente' : 'Concluída';
    const updated: PrepScene = { ...sc, status: nextStatus };
    storageService.savePrepScene(updated);
    reloadData();
  };

  const handleMoveScene = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= scenes.length) return;

    const updated = [...scenes];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    updated.forEach((s, idx) => {
      s.order = idx + 1;
      storageService.savePrepScene(s);
    });

    reloadData();
  };

  // Pending Items
  const handleSavePending = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCampaign || !pendingForm.title?.trim()) return;

    const item: NarrativePendingItem = {
      id: pendingForm.id || `np_${Date.now().toString(36)}`,
      campaignId: activeCampaign.id,
      title: pendingForm.title.trim(),
      priority: (pendingForm.priority as any) || 'Média',
      resolved: pendingForm.resolved ?? false,
      description: pendingForm.description || '',
    };

    storageService.saveNarrativePending(item);
    setIsPendingModalOpen(false);
    reloadData();
  };

  const handleTogglePendingStatus = (item: NarrativePendingItem) => {
    const updated = { ...item, resolved: !item.resolved };
    storageService.saveNarrativePending(updated);
    reloadData();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-purple-950/70 border border-purple-800/50 text-purple-300">
              <FileText className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-100 tracking-tight">
              Preparador de Sessões & Cenas
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Sequenciador narrativo de cenas, ganchos dramáticos e pendências abertas dos jogadores.
          </p>
        </div>

        {isGM && (
          <div className="flex items-center gap-2">
            {activeTab === 'scenes' ? (
              <button
                onClick={() => {
                  setSceneForm({
                    title: '',
                    objective: '',
                    narrativeDescription: '',
                    involvedNpcNames: [''],
                    locationName: '',
                    plannedEncounters: [''],
                    cluesToReveal: [''],
                    rewards: [''],
                    potentialConsequences: [''],
                    hooksForNextScene: [''],
                    status: 'Pendente',
                    gmSecretNotes: '',
                  });
                  setIsSceneModalOpen(true);
                }}
                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nova Cena</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  setPendingForm({
                    title: '',
                    priority: 'Média',
                    resolved: false,
                    description: '',
                  });
                  setIsPendingModalOpen(true);
                }}
                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nova Pendência Narrativa</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-zinc-800/80 pb-2">
        <button
          onClick={() => setActiveTab('scenes')}
          className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
            activeTab === 'scenes'
              ? 'bg-purple-600 text-white'
              : 'text-slate-400 hover:text-slate-200 hover:bg-zinc-800/60'
          }`}
        >
          Roteiro de Cenas ({scenes.length})
        </button>
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
            activeTab === 'pending'
              ? 'bg-purple-600 text-white'
              : 'text-slate-400 hover:text-slate-200 hover:bg-zinc-800/60'
          }`}
        >
          Pendências Narrativas ({pendingItems.length})
        </button>
      </div>

      {/* Scenes Tab */}
      {activeTab === 'scenes' && (
        <div className="space-y-4">
          {scenes.length === 0 ? (
            <div className="p-12 text-center rounded-xl bg-[#11121d] border border-zinc-800/80 text-slate-400 text-xs">
              Nenhuma cena planejada para a próxima sessão. Clique em "Nova Cena" para estruturar seu roteiro.
            </div>
          ) : (
            scenes.map((scene, idx) => {
              const isDone = scene.status === 'Concluída';

              return (
                <div
                  key={scene.id}
                  className={`p-5 rounded-xl border transition-all space-y-3 ${
                    isDone
                      ? 'bg-zinc-950/40 border-zinc-800/50 opacity-60'
                      : 'bg-[#11121d] border-zinc-800/90'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleToggleSceneComplete(scene)}
                        className={`p-1 rounded-full border transition-colors ${
                          isDone
                            ? 'bg-emerald-950 text-emerald-400 border-emerald-700'
                            : 'border-zinc-700 text-slate-500 hover:text-slate-300'
                        }`}
                        title={isDone ? 'Marcar como não executada' : 'Marcar como executada'}
                      >
                        <CheckCircle className="w-5 h-5" />
                      </button>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-purple-400">
                            #{scene.order}
                          </span>
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded border bg-purple-950 text-purple-300 border-purple-800">
                            {scene.status}
                          </span>
                          {scene.locationName && (
                            <span className="text-[11px] text-slate-400 flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-purple-400" />
                              {scene.locationName}
                            </span>
                          )}
                        </div>
                        <h3
                          className={`text-sm font-bold mt-0.5 ${
                            isDone ? 'line-through text-slate-500' : 'text-slate-100'
                          }`}
                        >
                          {scene.title}
                        </h3>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleMoveScene(idx, 'up')}
                        disabled={idx === 0}
                        className="p-1 text-slate-400 hover:text-slate-200 disabled:opacity-30"
                        title="Mover para cima"
                      >
                        <MoveUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleMoveScene(idx, 'down')}
                        disabled={idx === scenes.length - 1}
                        className="p-1 text-slate-400 hover:text-slate-200 disabled:opacity-30"
                        title="Mover para baixo"
                      >
                        <MoveDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          setSceneForm(scene);
                          setIsSceneModalOpen(true);
                        }}
                        className="p-1 text-slate-400 hover:text-slate-200 ml-1"
                        title="Editar Cena"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteScene(scene.id)}
                        className="p-1 text-slate-400 hover:text-rose-400"
                        title="Excluir Cena"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Objective */}
                  <div className="p-3 rounded-lg bg-[#161726] border border-zinc-800 text-xs space-y-1">
                    <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider block">
                      Objetivo Dramático da Cena
                    </span>
                    <p className="text-slate-200 leading-snug">{scene.objective}</p>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">{scene.narrativeDescription}</p>

                  {/* Grid info: Clues, Hooks */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {scene.cluesToReveal && scene.cluesToReveal.length > 0 && (
                      <div className="p-2.5 rounded-lg bg-zinc-900/80 border border-zinc-800/80 space-y-1">
                        <span className="text-[10px] text-sky-400 font-bold uppercase block">
                          Pistas a Revelar
                        </span>
                        {scene.cluesToReveal.map((c, i) => (
                          <div key={i} className="text-slate-300 text-[11px] leading-snug">
                            • {c}
                          </div>
                        ))}
                      </div>
                    )}

                    {scene.hooksForNextScene && scene.hooksForNextScene.length > 0 && (
                      <div className="p-2.5 rounded-lg bg-zinc-900/80 border border-zinc-800/80 space-y-1">
                        <span className="text-[10px] text-amber-400 font-bold uppercase block">
                          Ganchos Futuros
                        </span>
                        {scene.hooksForNextScene.map((h, i) => (
                          <div key={i} className="text-slate-300 text-[11px] leading-snug">
                            • {h}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Narrative Pending Items Tab */}
      {activeTab === 'pending' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingItems.map((item) => (
              <div
                key={item.id}
                className="p-5 rounded-xl bg-[#11121d] border border-zinc-800/80 space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded border ${
                          item.priority === 'Urgente'
                            ? 'bg-rose-950 text-rose-300 border-rose-800'
                            : item.priority === 'Alta'
                            ? 'bg-amber-950 text-amber-300 border-amber-800'
                            : 'bg-zinc-800 text-slate-300 border-zinc-700'
                        }`}
                      >
                        Prioridade: {item.priority}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-100">{item.title}</h3>
                  </div>

                  <button
                    onClick={() => handleTogglePendingStatus(item)}
                    className={`text-[10px] font-bold px-2 py-1 rounded-lg border transition-all ${
                      item.resolved
                        ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60'
                        : 'bg-zinc-800 text-slate-400 border-zinc-700 hover:text-slate-200'
                    }`}
                  >
                    {item.resolved ? 'Resolvida' : 'Pendente'}
                  </button>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Scene Modal */}
      {isSceneModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#12131f] border border-zinc-800 rounded-xl max-w-lg w-full p-5 space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl">
            <h3 className="text-sm font-bold text-slate-100">
              {sceneForm.id ? 'Editar Cena' : 'Criar Nova Cena de Sessão'}
            </h3>

            <form onSubmit={handleSaveScene} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Título da Cena</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Infiltração no Armazém 4"
                  value={sceneForm.title || ''}
                  onChange={(e) => setSceneForm({ ...sceneForm, title: e.target.value })}
                  className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Local</label>
                <input
                  type="text"
                  placeholder="Ex: Porto de Vermilion"
                  value={sceneForm.locationName || ''}
                  onChange={(e) => setSceneForm({ ...sceneForm, locationName: e.target.value })}
                  className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Objetivo Narrativo / Dramático
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="O que os jogadores precisam descobrir ou superar..."
                  value={sceneForm.objective || ''}
                  onChange={(e) => setSceneForm({ ...sceneForm, objective: e.target.value })}
                  className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Descrição da Narrativa
                </label>
                <textarea
                  rows={2}
                  placeholder="Introdução sensorial da cena..."
                  value={sceneForm.narrativeDescription || ''}
                  onChange={(e) => setSceneForm({ ...sceneForm, narrativeDescription: e.target.value })}
                  className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsSceneModalOpen(false)}
                  className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-slate-300 rounded-lg text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-lg text-xs"
                >
                  Salvar Cena
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pending Modal */}
      {isPendingModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#12131f] border border-zinc-800 rounded-xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-slate-100">Registrar Pendência Narrativa</h3>
            <form onSubmit={handleSavePending} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Assunto / Promessa</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Prometeu devolver o Pikachu ferido"
                  value={pendingForm.title || ''}
                  onChange={(e) => setPendingForm({ ...pendingForm, title: e.target.value })}
                  className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Prioridade</label>
                <select
                  value={pendingForm.priority || 'Média'}
                  onChange={(e) => setPendingForm({ ...pendingForm, priority: e.target.value as any })}
                  className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-purple-500"
                >
                  <option value="Baixa">Baixa</option>
                  <option value="Média">Média</option>
                  <option value="Alta">Alta</option>
                  <option value="Urgente">Urgente</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Descrição</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Detalhes ou consequências..."
                  value={pendingForm.description || ''}
                  onChange={(e) => setPendingForm({ ...pendingForm, description: e.target.value })}
                  className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsPendingModalOpen(false)}
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
