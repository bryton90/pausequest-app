export const playSound = (type: 'start' | 'complete') => {
  try {
    const sound = new Audio(`/sounds/${type}.mp3`);
    sound.volume = 0.5; // Set volume to 50%
    sound.play().catch(error => {
      console.warn('Audio playback failed:', error);
    });
  } catch (error) {
    console.warn('Error playing sound:', error);
  }
};
