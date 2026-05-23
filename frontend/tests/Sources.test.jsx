import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Sources from '../src/components/Sources.jsx';

const sample = [
  { id: 'a', title: 'Catalog 2024', source: 'docs/catalog.pdf', score: 0.872, snippet: 'snippet a' },
  { id: 'b', title: 'Programs', source: 'docs/programs.md', score: 0.741, snippet: 'snippet b' },
];

describe('<Sources />', () => {
  it('renders nothing when there are no sources', () => {
    const { container } = render(<Sources sources={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('shows a count toggle and reveals the list when clicked', () => {
    render(<Sources sources={sample} />);
    const toggle = screen.getByRole('button', { name: /2 sources/i });
    expect(toggle).toBeInTheDocument();
    expect(screen.queryByText(/Catalog 2024/)).not.toBeInTheDocument();
    fireEvent.click(toggle);
    expect(screen.getByText(/Catalog 2024/)).toBeInTheDocument();
    expect(screen.getByText(/Programs/)).toBeInTheDocument();
  });

  it('renders web sources with a badge and clickable link', () => {
    render(
      <Sources
        sources={[
          {
            id: 'web-source-1',
            type: 'web',
            title: 'Official Result',
            url: 'https://example.edu',
            source: 'https://example.edu',
            snippet: 'Public web result.',
          },
        ]}
      />,
    );

    expect(screen.getByText(/More info from the web/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Official Result/i })).toHaveAttribute(
      'href',
      'https://example.edu',
    );

    fireEvent.click(screen.getByRole('button', { name: /1 source/i }));
    expect(screen.getByText('Web')).toBeInTheDocument();
  });
});
