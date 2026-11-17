import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { VoiceSearchModal } from './VoiceSearchModal';

describe('VoiceSearchModal Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <VoiceSearchModal isOpen={false} onClose={() => {}} onSearch={() => {}} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders language toggles and quick suggestions when open', () => {
    render(
      <VoiceSearchModal isOpen={true} onClose={() => {}} onSearch={() => {}} isHindi={true} />
    );

    expect(screen.getByText('🇮🇳 हिन्दी')).toBeInTheDocument();
    expect(screen.getByText('English')).toBeInTheDocument();
    expect(screen.getByText('टाटा नमक')).toBeInTheDocument();
    expect(screen.getByText('अमूल दूध')).toBeInTheDocument();
  });

  it('submits search immediately when a quick suggestion chip is clicked', () => {
    const handleSearch = vi.fn();
    const handleClose = vi.fn();

    render(
      <VoiceSearchModal
        isOpen={true}
        onClose={handleClose}
        onSearch={handleSearch}
        isHindi={true}
      />
    );

    const amulChip = screen.getByText('अमूल दूध');
    fireEvent.click(amulChip);

    expect(handleSearch).toHaveBeenCalledTimes(1);
    // BILINGUAL_GROCERY_MAP expands 'अमूल दूध' or preserves clean term
    expect(handleSearch.mock.calls[0][0]).toBeTruthy();
    expect(handleClose).toHaveBeenCalled();
  });

  it('calls onClose when close button is clicked', () => {
    const handleClose = vi.fn();

    render(
      <VoiceSearchModal
        isOpen={true}
        onClose={handleClose}
        onSearch={() => {}}
      />
    );

    const closeBtn = screen.getByLabelText('Close voice search');
    fireEvent.click(closeBtn);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
