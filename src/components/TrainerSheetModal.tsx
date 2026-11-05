/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { TrainerSheet, PokemonSheet, InventoryItem, ItemCategory } from '../types';
import {
  DiceRank,
  ORIGINS,
  CLASSES,
  TRAINER_SKILLS,
  DICE_VALUES,
} from '../data/rulesData';
import { calculateTrainerMaxHp, calculateTrainerDefense, storageService } from '../services/storageService';
import {
  Heart,
  Shield,
  Award,
  Backpack,
  FileText,
  UserCheck,
  Sparkles,
  Dices,
  Plus,
  Minus,
  Trash2,
  Edit3,
  Save,
  X,
  ExternalLink,
  Camera,
  Coins,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  Unlink,
  Link,
  ChevronRight,
  Info,
} from 'lucide-react';
import { ImageUploadModal } from './ImageUploadModal';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';

export type TrainerModalTab =
  | 'identity'
  | 'stats'
  | 'progression'
  | 'abilities'
  | 'pokemon'
  | 'inventory'
  | 'narrative';

interface TrainerSheetModalProps {
  sheet: TrainerSheet;
  isOpen: boolean;
  canEdit: boolean;
  onClose: () => void;
  onSave: (updated: TrainerSheet) => void;
  onDelete?: (id: string) => void;
  onQuickRoll: (attrName: string, attrDice: DiceRank, skillName: string, skillDice: DiceRank) => void;
  onOpenPokemon?: (pokemon: PokemonSheet) => void;
}

