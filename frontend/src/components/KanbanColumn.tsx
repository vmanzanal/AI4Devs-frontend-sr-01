import React from 'react';
import { Col, Badge } from 'react-bootstrap';
import { useDroppable } from '@dnd-kit/core';
import CandidateCard from './CandidateCard';
import { InterviewStep, Candidate } from '../types/api';
import './KanbanColumn.css';

interface KanbanColumnProps {
  interviewStep: InterviewStep;
  candidates: Candidate[];
  onCandidateMove: (candidateId: number, newStepId: number) => void;
  isDesktop?: boolean;
  isDragging?: boolean;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({
  interviewStep,
  candidates,
  onCandidateMove,
  isDesktop = true,
  isDragging = false
}) => {
  // Set up droppable area
  const { isOver, setNodeRef } = useDroppable({
    id: interviewStep.id,
  });

  // Filter candidates for this specific interview step
  const stageCandidates = candidates.filter(
    candidate => candidate.currentInterviewStepId === interviewStep.id
  );

  const handleCandidateClick = (candidate: Candidate) => {
    // For now, just log the candidate click
    console.log('Candidate clicked:', candidate.fullName);
  };

  const columnClassName = [
    'kanban-column',
    isDesktop ? 'kanban-column-desktop' : 'kanban-column-mobile',
    isOver ? 'kanban-column-over' : '',
    isDragging ? 'kanban-column-dragging' : ''
  ].filter(Boolean).join(' ');

  return (
    <Col 
      className={columnClassName}
      data-testid="kanban-column"
      role="region"
      aria-label={`${interviewStep.name} - ${stageCandidates.length} candidates`}
    >
      <div className="kanban-column-header">
        <h5 className="kanban-column-title">
          {interviewStep.name}
        </h5>
        <Badge 
          bg="secondary" 
          className="kanban-column-count"
        >
          {stageCandidates.length}
        </Badge>
      </div>

      <div 
        ref={setNodeRef}
        className="kanban-column-content"
        data-testid="kanban-column-drop-zone"
        data-interview-step-id={interviewStep.id}
      >
        {stageCandidates.length === 0 ? (
          <div className="kanban-column-empty">
            <p className="text-muted">No candidates in this stage</p>
          </div>
        ) : (
          stageCandidates.map(candidate => (
            <CandidateCard
              key={candidate.id}
              candidate={candidate}
              onCardClick={handleCandidateClick}
              isDragging={false}
              isMobile={!isDesktop}
            />
          ))
        )}
      </div>
    </Col>
  );
};

export default KanbanColumn;
