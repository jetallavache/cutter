import React from 'react';
import { useAppContext } from '../../context/AppContext';

export const SettingsTab: React.FC = () => {
  const { state, dispatch } = useAppContext();

  const updateCuttingSetting = (key: string, value: any) => {
    dispatch({ 
      type: 'SET_CUTTING_SETTINGS', 
      payload: { [key]: value } 
    });
  };

  const updateVisualizationSetting = (key: string, value: boolean) => {
    dispatch({ 
      type: 'SET_VISUALIZATION_SETTINGS', 
      payload: { [key]: value } 
    });
  };

  return (
    <div className="p-4 space-y-6">
      {/* Настройки резки */}
      <div>
        <h3 className="text-white font-medium text-sm mb-3">НАСТРОЙКИ РЕЗКИ</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-gray-300 text-xs mb-1">
              Ширина реза (мм)
            </label>
            <input
              type="number"
              value={state.settings.cutting.cutWidth}
              onChange={(e) => updateCuttingSetting('cutWidth', parseFloat(e.target.value) || 0)}
              className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              min="0"
              step="0.1"
            />
          </div>

          <div>
            <label className="block text-gray-300 text-xs mb-1">
              Минимальный отступ (мм)
            </label>
            <input
              type="number"
              value={state.settings.cutting.minGap}
              onChange={(e) => updateCuttingSetting('minGap', parseFloat(e.target.value) || 0)}
              className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              min="0"
              step="0.1"
            />
          </div>

          <div>
            <label className="block text-gray-300 text-xs mb-1">
              Скорость резки (мм/мин)
            </label>
            <input
              type="number"
              value={state.settings.cutting.cuttingSpeed}
              onChange={(e) => updateCuttingSetting('cuttingSpeed', parseFloat(e.target.value) || 1)}
              className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              min="1"
            />
          </div>
        </div>
      </div>

      {/* Поворот деталей */}
      <div>
        <h3 className="text-white font-medium text-sm mb-3">ПОВОРОТ ДЕТАЛЕЙ</h3>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={state.settings.cutting.allowRotation}
            onChange={(e) => updateCuttingSetting('allowRotation', e.target.checked)}
            className="rounded bg-gray-700 border-gray-600 text-blue-500 focus:ring-blue-500 focus:ring-offset-0"
          />
          <span className="text-gray-300 text-sm">
            Разрешить поворот деталей на 90°
          </span>
        </label>
      </div>

      {/* Визуализация */}
      <div>
        <h3 className="text-white font-medium text-sm mb-3">ВИЗУАЛИЗАЦИЯ</h3>
        <div className="space-y-2">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={state.settings.visualization.showGrid}
              onChange={(e) => updateVisualizationSetting('showGrid', e.target.checked)}
              className="rounded bg-gray-700 border-gray-600 text-blue-500 focus:ring-blue-500 focus:ring-offset-0"
            />
            <span className="text-gray-300 text-sm">Показать сетку</span>
          </label>

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={state.settings.visualization.showMarkup}
              onChange={(e) => updateVisualizationSetting('showMarkup', e.target.checked)}
              className="rounded bg-gray-700 border-gray-600 text-blue-500 focus:ring-blue-500 focus:ring-offset-0"
            />
            <span className="text-gray-300 text-sm">Показать разметку</span>
          </label>

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={state.settings.visualization.highlightWaste}
              onChange={(e) => updateVisualizationSetting('highlightWaste', e.target.checked)}
              className="rounded bg-gray-700 border-gray-600 text-blue-500 focus:ring-blue-500 focus:ring-offset-0"
            />
            <span className="text-gray-300 text-sm">Подсветка остатков</span>
          </label>
        </div>
      </div>
    </div>
  );
};