export const TrainerSheetModal: React.FC<TrainerSheetModalProps> = ({
  sheet,
  isOpen,
  canEdit,
  onClose,
  onSave,
  onDelete,
  onQuickRoll,
  onOpenPokemon,
}) => {
  const [formData, setFormData] = useState<TrainerSheet>({ ...sheet });
  const [isEditing, setIsEditing] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TrainerModalTab>('identity');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [hasDraft, setHasDraft] = useState(false);
  const [skillFilterAttr, setSkillFilterAttr] = useState<'Todos' | 'Corpo' | 'Mente' | 'Presença'>('Todos');
  const [trainerPokemons, setTrainerPokemons] = useState<PokemonSheet[]>(() =>
    storageService.getTrainerPokemons(sheet.id)
  );

  // Sync when sheet prop changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({ ...sheet });
      setTrainerPokemons(storageService.getTrainerPokemons(sheet.id));
      const draft = storageService.getDraft<TrainerSheet>('trainer_' + sheet.id);
      if (draft && draft.data && JSON.stringify(draft.data) !== JSON.stringify(sheet)) {
        setHasDraft(true);
      } else {
        setHasDraft(false);
      }
    }
  }, [sheet, isOpen]);

  if (!isOpen) return null;

  // Recalculate derived
  const derivedHp = calculateTrainerMaxHp(formData.corpo, formData.level);
  const derivedDefense = calculateTrainerDefense(formData.skills['Reflexos'] || 'd4');

  const notifyChange = (updated: TrainerSheet) => {
    setFormData(updated);
    storageService.saveDraft('trainer_' + sheet.id, updated);
  };

  const handleRestoreDraft = () => {
    const draft = storageService.getDraft<TrainerSheet>('trainer_' + sheet.id);
    if (draft && draft.data) {
      setFormData(draft.data);
      setIsEditing(true);
      setHasDraft(false);
    }
  };

  const handleDiscardDraft = () => {
    storageService.clearDraft('trainer_' + sheet.id);
    setHasDraft(false);
    setFormData({ ...sheet });
  };

  const handleCorpoChange = (val: DiceRank) => {
    const newMaxHp = calculateTrainerMaxHp(val, formData.level);
    notifyChange({
      ...formData,
      corpo: val,
      maxHp: newMaxHp,
      currentHp: Math.min(formData.currentHp, newMaxHp),
    });
  };

  const handleLevelChange = (newLevel: number) => {
    const clamped = Math.max(1, Math.min(10, newLevel));
    const newMaxHp = calculateTrainerMaxHp(formData.corpo, clamped);
    notifyChange({
      ...formData,
      level: clamped,
      maxHp: newMaxHp,
      currentHp: Math.min(formData.currentHp, newMaxHp),
    });
  };

  const handleOriginChange = (originName: string) => {
    const originDef = ORIGINS.find((o) => o.name === originName);
    if (!originDef) return;

    const updatedSkills = { ...formData.skills };
    originDef.freeSkills.forEach((s) => {
      if (updatedSkills[s] === 'd4' || !updatedSkills[s]) {
        updatedSkills[s] = 'd6';
      }
    });

    notifyChange({
      ...formData,
      origin: originName,
      originAbility: {
        name: originDef.abilityName,
        desc: originDef.abilityDescription,
      },
      skills: updatedSkills,
    });
  };

  const handleClassChange = (className: string) => {
    if (!className) {
      // Clear class and track (e.g. for level 1 character like Douglas Ventura)
      notifyChange({
        ...formData,
        className: '',
        trackName: '',
        classAbilities: [],
      });
      return;
    }

    const classDef = CLASSES.find((c) => c.name === className);
    if (!classDef) return;

    notifyChange({
      ...formData,
      className,
      trackName: classDef.tracks[0]?.name || '',
      classAbilities: [
        { name: classDef.initialAbility.name, desc: classDef.initialAbility.desc },
        { name: classDef.tracks[0]?.feature1.name, desc: classDef.tracks[0]?.feature1.desc },
      ],
    });
  };

  const handleTrackChange = (trackName: string) => {
    if (!formData.className) return;
    const classDef = CLASSES.find((c) => c.name === formData.className);
    if (!classDef) return;

    if (!trackName) {
      notifyChange({
        ...formData,
        trackName: '',
        classAbilities: [{ name: classDef.initialAbility.name, desc: classDef.initialAbility.desc }],
      });
      return;
    }

    const track = classDef.tracks.find((t) => t.name === trackName);
    if (!track) return;

    notifyChange({
      ...formData,
      trackName,
      classAbilities: [
        { name: classDef.initialAbility.name, desc: classDef.initialAbility.desc },
        { name: track.feature1.name, desc: track.feature1.desc },
      ],
    });
  };

  const adjustHp = (delta: number) => {
    const nextHp = Math.max(0, Math.min(derivedHp, formData.currentHp + delta));
    const updated = { ...formData, currentHp: nextHp, maxHp: derivedHp };
    setFormData(updated);
    onSave(updated);
  };

  const fullHeal = () => {
    const updated = { ...formData, currentHp: derivedHp, maxHp: derivedHp };
    setFormData(updated);
    onSave(updated);
  };

  const handleSkillChange = (skillName: string, rank: DiceRank) => {
    const updatedSkills = { ...formData.skills, [skillName]: rank };
    let newDef = formData.defense;
    if (skillName === 'Reflexos') {
      newDef = calculateTrainerDefense(rank);
    }
    notifyChange({
      ...formData,
      skills: updatedSkills,
      defense: newDef,
    });
  };

  const handleAddItem = () => {
    const newItem: InventoryItem = {
      id: 'inv_' + Date.now().toString(36),
      campaignId: formData.campaignId,
      ownerType: 'trainer',
      ownerId: formData.id,
      name: 'Novo Item',
      category: 'Equipamentos',
      quantity: 1,
      weight: '0.2 kg',
      effect: 'Descrição do efeito ou utilidade prática.',
      notes: '',
    };
    notifyChange({
      ...formData,
      inventory: [...(formData.inventory || []), newItem],
    });
  };

  const handleUpdateItem = (index: number, updates: Partial<InventoryItem>) => {
    const list = [...(formData.inventory || [])];
    list[index] = { ...list[index], ...updates };
    notifyChange({ ...formData, inventory: list });
  };

  const handleRemoveItem = (index: number) => {
    const list = [...(formData.inventory || [])];
    list.splice(index, 1);
    notifyChange({ ...formData, inventory: list });
  };

  const handleSaveAll = () => {
    setSaveStatus('saving');
    try {
      const finalData: TrainerSheet = {
        ...formData,
        maxHp: derivedHp,
        defense: derivedDefense,
      };
      onSave(finalData);
      storageService.clearDraft('trainer_' + sheet.id);
      setHasDraft(false);
      setIsEditing(false);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (e) {
      setSaveStatus('error');
    }
  };

  const handleUnlinkPokemon = (pokeId: string) => {
    storageService.assignPokemonToTrainer(pokeId, undefined);
    setTrainerPokemons(storageService.getTrainerPokemons(sheet.id));
  };

  const campaignAvailablePokemons = storageService
    .getPokemons(formData.campaignId)
    .filter((p) => p.trainerId !== formData.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-5xl max-h-[92vh] bg-[#0e0f1a] border border-purple-900/40 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Draft Recovery Banner */}
        {hasDraft && (
          <div className="bg-amber-950/90 border-b border-amber-700/80 px-4 py-2 flex items-center justify-between text-xs text-amber-200">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Existe um rascunho com alterações não salvas desta ficha neste navegador.</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleRestoreDraft}
                className="px-2.5 py-1 rounded bg-amber-600 hover:bg-amber-500 text-white font-bold cursor-pointer"
              >
                Restaurar
              </button>
              <button
                onClick={handleDiscardDraft}
                className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 cursor-pointer"
              >
                Descartar
              </button>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#141525] via-[#10111f] to-[#141525] border-b border-zinc-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative group shrink-0">
              <img
                src={formData.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300'}
                alt={formData.name}
                className="w-14 h-14 rounded-xl object-cover border-2 border-purple-500/50 shadow-md"
              />
              {isEditing && (
                <button
                  type="button"
                  onClick={() => setIsImageModalOpen(true)}
                  className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 rounded-xl flex flex-col items-center justify-center text-[10px] text-white font-bold transition-opacity cursor-pointer"
                  title="Alterar avatar do treinador"
                >
                  <Camera className="w-4 h-4 mb-0.5" />
                  <span>Foto</span>
                </button>
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-black text-white tracking-tight truncate">{formData.name}</h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-mono font-bold bg-purple-950/80 text-purple-300 border border-purple-800/80">
                  Nv. {formData.level} {formData.className ? `• ${formData.className}` : '• Sem classe'}
                </span>
                {formData.trackName && (
                  <span className="text-[11px] px-2 py-0.5 rounded-full font-mono bg-zinc-800 text-zinc-300 border border-zinc-700">
                    {formData.trackName}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5 truncate">
                Origem: <strong className="text-purple-300">{formData.origin}</strong> | Região: {formData.region} | Jogador: {formData.ownerName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Live Save Status */}
            {saveStatus === 'saving' && (
              <span className="text-xs font-mono text-amber-400 flex items-center gap-1">
                <RefreshCw className="w-3 h-3 animate-spin" /> Salvando...
              </span>
            )}
            {saveStatus === 'saved' && (
              <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Salvo.
              </span>
            )}
            {saveStatus === 'error' && (
              <span className="text-xs font-mono text-rose-400 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> Erro ao salvar.
              </span>
            )}

            {canEdit && (
              <button
                onClick={() => {
                  if (isEditing) handleSaveAll();
                  else setIsEditing(true);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  isEditing
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/40'
                    : 'bg-zinc-800 hover:bg-zinc-700 text-slate-200 border border-zinc-700'
                }`}
              >
                {isEditing ? <Save className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
                {isEditing ? 'Salvar Ficha' : 'Editar'}
              </button>
            )}

            {canEdit && onDelete && (
              <button
                onClick={() => setIsDeleteModalOpen(true)}
                className="p-1.5 rounded-lg bg-zinc-800 hover:bg-rose-900/60 text-slate-400 hover:text-rose-300 transition-colors cursor-pointer"
                title="Excluir ficha de treinador"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick HP & Vitals Bar */}
        <div className="p-3 bg-[#121320] border-b border-zinc-800/80 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Pontos de Vida */}
          <div className="p-2.5 rounded-xl bg-[#171828] border border-rose-900/30 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-rose-400 flex items-center gap-1">
                <Heart className="w-3.5 h-3.5 fill-rose-500" /> PONTOS DE VIDA (PV)
              </span>
              <div className="text-xl font-mono font-extrabold text-white mt-0.5">
                {formData.currentHp} <span className="text-sm font-normal text-slate-400">/ {derivedHp}</span>
              </div>
              <div className="w-32 bg-zinc-800 h-1.5 rounded-full overflow-hidden mt-1">
                <div
                  className="bg-rose-500 h-full transition-all"
                  style={{ width: `${Math.max(0, Math.min(100, (formData.currentHp / derivedHp) * 100))}%` }}
                />
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => adjustHp(-1)}
                className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-rose-300 font-bold cursor-pointer"
                title="-1 PV"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => adjustHp(1)}
                className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-emerald-300 font-bold cursor-pointer"
                title="+1 PV"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={fullHeal}
                className="px-2 py-1 rounded bg-rose-600/30 hover:bg-rose-600 text-rose-200 text-[10px] font-bold cursor-pointer"
                title="Restaurar PV total"
              >
                Curar
              </button>
            </div>
          </div>

          {/* Defesa */}
          <div className="p-2.5 rounded-xl bg-[#171828] border border-blue-900/30 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-blue-400 flex items-center gap-1">
                <Shield className="w-3.5 h-3.5" /> DEFESA FIXA
              </span>
              <div className="text-xl font-mono font-extrabold text-white mt-0.5">{derivedDefense}</div>
              <div className="text-[10px] text-slate-400">10 + Reflexos ({formData.skills['Reflexos'] || 'd4'})</div>
            </div>
            <div className="text-[10px] text-slate-400 bg-blue-950/40 p-1.5 rounded-lg border border-blue-800/30">
              Reação: +2 Defesa
            </div>
          </div>

          {/* Iniciativa */}
          <div className="p-2.5 rounded-xl bg-[#171828] border border-purple-900/30 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-purple-400 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> INICIATIVA
              </span>
              <div className="text-sm font-mono font-bold text-white mt-0.5">
                {formData.corpo} + {formData.skills['Reflexos'] || 'd4'}
              </div>
              <div className="text-[10px] text-slate-400">Corpo + Reflexos</div>
            </div>
            <button
              onClick={() => onQuickRoll('Corpo', formData.corpo, 'Reflexos', formData.skills['Reflexos'] || 'd4')}
              className="px-2.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1 cursor-pointer transition-all"
            >
              <Dices className="w-3.5 h-3.5" />
              Rolar
            </button>
          </div>
        </div>

        {/* 7 Tabs Header */}
        <div className="flex border-b border-zinc-800 bg-[#0d0e17] px-3 pt-2 gap-1 text-xs font-semibold overflow-x-auto select-none">
          <button
            onClick={() => setActiveTab('identity')}
            className={`px-3.5 py-2.5 rounded-t-lg transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'identity'
                ? 'bg-[#151726] text-purple-300 border-t-2 border-purple-500 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            1. Identidade
          </button>

          <button
            onClick={() => setActiveTab('stats')}
            className={`px-3.5 py-2.5 rounded-t-lg transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'stats'
                ? 'bg-[#151726] text-purple-300 border-t-2 border-purple-500 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Dices className="w-3.5 h-3.5" />
            2. Atributos & Perícias
          </button>

          <button
            onClick={() => setActiveTab('progression')}
            className={`px-3.5 py-2.5 rounded-t-lg transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'progression'
                ? 'bg-[#151726] text-purple-300 border-t-2 border-purple-500 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            3. Progressão
          </button>

          <button
            onClick={() => setActiveTab('abilities')}
            className={`px-3.5 py-2.5 rounded-t-lg transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'abilities'
                ? 'bg-[#151726] text-purple-300 border-t-2 border-purple-500 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            4. Habilidades
          </button>

          <button
            onClick={() => setActiveTab('pokemon')}
            className={`px-3.5 py-2.5 rounded-t-lg transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'pokemon'
                ? 'bg-[#151726] text-purple-300 border-t-2 border-purple-500 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            5. Equipe Pokémon ({trainerPokemons.length})
          </button>

          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-3.5 py-2.5 rounded-t-lg transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'inventory'
                ? 'bg-[#151726] text-purple-300 border-t-2 border-purple-500 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Backpack className="w-3.5 h-3.5" />
            6. Equipamentos (₽ {formData.pokedollars || 0})
          </button>

          <button
            onClick={() => setActiveTab('narrative')}
            className={`px-3.5 py-2.5 rounded-t-lg transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'narrative'
                ? 'bg-[#151726] text-purple-300 border-t-2 border-purple-500 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            7. História & Notas
          </button>
        </div>

        {/* Tab Contents */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#0f101c]">
          
          {/* TAB 1: IDENTIDADE */}
          {activeTab === 'identity' && (
            <div className="space-y-6 max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Nome do Personagem</label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={formData.name}
                    onChange={(e) => notifyChange({ ...formData, name: e.target.value })}
                    className="w-full bg-[#18192a] border border-zinc-700/80 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500 disabled:opacity-70"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300">Idade</label>
                    <input
                      type="number"
                      disabled={!isEditing}
                      value={formData.age}
                      onChange={(e) => notifyChange({ ...formData, age: parseInt(e.target.value) || 15 })}
                      className="w-full bg-[#18192a] border border-zinc-700/80 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500 disabled:opacity-70"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300">Região de Origem</label>
                    <input
                      type="text"
                      disabled={!isEditing}
                      value={formData.region}
                      onChange={(e) => notifyChange({ ...formData, region: e.target.value })}
                      className="w-full bg-[#18192a] border border-zinc-700/80 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500 disabled:opacity-70"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Conceito do Personagem</label>
                <textarea
                  rows={2}
                  disabled={!isEditing}
                  value={formData.concept}
                  onChange={(e) => notifyChange({ ...formData, concept: e.target.value })}
                  placeholder="Ex: Jovem sobrevivente que aprendeu a conviver com feras das matas antes de iniciar a jornada..."
                  className="w-full bg-[#18192a] border border-zinc-700/80 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500 disabled:opacity-70"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Objetivo / Motivação Primária</label>
                <textarea
                  rows={2}
                  disabled={!isEditing}
                  value={formData.goal}
                  onChange={(e) => notifyChange({ ...formData, goal: e.target.value })}
                  placeholder="Ex: Conquistar o reconhecimento da Liga e desvendar o segredo da usina abandonada..."
                  className="w-full bg-[#18192a] border border-zinc-700/80 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500 disabled:opacity-70"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-zinc-800">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Origem (24 Arquétipos Oficiais)</label>
                  {isEditing ? (
                    <select
                      value={formData.origin}
                      onChange={(e) => handleOriginChange(e.target.value)}
                      className="w-full bg-[#18192a] border border-zinc-700/80 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                    >
                      {ORIGINS.map((o) => (
                        <option key={o.name} value={o.name}>
                          {o.name} (Perícias: {o.freeSkills.join(', ')})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="p-3 rounded-lg bg-[#18192a] border border-zinc-800 text-sm text-purple-200 font-semibold">
                      {formData.origin}
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Jogador Responsável</label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={formData.ownerName}
                    onChange={(e) => notifyChange({ ...formData, ownerName: e.target.value })}
                    className="w-full bg-[#18192a] border border-zinc-700/80 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500 disabled:opacity-70"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ATRIBUTOS E PERÍCIAS */}
          {activeTab === 'stats' && (
            <div className="space-y-6 max-w-4xl mx-auto">
              {/* Três Atributos Base */}
              <div>
                <h3 className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-3">
                  Atributos Base (d4 a d12)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Corpo */}
                  <div className="p-3.5 rounded-xl bg-[#161729] border border-zinc-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold text-rose-300">CORPO</span>
                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-rose-950/80 text-rose-300 border border-rose-800/60 font-bold">
                        {formData.corpo}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mb-3">
                      Força física, robustez, tolerância e vitalidade. Determina o cálculo de PV.
                    </p>
                    {isEditing ? (
                      <select
                        value={formData.corpo}
                        onChange={(e) => handleCorpoChange(e.target.value as DiceRank)}
                        className="w-full bg-[#111220] border border-zinc-700 rounded-lg px-2 py-1.5 text-xs text-white"
                      >
                        {(['d4', 'd6', 'd8', 'd10', 'd12'] as DiceRank[]).map((r) => (
                          <option key={r} value={r}>
                            {r} ({DICE_VALUES[r]} no dado)
                          </option>
                        ))}
                      </select>
                    ) : null}
                  </div>

                  {/* Mente */}
                  <div className="p-3.5 rounded-xl bg-[#161729] border border-zinc-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold text-blue-300">MENTE</span>
                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-blue-950/80 text-blue-300 border border-blue-800/60 font-bold">
                        {formData.mente}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mb-3">
                      Intelecto, raciocínio lógico, conhecimento científico, memória e análise.
                    </p>
                    {isEditing ? (
                      <select
                        value={formData.mente}
                        onChange={(e) => notifyChange({ ...formData, mente: e.target.value as DiceRank })}
                        className="w-full bg-[#111220] border border-zinc-700 rounded-lg px-2 py-1.5 text-xs text-white"
                      >
                        {(['d4', 'd6', 'd8', 'd10', 'd12'] as DiceRank[]).map((r) => (
                          <option key={r} value={r}>
                            {r} ({DICE_VALUES[r]} no dado)
                          </option>
                        ))}
                      </select>
                    ) : null}
                  </div>

                  {/* Presença */}
                  <div className="p-3.5 rounded-xl bg-[#161729] border border-zinc-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold text-emerald-300">PRESENÇA</span>
                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 font-bold">
                        {formData.presenca}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mb-3">
                      Carisma, liderança, empatia, força de vontade e comunicação com Pokémon.
                    </p>
                    {isEditing ? (
                      <select
                        value={formData.presenca}
                        onChange={(e) => notifyChange({ ...formData, presenca: e.target.value as DiceRank })}
                        className="w-full bg-[#111220] border border-zinc-700 rounded-lg px-2 py-1.5 text-xs text-white"
                      >
                        {(['d4', 'd6', 'd8', 'd10', 'd12'] as DiceRank[]).map((r) => (
                          <option key={r} value={r}>
                            {r} ({DICE_VALUES[r]} no dado)
                          </option>
                        ))}
                      </select>
                    ) : null}
                  </div>
                </div>
              </div>

              {/* 24 Perícias com Filtro */}
              <div>
                <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
                  <h3 className="text-xs font-bold text-purple-400 uppercase tracking-wider">
                    24 Perícias do Sistema Além da Próxima Rota
                  </h3>
                  <div className="flex items-center gap-1 text-[11px]">
                    {(['Todos', 'Corpo', 'Mente', 'Presença'] as const).map((attr) => (
                      <button
                        key={attr}
                        onClick={() => setSkillFilterAttr(attr)}
                        className={`px-2.5 py-1 rounded-lg font-medium cursor-pointer transition-colors ${
                          skillFilterAttr === attr
                            ? 'bg-purple-900/60 text-purple-200 border border-purple-700/70 font-bold'
                            : 'bg-zinc-800/60 text-slate-400 hover:text-white'
                        }`}
                      >
                        {attr}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {TRAINER_SKILLS.filter(
                    (s) => skillFilterAttr === 'Todos' || s.defaultAttr === skillFilterAttr
                  ).map((s) => {
                    const currentRank = formData.skills[s.name] || 'd4';
                    const attrDice =
                      s.defaultAttr === 'Corpo'
                        ? formData.corpo
                        : s.defaultAttr === 'Mente'
                        ? formData.mente
                        : formData.presenca;

                    return (
                      <div
                        key={s.name}
                        className="p-2.5 rounded-xl bg-[#141525] border border-zinc-800/80 hover:border-zinc-700/80 flex items-center justify-between transition-colors"
                      >
                        <div className="min-w-0 pr-2">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-slate-200 truncate">{s.name}</span>
                            <span
                              className={`text-[9px] px-1 rounded font-mono ${
                                s.defaultAttr === 'Corpo'
                                  ? 'text-rose-400 bg-rose-950/40'
                                  : s.defaultAttr === 'Mente'
                                  ? 'text-blue-400 bg-blue-950/40'
                                  : 'text-emerald-400 bg-emerald-950/40'
                              }`}
                            >
                              {s.defaultAttr[0]}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 truncate" title={s.description}>
                            {s.description}
                          </p>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {isEditing ? (
                            <select
                              value={currentRank}
                              onChange={(e) => handleSkillChange(s.name, e.target.value as DiceRank)}
                              className="bg-[#1a1c30] border border-zinc-700 rounded px-1.5 py-1 text-xs text-purple-300 font-mono font-bold"
                            >
                              {(['d4', 'd6', 'd8', 'd10', 'd12'] as DiceRank[]).map((r) => (
                                <option key={r} value={r}>
                                  {r}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-purple-950/70 text-purple-300 border border-purple-800/60">
                              {currentRank}
                            </span>
                          )}

                          <button
                            type="button"
                            onClick={() => onQuickRoll(s.defaultAttr, attrDice, s.name, currentRank)}
                            className="p-1 rounded bg-zinc-800 hover:bg-purple-900/50 text-slate-300 hover:text-purple-300 transition-colors cursor-pointer"
                            title={`Rolar ${s.defaultAttr} (${attrDice}) + ${s.name} (${currentRank})`}
                          >
                            <Dices className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PROGRESSÃO */}
          {activeTab === 'progression' && (
            <div className="space-y-6 max-w-4xl mx-auto">
              <div className="p-4 rounded-xl bg-[#161729] border border-purple-900/40 grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <div>
                  <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">
                    Experiência & Nível de Personagem
                  </span>
                  <div className="flex items-center gap-3 mt-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-black text-white font-mono">Nv. {formData.level}</span>
                      {isEditing && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleLevelChange(formData.level - 1)}
                            className="p-1 rounded bg-zinc-800 text-slate-300 hover:bg-zinc-700 cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleLevelChange(formData.level + 1)}
                            className="p-1 rounded bg-zinc-800 text-slate-300 hover:bg-zinc-700 cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="h-6 w-px bg-zinc-800" />
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-slate-400">XP Atual:</span>
                      {isEditing ? (
                        <input
                          type="number"
                          value={formData.xp}
                          onChange={(e) => notifyChange({ ...formData, xp: parseInt(e.target.value) || 0 })}
                          className="w-16 bg-[#111220] border border-zinc-700 rounded px-2 py-1 text-xs text-white font-mono"
                        />
                      ) : (
                        <span className="text-sm font-mono font-bold text-purple-300">{formData.xp}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-[#111220] border border-zinc-800 text-xs text-slate-300">
                  <div className="font-bold text-purple-300 mb-1 flex items-center gap-1">
                    <Info className="w-3.5 h-3.5" /> Regras Oficiais de Desbloqueio
                  </div>
                  <p className="text-[11px] text-slate-400">
                    No <strong>Nível 1</strong>, o personagem possui apenas sua <strong>Origem</strong> e NÃO requer classe. A <strong>Classe</strong> é desbloqueada no <strong>Nível 2</strong>, a <strong>Habilidade Pessoal</strong> no <strong>Nível 3</strong>, e a <strong>Trilha de Especialização</strong> no <strong>Nível 4</strong>.
                  </p>
                </div>
              </div>

              {/* Tabela Visual dos Marcos de Nível */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Trilha de Marcos por Nível
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                  {/* Nível 1 */}
                  <div
                    className={`p-3 rounded-xl border ${
                      formData.level >= 1
                        ? 'bg-purple-950/40 border-purple-800/70 text-purple-200'
                        : 'bg-zinc-900/40 border-zinc-800 text-slate-500'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs">NÍVEL 1</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                    <div className="text-[11px] font-semibold text-white">Origem Escolhida</div>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {formData.origin} (+2 perícias gratuitas e 1 habilidade de origem).
                    </p>
                  </div>

                  {/* Nível 2 */}
                  <div
                    className={`p-3 rounded-xl border ${
                      formData.level >= 2
                        ? 'bg-purple-950/40 border-purple-800/70 text-purple-200'
                        : 'bg-zinc-900/40 border-zinc-800 text-slate-500'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs">NÍVEL 2</span>
                      {formData.level >= 2 ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <span className="text-[9px] font-mono px-1 rounded bg-zinc-800 text-zinc-400">Bloqueado</span>
                      )}
                    </div>
                    <div className="text-[11px] font-semibold text-white">Desbloqueio de Classe</div>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {formData.className || 'Ainda não escolhida (escolha no Nível 2)'}.
                    </p>
                  </div>

                  {/* Nível 3 */}
                  <div
                    className={`p-3 rounded-xl border ${
                      formData.level >= 3
                        ? 'bg-purple-950/40 border-purple-800/70 text-purple-200'
                        : 'bg-zinc-900/40 border-zinc-800 text-slate-500'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs">NÍVEL 3</span>
                      {formData.level >= 3 ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <span className="text-[9px] font-mono px-1 rounded bg-zinc-800 text-zinc-400">Bloqueado</span>
                      )}
                    </div>
                    <div className="text-[11px] font-semibold text-white">Habilidade Customizada</div>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {formData.personalAbility?.name || 'Habilidade pessoal desenvolvida'}.
                    </p>
                  </div>

                  {/* Nível 4 */}
                  <div
                    className={`p-3 rounded-xl border ${
                      formData.level >= 4
                        ? 'bg-purple-950/40 border-purple-800/70 text-purple-200'
                        : 'bg-zinc-900/40 border-zinc-800 text-slate-500'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs">NÍVEL 4</span>
                      {formData.level >= 4 ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <span className="text-[9px] font-mono px-1 rounded bg-zinc-800 text-zinc-400">Bloqueado</span>
                      )}
                    </div>
                    <div className="text-[11px] font-semibold text-white">Trilha de Especialização</div>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {formData.trackName || 'Especialização da classe escolhida'}.
                    </p>
                  </div>
                </div>
              </div>

              {/* Seleção de Classe e Trilha (Opcional / Flexível) */}
              <div className="p-4 rounded-xl bg-[#141525] border border-zinc-800 space-y-4">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Configuração de Classe & Trilha
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">
                      Classe do Treinador {formData.level < 2 && <span className="text-amber-400 font-normal">(Desbloqueio normal no Nv. 2)</span>}
                    </label>
                    {isEditing ? (
                      <select
                        value={formData.className || ''}
                        onChange={(e) => handleClassChange(e.target.value)}
                        className="w-full bg-[#18192a] border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                      >
                        <option value="">-- Sem classe definida (Recomendado para Nível 1) --</option>
                        {CLASSES.map((c) => (
                          <option key={c.name} value={c.name}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="p-2.5 rounded-lg bg-[#18192a] border border-zinc-800 text-sm text-slate-200 font-medium">
                        {formData.className || 'Sem classe definida (Nível 1)'}
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">
                      Trilha de Especialização {formData.level < 4 && <span className="text-amber-400 font-normal">(Desbloqueio normal no Nv. 4)</span>}
                    </label>
                    {isEditing ? (
                      <select
                        disabled={!formData.className}
                        value={formData.trackName || ''}
                        onChange={(e) => handleTrackChange(e.target.value)}
                        className="w-full bg-[#18192a] border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500 disabled:opacity-50"
                      >
                        <option value="">-- Sem trilha definida --</option>
                        {formData.className &&
                          CLASSES.find((c) => c.name === formData.className)?.tracks.map((t) => (
                            <option key={t.name} value={t.name}>
                              {t.name}
                            </option>
                          ))}
                      </select>
                    ) : (
                      <div className="p-2.5 rounded-lg bg-[#18192a] border border-zinc-800 text-sm text-slate-200 font-medium">
                        {formData.trackName || 'Sem trilha definida'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: HABILIDADES */}
          {activeTab === 'abilities' && (
            <div className="space-y-5 max-w-4xl mx-auto">
              {/* Habilidade de Origem */}
              <div className="p-4 rounded-xl bg-[#161729] border border-purple-900/40">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-xs px-2 py-0.5 rounded font-mono font-bold bg-purple-950 text-purple-300 border border-purple-800/60">
                    Origem: {formData.origin}
                  </span>
                  <h4 className="text-sm font-bold text-white">{formData.originAbility.name}</h4>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{formData.originAbility.desc}</p>
              </div>

              {/* Habilidades de Classe */}
              <div>
                <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-2">
                  Habilidades de Classe {formData.className ? `(${formData.className})` : '(Nenhuma classe definida)'}
                </h4>
                {formData.classAbilities && formData.classAbilities.length > 0 ? (
                  <div className="space-y-2.5">
                    {formData.classAbilities.map((ab, idx) => (
                      <div key={idx} className="p-3.5 rounded-xl bg-[#141525] border border-zinc-800">
                        <div className="text-xs font-bold text-white mb-1">{ab.name}</div>
                        <p className="text-xs text-slate-300 leading-relaxed">{ab.desc}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-[#141525] border border-dashed border-zinc-800 text-xs text-slate-400 text-center">
                    Personagem ainda não possui classe definida. As habilidades de classe serão liberadas ao subir para o Nível 2.
                  </div>
                )}
              </div>

              {/* Habilidade Pessoal Customizada */}
              <div className="p-4 rounded-xl bg-[#161729] border border-zinc-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> Habilidade Pessoal Customizada
                  </span>
                </div>
                {isEditing ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={formData.personalAbility?.name || ''}
                      onChange={(e) =>
                        notifyChange({
                          ...formData,
                          personalAbility: {
                            name: e.target.value,
                            desc: formData.personalAbility?.desc || '',
                          },
                        })
                      }
                      placeholder="Nome da habilidade pessoal..."
                      className="w-full bg-[#111220] border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-white"
                    />
                    <textarea
                      rows={2}
                      value={formData.personalAbility?.desc || ''}
                      onChange={(e) =>
                        notifyChange({
                          ...formData,
                          personalAbility: {
                            name: formData.personalAbility?.name || 'Habilidade Pessoal',
                            desc: e.target.value,
                          },
                        })
                      }
                      placeholder="Descrição mecânica e narrativa..."
                      className="w-full bg-[#111220] border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-white"
                    />
                  </div>
                ) : (
                  <div>
                    <div className="text-xs font-bold text-white mb-0.5">
                      {formData.personalAbility?.name || 'Sem habilidade pessoal registrada'}
                    </div>
                    <p className="text-xs text-slate-300">
                      {formData.personalAbility?.desc || 'Pode ser preenchida a qualquer momento.'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: POKÉMON */}
          {activeTab === 'pokemon' && (
            <div className="space-y-6 max-w-4xl mx-auto">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Equipe Pokémon do Treinador</h3>
                  <p className="text-xs text-slate-400">
                    Estes Pokémon estão formalmente sob os cuidados de {formData.name}.
                  </p>
                </div>
              </div>

              {trainerPokemons.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {trainerPokemons.map((poke) => (
                    <div
                      key={poke.id}
                      className="p-3.5 rounded-xl bg-[#141525] border border-zinc-800 hover:border-purple-800/60 flex items-center justify-between transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={poke.spriteUrl}
                          alt={poke.nickname || poke.species}
                          className="w-12 h-12 rounded-lg bg-zinc-900 object-contain p-1 border border-zinc-800"
                        />
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-white truncate">
                            {poke.nickname} {poke.nickname !== poke.species && `(${poke.species})`}
                          </h4>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] font-mono font-bold text-purple-300">Nv. {poke.level}</span>
                            <span className="text-[10px] text-slate-400">• {poke.types.join('/')}</span>
                            <span className="text-[10px] text-rose-400 font-mono">PV: {poke.currentHp}/{poke.maxHp}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        {onOpenPokemon && (
                          <button
                            onClick={() => onOpenPokemon(poke)}
                            className="px-2.5 py-1.5 rounded-lg bg-purple-900/50 hover:bg-purple-800 text-purple-200 text-xs font-bold flex items-center gap-1 cursor-pointer"
                            title="Abrir ficha do Pokémon"
                          >
                            <ExternalLink className="w-3 h-3" /> Ficha
                          </button>
                        )}
                        {canEdit && (
                          <button
                            onClick={() => handleUnlinkPokemon(poke.id)}
                            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-amber-950/70 text-slate-400 hover:text-amber-300 transition-colors cursor-pointer"
                            title="Desvincular da equipe (não exclui a criatura)"
                          >
                            <Unlink className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 rounded-xl bg-[#141525] border border-dashed border-zinc-800 text-center space-y-2">
                  <Sparkles className="w-8 h-8 text-slate-500 mx-auto" />
                  <p className="text-xs text-slate-400">
                    Nenhum Pokémon vinculado a este treinador no momento.
                  </p>
                </div>
              )}

              {/* Vincular Pokémon da Campanha */}
              {canEdit && campaignAvailablePokemons.length > 0 && (
                <div className="pt-4 border-t border-zinc-800">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Vincular Pokémon Existente na Mesa
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {campaignAvailablePokemons.map((p) => (
                      <div
                        key={p.id}
                        className="p-2.5 rounded-lg bg-[#111220] border border-zinc-800 flex items-center justify-between text-xs"
                      >
                        <div className="truncate pr-2">
                          <span className="font-bold text-white truncate block">{p.nickname}</span>
                          <span className="text-[10px] text-slate-400">{p.species} • Nv. {p.level}</span>
                        </div>
                        <button
                          onClick={() => {
                            storageService.assignPokemonToTrainer(p.id, formData.id);
                            setTrainerPokemons(storageService.getTrainerPokemons(formData.id));
                          }}
                          className="px-2 py-1 rounded bg-zinc-800 hover:bg-purple-900/60 text-purple-300 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Link className="w-3 h-3" /> Adicionar
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 6: EQUIPAMENTOS & INVENTÁRIO */}
          {activeTab === 'inventory' && (
            <div className="space-y-6 max-w-4xl mx-auto">
              {/* Pokédolares */}
              <div className="p-4 rounded-xl bg-[#161729] border border-amber-900/30 flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  <Coins className="w-6 h-6 text-amber-400" />
                  <div>
                    <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                      Pokédolares (₽)
                    </span>
                    <div className="text-2xl font-black text-white font-mono mt-0.5">
                      ₽ {formData.pokedollars || 0}
                    </div>
                  </div>
                </div>

                {isEditing && (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => notifyChange({ ...formData, pokedollars: Math.max(0, (formData.pokedollars || 0) - 100) })}
                      className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-slate-300 text-xs font-mono font-bold cursor-pointer"
                    >
                      -100 ₽
                    </button>
                    <button
                      onClick={() => notifyChange({ ...formData, pokedollars: (formData.pokedollars || 0) + 100 })}
                      className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-slate-300 text-xs font-mono font-bold cursor-pointer"
                    >
                      +100 ₽
                    </button>
                    <button
                      onClick={() => notifyChange({ ...formData, pokedollars: (formData.pokedollars || 0) + 500 })}
                      className="px-2 py-1 rounded bg-amber-600/40 hover:bg-amber-600 text-amber-200 text-xs font-mono font-bold cursor-pointer"
                    >
                      +500 ₽
                    </button>
                  </div>
                )}
              </div>

              {/* Itens do Inventário */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Mochila & Itens ({formData.inventory?.length || 0})
                  </h3>
                  {isEditing && (
                    <button
                      onClick={handleAddItem}
                      className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Adicionar Item
                    </button>
                  )}
                </div>

                <div className="space-y-2">
                  {formData.inventory && formData.inventory.length > 0 ? (
                    formData.inventory.map((item, idx) => (
                      <div
                        key={item.id || idx}
                        className="p-3 rounded-xl bg-[#141525] border border-zinc-800/80 flex items-center justify-between gap-3"
                      >
                        <div className="flex-1 min-w-0">
                          {isEditing ? (
                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 mb-1.5">
                              <input
                                type="text"
                                value={item.name}
                                onChange={(e) => handleUpdateItem(idx, { name: e.target.value })}
                                placeholder="Nome do item..."
                                className="bg-[#111220] border border-zinc-700 rounded px-2 py-1 text-xs text-white"
                              />
                              <select
                                value={item.category}
                                onChange={(e) => handleUpdateItem(idx, { category: e.target.value as ItemCategory })}
                                className="bg-[#111220] border border-zinc-700 rounded px-2 py-1 text-xs text-white"
                              >
                                {['Poké Bolas', 'Medicamentos', 'Ferramentas', 'Equipamentos', 'Itens Especiais', 'Outros'].map(
                                  (cat) => (
                                    <option key={cat} value={cat}>
                                      {cat}
                                    </option>
                                  )
                                )}
                              </select>
                              <div className="flex items-center gap-1">
                                <span className="text-[10px] text-slate-400">Qtd:</span>
                                <input
                                  type="number"
                                  value={item.quantity}
                                  onChange={(e) => handleUpdateItem(idx, { quantity: parseInt(e.target.value) || 1 })}
                                  className="w-14 bg-[#111220] border border-zinc-700 rounded px-2 py-1 text-xs text-white font-mono"
                                />
                              </div>
                              <input
                                type="text"
                                value={item.effect}
                                onChange={(e) => handleUpdateItem(idx, { effect: e.target.value })}
                                placeholder="Efeito mecânico..."
                                className="bg-[#111220] border border-zinc-700 rounded px-2 py-1 text-xs text-white"
                              />
                            </div>
                          ) : (
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-white">{item.name}</span>
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-800 text-purple-300 font-mono">
                                  {item.category}
                                </span>
                                <span className="text-xs font-mono font-bold text-emerald-400">x{item.quantity}</span>
                              </div>
                              <p className="text-xs text-slate-300 mt-0.5">{item.effect}</p>
                            </div>
                          )}
                        </div>

                        {isEditing && (
                          <button
                            onClick={() => handleRemoveItem(idx)}
                            className="p-1 rounded bg-zinc-800 hover:bg-rose-900/60 text-slate-400 hover:text-rose-300 cursor-pointer"
                            title="Remover item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="p-6 rounded-xl bg-[#141525] border border-dashed border-zinc-800 text-center text-xs text-slate-400">
                      Mochila vazia. Clique em "Adicionar Item" durante o modo de edição.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: HISTÓRIA E OBSERVAÇÕES */}
          {activeTab === 'narrative' && (
            <div className="space-y-4 max-w-4xl mx-auto">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Relações & Vínculos Sociais</label>
                <textarea
                  rows={2}
                  disabled={!isEditing}
                  value={formData.relationships || ''}
                  onChange={(e) => notifyChange({ ...formData, relationships: e.target.value })}
                  placeholder="Laços de amizade, rivais, dívidas morais ou vínculos com outros treinadores..."
                  className="w-full bg-[#18192a] border border-zinc-700/80 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500 disabled:opacity-70"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Medos, Traumas & Fraquezas</label>
                <textarea
                  rows={2}
                  disabled={!isEditing}
                  value={formData.fears || ''}
                  onChange={(e) => notifyChange({ ...formData, fears: e.target.value })}
                  placeholder="Situações que causam hesitação, fobia de locais fechados, receio de falhar com a equipe..."
                  className="w-full bg-[#18192a] border border-zinc-700/80 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500 disabled:opacity-70"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Questões em Aberto & Mistérios Pessoais</label>
                <textarea
                  rows={2}
                  disabled={!isEditing}
                  value={formData.openQuestions || ''}
                  onChange={(e) => notifyChange({ ...formData, openQuestions: e.target.value })}
                  placeholder="Perguntas que movem o personagem: De onde veio o medalhão herdado? Onde está meu irmão?..."
                  className="w-full bg-[#18192a] border border-zinc-700/80 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500 disabled:opacity-70"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Anotações Gerais & Histórico de Sessões</label>
                <textarea
                  rows={3}
                  disabled={!isEditing}
                  value={formData.notes || ''}
                  onChange={(e) => notifyChange({ ...formData, notes: e.target.value })}
                  placeholder="Anotações livres do jogador ou do mestre..."
                  className="w-full bg-[#18192a] border border-zinc-700/80 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500 disabled:opacity-70"
                />
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-3 bg-[#0d0e17] border-t border-zinc-800/80 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span>Project Mew RPG</span>
            <span>•</span>
            <span>Além da Próxima Rota Ed. 1.0</span>
          </div>

          <div className="flex items-center gap-2">
            {isEditing && (
              <button
                onClick={handleSaveAll}
                className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-950/40"
              >
                <Save className="w-3.5 h-3.5" /> Salvar Alterações
              </button>
            )}
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-slate-300 cursor-pointer"
            >
              Fechar
            </button>
          </div>
        </div>

      </div>

      {/* Image Upload Modal */}
      {isImageModalOpen && (
        <ImageUploadModal
          isOpen={isImageModalOpen}
          title="Alterar Avatar do Treinador"
          currentImageUrl={formData.avatarUrl}
          defaultFallbackUrl="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300"
          onClose={() => setIsImageModalOpen(false)}
          onSave={(url) => {
            notifyChange({ ...formData, avatarUrl: url });
            setIsImageModalOpen(false);
          }}
        />
      )}

      {/* Confirm Delete Modal */}
      {isDeleteModalOpen && onDelete && (
        <ConfirmDeleteModal
          isOpen={isDeleteModalOpen}
          entityType="Treinador"
          entityName={formData.name}
          details="Todos os Pokémon vinculados serão mantidos na mesa como independentes."
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={() => {
            setIsDeleteModalOpen(false);
            onDelete(formData.id);
          }}
        />
      )}
    </div>
  );
};
