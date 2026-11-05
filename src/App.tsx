/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { storageService, calculateTrainerMaxHp, calculateTrainerDefense, calculatePokemonMaxHp, calculatePokemonMaxPe, calculatePokemonDefense } from './services/storageService';
import { TrainerSheet, PokemonSheet, WorldClock, PokemonMove, Campaign, PokedexSpecies } from './types';
import { DiceRank } from './data/rulesData';

// Layout & Components
import { Navbar } from './components/Navbar';
import { Sidebar, NavTab } from './components/Sidebar';
import { DiceRollerDrawer } from './components/DiceRollerDrawer';
import { CompendiumModal } from './components/CompendiumModal';
import { AuthModal } from './components/AuthModal';
import { NewCampaignModal } from './components/NewCampaignModal';
import { JoinCampaignModal } from './components/JoinCampaignModal';
import { CampaignSettingsModal } from './components/CampaignSettingsModal';
import { TrainerSheetModal } from './components/TrainerSheetModal';
import { PokemonSheetModal } from './components/PokemonSheetModal';

// Views
import { OverviewView } from './views/OverviewView';
import { TrainersView } from './views/TrainersView';
import { PokemonView } from './views/PokemonView';
import { ClocksView } from './views/ClocksView';
import { SessionsView } from './views/SessionsView';
import { MasterZoneView } from './views/MasterZoneView';
import { CampaignsListView } from './views/CampaignsListView';
import { PokedexView } from './views/PokedexView';
import { CombatView } from './views/CombatView';
import { MoveLibraryView } from './views/MoveLibraryView';
import { NPCsView } from './views/NPCsView';
import { InventoryView } from './views/InventoryView';
import { EconomyView } from './views/EconomyView';
import { ConditionsView } from './views/ConditionsView';
import { QuestsView } from './views/QuestsView';
import { AtlasView } from './views/AtlasView';
import { GymsView } from './views/GymsView';
import { EncountersView } from './views/EncountersView';
import { FactionsView } from './views/FactionsView';
import { MysteriesView } from './views/MysteriesView';
import { WorldStateView } from './views/WorldStateView';
import { NewsView } from './views/NewsView';
import { TournamentsView } from './views/TournamentsView';
import { SessionPrepView } from './views/SessionPrepView';
import { VttView } from './views/VttView';
import { GmAssistantView } from './views/GmAssistantView';
import { CampaignFilesView } from './views/CampaignFilesView';

