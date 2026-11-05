/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DiceRank, PokemonType } from '../data/rulesData';
export type { DiceRank, PokemonType };

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  bio?: string;
  role?: 'admin' | 'user';
  createdAt: string;
}

export type PlayerRole = 'gm' | 'co-gm' | 'player';

export interface CampaignPlayer {
  userId: string;
  userName: string;
  userEmail: string;
  userAvatar: string;
  role: PlayerRole;
  joinedAt: string;
}

export interface WorldClock {
  id: string;
  campaignId: string;
  name: string;
  totalSegments: 4 | 6;
  filledSegments: number;
  objective: string;
  consequence: string;
  isSecret: boolean;
}

export interface PlayerPermissions {
  canEditAttributes: boolean;
  canEditSkills: boolean;
  canEditMoves: boolean;
  canEditInventory: boolean;
  canEditXp: boolean;
  canEditHistory: boolean;
  canEditNotes: boolean;
}

export interface SessionRecord {
  id: string;
  campaignId: string;
  sessionNumber: number;
  title: string;
  date: string;
  durationHours?: number;
  description?: string;
  summary: string;
  xpAwarded: number;
  notes: string;
  // Expansão Fase 1 & 3
  participants?: string[];
  visitedLocations?: string[];
  involvedNpcIds?: string[];
  pokemonEncountered?: string[];
  battlesSummary?: string;
  affectedQuestIds?: string[];
  itemsFound?: string[];
  rewardsSummary?: string;
  playerDecisions?: string;
  consequences?: string;
  gmPrivateNotes?: string;
  isPublic?: boolean;
}

export interface Campaign {
  id: string;
  code: string; // Unique invite code, e.g. "MEW-KANTO"
  name: string;
  description: string;
  coverImage: string;
  gmId: string;
  gmName: string;
  isSample?: boolean; // Flag to differentiate example/demo campaigns from user-created campaigns
  players: CampaignPlayer[];
  clocks: WorldClock[];
  sessions: SessionRecord[];
  publicInfo: {
    region: string;
    tone: string;
    houseRules: string;
    campaignAgreements: string;
  };
  secretNotes: string;
  createdAt: string;
  // Expansão Mundo Vivo & Configurações do Mestre
  playerPermissions?: PlayerPermissions;
  nextSessionDate?: string;
  nextSessionNotes?: string;
  featuredWidgets?: string[]; // IDs das seções em destaque no Overview
  calendar?: WorldCalendar;
  pinnedNews?: string[];
}

export type ItemCategory =
  | 'Dispositivos de Captura'
  | 'Poké Bolas'
  | 'Medicamentos e Recuperação'
  | 'Medicamentos'
  | 'Cura de Condições'
  | 'Recuperação de Energia'
  | 'Bagas e Alimentos'
  | 'Itens de Evolução'
  | 'Itens de Batalha'
  | 'Itens de Exploração'
  | 'Ferramentas'
  | 'Equipamentos'
  | 'Equipamento'
  | 'Itens Importantes e Missão'
  | 'Itens Especiais'
  | 'Itens Personalizados'
  | 'Dispositivo'
  | 'Medicina'
  | 'Tecnologia'
  | 'Acessório'
  | 'Geral'
  | 'Outros';

export interface OfficialItem {
  id: string;
  name: string;
  originalName: string;
  category: ItemCategory;
  subcategory?: string;
  description: string;
  originalVgEffect?: string;
  rpgEffect: string;
  pokedollarsPrice: number;
  isOfficialManualPrice: boolean; // True for the 20 official items from Além da Próxima Rota 1.0
  rarity: 'Comum' | 'Incomum' | 'Raro' | 'Muito Raro' | 'Único';
  stackable: boolean;
  maxStack?: number;
  charges?: number;
  usageCondition?: string;
  targetScope?: 'Aliado' | 'Pokémon' | 'Treinador' | 'Área' | 'Inimigo' | 'Especial';
  gmNotes?: string;
  sourceGame?: string;
  generations?: string[];
  adaptationStatus: 'approved' | 'pending' | 'custom';
  imageUrl?: string;
}

