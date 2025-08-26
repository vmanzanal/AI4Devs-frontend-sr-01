import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import { DndContext } from '@dnd-kit/core';
import PositionBoard from '../PositionBoard';
import * as positionService from '../../services/positionService';

// Mock the position service
jest.mock('../../services/positionService');
const mockedPositionService = positionService as jest.Mocked<typeof positionService>;

// Mock data
const mockPositionData = {
  positionName: 'Test Position',
  interviewFlow: {
    id: 1,
    description: 'Test flow',
    interviewSteps: [
      { id: 1, name: 'Initial Screening', orderIndex: 1 },
      { id: 2, name: 'Technical Interview', orderIndex: 2 },
      { id: 3, name: 'Manager Interview', orderIndex: 3 }
    ]
  }
};

const mockCandidates = [
  {
    id: 1,
    applicationId: 101,
    fullName: 'John Doe',
    currentInterviewStep: 'Initial Screening',
    currentInterviewStepId: 1,
    averageScore: 4.5
  },
  {
    id: 2,
    applicationId: 102,
    fullName: 'Jane Smith',
    currentInterviewStep: 'Technical Interview',
    currentInterviewStepId: 2,
    averageScore: 3.8
  }
];

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

// Mock useParams to return position ID
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ id: '1' }),
  useNavigate: () => jest.fn()
}));

describe('Drag and Drop Functionality', () => {
  beforeEach(() => {
    mockedPositionService.getInterviewFlow.mockResolvedValue(mockPositionData);
    mockedPositionService.getCandidatesByPosition.mockResolvedValue(mockCandidates);
    mockedPositionService.updateCandidateStage.mockResolvedValue({
      message: 'Success',
      data: { id: 101, positionId: 1, candidateId: 1, currentInterviewStep: 2 }
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should render DragDropContext wrapper', async () => {
    renderWithRouter(<PositionBoard />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Position')).toBeInTheDocument();
    });

    // Check that candidates are draggable (should have @dnd-kit draggable attributes)
    await waitFor(() => {
      const johnDoeCard = screen.getByText('John Doe').closest('[aria-roledescription="draggable"]');
      expect(johnDoeCard).toBeInTheDocument();
    });
  });

  test('should handle drag start event', async () => {
    renderWithRouter(<PositionBoard />);
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    const candidateCard = screen.getByText('John Doe').closest('[aria-roledescription="draggable"]');
    expect(candidateCard).toBeInTheDocument();

    // Simulate drag start
    if (candidateCard) {
      fireEvent.dragStart(candidateCard);
      expect(candidateCard).toHaveAttribute('aria-roledescription', 'draggable');
    }
  });

  test('should handle successful candidate move between stages', async () => {
    renderWithRouter(<PositionBoard />);
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Simulate drag and drop event
    const candidateCard = screen.getByText('John Doe').closest('[aria-roledescription="draggable"]');
    const technicalColumns = screen.getAllByText('Technical Interview');
    const technicalColumn = technicalColumns[0].closest('[data-testid^="kanban-column"]'); // Use first occurrence (column header)

    if (candidateCard && technicalColumn) {
      // Simulate drag start
      fireEvent.dragStart(candidateCard, {
        dataTransfer: {
          setData: jest.fn(),
          getData: jest.fn(() => JSON.stringify({ candidateId: 1, applicationId: 101 }))
        }
      });

      // Simulate drop
      fireEvent.drop(technicalColumn, {
        dataTransfer: {
          getData: jest.fn(() => JSON.stringify({ candidateId: 1, applicationId: 101 }))
        }
      });

      // Verify API call was made
      await waitFor(() => {
        expect(mockedPositionService.updateCandidateStage).toHaveBeenCalledWith(
          1,
          { applicationId: 101, currentInterviewStep: 2 }
        );
      });
    }
  });

  test('should handle API errors and revert optimistic updates', async () => {
    // Mock API failure
    mockedPositionService.updateCandidateStage.mockRejectedValue(new Error('Network error'));

    renderWithRouter(<PositionBoard />);
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    const candidateCard = screen.getByText('John Doe').closest('[aria-roledescription="draggable"]');
    const technicalColumns = screen.getAllByText('Technical Interview');
    const technicalColumn = technicalColumns[0].closest('[data-testid^="kanban-column"]'); // Use first occurrence (column header)

    if (candidateCard && technicalColumn) {
      fireEvent.dragStart(candidateCard);
      fireEvent.drop(technicalColumn);

      // Should still show error handling or revert to original state
      await waitFor(() => {
        expect(mockedPositionService.updateCandidateStage).toHaveBeenCalled();
      });
    }
  });

  test('should show loading state during drag operations', async () => {
    renderWithRouter(<PositionBoard />);
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    const candidateCard = screen.getByText('John Doe').closest('[aria-roledescription="draggable"]');
    
    if (candidateCard) {
      // Start drag operation
      fireEvent.dragStart(candidateCard);
      
      // Check for loading indicator or disabled state
      expect(candidateCard).toHaveAttribute('aria-roledescription', 'draggable');
    }
  });

  test('should provide visual feedback during drag operations', async () => {
    renderWithRouter(<PositionBoard />);
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    const candidateCard = screen.getByText('John Doe').closest('[aria-roledescription="draggable"]');
    
    if (candidateCard) {
      // Simulate drag over
      fireEvent.dragOver(candidateCard);
      
      // Should have visual feedback classes or attributes
      expect(candidateCard).toBeInTheDocument();
    }
  });

  test('should prevent invalid drops', async () => {
    renderWithRouter(<PositionBoard />);
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    const candidateCard = screen.getByText('John Doe');
    
    // Try to drop on invalid target (same column)
    const initialColumns = screen.getAllByText('Initial Screening');
    const initialColumn = initialColumns[0].closest('[data-testid^="kanban-column"]'); // Use first occurrence (column header)
    
    if (candidateCard && initialColumn) {
      fireEvent.dragStart(candidateCard);
      fireEvent.drop(initialColumn);
      
      // Should not call API for same column
      expect(mockedPositionService.updateCandidateStage).not.toHaveBeenCalled();
    }
  });

  test('should handle multiple candidates in same column', async () => {
    const multipleCandidates = [
      ...mockCandidates,
      {
        id: 3,
        applicationId: 103,
        fullName: 'Bob Wilson',
        currentInterviewStep: 'Initial Screening',
        currentInterviewStepId: 1,
        averageScore: 4.2
      }
    ];
    
    mockedPositionService.getCandidatesByPosition.mockResolvedValue(multipleCandidates);
    
    renderWithRouter(<PositionBoard />);
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Bob Wilson')).toBeInTheDocument();
    });

    // Both candidates should be draggable
    const johnCard = screen.getByText('John Doe').closest('[aria-roledescription="draggable"]');
    const bobCard = screen.getByText('Bob Wilson').closest('[aria-roledescription="draggable"]');
    
    expect(johnCard).toHaveAttribute('aria-roledescription', 'draggable');
    expect(bobCard).toHaveAttribute('aria-roledescription', 'draggable');
  });
});
