/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Regras e dados oficiais do sistema "Além da Próxima Rota" (Edição 1.0)
 */

export type DiceRank = 'd4' | 'd6' | 'd8' | 'd10' | 'd12';

export const DICE_VALUES: Record<DiceRank, number> = {
  d4: 4,
  d6: 6,
  d8: 8,
  d10: 10,
  d12: 12,
};

export const DIFFICULTY_SCALE = [
  { ca: 6, label: 'Muito simples', desc: 'Ação comum sem pressão real, mas com pequena incerteza.' },
  { ca: 8, label: 'Simples', desc: 'Tarefa fácil com pouco risco.' },
  { ca: 10, label: 'Moderada', desc: 'Desafio comum sob pressão.' },
  { ca: 12, label: 'Desafiadora', desc: 'Exige prática ou boa abordagem.' },
  { ca: 14, label: 'Difícil', desc: 'Exige competência, preparação ou sorte.' },
  { ca: 16, label: 'Muito difícil', desc: 'Especialista ou plano particularmente bom.' },
  { ca: 18, label: 'Heroica', desc: 'Feito extraordinário, mas plausível.' },
  { ca: 20, label: 'Extrema', desc: 'Quase no limite humano ou Pokémon.' },
  { ca: 22, label: 'Lendária', desc: 'Feito raríssimo.' },
  { ca: 24, label: 'Quase impossível', desc: 'Só com capacidade excepcional e circunstâncias ideais.' },
];

export interface TrainerSkill {
  name: string;
  defaultAttr: 'Corpo' | 'Mente' | 'Presença';
  description: string;
}

export const TRAINER_SKILLS: TrainerSkill[] = [
  { name: 'Combate', defaultAttr: 'Corpo', description: 'Luta desarmada, técnicas de confronto, golpes e leitura física do embate.' },
  { name: 'Atletismo', defaultAttr: 'Corpo', description: 'Correr, escalar, saltar, nadar, carregar peso e realizar esforço prolongado.' },
  { name: 'Pontaria', defaultAttr: 'Corpo', description: 'Mirar, lançar objetos e usar equipamentos que exigem precisão.' },
  { name: 'Medicina', defaultAttr: 'Mente', description: 'Primeiros socorros, tratamento de ferimentos e reconhecimento de sinais clínicos.' },
  { name: 'Investigação', defaultAttr: 'Mente', description: 'Examinar cenas, ligar evidências, procurar contradições e deduzir acontecimentos.' },
  { name: 'Sobrevivência', defaultAttr: 'Mente', description: 'Rastrear, orientar-se na natureza, conseguir abrigo e lidar com riscos ambientais.' },
  { name: 'Influência', defaultAttr: 'Presença', description: 'Persuadir, negociar, intimidar e conduzir interações sociais.' },
  { name: 'Trato Pokémon', defaultAttr: 'Presença', description: 'Cuidar, interpretar comportamento e treinar Pokémon.' },
  { name: 'Conhecimento', defaultAttr: 'Mente', description: 'Ciência, história, cultura e informações gerais estudadas.' },
  { name: 'Percepção', defaultAttr: 'Mente', description: 'Notar detalhes, ruídos, movimentos, perigos e mudanças no ambiente.' },
  { name: 'Tecnologia', defaultAttr: 'Mente', description: 'Usar, compreender, diagnosticar e reparar dispositivos eletrônicos.' },
  { name: 'Coordenação', defaultAttr: 'Presença', description: 'Sincronizar pessoas e Pokémon e executar manobras conjuntas.' },
  { name: 'Reflexos', defaultAttr: 'Corpo', description: 'Reagir a perigos percebidos, esquivar e evitar armadilhas.' },
  { name: 'Estratégia', defaultAttr: 'Mente', description: 'Planejar, antecipar possibilidades e aproveitar vantagens táticas.' },
  { name: 'Pesquisa', defaultAttr: 'Mente', description: 'Conduzir experimentos, testar hipóteses e estudar fenômenos.' },
  { name: 'Ofício', defaultAttr: 'Corpo', description: 'Construir, consertar ou fabricar objetos por trabalho manual especializado.' },
  { name: 'Expressão', defaultAttr: 'Presença', description: 'Atuar, falar em público, entreter e transmitir ideias ou emoções.' },
  { name: 'Empatia', defaultAttr: 'Presença', description: 'Interpretar sentimentos, necessidades emocionais e perspectivas alheias.' },
  { name: 'Etiqueta', defaultAttr: 'Presença', description: 'Lidar com formalidades, cerimônias e ambientes de prestígio.' },
  { name: 'Navegação', defaultAttr: 'Mente', description: 'Ler mapas, seguir rotas, reconhecer marcos e usar instrumentos de orientação.' },
  { name: 'Ladinagem', defaultAttr: 'Corpo', description: 'Abrir fechaduras simples, manipular mecanismos e realizar tarefas manuais delicadas.' },
  { name: 'Arte', defaultAttr: 'Presença', description: 'Criar obras, desenhar, tocar instrumentos e aplicar técnicas artísticas.' },
  { name: 'Comércio', defaultAttr: 'Presença', description: 'Avaliar bens, negociar preços, administrar recursos e reconhecer oportunidades comerciais.' },
  { name: 'Furtividade', defaultAttr: 'Corpo', description: 'Mover-se sem ruído, esconder-se e evitar atenção indesejada.' },
];

export interface PokemonSkill {
  name: string;
  defaultAttr: 'Corpo' | 'Instinto' | 'Energia';
  description: string;
}

