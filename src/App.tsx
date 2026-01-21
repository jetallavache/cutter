import React, { useState } from 'react';
import { AppProvider, useAppContext } from './context/AppContext';
import { TopPanel } from './components/TopPanel';
import { LeftPanel } from './components/LeftPanel';
import { Canvas } from './components/Canvas';
import { RightPanel } from './components/RightPanel';
import { CostCalculationModal } from './components/CostCalculationModal';
import { Toast } from './components/Toast';

const AppContent: React.FC = () => {
  const { state } = useAppContext();
  const [showCostModal, setShowCostModal] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const handleOpenCostModal = () => {
    setShowCostModal(true);
  };

  return (
    <div className="h-screen bg-gray-900 flex flex-col">
      {/* Верхняя панель */}
      <TopPanel onOpenCostModal={handleOpenCostModal} />

      {/* Основной контент */}
      <div className="flex-1 flex overflow-hidden">
        {/* Левая панель */}
        <LeftPanel />

        {/* Центральный холст */}
        <Canvas />

        {/* Правая панель */}
        <RightPanel onOpenCostModal={handleOpenCostModal} />
      </div>

      {/* Модальные окна */}
      {showCostModal && state.nestingResult && state.selectedMaterial && (
        <CostCalculationModal
          isOpen={showCostModal}
          onClose={() => setShowCostModal(false)}
          result={state.nestingResult}
          material={state.selectedMaterial}
        />
      )}

      {/* Уведомления */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
