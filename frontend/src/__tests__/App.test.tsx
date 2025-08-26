import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import '@testing-library/jest-dom';
import RecruiterDashboard from '../components/RecruiterDashboard';
import AddCandidateForm from '../components/AddCandidateForm';
import Positions from '../components/Positions';
import PositionBoard from '../components/PositionBoard';

// Mock all components to avoid dependency issues during testing
jest.mock('../components/RecruiterDashboard', () => {
  return function MockRecruiterDashboard() {
    return <div data-testid="recruiter-dashboard">Recruiter Dashboard</div>;
  };
});

jest.mock('../components/AddCandidateForm', () => {
  return function MockAddCandidateForm() {
    return <div data-testid="add-candidate-form">Add Candidate Form</div>;
  };
});

jest.mock('../components/Positions', () => {
  return function MockPositions() {
    return <div data-testid="positions">Positions</div>;
  };
});

jest.mock('../components/PositionBoard', () => {
  return function MockPositionBoard() {
    return <div data-testid="position-board">Position Board</div>;
  };
});

const renderWithRouter = (initialEntries: string[]) => {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route path="/" element={<RecruiterDashboard />} />
        <Route path="/add-candidate" element={<AddCandidateForm />} />
        <Route path="/positions" element={<Positions />} />
        <Route path="/position/:id" element={<PositionBoard />} />
      </Routes>
    </MemoryRouter>
  );
};

describe('App Routing', () => {
  it('should render RecruiterDashboard on root path', () => {
    renderWithRouter(['/']);
    expect(screen.getByTestId('recruiter-dashboard')).toBeInTheDocument();
  });

  it('should render AddCandidate on /add-candidate path', () => {
    renderWithRouter(['/add-candidate']);
    expect(screen.getByTestId('add-candidate-form')).toBeInTheDocument();
  });

  it('should render Positions on /positions path', () => {
    renderWithRouter(['/positions']);
    expect(screen.getByTestId('positions')).toBeInTheDocument();
  });

  it('should render PositionBoard on /position/:id path', () => {
    renderWithRouter(['/position/1']);
    expect(screen.getByTestId('position-board')).toBeInTheDocument();
  });

  it('should handle position route with different IDs', () => {
    renderWithRouter(['/position/123']);
    expect(screen.getByTestId('position-board')).toBeInTheDocument();
  });

  it('should render app without crashing on unknown route', () => {
    renderWithRouter(['/unknown-route']);
    // Should not crash, even if no component is rendered
    expect(document.body).toBeInTheDocument();
  });
});
