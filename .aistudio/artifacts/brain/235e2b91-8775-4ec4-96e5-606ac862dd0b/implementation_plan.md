# Project Mew — Grande Expansão de Conteúdo e Sistemas

Plano arquitetural e funcional para transformar o **Project Mew** em uma plataforma completa para organizar e jogar campanhas do RPG de mesa Pokémon baseado no sistema *Além da Próxima Rota* (Edição 1.0).

---

## User Review & Critical Decisions

> [!IMPORTANT]
> **Decisões confirmadas com o usuário na Fase de Alinhamento:**
> 1. **Catálogo de Movimentos**: Catálogo local estruturado e integrado cobrindo as Gerações I a IX, com importador e buscador ao vivo conectado à PokéAPI oficial para importações idempotentes sob demanda.
> 2. **Navegação Lateral**: Organização das ferramentas em 4 categorias claras para evitar poluição visual:
>    - 🎲 **Mesa & Ação**: Dashboard, Treinadores, Pokémon, Inventários da Equipe, Combate Tático
>    - 📖 **Compêndios**: Pokédex (Kanto & Campanha), Biblioteca de Movimentos, Catálogo Central de Itens, Condições de Batalha
>    - 🗺️ **Mundo de Jogo**: Atlas de Kanto & Locais, Ginásios & Competição, Missões & Objetivos, NPCs & Comerciantes, Lojas & Economia
>    - 🛡️ **Área do Mestre**: Construtor de Encontros, Relógios de Mundo, Diário de Sessões, Recursos do Mestre
> 3. **Combate Tático**: Modo **Assistido**, onde o sistema calcula e sugere o consumo de PE, dano e efeitos conforme a escala oficial (*Básico d4/0PE*, *Comum d6/1PE*, *Forte d8/2PE*, *Assinatura d10/3PE*, *Supremo d12/4PE*), com confirmação explícita do Mestre antes de aplicar nos PV/PE dos combatentes.

---

## 1. Overview & Core Concept

- **O Que a Plataforma Faz**: Centraliza toda a condução de campanhas de RPG Pokémon sem depender de fichas impressas ou planilhas externas. Conecta fichas altamente customizáveis, criaturas com ciclo de vida e diário individual, compêndios completos de movimentos e itens, economia real com carteiras de Pokédólares, lojas por localidade e combate assistido.
- **Público-Alvo**: Mestres de RPG conduzindo aventuras no cenário oficial ou personalizado, e Jogadores gerenciando seus treinadores e equipes de monstrinhos.
- **Proposta de Valor**: Regras mecânicas fiéis ao *Manual de Campo 1.0*, persistência blindada contra recarregamentos e quedas de sessão, e total separação entre os dados de videogames e as adaptações aprovadas de RPG.

---

## 2. User Experience & Visual Design

### Fluxos Principais do Usuário

1. **Gestão Flexível de Fichas de Treinador**:
   - Criar treinador Nível 1 sem impor classe ou trilha prévias (ex: Douglas Ventura como *Sobrevivente*).
   - Navegação por 7 abas funcionais: *1. Identidade*, *2. Atributos & Perícias*, *3. Progressão*, *4. Habilidades*, *5. Equipe Pokémon*, *6. Inventário*, *7. História & Relações*.
   - Salvo em tempo real com indicador visual no cabeçalho (*Salvando...*, *Salvo.*, *Erro*).

2. **Fichas Individuais de Pokémon & Diário de Bordo**:
   - Criação a partir da espécie de Kanto sem sobrescrever a Pokédex oficial.
   - Associação/Desassociação de treinador livremente (pode ser da equipe, selvagem ou de NPC).
   - Aba **Diário do Pokémon**: linha do tempo que registra captura (data/local), treinador original, trocas, aprendizado de movimentos, cicatrizes de batalha e evolução narrativa.

