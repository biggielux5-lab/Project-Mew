/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Modal de confirmação segura de exclusão de entidades do Project Mew.
 */

import React, { useState } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  entityType: string; // e.g. "Treinador", "Pokémon", "Sessão", "Relógio de Mundo", "Campanha"
  entityName: string;
  details?: string;
  requireTypingName?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  entityType,
  entityName,
  details,
  requireTypingName = false,
  onClose,
  onConfirm,
}) => {
  const [typedName, setTypedName] = useState('');

  if (!isOpen) return null;

  const canConfirm = !requireTypingName || typedName.trim() === entityName.trim();

  const handleConfirm = () => {
    if (canConfirm) {
      onConfirm();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-md bg-[#12131e] border border-rose-900/60 rounded-2xl shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-400">
              <AlertTriangle className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">Excluir {entityType}?</h3>
              <p className="text-xs text-rose-300/80 font-mono">Esta ação não poderá ser desfeita</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-3.5 rounded-xl bg-[#18192a] border border-zinc-800 text-xs text-slate-300 space-y-2">
          <p>
            Você está prestes a remover o registro de <strong className="text-white font-bold">{entityName}</strong> permanentemente da campanha.
          </p>
          {details && (
            <p className="text-[11px] text-amber-300/90 bg-amber-950/30 p-2 rounded-lg border border-amber-900/40">
              {details}
            </p>
          )}
        </div>

        {requireTypingName && (
          <div className="space-y-1.5">
            <label className="text-[11px] text-slate-400 block">
              Digite <span className="text-rose-400 font-bold">{entityName}</span> para confirmar:
            </label>
            <input
              type="text"
              value={typedName}
              onChange={(e) => setTypedName(e.target.value)}
              placeholder={entityName}
              className="w-full bg-zinc-900 border border-rose-900/50 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-rose-500"
            />
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-purple-900/20">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-slate-300 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!canConfirm}
            className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-xs font-bold text-white shadow-lg transition-all flex items-center gap-1.5"
          >
            <Trash2 className="w-4 h-4" />
            Confirmar Exclusão
          </button>
        </div>
      </div>
    </div>
  );
};
