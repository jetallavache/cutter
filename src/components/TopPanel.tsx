import React from 'react';
import { useAppContext } from '../context/AppContext';
import { nestParts } from '../utils/nestingAlgorithm';

interface Props {
  onOpenCostModal: () => void;
}

export const TopPanel: React.FC<Props> = ({ onOpenCostModal }) => {
  const { state, dispatch } = useAppContext();

  const canCalculate = state.parts.length > 0 && state.selectedMaterial !== null;

  const handleCalculate = async () => {
    if (!canCalculate || !state.selectedMaterial) return;

    dispatch({ type: 'SET_CALCULATING', payload: true });
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const result = nestParts(
        state.parts,
        state.selectedMaterial,
        state.sheetCount,
        state.settings.cutting
      );
      
      dispatch({ type: 'SET_NESTING_RESULT', payload: result });
      dispatch({ type: 'SET_STAGE', payload: 'results' });
    } catch (error) {
      console.error('Calculation error:', error);
    } finally {
      dispatch({ type: 'SET_CALCULATING', payload: false });
    }
  };

  const handleStageChange = (stage: 'preparation' | 'results') => {
    dispatch({ type: 'SET_STAGE', payload: stage });
  };

  return (
    <div className="h-12 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-6">
      {/* Логотип */}
      <div className="text-white font-semibold text-lg">
        CutterPro
      </div>

      {/* Кнопки этапов */}
      <div className="flex space-x-4">
        <button
          onClick={() => handleStageChange('preparation')}
          className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
            state.stage === 'preparation'
              ? 'bg-blue-500 text-white'
              : 'text-gray-300 hover:text-white hover:bg-gray-700'
          }`}
        >
          1. Подготовка
        </button>
        <button
          onClick={() => handleStageChange('results')}
          disabled={!state.nestingResult}
          className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
            state.stage === 'results' && state.nestingResult
              ? 'bg-blue-500 text-white'
              : state.nestingResult
              ? 'text-gray-300 hover:text-white hover:bg-gray-700'
              : 'text-gray-500 cursor-not-allowed'
          }`}
        >
          2. Результаты
        </button>
      </div>

      {/* Кнопки действий */}
      <div>
        {state.stage === 'preparation' ? (
          <button
            onClick={handleCalculate}
            disabled={!canCalculate || state.isCalculating}
            className={`px-6 py-2 rounded font-medium transition-colors ${
              canCalculate && !state.isCalculating
                ? 'bg-green-500 hover:bg-green-600 text-white'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}
          >
            {state.isCalculating ? 'Расчёт...' : 'Рассчитать раскрой'}
          </button>
        ) : (
          <button
            onClick={onOpenCostModal}
            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded font-medium transition-colors"
          >
            Расчёт стоимости
          </button>
        )}
      </div>
    </div>
  );
};
