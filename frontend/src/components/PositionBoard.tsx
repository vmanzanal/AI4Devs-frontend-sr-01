import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Spinner, Alert, Button, Card, Badge } from 'react-bootstrap';
import { ArrowLeft } from 'react-bootstrap-icons';
import { 
  DndContext, 
  DragEndEvent, 
  DragStartEvent, 
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { getInterviewFlow, getCandidatesByPosition, updateCandidateStageOptimistic } from '../services/positionService';
import { PositionData, Candidate } from '../types/api';
import KanbanColumn from './KanbanColumn';
import CandidateCard from './CandidateCard';
import './PositionBoard.css';

const PositionBoard: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [positionData, setPositionData] = useState<PositionData | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);
  const [activeCandidate, setActiveCandidate] = useState<Candidate | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [announceMessage, setAnnounceMessage] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      if (!id) {
        setError('Position ID is required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch position and interview flow data
        const positionResponse = await getInterviewFlow(parseInt(id));
        setPositionData(positionResponse as PositionData);

        // Fetch candidates for this position
        const candidatesResponse = await getCandidatesByPosition(parseInt(id));
        setCandidates(candidatesResponse as Candidate[]);

      } catch (err) {
        console.error('Error fetching position data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load position data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Handle responsive design
  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px of movement before starting drag
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleBackClick = () => {
    navigate('/positions');
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const candidateId = Number(active.id);
    const candidate = candidates.find(c => c.id === candidateId);
    
    setActiveCandidate(candidate || null);
    setIsDragging(true);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    setActiveCandidate(null);
    setIsDragging(false);
    
    if (!over) {
      return; // Dropped outside a valid drop zone
    }

    const candidateId = Number(active.id);
    const newStepId = Number(over.id);
    const candidate = candidates.find(c => c.id === candidateId);
    
    if (!candidate || candidate.currentInterviewStepId === newStepId) {
      return; // Same column or candidate not found
    }

    // Optimistic update with error handling
    await updateCandidateStageOptimistic(
      candidateId,
      { applicationId: candidate.applicationId, currentInterviewStep: newStepId },
      (_updatedCandidate: any) => {
        // Optimistic update
        setCandidates(prev => prev.map(c => 
          c.id === candidateId 
            ? { ...c, currentInterviewStepId: newStepId, currentInterviewStep: getStepNameById(newStepId) }
            : c
        ));
        // Announce the move to screen readers
        setAnnounceMessage(`${candidate.fullName} moved to ${getStepNameById(newStepId)}`);
      },
      (result: any) => {
        // Success callback - update already applied optimistically
        console.log('Candidate stage updated successfully:', result);
        setAnnounceMessage(`${candidate.fullName} successfully moved to ${getStepNameById(newStepId)}`);
      },
      (error: any) => {
        // Error callback - revert optimistic update
        console.error('Failed to update candidate stage:', error);
        setCandidates(prev => prev.map(c => 
          c.id === candidateId 
            ? { ...c, currentInterviewStepId: candidate.currentInterviewStepId, currentInterviewStep: candidate.currentInterviewStep }
            : c
        ));
        setAnnounceMessage(`Failed to move ${candidate.fullName}. Please try again.`);
      }
    );
  };

  const getStepNameById = (stepId: number): string => {
    const step = positionData?.interviewFlow.interviewSteps.find(s => s.id === stepId);
    return step?.name || 'Unknown Stage';
  };

  const handleCandidateClick = (candidate: Candidate) => {
    // For now, just log the candidate click - could open a modal or navigate to detail view
    console.log('Candidate clicked:', candidate);
  };

  const handleCandidateMove = async (candidateId: number, newStepId: number) => {
    // This method is kept for backward compatibility with KanbanColumn
    // The actual drag and drop logic is handled by handleDragEnd
    console.log(`Moving candidate ${candidateId} to step ${newStepId}`);
  };

  if (loading) {
    return (
      <Container 
        className="mt-5 text-center" 
        data-testid="position-board-container"
        role="main"
        aria-label="Position board for candidate management"
      >
        <Spinner 
          animation="border" 
          role="status" 
          data-testid="loading-spinner"
          aria-label="Loading position data"
        >
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-3">Loading position data...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container 
        className="mt-5" 
        data-testid="position-board-container"
        role="main"
        aria-label="Position board for candidate management"
      >
        <Alert variant="danger" data-testid="error-alert">
          <Alert.Heading>Error Loading Position</Alert.Heading>
          <p>{error}</p>
          <Button variant="outline-danger" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </Alert>
      </Container>
    );
  }

  if (!positionData) {
    return (
      <Container 
        className="mt-5" 
        data-testid="position-board-container"
        role="main"
        aria-label="Position board for candidate management"
      >
        <Alert variant="warning">
          <Alert.Heading>Position Not Found</Alert.Heading>
          <p>The requested position could not be found.</p>
          <Button variant="primary" onClick={handleBackClick}>
            Back to Positions
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container 
      fluid 
      className="position-board-container" 
      data-testid="position-board-container"
      role="main"
      aria-label="Position board for candidate management"
    >
      {/* Header with back navigation and position title */}
      <div className="position-board-header">
        <Button 
          variant="link" 
          onClick={handleBackClick}
          className="position-board-back-button"
          data-testid="back-button"
        >
          <ArrowLeft size={20} className="me-2" />
          Back to Positions
        </Button>
        <h1 className="position-board-title" data-testid="position-title">
          {positionData.positionName}
        </h1>
      </div>

      {/* Main Kanban Card Container */}
      <Card className="kanban-main-card shadow">
        <Card.Header className="kanban-card-header">
          <div className="d-flex justify-content-between align-items-center">
            <div className="kanban-header-info">
              <h5 className="mb-1 text-primary">
                <i className="bi bi-kanban me-2"></i>
                Interview Process
              </h5>
              <small className="text-muted">
                Total candidates: {candidates.length} • 
                Stages: {positionData.interviewFlow.interviewSteps.length}
              </small>
            </div>
            <div className="kanban-header-actions">
              <Badge bg="info" className="me-2">
                {isDesktop ? 'Desktop View' : 'Mobile View'}
              </Badge>
            </div>
          </div>
        </Card.Header>
        <Card.Body className="kanban-card-body p-0">
          {/* Kanban Board with Drag and Drop */}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className={`kanban-board ${isDesktop ? 'kanban-board-desktop' : 'kanban-board-mobile'}`}>
              <div className="kanban-columns-container">
                {positionData.interviewFlow.interviewSteps
                  .sort((a, b) => a.orderIndex - b.orderIndex)
                  .map(step => (
                    <KanbanColumn
                      key={step.id}
                      interviewStep={step}
                      candidates={candidates.filter(c => c.currentInterviewStepId === step.id)}
                      onCandidateMove={handleCandidateMove}
                      isDesktop={isDesktop}
                      isDragging={isDragging}
                    />
                  ))}
              </div>
            </div>
            
            {/* Drag Overlay */}
            <DragOverlay>
              {activeCandidate ? (
                <CandidateCard
                  candidate={activeCandidate}
                  onCardClick={() => {}}
                  isDragging={true}
                />
              ) : null}
            </DragOverlay>
          </DndContext>
        </Card.Body>
      </Card>
      
      {/* ARIA Live Region for screen reader announcements */}
      <div
        role="status"
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
        data-testid="live-region"
      >
        {announceMessage}
      </div>
    </Container>
  );
};

export default PositionBoard;
