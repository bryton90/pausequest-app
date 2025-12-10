import React from 'react';
import { motion } from 'framer-motion';

type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';
type SessionType = 'focus' | 'break';

interface VisualizerProps {
  timeOfDay: TimeOfDay;
  sessionType: SessionType;
  className?: string;
}

const timeOfDayColors = {
  morning: {
    primary: 'from-yellow-200 to-amber-200',
    secondary: 'from-amber-100 to-yellow-100',
  },
  afternoon: {
    primary: 'from-blue-300 to-cyan-300',
    secondary: 'from-cyan-100 to-blue-100',
  },
  evening: {
    primary: 'from-orange-300 to-pink-400',
    secondary: 'from-pink-200 to-orange-200',
  },
  night: {
    primary: 'from-indigo-600 to-purple-900',
    secondary: 'from-purple-800 to-indigo-800',
  },
};

const Visualizer: React.FC<VisualizerProps> = ({ 
  timeOfDay = 'afternoon', 
  sessionType = 'focus',
  className = ''
}) => {
  const isFocus = sessionType === 'focus';
  const colors = timeOfDayColors[timeOfDay] || timeOfDayColors.afternoon;

  return (
    <div className={`relative w-full h-48 ${className}`}>
      <motion.div 
        className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${colors.primary} ${
          isFocus ? 'rounded-2xl' : 'rounded-full'
        }`}
        initial={{ opacity: 0.8, scale: 0.95 }}
        animate={{ 
          opacity: [0.8, 1, 0.8],
          scale: [0.95, 1.02, 0.95],
          borderRadius: isFocus ? '1rem' : '9999px',
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <div className={`absolute inset-0 bg-gradient-to-br opacity-20 ${colors.secondary} mix-blend-overlay`} />
        
        {/* Decorative elements */}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute bg-white/20 rounded-full"
            style={{
              width: Math.random() * 40 + 20,
              height: Math.random() * 40 + 20,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              rotate: Math.random() * 360,
            }}
            animate={{
              y: [0, Math.random() * 40 - 20, 0],
              x: [0, Math.random() * 40 - 20, 0],
              opacity: [0.3, 0.7, 0.3],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 5 + Math.random() * 10,
              repeat: Infinity,
              repeatType: 'reverse',
              ease: 'easeInOut',
            }}
          />
        ))}
      </motion.div>
    </div>
  );
};

export default Visualizer;
