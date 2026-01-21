import React from 'react';
import { useAppContext } from '../context/AppContext';
import { PartsTab } from './tabs/PartsTab';
import { MaterialTab } from './tabs/MaterialTab';
import { SettingsTab } from './tabs/SettingsTab';

export const LeftPanel: React.FC = () => {
  const { state, dispatch } = useAppContext();

  if (state.stage === 'results') return null;

  const tabs = [
    { id: 'parts' as const, label: 'Детали', icon: '📋' },
    { id: 'material' as const, label: 'Материал', icon: '📐' },
    { id: 'settings' as const, label: 'Настройки', icon: '⚙️' }
  ];

  return (
    <div className="w-80 bg-gray-800 border-r border-gray-700 flex flex-col slide-in-left">
      {/* Вкладки */}
      <div className="flex border-b border-gray-700">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => dispatch({ type: 'SET_LEFT_TAB', payload: tab.id })}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              state.leftPanelTab === tab.id
                ? 'bg-blue-500 text-white border-b-2 border-blue-400'
                : 'text-gray-300 hover:text-white hover:bg-gray-700'
            }`}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Содержимое вкладок */}
      <div className="flex-1 overflow-y-auto">
        {state.leftPanelTab === 'parts' && <PartsTab />}
        {state.leftPanelTab === 'material' && <MaterialTab />}
        {state.leftPanelTab === 'settings' && <SettingsTab />}
      </div>
    </div>
  );
};
