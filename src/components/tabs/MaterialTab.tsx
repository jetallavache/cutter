import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { Material } from '../../types';

const MATERIALS: Material[] = [
  {
    id: 'acrylic',
    name: 'Акрил',
    length: 3680,
    width: 760,
    thickness: 12,
    pricePerM2: 2500,
    cuttingRules: {
      lengthMultiples: [3680, 2760, 1840, 920]
    }
  },
  {
    id: 'quartz1',
    name: 'Кварц (вариант 1)',
    length: 3200,
    width: 1600,
    thickness: 20,
    pricePerM2: 4500,
    cuttingRules: {
      heightDivisions: [1600, 800]
    }
  },
  {
    id: 'quartz2',
    name: 'Кварц (вариант 2)',
    length: 3000,
    width: 1400,
    thickness: 20,
    pricePerM2: 4200,
    cuttingRules: {
      heightDivisions: [1400, 700]
    }
  }
];

export const MaterialTab: React.FC = () => {
  const { state, dispatch } = useAppContext();

  const handleMaterialChange = (materialId: string) => {
    const material = MATERIALS.find(m => m.id === materialId);
    if (material) {
      dispatch({ type: 'SET_MATERIAL', payload: material });
    }
  };

  const handleSheetCountChange = (count: number) => {
    dispatch({ type: 'SET_SHEET_COUNT', payload: Math.max(1, Math.min(10, count)) });
  };

  return (
    <div className="p-4 space-y-4">
      {/* Выбор материала */}
      <div>
        <label className="block text-white text-sm font-medium mb-2">
          Тип материала
        </label>
        <select
          value={state.selectedMaterial?.id || ''}
          onChange={(e) => handleMaterialChange(e.target.value)}
          className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        >
          <option value="">Выберите материал</option>
          {MATERIALS.map(material => (
            <option key={material.id} value={material.id}>
              {material.name}
            </option>
          ))}
        </select>
      </div>

      {/* Количество листов */}
      <div>
        <label className="block text-white text-sm font-medium mb-2">
          Количество листов
        </label>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleSheetCountChange(state.sheetCount - 1)}
            className="w-8 h-8 bg-gray-600 hover:bg-gray-500 text-white rounded text-sm flex items-center justify-center"
          >
            -
          </button>
          <input
            type="number"
            value={state.sheetCount}
            onChange={(e) => handleSheetCountChange(parseInt(e.target.value) || 1)}
            className="flex-1 bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 text-sm text-center focus:border-blue-500 focus:outline-none"
            min="1"
            max="10"
          />
          <button
            onClick={() => handleSheetCountChange(state.sheetCount + 1)}
            className="w-8 h-8 bg-gray-600 hover:bg-gray-500 text-white rounded text-sm flex items-center justify-center"
          >
            +
          </button>
        </div>
      </div>

      {/* Информация о материале */}
      {state.selectedMaterial && (
        <div className="bg-gray-700 rounded p-4 space-y-3">
          <h3 className="text-white font-medium text-sm">Параметры материала</h3>
          
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-300">Размеры:</span>
              <span className="text-white">
                {state.selectedMaterial.length}×{state.selectedMaterial.width}×{state.selectedMaterial.thickness} мм
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-300">Площадь листа:</span>
              <span className="text-white">
                {((state.selectedMaterial.length * state.selectedMaterial.width) / 1000000).toFixed(2)} м²
              </span>
            </div>

            {state.selectedMaterial.pricePerM2 && (
              <div className="flex justify-between">
                <span className="text-gray-300">Цена за м²:</span>
                <span className="text-white">{state.selectedMaterial.pricePerM2} руб.</span>
              </div>
            )}
          </div>

          {/* Правила раскроя */}
          {state.selectedMaterial.cuttingRules && (
            <div className="border-t border-gray-600 pt-3">
              <h4 className="text-white text-xs font-medium mb-2">Особенности раскроя:</h4>
              
              {state.selectedMaterial.cuttingRules.lengthMultiples && (
                <p className="text-gray-300 text-xs">
                  Используется по длине кратно: {state.selectedMaterial.cuttingRules.lengthMultiples.join(' / ')} мм
                </p>
              )}
              
              {state.selectedMaterial.cuttingRules.heightDivisions && (
                <p className="text-gray-300 text-xs">
                  Возможные размеры по высоте: {state.selectedMaterial.cuttingRules.heightDivisions.join(' / ')} мм
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
