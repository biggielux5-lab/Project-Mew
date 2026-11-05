import React, { useState } from 'react';
import { 
  MapPin, 
  Compass, 
  Users, 
  Sparkles, 
  Lock, 
  Eye, 
  EyeOff, 
  Search,
  Navigation
} from 'lucide-react';
import { AtlasLocation } from '../types';
import { getLocations, saveLocation } from '../services/storageService';

interface AtlasViewProps {
  campaignId: string;
  isGm?: boolean;
}

export const AtlasView: React.FC<AtlasViewProps> = ({ campaignId, isGm = true }) => {
  const [locations, setLocations] = useState<AtlasLocation[]>(() => getLocations(campaignId));
  const [selectedLoc, setSelectedLoc] = useState<AtlasLocation | null>(locations[0] || null);
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [showGmSecrets, setShowGmSecrets] = useState<boolean>(isGm);

  const filteredLocations = locations.filter((loc: AtlasLocation) => {
    const matchType = selectedType === 'all' || loc.type === selectedType;
    const matchSearch = loc.name.toLowerCase().includes(search.toLowerCase()) ||
      loc.region.toLowerCase().includes(search.toLowerCase()) ||
      loc.description.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20">
              <Compass className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold text-white tracking-wide">Atlas & Rotas de Kanto</h1>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Diretório geográfico de cidades, rotas selvagens, fauna nativa, infraestrutura e segredos regionais.
          </p>
        </div>

        <button
          onClick={() => setShowGmSecrets(!showGmSecrets)}
          className={`px-3 py-2 text-xs font-semibold rounded-lg border transition-colors flex items-center gap-1.5 ${
            showGmSecrets
              ? 'bg-purple-500/10 border-purple-500/30 text-purple-300'
              : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
          }`}
        >
          {showGmSecrets ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          <span>Segredos do Mestre</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs">
          <button
            onClick={() => setSelectedType('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              selectedType === 'all' ? 'bg-teal-500/10 text-teal-400 font-bold border border-teal-500/20' : 'text-slate-400 hover:text-white'
            }`}
          >
            Todos ({locations.length})
          </button>
          <button
            onClick={() => setSelectedType('Cidade')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              selectedType === 'Cidade' ? 'bg-teal-500/10 text-teal-400 font-bold border border-teal-500/20' : 'text-slate-400 hover:text-white'
            }`}
          >
            Cidades ({locations.filter((l: AtlasLocation) => l.type === 'Cidade').length})
          </button>
          <button
            onClick={() => setSelectedType('Rota')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              selectedType === 'Rota' ? 'bg-teal-500/10 text-teal-400 font-bold border border-teal-500/20' : 'text-slate-400 hover:text-white'
            }`}
          >
            Rotas ({locations.filter((l: AtlasLocation) => l.type === 'Rota').length})
          </button>
          <button
            onClick={() => setSelectedType('Especial')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              selectedType === 'Especial' ? 'bg-teal-500/10 text-teal-400 font-bold border border-teal-500/20' : 'text-slate-400 hover:text-white'
            }`}
          >
            Especiais ({locations.filter((l: AtlasLocation) => l.type === 'Especial').length})
          </button>
        </div>

        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Buscar localidade..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 pl-9 pr-3 py-1.5 text-xs rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
          />
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Locations List */}
        <div className="lg:col-span-1 space-y-2 max-h-[640px] overflow-y-auto pr-1">
          {filteredLocations.map((loc: AtlasLocation) => {
            const isSelected = selectedLoc?.id === loc.id;
            return (
              <button
                key={loc.id}
                onClick={() => setSelectedLoc(loc)}
                className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                  isSelected
                    ? 'bg-teal-500/10 border-teal-500/40 text-white shadow-md'
                    : 'bg-slate-900/70 border-slate-800 text-slate-300 hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm">{loc.name}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700">
                    {loc.type}
                  </span>
                </div>
                <div className="text-xs text-slate-400 mt-1 line-clamp-1">{loc.description}</div>
                <div className="text-[11px] text-teal-400 mt-2 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  <span>{loc.region}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Location Details */}
        <div className="lg:col-span-2">
          {selectedLoc ? (
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
              <div className="flex items-start justify-between border-b border-slate-800 pb-4">
                <div>
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <MapPin className="w-6 h-6 text-teal-400" />
                    <span>{selectedLoc.name}</span>
                  </h2>
                  <div className="text-xs text-slate-400 mt-1">
                    Região: <strong className="text-slate-200">{selectedLoc.region}</strong> · Categoria: <strong className="text-slate-200 uppercase">{selectedLoc.type}</strong>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="text-sm text-slate-200 leading-relaxed bg-slate-950/50 p-4 rounded-xl border border-slate-800/80">
                {selectedLoc.description}
              </div>

              {/* Wild Pokemon Habitat */}
              {selectedLoc.wildPokemonNames && selectedLoc.wildPokemonNames.length > 0 && (
                <div className="space-y-2 bg-slate-950/40 border border-slate-800/80 rounded-xl p-4">
                  <div className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Fauna Pokémon Avistada Nesta Área
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {selectedLoc.wildPokemonNames.map((poke: string, idx: number) => (
                      <span
                        key={idx}
                        className="text-xs px-2.5 py-1 rounded bg-slate-800 text-slate-200 border border-slate-700"
                      >
                        {poke}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Available Items */}
              {selectedLoc.availableItemsSummary && selectedLoc.availableItemsSummary.length > 0 && (
                <div className="space-y-2 bg-slate-950/40 border border-slate-800/80 rounded-xl p-4">
                  <div className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
                    <Navigation className="w-3.5 h-3.5" />
                    Recursos & Itens Coletáveis
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {selectedLoc.availableItemsSummary.map((item: string, idx: number) => (
                      <span
                        key={idx}
                        className="text-xs px-2.5 py-1 rounded bg-sky-500/10 text-sky-300 border border-sky-500/20"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* GM Secrets */}
              {showGmSecrets && selectedLoc.gmNotes && (
                <div className="space-y-2 bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
                  <div className="text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
                    <Lock className="w-4 h-4" />
                    Notas Confidenciais do Mestre
                  </div>
                  <p className="text-xs text-purple-200/90 leading-relaxed italic">
                    {selectedLoc.gmNotes}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-12 text-center text-slate-400 text-sm">
              Selecione uma localidade no atlas para inspecionar rotas e fauna.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
