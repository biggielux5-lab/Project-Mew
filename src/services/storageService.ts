/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  User,
  Campaign,
  TrainerSheet,
  PokemonSheet,
  DiceRollResult,
  WorldClock,
  SessionRecord,
  PokedexSpecies,
  CombatSession,
  Combatant,
  CombatLogEntry,
  NPC,
  InventoryItem,
  LibraryMove,
  CampaignBackup,
  OfficialItem,
  Shop,
  WalletTransaction,
  BattleCondition,
  EncounterTable,
  PokemonDiaryEntry,
  CampaignPokedexEntry,
  GymBadge,
  GymMatchRecord,
  Quest,
  AtlasLocation,
  GmResource,
  EncounterEntry,
  Faction,
  RelationshipConnection,
  Mystery,
  Clue,
  WorldEvent,
  WorldCalendar,
  NewsRumor,
  Tournament,
  ReputationRecord,
  RivalryRecord,
  PrepScene,
  NarrativePendingItem,
  VTTMap,
  CampaignFileReference,
  PlayerPermissions,
} from '../types';
import { DICE_VALUES, DiceRank } from '../data/rulesData';
import { POKEDEX_SPECIES } from '../data/pokedexData';
import { SYSTEM_MOVES } from '../data/movesData';
import { OFFICIAL_ITEMS_CATALOG } from '../data/officialItemsCatalog';
import { SYSTEM_CONDITIONS } from '../data/conditionsData';
import { OFFICIAL_KANTO_GYMS } from '../data/gymsData';
import { OFFICIAL_KANTO_LOCATIONS } from '../data/kantoAtlasData';
import { OFFICIAL_MOVES_CATALOG } from '../data/officialMovesCatalog';
import {
  SEED_FACTIONS,
  SEED_RELATIONSHIPS,
  SEED_MYSTERIES,
  SEED_WORLD_EVENTS,
  SEED_NEWS_RUMORS,
  SEED_TOURNAMENTS,
  SEED_RIVALRIES,
  SEED_PREP_SCENES,
  SEED_NARRATIVE_PENDING,
  SEED_VTT_MAPS,
  SEED_CAMPAIGN_FILES,
} from '../data/campaignWorldData';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

const STORAGE_KEYS = {
  USERS: 'project_mew_users_v1',
  CURRENT_USER: 'project_mew_current_user_v1',
  CAMPAIGNS: 'project_mew_campaigns_v1',
  TRAINERS: 'project_mew_trainers_v1',
  POKEMON: 'project_mew_pokemon_v1',
  ROLL_HISTORY: 'project_mew_rolls_v1',
  POKEDEX_SPECIES: 'project_mew_pokedex_v1',
  COMBAT_SESSIONS: 'project_mew_combat_v1',
  NPCS: 'project_mew_npcs_v1',
  CUSTOM_MOVES: 'project_mew_custom_moves_v1',
  INVENTORY: 'project_mew_inventory_v1',
  DRAFTS_PREFIX: 'project_mew_draft_',
  OFFICIAL_ITEMS: 'project_mew_items_v1',
  CUSTOM_ITEMS: 'project_mew_custom_items_v1',
  SHOPS: 'project_mew_shops_v1',
  TRANSACTIONS: 'project_mew_transactions_v1',
  QUESTS: 'project_mew_quests_v1',
  LOCATIONS: 'project_mew_locations_v1',
  GYMS: 'project_mew_gyms_v1',
  ENCOUNTER_TABLES: 'project_mew_encounters_v1',
  POKEMON_DIARIES: 'project_mew_diaries_v1',
  CAMPAIGN_POKEDEX: 'project_mew_camp_pokedex_v1',
  GM_RESOURCES: 'project_mew_gm_resources_v1',
  POKEAPI_MOVES_CACHE: 'project_mew_pokeapi_moves_v1',
  FACTIONS: 'project_mew_factions_v1',
  RELATIONSHIPS: 'project_mew_relationships_v1',
  MYSTERIES: 'project_mew_mysteries_v1',
  WORLD_EVENTS: 'project_mew_world_events_v1',
  NEWS_RUMORS: 'project_mew_news_rumors_v1',
  TOURNAMENTS: 'project_mew_tournaments_v1',
  REPUTATIONS: 'project_mew_reputations_v1',
  RIVALRIES: 'project_mew_rivalries_v1',
  PREP_SCENES: 'project_mew_prep_scenes_v1',
  NARRATIVE_PENDING: 'project_mew_narrative_pending_v1',
  VTT_MAPS: 'project_mew_vtt_maps_v1',
  CAMPAIGN_FILES: 'project_mew_files_v1',
};

// Calculate Trainer HP: 10 + (2 * facial value Corpo) + (2 * (level - 1))
export function calculateTrainerMaxHp(corpo: DiceRank, level: number): number {
  const facial = DICE_VALUES[corpo] || 4;
  return 10 + 2 * facial + 2 * (level - 1);
}

// Calculate Trainer Defense: 10 + Reflexos bonus (d4:+0, d6:+1, d8:+2, d10:+3, d12:+4)
export function calculateTrainerDefense(reflexos: DiceRank): number {
  const bonusMap: Record<DiceRank, number> = { d4: 0, d6: 1, d8: 2, d10: 3, d12: 4 };
  return 10 + (bonusMap[reflexos] || 0);
}

// Calculate Pokemon HP: 12 + (2 * facial value Corpo) + (2 * (level - 1)) + 4 * evolutionsCount
export function calculatePokemonMaxHp(corpo: DiceRank, level: number, evolutions: number = 0): number {
  const facial = DICE_VALUES[corpo] || 4;
  return 12 + 2 * facial + 2 * (level - 1) + 4 * evolutions;
}

// Calculate Pokemon PE: 2 + Math.ceil(level / 2) + evolutions
export function calculatePokemonMaxPe(level: number, evolutions: number = 0): number {
  return 2 + Math.ceil(level / 2) + evolutions;
}

// Calculate Pokemon Defense: 10 + Agilidade bonus
export function calculatePokemonDefense(agilidade: DiceRank): number {
  const bonusMap: Record<DiceRank, number> = { d4: 0, d6: 1, d8: 2, d10: 3, d12: 4 };
  return 10 + (bonusMap[agilidade] || 0);
}

// Seed Initial Data
const SEED_USERS: User[] = [
  {
    id: 'user_ash_mestre',
    name: 'Mestre Ash',
    email: 'mestre@projectmew.com',
    avatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&auto=format&fit=crop&q=80',
    bio: 'Narrador veterano de jornadas Pokémon. Especialista em conflitos de ginásio e mistérios ancestrais.',
    role: 'admin',
    createdAt: '2026-01-10T12:00:00Z',
  },
  {
    id: 'user_serena',
    name: 'Serena Yvonne',
    email: 'serena@projectmew.com',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    bio: 'Coordenadora e treinadora focada em sincronia de batalha e performances de campo.',
    role: 'user',
    createdAt: '2026-01-12T14:30:00Z',
  },
  {
    id: 'user_gary',
    name: 'Gary Carvalho',
    email: 'gary@projectmew.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    bio: 'Pesquisador de campo e estrategista. Em busca de documentar todas as anomalias de Kanto.',
    role: 'user',
    createdAt: '2026-01-15T09:15:00Z',
  },
];

const SEED_CAMPAIGNS: Campaign[] = [
  {
    id: 'camp_kanto_beyond',
    code: 'MEW-KANTO',
    name: 'Crônicas de Kanto: Além da Próxima Rota',
    isSample: true,
    description: 'Nas rotas entre Cerulean e Vermilion, uma névoa magnética incomum está alterando o comportamento das criaturas selvagens. Rumores apontam para uma antiga base esquecida da Silph Co. e movimentações clandestinas da Equipe Rocket.',
    coverImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&auto=format&fit=crop&q=80',
    gmId: 'user_ash_mestre',
    gmName: 'Mestre Ash',
    players: [
      {
        userId: 'user_ash_mestre',
        userName: 'Mestre Ash',
        userEmail: 'mestre@projectmew.com',
        userAvatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&auto=format&fit=crop&q=80',
        role: 'gm',
        joinedAt: '2026-01-10T12:00:00Z',
      },
      {
        userId: 'user_serena',
        userName: 'Serena Yvonne',
        userEmail: 'serena@projectmew.com',
        userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        role: 'player',
        joinedAt: '2026-01-12T14:30:00Z',
      },
      {
        userId: 'user_gary',
        userName: 'Gary Carvalho',
        userEmail: 'gary@projectmew.com',
        userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        role: 'player',
        joinedAt: '2026-01-15T09:15:00Z',
      },
    ],
    clocks: [
      {
        id: 'clock_1',
        campaignId: 'camp_kanto_beyond',
        name: 'Infiltração da Equipe Rocket na Usina Abandonada',
        totalSegments: 6,
        filledSegments: 4,
        objective: 'A facção criminosa busca ativar o reator de tempestade elétrica para sobrecarregar a rede de Cerulean.',
        consequence: 'Blecaute total na região de Cerulean e surgimento de Pokémon Elétricos enfurecidos na Rota 9.',
        isSecret: false,
      },
      {
        id: 'clock_2',
        campaignId: 'camp_kanto_beyond',
        name: 'Matilha de Mankey territorial bloqueia a Passagem Rochosa',
        totalSegments: 4,
        filledSegments: 2,
        objective: 'Os Mankey perderam seu líder e estão atacando qualquer viajante na trilha da montanha.',
        consequence: 'A rota alternativa para Vermilion será fechada por bloqueio da guarda florestal.',
        isSecret: false,
      },
      {
        id: 'clock_3_secret',
        campaignId: 'camp_kanto_beyond',
        name: 'Despertar da Frequência Psíquica Ancestral',
        totalSegments: 6,
        filledSegments: 1,
        objective: 'Pesquisas secretas com DNA sintetizado emitem pulso ressonante pelo subterrâneo.',
        consequence: 'Manifestação de anomalias dimensionais e sombras nos arredores da Caverna de Cerulean.',
        isSecret: true,
      },
    ],
    sessions: [
      {
        id: 'sess_1',
        campaignId: 'camp_kanto_beyond',
        sessionNumber: 1,
        title: 'O Primeiro Sinal nas Alturas',
        date: '2026-02-05',
        summary: 'Os treinadores se encontraram na saída norte de Saffron após um blecaute suspeito no Centro Pokémon. Na Rota 5, salvaram um pequeno Oddish ferido que fugia de homens de uniforme preto com insígnias "R".',
        xpAwarded: 2,
        notes: 'Serena usou Coordenação com Braixen para abrir caminho. Gary recuperou um transmissor quebrado com teste de Tecnologia.',
      },
      {
        id: 'sess_2',
        campaignId: 'camp_kanto_beyond',
        sessionNumber: 2,
        title: 'Sombras no Túnel das Pedras',
        date: '2026-02-19',
        summary: 'Investigação das linhas de transmissão cortadas. Combate intenso contra guardas armados com Zubats e Koffings. A equipe descobriu que a carga roubada segue em direção à antiga Usina.',
        xpAwarded: 3,
        notes: 'Combate resolvido com sucesso com custo na saída do túnel. Relógio da Rocket avançou 2 segmentos.',
      },
    ],
    publicInfo: {
      region: 'Kanto (Região Central)',
      tone: 'Aventura tática, mistério corporativo, amizade e descoberta.',
      houseRules: 'Uso das regras de Além da Próxima Rota 1.0. Ações em equipe concedem +2 sob justificativa descritiva.',
      campaignAgreements: 'Combates com riscos reais de derrota, mas foco em narrativa de superação. Não há morte permanente automática em 0 PV.',
    },
    secretNotes: 'A Equipe Rocket não sabe, mas o dispositivo que roubaram foi construído por um cientista desertor que inseriu uma frequência de chamado para Pokémon Psíquicos lendários. O transmissor em posse de Gary começará a bipar quando eles se aproximarem da Usina.',
    createdAt: '2026-01-10T12:00:00Z',
  },
];

