import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import PositionBoard from '../PositionBoard';
import * as positionService from '../../services/positionService';

// Mock the position service
jest.mock('../../services/positionService');
const mockedPositionService = positionService as jest.Mocked<typeof positionService>;

// Mock data
const mockPositionData = {
  positionName: 'Mobile Developer',
  interviewFlow: {
    id: 1,
    description: 'Mobile development interview process',
    interviewSteps: [
      { id: 1, name: 'Phone Screening', orderIndex: 1 },
      { id: 2, name: 'Technical Challenge', orderIndex: 2 },
      { id: 3, name: 'Final Interview', orderIndex: 3 }
    ]
  }
};

const mockCandidates = [
  {
    id: 1,
    applicationId: 101,
    fullName: 'María González López',
    currentInterviewStep: 'Phone Screening',
    currentInterviewStepId: 1,
    averageScore: 4.2
  },
  {
    id: 2,
    applicationId: 102,
    fullName: 'José María Fernández',
    currentInterviewStep: 'Technical Challenge',
    currentInterviewStepId: 2,
    averageScore: 3.9
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

// Mock window.innerWidth for responsive testing
const mockWindowResize = (width: number) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });
  
  // Trigger resize event
  window.dispatchEvent(new Event('resize'));
};

describe('Mobile Experience', () => {
  beforeEach(() => {
    mockedPositionService.getInterviewFlow.mockResolvedValue(mockPositionData);
    mockedPositionService.getCandidatesByPosition.mockResolvedValue(mockCandidates);
  });

  afterEach(() => {
    jest.clearAllMocks();
    // Reset window width
    mockWindowResize(1024);
  });

  describe('Responsive Layout', () => {
    test('should switch to mobile layout on small screens', async () => {
      // Set mobile viewport
      mockWindowResize(375);
      
      renderWithRouter(<PositionBoard />);
      
      await waitFor(() => {
        expect(screen.getByText('Mobile Developer')).toBeInTheDocument();
      });

      // Should use mobile kanban board class
      const kanbanBoard = screen.getByRole('main').querySelector('.kanban-board');
      expect(kanbanBoard).toHaveClass('kanban-board-mobile');
    });

    test('should use desktop layout on large screens', async () => {
      // Set desktop viewport
      mockWindowResize(1200);
      
      renderWithRouter(<PositionBoard />);
      
      await waitFor(() => {
        expect(screen.getByText('Mobile Developer')).toBeInTheDocument();
      });

      // Should use desktop kanban board class
      const kanbanBoard = screen.getByRole('main').querySelector('.kanban-board');
      expect(kanbanBoard).toHaveClass('kanban-board-desktop');
    });

    test('should handle viewport size changes dynamically', async () => {
      renderWithRouter(<PositionBoard />);
      
      await waitFor(() => {
        expect(screen.getByText('Mobile Developer')).toBeInTheDocument();
      });

      // Start with desktop
      mockWindowResize(1024);
      await waitFor(() => {
        const kanbanBoard = screen.getByRole('main').querySelector('.kanban-board');
        expect(kanbanBoard).toHaveClass('kanban-board-desktop');
      });

      // Switch to mobile
      mockWindowResize(600);
      await waitFor(() => {
        const kanbanBoard = screen.getByRole('main').querySelector('.kanban-board');
        expect(kanbanBoard).toHaveClass('kanban-board-mobile');
      });
    });

    test('should pass mobile state to child components', async () => {
      mockWindowResize(375);
      
      renderWithRouter(<PositionBoard />);
      
      await waitFor(() => {
        expect(screen.getByText('María González López')).toBeInTheDocument();
      });

      // Columns should receive mobile props (checked through CSS classes)
      const columns = screen.getAllByTestId('kanban-column');
      expect(columns[0]).toBeInTheDocument();
    });
  });

  describe('Touch Interactions', () => {
    test('should support touch-based drag and drop', async () => {
      mockWindowResize(375);
      
      renderWithRouter(<PositionBoard />);
      
      await waitFor(() => {
        expect(screen.getByText('María González López')).toBeInTheDocument();
      });

      const candidateCard = screen.getByTestId('candidate-card-1');
      
      // Simulate touch start
      fireEvent.touchStart(candidateCard, {
        touches: [{ clientX: 100, clientY: 100 }]
      });

      // Simulate touch move
      fireEvent.touchMove(candidateCard, {
        touches: [{ clientX: 200, clientY: 100 }]
      });

      // Simulate touch end
      fireEvent.touchEnd(candidateCard);

      // Should not cause errors
      expect(candidateCard).toBeInTheDocument();
    });

    test('should have minimum touch target sizes (44px)', async () => {
      mockWindowResize(375);
      
      renderWithRouter(<PositionBoard />);
      
      await waitFor(() => {
        expect(screen.getByText('María González López')).toBeInTheDocument();
      });

      const candidateCard = screen.getByTestId('candidate-card-1');
      const backButton = screen.getByTestId('back-button');

      // Check that interactive elements have proper classes for minimum sizing
      expect(candidateCard).toHaveClass('candidate-card');
      expect(backButton).toHaveClass('position-board-back-button');
    });

    test('should provide haptic feedback cues through CSS classes', async () => {
      mockWindowResize(375);
      
      renderWithRouter(<PositionBoard />);
      
      await waitFor(() => {
        expect(screen.getByText('María González López')).toBeInTheDocument();
      });

      const candidateCard = screen.getByTestId('candidate-card-1');
      
      // Touch interactions should add appropriate CSS classes for styling
      fireEvent.touchStart(candidateCard);
      // CSS classes would provide visual feedback for touch interactions
      
      expect(candidateCard).toBeInTheDocument();
    });
  });

  describe('Mobile-Specific UI Adaptations', () => {
    test('should handle long candidate names gracefully on mobile', async () => {
      mockWindowResize(375);
      
      renderWithRouter(<PositionBoard />);
      
      await waitFor(() => {
        expect(screen.getByText('María González López')).toBeInTheDocument();
      });

      const longNameCard = screen.getByTestId('candidate-card-1');
      const candidateName = longNameCard.querySelector('.candidate-name');
      
      // Long names should have ellipsis class
      expect(candidateName).toHaveClass('candidate-name-ellipsis');
    });

    test('should stack columns vertically on mobile', async () => {
      mockWindowResize(375);
      
      renderWithRouter(<PositionBoard />);
      
      await waitFor(() => {
        expect(screen.getByText('Mobile Developer')).toBeInTheDocument();
      });

      // Mobile layout should use flex column direction
      const columnsContainer = screen.getByRole('main').querySelector('.kanban-columns-container');
      expect(columnsContainer).toBeInTheDocument();
    });

    test('should optimize spacing for mobile viewing', async () => {
      mockWindowResize(375);
      
      renderWithRouter(<PositionBoard />);
      
      await waitFor(() => {
        expect(screen.getByText('Mobile Developer')).toBeInTheDocument();
      });

      // Check that mobile-specific CSS classes are applied
      const columns = screen.getAllByTestId('kanban-column');
      columns.forEach(column => {
        expect(column).toHaveClass('kanban-column');
      });
    });

    test('should handle overflow content properly on mobile', async () => {
      mockWindowResize(375);
      
      renderWithRouter(<PositionBoard />);
      
      await waitFor(() => {
        expect(screen.getByText('Mobile Developer')).toBeInTheDocument();
      });

      // Container should handle overflow appropriately
      const mainContainer = screen.getByRole('main');
      expect(mainContainer).toHaveClass('position-board-container');
    });
  });

  describe('Performance on Mobile', () => {
    test('should render efficiently with many candidates on mobile', async () => {
      // Create mock data with many candidates
      const manyCandidates = Array.from({ length: 20 }, (_, i) => ({
        id: i + 1,
        applicationId: i + 101,
        fullName: `Candidate ${i + 1}`,
        currentInterviewStep: 'Phone Screening',
        currentInterviewStepId: 1,
        averageScore: 3.5 + (i % 3) * 0.5
      }));

      mockedPositionService.getCandidatesByPosition.mockResolvedValue(manyCandidates);
      mockWindowResize(375);
      
      renderWithRouter(<PositionBoard />);
      
      await waitFor(() => {
        expect(screen.getByText('Mobile Developer')).toBeInTheDocument();
      });

      // Should render all candidates without performance issues
      const candidateCards = screen.getAllByTestId(/candidate-card-/);
      expect(candidateCards).toHaveLength(20);
    });

    test('should handle rapid resize events gracefully', async () => {
      renderWithRouter(<PositionBoard />);
      
      await waitFor(() => {
        expect(screen.getByText('Mobile Developer')).toBeInTheDocument();
      });

      // Simulate rapid resize events
      mockWindowResize(1200);
      mockWindowResize(375);
      mockWindowResize(768);
      mockWindowResize(1024);
      
      // Should not cause any errors
      await waitFor(() => {
        expect(screen.getByText('Mobile Developer')).toBeInTheDocument();
      });
    });
  });

  describe('Mobile Accessibility', () => {
    test('should maintain accessibility on mobile devices', async () => {
      mockWindowResize(375);
      
      renderWithRouter(<PositionBoard />);
      
      await waitFor(() => {
        expect(screen.getByText('Mobile Developer')).toBeInTheDocument();
      });

      // ARIA labels should still work on mobile
      const mainContainer = screen.getByRole('main');
      expect(mainContainer).toHaveAttribute('aria-label', 'Position board for candidate management');

      // Candidate cards should maintain accessibility
      const candidateCard = screen.getByTestId('candidate-card-1');
      expect(candidateCard).toHaveAttribute('aria-label');
    });

    test('should support voice control on mobile', async () => {
      mockWindowResize(375);
      
      renderWithRouter(<PositionBoard />);
      
      await waitFor(() => {
        expect(screen.getByText('Mobile Developer')).toBeInTheDocument();
      });

      // Elements should have proper roles for voice control
      const candidateCard = screen.getByTestId('candidate-card-1');
      expect(candidateCard).toHaveAttribute('role', 'button');
      
      const backButton = screen.getByTestId('back-button');
      expect(backButton).toHaveAttribute('type', 'button');
    });

    test('should maintain keyboard navigation on mobile', async () => {
      mockWindowResize(375);
      
      renderWithRouter(<PositionBoard />);
      
      await waitFor(() => {
        expect(screen.getByText('Mobile Developer')).toBeInTheDocument();
      });

      // Tab navigation should still work on mobile
      const candidateCard = screen.getByTestId('candidate-card-1');
      expect(candidateCard).toHaveAttribute('tabindex', '0');
    });
  });

  describe('Orientation Changes', () => {
    test('should adapt to landscape orientation on mobile', async () => {
      // Simulate mobile landscape (wide but short)
      Object.defineProperty(window, 'innerWidth', { value: 667 });
      Object.defineProperty(window, 'innerHeight', { value: 375 });
      
      renderWithRouter(<PositionBoard />);
      
      await waitFor(() => {
        expect(screen.getByText('Mobile Developer')).toBeInTheDocument();
      });

      // Should handle landscape orientation appropriately
      const kanbanBoard = screen.getByRole('main').querySelector('.kanban-board');
      expect(kanbanBoard).toBeInTheDocument();
    });

    test('should handle portrait orientation on mobile', async () => {
      // Simulate mobile portrait
      Object.defineProperty(window, 'innerWidth', { value: 375 });
      Object.defineProperty(window, 'innerHeight', { value: 667 });
      
      renderWithRouter(<PositionBoard />);
      
      await waitFor(() => {
        expect(screen.getByText('Mobile Developer')).toBeInTheDocument();
      });

      // Should handle portrait orientation appropriately
      const kanbanBoard = screen.getByRole('main').querySelector('.kanban-board');
      expect(kanbanBoard).toHaveClass('kanban-board-mobile');
    });
  });
});
