/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  ORIGINS,
  CLASSES,
  DIFFICULTY_SCALE,
  POKEMON_TYPES,
  TYPE_COLORS,
  calculateTypeEffectiveness,
  OFFICIAL_ITEMS,
  CONDITIONS,
  PokemonType,
} from '../data/rulesData';
import { BookOpen, Search, Shield, Zap, Sparkles, ShoppingBag, Flame, Crosshair, X } from 'lucide-react';

interface CompendiumModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CompendiumModal: React.FC<CompendiumModalProps> = ({ isOpen, onClose }) => {
  const [activeCategory, setActiveCategory] = useState<'origins' | 'classes' | 'types' | 'rules' | 'items' | 'conditions'>('origins');
  const [searchQuery, setSearchQuery] = useState('');

  // Interactive Type Calculator
  const [calcAttack, setCalcAttack] = useState<PokemonType>('Água');
  const [calcDef1, setCalcDef1] = useState<PokemonType>('Fogo');
  const [calcDef2, setCalcDef2] = useState<PokemonType | 'Nenhum'>('Rocha' as any);

  if (!isOpen) return null;

  const filteredOrigins = ORIGINS.filter(
    (o) =>
      o.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.abilityName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.abilityDescription.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredClasses = CLASSES.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.tracks.some((t) => t.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredItems = OFFICIAL_ITEMS.filter(
    (i) =>
      i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.effect.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const defTypesList: PokemonType[] = [calcDef1];
  if (calcDef2 !== 'Nenhum' && POKEMON_TYPES.includes(calcDef2 as PokemonType)) {
    defTypesList.push(calcDef2 as PokemonType);
  }
  const typeResult = calculateTypeEffectiveness(calcAttack, defTypesList);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-[#12131d] border border-purple-900/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 border-b border-purple-900/30 bg-[#161726] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white">Manual de Campo do Treinador</h2>
              <p className="text-xs text-slate-400">
                Compêndio oficial do sistema Além da Próxima Rota • Edição 1.0
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Navigation Bar */}
        <div className="p-4 bg-[#141522] border-b border-purple-900/20 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar origem, classe, item..."
              className="w-full bg-[#0e0f18] border border-purple-900/30 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Categories */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setActiveCategory('origins')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeCategory === 'origins'
                  ? 'bg-purple-600 text-white'
                  : 'bg-zinc-800 text-slate-400 hover:text-white'
              }`}
            >
              24 Origens
            </button>
            <button
              onClick={() => setActiveCategory('classes')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeCategory === 'classes'
                  ? 'bg-purple-600 text-white'
                  : 'bg-zinc-800 text-slate-400 hover:text-white'
              }`}
            >
              10 Classes & Trilhas
            </button>
            <button
              onClick={() => setActiveCategory('types')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeCategory === 'types'
                  ? 'bg-purple-600 text-white'
                  : 'bg-zinc-800 text-slate-400 hover:text-white'
              }`}
            >
              Matriz de Tipos
            </button>
            <button
              onClick={() => setActiveCategory('rules')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeCategory === 'rules'
                  ? 'bg-purple-600 text-white'
                  : 'bg-zinc-800 text-slate-400 hover:text-white'
              }`}
            >
              Motor & Dificuldades
            </button>
            <button
              onClick={() => setActiveCategory('items')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeCategory === 'items'
                  ? 'bg-purple-600 text-white'
                  : 'bg-zinc-800 text-slate-400 hover:text-white'
              }`}
            >
              Itens & PD
            </button>
            <button
              onClick={() => setActiveCategory('conditions')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeCategory === 'conditions'
                  ? 'bg-purple-600 text-white'
                  : 'bg-zinc-800 text-slate-400 hover:text-white'
              }`}
            >
              Condições
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {activeCategory === 'origins' && (
            <div className="space-y-4">
              <div className="p-3 bg-purple-950/20 border border-purple-800/30 rounded-xl text-xs text-purple-200">
                <strong>Origens (Seção 16):</strong> Concedem duas perícias gratuitas em d6 e uma habilidade inicial única que define o passado do treinador.
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredOrigins.map((orig) => (
                  <div
                    key={orig.name}
                    className="p-4 rounded-xl bg-[#161726] border border-purple-900/20 hover:border-purple-600/40 transition-all space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-extrabold text-sm text-white">{orig.name}</h3>
                      <div className="flex items-center gap-1">
                        {orig.freeSkills.map((sk) => (
                          <span
                            key={sk}
                            className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800"
                          >
                            {sk} d6
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-black/30 border border-zinc-800">
                      <span className="text-[11px] font-bold text-purple-400 block mb-0.5">
                        {orig.abilityName}
                      </span>
                      <p className="text-xs text-slate-300 leading-relaxed">{orig.abilityDescription}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeCategory === 'classes' && (
            <div className="space-y-6">
              <div className="p-3 bg-purple-950/20 border border-purple-800/30 rounded-xl text-xs text-purple-200">
                <strong>Classes e Trilhas (Seção 17):</strong> Escolhida no nível 2, concede habilidade inicial, perícia de classe em d6 e abre a escolha de trilha no nível 4.
              </div>

              <div className="space-y-4">
                {filteredClasses.map((cls) => (
                  <div key={cls.name} className="p-5 rounded-xl bg-[#161726] border border-purple-900/30 space-y-4">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                        {cls.name}
                        <span className="text-xs font-mono font-normal text-slate-400">
                          (Perícia de classe: {cls.skillOptions.join(' ou ')})
                        </span>
                      </h3>
                    </div>

                    {/* Habilidade Inicial */}
                    <div className="p-3 rounded-lg bg-purple-950/20 border border-purple-800/30">
                      <span className="text-xs font-bold text-purple-300 block mb-1">
                        Habilidade Inicial (Nível 2): {cls.initialAbility.name}
                      </span>
                      <p className="text-xs text-slate-300 leading-relaxed">{cls.initialAbility.desc}</p>
                    </div>

                    {/* Trilhas */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {cls.tracks.map((trk) => (
                        <div key={trk.name} className="p-3 rounded-lg bg-black/40 border border-zinc-800 space-y-2">
                          <span className="text-xs font-bold text-indigo-400 block uppercase">
                            Trilha: {trk.name}
                          </span>
                          <div className="text-xs text-slate-300">
                            <strong className="text-slate-200">{trk.feature1.name}:</strong> {trk.feature1.desc}
                          </div>
                          <div className="text-xs text-slate-300">
                            <strong className="text-slate-200">{trk.feature2.name}:</strong> {trk.feature2.desc}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Ápice */}
                    <div className="p-3 rounded-lg bg-pink-950/20 border border-pink-800/30 flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-pink-400 shrink-0 mt-0.5" />
                      <div className="text-xs text-pink-200">
                        <strong>Habilidade de Ápice (Nível 10 - {cls.apexAbility.name}):</strong>{' '}
                        {cls.apexAbility.desc}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeCategory === 'types' && (
            <div className="space-y-6">
              {/* Interactive Calculator */}
              <div className="p-5 rounded-xl cris-panel space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Zap className="w-4 h-4 text-purple-400" />
                  Calculadora Interativa de Efetividade Elemental
                </h3>
                <p className="text-xs text-slate-400">
                  Baseada nas regras da Geração VI+ com modificadores fixos de dano: Fraqueza (+2), Dupla Fraqueza (+4), Resistência (-2), Dupla Resistência (-4), Imunidade (0 de dano).
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1 font-semibold">Tipo do Ataque</label>
                    <select
                      value={calcAttack}
                      onChange={(e) => setCalcAttack(e.target.value as PokemonType)}
                      className="w-full bg-[#0e0f18] border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    >
                      {POKEMON_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 block mb-1 font-semibold">Defensor Tipo 1</label>
                    <select
                      value={calcDef1}
                      onChange={(e) => setCalcDef1(e.target.value as PokemonType)}
                      className="w-full bg-[#0e0f18] border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    >
                      {POKEMON_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 block mb-1 font-semibold">Defensor Tipo 2</label>
                    <select
                      value={calcDef2}
                      onChange={(e) => setCalcDef2(e.target.value as any)}
                      className="w-full bg-[#0e0f18] border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
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

                <div
                  className={`p-4 rounded-xl border flex items-center justify-between ${
                    typeResult.isImmune
                      ? 'bg-zinc-900/80 border-zinc-700'
                      : typeResult.damageMod > 0
                      ? 'bg-emerald-950/40 border-emerald-500/50'
                      : typeResult.damageMod < 0
                      ? 'bg-rose-950/40 border-rose-500/50'
                      : 'bg-purple-950/30 border-purple-500/30'
                  }`}
                >
                  <div>
                    <span className="text-xs text-slate-400 block">Modificador Aplicado no Dano:</span>
                    <span className="text-lg font-mono font-extrabold text-white">
                      {typeResult.modifierText}
                    </span>
                    <p className="text-xs text-slate-300 mt-1">{typeResult.description}</p>
                  </div>

                  <div className="text-right">
                    <span
                      className={`text-2xl font-mono font-bold px-3 py-1 rounded-lg ${
                        typeResult.isImmune
                          ? 'bg-zinc-800 text-zinc-400'
                          : typeResult.damageMod > 0
                          ? 'bg-emerald-600 text-white'
                          : typeResult.damageMod < 0
                          ? 'bg-rose-600 text-white'
                          : 'bg-zinc-800 text-slate-300'
                      }`}
                    >
                      {typeResult.isImmune
                        ? '0 DANO'
                        : typeResult.damageMod > 0
                        ? `+${typeResult.damageMod}`
                        : typeResult.damageMod === 0
                        ? '+0'
                        : `${typeResult.damageMod}`}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeCategory === 'rules' && (
            <div className="space-y-6">
              {/* Dificuldades */}
              <div className="p-4 rounded-xl bg-[#161726] border border-purple-900/30 space-y-3">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Escala de Dificuldade (Classe de Alvo - CA)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {DIFFICULTY_SCALE.map((d) => (
                    <div key={d.ca} className="p-2.5 rounded-lg bg-black/40 border border-zinc-800 flex items-start gap-3">
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800 shrink-0">
                        CA {d.ca}
                      </span>
                      <div>
                        <div className="text-xs font-bold text-slate-200">{d.label}</div>
                        <p className="text-[11px] text-slate-400">{d.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Resultados possíveis */}
              <div className="p-4 rounded-xl bg-[#161726] border border-purple-900/30 space-y-3">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Leitura dos Resultados</h3>
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-500/30 text-emerald-200">
                    <strong>Sucesso Forte (Total ≥ CA + 5):</strong> Objetivo alcançado com benefício adicional (rapidez, discrição, pista extra ou economia de recurso).
                  </div>
                  <div className="p-2.5 rounded-lg bg-purple-950/30 border border-purple-500/30 text-purple-200">
                    <strong>Sucesso (Total ≥ CA):</strong> Objetivo alcançado sem custos adicionais relevantes.
                  </div>
                  <div className="p-2.5 rounded-lg bg-amber-950/30 border border-amber-500/30 text-amber-200">
                    <strong>Sucesso com Custo (Faltou 1 ou 2 pontos):</strong> O personagem avança, mas paga um custo (atraso, barulho, gasto de recurso ou posição desfavorável).
                  </div>
                  <div className="p-2.5 rounded-lg bg-rose-950/30 border border-rose-500/30 text-rose-200">
                    <strong>Falha (Faltou 3+ pontos):</strong> O objetivo não é alcançado e uma complicação dramática acontece.
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeCategory === 'items' && (
            <div className="space-y-4">
              <div className="p-3 bg-purple-950/20 border border-purple-800/30 rounded-xl text-xs text-purple-200">
                <strong>Itens e Economia (Seção 46):</strong> Preços sugeridos em Pokédólares (PD). Pacote inicial comum: 1.000 PD, kit de viagem, 1 Poção e 2 Poké Bolas.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {filteredItems.map((item) => (
                  <div
                    key={item.name}
                    className="p-3.5 rounded-xl bg-[#161726] border border-purple-900/20 flex flex-col justify-between space-y-2"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-xs text-white">{item.name}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-slate-400">
                          {item.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">{item.effect}</p>
                    </div>

                    <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-xs">
                      <span className="text-slate-500">Preço:</span>
                      <span className="font-mono font-bold text-amber-400">{item.price} PD</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeCategory === 'conditions' && (
            <div className="space-y-4">
              <div className="p-3 bg-purple-950/20 border border-purple-800/30 rounded-xl text-xs text-purple-200">
                <strong>Condições de Batalha (Seção 41):</strong> Condições iguais não se acumulam; prevalece a de maior duração.
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {CONDITIONS.map((cond) => (
                  <div key={cond.name} className="p-4 rounded-xl bg-[#161726] border border-zinc-800 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <Flame className="w-4 h-4 text-purple-400" />
                      <h4 className="font-bold text-xs text-slate-200">{cond.name}</h4>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">{cond.effect}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-purple-900/30 bg-[#0f1019] flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Regras extraídas diretamente do livro oficial Além da Próxima Rota 1.0
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-slate-200 transition-colors"
          >
            Fechar Compêndio
          </button>
        </div>
      </div>
    </div>
  );
};
