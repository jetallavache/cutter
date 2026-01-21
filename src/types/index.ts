export interface Part {
  id: string;
  name: string;
  length: number;
  width: number;
  quantity: number;
}

export interface Material {
  id: string;
  name: string;
  length: number;
  width: number;
  thickness: number;
  pricePerM2?: number;
  cuttingRules?: {
    lengthMultiples?: number[];
    heightDivisions?: number[];
  };
}

export interface PlacedPart {
  part: Part;
  x: number;
  y: number;
  width: number;
  height: number;
  rotated: boolean;
  color: string;
  sheetIndex: number;
}

export interface Sheet {
  index: number;
  width: number;
  height: number;
  placedParts: PlacedPart[];
  wasteArea: number;
}

export interface NestingResult {
  sheets: Sheet[];
  unplacedParts: Part[];
  totalEfficiency: number;
  totalPartsArea: number;
  totalWasteArea: number;
  cuttingTime: number;
}

export interface CuttingSettings {
  cutWidth: number;
  minGap: number;
  cuttingSpeed: number;
  allowRotation: boolean;
}

export interface VisualizationSettings {
  showGrid: boolean;
  showMarkup: boolean;
  highlightWaste: boolean;
}

export interface AppSettings {
  cutting: CuttingSettings;
  visualization: VisualizationSettings;
}

export interface CostCalculation {
  materialCostPerM2: number;
  laborCostPerHour: number;
  clientMarkup: number;
  materialCost: number;
  cuttingCost: number;
  edgingCost: number;
  wasteCost: number;
  laborCost: number;
  totalCost: number;
  clientPrice: number;
}

export type AppStage = 'preparation' | 'results';
export type LeftPanelTab = 'parts' | 'material' | 'settings';
export type RightPanelTab = 'results' | 'statistics';
