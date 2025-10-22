# Smart Consent Manager - Documentation

## Project Overview

The Smart Consent Manager is a comprehensive web application designed to help users understand and control their digital privacy. It provides tools for tracking cookies, managing consent preferences, detecting trackers, and assessing privacy risks across websites.

## Technology Stack

### Frontend
- **Vite** - Build tool and dev server
- **React 19** - UI framework
- **TypeScript** - Type-safe development
- **Tailwind CSS v4** - Utility-first styling
- **Shadcn UI** - Component library
- **Framer Motion** - Animation library
- **React Router v7** - Client-side routing
- **Lucide Icons** - Icon library

### Backend
- **Convex** - Backend-as-a-Service
- **Convex Auth** - Authentication system
- **Node.js Runtime** - For actions requiring external APIs

### Database
- **Convex DB** - Real-time reactive database

## Documentation Index

### 1. [Activity Diagram](./activity-diagram.md)
Visualizes the workflow and processes within the application:
- User Website Scanning Flow
- Consent Management Flow
- Admin Analytics Flow

### 2. [Use Case Diagram](./use-case-diagram.md)
Defines system actors and their interactions:
- User use cases (scanning, consent management, viewing reports)
- Admin use cases (analytics, system monitoring)
- System automated processes

### 3. [Architecture Diagram](./architecture-diagram.md)
Details the system architecture:
- System Architecture Overview
- Technology Stack
- Data Flow Architecture
- Component Architecture

### 4. [Sequence Diagram](./sequence-diagram.md)
Illustrates the interaction flows:
- User Authentication Flow
- Website Scanning Flow
- Consent Management Flow
- Privacy Report Generation
- Dashboard Stats Loading
- Admin Analytics Flow

## Key Features

### 1. Website Scanning
- Detects cookies (essential, analytics, marketing, third-party)
- Identifies third-party trackers
- Performs risk assessment
- Calculates privacy scores

### 2. Consent Management
- Grant/deny consent by category
- Revoke existing consents
- Set expiry dates and auto-renewal
- Track consent history

### 3. Privacy Reporting
- Comprehensive privacy reports
- Cookie and tracker statistics
- Risk level visualization
- Consent status overview

### 4. Gamification
- Points system for privacy-conscious behavior
- Achievements and milestones
- Privacy score tracking

### 5. Analytics Dashboard
- Real-time statistics
- Trend analysis
- Category breakdowns
- Acceptance rate tracking

## Database Schema

### Tables
- **users** - User accounts and profiles
- **websites** - Scanned websites
- **cookies** - Detected cookies
- **trackers** - Third-party trackers
- **consents** - User consent preferences
- **riskAssessments** - Website risk evaluations

## Authentication

The application supports two authentication methods:
1. **Email OTP** - One-time password sent via email
2. **Anonymous** - Guest access without registration

## API Structure

### Queries (Read Operations)
- User data retrieval
- Website listings
- Cookie and tracker queries
- Consent history
- Analytics data

### Mutations (Write Operations)
- User updates
- Consent management
- Website visit tracking
- Data modifications

### Actions (External Operations)
- Website scanning
- Email sending
- Risk assessment calculations
- Privacy score updates

## Deployment

The application is designed to run on:
- **Frontend**: Vite dev server / Static hosting
- **Backend**: Convex cloud infrastructure
- **Database**: Convex managed database

## Development Setup

1. Install dependencies: `pnpm install`
2. Start Convex dev: `npx convex dev`
3. Start frontend: `pnpm dev`
4. Access at: `http://localhost:5173`

## Security Considerations

- All user data is scoped to authenticated users
- Consent preferences are private and user-specific
- Risk assessments are performed server-side
- Authentication tokens are securely managed
- HTTPS enforced for all communications

## Future Enhancements

- Browser extension for real-time tracking
- Export/import functionality
- Advanced AI-powered risk detection
- Multi-language support
- Mobile applications
- Integration with privacy regulations (GDPR, CCPA)