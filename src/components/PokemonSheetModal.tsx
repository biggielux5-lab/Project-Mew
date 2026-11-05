/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { PokemonSheet, PokemonMove, TrainerSheet } from '../types';
import {
  DiceRank,
  PokemonType,
  POKEMON_TYPES,
  TYPE_COLORS,
  POKEMON_SKILLS,
  CONDITIONS,
  DICE_VALUES,
} from '../data/rulesData';
import {
  storageService,
  calculatePokemonMaxHp,
  calculatePokemonMaxPe,
  calculatePokemonDefense,
} from '../services/storageService';
import {
  Heart,
  Zap,
  Shield,
  Sparkles,
  Dices,
  Plus,
  Minus,
  Edit3,
  Save,
  Trash2,
  X,
  Swords,
  Activity,
  HeartHandshake,
  Flame,
  UserCheck,
  BookOpen,
  Camera,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  Unlink,
  Package,
  Calendar,
  MapPin,
  Check,
  ChevronDown,
} from 'lucide-react';
import { ImageUploadModal } from './ImageUploadModal';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';
import { MovePickerModal } from './MovePickerModal';
import { InventoryItem, PokemonDiaryEntry } from '../types';

interface PokemonSheetModalProps {
  sheet: PokemonSheet;
  isOpen: boolean;
  canEdit: boolean;
  trainers?: TrainerSheet[];
  onClose: () => void;
  onSave: (updated: PokemonSheet) => void;
  onDelete?: (id: string) => void;
  onQuickRoll: (attrName: string, attrDice: DiceRank, skillName: string, skillDice: DiceRank) => void;
  onExecuteMove?: (move: PokemonMove) => void;
}

