import React, { useState } from 'react';
import { 
  Dice6, 
  Sparkles, 
  Compass, 
  Play, 
  Layers,
  Shield,
  Activity,
  Heart
} from 'lucide-react';
import { EncounterTable, EncounterEntry } from '../types';
import { getEncounterTables, rollEncounter, saveEncounterTable } from '../services/storageService';

interface EncountersViewProps {
  campaignId: string;
}

export const EncountersView: React.FC<EncountersViewProps> = ({ campaignId }) => {
  const [tables, setTables] = useState<EncounterTable[]>(() => getEncounterTables(campaignId));
  const [selectedTable, setSelectedTable] = useState<EncounterTable | null>(tables[0] || null);
  
  // Roller State
  const [rollResult, setRollResult] = useState<{
    entry: EncounterEntry;
    level: number;
    posture: string;
    hp: number;
    pe: number;
    rollValue: number;
  } | null>(null);

  const [isRolling, setIsRolling] = useState(false);

  const handleRoll = () => {
    if (!selectedTable) return;
    setIsRolling(true);
    setRollResult(null);

    setTimeout(() => {
      const res = rollEncounter(selectedTable.id);
      if (res) {
        setRollResult({
          entry: res.entry,
          level: res.rolledLevel,
          posture: res.behavior,
          hp: 12 + res.rolledLevel * 2,
          pe: 2 + Math.ceil(res.rolledLevel / 2),
          rollValue: Math.floor(Math.random() * 100) + 1,
        });
      }
      setIsRolling(false);
    }, 400);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Dice6 className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold text-white tracking-wide">Construtor & Gerador de Encontros Selvagens</h1>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Tabelas por rota, clima e hora do dia com rolagem assistida para o Mestre (nível, postura e PV/PE automáticos).
          </p>
        </div>

        <button
          onClick={handleRoll}
          disabled={!selectedTable || isRolling}
          className="px-5 py-2.5 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white transition-all flex items-center gap-2 shadow-lg shadow-indigo-950/50"
        >
          <Play className={`w-4 h-4 ${isRolling ? 'animate-spin' : ''}`} />
          <span>Rolar Encontro na Tabela Ativa</span>
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Encounter Tables List */}
        <div className="lg:col-span-1 space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
            Tabelas de Encontro ({tables.length})
          </div>

          <div className="space-y-2">
            {tables.map((tbl: EncounterTable) => {
              const isSelected = selectedTable?.id === tbl.id;
              return (
                <button
                  key={tbl.id}
                  onClick={() => {
                    setSelectedTable(tbl);
                    setRollResult(null);
                  }}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                    isSelected
                      ? 'bg-indigo-500/10 border-indigo-500/40 text-white shadow-md'
                      : 'bg-slate-900/70 border-slate-800 text-slate-300 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">{tbl.name}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700">
                      {tbl.biome}
                    </span>
                  </div>

                  <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                    <span>{tbl.routeOrArea}</span>
                    <span>·</span>
                    <span>{tbl.entries.length} espécies cadastradas</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Table Content & Roller Result */}
        <div className="lg:col-span-2 space-y-5">
          {/* Active Roll Result Display */}
          {rollResult && (
            <div className="bg-gradient-to-r from-indigo-950/60 via-slate-900 to-indigo-950/60 border border-indigo-500/40 rounded-xl p-5 shadow-2xl animate-in fade-in space-y-4">
              <div className="flex items-center justify-between border-b border-indigo-500/20 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                    Resultado da Rolagem (d100 = {rollResult.rollValue})
                  </span>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Postura: {rollResult.posture}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-black text-white">{rollResult.entry.speciesName}</h3>
                  <div className="text-xs text-slate-300 mt-1">
                    Nível Gerado: <strong className="text-indigo-400 font-bold text-sm">{rollResult.level}</strong> · Tipo(s): {rollResult.entry.types.join(' / ')}
                  </div>
                </div>

                <div className="flex items-center gap-4 bg-slate-950/80 border border-slate-800 px-4 py-2.5 rounded-xl">
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                      <Heart className="w-3 h-3 text-rose-400" /> PV Inicial
                    </div>
                    <div className="text-base font-bold text-rose-400">{rollResult.hp} PV</div>
                  </div>
                  <div className="w-px h-6 bg-slate-800" />
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                      <Activity className="w-3 h-3 text-cyan-400" /> PE Inicial
                    </div>
                    <div className="text-base font-bold text-cyan-400">{rollResult.pe} PE</div>
                  </div>
                </div>
              </div>

              {rollResult.entry.notes && (
                <div className="text-xs text-slate-400 italic bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/60">
                  "{rollResult.entry.notes}"
                </div>
              )}
            </div>
          )}

          {/* Table Details */}
          {selectedTable ? (
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
              <div className="flex items-start justify-between border-b border-slate-800 pb-3">
                <div>
                  <h2 className="text-lg font-bold text-white">{selectedTable.name}</h2>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {selectedTable.routeOrArea} · Bioma: {selectedTable.biome} · Clima: {selectedTable.weather || 'Qualquer'}
                  </div>
                </div>

                <button
                  onClick={handleRoll}
                  disabled={isRolling}
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors flex items-center gap-1.5"
                >
                  <Dice6 className="w-3.5 h-3.5" />
                  Rolar Nesta Tabela
                </button>
              </div>

              {/* Table Entries */}
              <div className="divide-y divide-slate-800/60">
                {selectedTable.entries.map((entry: EncounterEntry) => (
                  <div key={entry.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <span className="w-16 font-mono text-indigo-400 font-semibold">
                        Peso: {entry.weight}
                      </span>
                      <div>
                        <div className="font-semibold text-white">{entry.speciesName}</div>
                        <div className="text-slate-400 text-[11px]">
                          Nível {entry.minLevel} a {entry.maxLevel} · {entry.types.join('/')}
                        </div>
                      </div>
                    </div>

                    <div className="text-right text-slate-400 flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {entry.behavior}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {entry.rarity}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-12 text-center text-slate-400 text-xs">
              Selecione uma tabela para inspecionar as probabilidades ou rolar encontros.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
