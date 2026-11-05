/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Modal reutilizável de Upload e Gerenciamento de Imagens para o Project Mew.
 */

import React, { useState, useRef } from 'react';
import { Upload, Link as LinkIcon, Image as ImageIcon, Trash2, Check, X, AlertCircle } from 'lucide-react';
import { compressAndEncodeImage, isValidImageSource } from '../utils/imageUtils';

interface ImageUploadModalProps {
  isOpen: boolean;
  title: string;
  currentImageUrl?: string;
  defaultFallbackUrl: string;
  maxWidth?: number;
  maxHeight?: number;
  onClose: () => void;
  onSave: (newImageUrl: string) => void;
}

export const ImageUploadModal: React.FC<ImageUploadModalProps> = ({
  isOpen,
  title,
  currentImageUrl,
  defaultFallbackUrl,
  maxWidth = 480,
  maxHeight = 480,
  onClose,
  onSave,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'url'>('upload');
  const [previewUrl, setPreviewUrl] = useState<string>(currentImageUrl || defaultFallbackUrl);
  const [urlInput, setUrlInput] = useState<string>(
    currentImageUrl && !currentImageUrl.startsWith('data:') ? currentImageUrl : ''
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg(null);
    setIsProcessing(true);

    try {
      const compressed = await compressAndEncodeImage(file, {
        maxWidth,
        maxHeight,
        quality: 0.82,
        maxFileSizeMb: 5,
      });
      setPreviewUrl(compressed);
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao processar imagem.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApplyUrl = () => {
    setErrorMsg(null);
    const trimmed = urlInput.trim();
    if (!trimmed) {
      setErrorMsg('Informe uma URL de imagem válida.');
      return;
    }
    if (!isValidImageSource(trimmed)) {
      setErrorMsg('O endereço informado deve começar com http:// ou https://');
      return;
    }
    setPreviewUrl(trimmed);
  };

  const handleResetToDefault = () => {
    setErrorMsg(null);
    setPreviewUrl(defaultFallbackUrl);
    setUrlInput('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleConfirm = () => {
    onSave(previewUrl || defaultFallbackUrl);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg bg-[#12131e] border border-purple-900/50 rounded-2xl shadow-2xl p-6 space-y-5 animate-in fade-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-purple-900/30 pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-purple-950/60 border border-purple-800 text-purple-400">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">{title}</h3>
              <p className="text-xs text-slate-400">Suporte a arquivos locais compactados ou links web</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preview Area */}
        <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-xl bg-[#171827] border border-purple-900/20">
          <div className="relative w-28 h-28 rounded-xl overflow-hidden bg-zinc-900 border border-purple-500/40 flex items-center justify-center shrink-0 shadow-inner group">
            <img
              src={previewUrl}
              alt="Pré-visualização"
              className="w-full h-full object-contain filter drop-shadow"
              onError={() => {
                setErrorMsg('Falha ao carregar a pré-visualização desta imagem.');
              }}
            />
            {isProcessing && (
              <div className="absolute inset-0 bg-black/70 flex items-center justify-center text-xs text-purple-300 font-bold">
                Otimizando...
              </div>
            )}
          </div>

          <div className="space-y-1.5 text-center sm:text-left flex-1">
            <span className="text-xs font-bold text-purple-300 uppercase tracking-wider block">
              Pré-visualização Atual
            </span>
            <p className="text-xs text-slate-300">
              Esta imagem será redimensionada e otimizada para manter o desempenho máximo da aplicação.
            </p>
            <button
              type="button"
              onClick={handleResetToDefault}
              className="inline-flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 transition-colors pt-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Restaurar imagem padrão
            </button>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex gap-2 border-b border-zinc-800 pb-2">
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'upload'
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-zinc-900 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            Upload do Dispositivo
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('url')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'url'
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-zinc-900 text-slate-400 hover:text-slate-200'
            }`}
          >
            <LinkIcon className="w-3.5 h-3.5" />
            Colar Link Web (URL)
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'upload' ? (
          <div className="space-y-3">
            <label
              htmlFor="image-file-input"
              className="flex flex-col items-center justify-center border-2 border-dashed border-purple-800/60 hover:border-purple-500/80 rounded-xl p-6 bg-purple-950/10 cursor-pointer transition-all hover:bg-purple-950/20 text-center"
            >
              <Upload className="w-8 h-8 text-purple-400 mb-2 animate-bounce" />
              <span className="text-xs font-bold text-white mb-0.5">
                Clique para selecionar uma imagem do computador
              </span>
              <span className="text-[11px] text-slate-400">
                Formatos aceitos: PNG, JPG, WebP, GIF, SVG (máx. 5MB)
              </span>
            </label>
            <input
              id="image-file-input"
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                type="url"
                placeholder="https://exemplo.com/imagem.png"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
              <button
                type="button"
                onClick={handleApplyUrl}
                className="px-3.5 py-2 bg-purple-700 hover:bg-purple-600 rounded-lg text-xs font-bold text-white transition-colors"
              >
                Aplicar
              </button>
            </div>
            <p className="text-[11px] text-slate-400">
              Cole o link direto da imagem pública (deve terminar em .png, .jpg, .webp ou equivalente).
            </p>
          </div>
        )}

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800/60 flex items-center gap-2 text-xs text-rose-300">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-purple-900/20">
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
            disabled={isProcessing}
            className="px-5 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white shadow-lg transition-all flex items-center gap-1.5 disabled:opacity-50"
          >
            <Check className="w-4 h-4" />
            Salvar Imagem
          </button>
        </div>
      </div>
    </div>
  );
};