const MainApp: React.FC = () => {
  const { activeCampaign, currentUser, isGM, refreshCampaigns, selectCampaign } = useAuth();
  const [currentTab, setCurrentTab] = useState<NavTab>('overview');

  // Modals & Drawers
  const [isDiceOpen, setIsDiceOpen] = useState(false);
  const [initialRollParams, setInitialRollParams] = useState<{
    testName?: string;
    attributeName?: string;
    attributeDice?: DiceRank;
    skillName?: string;
    skillDice?: DiceRank;
    targetCa?: number;
  } | undefined>(undefined);

  const [isCompendiumOpen, setIsCompendiumOpen] = useState(false);
  const [authModalState, setAuthModalState] = useState<{ open: boolean; mode?: 'login' | 'register' | 'profile' }>({
    open: false,
    mode: 'login',
  });
  const [isNewCampaignOpen, setIsNewCampaignOpen] = useState(false);
  const [isJoinCampaignOpen, setIsJoinCampaignOpen] = useState(false);
  const [settingsCampaign, setSettingsCampaign] = useState<Campaign | null>(null);

  // Sheets state
  const [trainers, setTrainers] = useState<TrainerSheet[]>(() =>
    storageService.getTrainers(activeCampaign?.id)
  );
  const [pokemons, setPokemons] = useState<PokemonSheet[]>(() =>
    storageService.getPokemons(activeCampaign?.id)
  );

  const [activeTrainerModal, setActiveTrainerModal] = useState<TrainerSheet | null>(null);
  const [activePokemonModal, setActivePokemonModal] = useState<PokemonSheet | null>(null);

  // Sync sheets when activeCampaign changes
  React.useEffect(() => {
    if (activeCampaign) {
      setTrainers(storageService.getTrainers(activeCampaign.id));
      setPokemons(storageService.getPokemons(activeCampaign.id));
    }
  }, [activeCampaign]);

  const handleRefreshAll = () => {
    refreshCampaigns();
    if (activeCampaign) {
      setTrainers(storageService.getTrainers(activeCampaign.id));
      setPokemons(storageService.getPokemons(activeCampaign.id));
    }
  };

  // Quick Roll helper
  const handleQuickRoll = (
    attrName: string,
    attrDice: DiceRank,
    skillName: string,
    skillDice: DiceRank,
    targetCa: number = 10
  ) => {
    setInitialRollParams({
      testName: `Teste de ${attrName} + ${skillName}`,
      attributeName: attrName,
      attributeDice: attrDice,
      skillName: skillName,
      skillDice: skillDice,
      targetCa,
    });
    setIsDiceOpen(true);
  };

  const handleExecuteMove = (move: PokemonMove) => {
    setIsDiceOpen(true);
  };

  // World Clocks advance/decrement
  const handleAdvanceClock = (clock: WorldClock, delta: number) => {
    if (!activeCampaign) return;
    const nextFilled = Math.max(0, Math.min(clock.totalSegments, clock.filledSegments + delta));
    const updated = { ...clock, filledSegments: nextFilled };
    storageService.updateClock(activeCampaign.id, updated);
    refreshCampaigns();
  };

  // Trainer Handlers
  const handleSaveTrainer = (updated: TrainerSheet) => {
    storageService.saveTrainer(updated);
    setTrainers(storageService.getTrainers(activeCampaign?.id));
    if (activeTrainerModal?.id === updated.id) {
      setActiveTrainerModal(updated);
    }
  };

  const handleDeleteTrainer = (id: string) => {
    storageService.deleteTrainer(id, true);
    setTrainers(storageService.getTrainers(activeCampaign?.id));
    setPokemons(storageService.getPokemons(activeCampaign?.id));
    setActiveTrainerModal(null);
  };

  const handleNewTrainer = () => {
    if (!activeCampaign || !currentUser) return;
    const newSheet: TrainerSheet = {
      id: 'tr_' + Date.now().toString(36),
      campaignId: activeCampaign.id,
      ownerId: currentUser.id,
      ownerName: currentUser.name,
      name: 'Novo Treinador',
      age: 15,
      region: activeCampaign.publicInfo.region || 'Kanto',
      concept: 'Jovem iniciando sua jornada...',
      goal: 'Conquistar sua primeira insígnia oficial.',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300',
      origin: 'Prodígio',
      className: '',
      trackName: '',
      level: 1,
      xp: 0,
      corpo: 'd6',
      mente: 'd6',
      presenca: 'd6',
      maxHp: calculateTrainerMaxHp('d6', 1),
      currentHp: calculateTrainerMaxHp('d6', 1),
      defense: 10,
      skills: {
        Reflexos: 'd4',
        Atletismo: 'd4',
        Combate: 'd4',
        Pontaria: 'd4',
        Investigação: 'd6',
        Conhecimento: 'd6',
        'Trato Pokémon': 'd4',
        Coordenação: 'd4',
      },
      originAbility: {
        name: 'Padrão na Bagunça',
        desc: 'Uma vez por cena ao investigar, pergunte qual detalhe observado merece atenção primeiro.',
      },
      classAbilities: [],
      sharedAbilities: [],
      personalAbility: { name: '', desc: '' },
      inventory: [
        { id: 'item_1', name: 'Poké Bola', category: 'Dispositivo', quantity: 2, effect: 'Dispositivo comum de captura.' },
        { id: 'item_2', name: 'Poção', category: 'Medicina', quantity: 1, effect: 'Recupera 1d6 + 2 PV.' },
      ],
      pokedollars: 1000,
      relationships: 'Família em sua cidade natal.',
      fears: 'Perder seu parceiro inicial em um confronto perigoso.',
      openQuestions: 'O que existe além das rotas catalogadas?',
      notes: '',
    };

    storageService.saveTrainer(newSheet);
    setTrainers(storageService.getTrainers(activeCampaign.id));
    setActiveTrainerModal(newSheet);
  };

  // Pokémon Handlers
  const handleSavePokemon = (updated: PokemonSheet) => {
    storageService.savePokemon(updated);
    setPokemons(storageService.getPokemons(activeCampaign?.id));
    if (activePokemonModal?.id === updated.id) {
      setActivePokemonModal(updated);
    }
  };

  const handleDeletePokemon = (id: string) => {
    storageService.deletePokemon(id);
    setPokemons(storageService.getPokemons(activeCampaign?.id));
    setActivePokemonModal(null);
  };

  const handleNewPokemon = () => {
    if (!activeCampaign || !currentUser) return;
    const newSheet: PokemonSheet = {
      id: 'poke_' + Date.now().toString(36),
      campaignId: activeCampaign.id,
      ownerId: currentUser.id,
      nickname: 'Eevee',
      species: 'Eevee',
      types: ['Normal'],
      level: 1,
      xp: 0,
      pev: 0,
      evolutionsCount: 0,
      spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/133.png',
      corpo: 'd6',
      instinto: 'd6',
      energia: 'd6',
      maxHp: calculatePokemonMaxHp('d6', 1, 0),
      currentHp: calculatePokemonMaxHp('d6', 1, 0),
      maxPe: calculatePokemonMaxPe(1, 0),
      currentPe: calculatePokemonMaxPe(1, 0),
      defense: calculatePokemonDefense('d6'),
      skills: {
        'Ataque Físico': 'd6',
        Agilidade: 'd6',
        Percepção: 'd6',
        'Controle de Tipo': 'd4',
        Resistência: 'd4',
      },
      naturalTrait: {
        name: 'Apoio Natural',
        effect: 'Ajuda aliado em tarefa coerente usando Suporte ou Coordenação.',
      },
      personality: 'Curioso, afetuoso e expressivo.',
      bondStage: 1,
      moves: [
        {
          id: 'mv_tackle',
          name: 'Investida',
          type: 'Normal',
          category: 'Físico',
          tier: 'Básico',
          damageDice: '1d4',
          peCost: 0,
          range: 'Corpo a corpo',
          effect: 'Golpe físico direto sem consumo de energia.',
        },
        {
          id: 'mv_sand',
          name: 'Ataque de Areia',
          type: 'Terra',
          category: 'Suporte',
          tier: 'Comum',
          damageDice: '-',
          peCost: 1,
          range: 'Perto',
          effect: 'Joga areia nos olhos do alvo impondo -2 no próximo ataque.',
        },
      ],
      conditions: [],
      notes: '',
    };

    storageService.savePokemon(newSheet);
    setPokemons(storageService.getPokemons(activeCampaign.id));
    setActivePokemonModal(newSheet);
  };

  const handleCreatePokemonFromSpecies = (sp: PokedexSpecies) => {
    if (!activeCampaign || !currentUser) return;
    const starterHp = calculatePokemonMaxHp(sp.baseAttributes.corpo, 1, 0);
    const starterPe = calculatePokemonMaxPe(1, 0);
    const starterDef = calculatePokemonDefense('d6');

    const newSheet: PokemonSheet = {
      id: 'poke_' + Date.now().toString(36),
      campaignId: activeCampaign.id,
      ownerId: currentUser.id,
      nickname: sp.name,
      species: sp.name,
      types: sp.types,
      level: 1,
      xp: 0,
      pev: 0,
      evolutionsCount: 0,
      spriteUrl: sp.spriteUrl,
      corpo: sp.baseAttributes.corpo,
      instinto: sp.baseAttributes.instinto,
      energia: sp.baseAttributes.energia,
      maxHp: starterHp,
      currentHp: starterHp,
      maxPe: starterPe,
      currentPe: starterPe,
      defense: starterDef,
      skills: sp.suggestedSkills || {
        'Ataque Físico': 'd6',
        'Ataque Especial': 'd6',
        Agilidade: 'd6',
        Percepção: 'd6',
        'Instinto de Batalha': 'd6',
        Resistência: 'd6',
      },
      naturalTrait: sp.naturalTraits[0] || {
        name: 'Instinto Natural',
        effect: 'Sentidos aguçados e percepção ambiental aguçada.',
      },
      personality: 'Temperamento característico da espécie.',
      bondStage: 1,
      moves:
        sp.learnableMoves && sp.learnableMoves.length > 0
          ? sp.learnableMoves.slice(0, 4)
          : [
              {
                id: 'mv_starter_1',
                name: 'Investida',
                type: 'Normal',
                category: 'Físico',
                tier: 'Básico',
                damageDice: '1d4',
                peCost: 0,
                range: 'Corpo a corpo',
                effect: 'Ataque básico sem custo de energia.',
              },
            ],
      conditions: [],
      notes: `Originado do compêndio Pokédex (#${String(sp.dexNumber).padStart(3, '0')}).`,
    };

    storageService.savePokemon(newSheet);
    setPokemons(storageService.getPokemons(activeCampaign.id));
    setActivePokemonModal(newSheet);
  };

  return (
    <div className="min-h-screen bg-[#0b0c10] text-slate-100 flex flex-col cris-grid-bg">
      {/* Top Navigation */}
      <Navbar
        onOpenDiceRoller={() => {
          setInitialRollParams(undefined);
          setIsDiceOpen(true);
        }}
        onOpenCompendium={() => setIsCompendiumOpen(true)}
        onOpenAuth={(mode) => setAuthModalState({ open: true, mode: mode || 'profile' })}
        onOpenNewCampaign={() => setIsNewCampaignOpen(true)}
        onOpenJoinCampaign={() => setIsJoinCampaignOpen(true)}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={(tab) => {
            if (tab === 'compendium') {
              setIsCompendiumOpen(true);
            } else {
              setCurrentTab(tab);
            }
          }}
          onOpenDiceRoller={() => {
            setInitialRollParams(undefined);
            setIsDiceOpen(true);
          }}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {currentTab === 'overview' && (
            <OverviewView
              trainers={trainers}
              pokemons={pokemons}
              onOpenTrainer={(sheet) => setActiveTrainerModal(sheet)}
              onOpenPokemon={(sheet) => setActivePokemonModal(sheet)}
              onOpenNewTrainer={handleNewTrainer}
              onOpenNewPokemon={handleNewPokemon}
              onOpenSettings={() => setSettingsCampaign(activeCampaign)}
              onAdvanceClock={handleAdvanceClock}
              onNavigateTab={(tab) => setCurrentTab(tab)}
            />
          )}

          {currentTab === 'campaigns' && (
            <CampaignsListView
              onOpenNewCampaign={() => setIsNewCampaignOpen(true)}
              onOpenJoinCampaign={() => setIsJoinCampaignOpen(true)}
              onOpenSettings={(camp) => setSettingsCampaign(camp)}
              onSelectCampaign={(id) => {
                selectCampaign(id);
                setCurrentTab('overview');
              }}
            />
          )}

          {currentTab === 'trainers' && (
            <TrainersView
              trainers={trainers}
              onOpenTrainer={(sheet) => setActiveTrainerModal(sheet)}
              onNewTrainer={handleNewTrainer}
              onQuickRoll={handleQuickRoll}
            />
          )}

          {currentTab === 'pokemon' && (
            <PokemonView
              pokemons={pokemons}
              onOpenPokemon={(sheet) => setActivePokemonModal(sheet)}
              onNewPokemon={handleNewPokemon}
              onExecuteMove={handleExecuteMove}
            />
          )}

          {currentTab === 'combat' && (
            <CombatView
              onOpenDiceRoller={() => {
                setInitialRollParams(undefined);
                setIsDiceOpen(true);
              }}
              onOpenPokemonSheet={(sheet) => setActivePokemonModal(sheet)}
              onOpenTrainerSheet={(sheet) => setActiveTrainerModal(sheet)}
            />
          )}

          {currentTab === 'pokedex' && (
            <PokedexView
              onSelectSpeciesForCreation={handleCreatePokemonFromSpecies}
            />
          )}

          {currentTab === 'moves' && (
            <MoveLibraryView onQuickRoll={handleQuickRoll} />
          )}

          {currentTab === 'npcs' && (
            <NPCsView />
          )}

          {currentTab === 'inventory' && (
            <InventoryView />
          )}

          {currentTab === 'conditions' && (
            <ConditionsView
              campaignId={activeCampaign?.id || 'sample_kanto'}
              pokemonList={pokemons}
              onRefreshCampaign={handleRefreshAll}
            />
          )}

          {currentTab === 'atlas' && (
            <AtlasView
              campaignId={activeCampaign?.id || 'sample_kanto'}
              isGm={isGM}
            />
          )}

          {currentTab === 'gyms' && (
            <GymsView
              campaignId={activeCampaign?.id || 'sample_kanto'}
              trainers={trainers}
              onRefreshCampaign={handleRefreshAll}
            />
          )}

          {currentTab === 'quests' && (
            <QuestsView
              campaignId={activeCampaign?.id || 'sample_kanto'}
              isGm={isGM}
            />
          )}

          {currentTab === 'economy' && (
            <EconomyView
              campaignId={activeCampaign?.id || 'sample_kanto'}
              trainers={trainers}
              onRefreshCampaign={handleRefreshAll}
            />
          )}

          {currentTab === 'vtt' && (
            <VttView />
          )}

          {currentTab === 'factions' && (
            <FactionsView campaignId={activeCampaign?.id || 'sample_kanto'} />
          )}

          {currentTab === 'mysteries' && (
            <MysteriesView />
          )}

          {currentTab === 'world-state' && (
            <WorldStateView />
          )}

          {currentTab === 'news' && (
            <NewsView />
          )}

          {currentTab === 'tournaments' && (
            <TournamentsView />
          )}

          {currentTab === 'session-prep' && (
            <SessionPrepView />
          )}

          {currentTab === 'gm-assistant' && (
            <GmAssistantView />
          )}

          {currentTab === 'campaign-files' && (
            <CampaignFilesView />
          )}

          {currentTab === 'encounters' && (
            <EncountersView
              campaignId={activeCampaign?.id || 'sample_kanto'}
            />
          )}

          {currentTab === 'clocks' && (
            <ClocksView
              onAdvanceClock={handleAdvanceClock}
              onRefreshCampaigns={handleRefreshAll}
            />
          )}

          {currentTab === 'sessions' && (
            <SessionsView onRefreshCampaigns={handleRefreshAll} />
          )}

          {currentTab === 'master-zone' && (
            <MasterZoneView onRefreshCampaigns={handleRefreshAll} />
          )}
        </main>
      </div>

      {/* Global Modals & Drawers */}
      <DiceRollerDrawer
        isOpen={isDiceOpen}
        onClose={() => setIsDiceOpen(false)}
        rollerName={currentUser?.name || 'Treinador'}
        initialRollParams={initialRollParams}
      />

      <CompendiumModal
        isOpen={isCompendiumOpen}
        onClose={() => setIsCompendiumOpen(false)}
      />

      <AuthModal
        isOpen={authModalState.open}
        initialMode={authModalState.mode}
        onClose={() => setAuthModalState({ open: false })}
      />

      <NewCampaignModal
        isOpen={isNewCampaignOpen}
        onClose={() => setIsNewCampaignOpen(false)}
        onCreated={(camp) => {
          refreshCampaigns();
          selectCampaign(camp.id);
          setCurrentTab('overview');
        }}
      />

      <JoinCampaignModal
        isOpen={isJoinCampaignOpen}
        onClose={() => setIsJoinCampaignOpen(false)}
        onJoined={(camp) => {
          refreshCampaigns();
          selectCampaign(camp.id);
          setCurrentTab('overview');
        }}
      />

      {settingsCampaign && (
        <CampaignSettingsModal
          campaign={settingsCampaign}
          isOpen={true}
          onClose={() => setSettingsCampaign(null)}
          onUpdated={() => {
            refreshCampaigns();
            setSettingsCampaign(null);
          }}
          onDeleted={() => {
            refreshCampaigns();
            setSettingsCampaign(null);
            setCurrentTab('campaigns');
          }}
        />
      )}

      {activeTrainerModal && (
        <TrainerSheetModal
          sheet={activeTrainerModal}
          isOpen={true}
          canEdit={isGM || activeTrainerModal.ownerId === currentUser?.id}
          onClose={() => setActiveTrainerModal(null)}
          onSave={handleSaveTrainer}
          onDelete={handleDeleteTrainer}
          onQuickRoll={(attrName, attrDice, skillName, skillDice) => {
            handleQuickRoll(attrName, attrDice, skillName, skillDice);
          }}
          onOpenPokemon={(pokemon) => setActivePokemonModal(pokemon)}
        />
      )}

      {activePokemonModal && (
        <PokemonSheetModal
          sheet={activePokemonModal}
          isOpen={true}
          canEdit={isGM || activePokemonModal.ownerId === currentUser?.id}
          trainers={trainers}
          onClose={() => setActivePokemonModal(null)}
          onSave={handleSavePokemon}
          onDelete={handleDeletePokemon}
          onQuickRoll={(attrName, attrDice, skillName, skillDice) => {
            handleQuickRoll(attrName, attrDice, skillName, skillDice);
          }}
          onExecuteMove={handleExecuteMove}
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
