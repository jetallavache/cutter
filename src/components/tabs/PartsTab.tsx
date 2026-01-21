import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Part } from '../../types';

export const PartsTab: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const [formData, setFormData] = useState({
    name: '',
    length: '',
    width: '',
    quantity: '1'
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const length = parseFloat(formData.length);
    const width = parseFloat(formData.width);
    const quantity = parseInt(formData.quantity);

    if (!formData.name || length <= 0 || width <= 0 || quantity <= 0) return;

    const newPart: Part = {
      id: Date.now().toString(),
      name: formData.name,
      length,
      width,
      quantity
    };

    dispatch({ type: 'SET_PARTS', payload: [...state.parts, newPart] });
    setFormData({ name: '', length: '', width: '', quantity: '1' });
  };

  const removePart = (id: string) => {
    dispatch({ type: 'SET_PARTS', payload: state.parts.filter(p => p.id !== id) });
  };

  const updateQuantity = (id: string, delta: number) => {
    const updatedParts = state.parts.map(part => 
      part.id === id 
        ? { ...part, quantity: Math.max(1, part.quantity + delta) }
        : part
    );
    dispatch({ type: 'SET_PARTS', payload: updatedParts });
  };

  return (
    <div className="p-4 space-y-4">
      {/* Форма добавления */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          placeholder="Название детали"
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          required
        />
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            placeholder="Длина (мм)"
            value={formData.length}
            onChange={(e) => setFormData({...formData, length: e.target.value})}
            className="bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            min="1"
            required
          />
          <input
            type="number"
            placeholder="Ширина (мм)"
            value={formData.width}
            onChange={(e) => setFormData({...formData, width: e.target.value})}
            className="bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            min="1"
            required
          />
        </div>
        <input
          type="number"
          placeholder="Количество"
          value={formData.quantity}
          onChange={(e) => setFormData({...formData, quantity: e.target.value})}
          className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          min="1"
          required
        />
        <button
          type="submit"
          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded text-sm font-medium transition-colors"
        >
          Добавить деталь
        </button>
      </form>

      {/* Список деталей */}
      {state.parts.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-white font-medium text-sm">Добавленные детали:</h3>
          {state.parts.map(part => (
            <div
              key={part.id}
              className={`bg-gray-700 rounded p-3 border transition-colors ${
                state.selectedPartId === part.id 
                  ? 'border-blue-500 bg-gray-600' 
                  : 'border-gray-600 hover:border-gray-500'
              }`}
              onClick={() => dispatch({ type: 'SET_SELECTED_PART', payload: part.id })}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <div className="text-white font-medium text-sm">{part.name}</div>
                  <div className="text-gray-300 text-xs">
                    {part.length}×{part.width} мм
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removePart(part.id);
                  }}
                  className="text-red-400 hover:text-red-300 text-sm"
                >
                  🗑️
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-300 text-xs">Количество:</span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      updateQuantity(part.id, -1);
                    }}
                    className="w-6 h-6 bg-gray-600 hover:bg-gray-500 text-white rounded text-xs flex items-center justify-center"
                  >
                    -
                  </button>
                  <span className="text-white text-sm w-8 text-center">{part.quantity}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      updateQuantity(part.id, 1);
                    }}
                    className="w-6 h-6 bg-gray-600 hover:bg-gray-500 text-white rounded text-xs flex items-center justify-center"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
