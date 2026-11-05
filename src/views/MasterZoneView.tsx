/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { storageService } from '../services/storageService';
import {
  Lock,
  Save,
  Check,
  UserPlus,
  Dices,
  BookOpen,
  EyeOff,
  Shield,
  Layers,
} from 'lucide-react';

interface MasterZoneViewProps {
  onRefreshCampaigns: () => void;
}

export const MasterZoneView: React.FC<MasterZoneViewProps> = ({ onRefreshCampaigns }) => {
  const { activeCampaign, isGM } = useAuth();
  const [activeTab, setActiveTab] = useState<'notes' | 'npc' | 'adversaries'>('notes');
  const [secretNotes, setSecretNotes] = useState(activeCampaign?.secretNotes || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Quick NPC Generator state (Section 61)
  const [npc, setNpc] = useState({
    nome: 'Dra. Verena (Pesquisadora de Fusões)',
    objetivo: 'Recuperar o cristal ressonante antes que a Rocket o transforme em arma.',
    atitude: 'Desconfiada no primeiro contato; avalia se os treinadores são espiões da Silph.',
    limite: 'Não aceita ferir Pokémon indefesos nem ceder dados de testes clonados.',
    competencia: 'Excelente em Genética Pokémon e Diagnóstico de Tecnologia antiga.',
    vinculo: 'Protege com carinho um Porygon que a salvou de uma pane elétrica.',
    segredo: 'Ela mesma ajudou a projetar a antena que a Equipe Rocket está tentando energizar.',
  });

  const generateRandomNpc = () => {
    const roles = ['Cientista desertor', 'Treinador veterano', 'Guarda florestal', 'Agente disfarçado', 'Líder de Ginásio'];
    const goals = ['Descobrir a origem da névoa magnética', 'Impedir a captura do Pokémon lendário', 'Proteger uma rota comercial abandonada', 'Recuperar um parceiro sequestrado'];
    const secrets = ['Carrega uma pedra de mega evolução falsificada', 'É chantageado por uma facção rival', 'Possui um mapa com ruínas antigas não catalogadas'];

    setNpc({
      nome: roles[Math.floor(Math.random() * roles.length)],
      objetivo: goals[Math.floor(Math.random() * goals.length)],
      atitude: 'Hesitante, mas disposto a negociar se receber ajuda concreta.',
      limite: 'Nunca revela o paradeiro de seus aliados próximos.',
      competencia: 'Sobrevivência em terreno hostil e leitura tática de emboscadas.',
      vinculo: 'Um Pokémon parceiro resgatado de maus tratos.',
      segredo: secrets[Math.floor(Math.random() * secrets.length)],
    });
  };

  if (!activeCampaign) return null;

  if (!isGM) {
    return (
      <div className="py-16 px-4 text-center max-w-md mx-auto space-y-4">
        <div className="w-12 h-12 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center mx-auto text-slate-400">
          <Lock className="w-5 h-5" />
        </div>
        <h3 className="text-base font-bold text-white">Área Restrita ao Mestre</h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          Esta tela contém segredos da trama, anotações e preparações confidenciais. Alterne para a conta do Narrador no menu superior para acessar.
        </p>
      </div>
    );
  }

  const handleSaveNotes = () => {
    const updated = { ...activeCampaign, secretNotes };
    storageService.updateCampaign(updated);
    onRefreshCampaigns();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-zinc-800/60">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Lock className="w-5 h-5 text-amber-400" />
            Área do Mestre
          </h2>
          <p className="text-xs text-slate-400">
            Anotações confidenciais, gerador de NPCs e guias táticos da campanha {activeCampaign.name}.
          </p>
        </div>

        {activeTab === 'notes' && (
          <button
            onClick={handleSaveNotes}
            className="px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 font-bold text-xs text-white shadow-sm flex items-center gap-1.5 transition-colors self-start sm:self-auto"
          >
            {savedSuccess ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Save className="w-3.5 h-3.5" />}
            {savedSuccess ? 'Salvo!' : 'Salvar Anotações'}
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-0.5 rounded-lg bg-zinc-900 border border-zinc-800 w-full sm:w-fit">
        <button
          onClick={() => setActiveTab('notes')}
          className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors flex items-center gap-1.5 ${
            activeTab === 'notes'
              ? 'bg-purple-950/80 text-purple-200 border border-purple-800/60'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <EyeOff className="w-3.5 h-3.5" />
          Anotações Confidenciais
        </button>
        <button
          onClick={() => setActiveTab('npc')}
          className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors flex items-center gap-1.5 ${
            activeTab === 'npc'
              ? 'bg-purple-950/80 text-purple-200 border border-purple-800/60'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <UserPlus className="w-3.5 h-3.5" />
          Gerador de NPC Rápido
        </button>
        <button
          onClick={() => setActiveTab('adversaries')}
          className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors flex items-center gap-1.5 ${
            activeTab === 'adversaries'
              ? 'bg-purple-950/80 text-purple-200 border border-purple-800/60'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          Diretrizes de Adversários
        </button>
      </div>

      {/* Tab: Notes */}
      {activeTab === 'notes' && (
        <div className="p-4 rounded-xl bg-[#13141f] border border-zinc-800/80 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-amber-400 uppercase text-[10px] tracking-wider">
              Segredos & Pistas Ocultas da Mesa
            </span>
            <span className="text-slate-500 text-[11px]">Invisível para jogadores</span>
          </div>

          <textarea
            rows={10}
            value={secretNotes}
            onChange={(e) => setSecretNotes(e.target.value)}
            placeholder="Anote aqui as agendas secretas de NPCs, a verdade por trás dos fenômenos e planos de cenas futuras..."
            className="w-full bg-[#0e0f18] border border-zinc-800 rounded-lg p-3 text-xs text-slate-200 leading-relaxed placeholder-slate-600 focus:outline-none focus:border-purple-500 font-mono"
          />
        </div>
      )}

      {/* Tab: NPC Generator */}
      {activeTab === 'npc' && (
        <div className="p-5 rounded-xl bg-[#13141f] border border-zinc-800/80 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">NPC Rápido (Seção 61)</h3>
              <p className="text-xs text-slate-400">Gere personagens secundários consistentes em segundos.</p>
            </div>

            <button
              onClick={generateRandomNpc}
              className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-slate-200 border border-zinc-700/80 flex items-center gap-1.5 transition-colors"
            >
              <Dices className="w-3.5 h-3.5 text-purple-400" />
              Sortear Outro
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-[#0e0f18] border border-zinc-800/60">
              <strong className="text-purple-400 block mb-0.5">Identidade / Papel:</strong>
              <span className="text-slate-200">{npc.nome}</span>
            </div>

            <div className="p-3 rounded-lg bg-[#0e0f18] border border-zinc-800/60">
              <strong className="text-emerald-400 block mb-0.5">Objetivo Imediato:</strong>
              <span className="text-slate-200">{npc.objetivo}</span>
            </div>

            <div className="p-3 rounded-lg bg-[#0e0f18] border border-zinc-800/60">
              <strong className="text-indigo-400 block mb-0.5">Atitude Inicial:</strong>
              <span className="text-slate-200">{npc.atitude}</span>
            </div>

            <div className="p-3 rounded-lg bg-[#0e0f18] border border-zinc-800/60">
              <strong className="text-rose-400 block mb-0.5">Limite (O que não aceita fazer/revelar):</strong>
              <span className="text-slate-200">{npc.limite}</span>
            </div>

            <div className="p-3 rounded-lg bg-[#0e0f18] border border-zinc-800/60">
              <strong className="text-blue-400 block mb-0.5">Competência Especial:</strong>
              <span className="text-slate-200">{npc.competencia}</span>
            </div>

            <div className="p-3 rounded-lg bg-[#0e0f18] border border-zinc-800/60">
              <strong className="text-pink-400 block mb-0.5">Vínculo:</strong>
              <span className="text-slate-200">{npc.vinculo}</span>
            </div>

            <div className="col-span-full p-3 rounded-lg bg-amber-950/20 border border-amber-800/30">
              <strong className="text-amber-400 block mb-0.5">Segredo Oculto:</strong>
              <span className="text-amber-200/90">{npc.segredo}</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Adversaries Guide */}
      {activeTab === 'adversaries' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div className="p-4 rounded-xl bg-[#13141f] border border-zinc-800/80 space-y-1">
              <span className="font-bold text-slate-200 block text-sm">Comum</span>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Atributos d4-d6, perícia de assinatura d6, 8-16 PV e um movimento simples.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-[#13141f] border border-zinc-800/80 space-y-1">
              <span className="font-bold text-purple-300 block text-sm">Treinado</span>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Atributo principal d8, duas perícias d6-d8, 18-28 PV e um recurso tático especial.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-[#13141f] border border-zinc-800/80 space-y-1">
              <span className="font-bold text-indigo-300 block text-sm">Elite</span>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Atributo principal d8-d10, perícias centrais d8, 28-40 PV e habilidade que muda a luta.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-[#13141f] border border-zinc-800/80 space-y-1">
              <span className="font-bold text-rose-300 block text-sm">Chefe de Cena</span>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Fraqueza observável, 2 fases ou objetivo ambiental, PV para 3-5 rodadas e saída sem nocaute.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#11121c] border border-zinc-800/80 text-xs text-slate-400 space-y-1.5">
            <strong className="text-slate-200">Economia de Ações em Combate (Seção 60):</strong>
            <p>
              Conte ativações por lado. Um treinador acompanhado de um Pokémon ativo equivale a 2 participantes na iniciativa. Um chefe isolado precisa de apoio ambiental ou reações especiais para não ser superado pela contagem de turnos.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
