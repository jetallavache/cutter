import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

interface Props {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

export const Toast: React.FC<Props> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return createPortal(
    <div className={`toast toast-${type}`}>
      {message}
    </div>,
    document.body
  );
};