const SEED_TRAINERS: TrainerSheet[] = [
  {
    id: 'tr_serena',
    campaignId: 'camp_kanto_beyond',
    ownerId: 'user_serena',
    ownerName: 'Serena Yvonne',
    name: 'Serena Yvonne',
    age: 16,
    region: 'Kalos (Viajante em Kanto)',
    concept: 'Jovem artista e estrategista de torneios graciosa e focada.',
    goal: 'Aperfeiçoar um estilo de batalha sincronizado que inspire pessoas e Pokémon.',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    origin: 'Artista de Rua',
    className: 'Coordenador',
    trackName: 'Dupla Sincronizada',
    level: 3,
    xp: 7,
    corpo: 'd6',
    mente: 'd6',
    presenca: 'd8',
    maxHp: 26, // 10 + 2*6 + 2*(3-1) = 10 + 12 + 4 = 26
    currentHp: 26,
    defense: 11, // 10 + reflexos d6(+1) = 11
    skills: {
      Combate: 'd4',
      Atletismo: 'd6',
      Pontaria: 'd4',
      Medicina: 'd4',
      Investigação: 'd4',
      Sobrevivência: 'd4',
      Influência: 'd6',
      'Trato Pokémon': 'd8',
      Conhecimento: 'd4',
      Percepção: 'd6',
      Tecnologia: 'd4',
      Coordenação: 'd8',
      Reflexos: 'd6',
      Estratégia: 'd6',
      Pesquisa: 'd4',
      Ofício: 'd4',
      Expressão: 'd8',
      Empatia: 'd8',
      Etiqueta: 'd6',
      Navegação: 'd4',
      Ladinagem: 'd4',
      Arte: 'd8',
      Comércio: 'd4',
      Furtividade: 'd4',
    },
    originAbility: {
      name: 'Rouba a Cena',
      desc: 'Uma vez por cena, crie distração visual/artística para que um aliado se reposicione ou saia discretamente.',
    },
    classAbilities: [
      {
        name: 'Manobra Conjunta',
        desc: 'Uma vez por cena, use ação principal e teste Coordenação para preparar manobra com Pokémon aliado. Sucesso cria vantagem concreta.',
      },
      {
        name: 'Sinal Combinado',
        desc: 'Uma vez por cena, sinal discreto transmite comando curto sem chamar a atenção dos adversários.',
      },
    ],
    sharedAbilities: [
      {
        name: 'Comando Claro',
        desc: 'Use Coordenação ou Trato Pokémon para passar instrução ágil sem gastar a ação principal do turno.',
      },
    ],
    personalAbility: {
      name: 'Compasso Coreográfico',
      desc: 'Uma vez por cena, ao rolar Coordenação com seu Pokémon parceiro em combate, role com Vantagem (+2).',
    },
    inventory: [
      { id: 'inv_1', name: 'Poké Bola', category: 'Dispositivo', quantity: 3, effect: 'Dispositivo padrão de captura.' },
      { id: 'inv_2', name: 'Superpoção', category: 'Medicina', quantity: 2, effect: 'Recupera 2d6 + 4 PV.' },
      { id: 'inv_3', name: 'Fitilho de Apresentação', category: 'Acessório', quantity: 1, effect: 'Item cênico para manobras visuais.' },
    ],
    pokedollars: 1450,
    relationships: 'Parceria de respeito mútuo com Gary; amizade profunda com seu Braixen.',
    fears: 'Perder o controle em uma situação onde seus Pokémon dependam exclusivamente de suas ordens.',
    openQuestions: 'O que motivou as pessoas da Equipe Rocket a caçarem Pokémon pacíficos na Rota 5?',
    notes: 'Carrega um caderno de anotações com esboços de rotinas de combate.',
  },
  {
    id: 'tr_gary',
    campaignId: 'camp_kanto_beyond',
    ownerId: 'user_gary',
    ownerName: 'Gary Carvalho',
    name: 'Gary Carvalho',
    age: 17,
    region: 'Kanto (Pallet)',
    concept: 'Pesquisador de campo pragmático, observador e analítico.',
    goal: 'Compreender as matrizes energéticas dos Pokémon ancestrais e catalogar anomalias.',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    origin: 'Prodígio',
    className: 'Analista',
    trackName: 'Tático',
    level: 3,
    xp: 7,
    corpo: 'd6',
    mente: 'd8',
    presenca: 'd6',
    maxHp: 26, // 10 + 2*6 + 2*(3-1) = 26
    currentHp: 24,
    defense: 11, // 10 + reflexos d6(+1) = 11
    skills: {
      Combate: 'd4',
      Atletismo: 'd6',
      Pontaria: 'd6',
      Medicina: 'd6',
      Investigação: 'd8',
      Sobrevivência: 'd6',
      Influência: 'd4',
      'Trato Pokémon': 'd6',
      Conhecimento: 'd8',
      Percepção: 'd8',
      Tecnologia: 'd8',
      Coordenação: 'd6',
      Reflexos: 'd6',
      Estratégia: 'd8',
      Pesquisa: 'd8',
      Ofício: 'd4',
      Expressão: 'd4',
      Empatia: 'd4',
      Etiqueta: 'd6',
      Navegação: 'd6',
      Ladinagem: 'd4',
      Arte: 'd4',
      Comércio: 'd6',
      Furtividade: 'd4',
    },
    originAbility: {
      name: 'Padrão na Bagunça',
      desc: 'Uma vez por cena ao investigar, pergunte qual detalhe observado merece atenção primeiro.',
    },
    classAbilities: [
      {
        name: 'Estudo de Alvo',
        desc: 'Ação principal em Mente + Investigação CA 12: primeiro aliado que explorar vulnerabilidade recebe +2.',
      },
      {
        name: 'Posição Vantajosa',
        desc: 'Identifique abertura no campo: aliado que a explore antes do fim da rodada recebe +2.',
      },
    ],
    sharedAbilities: [
      {
        name: 'Atenção Redobrada',
        desc: 'Com tempo de observação, teste Percepção para revelar sinais evidentes de armadilha ou emboscada.',
      },
    ],
    personalAbility: {
      name: 'Diagnóstico de Circuito',
      desc: 'Uma vez por sessão, ganha +2 em testes de Tecnologia para decodificar transmissores de dados.',
    },
    inventory: [
      { id: 'inv_g1', name: 'Grande Bola', category: 'Dispositivo', quantity: 2, effect: 'Reduz CA de captura em 2.' },
      { id: 'inv_g2', name: 'Kit de Primeiros Socorros', category: 'Equipamento', quantity: 1, effect: 'Materiais para Medicina.' },
      { id: 'inv_g3', name: 'Scanner de Frequência Silph', category: 'Tecnologia', quantity: 1, effect: 'Localiza sinais de rádio.' },
    ],
    pokedollars: 2100,
    relationships: 'Rivalidade respeitosa com a família; vê na Serena uma combatente de instinto admirável.',
    fears: 'Deixar de prever uma variável crítica e colocar sua equipe em risco grave.',
    openQuestions: 'Por que o laboratório de Cinnabar estava arquivando códigos com a inscrição "Mew"?',
    notes: 'Possui acesso remoto a artigos científicos da rede de laboratórios do Prof. Carvalho.',
  },
  {
    id: 'tr_douglas',
    campaignId: 'camp_kanto_beyond',
    ownerId: 'user_ash_mestre',
    ownerName: 'Mestre Ash',
    name: 'Douglas Ventura',
    age: 15,
    region: 'Kanto (Pallet)',
    concept: 'Jovem persistente que aprendeu a sobreviver nas matas antes de iniciar sua jornada.',
    goal: 'Aprender táticas de campo, forjar laços e encontrar seu próprio estilo como treinador.',
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&auto=format&fit=crop&q=80',
    origin: 'Sobrevivente',
    className: '', // Nível 1: SEM classe ainda! Desbloqueia no Nível 2
    trackName: '', // SEM trilha ainda
    level: 1,
    xp: 0,
    corpo: 'd8',
    mente: 'd6',
    presenca: 'd6',
    maxHp: 26, // 10 + 2*8 + 2*(1-1) = 26
    currentHp: 26,
    defense: 11, // 10 + reflexos d6(+1) = 11
    skills: {
      Combate: 'd4',
      Atletismo: 'd8',
      Pontaria: 'd4',
      Medicina: 'd4',
      Investigação: 'd4',
      Sobrevivência: 'd8',
      Influência: 'd4',
      'Trato Pokémon': 'd6',
      Conhecimento: 'd4',
      Percepção: 'd6',
      Tecnologia: 'd4',
      Coordenação: 'd6',
      Reflexos: 'd6',
      Estratégia: 'd4',
      Pesquisa: 'd4',
      Ofício: 'd6',
      Expressão: 'd4',
      Empatia: 'd4',
      Etiqueta: 'd4',
      Navegação: 'd6',
      Ladinagem: 'd4',
      Arte: 'd4',
      Comércio: 'd4',
      Furtividade: 'd6',
    },
    originAbility: {
      name: 'Abrigo Improvisado',
      desc: 'Com tempo e recursos naturais, constrói abrigo que protege contra intempéries e garante descanso seguro.',
    },
    classAbilities: [], // Vazio no nível 1 conforme regras do Manual!
    sharedAbilities: [],
    personalAbility: {
      name: 'Resiliência Rústica',
      desc: 'Uma vez por cena, ignora a primeira penalidade decorrente de terreno acidentado ou frio intenso.',
    },
    inventory: [
      { id: 'inv_d1', name: 'Poké Bola', category: 'Poké Bolas', quantity: 3, effect: 'Dispositivo padrão para captura.' },
      { id: 'inv_d2', name: 'Poção', category: 'Medicamentos', quantity: 2, effect: 'Recupera 1d6 + 2 PV.' },
      { id: 'inv_d3', name: 'Corda de Escalada', category: 'Equipamentos', quantity: 1, effect: 'Auxilia em testes de Atletismo em encostas.' },
    ],
    pokedollars: 800,
    relationships: 'Admira a precisão de Gary e busca aprender comandos de batalha com Serena.',
    fears: 'Ficar indefeso no escuro sem recursos básicos.',
    openQuestions: 'O que o espera para além da Rota 9?',
    notes: 'Iniciando sua jornada agora com determinação rústica.',
  },
];

export const SEED_NPCS: NPC[] = [
  {
    id: 'npc_helena_sato',
    campaignId: 'camp_kanto_beyond',
    name: 'Dra. Helena Sato',
    age: 38,
    roleOrTitle: 'Pesquisadora Desertora da Silph Co.',
    location: 'Sótão Seguro na Rota 5 (Subúrbio de Saffron)',
    appearance: 'Cabelos castanhos presos, jaleco desgastado sobre roupas civis e óculos de leitura.',
    personality: 'Cautelosa, extremamente inteligente, sob constante estado de alerta.',
    motivation: 'Proteger os dados de síntese genética de Mew contra a apropriação militar da Equipe Rocket.',
    relations: 'Colega de turma do Prof. Carvalho; desconfia de oficiais da Liga.',
    goals: 'Entregar o disco de dados criptografados para uma fonte segura antes de ser capturada.',
    secretNotes: 'Foi ela quem plantou o transmissor interceptado por Gary. Ela sabe a frequência de resposta de um clone inacabado.',
    isSecretRevealed: false,
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80',
    associatedPokemonIds: [],
    importance: 'Principal',
    createdAt: '2026-01-11T10:00:00Z',
  },
  {
    id: 'npc_travis_ranger',
    campaignId: 'camp_kanto_beyond',
    name: 'Tenente Travis',
    age: 42,
    roleOrTitle: 'Oficial da Guarda Florestal da Rota 9',
    location: 'Posto de Controle da Passagem Rochosa',
    appearance: 'Porte atlético, uniforme verde florestal com insígnia de serviço e chapéu de aba larga.',
    personality: 'Rígido nas normas, protetor da fauna, respeita treinadores que demonstram cuidado genuíno.',
    motivation: 'Manter a rota segura e evitar que turistas ou contrabandistas incomodem Pokémon em fúria.',
    relations: 'Conhece o Mestre Ash de relatos de campeonatos passados.',
    goals: 'Conter a matilha de Mankey sem ferir os espécimes e descobrir o que desestabilizou o bando.',
    secretNotes: 'Recebeu ordens veladas de um oficial superior para fingir que não viu caminhões da Silph passarem de madrugada.',
    isSecretRevealed: false,
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
    associatedPokemonIds: [],
    importance: 'Secundário',
    createdAt: '2026-01-15T08:30:00Z',
  },
  {
    id: 'npc_agente_vex',
    campaignId: 'camp_kanto_beyond',
    name: 'Comandante Vex',
    age: 31,
    roleOrTitle: 'Operador de Campo da Equipe Rocket',
    location: 'Canteiro da Usina Abandonada',
    appearance: 'Uniforme negro com "R" em relevo rubro, luvas reforçadas e olhar calculista.',
    personality: 'Frio, profissional e focado em metas operacionais sem sadismo teatral desnecessário.',
    motivation: 'Cumprir as diretrizes do Executivo Archer e restaurar a honra da divisão em Kanto.',
    relations: 'Considera jovens treinadores apenas obstáculos descartáveis.',
    goals: 'Instalar o ressonador harmônico no transformador principal da Usina.',
    secretNotes: 'Carrega um dispositivo de captura reforçado chamado "Giga Snag", protótipo roubado de Orre.',
    isSecretRevealed: false,
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&auto=format&fit=crop&q=80',
    associatedPokemonIds: [],
    importance: 'Antagonista',
    createdAt: '2026-01-20T17:00:00Z',
  },
];

export const SEED_INVENTORY: InventoryItem[] = [
  {
    id: 'inv_camp_1',
    campaignId: 'camp_kanto_beyond',
    ownerType: 'campaign',
    name: 'Superpoção de Emergência',
    category: 'Medicamentos',
    quantity: 4,
    weight: '0.5 kg',
    effect: 'Recupera 2d6 + 4 PV de um Pokémon ferido.',
    notes: 'Estoque médico compartilhado da equipe no acampamento.',
  },
  {
    id: 'inv_camp_2',
    campaignId: 'camp_kanto_beyond',
    ownerType: 'campaign',
    name: 'Grande Bola Silph Co.',
    category: 'Poké Bolas',
    quantity: 6,
    weight: '0.6 kg',
    effect: 'Dispositivo avançado de captura. Reduz a CA do teste de captura em 2.',
    notes: 'Fornecidas pelo laboratório de pesquisa.',
  },
  {
    id: 'inv_camp_3',
    campaignId: 'camp_kanto_beyond',
    ownerType: 'campaign',
    name: 'Kit de Primeiros Socorros de Campo',
    category: 'Ferramentas',
    quantity: 2,
    weight: '1.2 kg',
    effect: 'Materiais esterilizados para estancar ferimentos e estabilizar criaturas.',
    notes: 'Contém talas, gazes e pomada anti-queimadura.',
  },
  {
    id: 'inv_camp_4',
    campaignId: 'camp_kanto_beyond',
    ownerType: 'campaign',
    name: 'Antídoto Herbal',
    category: 'Medicamentos',
    quantity: 3,
    weight: '0.3 kg',
    effect: 'Cura imediatamente a condição Envenenado.',
  },
  {
    id: 'inv_camp_5',
    campaignId: 'camp_kanto_beyond',
    ownerType: 'campaign',
    name: 'Frequencímetro Magnético Portátil',
    category: 'Equipamentos',
    quantity: 1,
    weight: '0.8 kg',
    effect: 'Detecta ondas eletromagnéticas e anomalias de energia psíquica em até 500 metros.',
    notes: 'Encontrado por Gary no túnel abandonado.',
  },
];

const SEED_POKEMON: PokemonSheet[] = [
  {
    id: 'poke_braixen',
    campaignId: 'camp_kanto_beyond',
    trainerId: 'tr_serena',
    ownerId: 'user_serena',
    nickname: 'Braixen',
    species: 'Braixen',
    types: ['Fogo'],
    level: 3,
    xp: 7,
    pev: 1,
    evolutionsCount: 1, // 1st evolution from Fennekin
    spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/654.png',
    corpo: 'd6',
    instinto: 'd8',
    energia: 'd8',
    maxHp: 32, // 12 + 2*6 + 2*(3-1) + 4*1 = 12 + 12 + 4 + 4 = 32
    currentHp: 30,
    maxPe: 5, // 2 + ceil(3/2) + 1 = 2 + 2 + 1 = 5
    currentPe: 4,
    defense: 12, // 10 + Agilidade d8(+2) = 12
    skills: {
      'Ataque Físico': 'd4',
      'Ataque Especial': 'd8',
      Defesa: 'd6',
      Agilidade: 'd8',
      Percepção: 'd6',
      'Instinto de Batalha': 'd6',
      Precisão: 'd8',
      'Controle de Tipo': 'd8',
      Resistência: 'd6',
      Suporte: 'd6',
      Furtividade: 'd4',
      Sobrevivência: 'd4',
      Interação: 'd6',
      Coordenação: 'd8',
    },
    naturalTrait: {
      name: 'Afinidade Elemental',
      effect: 'Manipula faíscas sutis com o galho fora de combate para iluminar caminhos e criar efeitos visuais.',
    },
    personality: 'Elegante, protetora e extremamente expressiva quando em sincronia.',
    bondStage: 3, // Confiança (+2 ao reagir a sinal compartilhado)
    moves: [
      {
        id: 'mv_ember',
        name: 'Brasas (Ember)',
        type: 'Fogo',
        category: 'Especial',
        tier: 'Comum',
        damageDice: '1d6',
        peCost: 1,
        range: 'Perto',
        effect: 'Dispara rajadas de pequenas brasas. Pode aplicar Queimado se falhar em teste de resistência.',
        resistance: 'Corpo + Resistência CA 12',
      },
      {
        id: 'mv_psybeam',
        name: 'Raio Psíquico (Psybeam)',
        type: 'Psíquico',
        category: 'Especial',
        tier: 'Forte',
        damageDice: '1d8',
        peCost: 2,
        range: 'Médio',
        effect: 'Feixe psicodélico de energia. Alvo deve passar em resistência ou fica Confuso.',
        resistance: 'Instinto de Batalha CA 12',
      },
      {
        id: 'mv_fire_spin',
        name: 'Giro de Fogo (Fire Spin)',
        type: 'Fogo',
        category: 'Especial',
        tier: 'Comum',
        damageDice: '1d6',
        peCost: 1,
        range: 'Perto',
        effect: 'Cria vórtice de chamas ao redor do alvo, limitando seu deslocamento por 1 rodada.',
      },
      {
        id: 'mv_scratch',
        name: 'Arranhão (Scratch)',
        type: 'Normal',
        category: 'Físico',
        tier: 'Básico',
        damageDice: '1d4',
        peCost: 0,
        range: 'Corpo a corpo',
        effect: 'Golpe físico direto e sem consumo de energia.',
      },
    ],
    conditions: [],
    notes: 'Possui apego especial pelo galho na cauda; limpa-o após cada refeição.',
  },
  {
    id: 'poke_wartortle',
    campaignId: 'camp_kanto_beyond',
    trainerId: 'tr_gary',
    ownerId: 'user_gary',
    nickname: 'Wartortle',
    species: 'Wartortle',
    types: ['Água'],
    level: 3,
    xp: 7,
    pev: 1,
    evolutionsCount: 1,
    spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/8.png',
    corpo: 'd8',
    instinto: 'd6',
    energia: 'd8',
    maxHp: 36, // 12 + 2*8 + 2*(3-1) + 4 = 12 + 16 + 4 + 4 = 36
    currentHp: 36,
    maxPe: 5, // 2 + 2 + 1 = 5
    currentPe: 5,
    defense: 11, // 10 + Agilidade d6(+1) = 11
    skills: {
      'Ataque Físico': 'd6',
      'Ataque Especial': 'd8',
      Defesa: 'd8',
      Agilidade: 'd6',
      Percepção: 'd6',
      'Instinto de Batalha': 'd6',
      Precisão: 'd6',
      'Controle de Tipo': 'd8',
      Resistência: 'd8',
      Suporte: 'd6',
      Furtividade: 'd4',
      Sobrevivência: 'd6',
      Interação: 'd4',
      Coordenação: 'd6',
    },
    naturalTrait: {
      name: 'Carapaça Robusta',
      effect: 'Uma vez por cena, reduz em 2 um dano físico direto antecipado ao se recolher.',
    },
    personality: 'Disciplinado, firme e atento a ameaças táticas.',
    bondStage: 2, // Parceria
    moves: [
      {
        id: 'mv_watergun',
        name: 'Jato d’Água (Water Gun)',
        type: 'Água',
        category: 'Especial',
        tier: 'Comum',
        damageDice: '1d6',
        peCost: 1,
        range: 'Perto',
        effect: 'Disparo concentrado de água de alta pressão.',
      },
      {
        id: 'mv_bite',
        name: 'Mordida (Bite)',
        type: 'Sombrio',
        category: 'Físico',
        tier: 'Comum',
        damageDice: '1d6',
        peCost: 1,
        range: 'Corpo a corpo',
        effect: 'Mordida firme. Sucesso por 5+ pode aplicar Atordoado temporário no alvo.',
        resistance: 'Corpo + Resistência CA 11',
      },
      {
        id: 'mv_withdraw',
        name: 'Recolher (Withdraw)',
        type: 'Água',
        category: 'Suporte',
        tier: 'Comum',
        damageDice: '-',
        peCost: 1,
        range: 'Corpo a corpo',
        effect: 'Entra na carapaça concedendo +2 na Defesa até o início do próximo turno.',
      },
      {
        id: 'mv_tackle',
        name: 'Investida (Tackle)',
        type: 'Normal',
        category: 'Físico',
        tier: 'Básico',
        damageDice: '1d4',
        peCost: 0,
        range: 'Corpo a corpo',
        effect: 'Impacto direto sem gasto de PE.',
      },
    ],
    conditions: [],
    notes: 'Excelente nadador em correntezas fortes e águas profundas.',
  },
  {
    id: 'poke_pikachu',
    campaignId: 'camp_kanto_beyond',
    ownerId: 'user_ash_mestre',
    nickname: 'Pikachu Spark',
    species: 'Pikachu',
    types: ['Elétrico'],
    level: 4,
    xp: 11,
    pev: 0,
    evolutionsCount: 0,
    spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png',
    corpo: 'd6',
    instinto: 'd8',
    energia: 'd8',
    maxHp: 30, // 12 + 2*6 + 2*(4-1) = 12 + 12 + 6 = 30
    currentHp: 28,
    maxPe: 4, // 2 + ceil(4/2) = 4
    currentPe: 3,
    defense: 13, // 10 + Agilidade d10(+3) = 13
    skills: {
      'Ataque Físico': 'd6',
      'Ataque Especial': 'd8',
      Defesa: 'd4',
      Agilidade: 'd10',
      Percepção: 'd8',
      'Instinto de Batalha': 'd8',
      Precisão: 'd8',
      'Controle de Tipo': 'd8',
      Resistência: 'd6',
      Suporte: 'd4',
      Furtividade: 'd6',
      Sobrevivência: 'd6',
      Interação: 'd6',
      Coordenação: 'd8',
    },
    naturalTrait: {
      name: 'Pequeno e Ágil',
      effect: 'Atravessa aberturas estreitas e frestas inacessíveis a criaturas médias com agilidade máxima.',
    },
    personality: 'Corajoso, eletrizante e leal até o fim.',
    bondStage: 4, // Vínculo Profundo
    moves: [
      {
        id: 'mv_thunderbolt',
        name: 'Choque do Trovão (Thunderbolt)',
        type: 'Elétrico',
        category: 'Especial',
        tier: 'Forte',
        damageDice: '1d8',
        peCost: 2,
        range: 'Médio',
        effect: 'Raio violento concentrado. Falha em resistência aplica condição Paralisado.',
        resistance: 'Corpo + Resistência CA 12',
      },
      {
        id: 'mv_quick_attack',
        name: 'Ataque Rápido (Quick Attack)',
        type: 'Normal',
        category: 'Físico',
        tier: 'Comum',
        damageDice: '1d6',
        peCost: 1,
        range: 'Perto',
        effect: 'Desloca-se como um raio até o alvo e desfere golpe veloz.',
      },
      {
        id: 'mv_iron_tail',
        name: 'Cauda de Ferro (Iron Tail)',
        type: 'Aço',
        category: 'Físico',
        tier: 'Forte',
        damageDice: '1d8',
        peCost: 2,
        range: 'Corpo a corpo',
        effect: 'Endurece a cauda como metal pesado para desferir impacto demolidor.',
      },
      {
        id: 'mv_thunder_wave',
        name: 'Onda de Trovão (Thunder Wave)',
        type: 'Elétrico',
        category: 'Suporte',
        tier: 'Comum',
        damageDice: '-',
        peCost: 1,
        range: 'Perto',
        effect: 'Dispara fagulhas estáticas que impõem a condição Paralisado ao alvo.',
        resistance: 'Corpo + Resistência CA 12',
      },
    ],
    conditions: [],
    notes: 'Gera pequenas centelhas pelas bochechas vermelhas quando agitado.',
  },
];

