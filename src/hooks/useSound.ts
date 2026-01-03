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

  const playEscalation = () => {
    if (!enabled) return;
    
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Create urgent beeping pattern for time escalation
    oscillator.frequency.value = 1200; // High pitch for urgency
    oscillator.type = 'square'; // Harsher tone for alert
    
    // Create rapid beeping effect
    const currentTime = audioContext.currentTime;
    gainNode.gain.setValueAtTime(0, currentTime);
    gainNode.gain.setValueAtTime(volume * 0.6, currentTime + 0.05);
    gainNode.gain.setValueAtTime(0, currentTime + 0.1);
    gainNode.gain.setValueAtTime(volume * 0.6, currentTime + 0.15);
    gainNode.gain.setValueAtTime(0, currentTime + 0.2);
    
    oscillator.start(currentTime);
    oscillator.stop(currentTime + 0.25);
  };

  const enableTicking = (enable: boolean) => {
    setIsTickingEnabled(enable);
  };

  return {
    playTick,
    playAlarm,
    playEscalation,
    enableTicking,
    isTickingEnabled,
  };
};
