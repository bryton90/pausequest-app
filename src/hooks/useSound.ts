import { useEffect, useRef, useState } from 'react';

interface UseSoundProps {
  enabled: boolean;
  volume?: number;
}

export const useSound = ({ enabled, volume = 0.5 }: UseSoundProps) => {
  const tickAudioRef = useRef<HTMLAudioElement | null>(null);
  const [isTickingEnabled, setIsTickingEnabled] = useState(false);

  useEffect(() => {
    // Create audio context for ticking sound
    if (enabled && !tickAudioRef.current) {
      tickAudioRef.current = new Audio();
      tickAudioRef.current.volume = volume;
    }
  }, [enabled, volume]);

  const playTick = () => {
    if (!enabled || !tickAudioRef.current) return;
    
    // Generate a simple tick sound using Web Audio API
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(volume * 0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
  };

  const playAlarm = () => {
    if (!enabled) return;
    
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 440;
    oscillator.type = 'square';
    
    gainNode.gain.setValueAtTime(volume * 0.5, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  };

  const enableTicking = (enable: boolean) => {
    setIsTickingEnabled(enable);
  };

  return {
    playTick,
    playAlarm,
    enableTicking,
    isTickingEnabled,
  };
};
