// Simple test script to verify escalation sound functionality
import { playSound } from './src/utils/sounds.js';

console.log('Testing escalation sound...');

// Test the escalation sound
playSound('escalation', 0.5, true);

console.log('Escalation sound test completed!');
