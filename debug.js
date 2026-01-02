// Debug script to test basic functionality
console.log('Debug script loaded');

// Test 1: Check if settings are accessible
try {
  const settings = localStorage.getItem('appSettings');
  console.log('Settings from localStorage:', settings);
  if (settings) {
    const parsed = JSON.parse(settings);
    console.log('Parsed settings:', parsed);
  }
} catch (e) {
  console.error('Error reading settings:', e);
}

// Test 2: Check CSS variables
const root = document.documentElement;
console.log('Current CSS variables:');
console.log('--bg-color:', getComputedStyle(root).getPropertyValue('--bg-color'));
console.log('--text-primary:', getComputedStyle(root).getPropertyValue('--text-primary'));

// Test 3: Check theme classes
console.log('Dark class present:', root.classList.contains('dark'));
console.log('Data theme:', root.getAttribute('data-theme'));

// Test 4: Check if timer contexts are available
setTimeout(() => {
  console.log('Checking contexts after delay...');
  // This will be checked in the browser console
}, 1000);