export interface InventoryItem {
  id: string;
  campaignId?: string;
  ownerType?: 'trainer' | 'campaign' | 'pokemon' | 'npc' | 'shop';
  ownerId?: string; // ID do treinador, Pokémon, NPC ou loja; vazio para estoque comum
  name: string;
  category: ItemCategory;
  quantity: number;
  weight?: string;
  effect: string;
  notes?: string;
  imageUrl?: string;
  equipped?: boolean;
  chargesLeft?: number;
  acquisitionDate?: string;
  acquisitionSource?: string;
  customPrice?: number;
}

export type NpcClassification =
  | 'Comum'
  | 'Recorrente'
  | 'Importante'
  | 'Rival'
  | 'Aliado'
  | 'Antagonista'
  | 'Líder de Ginásio'
  | 'Comerciante'
  | 'Personagem histórico'
  | 'Principal'
  | 'Secundário'
  | 'Ocasional';

export interface NPC {
  id: string;
  campaignId: string;
  name: string;
  age?: number | string;
  roleOrTitle?: string; // ex: Líder de Ginásio, Cientista Silph, Comerciante
  occupation?: string;
  location?: string;
  appearance: string;
  personality: string;
  motivation: string;
  relations: string;
  goals: string;
  fears?: string;
  secretNotes: string;
  isSecretRevealed?: boolean;
  avatarUrl: string;
  associatedPokemonIds: string[];
  associatedPokemonNames?: string[];
  importance: NpcClassification;
  factionId?: string;
  factionName?: string;
  shopId?: string;
  pokedollars?: number;
  inventory?: InventoryItem[];
  appearanceHistory?: string[]; // IDs de sessões ou descrições de encontros
  gmObservations?: string;
  createdAt: string;
}

export interface TrainerSheet {
  id: string;
  campaignId: string;
  ownerId: string;
  ownerName: string;
  name: string;
  age: number;
  region: string;
  concept: string;
  goal: string;
  avatarUrl: string;
  origin: string; // Origem (24 opções)
  className?: string; // Opcional no Nível 1! Desbloqueia no Nível 2
  trackName?: string; // Opcional até Nível 4! Desbloqueia no Nível 4
  level: number;
  xp: number;
  
  // Atributos: Corpo, Mente, Presença (d4 a d12)
  corpo: DiceRank;
  mente: DiceRank;
  presenca: DiceRank;
  
  // Estatísticas derivadas
  maxHp: number; // 10 + (2 * valor Corpo) + (2 * (level - 1))
  currentHp: number;
  defense: number; // 10 + bônus de Reflexos
  
  // Perícias: 24 perícias
  skills: Record<string, DiceRank>;

  // Habilidades
  originAbility: { name: string; desc: string };
  classAbilities: { name: string; desc: string }[];
  sharedAbilities: { name: string; desc: string }[];
  personalAbility: { name: string; desc: string };

  // Equipamentos & Economia
  inventory: InventoryItem[];
  pokedollars: number;

  // Narrativa & Vínculos
  relationships: string;
  fears: string;
  openQuestions: string;
  notes: string;
}

export type MoveTier = 'Básico' | 'Comum' | 'Forte' | 'Assinatura' | 'Supremo';
export type MoveCategory = 'Físico' | 'Especial' | 'Suporte' | 'Status';
export type MoveRange = 'Corpo a corpo' | 'Perto' | 'Médio' | 'Longe' | 'Pessoal' | 'Campo';
export type MoveAdaptationStatus =
  | 'imported'
  | 'pending'
  | 'suggested'
  | 'gm_adapted'
  | 'approved'
  | 'disabled';

