import React, { useState } from 'react';
import { 
  Coins, 
  Store, 
  ArrowUpRight, 
  ArrowDownLeft, 
  History, 
  ShoppingBag, 
  Check, 
  AlertCircle,
  User,
  Package
} from 'lucide-react';
import { Shop, ShopItem, WalletTransaction, TrainerSheet, OfficialItem } from '../types';
import { 
  getShops, 
  getWalletTransactions, 
  executeShopPurchase, 
  getOfficialItems,
  getInventories,
} from '../services/storageService';

interface EconomyViewProps {
  campaignId: string;
  trainers: TrainerSheet[];
  onRefreshCampaign?: () => void;
}

export const EconomyView: React.FC<EconomyViewProps> = ({
  campaignId,
  trainers,
  onRefreshCampaign
}) => {
  const [activeTab, setActiveTab] = useState<'shops' | 'wallets' | 'history'>('shops');
  const [shops, setShops] = useState<Shop[]>(() => getShops(campaignId));
  const [transactions, setTransactions] = useState<WalletTransaction[]>(() => getWalletTransactions(campaignId));
  const [officialItems] = useState<OfficialItem[]>(() => getOfficialItems());
  
  // Selected trainer for transactions
  const [selectedTrainerId, setSelectedTrainerId] = useState<string>(trainers[0]?.id || '');
  const activeTrainer = trainers.find((t: TrainerSheet) => t.id === selectedTrainerId) || trainers[0];

  // Purchase/Sale Modal state
  const [modalMode, setModalMode] = useState<'buy' | 'sell' | null>(null);
  const [activeShop, setActiveShop] = useState<Shop | null>(null);
  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const refreshData = () => {
    setShops(getShops(campaignId));
    setTransactions(getWalletTransactions(campaignId));
    if (onRefreshCampaign) onRefreshCampaign();
  };

  const handleOpenBuy = (shop: Shop, item: ShopItem) => {
    setActiveShop(shop);
    setSelectedItem(item);
    setQuantity(1);
    setErrorMsg(null);
    setSuccessMsg(null);
    setModalMode('buy');
  };

  const handleConfirmPurchase = () => {
    if (!activeShop || !selectedItem || !activeTrainer) return;
    const unitPrice = selectedItem.discountPercent
      ? Math.round(selectedItem.price * (1 - selectedItem.discountPercent / 100))
      : selectedItem.price;
    const totalCost = unitPrice * quantity;
    
    if (activeTrainer.pokedollars < totalCost) {
      setErrorMsg(`Saldo insuficiente! O treinador possui ¥${activeTrainer.pokedollars.toLocaleString('pt-BR')} PD e precisa de ¥${totalCost.toLocaleString('pt-BR')} PD.`);
      return;
    }

    const res = executeShopPurchase(
      campaignId,
      activeShop.id,
      selectedItem.itemId,
      activeTrainer.id,
      quantity
    );

    if (res.success) {
      setSuccessMsg(res.message);
      setTimeout(() => {
        setModalMode(null);
        refreshData();
      }, 900);
    } else {
      setErrorMsg(res.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Economy Overview */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Coins className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold text-white tracking-wide">Economia & Lojas de Kanto</h1>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Gestão de Pokédólares (¥ PD), caixas registradoras, mercados de rota e balanço das carteiras dos treinadores.
          </p>
        </div>

        {/* Active Trainer Selector for buying */}
        <div className="flex items-center gap-3 bg-slate-950/80 border border-slate-800 px-4 py-2.5 rounded-xl">
          <User className="w-4 h-4 text-emerald-400" />
          <div className="text-left">
            <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Treinador Ativo</div>
            <select
              value={selectedTrainerId}
              onChange={(e) => setSelectedTrainerId(e.target.value)}
              className="bg-transparent text-sm font-semibold text-white focus:outline-none cursor-pointer"
            >
              {trainers.map((t: TrainerSheet) => (
                <option key={t.id} value={t.id} className="bg-slate-900 text-white">
                  {t.name} (¥ {t.pokedollars?.toLocaleString('pt-BR') || 0} PD)
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 space-x-2">
        <button
          onClick={() => setActiveTab('shops')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-all ${
            activeTab === 'shops'
              ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Store className="w-4 h-4" />
          Mercados & Vendedores ({shops.length})
        </button>
        <button
          onClick={() => setActiveTab('wallets')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-all ${
            activeTab === 'wallets'
              ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Coins className="w-4 h-4" />
          Carteiras do Grupo ({trainers.length})
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-all ${
            activeTab === 'history'
              ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <History className="w-4 h-4" />
          Livro-Caixa de Transações ({transactions.length})
        </button>
      </div>

      {/* TAB 1: SHOPS */}
      {activeTab === 'shops' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {shops.map((shop: Shop) => (
            <div
              key={shop.id}
              className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-lg flex flex-col justify-between"
            >
              <div>
                <div className="p-4 border-b border-slate-800/80 flex items-start justify-between bg-slate-950/40">
                  <div>
                    <div className="flex items-center gap-2">
                      <Store className="w-4 h-4 text-emerald-400" />
                      <h3 className="font-semibold text-white text-base">{shop.name}</h3>
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      {shop.cityOrRoute} {shop.npcOwnerName ? `· Responsável: ${shop.npcOwnerName}` : ''}
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                    Horário: {shop.operatingHours || 'Comercial'}
                  </span>
                </div>

                {shop.description && (
                  <p className="px-4 py-2 text-xs text-slate-400 italic bg-slate-900/40 border-b border-slate-800/40">
                    "{shop.description}"
                  </p>
                )}

                {/* Shop Items Table */}
                <div className="divide-y divide-slate-800/60 max-h-72 overflow-y-auto">
                  {shop.items.map((item: ShopItem) => (
                    <div
                      key={item.itemId}
                      className="p-3 flex items-center justify-between hover:bg-slate-800/30 transition-colors"
                    >
                      <div className="min-w-0 pr-2">
                        <div className="text-sm font-medium text-slate-200 truncate">{item.name}</div>
                        <div className="text-xs text-slate-400 flex items-center gap-2">
                          <span className="text-emerald-400 font-semibold">¥ {item.price.toLocaleString('pt-BR')} PD</span>
                          <span>·</span>
                          <span>Estoque: {item.stock === -1 ? 'Ilimitado' : `${item.stock} un`}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleOpenBuy(shop, item)}
                        disabled={item.stock === 0}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:pointer-events-none text-white transition-colors flex items-center gap-1.5"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        Comprar
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-slate-950/60 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span>{shop.items.length} artigos disponíveis</span>
                <span className="text-[11px]">Pagamento com carteira de {activeTrainer?.name}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: WALLETS */}
      {activeTab === 'wallets' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {trainers.map((t: TrainerSheet) => (
            <div
              key={t.id}
              className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-lg relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-white text-base">{t.name}</h3>
                  <div className="text-xs text-slate-400">{t.origin || 'Kanto'} · Nível {t.level || 1}</div>
                </div>
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Coins className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-4 mb-4">
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Saldo Disponível</div>
                <div className="text-2xl font-black text-emerald-400 mt-1">
                  ¥ {t.pokedollars?.toLocaleString('pt-BR') || 0} <span className="text-xs font-medium text-slate-400">PD</span>
                </div>
              </div>

              <div className="text-xs text-slate-400 space-y-1">
                <div>Estilo de Vida: <span className="text-slate-200 font-medium">Sobrevivência de Estrada</span></div>
                <div>Última Movimentação: <span className="text-slate-200">Registrada no Livro-Caixa</span></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: HISTORY */}
      {activeTab === 'history' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <h3 className="font-semibold text-white text-sm flex items-center gap-2">
              <History className="w-4 h-4 text-emerald-400" />
              Auditoria de Transações e Movimentações Financeiras
            </h3>
            <span className="text-xs text-slate-400">{transactions.length} registros computados</span>
          </div>

          {transactions.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">
              Nenhuma transação financeira registrada nesta campanha ainda.
            </div>
          ) : (
            <div className="divide-y divide-slate-800/60">
              {transactions.map((tx: WalletTransaction) => {
                const isExpense = tx.type === 'purchase' || tx.amount < 0;
                return (
                  <div key={tx.id} className="p-3.5 flex items-center justify-between hover:bg-slate-800/20">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg ${
                          isExpense ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        }`}
                      >
                        {isExpense ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-slate-200">{tx.description}</div>
                        <div className="text-xs text-slate-400">
                          {tx.trainerName || 'Grupo'} · {new Date(tx.timestamp).toLocaleDateString('pt-BR')} às {new Date(tx.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>

                    <div className={`text-sm font-bold ${isExpense ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {isExpense ? '-' : '+'} ¥ {Math.abs(tx.amount).toLocaleString('pt-BR')} PD
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* BUY MODAL */}
      {modalMode === 'buy' && activeShop && selectedItem && activeTrainer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-white text-lg">Comprar Artigo</h3>
                <div className="text-xs text-slate-400">{activeShop.name} ({activeShop.cityOrRoute})</div>
              </div>
              <button
                onClick={() => setModalMode(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-lg space-y-1">
              <div className="text-base font-semibold text-white">{selectedItem.name}</div>
              <div className="text-xs text-slate-400">
                Preço Unitário: <span className="text-emerald-400 font-semibold">¥ {selectedItem.price.toLocaleString('pt-BR')} PD</span>
              </div>
              <div className="text-xs text-slate-400">
                Estoque Disponível: {selectedItem.stock === -1 ? 'Ilimitado' : `${selectedItem.stock} unidades`}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Quantidade Desejada</label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="1"
                  max={selectedItem.stock === -1 ? 99 : selectedItem.stock}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-24 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-semibold text-center focus:outline-none focus:border-emerald-500"
                />
                <div className="text-xs text-slate-400">
                  Total da Compra:{' '}
                  <span className="text-emerald-400 font-bold text-sm">
                    ¥ {(selectedItem.price * quantity).toLocaleString('pt-BR')} PD
                  </span>
                </div>
              </div>
            </div>

            <div className="text-xs text-slate-400 border-t border-slate-800/80 pt-3 flex justify-between">
              <span>Carteira de {activeTrainer.name}:</span>
              <span className="font-semibold text-white">¥ {activeTrainer.pokedollars.toLocaleString('pt-BR')} PD</span>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-xs text-rose-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-xs text-emerald-400 flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setModalMode(null)}
                className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmPurchase}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors flex items-center gap-1.5 shadow-md shadow-emerald-900/30"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                Confirmar Pagamento
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
