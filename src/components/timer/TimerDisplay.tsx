import React, { memo, useMemo, useRef, useEffect, useCallback } from 'react';

export type TimerVisualization = 'battery' | 'rocket' | 'coffee' | 'circle' | 'bar' | 'digital';

interface TimerDisplayProps {
  remainingMs: number;
  visualization: TimerVisualization;
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

  const renderVisualization = () => {
    switch (visualization) {
      case 'digital':
        return (
          <div className="text-6xl font-mono font-bold">
            {timeString}
          </div>
        );
      case 'circle':
        return (
          <div className="relative w-64 h-64">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="#e0e0e0"
                strokeWidth="8"
              />
              <circle
                ref={progressCircleRef}
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="8"
                strokeDasharray="283"
                strokeDashoffset="0"
                className="origin-center"
                style={{
                  willChange: 'transform',
                  transform: 'rotate(-90deg) scaleX(0)'
                }}
              />
              <text
                x="50"
                y="55"
                textAnchor="middle"
                className="text-2xl font-bold"
              >
                {timeString}
              </text>
            </svg>
          </div>
        );
      // Add other visualization types as needed
      default:
        return (
          <div className="text-6xl font-mono font-bold">
            {timeString}
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
