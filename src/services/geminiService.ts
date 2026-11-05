/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI } from '@google/genai';
import { Campaign, TrainerSheet, PokemonSheet, WorldClock } from '../types';

interface AssistantQueryContext {
  campaign?: Campaign | null;
  trainers?: TrainerSheet[];
  pokemons?: PokemonSheet[];
  clocks?: WorldClock[];
}

const SYSTEM_INSTRUCTION = `
Você é Mew AI, o assistente inteligente e oráculo para Mestres de RPG de mesa do sistema original "Além da Próxima Rota" (versão 1.0) ambientado no universo Pokémon.
Seu tom é prestativo, criativo, técnico e focado na experiência narrativa de mesa.

REGRAS FUNDAMENTAIS DO SISTEMA:
1. Resolução de Teste: D20 + Dado de Atributo (d4 a d12) + Dado de Perícia (d4 a d12) vs CA ou dificuldade fixa (padrão 10).
2. Atributos de Treinador: Corpo, Mente, Presença.
3. Atributos de Pokémon: Corpo, Instinto, Energia.
4. PV de Treinador: Base do Dado de Corpo + Nível × 2.
5. PV de Pokémon: Base de Corpo + Nível × 3 + (PEV / 2).
6. PE de Pokémon (Pontos de Energia): Nível × 2 + 5.
7. Vínculo (1 a 5): Libera manobras conjuntas, bônus de salvaguarda e estabiliza Pokémon assustados.
8. Distinção Obrigatória: Sempre separe categoricamente suas respostas em:
   - [REGRA OFICIAL]: Mecânica exata do sistema Além da Próxima Rota 1.0.
   - [SUGESTÃO DO MESTRE]: Ideias de ganchos narrativos, reviravoltas, encontros e consequências de falha.
`;

export async function askMewAssistant(
  prompt: string,
  context?: AssistantQueryContext
): Promise<string> {
  const apiKey =
    (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) ||
    (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_GEMINI_API_KEY);

  let campaignSummary = '';
  if (context?.campaign) {
    campaignSummary = `
Contexto da Campanha Atual:
- Nome: ${context.campaign.name}
- Região: ${context.campaign.publicInfo?.region || 'Kanto'}
- Treinadores do Grupo: ${context.trainers?.map((t) => `${t.name} (Nv.${t.level})`).join(', ') || 'Nenhum'}
- Pokémon Principais: ${context.pokemons?.map((p) => `${p.nickname || p.species} (Nv.${p.level})`).join(', ') || 'Nenhum'}
- Relógios de Tensão Ativos: ${context.clocks?.map((c) => `${c.name} (${c.filledSegments}/${c.totalSegments})`).join(', ') || 'Nenhum'}
`;
  }

  if (apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `${SYSTEM_INSTRUCTION}\n\n${campaignSummary}\n\nPergunta do Mestre: ${prompt}`,
      });
      if (response.text) {
        return response.text;
      }
    } catch (err) {
      console.warn('Fallback to local knowledge engine due to API error:', err);
    }
  }

  // Local Knowledge & Heuristic Engine Fallback
  return generateLocalAssistantResponse(prompt, context);
}

function generateLocalAssistantResponse(prompt: string, context?: AssistantQueryContext): string {
  const p = prompt.toLowerCase();

  if (p.includes('dano') || p.includes('combate') || p.includes('pe') || p.includes('energia')) {
    return `### [REGRA OFICIAL — Combate & Energia]
- **Consumo de PE**: Golpes de Suporte e Especiais consomem Pontos de Energia (PE). Golpes Básicos como Investida/Arranhão custam 0 PE.
- **Dano Físico vs Especial**: Golpes físicos somam bônus de *Corpo* ou perícia *Ataque Físico*. Golpes especiais somam *Energia* ou *Controle de Tipo*.
- **Esgotamento**: Se o Pokémon atingir 0 PE, ele fica *Fatigado* (desvantagem em testes de Instinto) até descansar ou usar item revitalizante.

### [SUGESTÃO DO MESTRE — Dramatização]
- Se a luta estiver muito demorada, introduza uma mudança ambiental no turno 3 (como desabamento de pedras, chuva torrencial ou plateia invadindo).
- Quando um Pokémon inimigo estiver com menos de 25% de PV, faça-o rosnar defensivamente ou tentar proteger suas crias na rota.`;
  }

  if (p.includes('vinculo') || p.includes('vínculo') || p.includes('lealdade')) {
    return `### [REGRA OFICIAL — Estágios de Vínculo]
- **Estágio 1 (Novato)**: Pokémon obedece ordens básicas mas hesita em perigo extremo.
- **Estágio 2 (Companheiro)**: +1 em testes de salvaguarda quando o Treinador está em campo.
- **Estágio 3 (Sincronia)**: Uma vez por combate, pode rerrolar um dado de perícia que falhou.
- **Estágio 4 (Harmonia)**: Pode transferir 1 ponto de determinação do Treinador para restaurar PE.
- **Estágio 5 (Lenda)**: Permite manobras supremas e protege o Treinador de golpes letais instintivamente.

### [SUGESTÃO DO MESTRE — Provação de Vínculo]
- Coloque o Pokémon diante de um medo profundo (fogo, escuridão, solidão) e faça o treinador escolher entre vencer rápido ou confortar o parceiro.`;
  }

  if (p.includes('encontro') || p.includes('selvagem') || p.includes('rota')) {
    return `### [REGRA OFICIAL — Tabela de Encontros]
- Teste de exploração: Treinador rola *Investigação* ou *Trato Pokémon* vs CA da Rota (Ex: Rota 2 = CA 10, Caverna dos Diglett = CA 13).
- Sucesso com margem de 5+: Descobre ninho ou Pokémon com Habilidade Oculta.

### [SUGESTÃO DO MESTRE — Ideia de Encontro]
- **O Guarda Territorial**: Um Pidgeotto liderando três Pidgeys bloqueando a ponte de madeira com ventania. Ele não quer machucar os treinadores, apenas afastar invasores perto de seu ninho de ovos raros.
- **Consequência de Falha**: Em vez de combate imediato, o grupo perde uma ração ou item da mochila que caiu no rio.`;
  }

  return `### [REGRA OFICIAL — Resolução Básica]
- O sistema *Além da Próxima Rota 1.0* resolve todas as ações ativas com:
  **1d20 + Dado de Atributo + Dado de Perícia vs CA (padrão 10)**.
- Margem de sucesso de +5 ou mais concede vantagem na próxima ação ou informação adicional.

### [SUGESTÃO DO MESTRE — Aplicação em Mesa]
- Pergunte sempre ao jogador qual é a intenção e o método do personagem antes de definir a dificuldade.
- Em caso de falha próxima (ex: tirou 9 contra CA 10), ofereça um "Sucesso com Custo": o personagem consegue o que queria, mas atrai atenção indesejada ou gasta um recurso da bolsa.`;
}
