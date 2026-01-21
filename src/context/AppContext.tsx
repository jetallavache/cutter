import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { 
  Part, 
  Material, 
  NestingResult, 
  AppStage, 
  LeftPanelTab, 
  RightPanelTab, 
  AppSettings,
  CuttingSettings,
  VisualizationSettings
} from '../types';

interface AppState {
  stage: AppStage;
  leftPanelTab: LeftPanelTab;
  rightPanelTab: RightPanelTab;
  parts: Part[];
  selectedMaterial: Material | null;
  sheetCount: number;
  settings: AppSettings;
  nestingResult: NestingResult | null;
  isCalculating: boolean;
  selectedPartId: string | null;
}

type AppAction = 
  | { type: 'SET_STAGE'; payload: AppStage }
  | { type: 'SET_LEFT_TAB'; payload: LeftPanelTab }
  | { type: 'SET_RIGHT_TAB'; payload: RightPanelTab }
  | { type: 'SET_PARTS'; payload: Part[] }
  | { type: 'SET_MATERIAL'; payload: Material }
  | { type: 'SET_SHEET_COUNT'; payload: number }
  | { type: 'SET_CUTTING_SETTINGS'; payload: Partial<CuttingSettings> }
  | { type: 'SET_VISUALIZATION_SETTINGS'; payload: Partial<VisualizationSettings> }
  | { type: 'SET_NESTING_RESULT'; payload: NestingResult }
  | { type: 'SET_CALCULATING'; payload: boolean }
  | { type: 'SET_SELECTED_PART'; payload: string | null }
  | { type: 'LOAD_STATE'; payload: Partial<AppState> };

const initialState: AppState = {
  stage: 'preparation',
  leftPanelTab: 'parts',
  rightPanelTab: 'results',
  parts: [],
  selectedMaterial: null,
  sheetCount: 1,
  settings: {
    cutting: {
      cutWidth: 2,
      minGap: 5,
      cuttingSpeed: 1000,
      allowRotation: true
    },
    visualization: {
      showGrid: true,
      showMarkup: true,
      highlightWaste: true
    }
  },
  nestingResult: null,
  isCalculating: false,
  selectedPartId: null
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_STAGE':
      return { ...state, stage: action.payload };
    case 'SET_LEFT_TAB':
      return { ...state, leftPanelTab: action.payload };
    case 'SET_RIGHT_TAB':
      return { ...state, rightPanelTab: action.payload };
    case 'SET_PARTS':
      return { ...state, parts: action.payload };
    case 'SET_MATERIAL':
      return { ...state, selectedMaterial: action.payload };
    case 'SET_SHEET_COUNT':
      return { ...state, sheetCount: action.payload };
    case 'SET_CUTTING_SETTINGS':
      return { 
        ...state, 
        settings: { 
          ...state.settings, 
          cutting: { ...state.settings.cutting, ...action.payload } 
        } 
      };
    case 'SET_VISUALIZATION_SETTINGS':
      return { 
        ...state, 
        settings: { 
          ...state.settings, 
          visualization: { ...state.settings.visualization, ...action.payload } 
        } 
      };
    case 'SET_NESTING_RESULT':
      return { ...state, nestingResult: action.payload };
    case 'SET_CALCULATING':
      return { ...state, isCalculating: action.payload };
    case 'SET_SELECTED_PART':
      return { ...state, selectedPartId: action.payload };
    case 'LOAD_STATE':
      return { ...state, ...action.payload };
    default:
      return state;
  }
}

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Сохранение состояния в localStorage
  useEffect(() => {
    const stateToSave = {
      parts: state.parts,
      selectedMaterial: state.selectedMaterial,
      sheetCount: state.sheetCount,
      settings: state.settings
    };
    localStorage.setItem('cutter-app-state', JSON.stringify(stateToSave));
  }, [state.parts, state.selectedMaterial, state.sheetCount, state.settings]);

  // Загрузка состояния из localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('cutter-app-state');
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        dispatch({ type: 'LOAD_STATE', payload: parsed });
      } catch (error) {
        console.error('Error loading saved state:', error);
      }
    }
  }, []);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};