export const POKEMON_SKILLS: PokemonSkill[] = [
  { name: 'Ataque Físico', defaultAttr: 'Corpo', description: 'Golpes corporais, mordidas, investidas e técnicas baseadas em força/contato.' },
  { name: 'Ataque Especial', defaultAttr: 'Energia', description: 'Precisão e execução de golpes de energia ou efeitos especiais ofensivos.' },
  { name: 'Defesa', defaultAttr: 'Corpo', description: 'Bloquear, proteger partes vulneráveis e suportar impactos.' },
  { name: 'Agilidade', defaultAttr: 'Instinto', description: 'Deslocamento rápido, esquiva, salto e equilíbrio. Determina a Defesa passiva.' },
  { name: 'Percepção', defaultAttr: 'Instinto', description: 'Audição, olfato, visão e outros sentidos.' },
  { name: 'Instinto de Batalha', defaultAttr: 'Instinto', description: 'Ler adversários, identificar padrões e reagir taticamente.' },
  { name: 'Precisão', defaultAttr: 'Corpo', description: 'Acertar alvos pequenos, distantes ou em movimento.' },
  { name: 'Controle de Tipo', defaultAttr: 'Energia', description: 'Manipular energia associada a um tipo ou efeito elemental.' },
  { name: 'Resistência', defaultAttr: 'Corpo', description: 'Resistir a esforço, veneno, clima, dor e efeitos debilitantes.' },
  { name: 'Suporte', defaultAttr: 'Energia', description: 'Criar barreiras, curar, melhorar aliados ou dificultar adversário.' },
  { name: 'Furtividade', defaultAttr: 'Instinto', description: 'Esconder-se, mover-se sem ser notado ou camuflar-se.' },
  { name: 'Sobrevivência', defaultAttr: 'Instinto', description: 'Encontrar abrigo, alimento, orientação e condições seguras.' },
  { name: 'Interação', defaultAttr: 'Instinto', description: 'Expressar emoções, compreender outros Pokémon e interagir com pessoas.' },
  { name: 'Coordenação', defaultAttr: 'Instinto', description: 'Sincronizar movimentos com treinador ou outro Pokémon.' },
];

export interface OriginData {
  name: string;
  freeSkills: [string, string];
  abilityName: string;
  abilityDescription: string;
}

export const ORIGINS: OriginData[] = [
  {
    name: 'Prodígio',
    freeSkills: ['Investigação', 'Conhecimento'],
    abilityName: 'Padrão na Bagunça',
    abilityDescription: 'Uma vez por cena ao investigar, pergunte qual detalhe observado merece atenção primeiro. A habilidade aponta prioridade, não entrega a solução.'
  },
  {
    name: 'Riquinho',
    freeSkills: ['Etiqueta', 'Comércio'],
    abilityName: 'Capital Social',
    abilityDescription: 'Uma vez por sessão, tente obter apresentação, reunião ou empréstimo de item comum por meio de contatos familiares. A pessoa pode recusar.'
  },
  {
    name: 'Brigão',
    freeSkills: ['Combate', 'Reflexos'],
    abilityName: 'Casca Grossa',
    abilityDescription: 'Uma vez por cena, quando um impacto comum o derrubaria ou tiraria o equilíbrio, permaneça de pé. O dano não é cancelado.'
  },
  {
    name: 'Desgarrado',
    freeSkills: ['Sobrevivência', 'Furtividade'],
    abilityName: 'Ninguém Me Acha Fácil',
    abilityDescription: 'Com cobertura e alguns instantes, encontre esconderijo plausível. Não funciona sob observação direta ou busca minuciosa.'
  },
  {
    name: 'Pupilo de Ginásio',
    freeSkills: ['Estratégia', 'Percepção'],
    abilityName: 'Leitura de Combate',
    abilityDescription: 'Uma vez por batalha, após observar um adversário, pergunte sobre uma tendência tática ou abertura visível.'
  },
  {
    name: 'Filho de Criadores Pokémon',
    freeSkills: ['Trato Pokémon', 'Empatia'],
    abilityName: 'Manejo Tranquilo',
    abilityDescription: 'Acalme Pokémon doméstico ou familiarizado nervoso, se não estiver atacando nem em pânico extremo.'
  },
  {
    name: 'Colecionador de Cards Pokémon',
    freeSkills: ['Conhecimento', 'Pesquisa'],
    abilityName: 'Dex de Papel',
    abilityDescription: 'Uma vez por cena, recorde um fato público básico sobre espécie ou característica de batalha, se plausível.'
  },
  {
    name: 'Amigo dos Pokémon Selvagens',
    freeSkills: ['Trato Pokémon', 'Sobrevivência'],
    abilityName: 'Passo Manso',
    abilityDescription: 'Tente se aproximar sem provocar fuga imediata, salvo se a criatura estiver encurralada, ferida gravemente ou agressiva.'
  },
  {
    name: 'Competidor Derrotado',
    freeSkills: ['Estratégia', 'Coordenação'],
    abilityName: 'Aprendeu Perdendo',
    abilityDescription: 'Uma vez por sessão, após falhar em Estratégia ou Coordenação, tente novamente com abordagem realmente diferente.'
  },
  {
    name: 'Repórter Mirim',
    freeSkills: ['Investigação', 'Expressão'],
    abilityName: 'Pergunta de Seguimento',
    abilityDescription: 'Uma vez por cena, faça uma pergunta adicional depois de receber uma resposta. O interlocutor pode recusar.'
  },
  {
    name: 'Mecânico de Garagem',
    freeSkills: ['Tecnologia', 'Ofício'],
    abilityName: 'Gambiarra de Campo',
    abilityDescription: 'Uma vez por cena, improvise reparo temporário num dispositivo simples com ferramentas e materiais disponíveis.'
  },
  {
    name: 'Radioamador',
    freeSkills: ['Tecnologia', 'Pesquisa'],
    abilityName: 'Caça-Frequência',
    abilityDescription: 'Com aparelho compatível, localize aproximadamente uma transmissão ou diferencie interferência incomum.'
  },
  {
    name: 'Trapaceiro de Feira',
    freeSkills: ['Ladinagem', 'Furtividade'],
    abilityName: 'Mão Leve',
    abilityDescription: 'Durante distração plausível, esconda, troque ou pegue objeto pequeno sem chamar atenção imediata.'
  },
  {
    name: 'Artista de Rua',
    freeSkills: ['Arte', 'Expressão'],
    abilityName: 'Rouba a Cena',
    abilityDescription: 'Uma vez por cena, crie distração para que um aliado se reposicione ou saia discretamente.'
  },
  {
    name: 'Celebridade Mirim',
    freeSkills: ['Influência', 'Expressão'],
    abilityName: 'Rosto Conhecido',
    abilityDescription: 'Quando reconhecido, consegue oportunidade breve para se apresentar ou falar com pequeno grupo; reconhecimento não significa admiração.'
  },
  {
    name: 'Confidente',
    freeSkills: ['Empatia', 'Influência'],
    abilityName: 'Ombro Seguro',
    abilityDescription: 'Uma vez por cena, ajude pessoa disposta a se acalmar e explicar preocupação imediata.'
  },
  {
    name: 'Protetor da Família',
    freeSkills: ['Reflexos', 'Empatia'],
    abilityName: 'Primeiro Eu',
    abilityDescription: 'Uma vez por cena, tente se colocar entre pessoa próxima e ameaça física imediata para abrir oportunidade de fuga.'
  },
  {
    name: 'Escapista de Circo',
    freeSkills: ['Atletismo', 'Ladinagem'],
    abilityName: 'Fuga Improvável',
    abilityDescription: 'Uma vez por cena, escape de amarras comuns ou atravesse abertura estreita, se fisicamente possível.'
  },
  {
    name: 'Mensageiro de Bicicleta',
    freeSkills: ['Atletismo', 'Navegação'],
    abilityName: 'Atalho Urbano',
    abilityDescription: 'Em área habitada, encontre caminho prático para evitar atraso comum; não supera bloqueios físicos.'
  },
  {
    name: 'Aprendiz de Pescador',
    freeSkills: ['Sobrevivência', 'Percepção'],
    abilityName: 'Leitura da Água',
    abilityDescription: 'Perto da água, identifique corrente perigosa, mudança do tempo ou movimento que indique algo abaixo.'
  },
  {
    name: 'Voluntário do Centro Pokémon',
    freeSkills: ['Medicina', 'Empatia'],
    abilityName: 'Mãos Tranquilas',
    abilityDescription: 'Com tempo e materiais, estabilize ferido e impeça piora imediata de condição tratável; não restaura PV.'
  },
  {
    name: 'Filho de Árbitro de Batalhas',
    freeSkills: ['Percepção', 'Estratégia'],
    abilityName: 'Olho de Árbitro',
    abilityDescription: 'Uma vez por batalha, após observar posição de combatente, pergunte sobre abertura ou risco de posicionamento.'
  },
  {
    name: 'Sobrevivente de um Incidente Pokémon',
    freeSkills: ['Sobrevivência', 'Reflexos'],
    abilityName: 'Sinal de Perigo',
    abilityDescription: 'Ao perceber sinal semelhante ao que precedeu o incidente, reconheça risco e tente alertar pessoas próximas.'
  },
  {
    name: 'Recém-chegado ao Interior',
    freeSkills: ['Navegação', 'Atletismo'],
    abilityName: 'Solução de Cidade',
    abilityDescription: 'Uma vez por cena, proponha solução urbana para problema cotidiano de comunicação, transporte ou serviço, se houver recursos.'
  },
];

