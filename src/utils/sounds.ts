export const playSound = (type: 'start' | 'complete' | 'escalation', volume?: number, enabled?: boolean) => {
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
    const baseVolume = (volume ?? 0.5) * 0.4; // Slightly increase overall volume for better noticeability
    
    // Different tones for different events
    if (type === 'start') {
      oscillator.frequency.value = 800; // Higher pitch for start
      oscillator.type = 'sine';
      gainNode.gain.value = baseVolume;
    } else if (type === 'escalation') {
      // Create urgent beeping pattern for time escalation
      oscillator.frequency.value = 1200; // High pitch for urgency
      oscillator.type = 'square'; // Harsher tone for alert
      gainNode.gain.value = baseVolume * 1.2; // Slightly louder for urgency
      
      // Create rapid beeping effect
      const currentTime = audioContext.currentTime;
      gainNode.gain.setValueAtTime(0, currentTime);
      gainNode.gain.setValueAtTime(baseVolume * 1.2, currentTime + 0.05);
      gainNode.gain.setValueAtTime(0, currentTime + 0.1);
      gainNode.gain.setValueAtTime(baseVolume * 1.2, currentTime + 0.15);
      gainNode.gain.setValueAtTime(0, currentTime + 0.2);
      
      oscillator.start(currentTime);
      oscillator.stop(currentTime + 0.25);
    } else if (type === 'complete') {
      // Make completion sound more noticeable - a gentle chime sequence
      oscillator.frequency.value = 600; // Lower pitch for complete
      oscillator.type = 'sine';
      gainNode.gain.value = baseVolume;
      
      // Add a second harmonic for richness
      const oscillator2 = audioContext.createOscillator();
      const gainNode2 = audioContext.createGain();
      oscillator2.connect(gainNode2);
      gainNode2.connect(audioContext.destination);
      oscillator2.frequency.value = 800; // Higher harmonic
      oscillator2.type = 'sine';
      gainNode2.gain.value = baseVolume * 0.3; // Quieter harmonic
      
      oscillator2.start();
      oscillator2.stop(audioContext.currentTime + 0.3);
    }
    
    oscillator.start();
    if (type === 'escalation') {
      // Escalation sound already handled with custom timing above
    } else {
      oscillator.stop(audioContext.currentTime + 0.4); // Slightly longer tone for better noticeability
    }
    
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
