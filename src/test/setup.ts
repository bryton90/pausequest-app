/// <reference types="@testing-library/jest-dom" />
import '@testing-library/jest-dom';
import { beforeAll, afterEach, afterAll, vi } from 'vitest';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
vi.stubGlobal('localStorage', localStorageMock);

// Mock Notification API
const notificationMock = {
  requestPermission: vi.fn().mockResolvedValue('granted'),
  permission: 'granted' as NotificationPermission,
};
vi.stubGlobal('Notification', notificationMock);

// Mock requestAnimationFrame
vi.stubGlobal('requestAnimationFrame', vi.fn((cb) => setTimeout(cb, 16)));
vi.stubGlobal('cancelAnimationFrame', vi.fn());

beforeAll(() => {
  // Setup any global test configuration
});

afterEach(() => {
  // Clear mocks after each test
  vi.clearAllMocks();
});

afterAll(() => {
  // Cleanup after all tests
});