export interface PokemonMove {
  id: string;
  name: string;
  originalName?: string;
  type: PokemonType;
  category: MoveCategory;
  tier: MoveTier;
  damageDice: string; // e.g. "1d4", "1d6", "1d8", "1d10", "1d12", "-"
  peCost: number; // 0, 1, 2, 3, 4
  range: MoveRange;
  testType?: string; // e.g. "Corpo + Ataque Físico vs Defesa"
  effect: string;
  resistance?: string;
  narrativeDescription?: string;
  learnRequirements?: string;
  gmNotes?: string;
  isCustom?: boolean;
  isGmOnly?: boolean;
  campaignId?: string;
  
  // Official Videogame Stats
  vgPower?: number | null;
  vgAccuracy?: number | null;
  vgPp?: number;
  vgPriority?: number;
  vgTarget?: string;
  generation?: number;
  versions?: string[];
  secondaryEffectChance?: number;
  statChanges?: string;
  causesCondition?: string;
  learnableBy?: string[]; // Species names
  learnMethod?: string;
  learnLevel?: number;
  specialVariant?: 'Normal' | 'Z-Move' | 'Max Move' | 'G-Max' | 'Exclusivo';
  adaptationStatus?: MoveAdaptationStatus;
  dataSource?: string;
}

export interface LibraryMove extends PokemonMove {
  // Aliased for compendium
}

export interface WalletTransaction {
  id: string;
  campaignId: string;
  trainerId?: string;
  trainerName?: string;
  amount: number; // positivo para ganho, negativo para gasto
  type: 'reward' | 'purchase' | 'sale' | 'transfer' | 'adjustment';
  description: string;
  timestamp: string;
  balanceAfter: number;
}

export interface ShopItem {
  itemId: string;
  name: string;
  category: ItemCategory;
  price: number;
  stock: number;
  discountPercent?: number;
  exclusive?: boolean;
}

export interface Shop {
  id: string;
  campaignId: string;
  name: string;
  cityOrRoute: string;
  description: string;
  npcOwnerId?: string;
  npcOwnerName?: string;
  items: ShopItem[];
  operatingHours: string;
  secretNotes?: string;
}

export interface BattleCondition {
  id: string;
  name: string;
  description: string;
  mechanicalEffect: string;
  duration: string;
  endTrigger: string;
  resistanceCheck?: string;
  counterItems: string[];
  isHomebrew?: boolean;
  severity?: 'Leve' | 'Grave' | 'Crítica';
}

export interface EncounterEntry {
  id: string;
  speciesName: string;
  dexNumber: number;
  types: PokemonType[];
  minLevel: number;
  maxLevel: number;
  rarity: 'Comum' | 'Incomum' | 'Raro' | 'Muito Raro';
  weight: number; // 1-100 para sorteio
  behavior: 'Pacífico' | 'Arisco' | 'Territorial' | 'Agressivo' | 'Curioso';
  notes?: string;
}

export interface EncounterTable {
  id: string;
  campaignId: string;
  name: string;
  region: string;
  routeOrArea: string;
  habitat: string;
  biome: string;
  timeOfDay: 'Manhã' | 'Dia' | 'Tarde' | 'Noite' | 'Qualquer';
  weather: 'Claro' | 'Chuva' | 'Tempestade' | 'Névoa' | 'Calor' | 'Qualquer';
  season: 'Primavera' | 'Verão' | 'Outono' | 'Inverno' | 'Qualquer';
  entries: EncounterEntry[];
  gmSecretNotes?: string;
}

export interface PokemonDiaryEntry {
  id: string;
  pokemonId: string;
  timestamp: string;
  eventType: 'capture' | 'evolution' | 'move_learned' | 'training' | 'battle' | 'injury' | 'temperament' | 'transfer' | 'narrative';
  title: string;
  description: string;
  gmPrivate?: boolean;
}

export interface CampaignPokedexEntry {
  dexNumber: number;
  speciesName: string;
  status: 'desconhecido' | 'avistado' | 'capturado' | 'conhecido' | 'registrado_outros';
  notes?: string;
  seenAtLocation?: string;
  caughtByTrainerName?: string;
  isSecret?: boolean;
}

export interface GymMatchRecord {
  id: string;
  date: string;
  trainerId: string;
  trainerName: string;
  outcome: 'Vitória' | 'Derrota' | 'Empate';
  notes: string;
  badgeAwarded: boolean;
}

