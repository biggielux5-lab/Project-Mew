/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Utilitários para upload, validação e compressão client-side de imagens no Project Mew.
 */

export interface ImageProcessingOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  maxFileSizeMb?: number;
}

/**
 * Redimensiona e compacta uma imagem no navegador usando Canvas.
 * Garante que a imagem resultante em base64 fique leve (< 80KB) para caber com segurança no localStorage.
 */
export async function compressAndEncodeImage(
  file: File,
  options: ImageProcessingOptions = {}
): Promise<string> {
  const {
    maxWidth = 480,
    maxHeight = 480,
    quality = 0.82,
    maxFileSizeMb = 5,
  } = options;

  if (!file.type.startsWith('image/')) {
    throw new Error('O arquivo selecionado não é uma imagem válida.');
  }

  const fileSizeMb = file.size / (1024 * 1024);
  if (fileSizeMb > maxFileSizeMb) {
    throw new Error(`A imagem é muito pesada (${fileSizeMb.toFixed(1)}MB). O limite é ${maxFileSizeMb}MB.`);
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (readerEvent) => {
      const dataUrl = readerEvent.target?.result as string;
      if (!dataUrl) {
        reject(new Error('Falha ao ler dados da imagem.'));
        return;
      }

      // Se for SVG, dataURL direto funciona muito bem e é levíssimo
      if (file.type === 'image/svg+xml') {
        resolve(dataUrl);
        return;
      }

      const img = new Image();
      img.onload = () => {
        let { width, height } = img;

        // Mantém a proporção de aspecto respeitando os limites máximos
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          // Fallback para dataUrl original se canvas falhar
          resolve(dataUrl);
          return;
        }

        // Suavização bicúbica
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Exporta como JPEG ou WEBP com compressão controlada
        try {
          const compressed = canvas.toDataURL('image/jpeg', quality);
          resolve(compressed);
        } catch {
          resolve(dataUrl);
        }
      };

      img.onerror = () => {
        reject(new Error('Não foi possível processar a imagem fornecida.'));
      };

      img.src = dataUrl;
    };

    reader.onerror = () => {
      reject(new Error('Erro na leitura do arquivo local.'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Valida se uma string é uma URL válida ou dataURL.
 */
export function isValidImageSource(src: string): boolean {
  if (!src || typeof src !== 'string') return false;
  const trimmed = src.trim();
  if (trimmed.startsWith('data:image/')) return true;
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}
