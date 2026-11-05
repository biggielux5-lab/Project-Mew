/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { storageService } from '../services/storageService';
import { Campaign, TrainerSheet, PokemonSheet } from '../types';
import {
  Compass,
  Users,
  ShieldAlert,
  Sparkles,
  BookOpen,
  Calendar,
  Settings,
  Plus,
  Copy,
  Check,
  Dices,
  Clock,
  FileText,
  Heart,
  Shield,
  ArrowRight,
  ChevronRight,
  Info,
  Swords,
  Search,
  Network,
  Radio,
  Trophy,
  AlertCircle,
  FolderOpen,
} from 'lucide-react';

interface OverviewViewProps {
  trainers: TrainerSheet[];
  pokemons: PokemonSheet[];
  onOpenTrainer: (sheet: TrainerSheet) => void;
  onOpenPokemon: (sheet: PokemonSheet) => void;
  onOpenNewTrainer: () => void;
  onOpenNewPokemon: () => void;
  onOpenSettings: () => void;
  onAdvanceClock: (clock: any, delta: number) => void;
  onNavigateTab: (tab: any) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  trainers,
  pokemons,
  onOpenTrainer,
  onOpenPokemon,
  onOpenNewTrainer,
  onOpenNewPokemon,
  onOpenSettings,
  onAdvanceClock,
  onNavigateTab,
}) => {
  const { activeCampaign, isGM, currentUser, campaigns } = useAuth();
  const [copiedCode, setCopiedCode] = useState(false);
  const [showAgreements, setShowAgreements] = useState(false);

  if (!activeCampaign) {
    return (
      <div className="py-16 px-4 text-center max-w-md mx-auto space-y-4">
        <div className="w-12 h-12 rounded-xl bg-purple-950/40 border border-purple-800/40 flex items-center justify-center mx-auto text-purple-400">
          <Compass className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-100">Nenhuma campanha selecionada</h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          Para começar a organizar sua jornada, crie uma nova campanha ou selecione uma mesa existente.
        </p>
        <button
          onClick={() => onNavigateTab('campaigns')}
          className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 font-bold text-xs text-white shadow-md transition-all"
        >
          Ir para Campanhas
        </button>
      </div>
    );
  }

  // Filter user's own characters
  const myTrainers = trainers.filter((t) => t.ownerId === currentUser?.id);
  const latestSession = activeCampaign.sessions[0];
  const urgentClock = activeCampaign.clocks.find((c) => !c.isSecret || isGM);
  const pendingItems = isGM ? storageService.getNarrativePending(activeCampaign.id).filter(i => !i.resolved) : [];

  const handleCopyCode = () => {
    navigator.clipboard.writeText(activeCampaign.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-150">
      {/* 1. Header de Boas-Vindas */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-zinc-800/60">
        <div>
          <h2 className="text-xl font-bold text-slate-100 tracking-tight flex items-center gap-2">
            Olá, {currentUser?.name || 'Treinador'}
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                isGM
                  ? 'bg-amber-950/70 text-amber-300 border border-amber-800/40'
                  : 'bg-purple-950/70 text-purple-300 border border-purple-800/40'
              }`}
            >
              {isGM ? 'Mestre' : 'Jogador'}
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Painel de controle para organização e consulta da sua jornada Pokémon.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenNewTrainer}
            className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-zinc-700/60"
          >
            <Plus className="w-3.5 h-3.5 text-purple-400" />
            Nova Ficha
          </button>
          <button
            onClick={() => onNavigateTab('campaigns')}
            className="px-3 py-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-200 text-xs font-semibold border border-purple-600/40 flex items-center gap-1.5 transition-colors"
          >
            Minhas Campanhas ({campaigns.length})
          </button>
        </div>
      </div>

      {/* 2. Card da Campanha em Foco */}
      <div className="p-5 rounded-xl bg-[#13141f] border border-zinc-800/80 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Mesa em Foco
              </span>
              {activeCampaign.isSample ? (
                <span className="text-[10px] px-2 py-0.2 rounded font-medium bg-zinc-800 text-purple-300 border border-purple-900/40">
                  Exemplo de Demonstração
                </span>
              ) : (
                <span className="text-[10px] px-2 py-0.2 rounded font-medium bg-purple-950/60 text-purple-300 border border-purple-800/50">
                  Sua Campanha
                </span>
              )}
              <span className="text-[10px] text-slate-500">•</span>
              <span className="text-[10px] text-slate-400">{activeCampaign.publicInfo.region}</span>
              {activeCampaign.calendar && (
                <>
                  <span className="text-[10px] text-slate-500">•</span>
                  <span className="text-[10px] font-mono text-purple-300">
                    Dia {activeCampaign.calendar.day}/{activeCampaign.calendar.month} ({activeCampaign.calendar.hour}:{String(activeCampaign.calendar.minute).padStart(2, '0')})
                  </span>
                </>
              )}
            </div>

            <h3 className="text-lg font-bold text-white tracking-tight">{activeCampaign.name}</h3>

            <p className="text-xs text-slate-300 leading-relaxed max-w-3xl pt-0.5 line-clamp-2">
              {activeCampaign.description}
            </p>
          </div>

          {/* Quick invite & settings */}
          <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0">
            <button
              onClick={handleCopyCode}
              className="px-2.5 py-1.5 rounded-lg bg-[#1a1b2b] hover:bg-[#222438] text-xs font-mono font-medium text-slate-200 border border-zinc-700/80 flex items-center gap-1.5 transition-colors"
              title="Copiar código de convite"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-purple-400" />}
              <span>{activeCampaign.code}</span>
            </button>

            {isGM && (
              <button
                onClick={onOpenSettings}
                className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors"
              >
                <Settings className="w-3.5 h-3.5" />
                Configurações
              </button>
            )}
          </div>
        </div>

        {/* Collapsible House Rules & Tone */}
        <div className="pt-2 border-t border-zinc-800/60">
          <button
            onClick={() => setShowAgreements(!showAgreements)}
            className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 font-medium transition-colors"
          >
            <Info className="w-3.5 h-3.5" />
            {showAgreements ? 'Ocultar detalhes e acordos da mesa' : 'Ver tom e acordos da mesa'}
          </button>

          {showAgreements && (
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-[#0e0f18] p-3 rounded-lg border border-zinc-800 animate-in fade-in duration-150">
              <div>
                <strong className="text-slate-300 block mb-1">Tom da Campanha:</strong>
                <p className="text-slate-400 leading-relaxed">{activeCampaign.publicInfo.tone}</p>
              </div>
              <div>
                <strong className="text-slate-300 block mb-1">Acordos de Convivência (Sessão Zero):</strong>
                <p className="text-slate-400 leading-relaxed">{activeCampaign.publicInfo.campaignAgreements}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. Seção: Meus Personagens na Mesa */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-400" />
              {isGM ? 'Personagens da Mesa' : 'Meus Personagens'}
            </h3>
            <p className="text-xs text-slate-400">
              {isGM
                ? 'Treinadores ativos gerenciados pelos jogadores na campanha.'
                : 'Fichas de treinador vinculadas à sua conta nesta mesa.'}
            </p>
          </div>

          <button
            onClick={() => onNavigateTab('trainers')}
            className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 font-medium"
          >
            Ver todos ({trainers.length}) <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Characters Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {(isGM ? trainers : myTrainers).slice(0, 4).map((t) => (
            <div
              key={t.id}
              onClick={() => onOpenTrainer(t)}
              className="p-3.5 rounded-xl bg-[#13141f] border border-zinc-800/80 hover:border-purple-600/40 transition-all flex items-center justify-between gap-3 cursor-pointer group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={t.avatarUrl}
                  alt={t.name}
                  className="w-11 h-11 rounded-lg object-cover border border-purple-500/30 shrink-0"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-xs truncate group-hover:text-purple-300 transition-colors">
                      {t.name}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-800 text-purple-300 font-semibold">
                      Nv {t.level}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 truncate mt-0.5">
                    {t.className || 'Sem classe'} • {t.origin}
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="flex items-center gap-1 text-xs font-mono font-bold text-rose-300">
                  <Heart className="w-3 h-3 fill-rose-500" />
                  {t.currentHp}/{t.maxHp}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Defesa: {t.defense}</div>
              </div>
            </div>
          ))}

          {(isGM ? trainers : myTrainers).length === 0 && (
            <div className="col-span-full p-6 text-center rounded-xl bg-[#13141f] border border-zinc-800/60 space-y-2">
              <p className="text-xs text-slate-400">Você ainda não possui um treinador nesta campanha.</p>
              <button
                onClick={onOpenNewTrainer}
                className="px-3.5 py-1.5 rounded-lg bg-purple-600/80 hover:bg-purple-600 text-xs font-semibold text-white transition-colors"
              >
                Criar Minha Primeira Ficha
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 4. Acesso Rápido às Novas Ferramentas de Mesa */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-100">Centros de Operação & Ação</h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={() => onNavigateTab('vtt')}
            className="p-3.5 rounded-xl bg-[#13141f] border border-purple-900/50 hover:border-purple-500 text-left transition-all group shadow-sm hover:shadow-purple-950/30 cursor-pointer"
          >
            <div className="p-2 rounded-lg bg-purple-950/80 text-purple-400 w-fit mb-2 group-hover:scale-105 transition-transform">
              <Compass className="w-4 h-4" />
            </div>
            <span className="font-bold text-xs text-white block">Mesa Virtual (VTT)</span>
            <span className="text-[10px] text-purple-300 font-mono mt-0.5 block">Grid & Tokens</span>
          </button>

          <button
            onClick={() => onNavigateTab('mysteries')}
            className="p-3.5 rounded-xl bg-[#13141f] border border-zinc-800/80 hover:border-purple-600/40 text-left transition-all group cursor-pointer"
          >
            <div className="p-2 rounded-lg bg-sky-950/50 text-sky-400 w-fit mb-2 group-hover:scale-105 transition-transform">
              <Search className="w-4 h-4" />
            </div>
            <span className="font-bold text-xs text-white block">Mistérios & Pistas</span>
            <span className="text-[10px] text-slate-400 mt-0.5 block">Investigação</span>
          </button>

          <button
            onClick={() => onNavigateTab('factions')}
            className="p-3.5 rounded-xl bg-[#13141f] border border-zinc-800/80 hover:border-purple-600/40 text-left transition-all group cursor-pointer"
          >
            <div className="p-2 rounded-lg bg-emerald-950/50 text-emerald-400 w-fit mb-2 group-hover:scale-105 transition-transform">
              <Network className="w-4 h-4" />
            </div>
            <span className="font-bold text-xs text-white block">Facções & Relações</span>
            <span className="text-[10px] text-slate-400 mt-0.5 block">Rede de Poder</span>
          </button>

          <button
            onClick={() => onNavigateTab('world-state')}
            className="p-3.5 rounded-xl bg-[#13141f] border border-zinc-800/80 hover:border-purple-600/40 text-left transition-all group cursor-pointer"
          >
            <div className="p-2 rounded-lg bg-amber-950/50 text-amber-400 w-fit mb-2 group-hover:scale-105 transition-transform">
              <Calendar className="w-4 h-4" />
            </div>
            <span className="font-bold text-xs text-white block">Estado do Mundo</span>
            <span className="text-[10px] text-slate-400 mt-0.5 block">Tempo & Clima</span>
          </button>

          <button
            onClick={() => onNavigateTab('news')}
            className="p-3.5 rounded-xl bg-[#13141f] border border-zinc-800/80 hover:border-purple-600/40 text-left transition-all group cursor-pointer"
          >
            <div className="p-2 rounded-lg bg-cyan-950/50 text-cyan-400 w-fit mb-2 group-hover:scale-105 transition-transform">
              <Radio className="w-4 h-4" />
            </div>
            <span className="font-bold text-xs text-white block">Mural de Notícias</span>
            <span className="text-[10px] text-slate-400 mt-0.5 block">Rádio de Kanto</span>
          </button>

          <button
            onClick={() => onNavigateTab('tournaments')}
            className="p-3.5 rounded-xl bg-[#13141f] border border-zinc-800/80 hover:border-purple-600/40 text-left transition-all group cursor-pointer"
          >
            <div className="p-2 rounded-lg bg-yellow-950/50 text-yellow-400 w-fit mb-2 group-hover:scale-105 transition-transform">
              <Trophy className="w-4 h-4" />
            </div>
            <span className="font-bold text-xs text-white block">Torneios Oficiais</span>
            <span className="text-[10px] text-slate-400 mt-0.5 block">Chaves & Duelos</span>
          </button>

          <button
            onClick={() => onNavigateTab('campaign-files')}
            className="p-3.5 rounded-xl bg-[#13141f] border border-zinc-800/80 hover:border-purple-600/40 text-left transition-all group cursor-pointer"
          >
            <div className="p-2 rounded-lg bg-indigo-950/50 text-indigo-400 w-fit mb-2 group-hover:scale-105 transition-transform">
              <FolderOpen className="w-4 h-4" />
            </div>
            <span className="font-bold text-xs text-white block">Central de Arquivos</span>
            <span className="text-[10px] text-slate-400 mt-0.5 block">Mapas & Handouts</span>
          </button>

          {isGM && (
            <button
              onClick={() => onNavigateTab('session-prep')}
              className="p-3.5 rounded-xl bg-[#13141f] border border-purple-900/60 hover:border-purple-400 text-left transition-all group cursor-pointer"
            >
              <div className="p-2 rounded-lg bg-purple-900/60 text-purple-300 w-fit mb-2 group-hover:scale-105 transition-transform">
                <FileText className="w-4 h-4" />
              </div>
              <span className="font-bold text-xs text-white block">Preparar Sessão</span>
              <span className="text-[10px] text-purple-300 mt-0.5 block">Cenas & Ganchos</span>
            </button>
          )}
        </div>
      </div>

      {/* 5. GM Pending Items & Recent Activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isGM && pendingItems.length > 0 && (
          <div className="p-4 rounded-xl bg-[#11121c] border border-amber-900/40 space-y-2">
            <span className="font-bold text-amber-300 flex items-center gap-1.5 uppercase text-[10px] tracking-wider">
              <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
              Pendências Narrativas em Aberto ({pendingItems.length})
            </span>
            <div className="space-y-1.5">
              {pendingItems.slice(0, 3).map((item) => (
                <div key={item.id} className="text-xs text-slate-300 flex items-start gap-2">
                  <span className="text-amber-400 font-mono font-bold">•</span>
                  <div>
                    <span className="font-semibold text-white">{item.title}</span>
                    <p className="text-[11px] text-slate-400 line-clamp-1">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {latestSession && (
          <div className="p-4 rounded-xl bg-[#11121c] border border-zinc-800/80 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-300 flex items-center gap-1.5 uppercase text-[10px] tracking-wider">
                <Calendar className="w-3.5 h-3.5 text-purple-400" />
                Última Atividade da Mesa
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                Sessão {latestSession.sessionNumber} • {latestSession.date}
              </span>
            </div>

            <div className="text-xs">
              <div className="font-semibold text-slate-200">{latestSession.title}</div>
              <p className="text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">{latestSession.summary}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
