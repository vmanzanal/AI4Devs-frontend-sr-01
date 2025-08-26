import React from 'react';
import { Card } from 'react-bootstrap';
import { useDraggable } from '@dnd-kit/core';
import { Candidate } from '../types/api';
import './CandidateCard.css';

interface CandidateCardProps {
  candidate: Candidate;
  onCardClick: (candidate: Candidate) => void;
  isDragging: boolean;
  isMobile?: boolean;
}

const CandidateCard: React.FC<CandidateCardProps> = ({
  candidate,
  onCardClick,
  isDragging,
  isMobile = false
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging: isBeingDragged,
  } = useDraggable({
    id: candidate.id,
  });

  const handleClick = () => {
    if (!isBeingDragged) {
      onCardClick(candidate);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if ((event.key === 'Enter' || event.key === ' ') && !isBeingDragged) {
      event.preventDefault();
      onCardClick(candidate);
    }
  };

  const formatScore = (score: number): string => {
    return score.toFixed(1);
  };

  const isLongName = candidate.fullName.length > 25;

  const cardClassName = [
    'candidate-card',
    isDragging || isBeingDragged ? 'candidate-card-dragging' : '',
    isMobile ? 'candidate-card-mobile' : '',
  ].filter(Boolean).join(' ');

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cardClassName}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      data-testid={`candidate-card-${candidate.id}`}
      data-candidate-id={candidate.id}
      data-application-id={candidate.applicationId}
      data-current-step-id={candidate.currentInterviewStepId}
      aria-label={`Candidate ${candidate.fullName}, Score ${formatScore(candidate.averageScore)} out of 5, Current stage: ${candidate.currentInterviewStep}`}
      {...attributes}
      {...listeners}
    >
      <Card.Body className="candidate-card-body">
        <Card.Title 
          className={`candidate-name ${isLongName ? 'candidate-name-ellipsis' : ''}`}
          data-testid="candidate-name"
        >
          {candidate.fullName}
        </Card.Title>
        
        <Card.Text className="candidate-score">
          Score: {formatScore(candidate.averageScore)}/5
        </Card.Text>
        
        <Card.Text className="candidate-stage">
          {candidate.currentInterviewStep}
        </Card.Text>
      </Card.Body>
    </Card>
  );
};

export default CandidateCard;
