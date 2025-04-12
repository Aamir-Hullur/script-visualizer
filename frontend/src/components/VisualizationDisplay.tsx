import { useState, useRef, useEffect } from "react";

interface VisualizationDisplayProps {
  outputUrl?: string;
  error?: string;
  isLoading?: boolean;
}

export function VisualizationDisplay({ 
  outputUrl, 
  error, 
  isLoading 
}: VisualizationDisplayProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const updateSize = () => {

    };

    const resizeObserver = new ResizeObserver(updateSize);
    resizeObserver.observe(containerRef.current);

    return () => {
      if (containerRef.current) {
        resizeObserver.unobserve(containerRef.current);
      }
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[736px] bg-slate-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent mb-4"></div>
          <p className="text-slate-600 text-sm">Generating visualization...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[736px] bg-red-50 text-red-600 p-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-center">{error}</p>
      </div>
    );
  }

  if (!outputUrl) {
    return (
      <div className="flex flex-col items-center justify-center h-[736px] bg-slate-50 text-slate-500">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 9l-6 6m0-6l6 6" />
        </svg>
        <p className="text-center">Your visualization will appear here</p>
        <p className="text-center text-xs mt-2 text-slate-400">Generate a visualization with the editor on the left</p>
      </div>
    );
  }

  const isImage = outputUrl.match(/\.(png|jpg|jpeg|gif)$/i);

  return (
    <div ref={containerRef} className="relative h-[736px] bg-white">
      {isImage ? (
        <>
          {!imageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-pulse text-slate-300">Loading visualization...</div>
            </div>
          )}
          <div className="w-full h-full flex items-center justify-center">
            <img 
              src={outputUrl} 
              alt="Generated visualization" 
              className="max-w-full max-h-full object-contain"
              onLoad={() => setImageLoaded(true)}
              style={{ 
                display: imageLoaded ? 'block' : 'none',
                width: 'auto',
                height: 'auto'
              }}
            />
          </div>
        </>
      ) : (
        <iframe 
          src={outputUrl}
          className="w-full h-full border-0"
          title="Generated visualization"
        />
      )}
    </div>
  );
}