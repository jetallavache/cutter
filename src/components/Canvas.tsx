import React, { useRef, useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';

export const Canvas: React.FC = () => {
  const { state } = useAppContext();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Установка размеров canvas
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Очистка
    ctx.fillStyle = '#111827';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (state.stage === 'preparation') {
      drawPreparationView(ctx, canvas);
    } else if (state.nestingResult) {
      drawResultsView(ctx, canvas);
    }
  }, [state, zoom, pan]);

  const drawPreparationView = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    if (state.parts.length === 0) {
      // Показать подсказку
      ctx.fillStyle = '#6B7280';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(
        'Добавьте детали для отображения схемы',
        canvas.width / 2,
        canvas.height / 2
      );
      return;
    }

    // Группировка одинаковых деталей
    const groupedParts = new Map<string, { part: any, count: number }>();
    state.parts.forEach(part => {
      const key = `${part.length}x${part.width}`;
      if (groupedParts.has(key)) {
        groupedParts.get(key)!.count += part.quantity;
      } else {
        groupedParts.set(key, { part, count: part.quantity });
      }
    });

    // Отображение схематических деталей
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'];
    let y = 50;
    let colorIndex = 0;

    groupedParts.forEach(({ part, count }) => {
      const color = colors[colorIndex % colors.length];
      const isSelected = state.selectedPartId === part.id;
      
      // Прямоугольник детали
      ctx.fillStyle = isSelected ? color : color + '80';
      ctx.fillRect(50, y, 100, 60);
      
      // Граница
      ctx.strokeStyle = isSelected ? '#FFFFFF' : color;
      ctx.lineWidth = isSelected ? 3 : 1;
      ctx.strokeRect(50, y, 100, 60);
      
      // Текст
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '12px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(`${part.name}`, 160, y + 15);
      ctx.fillText(`${part.length}×${part.width} мм`, 160, y + 30);
      ctx.fillText(`Количество: ${count}`, 160, y + 45);
      
      y += 80;
      colorIndex++;
    });
  };

  const drawResultsView = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    if (!state.nestingResult || !state.selectedMaterial) return;

    ctx.save();
    ctx.translate(pan.x, pan.y);
    ctx.scale(zoom, zoom);

    const margin = 50;
    let currentX = margin;

    state.nestingResult.sheets.forEach((sheet, index) => {
      // Фон листа
      ctx.fillStyle = '#374151';
      ctx.fillRect(currentX, margin, sheet.height, sheet.width);
      
      // Граница листа
      ctx.strokeStyle = '#9CA3AF';
      ctx.lineWidth = 2;
      ctx.strokeRect(currentX, margin, sheet.height, sheet.width);

      // Сетка (если включена)
      if (state.settings.visualization.showGrid) {
        ctx.strokeStyle = '#4B5563';
        ctx.lineWidth = 0.5;
        const gridSize = 100;
        
        for (let x = currentX; x <= currentX + sheet.height; x += gridSize) {
          ctx.beginPath();
          ctx.moveTo(x, margin);
          ctx.lineTo(x, margin + sheet.width);
          ctx.stroke();
        }
        
        for (let y = margin; y <= margin + sheet.width; y += gridSize) {
          ctx.beginPath();
          ctx.moveTo(currentX, y);
          ctx.lineTo(currentX + sheet.height, y);
          ctx.stroke();
        }
      }

      // Размещённые детали
      sheet.placedParts.forEach(placedPart => {
        const x = currentX + placedPart.x;
        const y = margin + placedPart.y;
        
        // Заливка детали
        ctx.fillStyle = placedPart.color;
        ctx.fillRect(x, y, placedPart.width, placedPart.height);
        
        // Граница детали
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, placedPart.width, placedPart.height);
        
        // Подпись детали
        ctx.fillStyle = '#000000';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        const text = placedPart.rotated 
          ? `${placedPart.part.name} (↻)`
          : placedPart.part.name;
        
        ctx.fillText(
          text,
          x + placedPart.width / 2,
          y + placedPart.height / 2
        );
      });

      // Подсветка остатков
      if (state.settings.visualization.highlightWaste && sheet.wasteArea > 0) {
        ctx.fillStyle = 'rgba(239, 68, 68, 0.2)';
        ctx.fillRect(currentX, margin, sheet.height, sheet.width);
      }

      // Подпись листа
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '14px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(
        `Лист ${index + 1}`,
        currentX,
        margin - 10
      );

      currentX += sheet.height + margin;
    });

    ctx.restore();
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(prev => Math.max(0.1, Math.min(5, prev * delta)));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 2) { // Правая кнопка мыши
      setIsPanning(true);
      setLastPanPoint({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      const deltaX = e.clientX - lastPanPoint.x;
      const deltaY = e.clientY - lastPanPoint.y;
      setPan(prev => ({ x: prev.x + deltaX, y: prev.y + deltaY }));
      setLastPanPoint({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  return (
    <div className="flex-1 relative bg-gray-900">
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-grab"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onContextMenu={(e) => e.preventDefault()}
      />
      
      {/* Панель управления камерой */}
      {state.stage === 'results' && (
        <div className="absolute top-4 right-4 bg-gray-800 rounded-lg p-2 space-y-1">
          <button
            onClick={() => setZoom(prev => Math.min(5, prev * 1.2))}
            className="block w-8 h-8 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm"
          >
            +
          </button>
          <button
            onClick={() => setZoom(prev => Math.max(0.1, prev * 0.8))}
            className="block w-8 h-8 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm"
          >
            -
          </button>
          <button
            onClick={resetView}
            className="block w-8 h-8 bg-gray-700 hover:bg-gray-600 text-white rounded text-xs"
          >
            ⌂
          </button>
        </div>
      )}
    </div>
  );
};