export interface ClassData {
  name: string;
  skillOptions: string[];
  initialAbility: { name: string; desc: string };
  tracks: {
    name: string;
    feature1: { name: string; desc: string };
    feature2: { name: string; desc: string };
  }[];
  basicAbilities: { name: string; desc: string }[];
  advancedClassAbility: { name: string; desc: string };
  apexAbility: { name: string; desc: string };
}

export const CLASSES: ClassData[] = [
  {
    name: 'Analista',
    skillOptions: ['Investigação', 'Estratégia'],
    initialAbility: {
      name: 'Estudo de Alvo',
      desc: 'Dedique uma ação principal a estudar um alvo e passe em Mente + Investigação ou Estratégia, CA 12. Até o fim da cena, o primeiro aliado que explorar a vulnerabilidade recebe +2 no teste pertinente.'
    },
    tracks: [
      {
        name: 'Perito',
        feature1: { name: 'Olho Clínico', desc: 'Uma vez por cena, ao examinar evidências, pergunte se parecem ligadas a algo já encontrado.' },
        feature2: { name: 'Reconstrução', desc: 'Com evidências suficientes, teste Investigação para reconstruir sequência provável e apontar uma incerteza.' }
      },
      {
        name: 'Tático',
        feature1: { name: 'Posição Vantajosa', desc: 'Depois de observar o campo, identifique uma abertura; aliado que a explore antes do fim da rodada recebe +2.' },
        feature2: { name: 'Foco Coordenado', desc: 'Uma vez por cena, o primeiro aliado que explorar alvo analisado recebe +2 no teste ou +2 no dano (não ambos).' }
      }
    ],
    basicAbilities: [
      { name: 'Leitura de Padrões', desc: 'Após observar adversário agir, teste Investigação ou Estratégia para fazer pergunta sobre hábito ou limitação (1x por alvo por cena).' },
      { name: 'Plano de Contingência', desc: 'Uma vez por cena, se risco previsto ocorrer, permita que aliado que falhou tente novamente com método diferente.' }
    ],
    advancedClassAbility: { name: 'Dedução Implacável', desc: 'Uma vez por cena, após passar em Investigação, faça segunda pergunta sobre a mesma cadeia de evidências.' },
    apexAbility: { name: 'Xeque-Mate', desc: 'Uma vez por cena, após identificar fraqueza, proponha manobra: primeiro aliado que seguir recebe +2 e evita complicação em caso de sucesso.' }
  },
  {
    name: 'Executor',
    skillOptions: ['Reflexos', 'Trato Pokémon'],
    initialAbility: {
      name: 'Último Fôlego',
      desc: 'Uma vez por combate, quando seria nocauteado, permanece com 1 PV até o fim de sua próxima ativação e recebe uma ação principal adicional. Ao final, se ainda com 1 PV, fica Nocauteado.'
    },
    tracks: [
      {
        name: 'Duelista',
        feature1: { name: 'Desafio Direto', desc: 'Uma vez por rodada, +2 no primeiro ataque contra adversário escolhido se mantiver o foco.' },
        feature2: { name: 'Resposta Instintiva', desc: 'Uma vez por combate, quando adversário erra ataque corpo a corpo, use reação para reposicionar-se ou contra-atacar com -2.' }
      },
      {
        name: 'Demolidor',
        feature1: { name: 'Golpe de Ruptura', desc: 'Ao atacar obstáculo destrutível, falha por 1 ou 2 causa dano parcial.' },
        feature2: { name: 'Quebra de Guarda', desc: 'Uma vez por combate, acerto reduz Defesa do alvo em 2 contra próximo ataque de aliado.' }
      }
    ],
    basicAbilities: [
      { name: 'Avanço Implacável', desc: 'Uma vez por cena, após falhar em Combate ou Atletismo para superar obstáculo físico, tente de novo com abordagem diferente.' },
      { name: 'Agora ou Nunca', desc: 'Uma vez por combate, aposte tudo: sucesso adiciona efeito posicional, falha deixa exposto.' }
    ],
    advancedClassAbility: { name: 'Combinação Brutal', desc: 'Uma vez por combate, após acertar ataque, empurre para zona próxima ou impeça reação até início do próximo turno.' },
    apexAbility: { name: 'Sem Recuo', desc: 'Uma vez por combate, com metade dos PV ou menos, escolha +2 no próximo ataque ou reduza em 2 o próximo dano recebido.' }
  },
  {
    name: 'Guardião',
    skillOptions: ['Combate', 'Atletismo'],
    initialAbility: {
      name: 'Interceptação',
      desc: 'Quando aliado próximo sofre ameaça percebida e o Guardião consegue alcançá-lo, use reação para se tornar o alvo.'
    },
    tracks: [
      {
        name: 'Protetor',
        feature1: { name: 'Cobertura Humana', desc: 'Ao interceptar ameaça, o aliado recebe +2 Defesa contra a mesma ameaça.' },
        feature2: { name: 'Proteção Compartilhada', desc: 'Uma vez por cena, ao proteger aliado, permita que ele se mova uma zona curta sem sofrer a mesma ameaça.' }
      },
      {
        name: 'Bastião',
        feature1: { name: 'Postura Inabalável', desc: 'Se não se deslocar voluntariamente, +1 Defesa até seu próximo turno.' },
        feature2: { name: 'Segurar a Linha', desc: 'Uma vez por combate, teste Corpo + Atletismo CA 12 para impedir adversário de atravessar passagem estreita.' }
      }
    ],
    basicAbilities: [
      { name: 'Aguenta Firme', desc: 'Uma vez por rodada, reduza dano direto em 1d4.' },
      { name: 'Levanta!', desc: 'Uma vez por cena, ajude aliado caído a posição segura ou condição reversível com teste apropriado.' }
    ],
    advancedClassAbility: { name: 'Reduto', desc: 'Uma vez por cena, escolha zona próxima; primeiro aliado que permanecer nela recebe +2 Defesa até seu próximo turno.' },
    apexAbility: { name: 'Última Linha', desc: 'Uma vez por combate, ao alcance, divida dano que nocautearia aliado: metade (arredondada para cima) vai ao Guardião.' }
  },
  {
    name: 'Coordenador',
    skillOptions: ['Coordenação', 'Trato Pokémon'],
    initialAbility: {
      name: 'Manobra Conjunta',
      desc: 'Uma vez por cena, use ação principal e teste Coordenação para preparar manobra com Pokémon aliado. Sucesso cria abertura, deslocamento ou posição vantajosa.'
    },
    tracks: [
      {
        name: 'Dupla Sincronizada',
        feature1: { name: 'Sinal Combinado', desc: 'Uma vez por cena, sinal simples transmite ordem curta sem chamar atenção.' },
        feature2: { name: 'Ritmo Compartilhado', desc: 'Uma vez por rodada, quando treinador e Pokémon acertam ações relacionadas contra mesmo alvo, um recebe +2 no próximo teste.' }
      },
      {
        name: 'Líder de Campo',
        feature1: { name: 'Comando de Equipe', desc: 'Uma vez por cena, ajude dois aliados a coordenar tarefa; um recebe +2.' },
        feature2: { name: 'Troca Planejada', desc: 'Uma vez por combate, troque Pokémon ativo e permita que o novo se mova uma zona sem ação principal extra.' }
      }
    ],
    basicAbilities: [
      { name: 'Um Cobre o Outro', desc: 'Uma vez por rodada, parceiro reduz consequência de falha numa manobra conjunta.' },
      { name: 'Coreografia de Combate', desc: 'Uma vez por combate, se ambos agem na mesma rodada e seguem o plano, o segundo recebe +2 no teste ligado à sequência.' }
    ],
    advancedClassAbility: { name: 'Troca de Ritmo', desc: 'Uma vez por combate, após falha em manobra conjunta, altere ordem e permita nova tentativa se parceiro ainda não agiu.' },
    apexAbility: { name: 'Sincronia Absoluta', desc: 'Uma vez por combate, manobra decisiva exige sucesso mútuo e produz forte efeito posicional ou ambiental.' }
  },
  {
    name: 'Explorador',
    skillOptions: ['Sobrevivência', 'Navegação'],
    initialAbility: {
      name: 'Desbravador',
      desc: 'Ao examinar região, teste Sobrevivência ou Navegação para achar rota viável, passagem alternativa ou caminho que evite perigo conhecido.'
    },
    tracks: [
      {
        name: 'Batedor',
        feature1: { name: 'Primeiro a Chegar', desc: 'Ao avançar com cautela, +2 no primeiro teste para perceber emboscada ou perigo (1x por cena).' },
        feature2: { name: 'Rota de Fuga', desc: 'Uma vez por cena, indique caminho plausível de recuo que reduz complicação.' }
      },
      {
        name: 'Guia Selvagem',
        feature1: { name: 'Leitura do Habitat', desc: 'Em ambiente natural, identifica sinais de território, hábitos e presença recente de Pokémon comuns.' },
        feature2: { name: 'Acampamento Seguro', desc: 'Após preparar acampamento com recursos, reduz chance de surpresa na primeira vigília.' }
      }
    ],
    basicAbilities: [
      { name: 'Terreno Favorável', desc: 'Uma vez por cena, identifique elemento real do ambiente que a equipe pode usar como vantagem.' },
      { name: 'Nunca Estamos Perdidos', desc: 'Recupere orientação se houver sinais disponíveis; nova tentativa exige pista ou método diferente.' }
    ],
    advancedClassAbility: { name: 'Rastro Seguro', desc: 'Uma vez por sessão, identifique sinal para evitar rota perigosa ou recuperar direção.' },
    apexAbility: { name: 'Sempre Há um Caminho', desc: 'Uma vez por sessão, proponha rota alternativa plausível diante de bloqueio ambiental que abre avanço real.' }
  },
  {
    name: 'Técnico',
    skillOptions: ['Tecnologia', 'Ofício'],
    initialAbility: {
      name: 'Reparo Rápido',
      desc: 'Com ferramentas e materiais, faça reparo temporário em dispositivo mecânico ou eletrônico com teste de Tecnologia ou Ofício.'
    },
    tracks: [
      {
        name: 'Inventor',
        feature1: { name: 'Protótipo Útil', desc: 'Entre cenas, construa protótipo simples; uma vez por sessão concede +2 em teste coerente antes de quebrar.' },
        feature2: { name: 'Ajuste de Precisão', desc: 'Após testar dispositivo, +2 na próxima tentativa semelhante.' }
      },
      {
        name: 'Reparador',
        feature1: { name: 'Diagnóstico Rápido', desc: 'Uma vez por cena, descubra se equipamento pode ser reparado no local ou exige peça especializada.' },
        feature2: { name: 'Reparo de Emergência', desc: 'Uma vez por cena, faça aparelho danificado funcionar até o fim da cena.' }
      }
    ],
    basicAbilities: [
      { name: 'Peça por Peça', desc: 'Ao examinar dispositivo danificado, descubra provável defeito e peças necessárias.' },
      { name: 'Projeto de Campo', desc: 'Com tempo e materiais, prepare alarme, sinalizador ou medidor simples.' }
    ],
    advancedClassAbility: { name: 'Remendo Sob Pressão', desc: 'Uma vez por combate ou cena de perigo, repare aparelho essencial até o fim da cena.' },
    apexAbility: { name: 'Obra-Prima de Campo', desc: 'Uma vez por sessão, adapte dispositivo para superar problema decisivo.' }
  },
  {
    name: 'Mediador',
    skillOptions: ['Influência', 'Empatia'],
    initialAbility: {
      name: 'Negociação Tensa',
      desc: 'Quando duas partes aceitam conversar, teste Influência ou Empatia para reduzir tensão e abrir negociação sem impor acordo contrário a interesses.'
    },
    tracks: [
      {
        name: 'Diplomata',
        feature1: { name: 'Protocolo Flexível', desc: 'Uma vez por cena, evite gafe social ou consiga apresentação formal com acesso e contato.' },
        feature2: { name: 'Acordo Condicional', desc: 'Estabeleça compromisso com benefício, custo mútuo e condição de encerramento.' }
      },
      {
        name: 'Pacificador',
        feature1: { name: 'Desescalar', desc: 'Uma vez por cena, se a pessoa ainda ouve, adie ação hostil para ouvir proposta.' },
        feature2: { name: 'Ponte de Confiança', desc: 'Após ajudar duas partes, +2 em teste para manter canal de comunicação aberto.' }
      }
    ],
    basicAbilities: [
      { name: 'Palavras Certas', desc: 'Uma vez por cena por interlocutor, identifique abordagem social plausível que funcione melhor.' },
      { name: 'Apaziguar os Ânimos', desc: 'Crie pausa para diálogo ou recuo antes de ataques começarem.' }
    ],
    advancedClassAbility: { name: 'Rede de Contatos', desc: 'Uma vez por sessão, peça contato plausível em comunidade conhecida.' },
    apexAbility: { name: 'Aliança Improvável', desc: 'Uma vez por arco, reúna grupos com interesses parcialmente compatíveis para conversa franca.' }
  },
  {
    name: 'Pesquisador',
    skillOptions: ['Pesquisa', 'Conhecimento'],
    initialAbility: {
      name: 'Análise de Fenômeno',
      desc: 'Ao encontrar fenômeno, objeto ou Pokémon ligado à área estudada, teste para recuperar informação técnica relevante e descartar hipóteses improváveis.'
    },
    tracks: [
      {
        name: 'Teórico',
        feature1: { name: 'Modelo Explicativo', desc: 'Uma vez por cena, organize dados em explicação provisória; Mestre aponta dado coerente e incerteza aberta.' },
        feature2: { name: 'Revisão de Hipótese', desc: 'Quando evidência contradiz modelo, +2 para formular alternativa viável.' }
      },
      {
        name: 'Experimentalista',
        feature1: { name: 'Instrumentação', desc: 'Com equipamento adequado, reduza CA em 2 para medir ou comparar fenômeno controlável.' },
        feature2: { name: 'Experimento de Campo', desc: 'Uma vez por sessão, crie experimento reproduzível para responder pergunta de pesquisa.' }
      }
    ],
    basicAbilities: [
      { name: 'Hipótese Testável', desc: 'Formule hipótese e método; Mestre informa o que se confirma, enfraquece ou fica em aberto.' },
      { name: 'Preparação Científica', desc: 'Após estudo específico, +2 em teste diretamente ligado à evidência.' }
    ],
    advancedClassAbility: { name: 'Protocolo de Análise', desc: 'Uma vez por cena, +2 em Pesquisa ao comparar amostra com dados de catálogo prévio.' },
    apexAbility: { name: 'Descoberta Decisiva', desc: 'Uma vez por arco, conecte três evidências e formule hipótese que destrave um avanço científico crucial.' }
  },
  {
    name: 'Infiltrador',
    skillOptions: ['Furtividade', 'Ladinagem'],
    initialAbility: {
      name: 'Aproximação Silenciosa',
      desc: 'Com cobertura ou distração plausível, teste Furtividade para se aproximar sem chamar atenção imediata.'
    },
    tracks: [
      {
        name: 'Sombra',
        feature1: { name: 'Sumir no Fluxo', desc: 'Em multidão ou local movimentado, mescle-se ao ambiente sem ser seguido visualmente.' },
        feature2: { name: 'Passagem Discreta', desc: 'Após preparar rota, atravesse área vigiada sem deixar vestígios óbvios.' }
      },
      {
        name: 'Arrombador',
        feature1: { name: 'Leitura de Fechadura', desc: 'Ao examinar mecanismo, descubra se é simples, complexo ou protegido por alarme.' },
        feature2: { name: 'Mecanismo Delicado', desc: 'Com gazuas/ferramentas, +2 para abrir ou desativar mecanismos sem quebrar.' }
      }
    ],
    basicAbilities: [
      { name: 'Janela de Oportunidade', desc: 'Após observar rotina dos guardas, identifique momento exato para cruzar perímetro seguro.' },
      { name: 'Mãos Preparadas', desc: 'Manipule objeto pequeno sem chamar atenção quando não estiver sob observação direta.' }
    ],
    advancedClassAbility: { name: 'Saída Planejada', desc: 'Se preparou rota de fuga prévia, recue uma zona sem necessidade de novo teste de Furtividade.' },
    apexAbility: { name: 'Fantasma', desc: 'Uma vez por sessão, infiltração curta sem qualquer detecção por observadores comuns.' }
  },
  {
    name: 'Cuidador',
    skillOptions: ['Trato Pokémon', 'Medicina'],
    initialAbility: {
      name: 'Diagnóstico Empático',
      desc: 'Ao observar Pokémon, teste para identificar necessidade física ou emocional imediata: exaustão, medo, dor ou lesão.'
    },
    tracks: [
      {
        name: 'Enfermeiro Pokémon',
        feature1: { name: 'Triagem Rápida', desc: 'Uma vez por cena, identifique a condição ou ferimento que exige prioridade máxima.' },
        feature2: { name: 'Tratamento Calmo', desc: 'Em ambiente seguro, +2 para estabilizar ou curar condição comum de Pokémon.' }
      },
      {
        name: 'Criador',
        feature1: { name: 'Rotina Saudável', desc: 'Em pausa longa, prepare dieta ou rotina compatível para acelerar recuperação e moral da espécie.' },
        feature2: { name: 'Treino Positivo', desc: 'Após treino acolhedor, ajude o Pokémon a dominar nova técnica com apoio mútuo.' }
      }
    ],
    basicAbilities: [
      { name: 'Recuperação Assistida', desc: 'Pausa com cuidados médicos reduz o cansaço e melhora a eficiência de cura do grupo.' },
      { name: 'Confiança Construída', desc: 'Dedique tempo para criar laços genuínos de confiança sem forçar obediência cega.' }
    ],
    advancedClassAbility: { name: 'Lê os Sinais', desc: 'Uma vez por cena, pergunte qual sinal observável indica o verdadeiro sentimento do Pokémon.' },
    apexAbility: { name: 'Elo Inquebrável', desc: 'Uma vez por arco, ajude Pokémon em pânico ou crise extrema a restabelecer conexão e coragem.' }
  }
];