3. **Biblioteca de Movimentos (Videogames vs. RPG)**:
   - Visualização com filtros por Tipo, Categoria, Geração (I a IX), Potência e Status de Adaptação.
   - Detalhe em modal com duas camadas claras:
     - *Dados Oficiais dos Videogames*: Potência, Precisão, PP, Alvo, Prioridade, Jogos.
     - *Adaptação Além da Próxima Rota*: Categoria de Potência (Básico d4 a Supremo d12), Custo em PE, Atributo/Perícia de teste, Alcance, Condições.
   - Buscador e importador em tempo real com a PokéAPI para adicionar novos movimentos ao banco local com verificação de duplicatas (idempotência).

4. **Catálogo de Itens & Multi-Inventário Operacional**:
   - Catálogo de 10 categorias com preservação estrita dos 20 itens oficiais do Manual (Poké Bola 200 PD, Poção 300 PD, etc.).
   - Inventários independentes: Mochila do Treinador, Item Segurado do Pokémon, Estoque da Campanha, Lojas e NPCs.
   - Operações reais sem duplicação: Transferir itens, Equipar/Desequipar e Consumir (deduzindo a quantidade e aplicando curas de PV ou remoção de condições).

5. **Economia, Carteiras & Lojas**:
   - Carteira de Pokédólares por treinador e tesouraria da campanha.
   - Lojas por localidade (ex: Poké Mart de Viridian, Loja de Departamentos de Celadon, Comerciantes itinerantes vinculados a NPCs).
   - Registro permanente e auditável de compras, vendas e recompensas.

6. **Gerenciador de Condições & Combate Assistido**:
   - Compêndio das condições oficiais (Envenenado, Queimado, Paralisado, Sono, Confuso, Congelado, Exaustão, Nocauteado).
   - Painel tático que permite ao Pokémon usar um golpe conhecido, deduzir PE sugerido, registrar dano e aplicar/remover condições com registro no log da batalha.

---

## 3. Key Product Decisions & Trade-Offs

- **Decisão 1: Catálogo Local Híbrido com PokéAPI**:
  - *Abordagem*: Manter um catálogo local robusto pré-carregado no código cobrindo todas as gerações e tipos, complementado por um importador assíncrono que consulta a PokéAPI e grava localmente sob demanda.
  - *Por que*: Elimina lentidão e falhas de CORS/rede ao abrir a biblioteca, garantindo funcionamento offline instantâneo, enquanto atende 100% à exigência de consultar a PokéAPI sem limites de paginação.
- **Decisão 2: Persistência Reativa e Blindada no StorageService**:
  - *Abordagem*: Manter a infraestrutura de armazenamento permanente via `storageService` com barramento de eventos, estados de rascunho de segurança e exportação/importação de backup completo em JSON.
  - *Por que*: Evita perdas durante edições acidentais, preserva integridade relacional entre entidades e permite portabilidade total da campanha.
- **Decisão 3: Não Modificar a Pokédex de Kanto Existente**:
  - *Abordagem*: Manter intacto o arquivo `pokedexKanto.ts` com seus 151 registros e imagens. Adicionar uma camada de **Pokédex da Campanha** para rastrear o estado da aventura (Avistado, Capturado, Conhecido, Desconhecido) por mesa.

---

