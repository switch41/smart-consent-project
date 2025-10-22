# Smart Consent Manager - Technical Documentation

## Overview

The Smart Consent Manager is a comprehensive privacy management application that helps users understand and control their digital footprint across the web. This documentation provides detailed diagrams and technical specifications for the system.

## Documentation Contents

1. **[Activity Diagram](./activity-diagram.md)** - Visualizes user workflows and system processes
   - User website scanning flow
   - Admin analytics flow
   - Consent management flow

2. **[Use Case Diagram](./use-case-diagram.md)** - Defines system actors and their interactions
   - User use cases (scan, consent, report)
   - Admin use cases (analytics, monitoring)
   - System use cases (risk assessment, tracking)

3. **[Architecture Diagram](./architecture-diagram.md)** - Shows system structure and components
   - Frontend layer (React, Vite, Tailwind)
   - Backend layer (Convex functions)
   - Database layer (Convex DB)
   - Authentication layer (Convex Auth)
   - Technology stack overview

4. **[Sequence Diagram](./sequence-diagram.md)** - Illustrates component interactions over time
   - User authentication flow
   - Website scanning flow
   - Consent management flow
   - Privacy report generation
   - Admin analytics flow
   - Real-time data subscription

## Technology Stack

### Frontend
- **React 19** - UI framework
- **Vite** - Build tool and dev server
- **TypeScript** - Type-safe JavaScript
- **Tailwind v4** - Utility-first CSS
- **Shadcn UI** - Component library
- **React Router v7** - Client-side routing
- **Framer Motion** - Animation library
- **Lucide Icons** - Icon library

### Backend
- **Convex** - Backend-as-a-Service
- **Convex Database** - Real-time database
- **Convex Auth** - Authentication system
- **Node.js Runtime** - For external API calls

### Development Tools
- **PNPM** - Package manager
- **TypeScript Compiler** - Type checking
- **ESLint** - Code linting

## Key Features

1. **Website Scanning** - Detect cookies and trackers on any website
2. **Consent Management** - Grant, deny, or revoke consent for different cookie categories
3. **Privacy Score** - Real-time privacy score based on browsing habits
4. **Risk Assessment** - AI-powered risk analysis for websites
5. **Gamification** - Earn points for privacy-conscious actions
6. **Privacy Reports** - Comprehensive privacy reports with statistics
7. **Admin Analytics** - System-wide consent statistics and trends
8. **Real-time Updates** - Live data synchronization across all components

## Database Schema

### Tables
- **users** - User accounts and profiles
- **websites** - Scanned websites
- **cookies** - Detected cookies with categorization
- **trackers** - Third-party trackers
- **consents** - User consent preferences
- **riskAssessments** - Website risk evaluations

## API Structure

### Queries (Read Operations)
- Real-time data subscriptions
- Automatic re-execution on data changes
- Type-safe with TypeScript

### Mutations (Write Operations)
- Transactional database updates
- Optimistic UI updates
- Automatic rollback on errors

### Actions (External Operations)
- Node.js runtime for external APIs
- Website scanning and analysis
- Email sending for OTP

## Authentication Flow

1. User enters email address
2. System sends OTP code via email
3. User enters OTP code
4. System verifies and creates session
5. User redirected to dashboard

Alternative: Guest login (anonymous authentication)

## Deployment

The application is deployed with:
- Frontend: Vite production build
- Backend: Convex cloud deployment
- Database: Convex managed database
- Authentication: Convex Auth service

## Security Features

- Email OTP authentication
- Session management
- Role-based access control (User/Admin)
- Secure API endpoints
- Data encryption at rest

## Future Enhancements

- Browser extension for automatic scanning
- Export/import privacy data
- Advanced AI risk assessment
- Multi-language support
- Mobile application

## Viewing Diagrams

All diagrams are written in Mermaid syntax and can be viewed:
1. In GitHub (automatic rendering)
2. In VS Code with Mermaid extension
3. On [Mermaid Live Editor](https://mermaid.live)
4. In any Markdown viewer with Mermaid support

## Contributing

When updating diagrams:
1. Use Mermaid syntax for consistency
2. Keep diagrams focused and readable
3. Update this README if adding new diagrams
4. Test rendering before committing

## License

This documentation is part of the Smart Consent Manager project.
