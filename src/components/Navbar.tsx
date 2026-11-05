/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Dices,
  BookOpen,
  ChevronDown,
  Layers,
  User as UserIcon,
  LogOut,
  Plus,
  KeyRound,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { storageService, SaveStatus } from '../services/storageService';

interface NavbarProps {
  onOpenDiceRoller: () => void;
  onOpenCompendium: () => void;
  onOpenAuth: (mode?: 'login' | 'register' | 'profile') => void;
  onOpenNewCampaign: () => void;
  onOpenJoinCampaign: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenDiceRoller,
  onOpenCompendium,
  onOpenAuth,
  onOpenNewCampaign,
  onOpenJoinCampaign,
}) => {
  const { currentUser, allUsers, activeCampaign, campaigns, selectCampaign, switchUser, logout, isGM } =
    useAuth();
  const [campaignMenuOpen, setCampaignMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>(storageService.getSaveStatus());

  React.useEffect(() => {
    const unsub = storageService.subscribeSaveStatus((status) => {
      setSaveStatus(status);
    });
    return unsub;
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full h-14 bg-[#0d0e17] border-b border-zinc-800/80 px-4 sm:px-6 flex items-center justify-between select-none">
      {/* Brand & Platform Identifier */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-950/80 border border-purple-800/50 text-purple-300 font-mono font-black text-xs tracking-tighter shadow-sm">
          MEW
        </div>

        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-100 text-sm font-mono tracking-wide">
              PROJECT <span className="text-purple-400">MEW</span>
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-800 text-slate-400 border border-zinc-700/60 hidden sm:inline">
              RPG Além da Rota
            </span>
          </div>
        </div>
      </div>

      {/* Auto-Save & Sync Status Indicator */}
      <div className="hidden sm:flex items-center">
        {saveStatus === 'saving' && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-950/60 border border-amber-800/70 text-amber-300 text-xs font-mono font-medium animate-pulse">
            <RefreshCw className="w-3 h-3 animate-spin text-amber-400" />
            <span>Salvando...</span>
          </div>
        )}
        {saveStatus === 'saved' && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/50 border border-emerald-800/60 text-emerald-300 text-xs font-mono font-medium transition-all">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>Salvo.</span>
          </div>
        )}
        {saveStatus === 'error' && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-950/70 border border-red-800 text-red-300 text-xs font-mono font-medium">
            <AlertCircle className="w-3 h-3 text-red-400" />
            <span>Erro ao salvar. Tentar novamente.</span>
          </div>
        )}
        {saveStatus === 'idle' && (
          <div className="flex items-center gap-1 text-[11px] text-zinc-500 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500/60 inline-block"></span>
            <span>Sincronizado</span>
          </div>
        )}
      </div>

      {/* Campaign Switcher Dropdown */}
      <div className="relative">
        <button
          onClick={() => setCampaignMenuOpen(!campaignMenuOpen)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#141522] border border-zinc-800 hover:border-zinc-700 text-xs text-slate-200 transition-colors"
        >
          <Layers className="w-3.5 h-3.5 text-purple-400" />
          <span className="font-semibold truncate max-w-[130px] sm:max-w-[200px]">
            {activeCampaign ? activeCampaign.name : 'Nenhuma Campanha'}
          </span>
          {activeCampaign?.isSample && (
            <span className="hidden sm:inline text-[9px] font-mono px-1.5 py-0.2 rounded bg-zinc-800 text-purple-300 border border-zinc-700">
              Exemplo
            </span>
          )}
          <ChevronDown className="w-3 h-3 text-slate-400" />
        </button>

        {campaignMenuOpen && (
          <div
            className="absolute left-0 sm:right-0 mt-2 w-72 rounded-xl bg-[#141524] border border-zinc-800 shadow-xl p-2 z-50 animate-in fade-in duration-100"
            onMouseLeave={() => setCampaignMenuOpen(false)}
          >
            <div className="text-[10px] font-bold uppercase text-slate-400 px-3 py-1 tracking-wider">
              Alternar Mesa de Jogo
            </div>

            <div className="space-y-1 max-h-56 overflow-y-auto">
              {campaigns.map((camp) => (
                <button
                  key={camp.id}
                  onClick={() => {
                    selectCampaign(camp.id);
                    setCampaignMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors flex items-center justify-between ${
                    activeCampaign?.id === camp.id
                      ? 'bg-purple-950/70 text-purple-200 font-bold border border-purple-800/60'
                      : 'text-slate-300 hover:bg-zinc-800/60 hover:text-white'
                  }`}
                >
                  <div className="truncate pr-2">
                    <div className="truncate flex items-center gap-1.5">
                      <span>{camp.name}</span>
                      {camp.isSample && (
                        <span className="text-[9px] font-mono text-purple-300 bg-zinc-800 px-1 rounded">
                          demo
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] font-mono text-slate-500">{camp.code}</div>
                  </div>
                  {camp.gmId === currentUser?.id && (
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-950/60 text-amber-300 border border-amber-800/40 shrink-0">
                      Mestre
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="pt-2 mt-2 border-t border-zinc-800 grid grid-cols-2 gap-1.5">
              <button
                onClick={() => {
                  setCampaignMenuOpen(false);
                  onOpenNewCampaign();
                }}
                className="p-1.5 rounded-lg bg-purple-950/50 hover:bg-purple-900/60 text-purple-200 text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Criar Mesa
              </button>
              <button
                onClick={() => {
                  setCampaignMenuOpen(false);
                  onOpenJoinCampaign();
                }}
                className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-slate-300 text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors"
              >
                <KeyRound className="w-3.5 h-3.5" />
                Entrar com Código
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Right Controls: Quick Dice, Compendium, User Profile */}
      <div className="flex items-center gap-2">
        {/* Dice Roller Button */}
        <button
          onClick={onOpenDiceRoller}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-purple-300 border border-zinc-700/80 text-xs font-semibold transition-colors active:scale-95"
          title="Abrir Mesa de Rolagens e Testes"
        >
          <Dices className="w-3.5 h-3.5 text-purple-400" />
          <span className="hidden md:inline">Rolador</span>
        </button>

        {/* Compendium Button */}
        <button
          onClick={onOpenCompendium}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-slate-300 border border-zinc-700/80 text-xs font-semibold transition-colors"
          title="Consultar Manual de Regras"
        >
          <BookOpen className="w-3.5 h-3.5 text-slate-400" />
          <span className="hidden md:inline">Manual</span>
        </button>

        {/* User Account / Profile Chip */}
        {currentUser ? (
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-lg bg-[#141522] border border-zinc-800 hover:border-zinc-700 transition-colors"
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-6 h-6 rounded-full object-cover border border-purple-500/40"
              />
              <span className="text-xs font-semibold text-slate-200 hidden sm:inline max-w-[90px] truncate">
                {currentUser.name}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {userMenuOpen && (
              <div
                className="absolute right-0 mt-2 w-60 rounded-xl bg-[#141524] border border-zinc-800 shadow-xl p-2 z-50 animate-in fade-in duration-100"
                onMouseLeave={() => setUserMenuOpen(false)}
              >
                <div className="px-3 py-2 border-b border-zinc-800">
                  <div className="font-bold text-xs text-white">{currentUser.name}</div>
                  <div className="text-[10px] text-slate-400 truncate">{currentUser.email}</div>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      onOpenAuth('profile');
                    }}
                    className="w-full text-left px-3 py-1.5 rounded-lg text-xs text-slate-300 hover:bg-zinc-800 hover:text-white flex items-center gap-2"
                  >
                    <UserIcon className="w-3.5 h-3.5 text-purple-400" />
                    Editar Perfil
                  </button>
                </div>

                {/* Quick Account Switcher for Demo testing */}
                <div className="pt-2 border-t border-zinc-800">
                  <div className="text-[10px] font-bold uppercase text-slate-500 px-3 py-1">
                    Alternar Conta (Demo)
                  </div>
                  <div className="space-y-0.5">
                    {allUsers.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => {
                          switchUser(u.id);
                          setUserMenuOpen(false);
                        }}
                        className={`w-full text-left px-3 py-1.5 rounded-lg text-xs flex items-center justify-between ${
                          currentUser.id === u.id
                            ? 'bg-purple-950/60 text-purple-200 font-bold'
                            : 'text-slate-400 hover:bg-zinc-800/50 hover:text-slate-200'
                        }`}
                      >
                        <span className="truncate">{u.name}</span>
                        <span className="text-[9px] font-mono text-purple-400 uppercase">
                          {u.role === 'admin' ? 'Mestre' : 'Jogador'}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2 mt-1 border-t border-zinc-800">
                  <button
                    onClick={() => {
                      logout();
                      setUserMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 rounded-lg text-xs text-rose-400 hover:bg-rose-950/30 flex items-center gap-2"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sair da Conta
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => onOpenAuth('login')}
            className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 font-semibold text-xs text-white shadow-sm transition-colors"
          >
            Entrar
          </button>
        )}
      </div>
    </header>
  );
};
