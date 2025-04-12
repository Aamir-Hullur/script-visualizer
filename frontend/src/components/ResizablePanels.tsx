import { useState, useCallback } from 'react';

interface ResizablePanelsProps {
  leftPanel: React.ReactNode;
  rightPanel: React.ReactNode;
  initialLeftWidth?: number;
}

export function ResizablePanels({ 
  leftPanel, 
  rightPanel, 
  initialLeftWidth = 50 
}: ResizablePanelsProps) {
  const [leftWidth, setLeftWidth] = useState(initialLeftWidth);
  const [isResizing, setIsResizing] = useState(false);

  const startResizing = useCallback(() => {
    setIsResizing(true);
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = useCallback((e: React.MouseEvent) => {
    if (isResizing) {
      const container = e.currentTarget.parentElement;
      if (container) {
        const containerWidth = container.offsetWidth;
        const newLeftWidth = (e.clientX / containerWidth) * 100;
        if (newLeftWidth > 30 && newLeftWidth < 70) {
          setLeftWidth(newLeftWidth);
        }
      }
    }
  }, [isResizing]);

  const handleMouseUp = useCallback(() => {
    stopResizing();
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  }, [stopResizing]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isResizing) {
      const container = document.querySelector('.resizable-container');
      if (container) {
        const containerWidth = container.clientWidth;
        const newLeftWidth = (e.clientX / containerWidth) * 100;
        if (newLeftWidth > 30 && newLeftWidth < 70) {
          setLeftWidth(newLeftWidth);
        }
      }
    }
  }, [isResizing]);

  const handleDividerMouseDown = useCallback(() => {
    startResizing();
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [startResizing, handleMouseMove, handleMouseUp]);

  return (
    <div 
      className="resizable-container flex relative w-full"
      onMouseMove={resize}
    >
      <div 
        className="overflow-auto"
        style={{ width: `${leftWidth}%` }}
      >
        {leftPanel}
      </div>
      
      <div 
        className="w-1 bg-slate-200 hover:bg-blue-400 hover:cursor-col-resize transition-colors absolute h-full " 
        style={{ left: `${leftWidth}%` }}
        onMouseDown={handleDividerMouseDown}
      />
      
      <div 
        className="overflow-auto"
        style={{ width: `${100 - leftWidth}%` }}
      >
        {rightPanel}
      </div>
    </div>
  );
}