export type PokemonType =
  | 'Normal'
  | 'Fogo'
  | 'Água'
  | 'Grama'
  | 'Elétrico'
  | 'Gelo'
  | 'Lutador'
  | 'Veneno'
  | 'Terra'
  | 'Voador'
  | 'Psíquico'
  | 'Inseto'
  | 'Pedra'
  | 'Fantasma'
  | 'Dragão'
  | 'Sombrio'
  | 'Aço'
  | 'Fada';

export const POKEMON_TYPES: PokemonType[] = [
  'Normal', 'Fogo', 'Água', 'Grama', 'Elétrico', 'Gelo',
  'Lutador', 'Veneno', 'Terra', 'Voador', 'Psíquico', 'Inseto',
  'Pedra', 'Fantasma', 'Dragão', 'Sombrio', 'Aço', 'Fada'
];

export const TYPE_COLORS: Record<PokemonType, { bg: string; border: string; text: string }> = {
  Normal: { bg: 'bg-zinc-600', border: 'border-zinc-500', text: 'text-zinc-100' },
  Fogo: { bg: 'bg-orange-600', border: 'border-orange-500', text: 'text-orange-100' },
  Água: { bg: 'bg-blue-600', border: 'border-blue-500', text: 'text-blue-100' },
  Grama: { bg: 'bg-emerald-600', border: 'border-emerald-500', text: 'text-emerald-100' },
  Elétrico: { bg: 'bg-yellow-500', border: 'border-yellow-400', text: 'text-black' },
  Gelo: { bg: 'bg-cyan-500', border: 'border-cyan-400', text: 'text-cyan-950' },
  Lutador: { bg: 'bg-red-700', border: 'border-red-600', text: 'text-red-100' },
  Veneno: { bg: 'bg-purple-700', border: 'border-purple-600', text: 'text-purple-100' },
  Terra: { bg: 'bg-amber-700', border: 'border-amber-600', text: 'text-amber-100' },
  Voador: { bg: 'bg-indigo-500', border: 'border-indigo-400', text: 'text-indigo-100' },
  Psíquico: { bg: 'bg-pink-600', border: 'border-pink-500', text: 'text-pink-100' },
  Inseto: { bg: 'bg-lime-600', border: 'border-lime-500', text: 'text-lime-100' },
  Pedra: { bg: 'bg-stone-600', border: 'border-stone-500', text: 'text-stone-100' },
  Fantasma: { bg: 'bg-violet-900', border: 'border-violet-700', text: 'text-violet-100' },
  Dragão: { bg: 'bg-indigo-800', border: 'border-indigo-600', text: 'text-indigo-100' },
  Sombrio: { bg: 'bg-neutral-800', border: 'border-neutral-600', text: 'text-neutral-200' },
  Aço: { bg: 'bg-slate-500', border: 'border-slate-400', text: 'text-slate-100' },
  Fada: { bg: 'bg-rose-400', border: 'border-rose-300', text: 'text-rose-950' }
};

