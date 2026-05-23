import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ErrorBanner from '../src/components/ErrorBanner.jsx';

describe('<ErrorBanner />', () => {
  it('returns null with no error', () => {
    const { container } = render(<ErrorBanner error={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders the friendly title for known codes', () => {
    render(<ErrorBanner error={{ code: 'network', message: 'fetch failed' }} />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/Can't reach the server/i)).toBeInTheDocument();
  });

  it('falls back to generic copy for unknown codes', () => {
    render(<ErrorBanner error={{ code: 'totally_made_up' }} />);
    expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
  });

  it('calls onDismiss when the dismiss button is clicked', () => {
    const onDismiss = vi.fn();
    render(<ErrorBanner error={{ code: 'network' }} onDismiss={onDismiss} />);
    fireEvent.click(screen.getByRole('button', { name: /dismiss/i }));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});
