import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface RocketAnimationProps {
  percentage: number;
  isRunning: boolean;
}

const RocketAnimation: React.FC<RocketAnimationProps> = ({ percentage, isRunning }) => {
  const [showParticles, setShowParticles] = useState(false);
  const [launchComplete, setLaunchComplete] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (percentage === 100 && isRunning) {
      setShowParticles(true);
      setLaunchComplete(true);
      setTimeout(() => {
        setShowParticles(false);
        setLaunchComplete(false);
      }, 3000);
    }
  }, [percentage, isRunning]);

  const rocketHeight = 80;
  const maxHeight = 200;
  const currentHeight = (percentage / 100) * (maxHeight - rocketHeight);

  return (
    <div 
      ref={containerRef}
      className="relative w-32 h-64 flex items-end justify-center overflow-hidden"
      style={{ willChange: 'transform' }}
    >
      {/* Stars background */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              left: `${20 + (i * 10)}%`,
              top: `${10 + (i * 15)}%`,
            }}
            animate={{
              opacity: [0.3, 1, 0.3],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{
              duration: 2 + (i * 0.3),
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Rocket Container */}
      <motion.div
        className="relative z-10"
        animate={{
          y: -currentHeight,
          rotate: percentage === 100 ? [0, -5, 5, 0] : 0,
        }}
        transition={{
          y: { type: "spring", stiffness: 100, damping: 20 },
          rotate: { duration: 0.5 },
        }}
      >
        {/* Rocket Body */}
        <div className="relative">
          {/* Main rocket emoji */}
          <motion.div
            className="text-6xl"
            animate={{
              scale: isRunning ? [1, 1.1, 1] : 1,
            }}
            transition={{
              duration: 1,
              repeat: isRunning ? Infinity : 0,
              ease: "easeInOut",
            }}
          >
            🚀
          </motion.div>

          {/* Exhaust flames */}
          <AnimatePresence>
            {isRunning && (
              <motion.div
                className="absolute -bottom-4 left-1/2 transform -translate-x-1/2"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="relative">
                  <motion.div
                    className="w-8 h-6 bg-gradient-to-b from-yellow-400 to-red-500 rounded-full blur-sm"
                    animate={{
                      scaleY: [1, 1.3, 1],
                      opacity: [0.8, 1, 0.8],
                    }}
                    transition={{
                      duration: 0.3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                  <motion.div
                    className="absolute top-0 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-yellow-300 rounded-full"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.6, 1, 0.6],
                    }}
                    transition={{
                      duration: 0.2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Launch particles */}
      <AnimatePresence>
        {showParticles && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"
                style={{
                  left: '50%',
                  bottom: '20%',
                }}
                initial={{ 
                  scale: 0,
                  opacity: 1,
                  x: 0,
                  y: 0,
                }}
                animate={{
                  scale: [0, 1, 0],
                  opacity: [1, 0.8, 0],
                  x: (Math.random() - 0.5) * 200,
                  y: -Math.random() * 150 - 50,
                }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 1.5,
                  ease: "easeOut",
                }}
              />
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Success message */}
      <AnimatePresence>
        {launchComplete && (
          <motion.div
            className="absolute top-0 left-1/2 transform -translate-x-1/2 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-2xl font-bold text-green-500 dark:text-green-400">
              Mission Complete! 🎉
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Great focus session!
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress indicator */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
    </div>
  );
};

export default RocketAnimation;