export interface GymBadge {
  id: string;
  campaignId: string;
  orderNumber: number;
  gymName: string;
  badgeName: string;
  badgeIcon: string;
  city: string;
  leaderName: string;
  specialtyType: PokemonType;
  leaderNpcId?: string;
  requirements: string;
  rulesNotes: string;
  leaderPokemonNames: string[];
  matchHistory: GymMatchRecord[];
}

export interface QuestObjective {
  id: string;
  text: string;
  completed: boolean;
  optional?: boolean;
}

export interface Quest {
  id: string;
  campaignId: string;
  title: string;
  description: string;
  objectives: QuestObjective[];
  involvedNpcIds: string[];
  locations: string[];
  rewards: {
    pokedollars?: number;
    xp?: number;
    items?: string[];
    other?: string;
  };
  deadline?: string;
  status: 'Disponível' | 'Em andamento' | 'Concluída' | 'Falhou' | 'Abandonada' | 'Oculta';
  gmSecrets?: string;
  gmNotes?: string;
}

export interface AtlasLocation {
  id: string;
  campaignId: string;
  name: string;
  region: string;
  type: 'Cidade' | 'Rota' | 'Floresta' | 'Caverna' | 'Centro Pokémon' | 'Loja' | 'Ginásio' | 'Laboratório' | 'Especial' | 'Secreto';
  description: string;
  connectedLocationIds: string[];
  residentNpcIds: string[];
  wildPokemonNames: string[];
  availableItemsSummary: string[];
  events: string[];
  gmNotes: string;
  imageUrl?: string;
  // Habitats & Ecossistemas (Fase 3)
  environmentType?: string;
  weatherPattern?: string;
  vegetationNotes?: string;
  activityHours?: 'Diurno' | 'Noturno' | 'Crepuscular' | 'Contínuo';
  threatLevel?: number; // 1-5
}

// 5. Facções & Organizações
export interface Faction {
  id: string;
  campaignId: string;
  name: string;
  symbolUrl?: string;
  objective: string;
  hierarchy: string[];
  leaderNpcId?: string;
  leaderName?: string;
  resources: string;
  headquartersLocation?: string;
  controlledLocationIds: string[];
  influenceLevel: number; // 1 a 10
  relationsNotes: string;
  gmSecrets: string;
  isKnownToPlayers: boolean;
  history: string;
  updatedAt: string;
}

// 5. Relacionamentos em Grafo
export interface RelationshipConnection {
  id: string;
  campaignId: string;
  sourceType: 'npc' | 'trainer' | 'faction' | 'location';
  sourceId: string;
  sourceName: string;
  targetType: 'npc' | 'trainer' | 'faction' | 'location';
  targetId: string;
  targetName: string;
  relationshipType: 'Aliado' | 'Rival' | 'Inimigo' | 'Familiar' | 'Mentor' | 'Subordinado' | 'Comercial' | 'Neutro' | 'Misterioso';
  description: string;
  intensity: number; // -5 (ódio profundo) a +5 (lealdade inabalável)
  establishedDate?: string;
  state: 'Ativo' | 'Rompido' | 'Oculto' | 'Evoluindo';
  gmSecrets?: string;
  isSecretFromPlayers: boolean;
}

// 6. Sistema de Pistas e Mistérios
export interface Clue {
  id: string;
  mysteryId: string;
  title: string;
  content: string;
  locationFound?: string;
  sourceNpcId?: string;
  sourceNpcName?: string;
  status: 'Não descoberta' | 'Descoberta' | 'Interpretada' | 'Confirmada' | 'Descartada';
  isMisdirection?: boolean; // Pista falsa / suspeita enganosa
  evidenceImageUrl?: string;
  discoveredDate?: string;
  playerNotes?: string;
  gmSecretTruth?: string;
}

