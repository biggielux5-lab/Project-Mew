/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Campaign } from '../types';
import { storageService } from '../services/storageService';
import { Settings, Trash2, AlertTriangle, Save, X, Copy, Check } from 'lucide-react';

interface CampaignSettingsModalProps {
  campaign: Campaign;
  isOpen: boolean;
  onClose: () => void;
  onUpdated: (camp: Campaign) => void;
  onDeleted: (campId: string) => void;
}

export const CampaignSettingsModal: React.FC<CampaignSettingsModalProps> = ({
  campaign,
  isOpen,
  onClose,
  onUpdated,
  onDeleted,
}) => {
  const [formData, setFormData] = useState<Campaign>({ ...campaign });
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteInputName, setDeleteInputName] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    storageService.updateCampaign(formData);
    onUpdated(formData);
    onClose();
  };

  const handleDelete = () => {
    if (deleteInputName.trim() === campaign.name.trim()) {
      storageService.deleteCampaign(campaign.id);
      onDeleted(campaign.id);
      onClose();
    }
  };

  const copyInvite = () => {
    navigator.clipboard.writeText(campaign.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#12131d] border border-purple-900/40 rounded-2xl shadow-2xl p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-purple-900/20 pb-4">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-purple-400" />
            <h3 className="font-extrabold text-white text-base">Configurações da Campanha</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Invite Code Box */}
        <div className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-800/40 flex items-center justify-between gap-3">
          <div>
            <span className="text-[11px] font-bold uppercase text-purple-300 block">Código de Convite da Mesa</span>
            <span className="font-mono font-extrabold text-lg text-white tracking-widest">{campaign.code}</span>
          </div>
          <button
            onClick={copyInvite}
            className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all"
          >
            {copiedCode ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
            {copiedCode ? 'Copiado!' : 'Copiar Código'}
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Nome da Campanha</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-[#181928] border border-purple-900/30 rounded-lg px-3 py-2 text-xs text-white"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Sinopse</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-[#181928] border border-purple-900/30 rounded-lg px-3 py-2 text-xs text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Região</label>
              <input
                type="text"
                value={formData.publicInfo?.region || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    publicInfo: { ...formData.publicInfo, region: e.target.value },
                  })
                }
                className="w-full bg-[#181928] border border-purple-900/30 rounded-lg px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">URL da Capa</label>
              <input
                type="url"
                value={formData.coverImage}
                onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                className="w-full bg-[#181928] border border-purple-900/30 rounded-lg px-3 py-2 text-xs text-white"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Tom e Proposta de Jogo</label>
            <input
              type="text"
              value={formData.publicInfo?.tone || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  publicInfo: { ...formData.publicInfo, tone: e.target.value },
                })
              }
              className="w-full bg-[#181928] border border-purple-900/30 rounded-lg px-3 py-2 text-xs text-white"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Acordos de Campanha</label>
            <textarea
              rows={2}
              value={formData.publicInfo?.campaignAgreements || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  publicInfo: { ...formData.publicInfo, campaignAgreements: e.target.value },
                })
              }
              className="w-full bg-[#181928] border border-purple-900/30 rounded-lg px-3 py-2 text-xs text-white"
            />
          </div>

          {/* Permissões de Jogador */}
          <div className="p-3.5 rounded-xl bg-[#171828] border border-zinc-800 space-y-2.5">
            <span className="text-xs font-bold text-purple-300 block">
              Permissões de Edição para Jogadores
            </span>
            <p className="text-[11px] text-slate-400">
              Defina o que os jogadores têm autonomia para alterar em suas próprias fichas sem necessidade de aprovação direta do Mestre.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 text-xs">
              {[
                { key: 'canEditAttributes', label: 'Atributos' },
                { key: 'canEditSkills', label: 'Perícias' },
                { key: 'canEditMoves', label: 'Golpes & Movimentos' },
                { key: 'canEditInventory', label: 'Inventário da Bolsa' },
                { key: 'canEditXp', label: 'Experiência (XP)' },
                { key: 'canEditHistory', label: 'Histórico & Conceito' },
                { key: 'canEditNotes', label: 'Anotações da Ficha' },
              ].map(({ key, label }) => {
                const perms = formData.playerPermissions || {
                  canEditAttributes: false,
                  canEditSkills: false,
                  canEditMoves: true,
                  canEditInventory: true,
                  canEditXp: false,
                  canEditHistory: true,
                  canEditNotes: true,
                };
                const isChecked = (perms as any)[key] ?? true;

                return (
                  <label
                    key={key}
                    className="flex items-center gap-2 p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-slate-300 select-none cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => {
                        const updatedPerms = { ...perms, [key]: e.target.checked };
                        setFormData({ ...formData, playerPermissions: updatedPerms });
                      }}
                      className="rounded border-zinc-700 bg-zinc-950 text-purple-600 focus:ring-0"
                    />
                    <span className="text-[11px] font-medium">{label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Backup & Restore Section */}
          <div className="p-3.5 rounded-xl bg-[#171828] border border-purple-900/30 space-y-2.5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-purple-300 block">Backup & Integridade dos Dados</span>
                <span className="text-[11px] text-slate-400">
                  Exporte ou restaure todas as fichas, sessões, NPCs e itens desta campanha em formato JSON seguro.
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap pt-1">
              <button
                type="button"
                onClick={() => {
                  try {
                    const json = storageService.exportCampaignJson(campaign.id);
                    const blob = new Blob([json], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `ProjectMew_Backup_${campaign.name.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.json`;
                    a.click();
                    URL.revokeObjectURL(url);
                  } catch (err: any) {
                    alert('Erro ao exportar: ' + err.message);
                  }
                }}
                className="px-3 py-1.5 rounded-lg bg-purple-900/40 hover:bg-purple-800/60 border border-purple-700/60 text-purple-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Save className="w-3.5 h-3.5 text-purple-300" />
                Exportar Backup JSON
              </button>

              <label className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors">
                <Copy className="w-3.5 h-3.5 text-slate-300" />
                Importar Backup JSON
                <input
                  type="file"
                  accept=".json,application/json"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      const content = event.target?.result as string;
                      if (!content) return;
                      const res = storageService.importCampaignJson(content);
                      if (res.success) {
                        const updated = storageService.getCampaign(res.campaignId || campaign.id);
                        if (updated) onUpdated(updated);
                        alert('Backup restaurado com sucesso! Dados sincronizados.');
                      } else {
                        alert('Falha ao importar backup: ' + res.error);
                      }
                    };
                    reader.readAsText(file);
                  }}
                />
              </label>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-purple-900/20">
            <button
              type="button"
              onClick={() => setConfirmDelete(!confirmDelete)}
              className="px-3 py-2 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 border border-rose-900/50 text-rose-300 text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Excluir Campanha
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-slate-300"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white shadow-md flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                Salvar Alterações
              </button>
            </div>
          </div>
        </form>

        {/* Delete Confirmation Box */}
        {confirmDelete && (
          <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-600/60 space-y-3 animate-in fade-in duration-200">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-rose-200 text-sm">Ação Irreversível</h4>
                <p className="text-xs text-rose-300/90 leading-relaxed mt-0.5">
                  Para confirmar a exclusão desta campanha, digite exatamente o nome{' '}
                  <strong className="text-white underline">{campaign.name}</strong> no campo abaixo:
                </p>
              </div>
            </div>

            <input
              type="text"
              value={deleteInputName}
              onChange={(e) => setDeleteInputName(e.target.value)}
              placeholder="Digite o nome da campanha para confirmar..."
              className="w-full bg-black/60 border border-rose-500/50 rounded-lg px-3 py-2 text-xs text-white"
            />

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="px-3 py-1.5 rounded text-xs bg-zinc-800 text-slate-300"
              >
                Desistir
              </button>
              <button
                type="button"
                disabled={deleteInputName.trim() !== campaign.name.trim()}
                onClick={handleDelete}
                className="px-4 py-1.5 rounded text-xs font-bold bg-rose-600 hover:bg-rose-500 disabled:opacity-30 disabled:pointer-events-none text-white shadow-lg shadow-rose-950/60"
              >
                Confirmar Exclusão
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
