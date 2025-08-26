import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import CandidateCard from '../CandidateCard';
import { Candidate } from '../../types/api';

const mockCandidate: Candidate = {
  id: 123,
  applicationId: 456,
  fullName: 'John Doe',
  currentInterviewStep: 'Technical Interview',
  currentInterviewStepId: 2,
  averageScore: 4.2
};

describe('CandidateCard Component', () => {
  it('should render candidate full name', () => {
    render(
      <CandidateCard 
        candidate={mockCandidate}
        onCardClick={jest.fn()}
        isDragging={false}
      />
    );

    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('should display formatted average score', () => {
    render(
      <CandidateCard 
        candidate={mockCandidate}
        onCardClick={jest.fn()}
        isDragging={false}
      />
    );

    expect(screen.getByText('Score: 4.2/5')).toBeInTheDocument();
  });

  it('should show current interview step', () => {
    render(
      <CandidateCard 
        candidate={mockCandidate}
        onCardClick={jest.fn()}
        isDragging={false}
      />
    );

    expect(screen.getByText('Technical Interview')).toBeInTheDocument();
  });

  it('should handle zero average score correctly', () => {
    const candidateWithZeroScore = {
      ...mockCandidate,
      averageScore: 0
    };

    render(
      <CandidateCard 
        candidate={candidateWithZeroScore}
        onCardClick={jest.fn()}
        isDragging={false}
      />
    );

    expect(screen.getByText('Score: 0.0/5')).toBeInTheDocument();
  });

  it('should handle decimal scores correctly', () => {
    const candidateWithDecimalScore = {
      ...mockCandidate,
      averageScore: 3.75
    };

    render(
      <CandidateCard 
        candidate={candidateWithDecimalScore}
        onCardClick={jest.fn()}
        isDragging={false}
      />
    );

    expect(screen.getByText('Score: 3.8/5')).toBeInTheDocument(); // Rounded to 1 decimal
  });

  it('should call onCardClick when clicked', () => {
    const onCardClick = jest.fn();
    
    render(
      <CandidateCard 
        candidate={mockCandidate}
        onCardClick={onCardClick}
        isDragging={false}
      />
    );

    fireEvent.click(screen.getByTestId('candidate-card-123'));
    expect(onCardClick).toHaveBeenCalledWith(mockCandidate);
  });

  it('should have proper ARIA attributes for accessibility', () => {
    render(
      <CandidateCard 
        candidate={mockCandidate}
        onCardClick={jest.fn()}
        isDragging={false}
      />
    );

    const card = screen.getByRole('button');
    expect(card).toHaveAttribute('aria-label', 'Candidate John Doe, Score 4.2 out of 5, Current stage: Technical Interview');
    expect(card).toHaveAttribute('tabIndex', '0');
  });

  it('should apply dragging styles when isDragging is true', () => {
    render(
      <CandidateCard 
        candidate={mockCandidate}
        onCardClick={jest.fn()}
        isDragging={true}
      />
    );

    const card = screen.getByTestId('candidate-card-123');
    expect(card).toHaveClass('candidate-card-dragging');
  });

  it('should not apply dragging styles when isDragging is false', () => {
    render(
      <CandidateCard 
        candidate={mockCandidate}
        onCardClick={jest.fn()}
        isDragging={false}
      />
    );

    const card = screen.getByTestId('candidate-card-123');
    expect(card).not.toHaveClass('candidate-card-dragging');
  });

  it('should have proper data attributes for drag and drop', () => {
    render(
      <CandidateCard 
        candidate={mockCandidate}
        onCardClick={jest.fn()}
        isDragging={false}
      />
    );

    const card = screen.getByTestId('candidate-card-123');
    expect(card).toHaveAttribute('data-candidate-id', '123');
    expect(card).toHaveAttribute('data-application-id', '456');
    expect(card).toHaveAttribute('data-current-step-id', '2');
  });

  it('should handle keyboard events for accessibility', () => {
    const onCardClick = jest.fn();
    
    render(
      <CandidateCard 
        candidate={mockCandidate}
        onCardClick={onCardClick}
        isDragging={false}
      />
    );

    const card = screen.getByRole('button');
    
    // Test Enter key
    fireEvent.keyDown(card, { key: 'Enter', code: 'Enter' });
    expect(onCardClick).toHaveBeenCalledWith(mockCandidate);
    
    // Test Space key
    fireEvent.keyDown(card, { key: ' ', code: 'Space' });
    expect(onCardClick).toHaveBeenCalledTimes(2);
  });

  it('should not trigger onCardClick for other keyboard events', () => {
    const onCardClick = jest.fn();
    
    render(
      <CandidateCard 
        candidate={mockCandidate}
        onCardClick={onCardClick}
        isDragging={false}
      />
    );

    const card = screen.getByRole('button');
    
    fireEvent.keyDown(card, { key: 'Tab', code: 'Tab' });
    fireEvent.keyDown(card, { key: 'Escape', code: 'Escape' });
    
    expect(onCardClick).not.toHaveBeenCalled();
  });

  it('should render with mobile-friendly touch target size', () => {
    render(
      <CandidateCard 
        candidate={mockCandidate}
        onCardClick={jest.fn()}
        isDragging={false}
        isMobile={true}
      />
    );

    const card = screen.getByTestId('candidate-card-123');
    expect(card).toHaveClass('candidate-card-mobile');
  });

  it('should handle long candidate names gracefully', () => {
    const candidateWithLongName = {
      ...mockCandidate,
      fullName: 'Dr. Alexander Christopher Montgomery-Wellington III'
    };

    render(
      <CandidateCard 
        candidate={candidateWithLongName}
        onCardClick={jest.fn()}
        isDragging={false}
      />
    );

    expect(screen.getByText('Dr. Alexander Christopher Montgomery-Wellington III')).toBeInTheDocument();
    const nameElement = screen.getByTestId('candidate-name');
    expect(nameElement).toHaveClass('candidate-name-ellipsis');
  });
});