export interface Mystery {
  id: string;
  campaignId: string;
  title: string;
  centralQuestion: string;
  hypotheses: string[];
  clues: Clue[];
  suspectNpcIds: string[];
  relatedLocationIds: string[];
  status: 'Aberto' | 'Em investigação' | 'Solucionado' | 'Arquivado';
  revelations: string;
  consequences: string;
  gmNotes: string;
  isRevealedToPlayers: boolean;
  createdAt: string;
}

// 7. Eventos Mundiais
export interface WorldEvent {
  id: string;
  campaignId: string;
  title: string;
  date: string;
  location: string;
  triggerCondition: string;
  duration: string;
  involvedCharacters: string[];
  consequences: string;
  visibility: 'Público' | 'Rumor' | 'Oculto';
  status: 'Programado' | 'Em andamento' | 'Concluído' | 'Cancelado';
  requiresGmConfirmation: boolean;
  executed: boolean;
  gmNotes?: string;
}

// 11. Calendário e Estado do Mundo
export interface WorldCalendar {
  day: number;
  month: number;
  year: number;
  hour: number;
  minute: number;
  season: 'Primavera' | 'Verão' | 'Outono' | 'Inverno';
  weather: 'Ensolarado' | 'Nublado' | 'Chuva Leve' | 'Tempestade' | 'Névoa Espessa' | 'Calor Intenso' | 'Vento Frio';
  worldNotes?: string;
}

// 12. Notícias e Rumores
export interface NewsRumor {
  id: string;
  campaignId: string;
  title: string;
  date: string;
  origin: string; // Ex: "Boletim Oficial da Liga de Kanto", "Boato de Taberna em Vermilion"
  category: 'Oficial' | 'Liga Pokémon' | 'Evento Local' | 'Rumor' | 'Falso / Desinformação' | 'Segredo do Mestre';
  content: string;
  location?: string;
  visibility: 'Público' | 'Rumor' | 'Mestre Apenas';
  reliabilityPercent?: number; // Ex: 40% verídico
  relatedQuestId?: string;
  relatedNpcId?: string;
  createdAt: string;
}

// 13. Torneios da Liga
export interface TournamentMatch {
  id: string;
  roundNumber: number;
  trainer1Name: string;
  trainer2Name: string;
  winnerName?: string;
  scoreOrDetails?: string;
  completed: boolean;
}

export interface Tournament {
  id: string;
  campaignId: string;
  name: string;
  location: string;
  rulesFormat: string; // Ex: 3v3 Single Elimination
  status: 'Inscrições' | 'Em andamento' | 'Finalizado';
  participants: string[];
  matches: TournamentMatch[];
  awardsSummary: string;
  gmNotes?: string;
}

// 14. Histórico de Reputação e Rivalidade
export interface ReputationRecord {
  id: string;
  campaignId: string;
  trainerId: string;
  trainerName: string;
  targetGroupOrNpc: string; // Ex: "Liga Pokémon de Kanto", "Equipe Rocket", "Cidade de Cerulean"
  standing: 'Odiado' | 'Hostil' | 'Desconfiado' | 'Neutro' | 'Reconhecido' | 'Respeitado' | 'Herói';
  score: number; // -100 a +100
  notes: string;
  eventsHistory: string[];
}

export interface RivalryRecord {
  id: string;
  campaignId: string;
  trainerId: string;
  trainerName: string;
  rivalNpcId?: string;
  rivalName: string;
  firstEncounterDate: string;
  firstEncounterLocation: string;
  battlesCount: number;
  trainerWins: number;
  rivalWins: number;
  currentStance: 'Rivalidade Saudável' | 'Aversão Mútua' | 'Rancor Profundo' | 'Aliança Frágil' | 'Respeito Tácito';
  logEntries: {
    date: string;
    event: string;
    outcome?: string;
  }[];
}

// 15. Preparador de Sessões
export interface PrepScene {
  id: string;
  campaignId: string;
  order: number;
  title: string;
  objective: string;
  narrativeDescription: string;
  involvedNpcNames: string[];
  locationName: string;
  plannedEncounters: string[];
  cluesToReveal: string[];
  rewards: string[];
  potentialConsequences: string[];
  hooksForNextScene: string[];
  status: 'Pendente' | 'Em execução' | 'Concluída' | 'Ignorada';
  gmSecretNotes?: string;
}