// Matriz do livro: Seção 32 e 33 (Gen VI+ com modificadores fixos de dano: Fraqueza +2, Resistência -2, Imunidade 0 dano)
export interface TypeRelation {
  superEffective: PokemonType[];
  resistedBy: PokemonType[];
  immune: PokemonType[];
}

export const TYPE_CHART: Record<PokemonType, TypeRelation> = {
  Normal: {
    superEffective: [],
    resistedBy: ['Pedra', 'Aço'],
    immune: ['Fantasma']
  },
  Fogo: {
    superEffective: ['Grama', 'Gelo', 'Inseto', 'Aço'],
    resistedBy: ['Fogo', 'Água', 'Pedra', 'Dragão'],
    immune: []
  },
  Água: {
    superEffective: ['Fogo', 'Terra', 'Pedra'],
    resistedBy: ['Água', 'Grama', 'Dragão'],
    immune: []
  },
  Grama: {
    superEffective: ['Água', 'Terra', 'Pedra'],
    resistedBy: ['Fogo', 'Grama', 'Veneno', 'Voador', 'Inseto', 'Dragão', 'Aço'],
    immune: []
  },
  Elétrico: {
    superEffective: ['Água', 'Voador'],
    resistedBy: ['Elétrico', 'Grama', 'Dragão'],
    immune: ['Terra']
  },
  Gelo: {
    superEffective: ['Grama', 'Terra', 'Voador', 'Dragão'],
    resistedBy: ['Fogo', 'Água', 'Gelo', 'Aço'],
    immune: []
  },
  Lutador: {
    superEffective: ['Normal', 'Gelo', 'Pedra', 'Sombrio', 'Aço'],
    resistedBy: ['Veneno', 'Voador', 'Psíquico', 'Inseto', 'Fada'],
    immune: ['Fantasma']
  },
  Veneno: {
    superEffective: ['Grama', 'Fada'],
    resistedBy: ['Veneno', 'Terra', 'Pedra', 'Fantasma'],
    immune: ['Aço']
  },
  Terra: {
    superEffective: ['Fogo', 'Elétrico', 'Veneno', 'Pedra', 'Aço'],
    resistedBy: ['Grama', 'Inseto'],
    immune: ['Voador']
  },
  Voador: {
    superEffective: ['Grama', 'Lutador', 'Inseto'],
    resistedBy: ['Elétrico', 'Pedra', 'Aço'],
    immune: []
  },
  Psíquico: {
    superEffective: ['Lutador', 'Veneno'],
    resistedBy: ['Psíquico', 'Aço'],
    immune: ['Sombrio']
  },
  Inseto: {
    superEffective: ['Grama', 'Psíquico', 'Sombrio'],
    resistedBy: ['Fogo', 'Lutador', 'Veneno', 'Voador', 'Fantasma', 'Aço', 'Fada'],
    immune: []
  },
  Pedra: {
    superEffective: ['Fogo', 'Gelo', 'Voador', 'Inseto'],
    resistedBy: ['Lutador', 'Terra', 'Aço'],
    immune: []
  },
  Fantasma: {
    superEffective: ['Psíquico', 'Fantasma'],
    resistedBy: ['Sombrio'],
    immune: ['Normal']
  },
  Dragão: {
    superEffective: ['Dragão'],
    resistedBy: ['Aço'],
    immune: ['Fada']
  },
  Sombrio: {
    superEffective: ['Psíquico', 'Fantasma'],
    resistedBy: ['Lutador', 'Sombrio', 'Fada'],
    immune: []
  },
  Aço: {
    superEffective: ['Gelo', 'Pedra', 'Fada'],
    resistedBy: ['Fogo', 'Água', 'Elétrico', 'Aço'],
    immune: []
  },
  Fada: {
    superEffective: ['Lutador', 'Dragão', 'Sombrio'],
    resistedBy: ['Fogo', 'Veneno', 'Aço'],
    immune: []
  }
};

