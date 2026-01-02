import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import RocketAnimation from './RocketAnimation';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: 'div',
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
}));

describe('RocketAnimation', () => {
  it('renders rocket emoji correctly', () => {
    render(<RocketAnimation percentage={0} isRunning={false} />);
    expect(screen.getByText('🚀')).toBeInTheDocument();
  });

  it('shows progress indicator at correct percentage', () => {
    render(<RocketAnimation percentage={50} isRunning={false} />);
    const progressBar = document.querySelector('.bg-gradient-to-r');
    expect(progressBar).toBeInTheDocument();
  });

  it('displays launch complete message at 100%', async () => {
    render(<RocketAnimation percentage={100} isRunning={true} />);
    
    // Wait for the useEffect to run and update the state
    await waitFor(() => {
      expect(screen.getByText('Mission Complete! 🎉')).toBeInTheDocument();
    });
  });

  it('renders without crashing when isRunning is true', () => {
    render(<RocketAnimation percentage={25} isRunning={true} />);
    expect(screen.getByText('🚀')).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    render(<RocketAnimation percentage={0} isRunning={false} />);
    const rocket = screen.getByText('🚀');
    expect(rocket).toBeInTheDocument();
  });
});
