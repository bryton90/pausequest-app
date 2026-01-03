import React, { useEffect, useRef, useState } from 'react';
import Lottie from 'lottie-react';
import { motion } from 'framer-motion';

// Animation data - in a real app, these would be imported from .json files
const rocketLaunchAnimation = {
  "v": "5.5.7",
  "fr": 30,
  "ip": 0,
  "op": 60,
  "w": 200,
  "h": 200,
  "nm": "Rocket Launch",
  "ddd": 0,
  "assets": [],
  "layers": [{
    "ddd": 0,
    "ind": 1,
    "ty": 4,
    "nm": "Rocket",
    "sr": 1,
    "ks": {
      "r": 0,
      "k": [{
        "t": 0,
        "s": [0],
        "e": [0]
      }, {
        "t": 60,
        "s": [0],
        "e": [0]
      }]
    },
    "ao": 0,
    "shapes": [{
      "ty": "gr",
      "it": [{
        "ty": "rc",
        "d": 1,
        "s": {"a": 0, "k": [40, 60]},
        "p": {"a": 0, "k": [100, 100]},
        "r": {"a": 0, "k": 20}
      }]
    }]
  }]
};

const coffeeSteamAnimation = {
  "v": "5.5.7",
  "fr": 30,
  "ip": 0,
  "op": 90,
  "w": 150,
  "h": 150,
  "nm": "Coffee Steam",
  "ddd": 0,
  "assets": [],
  "layers": [{
    "ddd": 0,
    "ind": 1,
    "ty": 4,
    "nm": "Steam",
    "sr": 1,
    "ks": {
      "r": 0,
      "k": [{
        "t": 0,
        "s": [0],
        "e": [360]
      }]
    },
    "ao": 0,
    "shapes": [{
      "ty": "gr",
      "it": [{
        "ty": "el",
        "d": 1,
        "s": {"a": 0, "k": [20, 40]},
        "p": {"a": 0, "k": [75, 75]}
      }]
    }]
  }]
};

const celebrationAnimation = {
  "v": "5.5.7",
  "fr": 30,
  "ip": 0,
  "op": 120,
  "w": 300,
  "h": 300,
  "nm": "Celebration",
  "ddd": 0,
  "assets": [],
  "layers": [{
    "ddd": 0,
    "ind": 1,
    "ty": 4,
    "nm": "Confetti",
    "sr": 1,
    "ks": {
      "p": {
        "a": 1,
        "k": [{
          "t": 0,
          "s": [150, 0],
          "e": [150, 300]
        }]
      }
    }
  }]
};

interface LottieAnimationsProps {
  type: 'rocket-launch' | 'coffee-steam' | 'celebration' | 'achievement';
  isPlaying?: boolean;
  loop?: boolean;
  onComplete?: () => void;
  size?: number;
  className?: string;
}

const LottieAnimations: React.FC<LottieAnimationsProps> = ({
  type,
  isPlaying = true,
  loop = true,
  onComplete,
  size = 200,
  className = ''
}) => {
  const [animationData, setAnimationData] = useState<any>(null);
  const lottieRef = useRef<any>(null);

  useEffect(() => {
    // In a real app, these would be imported from actual .json files
    switch (type) {
      case 'rocket-launch':
        setAnimationData(rocketLaunchAnimation);
        break;
      case 'coffee-steam':
        setAnimationData(coffeeSteamAnimation);
        break;
      case 'celebration':
      case 'achievement':
        setAnimationData(celebrationAnimation);
        break;
      default:
        setAnimationData(null);
    }
  }, [type]);

  const handleComplete = () => {
    if (onComplete) {
      onComplete();
    }
  };

  if (!animationData) {
    return (
      <div 
        className={`flex items-center justify-center ${className}`}
        style={{ width: size, height: size }}
      >
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const style = {
    width: size,
    height: size,
  };

  return (
    <motion.div
      className={className}
      style={style}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Lottie
        lottieRef={lottieRef}
        animationData={animationData}
        loop={loop}
        autoplay={isPlaying}
        onComplete={handleComplete}
        style={{
          width: '100%',
          height: '100%',
        }}
      />
    </motion.div>
  );
};

// Enhanced animation components for specific use cases
export const RocketLaunchAnimation: React.FC<{
  isActive: boolean;
  onComplete?: () => void;
  size?: number;
}> = ({ isActive, onComplete, size = 200 }) => {
  return (
    <div className="relative">
      <LottieAnimations
        type="rocket-launch"
        isPlaying={isActive}
        loop={false}
        size={size}
        {...(onComplete && { onComplete })}
      />
      {isActive && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 2, repeat: 2 }}
        >
          <div className="w-full h-full bg-gradient-to-t from-orange-400/20 to-transparent rounded-full" />
        </motion.div>
      )}
    </div>
  );
};