/**
 * Calcula o modificador de dano conforme o sistema Além da Próxima Rota:
 * - Se imune a qualquer tipo defensor: Imunidade total (Dano 0)
 * - Para cada tipo defensor:
 *   - Se fraqueza: +2
 *   - Se resistência: -2
 * Total: +4 (dupla fraqueza), +2, 0 (neutro), -2, -4 (dupla resistência), ou Imune (0 total).
 */
export function calculateTypeEffectiveness(
  attackType: PokemonType,
  defTypes: PokemonType[]
): { modifierText: string; damageMod: number; isImmune: boolean; description: string } {
  const rel = TYPE_CHART[attackType];
  if (!rel) return { modifierText: 'Normal (0)', damageMod: 0, isImmune: false, description: 'Sem modificador' };

  for (const defType of defTypes) {
    if (rel.immune.includes(defType)) {
      return { modifierText: 'Imune (0 de dano)', damageMod: -999, isImmune: true, description: `O tipo defensor ${defType} é completamente imune a ataques do tipo ${attackType}.` };
    }
  }

  let mod = 0;
  for (const defType of defTypes) {
    if (rel.superEffective.includes(defType)) {
      mod += 2;
    } else if (rel.resistedBy.includes(defType)) {
      mod -= 2;
    }
  }

  if (mod === 4) {
    return { modifierText: 'Super Efetivo (+4 dano)', damageMod: 4, isImmune: false, description: 'Dupla fraqueza (+4 de dano fixo adicional).' };
  } else if (mod === 2) {
    return { modifierText: 'Efetivo (+2 dano)', damageMod: 2, isImmune: false, description: 'Uma fraqueza (+2 de dano fixo adicional).' };
  } else if (mod === -2) {
    return { modifierText: 'Pouco Efetivo (-2 dano)', damageMod: -2, isImmune: false, description: 'Uma resistência (-2 de dano fixo reduzido).' };
  } else if (mod === -4) {
    return { modifierText: 'Muito Pouco Efetivo (-4 dano)', damageMod: -4, isImmune: false, description: 'Dupla resistência (-4 de dano fixo reduzido).' };
  }
  return { modifierText: 'Dano Normal (+0)', damageMod: 0, isImmune: false, description: 'Dano neutro sem bônus ou penalidade de tipo.' };
}

