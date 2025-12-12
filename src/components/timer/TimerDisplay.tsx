import React, { memo, useMemo, useRef, useEffect, useCallback } from 'react';
import { useSettings } from '../../contexts/SettingsContext';
import { VisualizationType } from '../../utils/theme';

interface TimerDisplayProps {
  remainingMs: number;
  visualization: VisualizationType;
  className?: string;
}

const formatTime = (ms: number): string => {
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

const TimerDisplay: React.FC<TimerDisplayProps> = memo(({ 
  remainingMs, 
  visualization,
  className = ''
}) => {
  const requestRef = useRef<number>(0);
  const progressCircleRef = useRef<SVGCircleElement>(null);
  const prevTimeRef = useRef<number>(0);
  const progressRef = useRef<number>(0);
  
  const timeString = useMemo(() => formatTime(remainingMs), [remainingMs]);
  
  const maxMs = 60 * 60 * 1000; // Max duration of 60 minutes
  const targetProgress = useMemo(() => {
    return Math.min(100, (1 - (remainingMs / maxMs)) * 100);
  }, [remainingMs, maxMs]);
  
  const animateProgress = useCallback((timestamp: number) => {
    if (!prevTimeRef.current) {
      prevTimeRef.current = timestamp;
    }
    
    const deltaTime = timestamp - prevTimeRef.current;
    prevTimeRef.current = timestamp;
    
    // Smoothly interpolate progress
    progressRef.current += (targetProgress - progressRef.current) * (1 - Math.exp(-0.02 * deltaTime));
    
    // Update the circle's stroke-dashoffset using transform for better performance
    if (progressCircleRef.current) {
      const circumference = 2 * Math.PI * 45; // 2*PI*r where r=45
      const offset = circumference - (progressRef.current / 100) * circumference;
      progressCircleRef.current.style.transform = `rotate(-90deg) scaleX(${progressRef.current / 100})`;
      progressCircleRef.current.style.transformOrigin = 'center';
      progressCircleRef.current.style.transition = 'transform 0.1s linear';
    }
    
    // Continue the animation if not at target
    if (Math.abs(progressRef.current - targetProgress) > 0.1) {
      requestRef.current = requestAnimationFrame(animateProgress);
    } else {
      progressRef.current = targetProgress;
    }
  }, [targetProgress]);
  
  useEffect(() => {
    // Start the animation when the component mounts or targetProgress changes
    requestRef.current = requestAnimationFrame(animateProgress);
    
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [animateProgress]);

  const { isDarkMode } = useSettings();
  const textColorClass = isDarkMode ? 'text-white' : 'text-gray-900';

  const renderVisualization = () => {
    const progress = 1 - (remainingMs / maxMs);
    
    switch (visualization) {
      case 'rocket':
        return (
          <div className="relative w-32 h-32">
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
              <div className="relative">
                <div 
                  className="absolute bottom-0 left-1/2 transform -translate-x-1/2 bg-gray-200 rounded-t-full"
                  style={{
                    width: '80px',
                    height: `${80 * (1 - progress)}px`,
                    bottom: '10%',
                  }}
                />
                <div className="text-6xl">🚀</div>
                <div 
                  className="absolute bottom-0 left-1/2 transform -translate-x-1/2 bg-orange-500 rounded-full"
                  style={{
                    width: '40px',
                    height: '12px',
                    bottom: '-5%',
                  }}
                />
              </div>
            </div>
          </div>
        );
      case 'coffee':
        return (
          <div className="relative w-32 h-32">
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
              <div className="relative">
                <div 
                  className="absolute bottom-0 left-1/2 transform -translate-x-1/2 bg-amber-800 rounded-t-lg"
                  style={{
                    width: '80px',
                    height: `${80 * progress}px`,
                    bottom: '10%',
                  }}
                />
                <div className="text-6xl">☕</div>
              </div>
            </div>
          </div>
        );
      case 'digital':
      default:
        return (
          <div className={`text-6xl font-mono ${textColorClass}`}>
            {formatTime(remainingMs)}
          </div>
        );
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`} style={{ willChange: 'contents' }}>
      {renderVisualization()}
    </div>
  );
}, (prevProps, nextProps) => {
  // Only re-render if remainingMs changes by more than 1000ms (1 second)
  // or if visualization changes
  return (
    Math.abs(prevProps.remainingMs - nextProps.remainingMs) < 1000 &&
    prevProps.visualization === nextProps.visualization
  );
});

TimerDisplay.displayName = 'TimerDisplay';

export default TimerDisplay;
