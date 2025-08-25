# API Specification

This is the API specification for the spec detailed in @.agent-os/specs/2025-08-25-position-board-kanban/spec.md

## Endpoints

### GET /positions/:id/interviewFlow

**Purpose:** Retrieve interview flow configuration and position information for board setup
**Parameters:** 
- `id` (path parameter): Position ID (integer)

**Response:**
```json
{
  "positionName": "Senior backend engineer",
  "interviewFlow": {
    "id": 1,
    "description": "Standard development interview process",
    "interviewSteps": [
      {
        "id": 1,
        "interviewFlowId": 1,
        "interviewTypeId": 1,
        "name": "Initial Screening",
        "orderIndex": 1
      },
      {
        "id": 2,
        "interviewFlowId": 1,
        "interviewTypeId": 2,
        "name": "Technical Interview",
        "orderIndex": 2
      },
      {
        "id": 3,
        "interviewFlowId": 1,
        "interviewTypeId": 3,
        "name": "Manager Interview",
        "orderIndex": 3
      }
    ]
  }
}
```

**Errors:**
- `404`: Position not found
- `500`: Internal server error

### GET /positions/:id/candidates

**Purpose:** Retrieve all candidates currently in the interview process for the specified position
**Parameters:**
- `id` (path parameter): Position ID (integer)

**Response:**
```json
[
  {
    "id": 123,
    "applicationId": 456,
    "fullName": "Jane Smith",
    "currentInterviewStep": "Technical Interview",
    "currentInterviewStepId": 2,
    "averageScore": 4.2
  },
  {
    "id": 124,
    "applicationId": 457,
    "fullName": "Carlos García",
    "currentInterviewStep": "Initial Screening",
    "currentInterviewStepId": 1,
    "averageScore": 0
  }
]
```

**Errors:**
- `404`: Position not found
- `500`: Internal server error

### PUT /candidates/:id/stage

**Purpose:** Update a candidate's current interview stage when moved between Kanban columns
**Parameters:**
- `id` (path parameter): Candidate ID (integer)

**Request Body:**
```json
{
  "applicationId": 456,
  "currentInterviewStep": 3
}
```

**Response:**
```json
{
  "message": "Candidate stage updated successfully",
  "data": {
    "id": 456,
    "positionId": 1,
    "candidateId": 123,
    "applicationDate": "2025-08-20T10:00:00Z",
    "currentInterviewStep": 3,
    "notes": null
  }
}
```

**Errors:**
- `400`: Invalid request data or interview step ID
- `404`: Candidate or application not found
- `500`: Internal server error

## Integration Requirements

### Frontend State Synchronization
- Optimistic updates: UI updates immediately on drag completion
- Error handling: Revert UI changes if API call fails
- Success confirmation: Visual feedback for successful updates
- Loading states: Show progress during API operations

### Error Handling Strategy
- Network timeouts: 30-second timeout with retry option
- Validation errors: Display specific field-level error messages
- Server errors: Generic error message with option to retry
- Offline handling: Queue updates for when connection is restored

### Performance Considerations
- Debounce rapid drag operations to prevent API flooding
- Cache interview flow data (changes infrequently)
- Batch multiple candidate moves if needed in future
- Implement request cancellation for ongoing operations

### Security Integration
- Include authentication headers in all requests
- Validate user permissions for position access
- CSRF protection for state-changing operations
- Rate limiting compliance for API endpoints
