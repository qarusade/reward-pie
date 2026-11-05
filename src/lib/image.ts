/**
 * Своё фото награды → квадрат size×size (обрезка по центру), JPEG data URL.
 * 512px при качестве 0.85 — это примерно 40–90 КБ, IndexedDB это спокойно держит.
 */
export async function fileToRewardImage(file: File, size = 512): Promise<string> {
  const source = await loadImage(file);
  const w = 'naturalWidth' in source ? source.naturalWidth : source.width;
  const h = 'naturalHeight' in source ? source.naturalHeight : source.height;
  const side = Math.min(w, h);
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas недоступен');
  ctx.drawImage(source, (w - side) / 2, (h - side) / 2, side, side, 0, 0, size, size);
  if ('close' in source) source.close();
  return canvas.toDataURL('image/jpeg', 0.85);
}

async function loadImage(file: File): Promise<ImageBitmap | HTMLImageElement> {
  if (typeof createImageBitmap === 'function') {
    try {
      return await createImageBitmap(file);
    } catch {
      /* старый Safari — падаем на <img> */
    }
  }
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    return img;
  } finally {
    URL.revokeObjectURL(url);
  }
}