export const CoffeeSteamAnimation: React.FC<{
  isActive: boolean;
  intensity?: 'low' | 'medium' | 'high';
  size?: number;
}> = ({ isActive, intensity = 'medium', size = 150 }) => {
  const animationSpeed = {
    low: 0.5,
    medium: 1,
    high: 1.5
  }[intensity];

  return (
    <div className="relative">
      <LottieAnimations
        type="coffee-steam"
        isPlaying={isActive}
        loop={true}
        size={size}
      />
      {isActive && (
        <motion.div
          className="absolute -top-2 left-1/2 transform -translate-x-1/2"
          animate={{
            y: [0, -10, 0],
          }}
          transition={{
            duration: 2 / animationSpeed,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <div className="text-2xl">☕</div>
        </motion.div>
      )}
    </div>
  );
};

export const CelebrationAnimation: React.FC<{
  trigger: boolean;
  onComplete?: () => void;
  size?: number;
}> = ({ trigger, onComplete, size = 300 }) => {
  const [shouldPlay, setShouldPlay] = useState(false);

  useEffect(() => {
    if (trigger) {
      setShouldPlay(true);
    }
  }, [trigger]);

  const handleComplete = () => {
    setShouldPlay(false);
    if (onComplete) {
      onComplete();
    }
  };

  if (!shouldPlay) {
    return null;
  }

  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center pointer-events-none z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative">
        <LottieAnimations
          type="celebration"
          isPlaying={shouldPlay}
          loop={false}
          size={size}
          onComplete={handleComplete}
        />
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <div className="text-4xl font-bold text-center">
            🎉
            <div className="text-xl mt-2">Amazing!</div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

// Achievement unlocked animation
export const AchievementAnimation: React.FC<{
  achievement: {
    title: string;
    description: string;
    icon: string;
  };
  isVisible: boolean;
  onHide: () => void;
}> = ({ achievement, isVisible, onHide }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onHide();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onHide]);

  if (!isVisible) {
    return null;
  }

  return (
    <motion.div
      className="fixed top-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 max-w-sm z-50 border border-gray-200 dark:border-gray-700"
      initial={{ x: 400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 400, opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0">
          <LottieAnimations
            type="achievement"
            isPlaying={true}
            loop={false}
            size={60}
          />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">{achievement.icon}</span>
            <h3 className="font-semibold text-foreground">Achievement Unlocked!</h3>
          </div>
          <h4 className="font-medium text-foreground">{achievement.title}</h4>
          <p className="text-sm text-muted-foreground">{achievement.description}</p>
        </div>
      </div>
    </motion.div>
  );
};

// Progress ring animation with Lottie
export const ProgressRingAnimation: React.FC<{
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
  color?: string;
}> = ({ progress, size = 120, strokeWidth = 8, color = '#2E8B57' }) => {
  const [displayProgress, setDisplayProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDisplayProgress(progress);
    }, 100);
    return () => clearTimeout(timer);
  }, [progress]);

  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (displayProgress / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-gray-200 dark:text-gray-700"
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1, ease: "easeInOut" }}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.span
          className="text-2xl font-bold"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.3 }}
        >
          {Math.round(displayProgress)}%
        </motion.span>
      </div>
    </div>
  );
};

export default LottieAnimations;
