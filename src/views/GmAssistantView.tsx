/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { storageService } from '../services/storageService';
import { askMewAssistant } from '../services/geminiService';
import {
  Bot,
  Send,
  Sparkles,
  BookOpen,
  HelpCircle,
  Lightbulb,
  ShieldCheck,
  RefreshCw,
  Zap,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export const GmAssistantView: React.FC = () => {
  const { activeCampaign } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init_1',
      sender: 'assistant',
      text: `Olá, Mestre! Sou Mew AI, seu oráculo de regras e conselheiro narrativo para **Além da Próxima Rota (1.0)**.
Como posso ajudar em sua preparação ou durante a sessão hoje? Posso tirar dúvidas de regras mecânicas, sugerir encontros temáticos ou criar ramificações para decisões dos jogadores.`,
      timestamp: 'Agora',
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async (customPrompt?: string) => {
    const promptToSend = customPrompt || inputQuery;
    if (!promptToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `u_${Date.now()}`,
      sender: 'user',
      text: promptToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const trainers = activeCampaign ? storageService.getTrainers(activeCampaign.id) : [];
      const pokemons = activeCampaign ? storageService.getPokemons(activeCampaign.id) : [];
      const clocks = activeCampaign?.clocks || [];

      const responseText = await askMewAssistant(promptToSend, {
        campaign: activeCampaign,
        trainers,
        pokemons,
        clocks,
      });

      const assistantMsg: ChatMessage = {
        id: `a_${Date.now()}`,
        sender: 'assistant',
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          sender: 'assistant',
          text: 'Houve uma falha ao consultar o oráculo. Tente novamente em instantes.',
          timestamp: 'Agora',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickChips = [
    'Como calcular PV e PE no sistema?',
    'Sugerir encontro selvagem para Rota 3',
    'Consequência dramática para falha em Furtividade',
    'Como funcionam os Estágios de Vínculo?',
    'Regras de duelo oficial de Ginásio',
  ];

  return (
    <div className="h-[calc(100vh-6.5rem)] flex flex-col space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-4 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-purple-950/70 border border-purple-800/50 text-purple-300">
              <Bot className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-100 tracking-tight">
              Mew AI — Assistente do Mestre
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Consultoria de regras de *Além da Próxima Rota*, geração de encontros e sugestões dramáticas.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono px-2 py-1 rounded bg-purple-950/80 text-purple-300 border border-purple-800/60 flex items-center gap-1.5">
            <Zap className="w-3 h-3 text-amber-400" />
            Além da Próxima Rota 1.0
          </span>
        </div>
      </div>

      {/* Chat Messages Container */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 max-w-3xl ${
              msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${
                msg.sender === 'user'
                  ? 'bg-purple-900 border-purple-700 text-purple-200'
                  : 'bg-zinc-900 border-purple-900/60 text-purple-400'
              }`}
            >
              {msg.sender === 'user' ? (
                <ShieldCheck className="w-4 h-4" />
              ) : (
                <Bot className="w-4 h-4" />
              )}
            </div>

            <div
              className={`p-4 rounded-2xl border text-xs leading-relaxed space-y-2 ${
                msg.sender === 'user'
                  ? 'bg-purple-950/50 border-purple-800/60 text-purple-100'
                  : 'bg-[#11121d] border-zinc-800/90 text-slate-200'
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.text}</div>
              <div className="text-[9px] font-mono text-slate-500 text-right">{msg.timestamp}</div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 max-w-3xl">
            <div className="w-8 h-8 rounded-full bg-zinc-900 border border-purple-900/60 text-purple-400 flex items-center justify-center shrink-0 animate-pulse">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-4 rounded-2xl bg-[#11121d] border border-zinc-800 text-xs text-slate-400 flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-purple-400" />
              <span>Mew está consultando as regras e os anais da campanha...</span>
            </div>
          </div>
        )}
      </div>

      {/* Quick Prompts Chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 shrink-0 text-xs">
        {quickChips.map((chip, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(chip)}
            className="px-3 py-1 bg-zinc-900 hover:bg-zinc-800 text-slate-300 rounded-lg border border-zinc-800/80 whitespace-nowrap text-[11px] transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Lightbulb className="w-3 h-3 text-amber-400 shrink-0" />
            <span>{chip}</span>
          </button>
        ))}
      </div>

      {/* Input Box */}
      <div className="p-2 bg-[#11121d] rounded-xl border border-zinc-800/80 flex items-center gap-2 shrink-0">
        <input
          type="text"
          placeholder="Pergunte sobre regras, encontros, itens ou ganchos da campanha..."
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          className="flex-1 px-3 py-2 bg-transparent text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
        />
        <button
          onClick={() => handleSend()}
          disabled={!inputQuery.trim() || isLoading}
          className="p-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg disabled:opacity-40 transition-all cursor-pointer"
          title="Enviar pergunta"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
