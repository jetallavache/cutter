import React from 'react';
import { useAppContext } from '../context/AppContext';

interface Props {
  onOpenCostModal: () => void;
}

export const RightPanel: React.FC<Props> = ({ onOpenCostModal }) => {
  const { state, dispatch } = useAppContext();

  if (state.stage !== 'results' || !state.nestingResult) return null;

  const result = state.nestingResult;
  const usedSheets = result.sheets.filter(sheet => sheet.placedParts.length > 0).length;
  const totalSheetArea = result.sheets.reduce((sum, sheet) => sum + (sheet.width * sheet.height), 0);
  const totalSheetAreaM2 = totalSheetArea / 1000000;

  const tabs = [
    { id: 'results' as const, label: 'Результаты', icon: '📊' },
    { id: 'statistics' as const, label: 'Статистика', icon: '📈' }
  ];

  return (
    <div className="w-72 bg-gray-800 border-l border-gray-700 flex flex-col fade-in">
      {/* Вкладки */}
      <div className="flex border-b border-gray-700">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => dispatch({ type: 'SET_RIGHT_TAB', payload: tab.id })}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              state.rightPanelTab === tab.id
                ? 'bg-blue-500 text-white border-b-2 border-blue-400'
                : 'text-gray-300 hover:text-white hover:bg-gray-700'
            }`}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Содержимое */}
      <div className="flex-1 overflow-y-auto p-4">
        {state.rightPanelTab === 'results' && (
          <div className="space-y-4">
            {/* Метрики раскроя */}
            <div className="space-y-3">
              <h3 className="text-white font-medium text-sm">Метрики раскроя</h3>
              
              <div className="bg-gray-700 rounded p-3 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-300">Использовано листов:</span>
                  <span className="text-white">{usedSheets} из {state.sheetCount}</span>
                </div>
                
                <div className="flex justify-between text-xs">
                  <span className="text-gray-300">Коэффициент использования:</span>
                  <span className="text-green-400 font-medium">
                    {result.totalEfficiency.toFixed(1)}%
                  </span>
                </div>
                
                <div className="flex justify-between text-xs">
                  <span className="text-gray-300">Площадь деталей:</span>
                  <span className="text-white">
                    {(result.totalPartsArea / 1000000).toFixed(3)} м²
                  </span>
                </div>
                
                <div className="flex justify-between text-xs">
                  <span className="text-gray-300">Площадь отходов:</span>
                  <span className="text-red-400">
                    {(result.totalWasteArea / 1000000).toFixed(3)} м²
                  </span>
                </div>
                
                <div className="flex justify-between text-xs">
                  <span className="text-gray-300">Время резки:</span>
                  <span className="text-white">
                    {result.cuttingTime.toFixed(1)} мин
                  </span>
                </div>
              </div>
            </div>

            {/* Неразмещённые детали */}
            {result.unplacedParts.length > 0 && (
              <div className="bg-red-900/20 border border-red-700 rounded p-3">
                <h4 className="text-red-400 font-medium text-xs mb-2">
                  Неразмещённые детали ({result.unplacedParts.length}):
                </h4>
                <div className="space-y-1">
                  {result.unplacedParts.map(part => (
                    <div key={part.id} className="text-red-300 text-xs">
                      {part.name} ({part.length}×{part.width} мм)
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Кнопка расчёта стоимости */}
            <button
              onClick={onOpenCostModal}
              className="w-full bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded font-medium transition-colors"
            >
              Расчёт стоимости
            </button>
          </div>
        )}

        {state.rightPanelTab === 'statistics' && (
          <div className="space-y-4">
            <h3 className="text-white font-medium text-sm">Детальная статистика</h3>
            
            {/* Статистика по листам */}
            <div className="space-y-2">
              {result.sheets.map((sheet, index) => (
                <div key={index} className="bg-gray-700 rounded p-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-white text-sm font-medium">
                      Лист {index + 1}
                    </span>
                    <span className="text-xs text-gray-300">
                      {sheet.placedParts.length} деталей
                    </span>
                  </div>
                  
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Использование:</span>
                      <span className="text-white">
                        {(((sheet.width * sheet.height - sheet.wasteArea) / (sheet.width * sheet.height)) * 100).toFixed(1)}%
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-300">Отходы:</span>
                      <span className="text-red-400">
                        {(sheet.wasteArea / 1000000).toFixed(3)} м²
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
