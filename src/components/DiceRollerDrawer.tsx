/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { DiceRank, DIFFICULTY_SCALE, POKEMON_TYPES, PokemonType, calculateTypeEffectiveness, TRAINER_SKILLS } from '../data/rulesData';
import { executeSkillTest } from '../utils/diceEngine';
import { storageService } from '../services/storageService';
import { DiceRollResult } from '../types';
import { Dices, Sparkles, Target, Zap, Shield, CheckCircle2, AlertTriangle, XCircle, Crosshair, HelpCircle, History, Trash2, ArrowRight } from 'lucide-react';

interface DiceRollerDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  rollerName: string;
  initialRollParams?: {
    testName?: string;
    attributeName?: string;
    attributeDice?: DiceRank;
    skillName?: string;
    skillDice?: DiceRank;
    targetCa?: number;
  };
}

export const DiceRollerDrawer: React.FC<DiceRollerDrawerProps> = ({
  isOpen,
  onClose,
  rollerName,
  initialRollParams,
}) => {
  const [activeTab, setActiveTab] = useState<'test' | 'combat' | 'capture' | 'history'>('test');

  // Test parameters
  const [testName, setTestName] = useState(initialRollParams?.testName || 'Teste Geral de Campo');
  const [attrName, setAttrName] = useState(initialRollParams?.attributeName || 'Corpo');
  const [attrDice, setAttrDice] = useState<DiceRank>(initialRollParams?.attributeDice || 'd6');
  const [skillName, setSkillName] = useState(initialRollParams?.skillName || 'Atletismo');
  const [skillDice, setSkillDice] = useState<DiceRank>(initialRollParams?.skillDice || 'd6');
  const [targetCa, setTargetCa] = useState<number>(initialRollParams?.targetCa || 10);
  const [advantage, setAdvantage] = useState(false);
  const [complication, setComplication] = useState(false);
  const [customBonus, setCustomBonus] = useState(0);

  // Latest result
  const [latestResult, setLatestResult] = useState<DiceRollResult | null>(null);
  const [isRolling, setIsRolling] = useState(false);

  // Combat / Type calculator state
  const [attackType, setAttackType] = useState<PokemonType>('Fogo');
  const [moveDice, setMoveDice] = useState<DiceRank>('d6');
  const [defType1, setDefType1] = useState<PokemonType>('Grama');
  const [defType2, setDefType2] = useState<PokemonType | 'Nenhum'>('Aço');
  const [combatDamageResult, setCombatDamageResult] = useState<{
    baseRoll: number;
    typeModifier: number;
    isImmune: boolean;
    totalDamage: number;
    explanation: string;
  } | null>(null);

  // Capture calculator state
  const [targetRarity, setTargetRarity] = useState<'Comum' | 'Incomum' | 'Raro' | 'Muito raro' | 'Lendário'>('Comum');
  const [hpState, setHpState] = useState<'cheio' | 'metade' | 'quarto'>('metade');
  const [smartOpportunity, setSmartOpportunity] = useState(true);
  const [ballType, setBallType] = useState<'poke' | 'great' | 'ultra'>('poke');
  const [captureAttrDice, setCaptureAttrDice] = useState<DiceRank>('d6');
  const [captureSkillDice, setCaptureSkillDice] = useState<DiceRank>('d6');
  const [captureResult, setCaptureResult] = useState<DiceRollResult | null>(null);

  // Roll history
  const [history, setHistory] = useState<DiceRollResult[]>(() => storageService.getRolls());

  if (!isOpen) return null;

  const handleRollTest = () => {
    setIsRolling(true);
    let bonus = customBonus;
    if (advantage && !complication) bonus += 2;
    if (complication && !advantage) bonus -= 2;

    setTimeout(() => {
      const res = executeSkillTest({
        rollerName,
        testName,
        attributeName: attrName,
        attributeDice: attrDice,
        skillName,
        skillDice,
        bonus,
        targetCa,
      });

      storageService.addRoll(res);
      setLatestResult(res);
      setHistory(storageService.getRolls());
      setIsRolling(false);
    }, 300);
  };

  const handleRollCombat = () => {
    const defTypes: PokemonType[] = [defType1];
    if (defType2 !== 'Nenhum' && defType2 !== defType1) {
      defTypes.push(defType2);
    }

    const eff = calculateTypeEffectiveness(attackType, defTypes);
    const max = moveDice === 'd4' ? 4 : moveDice === 'd6' ? 6 : moveDice === 'd8' ? 8 : moveDice === 'd10' ? 10 : 12;
    const baseRoll = Math.floor(Math.random() * max) + 1;

    let finalDamage = 0;
    if (eff.isImmune) {
      finalDamage = 0;
    } else {
      finalDamage = Math.max(0, baseRoll + eff.damageMod);
    }

    setCombatDamageResult({
      baseRoll,
      typeModifier: eff.damageMod,
      isImmune: eff.isImmune,
      totalDamage: finalDamage,
      explanation: eff.description,
    });
  };

  const handleRollCapture = () => {
    // Raridade base CA
    const rarityCaMap = {
      Comum: 10,
      Incomum: 12,
      Raro: 14,
      'Muito raro': 16,
      Lendário: 18,
    };
    let ca = rarityCaMap[targetRarity];
    if (ballType === 'great') ca -= 2;
    if (ballType === 'ultra') ca -= 4;

    let testBonus = 0;
    if (hpState === 'metade') testBonus += 2;
    if (hpState === 'quarto') testBonus += 4;
    if (smartOpportunity) testBonus += 2;

    const res = executeSkillTest({
      rollerName,
      testName: `Tentativa de Captura: ${targetRarity}`,
      attributeName: 'Mente/Presença',
      attributeDice: captureAttrDice,
      skillName: 'Trato Pokémon',
      skillDice: captureSkillDice,
      bonus: testBonus,
      targetCa: ca,
    });

    storageService.addRoll(res);
    setCaptureResult(res);
    setHistory(storageService.getRolls());
  };

  const clearHistory = () => {
    storageService.clearRolls();
    setHistory([]);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xl h-full bg-[#12131d] border-l border-purple-900/40 shadow-2xl flex flex-col justify-between overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-purple-900/20 bg-[#161725] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30">
              <Dices className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-lg leading-tight flex items-center gap-2">
                Mesa de Rolagens & Testes
                <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-purple-950 border border-purple-800 text-purple-300">
                  Motor d4–d12
                </span>
              </h3>
              <p className="text-xs text-slate-400">Rolador oficial do sistema Além da Próxima Rota</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-zinc-800 bg-[#0f1019] px-4 pt-2 gap-1 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('test')}
            className={`px-4 py-2.5 rounded-t-lg transition-all flex items-center gap-2 ${
              activeTab === 'test'
                ? 'bg-[#161725] text-purple-300 border-t-2 border-purple-500'
                : 'text-slate-400 hover:text-slate-200 hover:bg-zinc-800/40'
            }`}
          >
            <Target className="w-4 h-4" />
            Teste de Capacidade
          </button>
          <button
            onClick={() => setActiveTab('combat')}
            className={`px-4 py-2.5 rounded-t-lg transition-all flex items-center gap-2 ${
              activeTab === 'combat'
                ? 'bg-[#161725] text-purple-300 border-t-2 border-purple-500'
                : 'text-slate-400 hover:text-slate-200 hover:bg-zinc-800/40'
            }`}
          >
            <Zap className="w-4 h-4" />
            Efetividade & Dano
          </button>
          <button
            onClick={() => setActiveTab('capture')}
            className={`px-4 py-2.5 rounded-t-lg transition-all flex items-center gap-2 ${
              activeTab === 'capture'
                ? 'bg-[#161725] text-purple-300 border-t-2 border-purple-500'
                : 'text-slate-400 hover:text-slate-200 hover:bg-zinc-800/40'
            }`}
          >
            <Crosshair className="w-4 h-4" />
            Captura
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2.5 rounded-t-lg transition-all flex items-center gap-2 ${
              activeTab === 'history'
                ? 'bg-[#161725] text-purple-300 border-t-2 border-purple-500'
                : 'text-slate-400 hover:text-slate-200 hover:bg-zinc-800/40'
            }`}
          >
            <History className="w-4 h-4" />
            Histórico ({history.length})
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {activeTab === 'test' && (
            <div className="space-y-5">
              {/* Test Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Ação / Intenção</label>
                <input
                  type="text"
                  value={testName}
                  onChange={(e) => setTestName(e.target.value)}
                  placeholder="Ex: Escalar rocha sob chuva, Interceptar golpe..."
                  className="w-full bg-[#1b1c2b] border border-purple-900/30 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Attr and Skill Selection */}
              <div className="grid grid-cols-2 gap-4">
                {/* Atributo */}
                <div className="p-3.5 rounded-xl bg-[#171828] border border-purple-900/20">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400 block mb-2">
                    1. Dado de Atributo
                  </span>
                  <div className="space-y-2">
                    <select
                      value={attrName}
                      onChange={(e) => setAttrName(e.target.value)}
                      className="w-full bg-[#0e0f18] border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
                    >
                      <option value="Corpo">Corpo (Físico / Força)</option>
                      <option value="Mente">Mente (Raciocínio / Percepção)</option>
                      <option value="Presença">Presença (Social / Expressão)</option>
                      <option value="Instinto">Instinto (Pokémon - Sentidos)</option>
                      <option value="Energia">Energia (Pokémon - Tipo)</option>
                    </select>

                    <div className="flex items-center gap-1.5">
                      {(['d4', 'd6', 'd8', 'd10', 'd12'] as DiceRank[]).map((d) => (
                        <button
                          key={d}
                          type="button"
                          onClick={() => setAttrDice(d)}
                          className={`flex-1 py-1.5 font-mono text-xs font-bold rounded-lg border transition-all ${
                            attrDice === d
                              ? 'bg-purple-600 text-white border-purple-400 shadow-md shadow-purple-900/40'
                              : 'bg-zinc-800 text-slate-400 border-zinc-700 hover:text-white'
                          }`}
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Perícia */}
                <div className="p-3.5 rounded-xl bg-[#171828] border border-purple-900/20">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 block mb-2">
                    2. Dado de Perícia
                  </span>
                  <div className="space-y-2">
                    <select
                      value={skillName}
                      onChange={(e) => setSkillName(e.target.value)}
                      className="w-full bg-[#0e0f18] border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
                    >
                      {TRAINER_SKILLS.map((s) => (
                        <option key={s.name} value={s.name}>
                          {s.name} ({s.defaultAttr})
                        </option>
                      ))}
                    </select>

                    <div className="flex items-center gap-1.5">
                      {(['d4', 'd6', 'd8', 'd10', 'd12'] as DiceRank[]).map((d) => (
                        <button
                          key={d}
                          type="button"
                          onClick={() => setSkillDice(d)}
                          className={`flex-1 py-1.5 font-mono text-xs font-bold rounded-lg border transition-all ${
                            skillDice === d
                              ? 'bg-indigo-600 text-white border-indigo-400 shadow-md shadow-indigo-900/40'
                              : 'bg-zinc-800 text-slate-400 border-zinc-700 hover:text-white'
                          }`}
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Target CA Selector */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-300">Classe de Alvo (CA do Desafio)</label>
                  <span className="text-xs font-mono font-bold text-purple-400">CA {targetCa}</span>
                </div>
                <div className="grid grid-cols-5 gap-1.5">
                  {DIFFICULTY_SCALE.map((item) => (
                    <button
                      key={item.ca}
                      type="button"
                      onClick={() => setTargetCa(item.ca)}
                      className={`p-2 rounded-lg border text-left transition-all ${
                        targetCa === item.ca
                          ? 'bg-purple-950/60 border-purple-500 text-purple-200'
                          : 'bg-[#151624] border-zinc-800 text-slate-400 hover:border-zinc-700'
                      }`}
                    >
                      <div className="font-mono font-bold text-xs">CA {item.ca}</div>
                      <div className="text-[10px] truncate text-slate-400">{item.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Modifiers: Vantagem / Complicação */}
              <div className="p-3.5 rounded-xl bg-[#161725] border border-purple-900/20 flex items-center justify-between gap-3">
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-300">
                    <input
                      type="checkbox"
                      checked={advantage}
                      onChange={(e) => setAdvantage(e.target.checked)}
                      className="rounded bg-zinc-800 border-zinc-700 text-purple-600 focus:ring-0"
                    />
                    <span className={advantage ? 'text-emerald-400 font-semibold' : ''}>Vantagem (+2)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-300">
                    <input
                      type="checkbox"
                      checked={complication}
                      onChange={(e) => setComplication(e.target.checked)}
                      className="rounded bg-zinc-800 border-zinc-700 text-purple-600 focus:ring-0"
                    />
                    <span className={complication ? 'text-rose-400 font-semibold' : ''}>Complicação (-2)</span>
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Mod. Extra:</span>
                  <input
                    type="number"
                    value={customBonus}
                    onChange={(e) => setCustomBonus(Number(e.target.value))}
                    className="w-14 bg-[#0e0f18] border border-zinc-700 rounded px-2 py-1 text-xs text-center font-mono text-slate-200"
                  />
                </div>
              </div>

              {/* Roll Action Button */}
              <button
                type="button"
                onClick={handleRollTest}
                disabled={isRolling}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 font-bold text-sm text-white shadow-lg shadow-purple-950/60 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.98]"
              >
                <Dices className={`w-5 h-5 ${isRolling ? 'animate-spin' : ''}`} />
                {isRolling ? 'Rolando dados...' : `Rolar ${attrName} (${attrDice}) + ${skillName} (${skillDice})`}
              </button>

              {/* Latest Result Card */}
              {latestResult && (
                <div
                  className={`p-4 rounded-xl border transition-all animate-in zoom-in-95 duration-200 ${
                    latestResult.outcome === 'Sucesso Forte'
                      ? 'bg-emerald-950/30 border-emerald-500/50'
                      : latestResult.outcome === 'Sucesso'
                      ? 'bg-purple-950/30 border-purple-500/50'
                      : latestResult.outcome === 'Sucesso com Custo'
                      ? 'bg-amber-950/30 border-amber-500/50'
                      : 'bg-rose-950/30 border-rose-500/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {latestResult.outcome === 'Sucesso Forte' && (
                        <Sparkles className="w-5 h-5 text-emerald-400 animate-pulse" />
                      )}
                      {latestResult.outcome === 'Sucesso' && (
                        <CheckCircle2 className="w-5 h-5 text-purple-400" />
                      )}
                      {latestResult.outcome === 'Sucesso com Custo' && (
                        <AlertTriangle className="w-5 h-5 text-amber-400" />
                      )}
                      {latestResult.outcome === 'Falha' && <XCircle className="w-5 h-5 text-rose-400" />}
                      <span className="font-bold text-sm text-slate-100">{latestResult.outcome}</span>
                    </div>
                    <span className="text-xs font-mono text-slate-400">vs CA {latestResult.targetCa}</span>
                  </div>

                  <div className="flex items-center justify-around py-3 bg-black/40 rounded-lg mb-3 border border-white/5">
                    <div className="text-center">
                      <div className="text-[11px] text-slate-400">{latestResult.attributeName} ({latestResult.attributeDice})</div>
                      <div className="text-2xl font-mono font-bold text-purple-300">{latestResult.attributeRoll}</div>
                    </div>
                    <div className="text-slate-500 font-bold text-lg">+</div>
                    <div className="text-center">
                      <div className="text-[11px] text-slate-400">{latestResult.skillName} ({latestResult.skillDice})</div>
                      <div className="text-2xl font-mono font-bold text-indigo-300">{latestResult.skillRoll}</div>
                    </div>
                    {latestResult.bonus !== 0 && (
                      <>
                        <div className="text-slate-500 font-bold text-lg">{latestResult.bonus > 0 ? '+' : ''}</div>
                        <div className="text-center">
                          <div className="text-[11px] text-slate-400">Modificador</div>
                          <div className="text-2xl font-mono font-bold text-amber-300">{latestResult.bonus}</div>
                        </div>
                      </>
                    )}
                    <div className="text-slate-500 font-bold text-lg">=</div>
                    <div className="text-center">
                      <div className="text-[11px] text-slate-300 font-bold">TOTAL</div>
                      <div className="text-3xl font-mono font-extrabold text-white">{latestResult.total}</div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">{latestResult.details}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'combat' && (
            <div className="space-y-5">
              <div className="p-3 bg-purple-950/20 border border-purple-800/30 rounded-xl text-xs text-purple-200">
                <strong>Matriz de Efetividade (Geração VI em diante):</strong> Fraqueza = +2 de dano | Dupla Fraqueza = +4 | Resistência = -2 | Dupla Resistência = -4 | Imune = Dano 0.
              </div>

              {/* Attack Configuration */}
              <div className="p-4 rounded-xl bg-[#161725] border border-purple-900/20 space-y-3">
                <span className="text-xs font-bold text-purple-300 uppercase tracking-wider block">
                  Ataque do Movimento
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Tipo do Ataque</label>
                    <select
                      value={attackType}
                      onChange={(e) => setAttackType(e.target.value as PokemonType)}
                      className="w-full bg-[#0e0f18] border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200"
                    >
                      {POKEMON_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Patamar de Dano Base</label>
                    <select
                      value={moveDice}
                      onChange={(e) => setMoveDice(e.target.value as DiceRank)}
                      className="w-full bg-[#0e0f18] border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 font-mono"
                    >
                      <option value="d4">Básico (1d4, 0 PE)</option>
                      <option value="d6">Comum (1d6, 1 PE)</option>
                      <option value="d8">Forte (1d8, 2 PE)</option>
                      <option value="d10">Assinatura (1d10, 3 PE)</option>
                      <option value="d12">Supremo (1d12, 4 PE)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Defender Types */}
              <div className="p-4 rounded-xl bg-[#161725] border border-purple-900/20 space-y-3">
                <span className="text-xs font-bold text-blue-300 uppercase tracking-wider block">
                  Tipos do Alvo Defensor
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Tipo 1 (Primário)</label>
                    <select
                      value={defType1}
                      onChange={(e) => setDefType1(e.target.value as PokemonType)}
                      className="w-full bg-[#0e0f18] border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200"
                    >
                      {POKEMON_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Tipo 2 (Secundário)</label>
                    <select
                      value={defType2}
                      onChange={(e) => setDefType2(e.target.value as PokemonType | 'Nenhum')}
                      className="w-full bg-[#0e0f18] border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200"
                    >
                      <option value="Nenhum">Nenhum (Monotipo)</option>
                      {POKEMON_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleRollCombat}
                className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 font-bold text-sm text-white shadow-lg transition-all"
              >
                Calcular Efetividade & Rolar Dano ({moveDice})
              </button>

              {combatDamageResult && (
                <div className="p-4 rounded-xl bg-[#171828] border border-purple-500/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300 uppercase">Resultado do Impacto</span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded font-bold font-mono ${
                        combatDamageResult.isImmune
                          ? 'bg-zinc-800 text-zinc-400'
                          : combatDamageResult.typeModifier > 0
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                          : combatDamageResult.typeModifier < 0
                          ? 'bg-rose-950 text-rose-300 border border-rose-500/40'
                          : 'bg-zinc-800 text-slate-300'
                      }`}
                    >
                      {combatDamageResult.isImmune
                        ? 'IMUNE'
                        : combatDamageResult.typeModifier > 0
                        ? `+${combatDamageResult.typeModifier} DANO`
                        : `${combatDamageResult.typeModifier} DANO`}
                    </span>
                  </div>

                  <div className="flex items-center justify-around py-2.5 bg-black/40 rounded-lg">
                    <div className="text-center">
                      <div className="text-[10px] text-slate-400">Dado Base ({moveDice})</div>
                      <div className="text-xl font-mono font-bold text-slate-200">{combatDamageResult.baseRoll}</div>
                    </div>
                    <div className="text-slate-500 font-bold">+</div>
                    <div className="text-center">
                      <div className="text-[10px] text-slate-400">Modificador Tipo</div>
                      <div className="text-xl font-mono font-bold text-purple-400">
                        {combatDamageResult.isImmune ? '0 (Imune)' : combatDamageResult.typeModifier}
                      </div>
                    </div>
                    <div className="text-slate-500 font-bold">=</div>
                    <div className="text-center">
                      <div className="text-[10px] text-emerald-400 font-bold">DANO FINAL</div>
                      <div className="text-3xl font-mono font-extrabold text-emerald-300">
                        {combatDamageResult.totalDamage}
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400">{combatDamageResult.explanation}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'capture' && (
            <div className="space-y-4">
              <div className="p-3 bg-purple-950/20 border border-purple-800/30 rounded-xl text-xs text-purple-200">
                <strong>Regra de Captura (Seção 42 & 43):</strong> Teste de Mente ou Presença + Trato Pokémon contra a CA de Raridade local.
              </div>

              {/* Rarity */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Raridade no Habitat</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Comum', 'Incomum', 'Raro', 'Muito raro', 'Lendário'] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setTargetRarity(r)}
                      className={`p-2 rounded-lg border text-xs font-semibold transition-all ${
                        targetRarity === r
                          ? 'bg-purple-900/60 border-purple-500 text-white'
                          : 'bg-[#161725] border-zinc-800 text-slate-400'
                      }`}
                    >
                      {r} (CA {r === 'Comum' ? 10 : r === 'Incomum' ? 12 : r === 'Raro' ? 14 : r === 'Muito raro' ? 16 : 18})
                    </button>
                  ))}
                </div>
              </div>

              {/* Poké Ball Choice */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Dispositivo de Captura</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setBallType('poke')}
                    className={`p-2 rounded-lg border text-xs font-semibold ${
                      ballType === 'poke' ? 'bg-purple-900/60 border-purple-500 text-white' : 'bg-[#161725] border-zinc-800 text-slate-400'
                    }`}
                  >
                    Poké Bola (CA normal)
                  </button>
                  <button
                    type="button"
                    onClick={() => setBallType('great')}
                    className={`p-2 rounded-lg border text-xs font-semibold ${
                      ballType === 'great' ? 'bg-purple-900/60 border-purple-500 text-white' : 'bg-[#161725] border-zinc-800 text-slate-400'
                    }`}
                  >
                    Grande Bola (-2 CA)
                  </button>
                  <button
                    type="button"
                    onClick={() => setBallType('ultra')}
                    className={`p-2 rounded-lg border text-xs font-semibold ${
                      ballType === 'ultra' ? 'bg-purple-900/60 border-purple-500 text-white' : 'bg-[#161725] border-zinc-800 text-slate-400'
                    }`}
                  >
                    Ultra Bola (-4 CA)
                  </button>
                </div>
              </div>

              {/* Conditions / HP */}
              <div className="p-3.5 rounded-xl bg-[#161725] border border-purple-900/20 space-y-3">
                <span className="text-xs font-bold text-slate-300 block">Modificadores de Situação</span>
                <div className="flex gap-4">
                  <label className="text-xs flex items-center gap-1.5 cursor-pointer text-slate-300">
                    <input
                      type="radio"
                      name="hpState"
                      checked={hpState === 'cheio'}
                      onChange={() => setHpState('cheio')}
                    />
                    PV Cheio (+0)
                  </label>
                  <label className="text-xs flex items-center gap-1.5 cursor-pointer text-slate-300">
                    <input
                      type="radio"
                      name="hpState"
                      checked={hpState === 'metade'}
                      onChange={() => setHpState('metade')}
                    />
                    ≤ 50% PV (+2)
                  </label>
                  <label className="text-xs flex items-center gap-1.5 cursor-pointer text-slate-300">
                    <input
                      type="radio"
                      name="hpState"
                      checked={hpState === 'quarto'}
                      onChange={() => setHpState('quarto')}
                    />
                    ≤ 25% PV (+4)
                  </label>
                </div>

                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 pt-2 border-t border-zinc-800">
                  <input
                    type="checkbox"
                    checked={smartOpportunity}
                    onChange={(e) => setSmartOpportunity(e.target.checked)}
                    className="rounded bg-zinc-800 text-purple-600"
                  />
                  <span>Oportunidade criada por método inteligente / comida / aproximação mansa (+2)</span>
                </label>
              </div>

              {/* Trainer Dice selection */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Dado Atributo (Mente/Presença)</label>
                  <select
                    value={captureAttrDice}
                    onChange={(e) => setCaptureAttrDice(e.target.value as DiceRank)}
                    className="w-full bg-[#0e0f18] border border-zinc-700 rounded px-2 py-1.5 text-xs text-slate-200"
                  >
                    <option value="d4">d4</option>
                    <option value="d6">d6</option>
                    <option value="d8">d8</option>
                    <option value="d10">d10</option>
                    <option value="d12">d12</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Dado Perícia (Trato Pokémon)</label>
                  <select
                    value={captureSkillDice}
                    onChange={(e) => setCaptureSkillDice(e.target.value as DiceRank)}
                    className="w-full bg-[#0e0f18] border border-zinc-700 rounded px-2 py-1.5 text-xs text-slate-200"
                  >
                    <option value="d4">d4</option>
                    <option value="d6">d6</option>
                    <option value="d8">d8</option>
                    <option value="d10">d10</option>
                    <option value="d12">d12</option>
                  </select>
                </div>
              </div>

              <button
                type="button"
                onClick={handleRollCapture}
                className="w-full py-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 font-bold text-sm text-white shadow-lg transition-all"
              >
                Testar Captura
              </button>

              {captureResult && (
                <div
                  className={`p-4 rounded-xl border ${
                    captureResult.outcome === 'Sucesso Forte' || captureResult.outcome === 'Sucesso'
                      ? 'bg-emerald-950/30 border-emerald-500/50'
                      : 'bg-rose-950/30 border-rose-500/50'
                  }`}
                >
                  <div className="font-bold text-sm text-slate-100 mb-1">
                    {captureResult.outcome === 'Sucesso Forte' || captureResult.outcome === 'Sucesso'
                      ? '✓ Pokémon Capturado com Sucesso!'
                      : '✕ Falha na Captura (Bola consumida, criatura reagiu)'}
                  </div>
                  <p className="text-xs text-slate-300">{captureResult.details}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                <span className="text-xs text-slate-400">Últimas rolagens da mesa:</span>
                {history.length > 0 && (
                  <button
                    onClick={clearHistory}
                    className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Limpar histórico
                  </button>
                )}
              </div>

              {history.length === 0 ? (
                <div className="text-center py-10 text-xs text-slate-500">
                  Nenhuma rolagem recente realizada ainda.
                </div>
              ) : (
                history.map((h) => (
                  <div key={h.id} className="p-3 rounded-lg bg-[#161725] border border-purple-900/20 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-200">{h.testName}</span>
                      <span className="text-[10px] font-mono text-slate-500">{h.timestamp}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-400">
                      <span>
                        {h.attributeName} ({h.attributeDice}: {h.attributeRoll}) + {h.skillName} ({h.skillDice}:{' '}
                        {h.skillRoll}) {h.bonus !== 0 ? `(${h.bonus > 0 ? '+' : ''}${h.bonus})` : ''} ={' '}
                        <strong className="text-slate-100 font-mono text-sm">{h.total}</strong>
                      </span>
                      <span
                        className={`font-semibold px-2 py-0.5 rounded text-[10px] ${
                          h.outcome === 'Sucesso Forte'
                            ? 'bg-emerald-950 text-emerald-300'
                            : h.outcome === 'Sucesso'
                            ? 'bg-purple-950 text-purple-300'
                            : h.outcome === 'Sucesso com Custo'
                            ? 'bg-amber-950 text-amber-300'
                            : 'bg-rose-950 text-rose-300'
                        }`}
                      >
                        {h.outcome} (CA {h.targetCa})
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-purple-900/20 bg-[#0e0f18] flex items-center justify-between text-xs text-slate-400">
          <span>Sistema: Além da Próxima Rota v1.0</span>
          <button onClick={onClose} className="px-4 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-slate-200">
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
