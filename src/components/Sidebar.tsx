/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Layers,
  UserCheck,
  Sparkles,
  BookOpen,
  Dices,
  Clock,
  ShieldCheck,
  FileText,
  Swords,
  Network,
  Search,
  Compass,
  Trophy,
  Calendar,
  Radio,
  MapPin,
  FolderOpen,
  Sparkles as SparklesIcon,
  Bot,
} from 'lucide-react';

export type NavTab =
  | 'overview'
  | 'campaigns'
  | 'trainers'
  | 'pokemon'
  | 'combat'
  | 'inventory'
  | 'vtt'
  | 'pokedex'
  | 'moves'
  | 'conditions'
  | 'compendium'
  | 'atlas'
  | 'gyms'
  | 'tournaments'
  | 'quests'
  | 'economy'
  | 'npcs'
  | 'factions'
  | 'mysteries'
  | 'world-state'
  | 'news'
  | 'session-prep'
  | 'campaign-files'
  | 'gm-assistant'
  | 'encounters'
  | 'clocks'
  | 'sessions'
  | 'master-zone';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenDiceRoller: () => void;
}

interface NavCategory {
  title: string;
  items: {
    id: NavTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string | number | null;
    isAction?: boolean;
    onClick?: () => void;
    highlight?: boolean;
    visible?: boolean;
  }[];
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab, onOpenDiceRoller }) => {
  const { isGM, activeCampaign, campaigns } = useAuth();

  const categories: NavCategory[] = [
    {
      title: 'Mesa & Ação',
      items: [
        {
          id: 'overview',
          label: 'Visão Geral',
          icon: LayoutDashboard,
          visible: true,
        },
        {
          id: 'vtt',
          label: 'Mesa Virtual (VTT)',
          icon: Compass,
          badge: 'Mapa',
          highlight: true,
          visible: true,
        },
        {
          id: 'trainers',
          label: 'Treinadores',
          icon: UserCheck,
          visible: true,
        },
        {
          id: 'pokemon',
          label: 'Pokémon',
          icon: Sparkles,
          visible: true,
        },
        {
          id: 'combat',
          label: 'Combate Tático',
          icon: Swords,
          badge: 'Tático',
          highlight: true,
          visible: true,
        },
        {
          id: 'inventory',
          label: 'Inventário do Grupo',
          icon: BookOpen,
          visible: true,
        },
      ],
    },
    {
      title: 'Compêndios',
      items: [
        {
          id: 'pokedex',
          label: 'Pokédex Kanto',
          icon: Sparkles,
          badge: '151',
          visible: true,
        },
        {
          id: 'moves',
          label: 'Biblioteca de Golpes',
          icon: Swords,
          badge: 'PokeAPI',
          visible: true,
        },
        {
          id: 'conditions',
          label: 'Condições & Aflições',
          icon: Clock,
          visible: true,
        },
        {
          id: 'compendium',
          label: 'Manual de Campo',
          icon: BookOpen,
          badge: 'v1.0',
          visible: true,
        },
      ],
    },
    {
      title: 'Mundo de Jogo',
      items: [
        {
          id: 'atlas',
          label: 'Atlas & Rotas',
          icon: Layers,
          visible: true,
        },
        {
          id: 'gyms',
          label: 'Ginásios Oficiais',
          icon: ShieldCheck,
          badge: '8',
          visible: true,
        },
        {
          id: 'tournaments',
          label: 'Torneios & Ligas',
          icon: Trophy,
          visible: true,
        },
        {
          id: 'quests',
          label: 'Missões & Metas',
          icon: FileText,
          visible: true,
        },
        {
          id: 'mysteries',
          label: 'Mistérios & Pistas',
          icon: Search,
          badge: 'Investigação',
          visible: true,
        },
        {
          id: 'factions',
          label: 'Facções & Relações',
          icon: Network,
          visible: true,
        },
        {
          id: 'world-state',
          label: 'Estado do Mundo',
          icon: Calendar,
          visible: true,
        },
        {
          id: 'news',
          label: 'Mural de Notícias',
          icon: Radio,
          visible: true,
        },
        {
          id: 'economy',
          label: 'Lojas & Economia',
          icon: LayoutDashboard,
          badge: '¥ PD',
          visible: true,
        },
        {
          id: 'npcs',
          label: 'NPCs & Figuras',
          icon: UserCheck,
          visible: true,
        },
      ],
    },
    {
      title: 'Área do Mestre',
      items: [
        {
          id: 'session-prep',
          label: 'Preparador de Sessões',
          icon: FileText,
          badge: 'Cenas',
          highlight: true,
          visible: isGM,
        },
        {
          id: 'gm-assistant',
          label: 'Assistente do Mestre',
          icon: Bot,
          badge: 'Mew AI',
          highlight: true,
          visible: isGM,
        },
        {
          id: 'campaign-files',
          label: 'Central de Arquivos',
          icon: FolderOpen,
          visible: true,
        },
        {
          id: 'encounters',
          label: 'Gerador de Encontros',
          icon: Dices,
          badge: 'Roller',
          highlight: true,
          visible: isGM,
        },
        {
          id: 'clocks',
          label: 'Relógios de Tensão',
          icon: Clock,
          badge: activeCampaign?.clocks.length || null,
          visible: true,
        },
        {
          id: 'sessions',
          label: 'Diário de Sessões',
          icon: FileText,
          badge: activeCampaign?.sessions.length || null,
          visible: true,
        },
        {
          id: 'campaigns',
          label: 'Trocar Campanha',
          icon: Layers,
          badge: campaigns.length > 0 ? campaigns.length : null,
          visible: true,
        },
        {
          id: 'master-zone',
          label: 'Painel do Mestre',
          icon: ShieldCheck,
          badge: 'GM',
          highlight: true,
          visible: isGM,
        },
      ],
    },
  ];

  return (
    <aside className="w-16 md:w-56 h-[calc(100vh-4rem)] bg-[#0d0e17] border-r border-zinc-800/80 flex flex-col justify-between py-3 select-none shrink-0 transition-all">
      <div className="space-y-4 px-2 md:px-3 overflow-y-auto">
        {/* Subtle active campaign indicator */}
        {activeCampaign && (
          <div className="hidden md:block px-3 py-2.5 rounded-lg bg-[#141522] border border-zinc-800/80">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Mesa em Foco
              </span>
              {activeCampaign.isSample && (
                <span className="text-[9px] font-mono px-1 rounded bg-zinc-800 text-purple-300 border border-zinc-700">
                  Exemplo
                </span>
              )}
            </div>
            <div className="text-xs font-bold text-slate-100 truncate mt-1">
              {activeCampaign.name}
            </div>
          </div>
        )}

        {/* Categorized Navigation */}
        <nav className="space-y-4">
          {categories.map((cat, catIdx) => {
            const visibleItems = cat.items.filter((i) => i.visible !== false);
            if (visibleItems.length === 0) return null;

            return (
              <div key={catIdx} className="space-y-1">
                <div className="hidden md:block px-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  {cat.title}
                </div>

                {visibleItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentTab === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => onSelectTab(item.id)}
                      className={`w-full flex items-center justify-center md:justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-all group ${
                        isActive
                          ? 'bg-purple-950/60 text-purple-200 border-l-2 border-purple-500 font-semibold shadow-sm'
                          : 'text-slate-400 hover:text-slate-100 hover:bg-zinc-800/50'
                      }`}
                      title={item.label}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon
                          className={`w-4 h-4 shrink-0 transition-colors ${
                            isActive ? 'text-purple-400' : 'text-slate-400 group-hover:text-slate-200'
                          }`}
                        />
                        <span className="hidden md:inline truncate">{item.label}</span>
                      </div>

                      {item.badge !== undefined && item.badge !== null && (
                        <span
                          className={`hidden md:inline text-[10px] font-mono px-1.5 py-0.2 rounded font-bold ${
                            item.highlight
                              ? 'bg-amber-950/80 text-amber-300 border border-amber-800/50'
                              : 'bg-zinc-800 text-slate-400'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </nav>
      </div>

      {/* Quick Launch Dice Button */}
      <div className="px-2 md:px-3 pt-2 border-t border-zinc-800/80">
        <button
          onClick={onOpenDiceRoller}
          className="w-full py-2 px-2 rounded-lg bg-purple-600/90 hover:bg-purple-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer active:scale-95"
          title="Abrir Rolador de Dados"
        >
          <Dices className="w-4 h-4" />
          <span className="hidden md:inline">Rolar Dados</span>
        </button>
      </div>
    </aside>
  );
};