const SEED_COMBAT_SESSIONS: CombatSession[] = [
  {
    id: 'combat_sample_r9',
    campaignId: 'camp_kanto_beyond',
    name: 'Batalha na Entrada da Rota 9 (Patrulha Rocket)',
    round: 1,
    currentTurnIndex: 0,
    isActive: true,
    environmentNotes: 'Trilha de cascalho com caixas elétricas e árvores baixas que concedem cobertura leve.',
    combatants: [
      {
        id: 'cbt_braixen',
        type: 'pokemon',
        sheetId: 'poke_braixen',
        trainerId: 'tr_serena',
        name: 'Braixen',
        avatarUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/654.png',
        initiative: 14,
        hasRolledInitiative: true,
        currentHp: 30,
        maxHp: 32,
        currentPe: 4,
        maxPe: 5,
        defense: 12,
        defensiveReactionUsedThisRound: false,
        mainActionUsed: false,
        movementUsed: false,
        reactionUsed: false,
        conditions: [],
        status: 'active',
        isEnemy: false,
      },
      {
        id: 'cbt_serena',
        type: 'trainer',
        sheetId: 'tr_serena',
        name: 'Serena Yvonne',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        initiative: 12,
        hasRolledInitiative: true,
        currentHp: 26,
        maxHp: 26,
        defense: 11,
        defensiveReactionUsedThisRound: false,
        mainActionUsed: false,
        movementUsed: false,
        reactionUsed: false,
        conditions: [],
        status: 'active',
        isEnemy: false,
      },
      {
        id: 'cbt_koffing',
        type: 'pokemon',
        sheetId: 'poke_enemy_koffing',
        name: 'Koffing Selvagem',
        avatarUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/109.png',
        initiative: 9,
        hasRolledInitiative: true,
        currentHp: 22,
        maxHp: 24,
        currentPe: 3,
        maxPe: 3,
        defense: 10,
        defensiveReactionUsedThisRound: false,
        mainActionUsed: false,
        movementUsed: false,
        reactionUsed: false,
        conditions: [],
        status: 'active',
        isEnemy: true,
      },
    ],
    actionLog: [
      {
        id: 'log_1',
        round: 1,
        timestamp: '11:45:00',
        message: 'Início do combate! A patrulha da Equipe Rocket bloqueia a passagem.',
        type: 'general',
      },
    ],
    createdAt: '2026-02-19T14:00:00Z',
  },
];

const SEED_SHOPS: Shop[] = [
  {
    id: 'shop_pewter_mart',
    campaignId: 'camp_kanto_beyond',
    name: 'Poké Mart de Pewter',
    cityOrRoute: 'Pewter City',
    description: 'Posto de suprimentos oficial credenciado pela Liga para treinadores que rumam ao Mt. Moon.',
    operatingHours: '07:00 às 22:00',
    items: [
      { itemId: 'item_poke_ball', name: 'Poké Bola', category: 'Dispositivos de Captura', price: 200, stock: 40 },
      { itemId: 'item_potion', name: 'Poção', category: 'Medicamentos e Recuperação', price: 300, stock: 25 },
      { itemId: 'item_antidote', name: 'Antídoto', category: 'Cura de Condições', price: 100, stock: 20 },
      { itemId: 'item_paralyze_heal', name: 'Antiparalisia', category: 'Cura de Condições', price: 100, stock: 15 },
      { itemId: 'item_rope_carabiner', name: 'Corda e mosquetão', category: 'Itens de Exploração', price: 180, stock: 5 },
      { itemId: 'item_flashlight', name: 'Lanterna', category: 'Itens de Exploração', price: 120, stock: 8 },
    ],
  },
  {
    id: 'shop_celadon_dept',
    campaignId: 'camp_kanto_beyond',
    name: 'Loja de Departamentos Celadon',
    cityOrRoute: 'Celadon City',
    description: 'O maior empório comercial de Kanto com 5 andares de equipamentos, pedras evolutivas e suprimentos avançados.',
    operatingHours: '09:00 às 21:00',
    items: [
      { itemId: 'item_great_ball', name: 'Grande Bola', category: 'Dispositivos de Captura', price: 600, stock: 50 },
      { itemId: 'item_ultra_ball', name: 'Ultra Bola', category: 'Dispositivos de Captura', price: 1200, stock: 30 },
      { itemId: 'item_super_potion', name: 'Superpoção', category: 'Medicamentos e Recuperação', price: 700, stock: 30 },
      { itemId: 'item_hyper_potion', name: 'Hiperpoção', category: 'Medicamentos e Recuperação', price: 1200, stock: 20 },
      { itemId: 'item_full_heal', name: 'Remédio Completo', category: 'Cura de Condições', price: 600, stock: 25 },
      { itemId: 'item_revive', name: 'Reviver', category: 'Medicamentos e Recuperação', price: 1500, stock: 10 },
      { itemId: 'item_fire_stone', name: 'Pedra do Fogo', category: 'Itens de Evolução', price: 3000, stock: 3 },
      { itemId: 'item_water_stone', name: 'Pedra da Água', category: 'Itens de Evolução', price: 3000, stock: 3 },
      { itemId: 'item_thunder_stone', name: 'Pedra do Trovão', category: 'Itens de Evolução', price: 3000, stock: 3 },
      { itemId: 'item_leaf_stone', name: 'Pedra da Folha', category: 'Itens de Evolução', price: 3000, stock: 3 },
      { itemId: 'item_strength_pill', name: 'Pílula de Força', category: 'Itens de Batalha', price: 500, stock: 15 },
    ],
  },
  {
    id: 'shop_sato_research',
    campaignId: 'camp_kanto_beyond',
    name: 'Bazar Científico da Dra. Helena Sato',
    cityOrRoute: 'Ilha de Cinnabar / Laboratório',
    description: 'Instrumentos especializados e protótipos fornecidos sob demanda pela equipe de pesquisa de genética.',
    npcOwnerId: 'npc_helena_sato',
    npcOwnerName: 'Dra. Helena Sato',
    operatingHours: 'Apenas sob agendamento com a pesquisadora',
    items: [
      { itemId: 'item_field_kit', name: 'Kit de campo', category: 'Itens de Exploração', price: 400, stock: 4 },
      { itemId: 'item_toolkit', name: 'Kit de ferramentas', category: 'Itens de Exploração', price: 350, stock: 6 },
      { itemId: 'item_first_aid_kit', name: 'Kit de primeiros socorros', category: 'Itens de Exploração', price: 250, stock: 8 },
      { itemId: 'item_ether', name: 'Ether', category: 'Recuperação de Energia', price: 800, stock: 5 },
    ],
  },
];

const SEED_QUESTS: Quest[] = [
  {
    id: 'quest_power_plant',
    campaignId: 'camp_kanto_beyond',
    title: 'Anomalia na Usina Abandonada',
    description: 'O fornecimento elétrico de Cerulean está oscilando devido a pulsos gerados no antigo reator abandonado da Rota 10.',
    objectives: [
      { id: 'q_obj_1', text: 'Chegar até o portão principal da Usina na Rota 10', completed: true },
      { id: 'q_obj_2', text: 'Conter o bando de Magnemite sobrecarregados na subestação', completed: false },
      { id: 'q_obj_3', text: 'Desativar o acumulador magnético clandestino da Equipe Rocket', completed: false, optional: true },
    ],
    involvedNpcIds: ['npc_helena_sato', 'npc_travis'],
    locations: ['Rota 10', 'Cerulean City'],
    rewards: {
      pokedollars: 1500,
      xp: 4,
      items: ['Grande Bola (x3)', 'Superpoção (x2)'],
      other: 'Reconhecimento oficial do Conselho de Cerulean',
    },
    deadline: 'Antes da próxima lua cheia',
    status: 'Em andamento',
    gmSecrets: 'A Rocket instalou um gerador secundário para atrair o lendário pássaro elétrico Zapdos.',
  },
  {
    id: 'quest_safari_mystery',
    campaignId: 'camp_kanto_beyond',
    title: 'O Enigma da Reserva de Fuchsia',
    description: 'Espécimes raros da Zona de Safari estão fugindo para os bambuzais da Rota 15 após cercas elétricas terem sido violadas.',
    objectives: [
      { id: 'q_obj_s1', text: 'Entrevistar o Guarda Florestal em Fuchsia', completed: false },
      { id: 'q_obj_s2', text: 'Rastrear pegadas de criatura de Grande Porte na Área 3', completed: false },
      { id: 'q_obj_s3', text: 'Capturar ou acalmar o espécime líder sem ferimentos graves', completed: false },
    ],
    involvedNpcIds: ['npc_travis'],
    locations: ['Fuchsia City', 'Zona de Safari'],
    rewards: {
      pokedollars: 2000,
      xp: 5,
      items: ['Safari Ball (x10)', 'Kit de campo'],
    },
    status: 'Disponível',
  },
];

const SEED_ENCOUNTERS: EncounterTable[] = [
  {
    id: 'enc_route_1',
    campaignId: 'camp_kanto_beyond',
    name: 'Tabela de Encontros — Rota 1',
    region: 'Kanto Ocidental',
    routeOrArea: 'Rota 1 (Trilha entre Pallet e Viridian)',
    habitat: 'Planície e gramado baixo',
    biome: 'Campestre',
    timeOfDay: 'Qualquer',
    weather: 'Claro',
    season: 'Qualquer',
    entries: [
      { id: 'ee_1', speciesName: 'Pidgey', dexNumber: 16, types: ['Normal', 'Voador'], minLevel: 2, maxLevel: 4, rarity: 'Comum', weight: 45, behavior: 'Pacífico', notes: 'Bica sementes na margem da cerca viva.' },
      { id: 'ee_2', speciesName: 'Rattata', dexNumber: 19, types: ['Normal'], minLevel: 2, maxLevel: 4, rarity: 'Comum', weight: 40, behavior: 'Arisco', notes: 'Foge ao menor ruído de passos pesados.' },
      { id: 'ee_3', speciesName: 'Bellsprout', dexNumber: 69, types: ['Grama', 'Veneno'], minLevel: 3, maxLevel: 5, rarity: 'Incomum', weight: 15, behavior: 'Curioso', notes: 'Camufla-se como flor amarela.' },
    ],
    gmSecretNotes: 'Ao entardecer, pequenos bandos de Spearow podem passar em rota migratória agressiva.',
  },
  {
    id: 'enc_viridian_forest',
    campaignId: 'camp_kanto_beyond',
    name: 'Tabela de Encontros — Floresta de Viridian',
    region: 'Kanto Central',
    routeOrArea: 'Floresta de Viridian',
    habitat: 'Bosque úmido e copas densas',
    biome: 'Floresta',
    timeOfDay: 'Qualquer',
    weather: 'Névoa',
    season: 'Qualquer',
    entries: [
      { id: 'ee_f1', speciesName: 'Caterpie', dexNumber: 10, types: ['Inseto'], minLevel: 3, maxLevel: 5, rarity: 'Comum', weight: 35, behavior: 'Pacífico' },
      { id: 'ee_f2', speciesName: 'Weedle', dexNumber: 13, types: ['Inseto', 'Veneno'], minLevel: 3, maxLevel: 5, rarity: 'Comum', weight: 35, behavior: 'Territorial' },
      { id: 'ee_f3', speciesName: 'Pidgeotto', dexNumber: 17, types: ['Normal', 'Voador'], minLevel: 7, maxLevel: 9, rarity: 'Incomum', weight: 20, behavior: 'Territorial' },
      { id: 'ee_f4', speciesName: 'Pikachu', dexNumber: 25, types: ['Elétrico'], minLevel: 4, maxLevel: 6, rarity: 'Raro', weight: 10, behavior: 'Curioso', notes: 'Descarrega estática em ramos de árvores.' },
    ],
  },
];

const SEED_GM_RESOURCES: GmResource[] = [
  {
    id: 'gmr_capture_difficulty',
    campaignId: 'camp_kanto_beyond',
    title: 'Tabela Prática de CA de Captura',
    category: 'Regras da Casa',
    content: `Fórmula Oficial do Manual de Campo:
- CA Base de Captura: 10
- Pokémon com mais de 50% dos PV: +4 na CA
- Pokémon com 50% ou menos de PV: sem modificador
- Pokémon com 1/4 dos PV ou menos: -2 na CA
- Condição ativa (Sono, Paralisado, etc.): -2 na CA
- Modificadores de Poké Bola:
  * Poké Bola: 0
  * Grande Bola: -2
  * Ultra Bola: -4`,
    tags: ['Captura', 'Regras', 'Mecânica'],
    isPinned: true,
    updatedAt: '2026-02-18T10:00:00Z',
  },
  {
    id: 'gmr_rocket_dialogues',
    campaignId: 'camp_kanto_beyond',
    title: 'Ganchos de Interpretação da Equipe Rocket',
    category: 'Descrições',
    content: `Tons de voz e atitudes dos agentes:
- Soldados rasos: arrogantes, usam gírias de rua, dependem de táticas numéricas (2 contra 1).
- Oficiais de campo (ex: Travis): pragmáticos, cumprem ordens com precisão militar.
- Cientistas (Silph corruptos): frios, encaram Pokémon como ativos bioenergéticos mensuráveis.`,
    tags: ['Antagonistas', 'Rocket', 'Interpretação'],
    isPinned: false,
    updatedAt: '2026-02-19T14:30:00Z',
  },
];

