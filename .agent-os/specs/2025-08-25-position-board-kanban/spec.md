# Spec Requirements Document

> Spec: Position Board Kanban Interface
> Created: 2025-08-25

## Overview

Implement a Kanban-style candidate management interface that allows recruiters to visualize and manage candidates through different interview stages using drag-and-drop functionality. This feature will streamline the interview process by providing an intuitive visual representation of candidate progress and enabling quick status updates through natural drag-and-drop interactions.

## User Stories

### Recruiter Candidate Management

As a recruiter, I want to view all candidates for a specific position in a Kanban board layout, so that I can quickly understand the current status of all candidates and identify bottlenecks in the interview process.

**Detailed Workflow:**
1. Recruiter navigates from the positions list page
2. Clicks "Ver proceso" on any position
3. System displays a Kanban board with columns representing interview stages
4. Each candidate appears as a card in their current interview stage column
5. Candidate cards display full name and average interview score
6. Recruiter can drag cards between columns to update candidate status
7. System automatically updates the candidate's interview stage in the database
8. Recruiter can return to positions list using the back arrow

### Mobile-Responsive Candidate Tracking

As a recruiter using a mobile device, I want to access the position board with a mobile-optimized layout, so that I can manage candidates effectively while away from my desk.

**Detailed Workflow:**
1. Recruiter accesses position board on mobile device
2. Interview stage columns stack vertically for optimal mobile viewing
3. Candidate cards span full width for better readability
4. Touch-based drag-and-drop functionality works smoothly
5. All information remains accessible and actionable on smaller screens

### Visual Interview Process Management

As a hiring manager, I want to see the interview flow structure and candidate distribution across stages, so that I can identify process bottlenecks and make informed decisions about resource allocation.

**Detailed Workflow:**
1. Manager views position board showing all interview stages
2. Each column represents a different interview step (Phone, Technical, Cultural, Manager)
3. Number of candidates in each stage is visually apparent
4. Average scores help identify high-performing candidates
5. Empty stages indicate potential process improvements needed

## Spec Scope

1. **Kanban Board Interface** - Visual board with columns representing interview stages and candidate cards
2. **Drag-and-Drop Functionality** - Intuitive candidate movement between interview stages with real-time updates
3. **Candidate Card Display** - Cards showing candidate name and average interview score with professional styling
4. **Responsive Mobile Design** - Mobile-optimized layout with vertical column stacking and touch support
5. **Navigation Integration** - Seamless integration with existing positions page and back navigation

## Out of Scope

- Backend API development (existing endpoints will be used)
- Authentication and authorization systems (prototype stage)
- Candidate profile editing or detailed views
- Interview scheduling functionality
- Bulk candidate operations
- Advanced filtering or search within the board
- Real-time collaborative updates between multiple users
- Candidate communication features
- Interview scoring modifications

## Expected Deliverable

1. **Functional Position Board Page** - A new React component accessible from positions list that displays candidates in a Kanban layout with working drag-and-drop between interview stages
2. **Mobile-Responsive Interface** - The board adapts to mobile viewports with vertical column layout and maintains full functionality on touch devices
3. **Integrated Navigation** - Seamless navigation from positions page with back button functionality and consistent UI styling with the existing LTI application
