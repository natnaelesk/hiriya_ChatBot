import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import WelcomeScreen from '../src/components/WelcomeScreen.jsx';

describe('<WelcomeScreen />', () => {
  it('renders the headline and prompt chips', () => {
    render(<WelcomeScreen onPick={() => {}} />);
    expect(screen.getByRole('heading', { name: /Ask Hiriya/i })).toBeInTheDocument();
    expect(screen.getByText(/Where is the main campus/i)).toBeInTheDocument();
    expect(screen.getByText(/student housing/i)).toBeInTheDocument();
  });

  it('forwards the chip text to onPick when clicked', () => {
    const onPick = vi.fn();
    render(<WelcomeScreen onPick={onPick} />);
    fireEvent.click(screen.getByText(/Where is the library/i));
    expect(onPick).toHaveBeenCalledTimes(1);
    expect(onPick.mock.calls[0][0]).toMatch(/library/i);
  });
});