class StorageService {
  private users: User[] = [];
  private currentUser: User | null = null;
  private campaigns: Campaign[] = [];
  private trainers: TrainerSheet[] = [];
  private pokemons: PokemonSheet[] = [];
  private rolls: DiceRollResult[] = [];
  private customSpecies: PokedexSpecies[] = [];
  private combatSessions: CombatSession[] = [];
  private npcs: NPC[] = [];
  private customMoves: LibraryMove[] = [];
  private inventoryItems: InventoryItem[] = [];
  private officialItems: OfficialItem[] = [];
  private customItems: OfficialItem[] = [];
  private shops: Shop[] = [];
  private transactions: WalletTransaction[] = [];
  private conditions: BattleCondition[] = [];
  private quests: Quest[] = [];
  private locations: AtlasLocation[] = [];
  private gyms: GymBadge[] = [];
  private encounterTables: EncounterTable[] = [];
  private pokemonDiaries: Record<string, PokemonDiaryEntry[]> = {};
  private campaignPokedex: Record<string, Record<number, CampaignPokedexEntry>> = {};
  private gmResources: GmResource[] = [];
  private pokeApiMovesCache: LibraryMove[] = [];
  private factions: Faction[] = [];
  private relationships: RelationshipConnection[] = [];
  private mysteries: Mystery[] = [];
  private worldEvents: WorldEvent[] = [];
  private newsRumors: NewsRumor[] = [];
  private tournaments: Tournament[] = [];
  private reputations: ReputationRecord[] = [];
  private rivalries: RivalryRecord[] = [];
  private prepScenes: PrepScene[] = [];
  private narrativePending: NarrativePendingItem[] = [];
  private vttMaps: VTTMap[] = [];
  private campaignFiles: CampaignFileReference[] = [];

  private saveStatus: SaveStatus = 'idle';
  private saveListeners: ((status: SaveStatus) => void)[] = [];
  private saveTimer: any = null;

  constructor() {
    this.init();
  }

  public getSaveStatus(): SaveStatus {
    return this.saveStatus;
  }

  public subscribeSaveStatus(listener: (status: SaveStatus) => void): () => void {
    this.saveListeners.push(listener);
    listener(this.saveStatus);
    return () => {
      this.saveListeners = this.saveListeners.filter((l) => l !== listener);
    };
  }

  private notifySave(status: SaveStatus) {
    this.saveStatus = status;
    this.saveListeners.forEach((fn) => {
      try {
        fn(status);
      } catch (err) {
        // Safe listener trigger
      }
    });

    if (status === 'saved') {
      if (this.saveTimer) clearTimeout(this.saveTimer);
      this.saveTimer = setTimeout(() => {
        this.saveStatus = 'idle';
        this.saveListeners.forEach((fn) => {
          try {
            fn('idle');
          } catch (err) {
            // Safe listener trigger
          }
        });
      }, 2500);
    }
  }

  // --- Draft Recovery System ---
  public saveDraft(key: string, data: any): void {
    try {
      localStorage.setItem(
        STORAGE_KEYS.DRAFTS_PREFIX + key,
        JSON.stringify({ savedAt: new Date().toISOString(), data })
      );
    } catch (e) {
      console.warn('Draft save error', e);
    }
  }

