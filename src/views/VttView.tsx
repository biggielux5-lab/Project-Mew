/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { storageService } from '../services/storageService';
import { VTTMap, VTTToken, TrainerSheet, PokemonSheet } from '../types';
import {
  Compass,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  Move,
  Heart,
} from 'lucide-react';

export const VttView: React.FC = () => {
  const { activeCampaign, isGM } = useAuth();
  const [maps, setMaps] = useState<VTTMap[]>([]);
  const [selectedMap, setSelectedMap] = useState<VTTMap | null>(null);
  const [selectedToken, setSelectedToken] = useState<VTTToken | null>(null);
  const [toolMode, setToolMode] = useState<'move' | 'fog-reveal' | 'fog-hide'>('move');

  // Token Placer Modal
  const [isTokenModalOpen, setIsTokenModalOpen] = useState(false);
  const [trainers, setTrainers] = useState<TrainerSheet[]>([]);
  const [pokemons, setPokemons] = useState<PokemonSheet[]>([]);

  const reloadData = () => {
    if (!activeCampaign) return;
    const mapList = storageService.getVttMaps(activeCampaign.id);
    setMaps(mapList);
    if (selectedMap) {
      const updated = mapList.find((m) => m.id === selectedMap.id) || mapList[0] || null;
      setSelectedMap(updated);
    } else if (mapList.length > 0) {
      setSelectedMap(mapList[0]);
    }

    setTrainers(storageService.getTrainers(activeCampaign.id));
    setPokemons(storageService.getPokemons(activeCampaign.id));
  };

  useEffect(() => {
    reloadData();
  }, [activeCampaign]);

  const isCellRevealed = (map: VTTMap, x: number, y: number): boolean => {
    if (!map.fogOfWar) return true;
    return map.revealedCells?.includes(`${x},${y}`) ?? false;
  };

  // Click on a cell
  const handleCellClick = (x: number, y: number) => {
    if (!selectedMap) return;

    if (toolMode === 'fog-reveal' || toolMode === 'fog-hide') {
      if (!isGM) return;
      const coord = `${x},${y}`;
      let updatedRevealed = selectedMap.revealedCells ? [...selectedMap.revealedCells] : [];

      if (toolMode === 'fog-reveal') {
        if (!updatedRevealed.includes(coord)) updatedRevealed.push(coord);
      } else {
        updatedRevealed = updatedRevealed.filter((c) => c !== coord);
      }

      const updatedMap: VTTMap = { ...selectedMap, revealedCells: updatedRevealed };
      storageService.saveVttMap(updatedMap);
      setSelectedMap(updatedMap);
      return;
    }

    // Move mode: if a token is selected, move it here
    if (toolMode === 'move' && selectedToken) {
      const updatedTokens = selectedMap.tokens.map((t) =>
        t.id === selectedToken.id ? { ...t, x, y } : t
      );
      const updatedMap: VTTMap = { ...selectedMap, tokens: updatedTokens };
      storageService.saveVttMap(updatedMap);
      setSelectedMap(updatedMap);
      setSelectedToken({ ...selectedToken, x, y });
    }
  };

  // Add token from Trainer
  const handleAddTrainerToken = (tr: TrainerSheet) => {
    if (!selectedMap) return;
    const newToken: VTTToken = {
      id: `tok_tr_${tr.id}_${Date.now()}`,
      name: tr.name,
      sheetType: 'trainer',
      sheetId: tr.id,
      x: Math.floor(selectedMap.columns / 2),
      y: Math.floor(selectedMap.rows / 2),
      size: 1,
      color: '#8b5cf6',
      currentHp: tr.currentHp,
      maxHp: tr.maxHp,
      conditions: [],
      isSecret: false,
      avatarUrl: tr.avatarUrl,
    };

    const updatedMap = { ...selectedMap, tokens: [...selectedMap.tokens, newToken] };
    storageService.saveVttMap(updatedMap);
    setSelectedMap(updatedMap);
    setIsTokenModalOpen(false);
  };

  // Add token from Pokemon
  const handleAddPokemonToken = (pk: PokemonSheet) => {
    if (!selectedMap) return;
    const newToken: VTTToken = {
      id: `tok_pk_${pk.id}_${Date.now()}`,
      name: pk.nickname || pk.species,
      sheetType: 'pokemon',
      sheetId: pk.id,
      x: Math.floor(selectedMap.columns / 2) + 1,
      y: Math.floor(selectedMap.rows / 2),
      size: 1,
      color: '#10b981',
      currentHp: pk.currentHp,
      maxHp: pk.maxHp,
      conditions: pk.conditions,
      isSecret: false,
      avatarUrl: pk.spriteUrl,
    };

    const updatedMap = { ...selectedMap, tokens: [...selectedMap.tokens, newToken] };
    storageService.saveVttMap(updatedMap);
    setSelectedMap(updatedMap);
    setIsTokenModalOpen(false);
  };

  // Delete token
  const handleDeleteToken = (tokenId: string) => {
    if (!selectedMap) return;
    const updatedTokens = selectedMap.tokens.filter((t) => t.id !== tokenId);
    const updatedMap = { ...selectedMap, tokens: updatedTokens };
    storageService.saveVttMap(updatedMap);
    setSelectedMap(updatedMap);
    if (selectedToken?.id === tokenId) setSelectedToken(null);
  };

  // Toggle token secret (fog of war)
  const handleToggleTokenSecret = (tokenId: string) => {
    if (!selectedMap || !isGM) return;
    const updatedTokens = selectedMap.tokens.map((t) =>
      t.id === tokenId ? { ...t, isSecret: !t.isSecret } : t
    );
    const updatedMap = { ...selectedMap, tokens: updatedTokens };
    storageService.saveVttMap(updatedMap);
    setSelectedMap(updatedMap);
  };

  // Reveal all fog
  const handleClearFog = () => {
    if (!selectedMap || !isGM) return;
    const allCoords: string[] = [];
    for (let r = 0; r < selectedMap.rows; r++) {
      for (let c = 0; c < selectedMap.columns; c++) {
        allCoords.push(`${c},${r}`);
      }
    }
    const updatedMap = { ...selectedMap, revealedCells: allCoords };
    storageService.saveVttMap(updatedMap);
    setSelectedMap(updatedMap);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-purple-950/70 border border-purple-800/50 text-purple-300">
              <Compass className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-100 tracking-tight">
              Mesa Virtual (VTT) & Mapas Táticos
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Grid tático interativo com névoa de guerra, tokens vinculados a fichas e anotações de terreno.
          </p>
        </div>

        {/* Map switcher & controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={selectedMap?.id || ''}
            onChange={(e) => {
              const m = maps.find((x) => x.id === e.target.value);
              if (m) {
                setSelectedMap(m);
                setSelectedToken(null);
              }
            }}
            className="px-3 py-1.5 bg-[#141522] border border-zinc-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-purple-500 font-semibold cursor-pointer"
          >
            {maps.map((m) => (
              <option key={m.id} value={m.id}>
                Mapa: {m.name} ({m.columns}x{m.rows})
              </option>
            ))}
          </select>

          {isGM && (
            <button
              onClick={() => setIsTokenModalOpen(true)}
              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Inserir Token</span>
            </button>
          )}
        </div>
      </div>

      {selectedMap ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main VTT Grid Board */}
          <div className="lg:col-span-9 space-y-4">
            {/* Toolbar */}
            <div className="p-3 bg-[#11121d] rounded-xl border border-zinc-800/80 flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2 text-xs">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
                  Ferramenta:
                </span>
                <button
                  onClick={() => setToolMode('move')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    toolMode === 'move'
                      ? 'bg-purple-600 text-white'
                      : 'bg-zinc-900 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Move className="w-3.5 h-3.5" />
                  <span>Mover Tokens</span>
                </button>

                {isGM && (
                  <>
                    <button
                      onClick={() => setToolMode('fog-reveal')}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                        toolMode === 'fog-reveal'
                          ? 'bg-purple-600 text-white'
                          : 'bg-zinc-900 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Revelar Névoa</span>
                    </button>
                    <button
                      onClick={() => setToolMode('fog-hide')}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                        toolMode === 'fog-hide'
                          ? 'bg-purple-600 text-white'
                          : 'bg-zinc-900 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <EyeOff className="w-3.5 h-3.5" />
                      <span>Ocultar Névoa</span>
                    </button>
                    <button
                      onClick={handleClearFog}
                      className="px-2 py-1 rounded-lg bg-zinc-900 text-slate-400 hover:text-slate-200 text-xs"
                      title="Revelar todo o mapa"
                    >
                      Limpar Névoa
                    </button>
                  </>
                )}
              </div>

              <div className="text-xs text-slate-400 font-mono">
                {selectedToken ? (
                  <span className="text-purple-300 font-semibold">
                    Selecionado: {selectedToken.name} (X:{selectedToken.x}, Y:{selectedToken.y})
                  </span>
                ) : (
                  <span>Clique em um token para selecionar</span>
                )}
              </div>
            </div>

            {/* Grid Container */}
            <div className="p-4 bg-[#0d0e17] rounded-2xl border border-zinc-800/80 overflow-auto flex justify-center items-center">
              <div
                className="grid gap-[2px] bg-zinc-950 p-2 rounded-xl shadow-inner select-none"
                style={{
                  gridTemplateColumns: `repeat(${selectedMap.columns}, minmax(42px, 52px))`,
                  gridTemplateRows: `repeat(${selectedMap.rows}, minmax(42px, 52px))`,
                }}
              >
                {Array.from({ length: selectedMap.rows }).map((_, y) =>
                  Array.from({ length: selectedMap.columns }).map((_, x) => {
                    const revealed = isCellRevealed(selectedMap, x, y);
                    const token = selectedMap.tokens.find((t) => t.x === x && t.y === y);
                    const isTokenSelected = selectedToken?.id === token?.id;

                    const isCellHidden = !revealed && !isGM;

                    return (
                      <div
                        key={`${x}-${y}`}
                        onClick={() => handleCellClick(x, y)}
                        className={`w-full h-full aspect-square border border-zinc-800/40 rounded flex items-center justify-center relative cursor-pointer transition-all ${
                          isCellHidden
                            ? 'bg-zinc-950 opacity-95'
                            : !revealed
                            ? 'bg-zinc-900/90 border-purple-900/30'
                            : 'bg-[#151624] hover:bg-[#1a1b2d]'
                        }`}
                      >
                        <span className="absolute top-0.5 left-0.5 text-[8px] font-mono text-zinc-700 pointer-events-none">
                          {x},{y}
                        </span>

                        {isGM && !revealed && (
                          <div className="absolute inset-0 bg-black/60 rounded flex items-center justify-center pointer-events-none">
                            <EyeOff className="w-3.5 h-3.5 text-zinc-600" />
                          </div>
                        )}

                        {token && (!isCellHidden || isGM) && (
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedToken(token);
                            }}
                            className={`w-9 h-9 rounded-full border-2 flex items-center justify-center shadow-lg transition-transform relative z-10 ${
                              isTokenSelected
                                ? 'scale-110 ring-2 ring-purple-400 border-white'
                                : 'hover:scale-105'
                            } ${token.isSecret ? 'opacity-50 border-dashed' : ''}`}
                            style={{
                              borderColor: token.color || '#a855f7',
                              backgroundColor: '#11121d',
                            }}
                            title={`${token.name} (${token.currentHp ?? '?'}/${token.maxHp ?? '?'} PV)`}
                          >
                            {token.avatarUrl ? (
                              <img
                                src={token.avatarUrl}
                                alt={token.name}
                                className="w-full h-full rounded-full object-cover"
                              />
                            ) : (
                              <span className="text-[10px] font-bold text-white uppercase">
                                {token.name.substring(0, 2)}
                              </span>
                            )}

                            {token.currentHp !== undefined && (
                              <div
                                className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-black ${
                                  (token.currentHp / (token.maxHp || 1)) > 0.5
                                    ? 'bg-emerald-500'
                                    : (token.currentHp / (token.maxHp || 1)) > 0.2
                                    ? 'bg-amber-500'
                                    : 'bg-rose-500'
                                }`}
                              />
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Selected Token or Map Details */}
          <div className="lg:col-span-3 space-y-4">
            {selectedToken ? (
              <div className="p-5 rounded-2xl bg-[#11121d] border border-zinc-800/80 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                      Token: {selectedToken.sheetType}
                    </span>
                    <h3 className="text-base font-bold text-slate-100 mt-1">
                      {selectedToken.name}
                    </h3>
                  </div>

                  {selectedToken.avatarUrl && (
                    <img
                      src={selectedToken.avatarUrl}
                      alt={selectedToken.name}
                      className="w-12 h-12 rounded-xl border border-zinc-700 object-cover"
                    />
                  )}
                </div>

                {selectedToken.currentHp !== undefined && (
                  <div className="p-3 rounded-xl bg-[#161726] border border-zinc-800 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-semibold flex items-center gap-1">
                        <Heart className="w-3.5 h-3.5 text-rose-400" />
                        Pontos de Vida
                      </span>
                      <span className="font-bold text-slate-100 font-mono">
                        {selectedToken.currentHp} / {selectedToken.maxHp}
                      </span>
                    </div>
                    <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full transition-all"
                        style={{
                          width: `${Math.min(
                            100,
                            Math.max(0, (selectedToken.currentHp / (selectedToken.maxHp || 1)) * 100)
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                )}

                <div className="text-xs text-slate-400">
                  Posição no Grid:{' '}
                  <span className="text-slate-200 font-bold font-mono">
                    Coluna {selectedToken.x}, Linha {selectedToken.y}
                  </span>
                </div>

                <div className="pt-3 border-t border-zinc-800 space-y-2">
                  {isGM && (
                    <button
                      onClick={() => handleToggleTokenSecret(selectedToken.id)}
                      className="w-full py-1.5 px-3 bg-zinc-800 hover:bg-zinc-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
                    >
                      {!selectedToken.isSecret ? (
                        <>
                          <EyeOff className="w-3.5 h-3.5" />
                          <span>Ocultar dos Jogadores</span>
                        </>
                      ) : (
                        <>
                          <Eye className="w-3.5 h-3.5" />
                          <span>Revelar aos Jogadores</span>
                        </>
                      )}
                    </button>
                  )}

                  <button
                    onClick={() => handleDeleteToken(selectedToken.id)}
                    className="w-full py-1.5 px-3 bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 border border-rose-800/50 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remover Token do Mapa</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-5 rounded-2xl bg-[#11121d] border border-zinc-800/80 space-y-3">
                <h3 className="text-sm font-bold text-slate-200">Anotações do Terreno</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Dimensões: {selectedMap.columns} colunas × {selectedMap.rows} linhas.
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="p-12 text-center rounded-xl bg-[#11121d] border border-zinc-800/80 text-slate-400 text-xs">
          Nenhum mapa tático disponível.
        </div>
      )}

      {/* Insert Token Modal */}
      {isTokenModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#12131f] border border-zinc-800 rounded-xl max-w-lg w-full p-5 space-y-4 max-h-[85vh] overflow-y-auto shadow-2xl">
            <h3 className="text-sm font-bold text-slate-100">Inserir Token no Grid</h3>

            {/* Trainers */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Treinadores do Grupo ({trainers.length})
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {trainers.map((tr) => (
                  <button
                    key={tr.id}
                    onClick={() => handleAddTrainerToken(tr)}
                    className="p-2.5 rounded-lg bg-zinc-900 hover:bg-purple-950/40 border border-zinc-800 hover:border-purple-600/60 text-left flex items-center gap-2.5 transition-colors"
                  >
                    <img
                      src={tr.avatarUrl}
                      alt={tr.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div className="truncate">
                      <div className="text-xs font-bold text-slate-200 truncate">{tr.name}</div>
                      <div className="text-[10px] text-purple-400">
                        {tr.currentHp}/{tr.maxHp} PV
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Pokemon */}
            <div className="space-y-2 pt-2 border-t border-zinc-800">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Pokémon do Grupo ({pokemons.length})
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                {pokemons.map((pk) => (
                  <button
                    key={pk.id}
                    onClick={() => handleAddPokemonToken(pk)}
                    className="p-2.5 rounded-lg bg-zinc-900 hover:bg-emerald-950/40 border border-zinc-800 hover:border-emerald-600/60 text-left flex items-center gap-2.5 transition-colors"
                  >
                    <img
                      src={pk.spriteUrl}
                      alt={pk.species}
                      className="w-8 h-8 object-contain"
                    />
                    <div className="truncate">
                      <div className="text-xs font-bold text-slate-200 truncate">
                        {pk.nickname || pk.species}
                      </div>
                      <div className="text-[10px] text-emerald-400">
                        Nv.{pk.level} • {pk.currentHp}/{pk.maxHp} PV
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-zinc-800">
              <button
                onClick={() => setIsTokenModalOpen(false)}
                className="px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-slate-300 rounded-lg text-xs"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
