import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { NestingResult, CostCalculation, Material } from '../types';
import jsPDF from 'jspdf';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  result: NestingResult;
  material: Material;
}

export const CostCalculationModal: React.FC<Props> = ({ isOpen, onClose, result, material }) => {
  const [costData, setCostData] = useState<CostCalculation>({
    materialCostPerM2: material.pricePerM2 || 0,
    laborCostPerHour: 1500,
    clientMarkup: 30,
    materialCost: 0,
    cuttingCost: 0,
    edgingCost: 0,
    wasteCost: 0,
    laborCost: 0,
    totalCost: 0,
    clientPrice: 0
  });

  useEffect(() => {
    if (!result) return;

    const usedSheetArea = result.sheets.reduce((sum, sheet) => 
      sum + (sheet.width * sheet.height), 0
    ) / 1000000;

    const materialCost = costData.materialCostPerM2 * usedSheetArea;
    const cuttingTime = result.cuttingTime / 60; // в часах
    const cuttingCost = cuttingTime * costData.laborCostPerHour;
    
    // Расчёт кромки (периметр всех деталей)
    const totalPerimeter = result.sheets.reduce((sum, sheet) => 
      sum + sheet.placedParts.reduce((partSum, part) => 
        partSum + 2 * (part.width + part.height), 0
      ), 0
    ) / 1000; // в метрах
    const edgingCost = totalPerimeter * 50; // 50 руб за метр кромки
    
    const wasteCost = (result.totalWasteArea / 1000000) * costData.materialCostPerM2;
    const laborCost = materialCost * 0.2; // 20% от стоимости материала
    
    const totalCost = materialCost + cuttingCost + edgingCost + laborCost;
    const clientPrice = totalCost * (1 + costData.clientMarkup / 100);

    setCostData(prev => ({
      ...prev,
      materialCost,
      cuttingCost,
      edgingCost,
      wasteCost,
      laborCost,
      totalCost,
      clientPrice
    }));
  }, [result, costData.materialCostPerM2, costData.laborCostPerHour, costData.clientMarkup]);

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text('Расчёт стоимости раскроя', 20, 30);
    
    doc.setFontSize(12);
    let y = 50;
    
    // Основные метрики
    doc.text('ОСНОВНЫЕ ПОКАЗАТЕЛИ:', 20, y);
    y += 10;
    doc.text(`Количество листов: ${result.sheets.length}`, 20, y);
    y += 8;
    doc.text(`Эффективность раскроя: ${result.totalEfficiency.toFixed(1)}%`, 20, y);
    y += 8;
    doc.text(`Время производства: ${(result.cuttingTime / 60).toFixed(1)} часов`, 20, y);
    y += 20;
    
    // Детализация затрат
    doc.text('ДЕТАЛИЗАЦИЯ ЗАТРАТ:', 20, y);
    y += 10;
    doc.text(`Материал: ${costData.materialCost.toFixed(2)} руб.`, 20, y);
    y += 8;
    doc.text(`Резка: ${costData.cuttingCost.toFixed(2)} руб.`, 20, y);
    y += 8;
    doc.text(`Кромка: ${costData.edgingCost.toFixed(2)} руб.`, 20, y);
    y += 8;
    doc.text(`Работа: ${costData.laborCost.toFixed(2)} руб.`, 20, y);
    y += 20;
    
    doc.setFontSize(16);
    doc.text(`ИТОГО: ${costData.clientPrice.toFixed(2)} руб.`, 20, y);
    
    doc.save('raskroy-calculation.pdf');
  };

  if (!isOpen) return null;

  const chartData = [
    { label: 'Материал', value: costData.materialCost, color: '#3B82F6' },
    { label: 'Резка', value: costData.cuttingCost, color: '#10B981' },
    { label: 'Кромка', value: costData.edgingCost, color: '#F59E0B' },
    { label: 'Работа', value: costData.laborCost, color: '#8B5CF6' }
  ];

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  return createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-2xl font-semibold text-white">Расчёт стоимости</h2>
        </div>
        
        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Левая часть - Форма */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white mb-4">Параметры расчёта</h3>
            
            <div>
              <label className="block text-gray-300 text-sm mb-2">
                Цена материала за м² (руб.)
              </label>
              <input
                type="number"
                value={costData.materialCostPerM2}
                onChange={(e) => setCostData({
                  ...costData,
                  materialCostPerM2: parseFloat(e.target.value) || 0
                })}
                className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 focus:border-blue-500 focus:outline-none"
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-gray-300 text-sm mb-2">
                Стоимость работы (руб./час)
              </label>
              <input
                type="number"
                value={costData.laborCostPerHour}
                onChange={(e) => setCostData({
                  ...costData,
                  laborCostPerHour: parseFloat(e.target.value) || 0
                })}
                className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 focus:border-blue-500 focus:outline-none"
                min="0"
              />
            </div>

            <div>
              <label className="block text-gray-300 text-sm mb-2">
                Наценка для клиента (%)
              </label>
              <input
                type="number"
                value={costData.clientMarkup}
                onChange={(e) => setCostData({
                  ...costData,
                  clientMarkup: parseFloat(e.target.value) || 0
                })}
                className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 focus:border-blue-500 focus:outline-none"
                min="0"
              />
            </div>
          </div>

          {/* Правая часть - Результаты */}
          <div className="space-y-4">
            {/* Цены */}
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="text-center space-y-2">
                <div>
                  <span className="text-gray-300 text-sm">Себестоимость:</span>
                  <div className="text-2xl font-bold text-gray-300">
                    {costData.totalCost.toFixed(0)} руб.
                  </div>
                </div>
                <div>
                  <span className="text-gray-300 text-sm">Цена для клиента:</span>
                  <div className="text-3xl font-bold text-green-400">
                    {costData.clientPrice.toFixed(0)} руб.
                  </div>
                </div>
              </div>
            </div>

            {/* Простая диаграмма */}
            <div className="bg-gray-700 rounded-lg p-4">
              <h4 className="text-white font-medium mb-3">Распределение затрат</h4>
              <div className="space-y-2">
                {chartData.map((item, index) => {
                  const percentage = total > 0 ? (item.value / total) * 100 : 0;
                  return (
                    <div key={index} className="flex items-center space-x-2">
                      <div 
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: item.color }}
                      />
                      <div className="flex-1 flex justify-between text-sm">
                        <span className="text-gray-300">{item.label}</span>
                        <span className="text-white">
                          {item.value.toFixed(0)} руб. ({percentage.toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Метрики проекта */}
            <div className="bg-gray-700 rounded-lg p-4">
              <h4 className="text-white font-medium mb-3">Метрики проекта</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-300">Эффективность раскроя:</span>
                  <span className="text-white">{result.totalEfficiency.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Площадь деталей:</span>
                  <span className="text-white">{(result.totalPartsArea / 1000000).toFixed(2)} м²</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Время производства:</span>
                  <span className="text-white">{(result.cuttingTime / 60).toFixed(1)} часов</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Кнопки */}
        <div className="p-6 border-t border-gray-700 flex space-x-3">
          <button
            onClick={exportToPDF}
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded font-medium transition-colors"
          >
            Экспорт в PDF
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-600 hover:bg-gray-500 text-white py-3 px-4 rounded font-medium transition-colors"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
