/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { storageService } from '../services/storageService';
import { Campaign } from '../types';
import { PlusCircle, Image, MapPin, Feather, X } from 'lucide-react';

interface NewCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (camp: Campaign) => void;
}

export const NewCampaignModal: React.FC<NewCampaignModalProps> = ({ isOpen, onClose, onCreated }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [region, setRegion] = useState('Kanto');
  const [tone, setTone] = useState('Aventura clássica de jornada com desafios táticos e mistério');
  const [coverImage, setCoverImage] = useState(
    'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&auto=format&fit=crop&q=80'
  );
  const [houseRules, setHouseRules] = useState('Regras oficiais de Além da Próxima Rota Edição 1.0.');
  const [campaignAgreements, setCampaignAgreements] = useState('Sem morte súbita em 0 PV. Foco em trabalho em equipe e exploração.');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      const camp = storageService.createCampaign({
        name,
        description,
        coverImage,
        region,
        tone,
        houseRules,
        campaignAgreements,
      });
      onCreated(camp);
      onClose();
    } catch (err: any) {
      alert(err.message || 'Erro ao criar campanha');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl bg-[#12131d] border border-purple-900/40 rounded-2xl shadow-2xl p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-purple-900/20 pb-4">
          <div className="flex items-center gap-2.5">
            <PlusCircle className="w-5 h-5 text-purple-400" />
            <h3 className="font-extrabold text-white text-lg">Criar Nova Campanha Pokémon</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Título da Campanha *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: A Lenda dos Pássaros de Gelo, Sombras em Johto..."
              className="w-full bg-[#181928] border border-purple-900/30 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Sinopse da História</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva a premissa dramática, as forças em conflito ou o mistério inicial da mesa..."
              className="w-full bg-[#181928] border border-purple-900/30 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Região de Jogo</label>
              <input
                type="text"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                placeholder="Ex: Kanto, Johto, Hoenn, Sinnoh, Unova, Kalos..."
                className="w-full bg-[#181928] border border-purple-900/30 rounded-lg px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">URL Imagem de Capa</label>
              <input
                type="url"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                className="w-full bg-[#181928] border border-purple-900/30 rounded-lg px-3 py-2 text-xs text-white"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Tom da Campanha</label>
            <input
              type="text"
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full bg-[#181928] border border-purple-900/30 rounded-lg px-3 py-2 text-xs text-white"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Acordos de Campanha (Sessão Zero)</label>
            <textarea
              rows={2}
              value={campaignAgreements}
              onChange={(e) => setCampaignAgreements(e.target.value)}
              className="w-full bg-[#181928] border border-purple-900/30 rounded-lg px-3 py-2 text-xs text-white"
            />
          </div>

          <div className="pt-3 border-t border-purple-900/20 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-slate-300 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white shadow-lg shadow-purple-950/50 transition-all"
            >
              Iniciar Campanha como Mestre
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
