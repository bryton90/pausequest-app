export const playSound = (type: 'start' | 'complete', volume?: number, enabled?: boolean) => {
  try {
    // Check if sounds are disabled (default to true if not specified)
    if (enabled === false) {
      return;
    }
    
    // Use Web Audio API to generate simple tones as fallback
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Set volume (use provided volume or default to 50%)
    gainNode.gain.value = (volume ?? 0.5) * 0.3; // Reduce overall volume
    
    // Different tones for different events
    if (type === 'start') {
      oscillator.frequency.value = 800; // Higher pitch for start
      oscillator.type = 'sine';
    } else if (type === 'complete') {
      oscillator.frequency.value = 600; // Lower pitch for complete
      oscillator.type = 'sine';
    }
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.2); // Short tone
    
  } catch (error) {
    console.warn('Error playing sound:', error);
    // Fallback to trying audio files if Web Audio API fails
    try {
      const sound = new Audio(`/sounds/${type}.mp3`);
      sound.volume = volume ?? 0.5;
      sound.play().catch(error => {
        console.warn('Audio playback failed:', error);
      });
    } catch (fallbackError) {
      console.warn('Fallback audio also failed:', fallbackError);
    }
  }
};
