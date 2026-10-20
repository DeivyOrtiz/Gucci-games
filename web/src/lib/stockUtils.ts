export interface ParsedStock {
  stock: number;
  cleanDescription: string;
}

export function parseStockFromDescription(desc: string | null | undefined): ParsedStock {
  if (!desc) {
    return { stock: 1, cleanDescription: '' };
  }
  const match = desc.match(/\[STOCK:\s*(\d+)\]/i);
  if (match) {
    const stock = parseInt(match[1], 10);
    const cleanDescription = desc.replace(/\[STOCK:\s*\d+\]\s*/i, '').trim();
    return { stock: isNaN(stock) ? 1 : stock, cleanDescription };
  }
  return { stock: 1, cleanDescription: desc.trim() };
}

export function formatStockInDescription(cleanDesc: string, stock: number): string {
  const safeStock = Math.max(0, isNaN(stock) ? 1 : stock);
  const trimmed = (cleanDesc || '').replace(/\[STOCK:\s*\d+\]\s*/gi, '').trim();
  return trimmed ? `[STOCK:${safeStock}] ${trimmed}` : `[STOCK:${safeStock}]`;
}
