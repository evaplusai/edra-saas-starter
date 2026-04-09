import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import App from '../App';

describe('App', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('renders the landing page at root', async () => {
    render(<App />);
    expect(
      await screen.findByText(/Build your SaaS/i),
    ).toBeInTheDocument();
  });
});