export const CONDITIONS = [
  { name: 'Abalado', effect: '-2 no próximo teste importante; depois termina.' },
  { name: 'Atordoado', effect: 'Perde a reação até o início do próximo turno e sofre -2 no próximo teste de precisão/coordenação.' },
  { name: 'Caído', effect: 'Precisa gastar movimento para levantar. Ataques corpo a corpo contra o alvo podem receber +2.' },
  { name: 'Imobilizado', effect: 'Não pode mudar de zona até se libertar ou causa ser removida; ainda pode agir se possível.' },
  { name: 'Envenenado', effect: 'Sofre 1d4 dano no fim da rodada. No fim da ativação, teste Corpo + Resistência CA 12 para encerrar.' },
  { name: 'Queimado', effect: 'Sofre 1d4 dano no fim da rodada. No fim da ativação, teste Corpo + Resistência CA 12 para encerrar.' },
  { name: 'Paralisado', effect: 'Não pode usar reação e sofre -2 em testes que dependam de movimento fino. Teste CA 12 para encerrar.' },
  { name: 'Confuso', effect: 'Na próxima ação complexa, teste Instinto de Batalha (Pokémon) ou Empatia (Treinador) CA 12.' },
  { name: 'Sono', effect: 'Não age, não se move nem reage. No início da ativação, teste Corpo + Resistência CA 12 para acordar.' },
  { name: 'Exausto', effect: '-2 em testes de esforço prolongado. Uma pausa segura reduz desgaste; noite adequada encerra.' },
  { name: 'Assustado', effect: 'Não pode aproximar-se voluntariamente da fonte do medo sem superar teste apropriado.' },
];

