import { Part, Material, Sheet, NestingResult, CuttingSettings } from '../types';

const COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
];

export function nestParts(
  parts: Part[],
  material: Material,
  sheetCount: number,
  settings: CuttingSettings
): NestingResult {
  const sheets: Sheet[] = [];
  const unplacedParts: Part[] = [];
  
  // Развернуть детали по количеству
  const expandedParts: Part[] = [];
  parts.forEach(part => {
    for (let i = 0; i < part.quantity; i++) {
      expandedParts.push({
        ...part,
        id: `${part.id}_${i}`,
        quantity: 1
      });
    }
  });

  // Сортировка по площади (убывание)
  expandedParts.sort((a, b) => (b.length * b.width) - (a.length * a.width));

  // Инициализация листов
  for (let i = 0; i < sheetCount; i++) {
    sheets.push({
      index: i,
      width: material.width,
      height: getOptimalSheetLength(material, expandedParts),
      placedParts: [],
      wasteArea: 0
    });
  }

  // Размещение деталей
  expandedParts.forEach((part, index) => {
    const color = COLORS[index % COLORS.length];
    let placed = false;

    for (let sheetIndex = 0; sheetIndex < sheets.length && !placed; sheetIndex++) {
      const sheet = sheets[sheetIndex];
      const placedPart = tryPlacePart(part, sheet, settings, color, sheetIndex);
      
      if (placedPart) {
        sheet.placedParts.push(placedPart);
        placed = true;
      }
    }

    if (!placed) {
      unplacedParts.push(part);
    }
  });

  // Расчет отходов и эффективности
  const totalPartsArea = expandedParts.reduce((sum, part) => sum + (part.length * part.width), 0);
  let totalSheetArea = 0;
  let totalWasteArea = 0;

  sheets.forEach(sheet => {
    const usedArea = sheet.placedParts.reduce((sum, part) => sum + (part.width * part.height), 0);
    const sheetArea = sheet.width * sheet.height;
    sheet.wasteArea = sheetArea - usedArea;
    totalSheetArea += sheetArea;
    totalWasteArea += sheet.wasteArea;
  });

  const totalEfficiency = totalSheetArea > 0 ? (totalPartsArea / totalSheetArea) * 100 : 0;
  
  // Расчет времени резки
  const totalPerimeter = expandedParts.reduce((sum, part) => 
    sum + 2 * (part.length + part.width), 0
  );
  const cuttingTime = totalPerimeter / settings.cuttingSpeed;

  return {
    sheets,
    unplacedParts,
    totalEfficiency,
    totalPartsArea,
    totalWasteArea,
    cuttingTime
  };
}

function getOptimalSheetLength(material: Material, parts: Part[]): number {
  if (material.cuttingRules?.lengthMultiples) {
    // Для акрила - выбираем оптимальную длину
    const maxPartLength = Math.max(...parts.map(p => Math.max(p.length, p.width)));
    return material.cuttingRules.lengthMultiples.find(length => length >= maxPartLength) || material.length;
  }
  return material.length;
}

function tryPlacePart(
  part: Part,
  sheet: Sheet,
  settings: CuttingSettings,
  color: string,
  sheetIndex: number
) {
  const orientations = settings.allowRotation 
    ? [
        { width: part.length, height: part.width, rotated: false },
        { width: part.width, height: part.length, rotated: true }
      ]
    : [{ width: part.length, height: part.width, rotated: false }];

  for (const orientation of orientations) {
    const position = findPosition(
      orientation.width, 
      orientation.height, 
      sheet, 
      settings.minGap + settings.cutWidth
    );
    
    if (position) {
      return {
        part,
        x: position.x,
        y: position.y,
        width: orientation.width,
        height: orientation.height,
        rotated: orientation.rotated,
        color,
        sheetIndex
      };
    }
  }

  return null;
}

function findPosition(
  width: number,
  height: number,
  sheet: Sheet,
  gap: number
): { x: number; y: number } | null {
  for (let y = 0; y <= sheet.width - height; y += 10) {
    for (let x = 0; x <= sheet.height - width; x += 10) {
      if (canPlaceAt(x, y, width, height, sheet.placedParts, gap)) {
        return { x, y };
      }
    }
  }
  return null;
}

function canPlaceAt(
  x: number,
  y: number,
  width: number,
  height: number,
  placedParts: any[],
  gap: number
): boolean {
  const rect1 = { x, y, width, height };
  
  return !placedParts.some(placed => {
    const rect2 = {
      x: placed.x - gap,
      y: placed.y - gap,
      width: placed.width + gap * 2,
      height: placed.height + gap * 2
    };
    return rectanglesOverlap(rect1, rect2);
  });
}

function rectanglesOverlap(
  rect1: { x: number; y: number; width: number; height: number },
  rect2: { x: number; y: number; width: number; height: number }
): boolean {
  return !(
    rect1.x + rect1.width <= rect2.x ||
    rect2.x + rect2.width <= rect1.x ||
    rect1.y + rect1.height <= rect2.y ||
    rect2.y + rect2.height <= rect1.y
  );
}