## 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                          PROJECT MEW PLATFORM                          │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│   ┌─────────────────────┐   ┌─────────────────┐   ┌────────────────┐   │
│   │   Fichas & Mesa     │   │   Compêndios    │   │  Mundo & GM    │   │
│   │  - TrainersView     │   │  - PokedexView  │   │  - AtlasView   │   │
│   │  - PokemonView      │   │  - MoveLibView  │   │  - GymsView    │   │
│   │  - InventoryView    │   │  - ItemLibView  │   │  - QuestsView  │   │
│   │  - CombatView       │   │  - CondView     │   │  - EconomyView │   │
│   └──────────┬──────────┘   └────────┬────────┘   └───────┬────────┘   │
│              │                       │                    │            │
│              └───────────────────────┼────────────────────┘            │
│                                      ▼                                 │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │                    STORAGE SERVICE (CORE)                      │   │
│   │  - Reactive saveStatus listener ('saving'|'saved'|'error')     │   │
│   │  - Multi-Inventory Manager (Transfer, Consume, Equip)         │   │
│   │  - PokéAPI Idempotent Move Importer                            │   │
│   │  - Wallet & Economy Engine (Transactions, Shops, Balance)      │   │
│   │  - Conditions Engine (Apply, Remove, Battle Log Sync)          │   │
│   │  - Pokémon Diary & Bond Progression Tracker                    │   │
│   │  - Full Campaign JSON Backup (Export / Import)                 │   │
│   └──────────────────────────────────┬─────────────────────────────┘   │
│                                      ▼                                 │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │             PERSISTENT BROWSER & LOCAL STORAGE ENGINE          │   │
│   └────────────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────────┘
```

### Mapeamento de Entidades e Estados

- **Movimentos**:
  - `PokemonMove` & `LibraryMove`: Contêm campos de videogame (`vgPower`, `vgAccuracy`, `vgPp`, `generation`, etc.) e campos de RPG (`tier`, `peCost`, `testType`, `damageDice`, `range`, `adaptationStatus`).
  - Status: `'imported' | 'pending' | 'suggested' | 'gm_adapted' | 'approved' | 'disabled'`.
- **Itens e Inventário**:
  - `OfficialItem`: Modelo central contendo preços fixos do Manual de Campo 1.0 e as 10 categorias.
  - `InventoryItem`: Instância real no inventário de um treinador, Pokémon, loja ou campanha, com quantidade, cargas e status de equipado.
- **Economia**:
  - `WalletTransaction`: Histórico com id, quantia, saldo resultante, tipo de operação e descrição.
  - `Shop`: Loja com estoque de itens, preços customizáveis, descontos e NPC comerciante associado.
- **Pokémon & Diário**:
  - `PokemonSheet`: Separado da espécie na Pokédex; possui 14 perícias graduadas, vínculo, equipe ou estado livre, item segurado e array de `PokemonDiaryEntry`.

---

## 5. Roteiro de Execução das Etapas

1. **Camada de Dados & Storage**:
   - Integrar `OFFICIAL_MOVES_CATALOG` e `OFFICIAL_ITEMS_CATALOG` ao `storageService`.
   - Adicionar métodos de carteira, lojas, transações, inventário multi-proprietário, condições, diário e backup estendido.
   - Implementar função de busca e importação idempotente da PokéAPI.
2. **Interface da Biblioteca de Movimentos & Adaptação**:
   - Atualizar `MoveLibraryView` com aba de dados de videogame vs adaptação de RPG, filtros detalhados e botão de busca/importação ao vivo via PokéAPI.
3. **Interface do Catálogo de Itens & Inventário**:
   - Atualizar `InventoryView` para gerenciar tanto a biblioteca de modelos de itens quanto os inventários de Treinadores, Pokémon, Campanhas e Lojas.
   - Adicionar ações de consumir (com aplicação de cura/condição) e equipar item segurado.
4. **Módulo de Economia e Lojas**:
   - Criar `EconomyView` com saldo dos treinadores, compras/vendas de Poké Marts e registro auditável de transações.
5. **Módulo de Condições & Integração com Combate**:
   - Criar `ConditionsView` e integrar custos de PE e condições diretamente ao `CombatView`.
6. **Diário de Bordo do Pokémon**:
   - Adicionar aba de Diário na `PokemonSheetModal` para histórico narrativo e marcos de vínculo.
7. **Organização da Navegação Lateral (`Sidebar.tsx`)**:
   - Reorganizar as abas em Mesa, Compêndios, Mundo e Mestre conforme escolha confirmada.
8. **Execução da Bateria de Testes Obrigatórios (Testes A a I)** e Validação Final.
