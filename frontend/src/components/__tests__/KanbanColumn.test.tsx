import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import KanbanColumn from '../KanbanColumn';
import { InterviewStep, Candidate } from '../../types/api';

// Mock the CandidateCard component
jest.mock('../CandidateCard', () => {
  return function MockCandidateCard({ candidate }: { candidate: any }) {
    return (
      <div data-testid={`candidate-card-${candidate.id}`}>
        {candidate.fullName}
      </div>
    );
  };
});

const mockInterviewStep: InterviewStep = {
  id: 1,
  interviewFlowId: 1,
  interviewTypeId: 1,
  name: 'Initial Screening',
  orderIndex: 1
};

const mockCandidates: Candidate[] = [
  {
    id: 1,
    applicationId: 101,
    fullName: 'John Doe',
    currentInterviewStep: 'Initial Screening',
    currentInterviewStepId: 1,
    averageScore: 4.2
  },
  {
    id: 2,
    applicationId: 102,
    fullName: 'Jane Smith',
    currentInterviewStep: 'Initial Screening',
    currentInterviewStepId: 1,
    averageScore: 3.8
  }
];

describe('KanbanColumn Component', () => {
  it('should render column with interview step title', () => {
    render(
      <KanbanColumn 
        interviewStep={mockInterviewStep}
        candidates={mockCandidates}
        onCandidateMove={jest.fn()}
      />
    );

    expect(screen.getByText('Initial Screening')).toBeInTheDocument();
  });

  it('should display candidate count in header', () => {
    render(
      <KanbanColumn 
        interviewStep={mockInterviewStep}
        candidates={mockCandidates}
        onCandidateMove={jest.fn()}
      />
    );

    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('should render all candidates for this stage', () => {
    render(
      <KanbanColumn 
        interviewStep={mockInterviewStep}
        candidates={mockCandidates}
        onCandidateMove={jest.fn()}
      />
    );

    expect(screen.getByTestId('candidate-card-1')).toBeInTheDocument();
    expect(screen.getByTestId('candidate-card-2')).toBeInTheDocument();
  });

  it('should render empty state when no candidates', () => {
    render(
      <KanbanColumn 
        interviewStep={mockInterviewStep}
        candidates={[]}
        onCandidateMove={jest.fn()}
      />
    );

    expect(screen.getByText('No candidates in this stage')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('should have proper ARIA attributes for accessibility', () => {
    render(
      <KanbanColumn 
        interviewStep={mockInterviewStep}
        candidates={mockCandidates}
        onCandidateMove={jest.fn()}
      />
    );

    const column = screen.getByRole('region');
    expect(column).toHaveAttribute('aria-label', 'Initial Screening - 2 candidates');
  });

  it('should have droppable area with correct data attributes', () => {
    render(
      <KanbanColumn 
        interviewStep={mockInterviewStep}
        candidates={mockCandidates}
        onCandidateMove={jest.fn()}
      />
    );

    const dropZone = screen.getByTestId('kanban-column-drop-zone');
    expect(dropZone).toHaveAttribute('data-interview-step-id', '1');
  });

  it('should handle responsive classes correctly', () => {
    render(
      <KanbanColumn 
        interviewStep={mockInterviewStep}
        candidates={mockCandidates}
        onCandidateMove={jest.fn()}
        isDesktop={true}
      />
    );

    const column = screen.getByTestId('kanban-column');
    expect(column).toHaveClass('kanban-column-desktop');
  });

  it('should apply mobile layout classes when not desktop', () => {
    render(
      <KanbanColumn 
        interviewStep={mockInterviewStep}
        candidates={mockCandidates}
        onCandidateMove={jest.fn()}
        isDesktop={false}
      />
    );

    const column = screen.getByTestId('kanban-column');
    expect(column).toHaveClass('kanban-column-mobile');
  });

  it('should filter candidates correctly for this stage', () => {
    const mixedCandidates: Candidate[] = [
      ...mockCandidates,
      {
        id: 3,
        applicationId: 103,
        fullName: 'Bob Wilson',
        currentInterviewStep: 'Technical Interview',
        currentInterviewStepId: 2,
        averageScore: 4.5
      }
    ];

    render(
      <KanbanColumn 
        interviewStep={mockInterviewStep}
        candidates={mixedCandidates}
        onCandidateMove={jest.fn()}
      />
    );

    // Should only show candidates for this stage
    expect(screen.getByTestId('candidate-card-1')).toBeInTheDocument();
    expect(screen.getByTestId('candidate-card-2')).toBeInTheDocument();
    expect(screen.queryByTestId('candidate-card-3')).not.toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument(); // Count should be 2, not 3
  });
});