  public getDraft<T>(key: string): { savedAt: string; data: T } | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.DRAFTS_PREFIX + key);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  public clearDraft(key: string): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.DRAFTS_PREFIX + key);
    } catch (e) {
      // ignore
    }
  }

  private init() {
    try {
      const storedUsers = localStorage.getItem(STORAGE_KEYS.USERS);
      if (storedUsers) {
        this.users = JSON.parse(storedUsers);
      } else {
        this.users = [...SEED_USERS];
        this.saveUsers();
      }

      const storedCurrent = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      if (storedCurrent) {
        this.currentUser = JSON.parse(storedCurrent);
      } else {
        // Default to Mestre Ash for quick preview
        this.currentUser = this.users[0] || null;
        if (this.currentUser) {
          localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(this.currentUser));
        }
      }

      const storedCampaigns = localStorage.getItem(STORAGE_KEYS.CAMPAIGNS);
      if (storedCampaigns) {
        this.campaigns = JSON.parse(storedCampaigns).map((c: Campaign) => ({
          ...c,
          isSample: c.id === 'camp_kanto_beyond' ? true : !!c.isSample,
        }));
      } else {
        this.campaigns = [...SEED_CAMPAIGNS];
        this.saveCampaigns();
      }

      const storedTrainers = localStorage.getItem(STORAGE_KEYS.TRAINERS);
      if (storedTrainers) {
        this.trainers = JSON.parse(storedTrainers);
        // Ensure Douglas Ventura is available if missing from previous cache
        if (!this.trainers.some((t) => t.id === 'tr_douglas')) {
          const seedDouglas = SEED_TRAINERS.find((t) => t.id === 'tr_douglas');
          if (seedDouglas) {
            this.trainers.push(seedDouglas);
            this.saveTrainers();
          }
        }
      } else {
        this.trainers = [...SEED_TRAINERS];
        this.saveTrainers();
      }

      const storedPokemon = localStorage.getItem(STORAGE_KEYS.POKEMON);
      if (storedPokemon) {
        this.pokemons = JSON.parse(storedPokemon);
      } else {
        this.pokemons = [...SEED_POKEMON];
        this.savePokemons();
      }

      const storedNpcs = localStorage.getItem(STORAGE_KEYS.NPCS);
      if (storedNpcs) {
        this.npcs = JSON.parse(storedNpcs);
      } else {
        this.npcs = [...SEED_NPCS];
        this.saveNpcs();
      }

      const storedCustomMoves = localStorage.getItem(STORAGE_KEYS.CUSTOM_MOVES);
      if (storedCustomMoves) {
        this.customMoves = JSON.parse(storedCustomMoves);
      } else {
        this.customMoves = [];
        this.saveCustomMoves();
      }

      const storedInventory = localStorage.getItem(STORAGE_KEYS.INVENTORY);
      if (storedInventory) {
        this.inventoryItems = JSON.parse(storedInventory);
      } else {
        this.inventoryItems = [...SEED_INVENTORY];
        this.saveInventory();
      }

      const storedRolls = localStorage.getItem(STORAGE_KEYS.ROLL_HISTORY);
      if (storedRolls) {
        this.rolls = JSON.parse(storedRolls);
      }

      const storedCustomSpecies = localStorage.getItem(STORAGE_KEYS.POKEDEX_SPECIES);
      if (storedCustomSpecies) {
        this.customSpecies = JSON.parse(storedCustomSpecies);
      } else {
        this.customSpecies = [];
      }

      const storedCombat = localStorage.getItem(STORAGE_KEYS.COMBAT_SESSIONS);
      if (storedCombat) {
        this.combatSessions = JSON.parse(storedCombat);
      } else {
        this.combatSessions = [...SEED_COMBAT_SESSIONS];
        this.saveCombatSessions();
      }

      // Official & Custom Items
      const storedCustomItems = localStorage.getItem(STORAGE_KEYS.CUSTOM_ITEMS);
      this.customItems = storedCustomItems ? JSON.parse(storedCustomItems) : [];
      this.officialItems = [...OFFICIAL_ITEMS_CATALOG];

      // Shops
      const storedShops = localStorage.getItem(STORAGE_KEYS.SHOPS);
      if (storedShops) {
        this.shops = JSON.parse(storedShops);
      } else {
        this.shops = [...SEED_SHOPS];
        this.saveShops();
      }

      // Wallet Transactions
      const storedTxs = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      this.transactions = storedTxs ? JSON.parse(storedTxs) : [];

      // Battle Conditions
      this.conditions = [...SYSTEM_CONDITIONS];

      // Quests
      const storedQuests = localStorage.getItem(STORAGE_KEYS.QUESTS);
      if (storedQuests) {
        this.quests = JSON.parse(storedQuests);
      } else {
        this.quests = [...SEED_QUESTS];
        this.saveQuests();
      }

      // Atlas Locations
      const storedLocations = localStorage.getItem(STORAGE_KEYS.LOCATIONS);
      if (storedLocations) {
        this.locations = JSON.parse(storedLocations);
      } else {
        this.locations = [...OFFICIAL_KANTO_LOCATIONS];
        this.saveLocations();
      }

      // Gyms & Competitions
      const storedGyms = localStorage.getItem(STORAGE_KEYS.GYMS);
      if (storedGyms) {
        this.gyms = JSON.parse(storedGyms);
      } else {
        this.gyms = [...OFFICIAL_KANTO_GYMS];
        this.saveGyms();
      }

      // Encounter Tables
      const storedEncounters = localStorage.getItem(STORAGE_KEYS.ENCOUNTER_TABLES);
      if (storedEncounters) {
        this.encounterTables = JSON.parse(storedEncounters);
      } else {
        this.encounterTables = [...SEED_ENCOUNTERS];
        this.saveEncounterTables();
      }

      // Diaries & Campaign Pokedex
      const storedDiaries = localStorage.getItem(STORAGE_KEYS.POKEMON_DIARIES);
      this.pokemonDiaries = storedDiaries ? JSON.parse(storedDiaries) : {};

      const storedCampDex = localStorage.getItem(STORAGE_KEYS.CAMPAIGN_POKEDEX);
      this.campaignPokedex = storedCampDex ? JSON.parse(storedCampDex) : {};

      // GM Resources
      const storedGmResources = localStorage.getItem(STORAGE_KEYS.GM_RESOURCES);
      if (storedGmResources) {
        this.gmResources = JSON.parse(storedGmResources);
      } else {
        this.gmResources = [...SEED_GM_RESOURCES];
        this.saveGmResources();
      }

      // PokéAPI Moves Cache
      const storedPokeMoves = localStorage.getItem(STORAGE_KEYS.POKEAPI_MOVES_CACHE);
      this.pokeApiMovesCache = storedPokeMoves ? JSON.parse(storedPokeMoves) : [];

      // Factions & Organizations
      const storedFactions = localStorage.getItem(STORAGE_KEYS.FACTIONS);
      this.factions = storedFactions ? JSON.parse(storedFactions) : [...SEED_FACTIONS];

      // Relationships Graph
      const storedRelations = localStorage.getItem(STORAGE_KEYS.RELATIONSHIPS);
      this.relationships = storedRelations ? JSON.parse(storedRelations) : [...SEED_RELATIONSHIPS];

      // Mysteries & Clues
      const storedMysteries = localStorage.getItem(STORAGE_KEYS.MYSTERIES);
      this.mysteries = storedMysteries ? JSON.parse(storedMysteries) : [...SEED_MYSTERIES];

      // World Events
      const storedEvents = localStorage.getItem(STORAGE_KEYS.WORLD_EVENTS);
      this.worldEvents = storedEvents ? JSON.parse(storedEvents) : [...SEED_WORLD_EVENTS];

      // News & Rumors
      const storedNews = localStorage.getItem(STORAGE_KEYS.NEWS_RUMORS);
      this.newsRumors = storedNews ? JSON.parse(storedNews) : [...SEED_NEWS_RUMORS];

      // Tournaments
      const storedTournaments = localStorage.getItem(STORAGE_KEYS.TOURNAMENTS);
      this.tournaments = storedTournaments ? JSON.parse(storedTournaments) : [...SEED_TOURNAMENTS];

      // Reputations & Rivalries
      const storedReputations = localStorage.getItem(STORAGE_KEYS.REPUTATIONS);
      this.reputations = storedReputations ? JSON.parse(storedReputations) : [];
      const storedRivalries = localStorage.getItem(STORAGE_KEYS.RIVALRIES);
      this.rivalries = storedRivalries ? JSON.parse(storedRivalries) : [...SEED_RIVALRIES];

      // Prep Scenes & Narrative Pending
      const storedPrepScenes = localStorage.getItem(STORAGE_KEYS.PREP_SCENES);
      this.prepScenes = storedPrepScenes ? JSON.parse(storedPrepScenes) : [...SEED_PREP_SCENES];
      const storedNarrative = localStorage.getItem(STORAGE_KEYS.NARRATIVE_PENDING);
      this.narrativePending = storedNarrative ? JSON.parse(storedNarrative) : [...SEED_NARRATIVE_PENDING];

      // VTT Maps
      const storedVtt = localStorage.getItem(STORAGE_KEYS.VTT_MAPS);
      this.vttMaps = storedVtt ? JSON.parse(storedVtt) : [...SEED_VTT_MAPS];

      // Campaign Files
      const storedFiles = localStorage.getItem(STORAGE_KEYS.CAMPAIGN_FILES);
      this.campaignFiles = storedFiles ? JSON.parse(storedFiles) : [...SEED_CAMPAIGN_FILES];
    } catch (e) {
      console.warn('Storage initialization fallback:', e);
      this.users = [...SEED_USERS];
      this.currentUser = this.users[0];
      this.campaigns = [...SEED_CAMPAIGNS];
      this.trainers = [...SEED_TRAINERS];
      this.pokemons = [...SEED_POKEMON];
      this.npcs = [...SEED_NPCS];
      this.customMoves = [];
      this.inventoryItems = [...SEED_INVENTORY];
      this.customSpecies = [];
      this.combatSessions = [...SEED_COMBAT_SESSIONS];
      this.customItems = [];
      this.officialItems = [...OFFICIAL_ITEMS_CATALOG];
      this.shops = [...SEED_SHOPS];
      this.transactions = [];
      this.conditions = [...SYSTEM_CONDITIONS];
      this.quests = [...SEED_QUESTS];
      this.locations = [...OFFICIAL_KANTO_LOCATIONS];
      this.gyms = [...OFFICIAL_KANTO_GYMS];
      this.encounterTables = [...SEED_ENCOUNTERS];
      this.pokemonDiaries = {};
      this.campaignPokedex = {};
      this.gmResources = [...SEED_GM_RESOURCES];
      this.pokeApiMovesCache = [];
    }
  }

  // --- Users & Auth ---
  public getUsers(): User[] {
    return [...this.users];
  }

  public getCurrentUser(): User | null {
    return this.currentUser;
  }

  public setCurrentUser(user: User | null): void {
    this.currentUser = user;
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  }

  public register(name: string, email: string, avatar?: string): User {
    const existing = this.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      throw new Error('Já existe um usuário cadastrado com este e-mail.');
    }
    const newUser: User = {
      id: 'usr_' + Date.now().toString(36),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      avatar: avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`,
      createdAt: new Date().toISOString(),
      role: 'user',
    };
    this.users.push(newUser);
    this.saveUsers();
    this.setCurrentUser(newUser);
    return newUser;
  }

  public login(email: string): User {
    const found = this.users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    if (!found) {
      throw new Error('E-mail não encontrado. Verifique os dados ou cadastre-se.');
    }
    this.setCurrentUser(found);
    return found;
  }

  public logout(): void {
    this.setCurrentUser(null);
  }

  public updateUserProfile(updated: Partial<User> & { id: string }): User {
    const index = this.users.findIndex((u) => u.id === updated.id);
    if (index === -1) throw new Error('Usuário não encontrado.');
    this.users[index] = { ...this.users[index], ...updated };
    this.saveUsers();
    if (this.currentUser && this.currentUser.id === updated.id) {
      this.setCurrentUser(this.users[index]);
    }
    return this.users[index];
  }

  private saveUsers(): void {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(this.users));
  }

  // --- Campaigns ---
  public getCampaigns(): Campaign[] {
    return [...this.campaigns];
  }

  public getCampaign(id: string): Campaign | undefined {
    return this.campaigns.find((c) => c.id === id);
  }

  public createCampaign(data: {
    name: string;
    description: string;
    coverImage?: string;
    region?: string;
    tone?: string;
    houseRules?: string;
    campaignAgreements?: string;
  }): Campaign {
    if (!this.currentUser) throw new Error('É necessário estar conectado.');

    const randomCode = 'MEW-' + Math.random().toString(36).substring(2, 6).toUpperCase();
    const newCamp: Campaign = {
      id: 'camp_' + Date.now().toString(36),
      code: randomCode,
      name: data.name.trim(),
      isSample: false,
      description: data.description.trim(),
      coverImage: data.coverImage || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&auto=format&fit=crop&q=80',
      gmId: this.currentUser.id,
      gmName: this.currentUser.name,
      players: [
        {
          userId: this.currentUser.id,
          userName: this.currentUser.name,
          userEmail: this.currentUser.email,
          userAvatar: this.currentUser.avatar,
          role: 'gm',
          joinedAt: new Date().toISOString(),
        },
      ],
      clocks: [],
      sessions: [],
      publicInfo: {
        region: data.region || 'Região Inexplorada',
        tone: data.tone || 'Aventura clássica com desafios táticos e mistério.',
        houseRules: data.houseRules || 'Regras oficiais de Além da Próxima Rota Edição 1.0.',
        campaignAgreements: data.campaignAgreements || 'Acordos definidos em sessão zero.',
      },
      secretNotes: 'Anotações confidenciais do Mestre...',
      createdAt: new Date().toISOString(),
    };

    this.campaigns.unshift(newCamp);
    this.saveCampaigns();
    return newCamp;
  }

  public updateCampaign(updated: Campaign): void {
    const idx = this.campaigns.findIndex((c) => c.id === updated.id);
    if (idx !== -1) {
      this.campaigns[idx] = updated;
      this.saveCampaigns();
    }
  }

  public deleteCampaign(id: string, unlinkSheets: boolean = true): void {
    if (unlinkSheets) {
      this.trainers = this.trainers.map((t) => (t.campaignId === id ? { ...t, campaignId: '' } : t));
      this.saveTrainers();
      this.pokemons = this.pokemons.map((p) => (p.campaignId === id ? { ...p, campaignId: '' } : p));
      this.savePokemons();
    }
    this.campaigns = this.campaigns.filter((c) => c.id !== id);
    this.saveCampaigns();
  }

  public joinCampaignByCode(code: string): Campaign {
    if (!this.currentUser) throw new Error('É necessário estar conectado.');
    const trimmed = code.trim().toUpperCase();
    const camp = this.campaigns.find((c) => c.code.toUpperCase() === trimmed);
    if (!camp) throw new Error('Nenhuma campanha encontrada com o código informado.');

    const isMember = camp.players.some((p) => p.userId === this.currentUser!.id);
    if (!isMember) {
      camp.players.push({
        userId: this.currentUser.id,
        userName: this.currentUser.name,
        userEmail: this.currentUser.email,
        userAvatar: this.currentUser.avatar,
        role: 'player',
        joinedAt: new Date().toISOString(),
      });
      this.updateCampaign(camp);
    }
    return camp;
  }

  public removePlayer(campaignId: string, userId: string): void {
    const camp = this.getCampaign(campaignId);
    if (!camp) return;
    if (camp.gmId === userId) throw new Error('Não é possível remover o Mestre principal da campanha.');
    camp.players = camp.players.filter((p) => p.userId !== userId);
    this.updateCampaign(camp);
  }

  public updatePlayerRole(campaignId: string, userId: string, newRole: 'gm' | 'co-gm' | 'player'): void {
    const camp = this.getCampaign(campaignId);
    if (!camp) return;
    const player = camp.players.find((p) => p.userId === userId);
    if (player) {
      player.role = newRole;
      this.updateCampaign(camp);
    }
  }

  private saveCampaigns(): void {
    try {
      this.notifySave('saving');
      localStorage.setItem(STORAGE_KEYS.CAMPAIGNS, JSON.stringify(this.campaigns));
      this.notifySave('saved');
    } catch (e) {
      console.error(e);
      this.notifySave('error');
    }
  }

  // --- World Clocks ---
  public addClock(campaignId: string, clockData: Omit<WorldClock, 'id' | 'campaignId'>): WorldClock {
    const camp = this.getCampaign(campaignId);
    if (!camp) throw new Error('Campanha não encontrada.');
    const newClock: WorldClock = {
      ...clockData,
      id: 'clk_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5),
      campaignId,
    };
    camp.clocks.push(newClock);
    this.updateCampaign(camp);
    return newClock;
  }

  public updateClock(campaignId: string, updatedClock: WorldClock): void {
    const camp = this.getCampaign(campaignId);
    if (!camp) return;
    const idx = camp.clocks.findIndex((c) => c.id === updatedClock.id);
    if (idx !== -1) {
      camp.clocks[idx] = updatedClock;
      this.updateCampaign(camp);
    }
  }

  public deleteClock(campaignId: string, clockId: string): void {
    const camp = this.getCampaign(campaignId);
    if (!camp) return;
    camp.clocks = camp.clocks.filter((c) => c.id !== clockId);
    this.updateCampaign(camp);
  }

  // --- Sessions ---
  public addSession(campaignId: string, sessionData: Omit<SessionRecord, 'id' | 'campaignId'>): SessionRecord {
    const camp = this.getCampaign(campaignId);
    if (!camp) throw new Error('Campanha não encontrada.');
    const newSession: SessionRecord = {
      ...sessionData,
      id: 'sess_' + Date.now().toString(36),
      campaignId,
    };
    camp.sessions.unshift(newSession);
    this.updateCampaign(camp);
    return newSession;
  }

  public updateSession(campaignId: string, updatedSession: SessionRecord): void {
    const camp = this.getCampaign(campaignId);
    if (!camp) return;
    const idx = camp.sessions.findIndex((s) => s.id === updatedSession.id);
    if (idx !== -1) {
      camp.sessions[idx] = updatedSession;
      this.updateCampaign(camp);
    }
  }

  public deleteSession(campaignId: string, sessionId: string): void {
    const camp = this.getCampaign(campaignId);
    if (!camp) return;
    camp.sessions = camp.sessions.filter((s) => s.id !== sessionId);
    this.updateCampaign(camp);
  }

  // --- Trainers ---
  public getTrainers(campaignId?: string): TrainerSheet[] {
    if (campaignId) {
      return this.trainers.filter((t) => t.campaignId === campaignId);
    }
    return [...this.trainers];
  }

  public getTrainer(id: string): TrainerSheet | undefined {
    return this.trainers.find((t) => t.id === id);
  }

  public saveTrainer(sheet: TrainerSheet): TrainerSheet {
    const idx = this.trainers.findIndex((t) => t.id === sheet.id);
    if (idx !== -1) {
      this.trainers[idx] = sheet;
    } else {
      this.trainers.push(sheet);
    }
    this.saveTrainers();
    return sheet;
  }

  public deleteTrainer(id: string, unlinkPokemon: boolean = true): void {
    if (unlinkPokemon) {
      // Unlink all pokemon belonging to this trainer so they become wild/unassigned without being silently lost
      this.pokemons = this.pokemons.map((p) => {
        if (p.trainerId === id) {
          return { ...p, trainerId: undefined };
        }
        return p;
      });
      this.savePokemons();
    }
    this.trainers = this.trainers.filter((t) => t.id !== id);
    this.saveTrainers();
  }

  private saveTrainers(): void {
    try {
      this.notifySave('saving');
      localStorage.setItem(STORAGE_KEYS.TRAINERS, JSON.stringify(this.trainers));
      this.notifySave('saved');
    } catch (e) {
      console.error(e);
      this.notifySave('error');
    }
  }

  // --- Pokémon ---
  public getPokemons(campaignId?: string, trainerId?: string): PokemonSheet[] {
    let list = this.pokemons;
    if (campaignId) {
      list = list.filter((p) => p.campaignId === campaignId);
    }
    if (trainerId) {
      list = list.filter((p) => p.trainerId === trainerId);
    }
    return [...list];
  }

  public getPokemon(id: string): PokemonSheet | undefined {
    return this.pokemons.find((p) => p.id === id);
  }

  public savePokemon(sheet: PokemonSheet): PokemonSheet {
    const idx = this.pokemons.findIndex((p) => p.id === sheet.id);
    if (idx !== -1) {
      this.pokemons[idx] = sheet;
    } else {
      this.pokemons.push(sheet);
    }
    this.savePokemons();
    return sheet;
  }

  public deletePokemon(id: string): void {
    this.pokemons = this.pokemons.filter((p) => p.id !== id);
    this.savePokemons();
  }

  private savePokemons(): void {
    try {
      this.notifySave('saving');
      localStorage.setItem(STORAGE_KEYS.POKEMON, JSON.stringify(this.pokemons));
      this.notifySave('saved');
    } catch (e) {
      console.error(e);
      this.notifySave('error');
    }
  }

  // --- Rolls History ---
  public getRolls(): DiceRollResult[] {
    return [...this.rolls];
  }

  public addRoll(roll: Omit<DiceRollResult, 'id' | 'timestamp'>): DiceRollResult {
    const newRoll: DiceRollResult = {
      ...roll,
      id: 'roll_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5),
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };
    this.rolls.unshift(newRoll);
    if (this.rolls.length > 50) this.rolls.pop();
    localStorage.setItem(STORAGE_KEYS.ROLL_HISTORY, JSON.stringify(this.rolls));
    return newRoll;
  }

  public clearRolls(): void {
    this.rolls = [];
    localStorage.removeItem(STORAGE_KEYS.ROLL_HISTORY);
  }

  // --- Pokédex Compendium & Custom Species ---
  public getPokedexSpecies(): PokedexSpecies[] {
    const customMap = new Map(this.customSpecies.map((s) => [s.dexNumber, s]));
    const seenDex = new Set<number>();
    const list: PokedexSpecies[] = [];

    // Prioritize custom species first
    for (const custom of this.customSpecies) {
      list.push(custom);
      seenDex.add(custom.dexNumber);
    }

    // Add base species if not already added
    for (const base of POKEDEX_SPECIES) {
      if (!seenDex.has(base.dexNumber)) {
        list.push(base);
        seenDex.add(base.dexNumber);
      }
    }

    return list.sort((a, b) => a.dexNumber - b.dexNumber);
  }

  public getPokedexSpeciesById(id: string): PokedexSpecies | undefined {
    return this.customSpecies.find((s) => s.id === id) || POKEDEX_SPECIES.find((s) => s.id === id);
  }

  public savePokedexSpecies(species: PokedexSpecies): PokedexSpecies {
    const idx = this.customSpecies.findIndex((s) => s.id === species.id);
    if (idx !== -1) {
      this.customSpecies[idx] = species;
    } else {
      this.customSpecies.push(species);
    }
    this.saveCustomSpecies();
    return species;
  }

  public deletePokedexSpecies(id: string): void {
    this.customSpecies = this.customSpecies.filter((s) => s.id !== id);
    this.saveCustomSpecies();
  }

  private saveCustomSpecies(): void {
    localStorage.setItem(STORAGE_KEYS.POKEDEX_SPECIES, JSON.stringify(this.customSpecies));
  }

  // --- Trainer & Pokémon Linking ---
  public assignPokemonToTrainer(pokemonId: string, trainerId?: string): PokemonSheet | undefined {
    const poke = this.getPokemon(pokemonId);
    if (!poke) return undefined;
    poke.trainerId = trainerId || undefined;
    this.savePokemon(poke);
    return poke;
  }

  public getTrainerPokemons(trainerId: string): PokemonSheet[] {
    return this.pokemons.filter((p) => p.trainerId === trainerId);
  }

  // --- Combat Sessions ---
  public getCombatSessions(campaignId?: string): CombatSession[] {
    if (campaignId) {
      return this.combatSessions.filter((s) => s.campaignId === campaignId);
    }
    return [...this.combatSessions];
  }

  public getCombatSession(id: string): CombatSession | undefined {
    return this.combatSessions.find((s) => s.id === id);
  }

  public createCombatSession(data: {
    name: string;
    campaignId?: string;
    environmentNotes?: string;
    combatants: Combatant[];
  }): CombatSession {
    const newSession: CombatSession = {
      id: 'cbt_sess_' + Date.now().toString(36),
      name: data.name.trim() || 'Encontro de Combate',
      campaignId: data.campaignId,
      round: 1,
      currentTurnIndex: 0,
      isActive: true,
      environmentNotes: data.environmentNotes || '',
      combatants: data.combatants,
      actionLog: [
        {
          id: 'log_' + Date.now().toString(36),
          round: 1,
          timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          message: `Início do combate: "${data.name.trim() || 'Novo Encontro'}". Role iniciativa para os combatentes.`,
          type: 'general',
        },
      ],
      createdAt: new Date().toISOString(),
    };

    this.combatSessions.unshift(newSession);
    this.saveCombatSessions();
    return newSession;
  }

  public updateCombatSession(updated: CombatSession): void {
    const idx = this.combatSessions.findIndex((s) => s.id === updated.id);
    if (idx !== -1) {
      this.combatSessions[idx] = updated;
      this.saveCombatSessions();
    }
  }

  public deleteCombatSession(id: string): void {
    this.combatSessions = this.combatSessions.filter((s) => s.id !== id);
    this.saveCombatSessions();
  }

  public updateCombatantStats(
    sessionId: string,
    combatantId: string,
    updates: Partial<Combatant>
  ): CombatSession | undefined {
    const session = this.getCombatSession(sessionId);
    if (!session) return undefined;

    const combatantIdx = session.combatants.findIndex((c) => c.id === combatantId);
    if (combatantIdx === -1) return session;

    const currentCombatant = session.combatants[combatantIdx];
    const updatedCombatant: Combatant = {
      ...currentCombatant,
      ...updates,
    };
    session.combatants[combatantIdx] = updatedCombatant;

    // Synchronize to underlying sheet if bound
    if (updatedCombatant.sheetId) {
      if (updatedCombatant.type === 'pokemon') {
        const sheet = this.getPokemon(updatedCombatant.sheetId);
        if (sheet) {
          if (updates.currentHp !== undefined) sheet.currentHp = Math.max(0, Math.min(sheet.maxHp, updates.currentHp));
          if (updates.currentPe !== undefined) sheet.currentPe = Math.max(0, Math.min(sheet.maxPe, updates.currentPe));
          if (updates.conditions !== undefined) sheet.conditions = updates.conditions;
          this.savePokemon(sheet);
        }
      } else if (updatedCombatant.type === 'trainer') {
        const sheet = this.getTrainer(updatedCombatant.sheetId);
        if (sheet) {
          if (updates.currentHp !== undefined) sheet.currentHp = Math.max(0, Math.min(sheet.maxHp, updates.currentHp));
          this.saveTrainer(sheet);
        }
      }
    }

    this.updateCombatSession(session);
    return session;
  }

  public addCombatLog(
    sessionId: string,
    entry: Omit<CombatLogEntry, 'id' | 'timestamp'>
  ): CombatLogEntry | undefined {
    const session = this.getCombatSession(sessionId);
    if (!session) return undefined;

    const newLog: CombatLogEntry = {
      ...entry,
      id: 'log_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5),
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };

    session.actionLog.push(newLog);
    if (session.actionLog.length > 100) session.actionLog.shift();
    this.updateCombatSession(session);
    return newLog;
  }

  private saveCombatSessions(): void {
    try {
      this.notifySave('saving');
      localStorage.setItem(STORAGE_KEYS.COMBAT_SESSIONS, JSON.stringify(this.combatSessions));
      this.notifySave('saved');
    } catch (e) {
      console.error(e);
      this.notifySave('error');
    }
  }

  // --- NPCs (Personagens do Mundo) ---
  public getNpcs(campaignId?: string): NPC[] {
    if (campaignId) {
      return this.npcs.filter((n) => n.campaignId === campaignId);
    }
    return [...this.npcs];
  }

  public getNpc(id: string): NPC | undefined {
    return this.npcs.find((n) => n.id === id);
  }

  public saveNpc(npc: NPC): NPC {
    const idx = this.npcs.findIndex((n) => n.id === npc.id);
    if (idx !== -1) {
      this.npcs[idx] = npc;
    } else {
      this.npcs.unshift(npc);
    }
    this.saveNpcs();
    return npc;
  }

  public deleteNpc(id: string): void {
    this.npcs = this.npcs.filter((n) => n.id !== id);
    this.saveNpcs();
  }

  public saveNpcs(): void {
    try {
      this.notifySave('saving');
      localStorage.setItem(STORAGE_KEYS.NPCS, JSON.stringify(this.npcs));
      this.notifySave('saved');
    } catch (e) {
      console.error(e);
      this.notifySave('error');
    }
  }

  // --- Inventory & Items ---
  public getInventoryItems(campaignId?: string, ownerId?: string): InventoryItem[] {
    let list = this.inventoryItems;
    if (campaignId) {
      list = list.filter((i) => !i.campaignId || i.campaignId === campaignId);
    }
    if (ownerId !== undefined) {
      list = list.filter((i) => i.ownerId === ownerId);
    }
    return [...list];
  }

  public getInventoryItem(id: string): InventoryItem | undefined {
    return this.inventoryItems.find((i) => i.id === id);
  }

  public saveInventoryItem(item: InventoryItem): InventoryItem {
    const idx = this.inventoryItems.findIndex((i) => i.id === item.id);
    if (idx !== -1) {
      this.inventoryItems[idx] = item;
    } else {
      this.inventoryItems.push(item);
    }
    this.saveInventory();
    return item;
  }

  public deleteInventoryItem(id: string): void {
    this.inventoryItems = this.inventoryItems.filter((i) => i.id !== id);
    this.saveInventory();
  }

  public transferInventoryItem(
    itemId: string,
    newOwnerType: 'trainer' | 'campaign' | 'pokemon' | 'npc' | 'shop',
    newOwnerId?: string,
    quantity?: number
  ): InventoryItem | undefined {
    const item = this.getInventoryItem(itemId);
    if (!item) return undefined;

    // Partial transfer
    if (quantity && quantity > 0 && quantity < item.quantity) {
      item.quantity -= quantity;
      this.saveInventoryItem(item);

      const newItem: InventoryItem = {
        ...item,
        id: 'inv_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
        ownerType: newOwnerType,
        ownerId: newOwnerId || undefined,
        quantity,
      };
      this.saveInventoryItem(newItem);
      return newItem;
    }

    // Full transfer
    item.ownerType = newOwnerType;
    item.ownerId = newOwnerId || undefined;
    this.saveInventoryItem(item);
    return item;
  }

  public consumeInventoryItem(
    itemId: string,
    targetPokemonId?: string,
    targetTrainerId?: string
  ): { success: boolean; message: string; remainingQuantity: number } {
    const item = this.getInventoryItem(itemId);
    if (!item || item.quantity <= 0) {
      return { success: false, message: 'Item não encontrado ou sem quantidade disponível.', remainingQuantity: 0 };
    }

    let appliedEffect = item.effect;

    // Apply heal or condition removal on Pokemon
    if (targetPokemonId) {
      const pokemon = this.getPokemon(targetPokemonId);
      if (pokemon) {
        // Healing detection
        if (item.name.toLowerCase().includes('poção') || item.name.toLowerCase().includes('potion')) {
          let healAmount = 6;
          if (item.name.toLowerCase().includes('super')) healAmount = 12;
          else if (item.name.toLowerCase().includes('hiper') || item.name.toLowerCase().includes('hyper')) healAmount = 18;
          else if (item.name.toLowerCase().includes('max')) healAmount = pokemon.maxHp;

          pokemon.currentHp = Math.min(pokemon.maxHp, pokemon.currentHp + healAmount);
          appliedEffect = `Recuperou ${healAmount} PV de ${pokemon.nickname}.`;
        }

        // Revive detection
        if (item.name.toLowerCase().includes('reviver') || item.name.toLowerCase().includes('revive')) {
          pokemon.currentHp = Math.max(1, Math.floor(pokemon.maxHp / 4));
          pokemon.conditions = pokemon.conditions.filter((c) => c !== 'Nocauteado');
          appliedEffect = `${pokemon.nickname} levantou do nocaute com ${pokemon.currentHp} PV!`;
        }

        // Cure condition detection
        if (item.name.toLowerCase().includes('antídoto') || item.name.toLowerCase().includes('pecha')) {
          pokemon.conditions = pokemon.conditions.filter((c) => c !== 'Envenenado');
        } else if (item.name.toLowerCase().includes('antiparalisia') || item.name.toLowerCase().includes('cheri')) {
          pokemon.conditions = pokemon.conditions.filter((c) => c !== 'Paralisado');
        } else if (item.name.toLowerCase().includes('queimadura') || item.name.toLowerCase().includes('rawst')) {
          pokemon.conditions = pokemon.conditions.filter((c) => c !== 'Queimado');
        } else if (item.name.toLowerCase().includes('despertador') || item.name.toLowerCase().includes('chesto')) {
          pokemon.conditions = pokemon.conditions.filter((c) => c !== 'Sono' && c !== 'Confuso');
        } else if (item.name.toLowerCase().includes('remédio completo') || item.name.toLowerCase().includes('full heal') || item.name.toLowerCase().includes('lum')) {
          pokemon.conditions = [];
          appliedEffect = `Todas as condições de ${pokemon.nickname} foram encerradas.`;
        }

        this.savePokemon(pokemon);
        this.addPokemonDiaryEntry(pokemon.id, {
          eventType: 'training',
          title: `Item Utilizado: ${item.name}`,
          description: appliedEffect,
        });
      }
    }

    // Decrement quantity
    item.quantity -= 1;
    const remaining = item.quantity;
    if (item.quantity <= 0) {
      this.deleteInventoryItem(item.id);
    } else {
      this.saveInventoryItem(item);
    }

    return { success: true, message: `Utilizado: ${item.name}. ${appliedEffect}`, remainingQuantity: remaining };
  }

  public equipPokemonItem(pokemonId: string, item: InventoryItem): void {
    const pokemon = this.getPokemon(pokemonId);
    if (!pokemon) return;

    pokemon.heldItemId = item.id;
    pokemon.heldItemName = item.name;
    this.savePokemon(pokemon);

    item.equipped = true;
    item.ownerType = 'pokemon';
    item.ownerId = pokemonId;
    this.saveInventoryItem(item);
  }

  public unequipPokemonItem(pokemonId: string): void {
    const pokemon = this.getPokemon(pokemonId);
    if (!pokemon) return;

    if (pokemon.heldItemId) {
      const item = this.getInventoryItem(pokemon.heldItemId);
      if (item) {
        item.equipped = false;
        this.saveInventoryItem(item);
      }
    }

    pokemon.heldItemId = undefined;
    pokemon.heldItemName = undefined;
    this.savePokemon(pokemon);
  }

  public saveInventory(): void {
    try {
      this.notifySave('saving');
      localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(this.inventoryItems));
      this.notifySave('saved');
    } catch (e) {
      console.error(e);
      this.notifySave('error');
    }
  }

  // --- Official & Custom Items Catalog ---
  public getOfficialItems(): OfficialItem[] {
    return [...this.customItems, ...this.officialItems];
  }

  public saveCustomItem(item: OfficialItem): OfficialItem {
    const idx = this.customItems.findIndex((i) => i.id === item.id);
    const stamped = { ...item, adaptationStatus: 'custom' as const };
    if (idx !== -1) {
      this.customItems[idx] = stamped;
    } else {
      this.customItems.unshift(stamped);
    }
    this.saveCustomItems();
    return stamped;
  }

  public deleteCustomItem(id: string): void {
    this.customItems = this.customItems.filter((i) => i.id !== id);
    this.saveCustomItems();
  }

  private saveCustomItems(): void {
    try {
      this.notifySave('saving');
      localStorage.setItem(STORAGE_KEYS.CUSTOM_ITEMS, JSON.stringify(this.customItems));
      this.notifySave('saved');
    } catch (e) {
      this.notifySave('error');
    }
  }

  // --- Centralized Move Library & PokéAPI Integration ---
  public getLibraryMoves(campaignId?: string, includeGmOnly: boolean = false): LibraryMove[] {
    const map = new Map<string, LibraryMove>();

    // 1. Official moves
    OFFICIAL_MOVES_CATALOG.forEach((m) => map.set(m.name.toLowerCase(), m));

    // 2. System moves
    SYSTEM_MOVES.forEach((m) => {
      if (!map.has(m.name.toLowerCase())) map.set(m.name.toLowerCase(), m);
    });

    // 3. PokéAPI cached moves
    this.pokeApiMovesCache.forEach((m) => map.set(m.name.toLowerCase(), m));

    // 4. Custom campaign moves (highest precedence)
    let filteredCustom = this.customMoves;
    if (campaignId) {
      filteredCustom = filteredCustom.filter((m) => !m.campaignId || m.campaignId === campaignId);
    }
    if (!includeGmOnly) {
      filteredCustom = filteredCustom.filter((m) => !m.isGmOnly);
    }
    filteredCustom.forEach((m) => map.set(m.name.toLowerCase(), m));

    return Array.from(map.values());
  }

  public async fetchMoveFromPokeApi(query: string): Promise<LibraryMove> {
    const cleanQuery = query.toLowerCase().trim().replace(/\s+/g, '-');
    const res = await fetch(`https://pokeapi.co/api/v2/move/${encodeURIComponent(cleanQuery)}`);
    if (!res.ok) {
      throw new Error(`Movimento "${query}" não encontrado na PokéAPI (status: ${res.status}).`);
    }

    const data = await res.json();

    // Find Brazilian Portuguese or Portuguese name if available
    const ptEntry = data.names?.find(
      (n: any) => n.language?.name === 'pt-BR' || n.language?.name === 'pt'
    );
    const originalName = data.names?.find((n: any) => n.language?.name === 'en')?.name || data.name;
    const ptBrName = ptEntry?.name || originalName;

    // Type mapping
    const typeMap: Record<string, string> = {
      normal: 'Normal',
      fire: 'Fogo',
      water: 'Água',
      grass: 'Grama',
      electric: 'Elétrico',
      ice: 'Gelo',
      fighting: 'Lutador',
      poison: 'Veneno',
      ground: 'Terra',
      flying: 'Voador',
      psychic: 'Psíquico',
      bug: 'Inseto',
      rock: 'Pedra',
      ghost: 'Fantasma',
      dragon: 'Dragão',
      dark: 'Sombrio',
      steel: 'Aço',
      fairy: 'Fada',
    };
    const moveType = (typeMap[data.type?.name] || 'Normal') as any;

    // Damage Category
    const catMap: Record<string, 'Físico' | 'Especial' | 'Status'> = {
      physical: 'Físico',
      special: 'Especial',
      status: 'Status',
    };
    const category = catMap[data.damage_class?.name] || 'Físico';

    // Power & Scale conversion to Além da Próxima Rota (d4..d12 / 0..4 PE)
    const power = data.power ?? null;
    let tier: 'Básico' | 'Comum' | 'Forte' | 'Assinatura' | 'Supremo' = 'Comum';
    let damageDice = '1d6';
    let peCost = 1;

    if (category === 'Status') {
      tier = 'Comum';
      damageDice = '-';
      peCost = 1;
    } else if (power === null || power <= 45) {
      tier = 'Básico';
      damageDice = '1d4';
      peCost = 0;
    } else if (power <= 75) {
      tier = 'Comum';
      damageDice = '1d6';
      peCost = 1;
    } else if (power <= 95) {
      tier = 'Forte';
      damageDice = '1d8';
      peCost = 2;
    } else if (power <= 125) {
      tier = 'Assinatura';
      damageDice = '1d10';
      peCost = 3;
    } else {
      tier = 'Supremo';
      damageDice = '1d12';
      peCost = 4;
    }

    const testType =
      category === 'Físico'
        ? 'Corpo + Ataque Físico vs Defesa'
        : category === 'Especial'
        ? 'Energia + Ataque Especial vs Defesa'
        : 'Instinto + Instinto de Batalha vs CA 12';

    // Effect
    const effectEntry = data.effect_entries?.find((e: any) => e.language?.name === 'en');
    const effect = effectEntry?.short_effect || effectEntry?.effect || 'Efeito oficial importado da PokéAPI.';

    // Species
    const speciesNames: string[] = (data.learned_by_pokemon || [])
      .slice(0, 15)
      .map((p: any) => p.name.charAt(0).toUpperCase() + p.name.slice(1));

    // Generation
    let genNum = 1;
    if (data.generation?.name) {
      const match = data.generation.name.match(/generation-([ivx]+)/i);
      if (match) {
        const roman = match[1].toLowerCase();
        const rMap: Record<string, number> = { i: 1, ii: 2, iii: 3, iv: 4, v: 5, vi: 6, vii: 7, viii: 8, ix: 9 };
        genNum = rMap[roman] || 1;
      }
    }

    const move: LibraryMove = {
      id: 'pokeapi_' + data.id + '_' + data.name,
      name: ptBrName !== originalName ? `${ptBrName} (${originalName})` : originalName,
      originalName,
      type: moveType,
      category: category as any,
      tier,
      damageDice,
      peCost,
      range: category === 'Físico' ? 'Corpo a corpo' : 'Médio',
      testType,
      effect,
      narrativeDescription: `Movimento oficial importado da PokéAPI (ID #${data.id}).`,
      vgPower: power,
      vgAccuracy: data.accuracy ?? null,
      vgPp: data.pp ?? 20,
      vgPriority: data.priority ?? 0,
      vgTarget: data.target?.name || 'Um oponente',
      generation: genNum,
      secondaryEffectChance: data.effect_chance ?? undefined,
      learnableBy: speciesNames,
      adaptationStatus: 'suggested',
      dataSource: 'PokéAPI v2 (Oficial)',
    };

    // Save in cache idempotently
    const existingIdx = this.pokeApiMovesCache.findIndex((m) => m.originalName?.toLowerCase() === originalName.toLowerCase());
    if (existingIdx !== -1) {
      this.pokeApiMovesCache[existingIdx] = move;
    } else {
      this.pokeApiMovesCache.unshift(move);
    }
    this.savePokeApiCache();

    return move;
  }

  private savePokeApiCache(): void {
    try {
      localStorage.setItem(STORAGE_KEYS.POKEAPI_MOVES_CACHE, JSON.stringify(this.pokeApiMovesCache.slice(0, 100)));
    } catch (e) {
      // cache limit safe
    }
  }

  public saveCustomMove(move: LibraryMove): LibraryMove {
    const idx = this.customMoves.findIndex((m) => m.id === move.id);
    const stampedMove = { ...move, isCustom: true };
    if (idx !== -1) {
      this.customMoves[idx] = stampedMove;
    } else {
      this.customMoves.unshift(stampedMove);
    }
    this.saveCustomMoves();
    return stampedMove;
  }

  public deleteCustomMove(id: string): void {
    this.customMoves = this.customMoves.filter((m) => m.id !== id);
    this.saveCustomMoves();
  }

  public saveCustomMoves(): void {
    try {
      this.notifySave('saving');
      localStorage.setItem(STORAGE_KEYS.CUSTOM_MOVES, JSON.stringify(this.customMoves));
      this.notifySave('saved');
    } catch (e) {
      console.error(e);
      this.notifySave('error');
    }
  }

  // --- Economy, Wallets & Shops ---
  public getTrainerWallet(trainerId: string): number {
    const trainer = this.getTrainer(trainerId);
    return trainer?.pokedollars ?? 0;
  }

  public addWalletTransaction(
    tx: Omit<WalletTransaction, 'id' | 'timestamp' | 'balanceAfter'>
  ): WalletTransaction {
    let currentBalance = 0;
    if (tx.trainerId) {
      const trainer = this.getTrainer(tx.trainerId);
      if (trainer) {
        trainer.pokedollars = Math.max(0, (trainer.pokedollars || 0) + tx.amount);
        currentBalance = trainer.pokedollars;
        this.saveTrainer(trainer);
      }
    }

    const newTx: WalletTransaction = {
      ...tx,
      id: 'tx_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
      timestamp: new Date().toISOString(),
      balanceAfter: currentBalance,
    };

    this.transactions.unshift(newTx);
    this.saveTransactions();
    return newTx;
  }

  public getWalletTransactions(campaignId?: string, trainerId?: string): WalletTransaction[] {
    let list = this.transactions;
    if (campaignId) list = list.filter((t) => t.campaignId === campaignId);
    if (trainerId) list = list.filter((t) => t.trainerId === trainerId);
    return [...list];
  }

  private saveTransactions(): void {
    try {
      this.notifySave('saving');
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(this.transactions.slice(0, 200)));
      this.notifySave('saved');
    } catch (e) {
      this.notifySave('error');
    }
  }

  public getShops(campaignId?: string): Shop[] {
    if (campaignId) {
      return this.shops.filter((s) => s.campaignId === campaignId);
    }
    return [...this.shops];
  }

  public saveShop(shop: Shop): Shop {
    const idx = this.shops.findIndex((s) => s.id === shop.id);
    if (idx !== -1) {
      this.shops[idx] = shop;
    } else {
      this.shops.unshift(shop);
    }
    this.saveShops();
    return shop;
  }

  public deleteShop(shopId: string): void {
    this.shops = this.shops.filter((s) => s.id !== shopId);
    this.saveShops();
  }

  public saveShops(): void {
    try {
      this.notifySave('saving');
      localStorage.setItem(STORAGE_KEYS.SHOPS, JSON.stringify(this.shops));
      this.notifySave('saved');
    } catch (e) {
      this.notifySave('error');
    }
  }

  public executeShopPurchase(
    campaignId: string,
    shopId: string,
    itemId: string,
    buyerTrainerId: string,
    quantity: number
  ): { success: boolean; message: string } {
    const shop = this.shops.find((s) => s.id === shopId);
    if (!shop) return { success: false, message: 'Loja não encontrada.' };

    const shopItem = shop.items.find((i) => i.itemId === itemId);
    if (!shopItem) return { success: false, message: 'Item não disponível nesta loja.' };

    if (shopItem.stock < quantity) {
      return { success: false, message: `Estoque insuficiente (disponível: ${shopItem.stock}).` };
    }

    const trainer = this.getTrainer(buyerTrainerId);
    if (!trainer) return { success: false, message: 'Treinador comprador não encontrado.' };

    const unitPrice = shopItem.discountPercent
      ? Math.round(shopItem.price * (1 - shopItem.discountPercent / 100))
      : shopItem.price;
    const totalCost = unitPrice * quantity;

    if ((trainer.pokedollars || 0) < totalCost) {
      return { success: false, message: `Saldo insuficiente. Necessário: ${totalCost} PD, Saldo atual: ${trainer.pokedollars || 0} PD.` };
    }

    // Deduct stock
    shopItem.stock -= quantity;
    this.saveShops();

    // Deduct money
    this.addWalletTransaction({
      campaignId,
      trainerId: trainer.id,
      trainerName: trainer.name,
      amount: -totalCost,
      type: 'purchase',
      description: `Compra de ${quantity}x ${shopItem.name} na loja "${shop.name}".`,
    });

    // Add to inventory
    const existingInv = this.inventoryItems.find(
      (i) => i.ownerType === 'trainer' && i.ownerId === trainer.id && i.name.toLowerCase() === shopItem.name.toLowerCase()
    );

    if (existingInv) {
      existingInv.quantity += quantity;
      this.saveInventoryItem(existingInv);
    } else {
      // Find model details from official catalog
      const catalogItem = this.getOfficialItems().find((i) => i.id === itemId);
      this.saveInventoryItem({
        id: 'inv_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
        campaignId,
        ownerType: 'trainer',
        ownerId: trainer.id,
        name: shopItem.name,
        category: shopItem.category,
        quantity,
        effect: catalogItem?.rpgEffect || 'Suprimento adquirido em loja.',
        acquisitionSource: shop.name,
        acquisitionDate: new Date().toISOString(),
        imageUrl: catalogItem?.imageUrl,
      });
    }

    return { success: true, message: `Compra concluída com sucesso! Total pago: ${totalCost} PD.` };
  }

  public executeShopSale(
    campaignId: string,
    shopId: string,
    inventoryItemId: string,
    sellerTrainerId: string,
    quantity: number,
    unitPrice: number
  ): { success: boolean; message: string } {
    const item = this.getInventoryItem(inventoryItemId);
    if (!item || item.quantity < quantity) {
      return { success: false, message: 'Quantidade insuficiente no inventário para vender.' };
    }

    const trainer = this.getTrainer(sellerTrainerId);
    if (!trainer) return { success: false, message: 'Treinador vendedor não encontrado.' };

    const totalRevenue = unitPrice * quantity;

    // Deduct from inventory
    item.quantity -= quantity;
    if (item.quantity <= 0) {
      this.deleteInventoryItem(item.id);
    } else {
      this.saveInventoryItem(item);
    }

    // Credit money
    this.addWalletTransaction({
      campaignId,
      trainerId: trainer.id,
      trainerName: trainer.name,
      amount: totalRevenue,
      type: 'sale',
      description: `Venda de ${quantity}x ${item.name}.`,
    });

    return { success: true, message: `Venda efetuada com sucesso! Recebido: ${totalRevenue} PD.` };
  }

  // --- Battle Conditions ---
  public getAllConditions(): BattleCondition[] {
    return [...this.conditions];
  }

  public applyCondition(targetType: 'pokemon' | 'trainer', targetId: string, conditionName: string): boolean {
    if (targetType === 'pokemon') {
      const pokemon = this.getPokemon(targetId);
      if (!pokemon) return false;
      if (!pokemon.conditions.includes(conditionName)) {
        pokemon.conditions.push(conditionName);
        this.savePokemon(pokemon);
        return true;
      }
    } else {
      // Trainer condition handling via active combat or notes
      const trainer = this.getTrainer(targetId);
      if (!trainer) return false;
    }
    return false;
  }

  public removeCondition(targetType: 'pokemon' | 'trainer', targetId: string, conditionName: string): boolean {
    if (targetType === 'pokemon') {
      const pokemon = this.getPokemon(targetId);
      if (!pokemon) return false;
      pokemon.conditions = pokemon.conditions.filter((c) => c !== conditionName);
      this.savePokemon(pokemon);
      return true;
    }
    return false;
  }

  // --- Quests & Objectives ---
  public getQuests(campaignId?: string): Quest[] {
    if (campaignId) return this.quests.filter((q) => q.campaignId === campaignId);
    return [...this.quests];
  }

  public saveQuest(quest: Quest): Quest {
    const idx = this.quests.findIndex((q) => q.id === quest.id);
    if (idx !== -1) {
      this.quests[idx] = quest;
    } else {
      this.quests.unshift(quest);
    }
    this.saveQuests();
    return quest;
  }

  public deleteQuest(questId: string): void {
    this.quests = this.quests.filter((q) => q.id !== questId);
    this.saveQuests();
  }

  public toggleQuestObjective(questId: string, objectiveId: string): Quest | undefined {
    const quest = this.quests.find((q) => q.id === questId);
    if (!quest) return undefined;
    const obj = quest.objectives.find((o) => o.id === objectiveId);
    if (obj) {
      obj.completed = !obj.completed;
      // Auto complete if all non-optional done
      const allDone = quest.objectives.filter((o) => !o.optional).every((o) => o.completed);
      if (allDone && quest.status === 'Em andamento') {
        quest.status = 'Concluída';
      }
      this.saveQuest(quest);
    }
    return quest;
  }

  public saveQuests(): void {
    try {
      this.notifySave('saving');
      localStorage.setItem(STORAGE_KEYS.QUESTS, JSON.stringify(this.quests));
      this.notifySave('saved');
    } catch (e) {
      this.notifySave('error');
    }
  }

  // --- Atlas Locations ---
  public getAtlasLocations(campaignId?: string): AtlasLocation[] {
    if (campaignId) return this.locations.filter((l) => l.campaignId === campaignId);
    return [...this.locations];
  }

  public saveAtlasLocation(loc: AtlasLocation): AtlasLocation {
    const idx = this.locations.findIndex((l) => l.id === loc.id);
    if (idx !== -1) {
      this.locations[idx] = loc;
    } else {
      this.locations.push(loc);
    }
    this.saveLocations();
    return loc;
  }

  public deleteAtlasLocation(locationId: string): void {
    this.locations = this.locations.filter((l) => l.id !== locationId);
    this.saveLocations();
  }

  public saveLocations(): void {
    try {
      this.notifySave('saving');
      localStorage.setItem(STORAGE_KEYS.LOCATIONS, JSON.stringify(this.locations));
      this.notifySave('saved');
    } catch (e) {
      this.notifySave('error');
    }
  }

  // --- Gyms & Competitions ---
  public getGyms(campaignId?: string): GymBadge[] {
    if (campaignId) return this.gyms.filter((g) => g.campaignId === campaignId);
    return [...this.gyms];
  }

  public saveGym(gym: GymBadge): GymBadge {
    const idx = this.gyms.findIndex((g) => g.id === gym.id);
    if (idx !== -1) {
      this.gyms[idx] = gym;
    } else {
      this.gyms.push(gym);
    }
    this.saveGyms();
    return gym;
  }

  public recordGymMatch(gymId: string, match: GymMatchRecord): GymBadge | undefined {
    const gym = this.gyms.find((g) => g.id === gymId);
    if (!gym) return undefined;
    gym.matchHistory.unshift(match);
    this.saveGym(gym);
    return gym;
  }

  public saveGyms(): void {
    try {
      this.notifySave('saving');
      localStorage.setItem(STORAGE_KEYS.GYMS, JSON.stringify(this.gyms));
      this.notifySave('saved');
    } catch (e) {
      this.notifySave('error');
    }
  }

  // --- Encounter Tables & Exploration Roller ---
  public getEncounterTables(campaignId?: string): EncounterTable[] {
    if (campaignId) return this.encounterTables.filter((t) => t.campaignId === campaignId);
    return [...this.encounterTables];
  }

  public saveEncounterTable(table: EncounterTable): EncounterTable {
    const idx = this.encounterTables.findIndex((t) => t.id === table.id);
    if (idx !== -1) {
      this.encounterTables[idx] = table;
    } else {
      this.encounterTables.unshift(table);
    }
    this.saveEncounterTables();
    return table;
  }

  public deleteEncounterTable(tableId: string): void {
    this.encounterTables = this.encounterTables.filter((t) => t.id !== tableId);
    this.saveEncounterTables();
  }

  public rollEncounter(tableId: string): {
    entry: EncounterEntry;
    rolledLevel: number;
    weather: string;
    timeOfDay: string;
    behavior: string;
    summary: string;
  } | null {
    const table = this.encounterTables.find((t) => t.id === tableId);
    if (!table || table.entries.length === 0) return null;

    const totalWeight = table.entries.reduce((sum, e) => sum + (e.weight || 1), 0);
    let rand = Math.random() * totalWeight;
    let selected = table.entries[0];

    for (const e of table.entries) {
      rand -= e.weight || 1;
      if (rand <= 0) {
        selected = e;
        break;
      }
    }

    const levelDiff = Math.max(0, selected.maxLevel - selected.minLevel);
    const rolledLevel = selected.minLevel + Math.floor(Math.random() * (levelDiff + 1));

    return {
      entry: selected,
      rolledLevel,
      weather: table.weather,
      timeOfDay: table.timeOfDay,
      behavior: selected.behavior,
      summary: `Encontro Selvagem em ${table.routeOrArea}: 1x ${selected.speciesName} (Nv. ${rolledLevel}) — Postura: ${selected.behavior}. Condição: Clima ${table.weather}, ${table.timeOfDay}.`,
    };
  }

  public saveEncounterTables(): void {
    try {
      this.notifySave('saving');
      localStorage.setItem(STORAGE_KEYS.ENCOUNTER_TABLES, JSON.stringify(this.encounterTables));
      this.notifySave('saved');
    } catch (e) {
      this.notifySave('error');
    }
  }

  // --- Pokémon Individual Diary ---
  public getPokemonDiary(pokemonId: string): PokemonDiaryEntry[] {
    return this.pokemonDiaries[pokemonId] || [];
  }

  public addPokemonDiaryEntry(
    pokemonId: string,
    entry: Omit<PokemonDiaryEntry, 'id' | 'timestamp' | 'pokemonId'>
  ): PokemonDiaryEntry {
    const newEntry: PokemonDiaryEntry = {
      ...entry,
      id: 'pde_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
      pokemonId,
      timestamp: new Date().toISOString(),
    };

    if (!this.pokemonDiaries[pokemonId]) {
      this.pokemonDiaries[pokemonId] = [];
    }
    this.pokemonDiaries[pokemonId].unshift(newEntry);
    this.saveDiaries();
    return newEntry;
  }

  public deletePokemonDiaryEntry(pokemonId: string, entryId: string): void {
    if (this.pokemonDiaries[pokemonId]) {
      this.pokemonDiaries[pokemonId] = this.pokemonDiaries[pokemonId].filter((e) => e.id !== entryId);
      this.saveDiaries();
    }
  }

  private saveDiaries(): void {
    try {
      this.notifySave('saving');
      localStorage.setItem(STORAGE_KEYS.POKEMON_DIARIES, JSON.stringify(this.pokemonDiaries));
      this.notifySave('saved');
    } catch (e) {
      this.notifySave('error');
    }
  }

  // --- Campaign Pokédex ---
  public getCampaignPokedex(campaignId: string): Record<number, CampaignPokedexEntry> {
    return this.campaignPokedex[campaignId] || {};
  }

  public updateCampaignPokedexEntry(
    campaignId: string,
    dexNumber: number,
    update: Partial<CampaignPokedexEntry>
  ): CampaignPokedexEntry {
    if (!this.campaignPokedex[campaignId]) {
      this.campaignPokedex[campaignId] = {};
    }

    const current = this.campaignPokedex[campaignId][dexNumber] || {
      dexNumber,
      speciesName: 'Espécie #' + dexNumber,
      status: 'desconhecido',
    };

    const updated = { ...current, ...update };
    this.campaignPokedex[campaignId][dexNumber] = updated;

    try {
      this.notifySave('saving');
      localStorage.setItem(STORAGE_KEYS.CAMPAIGN_POKEDEX, JSON.stringify(this.campaignPokedex));
      this.notifySave('saved');
    } catch (e) {
      this.notifySave('error');
    }

    return updated;
  }

  // --- GM Resources ---
  public getGmResources(campaignId?: string): GmResource[] {
    if (campaignId) return this.gmResources.filter((r) => r.campaignId === campaignId);
    return [...this.gmResources];
  }

  public saveGmResource(resource: GmResource): GmResource {
    const idx = this.gmResources.findIndex((r) => r.id === resource.id);
    const updated = { ...resource, updatedAt: new Date().toISOString() };
    if (idx !== -1) {
      this.gmResources[idx] = updated;
    } else {
      this.gmResources.unshift(updated);
    }
    this.saveGmResources();
    return updated;
  }

  public deleteGmResource(resourceId: string): void {
    this.gmResources = this.gmResources.filter((r) => r.id !== resourceId);
    this.saveGmResources();
  }

  public saveGmResources(): void {
    try {
      this.notifySave('saving');
      localStorage.setItem(STORAGE_KEYS.GM_RESOURCES, JSON.stringify(this.gmResources));
      this.notifySave('saved');
    } catch (e) {
      this.notifySave('error');
    }
  }

  // --- Factions & Organizations ---
  public getFactions(campaignId?: string): Faction[] {
    if (campaignId) return this.factions.filter((f) => f.campaignId === campaignId);
    return [...this.factions];
  }

  public saveFaction(faction: Faction): Faction {
    const idx = this.factions.findIndex((f) => f.id === faction.id);
    const updated = { ...faction, updatedAt: new Date().toISOString() };
    if (idx !== -1) {
      this.factions[idx] = updated;
    } else {
      this.factions.unshift(updated);
    }
    this.saveFactions();
    return updated;
  }

  public deleteFaction(factionId: string): void {
    this.factions = this.factions.filter((f) => f.id !== factionId);
    this.saveFactions();
  }

  public saveFactions(): void {
    try {
      this.notifySave('saving');
      localStorage.setItem(STORAGE_KEYS.FACTIONS, JSON.stringify(this.factions));
      this.notifySave('saved');
    } catch (e) {
      this.notifySave('error');
    }
  }

  // --- Relationships Graph ---
  public getRelationships(campaignId?: string): RelationshipConnection[] {
    if (campaignId) return this.relationships.filter((r) => r.campaignId === campaignId);
    return [...this.relationships];
  }

  public saveRelationship(rel: RelationshipConnection): RelationshipConnection {
    const idx = this.relationships.findIndex((r) => r.id === rel.id);
    if (idx !== -1) {
      this.relationships[idx] = rel;
    } else {
      this.relationships.unshift(rel);
    }
    this.saveRelationships();
    return rel;
  }

  public deleteRelationship(relId: string): void {
    this.relationships = this.relationships.filter((r) => r.id !== relId);
    this.saveRelationships();
  }

  public saveRelationships(): void {
    try {
      this.notifySave('saving');
      localStorage.setItem(STORAGE_KEYS.RELATIONSHIPS, JSON.stringify(this.relationships));
      this.notifySave('saved');
    } catch (e) {
      this.notifySave('error');
    }
  }

  // --- Mysteries & Clues ---
  public getMysteries(campaignId?: string): Mystery[] {
    if (campaignId) return this.mysteries.filter((m) => m.campaignId === campaignId);
    return [...this.mysteries];
  }

  public saveMystery(mystery: Mystery): Mystery {
    const idx = this.mysteries.findIndex((m) => m.id === mystery.id);
    if (idx !== -1) {
      this.mysteries[idx] = mystery;
    } else {
      this.mysteries.unshift(mystery);
    }
    this.saveMysteries();
    return mystery;
  }

  public deleteMystery(mysteryId: string): void {
    this.mysteries = this.mysteries.filter((m) => m.id !== mysteryId);
    this.saveMysteries();
  }

  public saveMysteries(): void {
    try {
      this.notifySave('saving');
      localStorage.setItem(STORAGE_KEYS.MYSTERIES, JSON.stringify(this.mysteries));
      this.notifySave('saved');
    } catch (e) {
      this.notifySave('error');
    }
  }

  public updateClueStatus(
    mysteryId: string,
    clueId: string,
    status: Clue['status'],
    playerNotes?: string
  ): void {
    const mystery = this.mysteries.find((m) => m.id === mysteryId);
    if (!mystery) return;
    const clue = mystery.clues.find((c) => c.id === clueId);
    if (!clue) return;

    clue.status = status;
    if (status === 'Descoberta' && !clue.discoveredDate) {
      clue.discoveredDate = new Date().toISOString().split('T')[0];
    }
    if (playerNotes !== undefined) {
      clue.playerNotes = playerNotes;
    }
    this.saveMystery(mystery);
  }

  // --- World Events ---
  public getWorldEvents(campaignId?: string): WorldEvent[] {
    if (campaignId) return this.worldEvents.filter((e) => e.campaignId === campaignId);
    return [...this.worldEvents];
  }

  public saveWorldEvent(event: WorldEvent): WorldEvent {
    const idx = this.worldEvents.findIndex((e) => e.id === event.id);
    if (idx !== -1) {
      this.worldEvents[idx] = event;
    } else {
      this.worldEvents.unshift(event);
    }
    this.saveWorldEvents();
    return event;
  }

  public deleteWorldEvent(eventId: string): void {
    this.worldEvents = this.worldEvents.filter((e) => e.id !== eventId);
    this.saveWorldEvents();
  }

  public saveWorldEvents(): void {
    try {
      this.notifySave('saving');
      localStorage.setItem(STORAGE_KEYS.WORLD_EVENTS, JSON.stringify(this.worldEvents));
      this.notifySave('saved');
    } catch (e) {
      this.notifySave('error');
    }
  }

  // --- News & Rumors ---
  public getNewsRumors(campaignId?: string): NewsRumor[] {
    if (campaignId) return this.newsRumors.filter((n) => n.campaignId === campaignId);
    return [...this.newsRumors];
  }

  public saveNewsRumor(news: NewsRumor): NewsRumor {
    const idx = this.newsRumors.findIndex((n) => n.id === news.id);
    if (idx !== -1) {
      this.newsRumors[idx] = news;
    } else {
      this.newsRumors.unshift(news);
    }
    this.saveNewsRumors();
    return news;
  }

  public deleteNewsRumor(newsId: string): void {
    this.newsRumors = this.newsRumors.filter((n) => n.id !== newsId);
    this.saveNewsRumors();
  }

  public saveNewsRumors(): void {
    try {
      this.notifySave('saving');
      localStorage.setItem(STORAGE_KEYS.NEWS_RUMORS, JSON.stringify(this.newsRumors));
      this.notifySave('saved');
    } catch (e) {
      this.notifySave('error');
    }
  }

  // --- Tournaments ---
  public getTournaments(campaignId?: string): Tournament[] {
    if (campaignId) return this.tournaments.filter((t) => t.campaignId === campaignId);
    return [...this.tournaments];
  }

  public saveTournament(tourn: Tournament): Tournament {
    const idx = this.tournaments.findIndex((t) => t.id === tourn.id);
    if (idx !== -1) {
      this.tournaments[idx] = tourn;
    } else {
      this.tournaments.unshift(tourn);
    }
    this.saveTournaments();
    return tourn;
  }

  public saveTournaments(): void {
    try {
      this.notifySave('saving');
      localStorage.setItem(STORAGE_KEYS.TOURNAMENTS, JSON.stringify(this.tournaments));
      this.notifySave('saved');
    } catch (e) {
      this.notifySave('error');
    }
  }

  // --- Rivalries & Reputations ---
  public getRivalries(campaignId?: string): RivalryRecord[] {
    if (campaignId) return this.rivalries.filter((r) => r.campaignId === campaignId);
    return [...this.rivalries];
  }

  public saveRivalry(riv: RivalryRecord): RivalryRecord {
    const idx = this.rivalries.findIndex((r) => r.id === riv.id);
    if (idx !== -1) {
      this.rivalries[idx] = riv;
    } else {
      this.rivalries.unshift(riv);
    }
    this.saveRivalries();
    return riv;
  }

  public saveRivalries(): void {
    try {
      this.notifySave('saving');
      localStorage.setItem(STORAGE_KEYS.RIVALRIES, JSON.stringify(this.rivalries));
      this.notifySave('saved');
    } catch (e) {
      this.notifySave('error');
    }
  }

  public getReputations(campaignId?: string): ReputationRecord[] {
    if (campaignId) return this.reputations.filter((r) => r.campaignId === campaignId);
    return [...this.reputations];
  }

  public saveReputation(rep: ReputationRecord): ReputationRecord {
    const idx = this.reputations.findIndex((r) => r.id === rep.id);
    if (idx !== -1) {
      this.reputations[idx] = rep;
    } else {
      this.reputations.unshift(rep);
    }
    try {
      localStorage.setItem(STORAGE_KEYS.REPUTATIONS, JSON.stringify(this.reputations));
    } catch (e) {}
    return rep;
  }

  // --- Prep Scenes & Narrative Pending ---
  public getPrepScenes(campaignId?: string): PrepScene[] {
    if (campaignId) return this.prepScenes.filter((s) => s.campaignId === campaignId);
    return [...this.prepScenes];
  }

  public savePrepScene(scene: PrepScene): PrepScene {
    const idx = this.prepScenes.findIndex((s) => s.id === scene.id);
    if (idx !== -1) {
      this.prepScenes[idx] = scene;
    } else {
      this.prepScenes.push(scene);
    }
    this.savePrepScenes();
    return scene;
  }

  public deletePrepScene(sceneId: string): void {
    this.prepScenes = this.prepScenes.filter((s) => s.id !== sceneId);
    this.savePrepScenes();
  }

  public savePrepScenes(): void {
    try {
      this.notifySave('saving');
      localStorage.setItem(STORAGE_KEYS.PREP_SCENES, JSON.stringify(this.prepScenes));
      this.notifySave('saved');
    } catch (e) {
      this.notifySave('error');
    }
  }

  public getNarrativePending(campaignId?: string): NarrativePendingItem[] {
    if (campaignId) return this.narrativePending.filter((p) => p.campaignId === campaignId);
    return [...this.narrativePending];
  }

  public saveNarrativePending(item: NarrativePendingItem): NarrativePendingItem {
    const idx = this.narrativePending.findIndex((p) => p.id === item.id);
    if (idx !== -1) {
      this.narrativePending[idx] = item;
    } else {
      this.narrativePending.unshift(item);
    }
    try {
      localStorage.setItem(STORAGE_KEYS.NARRATIVE_PENDING, JSON.stringify(this.narrativePending));
    } catch (e) {}
    return item;
  }

  // --- Virtual Tabletop (VTT Maps & Tokens) ---
  public getVttMaps(campaignId?: string): VTTMap[] {
    if (campaignId) return this.vttMaps.filter((m) => m.campaignId === campaignId);
    return [...this.vttMaps];
  }

  public saveVttMap(map: VTTMap): VTTMap {
    const idx = this.vttMaps.findIndex((m) => m.id === map.id);
    if (idx !== -1) {
      this.vttMaps[idx] = map;
    } else {
      this.vttMaps.unshift(map);
    }
    this.saveVttMaps();
    return map;
  }

  public deleteVttMap(mapId: string): void {
    this.vttMaps = this.vttMaps.filter((m) => m.id !== mapId);
    this.saveVttMaps();
  }

  public saveVttMaps(): void {
    try {
      this.notifySave('saving');
      localStorage.setItem(STORAGE_KEYS.VTT_MAPS, JSON.stringify(this.vttMaps));
      this.notifySave('saved');
    } catch (e) {
      this.notifySave('error');
    }
  }

  // --- Campaign Files & References ---
  public getCampaignFiles(campaignId?: string): CampaignFileReference[] {
    if (campaignId) return this.campaignFiles.filter((f) => f.campaignId === campaignId);
    return [...this.campaignFiles];
  }

  public saveCampaignFile(file: CampaignFileReference): CampaignFileReference {
    const idx = this.campaignFiles.findIndex((f) => f.id === file.id);
    if (idx !== -1) {
      this.campaignFiles[idx] = file;
    } else {
      this.campaignFiles.unshift(file);
    }
    this.saveCampaignFiles();
    return file;
  }

  public deleteCampaignFile(fileId: string): void {
    this.campaignFiles = this.campaignFiles.filter((f) => f.id !== fileId);
    this.saveCampaignFiles();
  }

  public saveCampaignFiles(): void {
    try {
      this.notifySave('saving');
      localStorage.setItem(STORAGE_KEYS.CAMPAIGN_FILES, JSON.stringify(this.campaignFiles));
      this.notifySave('saved');
    } catch (e) {
      this.notifySave('error');
    }
  }

  // --- World Calendar Controls ---
  public advanceCalendarTime(
    campaignId: string,
    deltaMinutes: number,
    weatherChange?: WorldCalendar['weather']
  ): WorldCalendar {
    const camp = this.getCampaign(campaignId);
    const defaultCal: WorldCalendar = {
      day: 12,
      month: 3,
      year: 2026,
      hour: 10,
      minute: 0,
      season: 'Primavera',
      weather: 'Ensolarado',
    };
    const cal: WorldCalendar = camp?.calendar ? { ...camp.calendar } : defaultCal;

    let totalMinutes = cal.hour * 60 + cal.minute + deltaMinutes;
    let daysDelta = Math.floor(totalMinutes / (24 * 60));
    totalMinutes = ((totalMinutes % (24 * 60)) + (24 * 60)) % (24 * 60);

    cal.hour = Math.floor(totalMinutes / 60);
    cal.minute = totalMinutes % 60;
    cal.day += daysDelta;

    if (cal.day > 30) {
      cal.day = 1;
      cal.month += 1;
      if (cal.month > 12) {
        cal.month = 1;
        cal.year += 1;
      }
    }

    if (weatherChange) {
      cal.weather = weatherChange;
    }

    if (camp) {
      camp.calendar = cal;
      this.updateCampaign(camp);
    }

    return cal;
  }

  // --- Full Campaign Backup JSON Export & Import ---
  public exportCampaignJson(campaignId: string): string {
    const campaign = this.getCampaign(campaignId);
    if (!campaign) throw new Error('Campanha não encontrada para exportação.');

    const trainers = this.getTrainers(campaignId);
    const pokemon = this.getPokemons(campaignId);
    const npcs = this.getNpcs(campaignId);
    const inventory = this.getInventoryItems(campaignId);
    const customMoves = this.customMoves.filter((m) => m.campaignId === campaignId);
    const shops = this.getShops(campaignId);
    const transactions = this.getWalletTransactions(campaignId);
    const quests = this.getQuests(campaignId);
    const locations = this.getAtlasLocations(campaignId);
    const gyms = this.getGyms(campaignId);
    const encounterTables = this.getEncounterTables(campaignId);
    const gmResources = this.getGmResources(campaignId);
    const factions = this.getFactions(campaignId);
    const relationships = this.getRelationships(campaignId);
    const mysteries = this.getMysteries(campaignId);
    const worldEvents = this.getWorldEvents(campaignId);
    const newsRumors = this.getNewsRumors(campaignId);
    const tournaments = this.getTournaments(campaignId);
    const reputations = this.getReputations(campaignId);
    const rivalries = this.getRivalries(campaignId);
    const prepScenes = this.getPrepScenes(campaignId);
    const narrativePendingItems = this.getNarrativePending(campaignId);
    const vttMaps = this.getVttMaps(campaignId);
    const campaignFiles = this.getCampaignFiles(campaignId);

    const backup: CampaignBackup = {
      version: '2.1.0',
      exportedAt: new Date().toISOString(),
      appName: 'Project Mew',
      campaign,
      trainers,
      pokemon,
      npcs,
      sessions: campaign.sessions || [],
      clocks: campaign.clocks || [],
      inventory,
      customMoves,
      officialItems: this.customItems,
      shops,
      transactions,
      quests,
      locations,
      gyms,
      encounterTables,
      pokemonDiaries: this.pokemonDiaries,
      campaignPokedex: this.campaignPokedex[campaignId] || {},
      gmResources,
      factions,
      relationships,
      mysteries,
      worldEvents,
      newsRumors,
      tournaments,
      reputations,
      rivalries,
      prepScenes,
      narrativePendingItems,
      vttMaps,
      campaignFiles,
    };

    return JSON.stringify(backup, null, 2);
  }

  public importCampaignJson(jsonString: string): { success: boolean; campaignId?: string; error?: string } {
    try {
      const parsed = JSON.parse(jsonString) as CampaignBackup;
      if (!parsed.campaign || !parsed.campaign.id || !parsed.campaign.name) {
        return { success: false, error: 'Arquivo inválido: dados essenciais da campanha ausentes.' };
      }

      const camp = parsed.campaign;
      this.updateCampaign(camp);

      if (Array.isArray(parsed.trainers)) parsed.trainers.forEach((t) => this.saveTrainer(t));
      if (Array.isArray(parsed.pokemon)) parsed.pokemon.forEach((p) => this.savePokemon(p));
      if (Array.isArray(parsed.npcs)) parsed.npcs.forEach((n) => this.saveNpc(n));
      if (Array.isArray(parsed.inventory)) parsed.inventory.forEach((i) => this.saveInventoryItem(i));
      if (Array.isArray(parsed.customMoves)) parsed.customMoves.forEach((m) => this.saveCustomMove(m));
      if (Array.isArray(parsed.shops)) parsed.shops.forEach((s) => this.saveShop(s));
      if (Array.isArray(parsed.quests)) parsed.quests.forEach((q) => this.saveQuest(q));
      if (Array.isArray(parsed.locations)) parsed.locations.forEach((l) => this.saveAtlasLocation(l));
      if (Array.isArray(parsed.gyms)) parsed.gyms.forEach((g) => this.saveGym(g));
      if (Array.isArray(parsed.encounterTables)) parsed.encounterTables.forEach((et) => this.saveEncounterTable(et));
      if (Array.isArray(parsed.gmResources)) parsed.gmResources.forEach((r) => this.saveGmResource(r));
      if (Array.isArray(parsed.factions)) parsed.factions.forEach((f) => this.saveFaction(f));
      if (Array.isArray(parsed.relationships)) parsed.relationships.forEach((rel) => this.saveRelationship(rel));
      if (Array.isArray(parsed.mysteries)) parsed.mysteries.forEach((m) => this.saveMystery(m));
      if (Array.isArray(parsed.worldEvents)) parsed.worldEvents.forEach((e) => this.saveWorldEvent(e));
      if (Array.isArray(parsed.newsRumors)) parsed.newsRumors.forEach((nr) => this.saveNewsRumor(nr));
      if (Array.isArray(parsed.tournaments)) parsed.tournaments.forEach((tourn) => this.saveTournament(tourn));
      if (Array.isArray(parsed.reputations)) parsed.reputations.forEach((rep) => this.saveReputation(rep));
      if (Array.isArray(parsed.rivalries)) parsed.rivalries.forEach((riv) => this.saveRivalry(riv));
      if (Array.isArray(parsed.prepScenes)) parsed.prepScenes.forEach((ps) => this.savePrepScene(ps));
      if (Array.isArray(parsed.narrativePendingItems)) parsed.narrativePendingItems.forEach((np) => this.saveNarrativePending(np));
      if (Array.isArray(parsed.vttMaps)) parsed.vttMaps.forEach((vm) => this.saveVttMap(vm));
      if (Array.isArray(parsed.campaignFiles)) parsed.campaignFiles.forEach((cf) => this.saveCampaignFile(cf));

      if (parsed.pokemonDiaries) {
        this.pokemonDiaries = { ...this.pokemonDiaries, ...parsed.pokemonDiaries };
        this.saveDiaries();
      }

      if (parsed.campaignPokedex) {
        this.campaignPokedex[camp.id] = parsed.campaignPokedex;
        try {
          localStorage.setItem(STORAGE_KEYS.CAMPAIGN_POKEDEX, JSON.stringify(this.campaignPokedex));
        } catch (e) {}
      }

      return { success: true, campaignId: camp.id };
    } catch (err: any) {
      return { success: false, error: 'Falha ao processar arquivo JSON: ' + (err?.message || 'Formato inválido') };
    }
  }
}