export const PokemonSheetModal: React.FC<PokemonSheetModalProps> = ({
  sheet,
  isOpen,
  canEdit,
  trainers = [],
  onClose,
  onSave,
  onDelete,
  onQuickRoll,
  onExecuteMove,
}) => {
  const [formData, setFormData] = useState<PokemonSheet>({ ...sheet });
  const [isEditing, setIsEditing] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isMovePickerOpen, setIsMovePickerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'moves' | 'skills' | 'status' | 'conditions' | 'notes' | 'diary'>('moves');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [hasDraft, setHasDraft] = useState(false);

  // 4-Move limit handling & Move swapping
  const [pendingMoveToLearn, setPendingMoveToLearn] = useState<PokemonMove | null>(null);

  // Item usage on Pokemon
  const [isUseItemModalOpen, setIsUseItemModalOpen] = useState(false);
  const [useItemFeedback, setUseItemFeedback] = useState<string | null>(null);

  // Manual Diary Entry Form
  const [isAddingDiaryEntry, setIsAddingDiaryEntry] = useState(false);
  const [newDiaryEventType, setNewDiaryEventType] = useState<PokemonDiaryEntry['eventType']>('training');
  const [newDiaryTitle, setNewDiaryTitle] = useState('');
  const [newDiaryDescription, setNewDiaryDescription] = useState('');

  // Sync state whenever sheet prop changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({ ...sheet });
      const draft = storageService.getDraft<PokemonSheet>('pokemon_' + sheet.id);
      if (draft && draft.data && JSON.stringify(draft.data) !== JSON.stringify(sheet)) {
        setHasDraft(true);
      } else {
        setHasDraft(false);
      }
    }
  }, [sheet, isOpen]);

  if (!isOpen) return null;

  // Recalculate derived
  const derivedHp = calculatePokemonMaxHp(formData.corpo, formData.level, formData.evolutionsCount || 0);
  const derivedPe = calculatePokemonMaxPe(formData.level, formData.evolutionsCount || 0);
  const derivedDef = calculatePokemonDefense(formData.skills['Agilidade'] || 'd6');

  const notifyChange = (updated: PokemonSheet) => {
    setFormData(updated);
    storageService.saveDraft('pokemon_' + sheet.id, updated);
  };

  const handleRestoreDraft = () => {
    const draft = storageService.getDraft<PokemonSheet>('pokemon_' + sheet.id);
    if (draft && draft.data) {
      setFormData(draft.data);
      setIsEditing(true);
      setHasDraft(false);
    }
  };

  const handleDiscardDraft = () => {
    storageService.clearDraft('pokemon_' + sheet.id);
    setHasDraft(false);
    setFormData({ ...sheet });
  };

  const adjustHp = (delta: number) => {
    const next = Math.max(0, Math.min(derivedHp, formData.currentHp + delta));
    const updated = { ...formData, currentHp: next, maxHp: derivedHp };
    setFormData(updated);
    onSave(updated);
  };

  const adjustPe = (delta: number) => {
    const next = Math.max(0, Math.min(derivedPe, formData.currentPe + delta));
    const updated = { ...formData, currentPe: next, maxPe: derivedPe };
    setFormData(updated);
    onSave(updated);
  };

  const fullRestore = () => {
    const updated = {
      ...formData,
      currentHp: derivedHp,
      maxHp: derivedHp,
      currentPe: derivedPe,
      maxPe: derivedPe,
      conditions: [],
    };
    setFormData(updated);
    onSave(updated);
  };

  const toggleCondition = (condName: string) => {
    const exists = formData.conditions.includes(condName);
    const updatedConditions = exists
      ? formData.conditions.filter((c) => c !== condName)
      : [...formData.conditions, condName];
    const updated = { ...formData, conditions: updatedConditions };
    notifyChange(updated);
    onSave(updated);
  };

  const handleUseMove = (m: PokemonMove) => {
    if (formData.currentPe >= m.peCost) {
      adjustPe(-m.peCost);
    }
    if (onExecuteMove) {
      onExecuteMove(m);
    }
  };

  const handleRemoveMove = (moveIndex: number) => {
    const updatedMoves = [...formData.moves];
    updatedMoves.splice(moveIndex, 1);
    notifyChange({ ...formData, moves: updatedMoves });
  };

  const handleAddMoveFromLibrary = (libMove: PokemonMove) => {
    const exists = formData.moves.some((m) => m.id === libMove.id || m.name === libMove.name);
    if (exists) return;

    if (formData.moves.length >= 4) {
      setPendingMoveToLearn(libMove);
      return;
    }

    applyLearnMove(libMove);
  };

  const applyLearnMove = (libMove: PokemonMove, replaceIndex?: number) => {
    let updatedMoves = [...formData.moves];
    if (typeof replaceIndex === 'number' && replaceIndex >= 0 && replaceIndex < updatedMoves.length) {
      const oldMove = updatedMoves[replaceIndex];
      updatedMoves[replaceIndex] = libMove;
      const diaryEntry: PokemonDiaryEntry = {
        id: 'diary_' + Date.now().toString(36),
        pokemonId: formData.id,
        timestamp: new Date().toISOString(),
        eventType: 'move_learned',
        title: `Novo Golpe: ${libMove.name}`,
        description: `Substituiu ${oldMove.name} por ${libMove.name} (${libMove.type}, ${libMove.category}, ${libMove.tier}).`,
      };
      const updatedDiary = [...(formData.diary || []), diaryEntry];
      notifyChange({ ...formData, moves: updatedMoves, diary: updatedDiary });
      storageService.addPokemonDiaryEntry(formData.id, diaryEntry);
    } else {
      updatedMoves.push(libMove);
      const diaryEntry: PokemonDiaryEntry = {
        id: 'diary_' + Date.now().toString(36),
        pokemonId: formData.id,
        timestamp: new Date().toISOString(),
        eventType: 'move_learned',
        title: `Golpe Aprendido: ${libMove.name}`,
        description: `Aprendeu ${libMove.name} (${libMove.type}, ${libMove.category}, ${libMove.tier}).`,
      };
      const updatedDiary = [...(formData.diary || []), diaryEntry];
      notifyChange({ ...formData, moves: updatedMoves, diary: updatedDiary });
      storageService.addPokemonDiaryEntry(formData.id, diaryEntry);
    }
    setPendingMoveToLearn(null);
  };

  // Consumable inventory items from trainer or common campaign storage
  const availableItems = React.useMemo(() => {
    const allInv = storageService.getInventoryItems(formData.campaignId);
    return allInv.filter(
      (item) =>
        item.quantity > 0 &&
        (item.ownerType === 'campaign' || (formData.trainerId && item.ownerId === formData.trainerId))
    );
  }, [formData.campaignId, formData.trainerId, isOpen]);

  const handleConsumeItemOnPokemon = (item: InventoryItem) => {
    const res = storageService.consumeInventoryItem(item.id, formData.id);
    setUseItemFeedback(res.message);
    const refreshed = storageService.getPokemon(formData.id);
    if (refreshed) {
      setFormData(refreshed);
      onSave(refreshed);
    }
    setTimeout(() => setUseItemFeedback(null), 4000);
  };

  const handleAddManualDiaryEntry = () => {
    if (!newDiaryTitle.trim() || !newDiaryDescription.trim()) return;
    const entry: PokemonDiaryEntry = {
      id: 'diary_' + Date.now().toString(36),
      pokemonId: formData.id,
      timestamp: new Date().toISOString(),
      eventType: newDiaryEventType,
      title: newDiaryTitle.trim(),
      description: newDiaryDescription.trim(),
    };
    const updatedDiary = [...(formData.diary || []), entry];
    notifyChange({ ...formData, diary: updatedDiary });
    storageService.addPokemonDiaryEntry(formData.id, entry);
    setNewDiaryTitle('');
    setNewDiaryDescription('');
    setIsAddingDiaryEntry(false);
  };

  const handleSaveAll = () => {
    setSaveStatus('saving');
    try {
      const finalData: PokemonSheet = {
        ...formData,
        maxHp: derivedHp,
        maxPe: derivedPe,
        defense: derivedDef,
      };
      onSave(finalData);
      storageService.clearDraft('pokemon_' + sheet.id);
      setHasDraft(false);
      setIsEditing(false);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (e) {
      setSaveStatus('error');
    }
  };

  const currentTrainer = trainers.find((t) => t.id === formData.trainerId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-4xl max-h-[92vh] bg-[#0e0f1a] border border-purple-900/40 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Draft Banner */}
        {hasDraft && (
          <div className="bg-amber-950/90 border-b border-amber-700/80 px-4 py-2 flex items-center justify-between text-xs text-amber-200">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Rascunho detectado com alterações não salvas deste Pokémon.</span>
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
        <div className="p-4 bg-gradient-to-r from-[#141525] via-[#10111f] to-[#141525] border-b border-zinc-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative group shrink-0">
              <img
                src={formData.spriteUrl}
                alt={formData.nickname || formData.species}
                className="w-14 h-14 rounded-xl bg-zinc-900 object-contain p-1 border-2 border-purple-500/50 shadow-md"
              />
              {isEditing && (
                <button
                  type="button"
                  onClick={() => setIsImageModalOpen(true)}
                  className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 rounded-xl flex flex-col items-center justify-center text-[10px] text-white font-bold transition-opacity cursor-pointer"
                >
                  <Camera className="w-4 h-4 mb-0.5" />
                  <span>Foto</span>
                </button>
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-black text-white tracking-tight truncate">
                  {formData.nickname}
                </h2>
                {formData.nickname !== formData.species && (
                  <span className="text-xs text-slate-400">({formData.species})</span>
                )}
                <span className="text-xs px-2.5 py-0.5 rounded-full font-mono font-bold bg-purple-950 text-purple-300 border border-purple-800">
                  Nv. {formData.level}
                </span>
                {formData.types.map((t) => {
                  const style = TYPE_COLORS[t];
                  return (
                    <span
                      key={t}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${style?.bg || 'bg-zinc-700'} ${style?.text || 'text-white'}`}
                    >
                      {t}
                    </span>
                  );
                })}
              </div>

              <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-2 flex-wrap">
                <span>
                  Treinador:{' '}
                  {currentTrainer ? (
                    <strong className="text-purple-300">{currentTrainer.name}</strong>
                  ) : (
                    <span className="text-amber-400 font-medium">Selvagem / Sem Treinador</span>
                  )}
                </span>
                <span>•</span>
                <span>Vínculo: Estágio {formData.bondStage || 0}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
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
                <AlertCircle className="w-3.5 h-3.5" /> Erro.
              </span>
            )}

            {canEdit && (
              <button
                onClick={() => {
                  if (isEditing) handleSaveAll();
                  else setIsEditing(true);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                  isEditing
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg'
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
                title="Excluir Pokémon"
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

        {/* Vitals Bar (PV, PE, Defesa) */}
        <div className="p-3 bg-[#121320] border-b border-zinc-800 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Pontos de Vida (PV) */}
          <div className="p-2.5 rounded-xl bg-[#171828] border border-rose-900/30 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-rose-400 flex items-center gap-1">
                <Heart className="w-3.5 h-3.5 fill-rose-500" /> PV ATUAL
              </span>
              <div className="text-xl font-mono font-extrabold text-white mt-0.5">
                {formData.currentHp} <span className="text-sm font-normal text-slate-400">/ {derivedHp}</span>
              </div>
              <div className="w-28 bg-zinc-800 h-1.5 rounded-full overflow-hidden mt-1">
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
                <Minus className="w-3 h-3" />
              </button>
              <button
                onClick={() => adjustHp(1)}
                className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-emerald-300 font-bold cursor-pointer"
                title="+1 PV"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Pontos de Energia (PE) */}
          <div className="p-2.5 rounded-xl bg-[#171828] border border-cyan-900/30 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-cyan-400 flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 fill-cyan-400" /> PE ATUAL
              </span>
              <div className="text-xl font-mono font-extrabold text-white mt-0.5">
                {formData.currentPe} <span className="text-sm font-normal text-slate-400">/ {derivedPe}</span>
              </div>
              <div className="w-28 bg-zinc-800 h-1.5 rounded-full overflow-hidden mt-1">
                <div
                  className="bg-cyan-400 h-full transition-all"
                  style={{ width: `${Math.max(0, Math.min(100, (formData.currentPe / derivedPe) * 100))}%` }}
                />
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => adjustPe(-1)}
                className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-cyan-300 font-bold cursor-pointer"
                title="-1 PE"
              >
                <Minus className="w-3 h-3" />
              </button>
              <button
                onClick={() => adjustPe(1)}
                className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-cyan-300 font-bold cursor-pointer"
                title="+1 PE"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Defesa e Ações Rápidas */}
          <div className="p-2.5 rounded-xl bg-[#171828] border border-purple-900/30 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-purple-400 flex items-center gap-1">
                <Shield className="w-3.5 h-3.5" /> DEFESA FIXA
              </span>
              <div className="text-xl font-mono font-extrabold text-white mt-0.5">{derivedDef}</div>
              <div className="text-[10px] text-slate-400">10 + Agilidade ({formData.skills['Agilidade'] || 'd6'})</div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIsUseItemModalOpen(true)}
                className="px-2.5 py-1.5 rounded-lg bg-purple-600/30 hover:bg-purple-600 text-purple-200 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                title="Usar item da mochila no Pokémon (Poções, Antídotos, etc.)"
              >
                <Package className="w-3.5 h-3.5" />
                <span>Usar Item</span>
              </button>
              <button
                onClick={fullRestore}
                className="px-2.5 py-1.5 rounded-lg bg-emerald-600/30 hover:bg-emerald-600 text-emerald-200 text-xs font-bold transition-colors cursor-pointer"
                title="Restaurar PV, PE e limpar condições"
              >
                Restaurar
              </button>
            </div>
          </div>
        </div>

        {/* Feedback message for item consumption */}
        {useItemFeedback && (
          <div className="bg-emerald-950/80 border-b border-emerald-700/80 px-4 py-2 text-xs text-emerald-200 flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{useItemFeedback}</span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex border-b border-zinc-800 bg-[#0d0e17] px-3 pt-2 gap-1 text-xs font-semibold overflow-x-auto select-none">
          <button
            onClick={() => setActiveTab('moves')}
            className={`px-3.5 py-2.5 rounded-t-lg transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'moves'
                ? 'bg-[#151726] text-purple-300 border-t-2 border-purple-500 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Swords className="w-3.5 h-3.5" />
            Golpes ({formData.moves?.length || 0}/4)
          </button>

          <button
            onClick={() => setActiveTab('skills')}
            className={`px-3.5 py-2.5 rounded-t-lg transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'skills'
                ? 'bg-[#151726] text-purple-300 border-t-2 border-purple-500 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Dices className="w-3.5 h-3.5" />
            14 Perícias
          </button>

          <button
            onClick={() => setActiveTab('status')}
            className={`px-3.5 py-2.5 rounded-t-lg transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'status'
                ? 'bg-[#151726] text-purple-300 border-t-2 border-purple-500 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            Atributos & Dados
          </button>

          <button
            onClick={() => setActiveTab('conditions')}
            className={`px-3.5 py-2.5 rounded-t-lg transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'conditions'
                ? 'bg-[#151726] text-purple-300 border-t-2 border-purple-500 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            Condições ({formData.conditions?.length || 0})
          </button>

          <button
            onClick={() => setActiveTab('notes')}
            className={`px-3.5 py-2.5 rounded-t-lg transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'notes'
                ? 'bg-[#151726] text-purple-300 border-t-2 border-purple-500 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <HeartHandshake className="w-3.5 h-3.5" />
            Vínculo & Notas
          </button>

          <button
            onClick={() => setActiveTab('diary')}
            className={`px-3.5 py-2.5 rounded-t-lg transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'diary'
                ? 'bg-[#151726] text-purple-300 border-t-2 border-purple-500 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Diário de Vida ({formData.diary?.length || 0})
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 bg-[#0f101c]">
          
          {/* TAB: GOLPES */}
          {activeTab === 'moves' && (
            <div className="space-y-4 max-w-4xl mx-auto">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-purple-400 uppercase tracking-wider">
                    Golpes Conhecidos ({formData.moves?.length || 0}/4)
                  </h3>
                  <p className="text-xs text-slate-400">
                    Use o botão para adicionar golpes diretamente da Biblioteca Oficial do sistema.
                  </p>
                </div>

                {isEditing && (
                  <button
                    onClick={() => setIsMovePickerOpen(true)}
                    className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors shadow-md"
                  >
                    <BookOpen className="w-3.5 h-3.5" /> Adicionar da Biblioteca
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {formData.moves?.map((m, idx) => (
                  <div
                    key={m.id || idx}
                    className="p-3.5 rounded-xl bg-[#141525] border border-zinc-800 hover:border-zinc-700 flex flex-col justify-between transition-colors"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-black text-white">{m.name}</span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${TYPE_COLORS[m.type]?.bg || 'bg-zinc-700'} ${TYPE_COLORS[m.type]?.text || 'text-white'}`}
                          >
                            {m.type}
                          </span>
                        </div>

                        {isEditing && (
                          <button
                            onClick={() => handleRemoveMove(idx)}
                            className="p-1 rounded bg-zinc-800 hover:bg-rose-900/60 text-slate-400 hover:text-rose-300 cursor-pointer"
                            title="Remover golpe"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400 mb-2">
                        <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-purple-300">{m.category}</span>
                        <span className="font-bold text-amber-400">{m.tier} ({m.damageDice})</span>
                        <span className="text-cyan-300">{m.peCost > 0 ? `${m.peCost} PE` : '0 PE'}</span>
                        <span>{m.range}</span>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed mb-2">{m.effect}</p>
                      {m.resistance && (
                        <div className="text-[10px] text-amber-300/80 mb-2">
                          Resistência: {m.resistance}
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-end">
                      <button
                        onClick={() => handleUseMove(m)}
                        className="px-3 py-1 rounded-lg bg-zinc-800 hover:bg-purple-900/50 text-purple-300 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Swords className="w-3 h-3" /> Executar Golpe
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {formData.moves?.length === 0 && (
                <div className="p-8 rounded-xl bg-[#141525] border border-dashed border-zinc-800 text-center space-y-2">
                  <Swords className="w-8 h-8 text-slate-500 mx-auto" />
                  <p className="text-xs text-slate-400">Nenhum golpe cadastrado.</p>
                  {isEditing && (
                    <button
                      onClick={() => setIsMovePickerOpen(true)}
                      className="px-3 py-1.5 rounded-lg bg-purple-600 text-white text-xs font-bold cursor-pointer"
                    >
                      Abrir Biblioteca de Golpes
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB: 14 PERÍCIAS */}
          {activeTab === 'skills' && (
            <div className="space-y-4 max-w-4xl mx-auto">
              <h3 className="text-xs font-bold text-purple-400 uppercase tracking-wider">
                14 Perícias Oficiais de Pokémon
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {POKEMON_SKILLS.map((s) => {
                  const currentRank = formData.skills[s.name] || 'd6';
                  const attrDice =
                    s.defaultAttr === 'Corpo'
                      ? formData.corpo
                      : s.defaultAttr === 'Instinto'
                      ? formData.instinto
                      : formData.energia;

                  return (
                    <div
                      key={s.name}
                      className="p-2.5 rounded-xl bg-[#141525] border border-zinc-800 flex items-center justify-between"
                    >
                      <div className="min-w-0 pr-2">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-200 truncate">{s.name}</span>
                          <span
                            className={`text-[9px] px-1 rounded font-mono ${
                              s.defaultAttr === 'Corpo'
                                ? 'text-rose-400 bg-rose-950/40'
                                : s.defaultAttr === 'Instinto'
                                ? 'text-amber-400 bg-amber-950/40'
                                : 'text-cyan-400 bg-cyan-950/40'
                            }`}
                          >
                            {s.defaultAttr[0]}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 truncate">{s.description}</p>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {isEditing ? (
                          <select
                            value={currentRank}
                            onChange={(e) =>
                              notifyChange({
                                ...formData,
                                skills: { ...formData.skills, [s.name]: e.target.value as DiceRank },
                              })
                            }
                            className="bg-[#1a1c30] border border-zinc-700 rounded px-1.5 py-1 text-xs text-purple-300 font-mono font-bold"
                          >
                            {(['d4', 'd6', 'd8', 'd10', 'd12'] as DiceRank[]).map((r) => (
                              <option key={r} value={r}>
                                {r}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
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
          )}

          {/* TAB: ATRIBUTOS & DADOS */}
          {activeTab === 'status' && (
            <div className="space-y-6 max-w-4xl mx-auto">
              {/* Três Atributos Base */}
              <div>
                <h3 className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-3">
                  Atributos Base de Pokémon (d4 a d12)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Corpo */}
                  <div className="p-3.5 rounded-xl bg-[#161729] border border-zinc-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold text-rose-300">CORPO</span>
                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 font-bold">
                        {formData.corpo}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mb-3">
                      Robustez física e força de impacto. Define o PV máximo.
                    </p>
                    {isEditing && (
                      <select
                        value={formData.corpo}
                        onChange={(e) => notifyChange({ ...formData, corpo: e.target.value as DiceRank })}
                        className="w-full bg-[#111220] border border-zinc-700 rounded-lg px-2 py-1.5 text-xs text-white"
                      >
                        {(['d4', 'd6', 'd8', 'd10', 'd12'] as DiceRank[]).map((r) => (
                          <option key={r} value={r}>
                            {r} ({DICE_VALUES[r]} no dado)
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  {/* Instinto */}
                  <div className="p-3.5 rounded-xl bg-[#161729] border border-zinc-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold text-amber-300">INSTINTO</span>
                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 font-bold">
                        {formData.instinto}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mb-3">
                      Sentidos afiados, reflexos naturais e astúcia de batalha.
                    </p>
                    {isEditing && (
                      <select
                        value={formData.instinto}
                        onChange={(e) => notifyChange({ ...formData, instinto: e.target.value as DiceRank })}
                        className="w-full bg-[#111220] border border-zinc-700 rounded-lg px-2 py-1.5 text-xs text-white"
                      >
                        {(['d4', 'd6', 'd8', 'd10', 'd12'] as DiceRank[]).map((r) => (
                          <option key={r} value={r}>
                            {r} ({DICE_VALUES[r]} no dado)
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  {/* Energia */}
                  <div className="p-3.5 rounded-xl bg-[#161729] border border-zinc-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold text-cyan-300">ENERGIA</span>
                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold">
                        {formData.energia}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mb-3">
                      Reserva de força elemental e canalização de golpes especiais.
                    </p>
                    {isEditing && (
                      <select
                        value={formData.energia}
                        onChange={(e) => notifyChange({ ...formData, energia: e.target.value as DiceRank })}
                        className="w-full bg-[#111220] border border-zinc-700 rounded-lg px-2 py-1.5 text-xs text-white"
                      >
                        {(['d4', 'd6', 'd8', 'd10', 'd12'] as DiceRank[]).map((r) => (
                          <option key={r} value={r}>
                            {r} ({DICE_VALUES[r]} no dado)
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
              </div>

              {/* Informações de Nível, Evolução e Vínculo */}
              <div className="p-4 rounded-xl bg-[#141525] border border-zinc-800 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Apelido (Nickname)</label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={formData.nickname}
                    onChange={(e) => notifyChange({ ...formData, nickname: e.target.value })}
                    className="w-full bg-[#111220] border border-zinc-700 rounded px-2.5 py-1.5 text-xs text-white disabled:opacity-70"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Espécie</label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={formData.species}
                    onChange={(e) => notifyChange({ ...formData, species: e.target.value })}
                    className="w-full bg-[#111220] border border-zinc-700 rounded px-2.5 py-1.5 text-xs text-white disabled:opacity-70"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Treinador Vinculado</label>
                  {isEditing ? (
                    <select
                      value={formData.trainerId || ''}
                      onChange={(e) => notifyChange({ ...formData, trainerId: e.target.value || undefined })}
                      className="w-full bg-[#111220] border border-zinc-700 rounded px-2.5 py-1.5 text-xs text-white"
                    >
                      <option value="">-- Selvagem / Sem Treinador --</option>
                      {trainers.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name} (Nv. {t.level})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="p-2 rounded bg-[#111220] border border-zinc-800 text-xs text-purple-300 font-semibold truncate">
                      {currentTrainer?.name || 'Selvagem / Sem Treinador'}
                    </div>
                  )}
                </div>
              </div>

              {/* Traço Natural & Personalidade */}
              <div className="p-4 rounded-xl bg-[#141525] border border-zinc-800 space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Traço Natural da Espécie</label>
                  {isEditing ? (
                    <div className="space-y-1.5">
                      <input
                        type="text"
                        value={formData.naturalTrait?.name || ''}
                        onChange={(e) =>
                          notifyChange({
                            ...formData,
                            naturalTrait: {
                              name: e.target.value,
                              effect: formData.naturalTrait?.effect || '',
                            },
                          })
                        }
                        placeholder="Nome do traço..."
                        className="w-full bg-[#111220] border border-zinc-700 rounded px-2.5 py-1.5 text-xs text-white"
                      />
                      <textarea
                        rows={2}
                        value={formData.naturalTrait?.effect || ''}
                        onChange={(e) =>
                          notifyChange({
                            ...formData,
                            naturalTrait: {
                              name: formData.naturalTrait?.name || 'Traço Natural',
                              effect: e.target.value,
                            },
                          })
                        }
                        placeholder="Efeito ou particularidade ecológica..."
                        className="w-full bg-[#111220] border border-zinc-700 rounded px-2.5 py-1.5 text-xs text-white"
                      />
                    </div>
                  ) : (
                    <div className="text-xs text-slate-300">
                      <strong className="text-purple-300">{formData.naturalTrait?.name}:</strong>{' '}
                      {formData.naturalTrait?.effect}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB: CONDIÇÕES */}
          {activeTab === 'conditions' && (
            <div className="space-y-4 max-w-4xl mx-auto">
              <h3 className="text-xs font-bold text-purple-400 uppercase tracking-wider">
                Condições de Batalha do Sistema
              </h3>
              <p className="text-xs text-slate-400">
                Clique em uma condição para aplicar ou remover da criatura.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {CONDITIONS.map((c) => {
                  const isActive = formData.conditions?.includes(c.name);

                  return (
                    <button
                      key={c.name}
                      onClick={() => toggleCondition(c.name)}
                      className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                        isActive
                          ? 'bg-rose-950/60 border-rose-700 text-rose-200 shadow-md'
                          : 'bg-[#141525] border-zinc-800 text-slate-400 hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-xs font-bold ${isActive ? 'text-white' : 'text-slate-200'}`}>
                          {c.name}
                        </span>
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                            isActive ? 'bg-rose-800 text-white font-bold' : 'bg-zinc-800 text-slate-500'
                          }`}
                        >
                          {isActive ? 'Ativa' : 'Inativa'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300">{c.effect}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB: VÍNCULO & NOTAS */}
          {activeTab === 'notes' && (
            <div className="space-y-4 max-w-4xl mx-auto">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">
                  Estágio de Vínculo com Treinador (0 a 4)
                </label>
                {isEditing ? (
                  <select
                    value={formData.bondStage || 0}
                    onChange={(e) => notifyChange({ ...formData, bondStage: parseInt(e.target.value) || 0 })}
                    className="w-full bg-[#18192a] border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white"
                  >
                    <option value={0}>0: Desconhecidos (Recém-capturado ou arredio)</option>
                    <option value={1}>1: Familiaridade (Acostumando-se aos comandos)</option>
                    <option value={2}>2: Parceria (Responde prontamente sem hesitação)</option>
                    <option value={3}>3: Confiança (+2 ao reagir a sinal compartilhado)</option>
                    <option value={4}>4: Vínculo Profundo (Sincronia quase intuitiva)</option>
                  </select>
                ) : (
                  <div className="p-3 rounded-lg bg-[#141525] border border-zinc-800 text-xs text-purple-300 font-semibold">
                    Estágio {formData.bondStage || 0} de Vínculo
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Temperamento e Personalidade</label>
                <textarea
                  rows={2}
                  disabled={!isEditing}
                  value={formData.personality || ''}
                  onChange={(e) => notifyChange({ ...formData, personality: e.target.value })}
                  placeholder="Ex: Curioso e brincalhão fora de batalha, mas extremamente focado quando ouve comandos..."
                  className="w-full bg-[#18192a] border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 disabled:opacity-70"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Anotações Livres & Histórico</label>
                <textarea
                  rows={4}
                  disabled={!isEditing}
                  value={formData.notes || ''}
                  onChange={(e) => notifyChange({ ...formData, notes: e.target.value })}
                  placeholder="Local de captura, cicatrizes, itens que gosta de carregar..."
                  className="w-full bg-[#18192a] border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 disabled:opacity-70"
                />
              </div>

              {/* Item Equipado (Held Item) */}
              <div className="p-3.5 rounded-xl bg-[#141525] border border-zinc-800 space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  Item Equipado (Held Item)
                </div>
                {formData.heldItemName ? (
                  <div className="flex items-center justify-between bg-slate-900 p-2.5 rounded-lg border border-zinc-700">
                    <div>
                      <div className="text-sm font-semibold text-white">{formData.heldItemName}</div>
                      <div className="text-xs text-slate-400">Item vinculado e segurado na mochila do Pokémon</div>
                    </div>
                    {isEditing && (
                      <button
                        onClick={() => notifyChange({ ...formData, heldItemId: undefined, heldItemName: undefined })}
                        className="text-xs text-rose-400 hover:text-rose-300 font-semibold"
                      >
                        Desequipar
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="text-xs text-slate-400 italic">
                    Nenhum item equipado neste Pokémon no momento.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: DIÁRIO DE VIDA */}
          {activeTab === 'diary' && (
            <div className="space-y-4 max-w-4xl mx-auto">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-xs font-bold text-purple-400 uppercase tracking-wider">
                    Linha do Tempo & Diário de Bordo ({formData.diary?.length || 0})
                  </h3>
                  <p className="text-xs text-slate-400">
                    Registro individual de eventos vitais: capturas, batalhas épicas, aprendizado de golpes e itens consumidos.
                  </p>
                </div>

                <button
                  onClick={() => setIsAddingDiaryEntry(!isAddingDiaryEntry)}
                  className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors shadow-md shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isAddingDiaryEntry ? 'Fechar Formulário' : '+ Novo Registro'}</span>
                </button>
              </div>

              {/* Origem e Dados de Captura */}
              <div className="p-3.5 rounded-xl bg-[#141525] border border-zinc-800 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 flex items-center gap-1 mb-1">
                    <Calendar className="w-3 h-3 text-purple-400" /> Data de Captura
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.captureDate || ''}
                      onChange={(e) => notifyChange({ ...formData, captureDate: e.target.value })}
                      placeholder="Ex: 14 de Outubro, 2026"
                      className="w-full bg-[#111220] border border-zinc-700 rounded px-2.5 py-1 text-xs text-white"
                    />
                  ) : (
                    <div className="text-xs text-white font-medium">
                      {formData.captureDate || <span className="text-slate-500 italic">Não informada</span>}
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 flex items-center gap-1 mb-1">
                    <MapPin className="w-3 h-3 text-purple-400" /> Local de Captura
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.captureLocation || ''}
                      onChange={(e) => notifyChange({ ...formData, captureLocation: e.target.value })}
                      placeholder="Ex: Floresta de Viridian, Rota 2"
                      className="w-full bg-[#111220] border border-zinc-700 rounded px-2.5 py-1 text-xs text-white"
                    />
                  ) : (
                    <div className="text-xs text-white font-medium">
                      {formData.captureLocation || <span className="text-slate-500 italic">Não informado</span>}
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 flex items-center gap-1 mb-1">
                    <UserCheck className="w-3 h-3 text-purple-400" /> Treinador Original
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.originalTrainerName || ''}
                      onChange={(e) => notifyChange({ ...formData, originalTrainerName: e.target.value })}
                      placeholder="Ex: Nome do treinador original"
                      className="w-full bg-[#111220] border border-zinc-700 rounded px-2.5 py-1 text-xs text-white"
                    />
                  ) : (
                    <div className="text-xs text-white font-medium">
                      {formData.originalTrainerName || (currentTrainer ? currentTrainer.name : <span className="text-slate-500 italic">Desconhecido</span>)}
                    </div>
                  )}
                </div>
              </div>

              {/* Form de Novo Registro */}
              {isAddingDiaryEntry && (
                <div className="p-4 rounded-xl bg-[#16182c] border border-purple-800/60 space-y-3 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-purple-300 uppercase tracking-wider">
                      Registrar Novo Evento no Diário
                    </span>
                    <button
                      onClick={() => setIsAddingDiaryEntry(false)}
                      className="text-slate-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-300 block mb-1">
                        Categoria de Evento
                      </label>
                      <select
                        value={newDiaryEventType}
                        onChange={(e) => setNewDiaryEventType(e.target.value as any)}
                        className="w-full bg-[#111220] border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                      >
                        <option value="training">Treinamento & Superação</option>
                        <option value="battle">Batalha Notável</option>
                        <option value="evolution">Evolução</option>
                        <option value="move_learned">Aprendizado de Golpe</option>
                        <option value="capture">Captura & Resgate</option>
                        <option value="injury">Ferimento ou Cicatriz</option>
                        <option value="temperament">Comportamento / Vínculo</option>
                        <option value="transfer">Transferência de Posse</option>
                        <option value="narrative">Momento Narrativo / Outro</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-300 block mb-1">
                        Título do Evento
                      </label>
                      <input
                        type="text"
                        value={newDiaryTitle}
                        onChange={(e) => setNewDiaryTitle(e.target.value)}
                        placeholder="Ex: Superou o Fearow na Rota 3"
                        className="w-full bg-[#111220] border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-300 block mb-1">
                      Descrição Detalhada
                    </label>
                    <textarea
                      rows={2}
                      value={newDiaryDescription}
                      onChange={(e) => setNewDiaryDescription(e.target.value)}
                      placeholder="Descreva o que aconteceu, lições aprendidas ou reações emocionais do Pokémon..."
                      className="w-full bg-[#111220] border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setIsAddingDiaryEntry(false)}
                      className="px-3 py-1 rounded-lg bg-zinc-800 text-slate-300 text-xs font-semibold"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleAddManualDiaryEntry}
                      disabled={!newDiaryTitle.trim() || !newDiaryDescription.trim()}
                      className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-xs font-bold cursor-pointer"
                    >
                      Salvar Registro
                    </button>
                  </div>
                </div>
              )}

              {/* Lista de Registros */}
              {(!formData.diary || formData.diary.length === 0) ? (
                <div className="p-8 text-center text-xs text-slate-400 bg-slate-950/40 border border-slate-800 rounded-xl">
                  Nenhum evento registrado no diário deste Pokémon até o momento.
                </div>
              ) : (
                <div className="divide-y divide-zinc-800 bg-[#141525] border border-zinc-800 rounded-xl overflow-hidden">
                  {formData.diary.map((entry) => {
                    const badgeColor =
                      entry.eventType === 'capture'
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                        : entry.eventType === 'evolution'
                        ? 'bg-purple-950 text-purple-300 border-purple-800'
                        : entry.eventType === 'move_learned'
                        ? 'bg-cyan-950 text-cyan-300 border-cyan-800'
                        : entry.eventType === 'battle'
                        ? 'bg-rose-950 text-rose-300 border-rose-800'
                        : entry.eventType === 'injury'
                        ? 'bg-red-950 text-red-300 border-red-800'
                        : entry.eventType === 'training'
                        ? 'bg-amber-950 text-amber-300 border-amber-800'
                        : 'bg-zinc-800 text-zinc-300 border-zinc-700';

                    return (
                      <div key={entry.id} className="p-3.5 space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white">
                              {entry.title || entry.eventType}
                            </span>
                            <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${badgeColor}`}>
                              {entry.eventType}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-400 shrink-0">
                            {new Date(entry.timestamp).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">{entry.description}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-3 bg-[#0d0e17] border-t border-zinc-800 flex items-center justify-between text-xs text-slate-400">
          <span>Project Mew • Ficha Individual</span>
          <div className="flex items-center gap-2">
            {isEditing && (
              <button
                onClick={handleSaveAll}
                className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5 cursor-pointer shadow-lg"
              >
                <Save className="w-3.5 h-3.5" /> Salvar Ficha
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

      {/* Move Replacement Modal (enforce 4-move limit) */}
      {pendingMoveToLearn && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg bg-[#121320] border border-amber-500/50 rounded-2xl shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-400">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <h3 className="text-sm font-black uppercase tracking-wider text-white">
                  Limite de 4 Golpes Atingido
                </h3>
              </div>
              <button
                onClick={() => setPendingMoveToLearn(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Para aprender <strong className="text-purple-300">{pendingMoveToLearn.name}</strong> ({pendingMoveToLearn.type}, {pendingMoveToLearn.category}, {pendingMoveToLearn.tier}), selecione qual dos 4 golpes conhecidos este Pokémon irá esquecer:
            </p>

            <div className="space-y-2">
              {formData.moves.map((currMove, idx) => (
                <div
                  key={currMove.id || idx}
                  className="p-3 rounded-xl bg-[#171829] border border-zinc-700 flex items-center justify-between gap-3 hover:border-amber-500/60 transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{currMove.name}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-purple-300">
                        {currMove.type}
                      </span>
                      <span className="text-[10px] text-amber-400 font-mono">
                        {currMove.tier} ({currMove.damageDice})
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 truncate max-w-xs">{currMove.effect}</p>
                  </div>

                  <button
                    onClick={() => applyLearnMove(pendingMoveToLearn, idx)}
                    className="px-2.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shrink-0 cursor-pointer transition-colors"
                  >
                    Substituir
                  </button>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setPendingMoveToLearn(null)}
                className="px-4 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Cancelar Aprendizado
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Use Item Modal on Pokemon */}
      {isUseItemModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-[#121320] border border-purple-900/60 rounded-2xl shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-purple-400">
                <Package className="w-5 h-5" />
                <h3 className="text-sm font-bold text-white">
                  Usar Item em {formData.nickname}
                </h3>
              </div>
              <button
                onClick={() => setIsUseItemModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Itens disponíveis na mochila do treinador ou no estoque comum da campanha:
            </p>

            <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
              {availableItems.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400 bg-zinc-900/50 rounded-xl border border-zinc-800">
                  Nenhum item consumível disponível no inventário.
                </div>
              ) : (
                availableItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl bg-[#171829] border border-zinc-800 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{item.name}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-950 text-purple-300">
                          Qtd: {item.quantity}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-snug line-clamp-2 mt-0.5">
                        {item.effect}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        handleConsumeItemOnPokemon(item);
                        setIsUseItemModalOpen(false);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shrink-0 cursor-pointer transition-colors"
                    >
                      Aplicar
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-zinc-800">
              <button
                onClick={() => setIsUseItemModalOpen(false)}
                className="px-3.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Upload Modal */}
      {isImageModalOpen && (
        <ImageUploadModal
          isOpen={isImageModalOpen}
          title="Alterar Imagem do Pokémon"
          currentImageUrl={formData.spriteUrl}
          defaultFallbackUrl="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png"
          onClose={() => setIsImageModalOpen(false)}
          onSave={(url) => {
            notifyChange({ ...formData, spriteUrl: url });
            setIsImageModalOpen(false);
          }}
        />
      )}

      {/* Move Picker Modal */}
      {isMovePickerOpen && (
        <MovePickerModal
          isOpen={isMovePickerOpen}
          campaignId={formData.campaignId}
          currentMoveIds={formData.moves?.map((m) => m.id)}
          onClose={() => setIsMovePickerOpen(false)}
          onSelectMove={handleAddMoveFromLibrary}
        />
      )}

      {/* Confirm Delete Modal */}
      {isDeleteModalOpen && onDelete && (
        <ConfirmDeleteModal
          isOpen={isDeleteModalOpen}
          entityType="Pokémon"
          entityName={formData.nickname}
          details={`Esta ação removerá a criatura "${formData.nickname}" da mesa.`}
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