export interface NarrativePendingItem {
  id: string;
  campaignId: string;
  title: string;
  description: string;
  priority: 'Baixa' | 'Média' | 'Alta' | 'Urgente';
  resolved: boolean;
  relatedSessionNumber?: number;
}

// 16. Mesa Virtual (VTT)
export interface VTTToken {
  id: string;
  sheetId?: string;
  sheetType: 'trainer' | 'pokemon' | 'npc' | 'enemy' | 'object';
  name: string;
  avatarUrl: string;
  x: number; // Coordenada X na grade
  y: number; // Coordenada Y na grade
  size: number; // Tamanho em casas da grade (1x1, 2x2, etc.)
  currentHp?: number;
  maxHp?: number;
  conditions: string[];
  isSecret: boolean; // Se verdadeiro, oculto para jogadores (Fog of War)
  color?: string;
}

export interface VTTMap {
  id: string;
  campaignId: string;
  name: string;
  imageUrl: string;
  gridSize: number; // Ex: 50px por célula
  columns: number;
  rows: number;
  fogOfWar: boolean; // Se a névoa de guerra está ativa
  revealedCells?: string[]; // "x,y" das células visíveis aos jogadores
  tokens: VTTToken[];
  gmPrivateAnnotations?: {
    x: number;
    y: number;
    text: string;
  }[];
  active: boolean;
}

// 18. Central de Arquivos & Referências
export interface CampaignFileReference {
  id: string;
  campaignId: string;
  name: string;
  category: 'Mapas' | 'Documentos' | 'Handouts' | 'Regras Adicionais' | 'Imagens' | 'Tokens';
  fileUrl: string;
  fileType: 'image' | 'pdf' | 'document' | 'note';
  description: string;
  linkedEntityType?: 'npc' | 'location' | 'session' | 'pokemon' | 'quest' | 'trainer';
  linkedEntityId?: string;
  isPublic: boolean;
  createdAt: string;
}

export interface GmResource {
  id: string;
  campaignId: string;
  title: string;
  category: 'Regras da Casa' | 'Tabelas' | 'Documentos' | 'Mapas' | 'Descrições' | 'Anotações';
  content: string;
  tags: string[];
  isPinned?: boolean;
  updatedAt: string;
}

export interface CampaignBackup {
  version: string;
  exportedAt: string;
  appName: string;
  campaign: Campaign;
  trainers: TrainerSheet[];
  pokemon: PokemonSheet[];
  npcs: NPC[];
  sessions: SessionRecord[];
  clocks: WorldClock[];
  inventory: InventoryItem[];
  customMoves: LibraryMove[];
  officialItems?: OfficialItem[];
  shops?: Shop[];
  transactions?: WalletTransaction[];
  quests?: Quest[];
  locations?: AtlasLocation[];
  gyms?: GymBadge[];
  encounterTables?: EncounterTable[];
  pokemonDiaries?: Record<string, PokemonDiaryEntry[]>;
  campaignPokedex?: Record<number, CampaignPokedexEntry>;
  gmResources?: GmResource[];
  // Expansão Fase 1 a 6
  factions?: Faction[];
  relationships?: RelationshipConnection[];
  mysteries?: Mystery[];
  worldEvents?: WorldEvent[];
  newsRumors?: NewsRumor[];
  tournaments?: Tournament[];
  reputations?: ReputationRecord[];
  rivalries?: RivalryRecord[];
  prepScenes?: PrepScene[];
  narrativePendingItems?: NarrativePendingItem[];
  vttMaps?: VTTMap[];
  campaignFiles?: CampaignFileReference[];
}