export const storageService = new StorageService();

// Standalone function exports for direct named imports across views
export const getShops = (campaignId?: string) => storageService.getShops(campaignId);
export const getWalletTransactions = (campaignId?: string, trainerId?: string) => storageService.getWalletTransactions(campaignId, trainerId);
export const executeShopPurchase = (campaignId: string, shopId: string, itemId: string, buyerTrainerId: string, quantity: number) =>
  storageService.executeShopPurchase(campaignId, shopId, itemId, buyerTrainerId, quantity);
export const executeShopSale = (campaignId: string, shopId: string, inventoryItemId: string, sellerTrainerId: string, quantity: number, unitPrice: number) =>
  storageService.executeShopSale(campaignId, shopId, inventoryItemId, sellerTrainerId, quantity, unitPrice);
export const getOfficialItems = () => storageService.getOfficialItems();
export const getInventories = (campaignId?: string) => storageService.getInventoryItems(campaignId);
export const consumeInventoryItem = (itemId: string, targetPokemonId?: string, targetTrainerId?: string) =>
  storageService.consumeInventoryItem(itemId, targetPokemonId, targetTrainerId);

export const getQuests = (campaignId?: string) => storageService.getQuests(campaignId);
export const saveQuest = (quest: Quest) => storageService.saveQuest(quest);
export const toggleQuestObjective = (questId: string, objectiveId: string) =>
  storageService.toggleQuestObjective(questId, objectiveId);

export const getLocations = (campaignId?: string) => storageService.getAtlasLocations(campaignId);
export const saveLocation = (loc: AtlasLocation) => storageService.saveAtlasLocation(loc);

export const getGymBadges = (campaignId?: string) => storageService.getGyms(campaignId);
export const recordGymMatch = (
  gymId: string,
  match: {
    id: string;
    date: string;
    trainerId: string;
    trainerName: string;
    outcome: 'Vitória' | 'Derrota' | 'Empate';
    notes: string;
    badgeAwarded: boolean;
  }
) => storageService.recordGymMatch(gymId, match);

export const getEncounterTables = (campaignId?: string) => storageService.getEncounterTables(campaignId);
export const saveEncounterTable = (table: EncounterTable) => storageService.saveEncounterTable(table);
export const rollEncounter = (tableId: string) => storageService.rollEncounter(tableId);


