import React, { useState } from 'react';
import { 
  Zap, 
  Flame, 
  Droplet, 
  Moon, 
  HelpCircle, 
  Skull, 
  AlertTriangle, 
  Clock, 
  CheckCircle2,
  Sparkles,
  Info,
  ShieldCheck,
  Search
} from 'lucide-react';
import { BattleCondition, PokemonSheet, OfficialItem } from '../types';
import { getOfficialItems, consumeInventoryItem } from '../services/storageService';
import { SYSTEM_CONDITIONS } from '../data/conditionsData';

interface ConditionsViewProps {
  campaignId: string;
  pokemonList: PokemonSheet[];
  onRefreshCampaign?: () => void;
}

export const ConditionsView: React.FC<ConditionsViewProps> = ({
  campaignId,
  pokemonList,
  onRefreshCampaign
}) => {
  const [search, setSearch] = useState('');
  const [selectedCondition, setSelectedCondition] = useState<BattleCondition>(SYSTEM_CONDITIONS[0]);
  const [activeTab, setActiveTab] = useState<'compendium' | 'active_party'>('compendium');
  const [cureStatus, setCureStatus] = useState<string | null>(null);

  const officialItems = getOfficialItems();

  const filteredConditions = SYSTEM_CONDITIONS.filter((c: BattleCondition) => 
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.description.toLowerCase().includes(search.toLowerCase()) ||
    c.mechanicalEffect.toLowerCase().includes(search.toLowerCase())
  );

  // Pokemon in campaign with active conditions
  const afflictedPokemon = pokemonList.filter((p: PokemonSheet) => p.conditions && p.conditions.length > 0);

  const handleQuickCure = (pokemon: PokemonSheet, condName: string) => {
    // Check if inventory has a counter item
    const condDef = SYSTEM_CONDITIONS.find((c: BattleCondition) => c.name.toLowerCase() === condName.toLowerCase());
    const counterItemName = condDef?.counterItems?.[0] || 'Remédio Completo';
    const counterItem = officialItems.find((i: OfficialItem) => i.name.toLowerCase() === counterItemName.toLowerCase());

    if (!counterItem) {
      setCureStatus(`Para curar ${condName}, utilize um item como "${counterItemName}" ou leve o Pokémon a um Centro Pokémon.`);
      return;
    }

    // Try consuming item from common or trainer inventory
    const res = consumeInventoryItem(counterItem.id, pokemon.id);
    if (res.success) {
      setCureStatus(`Condição "${condName}" curada em ${pokemon.nickname} com sucesso usando ${counterItem.name}!`);
      if (onRefreshCampaign) onRefreshCampaign();
    } else {
      setCureStatus(`Você não possui "${counterItem.name}" no inventário para aplicar a ${pokemon.nickname}.`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <AlertTriangle className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold text-white tracking-wide">Condições & Estados de Batalha</h1>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Manual de mecânicas de combate, regras de aflição, dano residual contínuo e antídotos de Kanto.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('compendium')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'compendium'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Compêndio de Regras
          </button>
          <button
            onClick={() => setActiveTab('active_party')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'active_party'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <span>Monitor do Grupo</span>
            {afflictedPokemon.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-rose-600 text-white text-[10px]">
                {afflictedPokemon.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {cureStatus && (
        <div className="p-3 bg-slate-900 border border-amber-500/30 rounded-xl text-xs text-amber-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{cureStatus}</span>
          </div>
          <button onClick={() => setCureStatus(null)} className="text-slate-400 hover:text-white ml-2">
            ✕
          </button>
        </div>
      )}

      {/* COMPENDIUM TAB */}
      {activeTab === 'compendium' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* List of Conditions */}
          <div className="lg:col-span-1 space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Buscar condição, efeito ou sintoma..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-900/80 border border-slate-800 pl-9 pr-4 py-2 text-xs rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {filteredConditions.map((cond: BattleCondition) => {
                const isSelected = selectedCondition.id === cond.id;
                return (
                  <button
                    key={cond.id}
                    onClick={() => setSelectedCondition(cond)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start justify-between ${
                      isSelected
                        ? 'bg-amber-500/10 border-amber-500/40 text-white shadow-md'
                        : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800/40 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="text-sm font-semibold flex items-center gap-2">
                        <span>{cond.name}</span>
                        {cond.duration && (
                          <span className="text-[10px] text-slate-400 font-normal">({cond.duration})</span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                        {cond.mechanicalEffect}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Condition Details Card */}
          <div className="lg:col-span-2">
            {selectedCondition ? (
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
                <div className="flex items-start justify-between border-b border-slate-800 pb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2.5">
                      <span>{selectedCondition.name}</span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">{selectedCondition.description}</p>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    Duração: {selectedCondition.duration || 'Contínua'}
                  </span>
                </div>

                {/* Mechanical Effect Box */}
                <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Efeito Mecânico no RPG
                  </div>
                  <p className="text-sm text-slate-200 leading-relaxed font-medium">
                    {selectedCondition.mechanicalEffect}
                  </p>
                </div>

                {/* Recovery & Removal Rules */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-4 space-y-2">
                    <div className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      Regra de Encerramento & Teste
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {selectedCondition.resistanceCheck || selectedCondition.endTrigger || 'Teste de Vigor ao final da cena para dissipar o efeito residual.'}
                    </p>
                  </div>

                  <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-4 space-y-2">
                    <div className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Itens de Cura & Tratamento
                    </div>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {selectedCondition.counterItems && selectedCondition.counterItems.length > 0 ? (
                        selectedCondition.counterItems.map((item: string, idx: number) => (
                          <span
                            key={idx}
                            className="text-xs px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                          >
                            {item}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-400 italic">Descanso longo ou Centro Pokémon</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-12 text-center text-slate-400">
                Selecione uma condição para ler as regras e efeitos.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ACTIVE PARTY MONITOR TAB */}
      {activeTab === 'active_party' && (
        <div className="space-y-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
            <h3 className="font-semibold text-white text-base mb-1">
              Painel de Aflições do Grupo ({afflictedPokemon.length} afetados)
            </h3>
            <p className="text-xs text-slate-400">
              Monitore os Pokémon do time que estão sofrendo condições e aplique itens medicinais instantaneamente.
            </p>
          </div>

          {afflictedPokemon.length === 0 ? (
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-12 text-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
              <h4 className="text-base font-semibold text-white">Nenhum Pokémon Afetado</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Todos os Pokémon da campanha estão saudáveis e livres de condições de combate adversas!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {afflictedPokemon.map((poke: PokemonSheet) => (
                <div
                  key={poke.id}
                  className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-lg space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-white text-base">{poke.nickname || poke.species}</div>
                      <div className="text-xs text-slate-400">
                        {poke.species} · Nível {poke.level} · PV: {poke.currentHp}/{poke.maxHp}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 pt-1">
                    <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Condições Ativas:
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {poke.conditions?.map((condName: string) => (
                        <div
                          key={condName}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs"
                        >
                          <span className="font-semibold">{condName}</span>
                          <button
                            onClick={() => handleQuickCure(poke, condName)}
                            className="px-2 py-0.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] transition-colors"
                            title="Tentar curar com item do inventário"
                          >
                            Curar
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