export const OFFICIAL_ITEMS = [
  { name: 'Poké Bola', price: 200, category: 'Dispositivo', effect: 'Dispositivo comum de captura.' },
  { name: 'Grande Bola', price: 600, category: 'Dispositivo', effect: 'Reduz CA de captura em 2.' },
  { name: 'Ultra Bola', price: 1200, category: 'Dispositivo', effect: 'Reduz CA de captura em 4.' },
  { name: 'Poção', price: 300, category: 'Medicina', effect: 'Recupera 1d6 + 2 PV.' },
  { name: 'Superpoção', price: 700, category: 'Medicina', effect: 'Recupera 2d6 + 4 PV.' },
  { name: 'Hiperpoção', price: 1200, category: 'Medicina', effect: 'Recupera 3d6 + 6 PV.' },
  { name: 'Antídoto', price: 100, category: 'Medicina', effect: 'Encerra a condição Envenenado.' },
  { name: 'Antiparalisia', price: 100, category: 'Medicina', effect: 'Encerra a condição Paralisado.' },
  { name: 'Cura-Queimadura', price: 100, category: 'Medicina', effect: 'Encerra a condição Queimado.' },
  { name: 'Despertador', price: 100, category: 'Medicina', effect: 'Encerra a condição Sono ou Confuso leve.' },
  { name: 'Remédio Completo', price: 600, category: 'Medicina', effect: 'Encerra uma condição comum qualquer.' },
  { name: 'Reviver', price: 1500, category: 'Medicina', effect: 'Levanta Pokémon Nocauteado com 1/4 dos PV máximos.' },
  { name: 'Ração Pokémon', price: 80, category: 'Alimento', effect: 'Alimentação adequada e nutritiva para viagem curta.' },
  { name: 'Kit de Primeiros Socorros', price: 250, category: 'Equipamento', effect: 'Materiais para Medicina e estabilização de feridos.' },
  { name: 'Corda e Mosquetão', price: 180, category: 'Exploração', effect: 'Facilita escaladas e procedimentos de resgate.' },
  { name: 'Lanterna', price: 120, category: 'Exploração', effect: 'Iluminação portátil com bateria durável.' },
  { name: 'Kit de Ferramentas', price: 350, category: 'Ofício', effect: 'Ferramentas básicas para testes de Ofício e Tecnologia.' },
  { name: 'Pílula de Força', price: 500, category: 'Combate', effect: 'Por uma cena: +2 em teste de Corpo/força ou +1 dano físico; depois Exausto leve.' },
  { name: 'Kit de Campo', price: 400, category: 'Exploração', effect: 'Itens simples de navegação, abrigo térmico e reparo leve.' },
];
