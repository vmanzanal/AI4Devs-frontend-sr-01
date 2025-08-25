# LTI Technology Stack

## Architecture Overview

**Full-Stack TypeScript Application** with clean architecture principles and Domain-Driven Design (DDD) patterns.

## Frontend Stack

- **Framework:** React 18.3.1 with TypeScript 4.9.5
- **UI Library:** React Bootstrap 2.10.2 + Bootstrap 5.3.3
- **Routing:** React Router DOM 6.23.1
- **State Management:** React useState (local state management)
- **Date Handling:** React DatePicker 6.9.0
- **Icons:** React Bootstrap Icons 1.11.4
- **Build Tool:** Create React App with React Scripts 5.0.1
- **Testing:** Jest with React Testing Library

## Backend Stack

- **Runtime:** Node.js with TypeScript 4.9.5
- **Framework:** Express.js 4.19.2
- **ORM:** Prisma 5.13.0 with Prisma Client
- **Database:** PostgreSQL (via Docker)
- **File Upload:** Multer 1.4.5-lts.1 for resume handling
- **CORS:** CORS 2.8.5 for cross-origin requests
- **API Documentation:** Swagger JSDoc 6.2.8 + Swagger UI Express 5.0.0
- **Development:** ts-node-dev 1.1.6 for hot reloading

## Database & Infrastructure

- **Database:** PostgreSQL 
- **ORM:** Prisma with comprehensive schema for recruitment domain
- **Containerization:** Docker Compose for local development
- **Environment:** dotenv 16.4.5 for configuration management

## Development Tools

- **Code Quality:** ESLint 9.2.0 + Prettier 3.2.5
- **Testing:** Jest 29.7.0 + ts-jest 29.1.2
- **TypeScript:** Comprehensive typing throughout the application
- **Development Server:** ts-node for backend, React Scripts for frontend

## Architecture Patterns

- **Domain-Driven Design (DDD):** Clear separation of domain, application, and infrastructure layers
- **Clean Architecture:** Dependency inversion and separation of concerns
- **Repository Pattern:** Data access abstraction layer
- **Service Layer Pattern:** Business logic encapsulation
- **RESTful API Design:** Standard HTTP methods and status codes

## Key Dependencies

### Frontend
```json
{
  "react": "^18.3.1",
  "react-bootstrap": "^2.10.2",
  "react-router-dom": "^6.23.1",
  "bootstrap": "^5.3.3",
  "typescript": "^4.9.5"
}
```

### Backend
```json
{
  "@prisma/client": "^5.13.0",
  "express": "^4.19.2",
  "multer": "^1.4.5-lts.1",
  "swagger-jsdoc": "^6.2.8",
  "cors": "^2.8.5"
}
```

## File Structure

```
LTI/
├── frontend/          # React TypeScript application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── services/      # API service layer
│   │   └── assets/        # Static assets
├── backend/           # Express TypeScript API
│   ├── src/
│   │   ├── domain/        # Domain models
│   │   ├── application/   # Business logic services
│   │   ├── presentation/  # Controllers
│   │   └── routes/        # API routes
│   └── prisma/        # Database schema and migrations
└── docker-compose.yml # PostgreSQL container
```
