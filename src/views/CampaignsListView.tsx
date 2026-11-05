/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Campaign } from '../types';
import { Layers, Plus, KeyRound, Users, Calendar, Settings, ArrowRight, Shield, Sparkles } from 'lucide-react';

interface CampaignsListViewProps {
  onOpenNewCampaign: () => void;
  onOpenJoinCampaign: () => void;
  onOpenSettings: (camp: Campaign) => void;
  onSelectCampaign: (campId: string) => void;
}

export const CampaignsListView: React.FC<CampaignsListViewProps> = ({
  onOpenNewCampaign,
  onOpenJoinCampaign,
  onOpenSettings,
  onSelectCampaign,
}) => {
  const { campaigns, activeCampaign, currentUser } = useAuth();

  const userCampaigns = campaigns.filter((c) => !c.isSample);
  const sampleCampaigns = campaigns.filter((c) => c.isSample);

  const renderCampaignCard = (camp: Campaign) => {
    const isActive = activeCampaign?.id === camp.id;
    const isGM = camp.gmId === currentUser?.id;

    return (
      <div
        key={camp.id}
        className={`rounded-xl overflow-hidden bg-[#13141f] border transition-all flex flex-col justify-between ${
          isActive
            ? 'border-purple-500/80 shadow-md ring-1 ring-purple-500/40'
            : 'border-zinc-800/80 hover:border-zinc-700'
        }`}
      >
        <div className="relative h-32 w-full overflow-hidden bg-black/50">
          <img
            src={camp.coverImage}
            alt={camp.name}
            className="w-full h-full object-cover filter brightness-[0.45]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#13141f] via-transparent to-transparent" />

          <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-black/80 text-purple-300 border border-purple-900/40 backdrop-blur-sm">
              {camp.code}
            </span>
            {isGM && (
              <button
                onClick={() => onOpenSettings(camp)}
                className="p-1 rounded bg-black/80 hover:bg-black text-slate-300 hover:text-white border border-zinc-700/80 transition-colors"
                title="Configurações da Campanha"
              >
                <Settings className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="absolute bottom-2.5 left-3.5 right-3.5">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white leading-tight drop-shadow truncate">
                {camp.name}
              </h3>
              {camp.isSample && (
                <span className="text-[9px] font-medium px-1.5 py-0.2 rounded bg-zinc-800 text-purple-300 border border-zinc-700 shrink-0">
                  Exemplo
                </span>
              )}
            </div>
            <span className="text-[10px] text-purple-300/90 font-medium">{camp.publicInfo.region}</span>
          </div>
        </div>

        <div className="p-3.5 space-y-3 flex-1 flex flex-col justify-between">
          <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">{camp.description}</p>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-zinc-800/60 text-[11px] text-slate-400">
            <span className="flex items-center gap-1 truncate">
              <Shield className="w-3 h-3 text-purple-400 shrink-0" />
              <span className="truncate">{camp.gmName}</span>
            </span>
            <span className="flex items-center gap-1 justify-center">
              <Users className="w-3 h-3 text-indigo-400 shrink-0" />
              {camp.players.length} jogadores
            </span>
            <span className="flex items-center gap-1 justify-end font-mono">
              <Calendar className="w-3 h-3 text-pink-400 shrink-0" />
              {camp.sessions.length} sessões
            </span>
          </div>

          <div className="pt-2 flex items-center justify-between">
            {isActive ? (
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                ● Em Foco
              </span>
            ) : (
              <span className="text-xs text-slate-500">Pronta para jogar</span>
            )}

            <button
              onClick={() => onSelectCampaign(camp.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                isActive
                  ? 'bg-purple-950/80 text-purple-300 border border-purple-700/60'
                  : 'bg-purple-600 hover:bg-purple-500 text-white shadow-sm'
              }`}
            >
              {isActive ? 'Mesa Atual' : 'Selecionar Mesa'}
              {!isActive && <ArrowRight className="w-3 h-3" />}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-150">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2 border-b border-zinc-800/60">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Layers className="w-5 h-5 text-purple-400" />
            Campanhas
          </h2>
          <p className="text-xs text-slate-400">
            Gerencie suas mesas de jogo ou explore as campanhas de demonstração.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenJoinCampaign}
            className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-zinc-700/60"
          >
            <KeyRound className="w-3.5 h-3.5 text-purple-400" />
            Entrar com Código
          </button>

          <button
            onClick={onOpenNewCampaign}
            className="px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white shadow-sm flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Nova Campanha
          </button>
        </div>
      </div>

      {/* 1. Suas Campanhas */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider text-[11px]">
            Suas Campanhas ({userCampaigns.length})
          </h3>
        </div>

        {userCampaigns.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {userCampaigns.map(renderCampaignCard)}
          </div>
        ) : (
          <div className="p-6 rounded-xl bg-[#13141f] border border-zinc-800/60 text-center space-y-2">
            <p className="text-xs text-slate-400">Você ainda não criou nenhuma campanha pessoal.</p>
            <button
              onClick={onOpenNewCampaign}
              className="px-3.5 py-1.5 rounded-lg bg-purple-600/80 hover:bg-purple-600 text-xs font-semibold text-white transition-colors"
            >
              Criar Minha Primeira Campanha
            </button>
          </div>
        )}
      </div>

      {/* 2. Campanhas de Exemplo e Demonstração */}
      {sampleCampaigns.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider text-[11px]">
              Campanhas de Exemplo & Demonstração ({sampleCampaigns.length})
            </h3>
          </div>
          <p className="text-xs text-slate-400 -mt-1">
            Mesas pré-configuradas com fichas de treinador, Pokémon, relógios e sessões para demonstrar o sistema na prática.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sampleCampaigns.map(renderCampaignCard)}
          </div>
        </div>
      )}
    </div>
  );
};