export interface PokemonSheet {
  id: string;
  campaignId: string;
  trainerId?: string; // Treinador vinculado (opcional)
  ownerId: string; // Usuário que controla esta ficha
  nickname: string;
  species: string;
  types: [PokemonType] | [PokemonType, PokemonType];
  level: number;
  xp: number;
  pev: number; // Pontos de Evolução
  evolutionsCount: number; // evoluções permanentes (+4 PV, +1 PE cada)
  spriteUrl: string;
  
  // Atributos: Corpo, Instinto, Energia
  corpo: DiceRank;
  instinto: DiceRank;
  energia: DiceRank;
  
  // Derived
  maxHp: number; // 12 + (2 * facial value Corpo) + (2 * (level - 1)) + 4 * evolutionsCount
  currentHp: number;
  maxPe: number; // 2 + Math.ceil(level / 2) + evolutionsCount
  currentPe: number;
  defense: number; // 10 + Agilidade bonus
  
  // 14 Skills
  skills: Record<string, DiceRank>;

  // Traits & Bond
  naturalTrait: { name: string; effect: string };
  personality: string;
  bondStage: number; // 0: Desconhecidos, 1: Familiaridade, 2: Parceria, 3: Confiança, 4: Vínculo Profundo
  
  // Moves (up to 4)
  moves: PokemonMove[];
  
  // Conditions currently active
  conditions: string[];

  // Item equipado / segurado
  heldItemId?: string;
  heldItemName?: string;
  
  // Diário e histórico
  diary?: PokemonDiaryEntry[];
  captureDate?: string;
  captureLocation?: string;
  originalTrainerName?: string;
  
  notes: string;
}

export interface DiceRollResult {
  id: string;
  timestamp: string;
  rollerName: string;
  testName: string;
  attributeName: string;
  attributeDice: DiceRank;
  attributeRoll: number;
  skillName: string;
  skillDice: DiceRank;
  skillRoll: number;
  bonus: number; // +2 advantage, -2 complication, etc.
  total: number;
  targetCa: number;
  outcome: 'Sucesso Forte' | 'Sucesso' | 'Sucesso com Custo' | 'Falha';
  details: string;
}

export interface PokedexSpecies {
  id: string;
  dexNumber: number;
  name: string;
  generation: 1 | 2 | 3;
  types: [PokemonType] | [PokemonType, PokemonType];
  spriteUrl: string;
  description: string;
  habitat: string;
  rarity: 'Comum' | 'Incomum' | 'Raro' | 'Muito raro' | 'Lendário';
  baseAttributes: {
    corpo: DiceRank;
    instinto: DiceRank;
    energia: DiceRank;
  };
  suggestedSkills: Record<string, DiceRank>;
  naturalTraits: { name: string; effect: string }[];
  learnableMoves: PokemonMove[];
  evolutions?: {
    targetSpeciesName: string;
    costPev: number;
    reqLevel: number;
    reqDescription: string;
  }[];
  systemNotes?: string;
  custom?: boolean;
}

export interface Combatant {
  id: string;
  type: 'trainer' | 'pokemon';
  sheetId?: string;
  name: string;
  trainerId?: string;
  activePokemonId?: string;
  avatarUrl: string;
  initiative: number;
  hasRolledInitiative: boolean;
  currentHp: number;
  maxHp: number;
  currentPe?: number;
  maxPe?: number;
  defense: number;
  defensiveReactionUsedThisRound: boolean;
  mainActionUsed: boolean;
  movementUsed: boolean;
  reactionUsed: boolean;
  conditions: string[];
  status: 'active' | 'incapacitated' | 'fled' | 'neutralized';
  isEnemy?: boolean;
}

export interface CombatLogEntry {
  id: string;
  round: number;
  timestamp: string;
  message: string;
  type: 'attack' | 'damage' | 'heal' | 'condition' | 'initiative' | 'capture' | 'switch' | 'general' | 'round_change' | 'turn_change';
}

export interface CombatSession {
  id: string;
  campaignId?: string;
  name: string;
  round: number;
  currentTurnIndex: number;
  isActive: boolean;
  environmentNotes: string;
  combatants: Combatant[];
  actionLog: CombatLogEntry[];
  createdAt: string;
}

