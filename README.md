# Class Pulse

Class Pulse is a compliance-first training operations platform designed to support student enrollment, course and class management, attendance tracking, instructor compliance, assessments, certificate generation, operational reporting, and audit-ready governance.

The project must be implemented as a reliable operational system, not simply as a collection of screens. Every major workflow should support permissions, data integrity, audit trails, and regulator-ready reporting.

---

## 1. Project Objectives

The primary objective of Class Pulse is to centralize and streamline the organization’s training operations while maintaining strong compliance controls.

The platform should support:

- Student profile management
- Enrollment workflows
- Document collection and verification
- Course/program setup
- Class and cohort management
- Instructor assignment
- Instructor credential compliance
- Attendance tracking
- Assessment and exam records
- Certificate eligibility and generation
- Compliance dashboard visibility
- Audit logs
- Operational reports
- Administrative settings

---

## 2. Implementation Philosophy

This project follows a compliance-first and phased implementation model.

Core principles:

1. Build the operational foundation before advanced features.
2. Enforce business rules on the backend.
3. Use role-based permissions throughout the platform.
4. Preserve audit history for compliance-sensitive actions.
5. Keep scope controlled through governance and acceptance criteria.
6. Deliver modules in reviewable phases.
7. Support UAT and client sign-off for completed workflows.

---

## 3. Recommended Technology Stack

The exact stack may be adjusted based on final engineering decisions, but the recommended structure is:

### Frontend

- React or Next.js
- TypeScript
- Component-based UI architecture
- Feature-based folder structure
- Form validation
- Permission-aware routing and navigation

### Backend

- Node.js with NestJS or Express
- TypeScript
- Modular service architecture
- REST APIs
- Role-based access control
- Audit logging
- File upload abstraction

### Database

- PostgreSQL or another approved relational database
- ORM or query builder with migration support
- Structured schema migrations
- Seed scripts for baseline data

### DevOps

- Docker/Docker Compose for local development
- CI/CD pipeline for build and deployment
- Separate staging/UAT and production environments
- Environment-based configuration
- Logging and monitoring

---

## 4. Recommended Repository Structure

```txt
class-pulse/
├── apps/
│   ├── web/
│   └── api/
├── packages/
│   ├── shared/
│   ├── validation/
│   └── ui/
├── docs/
│   ├── architecture/
│   ├── requirements/
│   ├── governance/
│   ├── api/
│   ├── database/
│   ├── acceptance-criteria/
│   └── uat/
├── infra/
│   ├── docker/
│   ├── environments/
│   └── ci-cd/
├── scripts/
│   ├── seed/
│   └── utilities/
├── AGENTS.md
├── SKILLS.md
├── RULES.md
├── README.md
└── docker-compose.yml
```

---

## 5. Core Modules

### 5.1 Authentication and User Management

Responsibilities:

- Login/logout
- Password reset
- User creation and management
- Account activation/deactivation
- Protected routes and APIs

### 5.2 Roles and Permissions

Responsibilities:

- Define system roles
- Assign roles to users
- Enforce backend permissions
- Control frontend navigation and available actions

Recommended roles:

- Super Admin
- Admin / Operations Staff
- Instructor
- Student / Learner
- Compliance Reviewer
- Read-only Auditor, if needed

### 5.3 Student Management

Responsibilities:

- Student profile creation
- Student profile updates
- Contact and demographic information
- Student status tracking
- Student document association

### 5.4 Enrollment Management

Responsibilities:

- Enrollment creation
- Enrollment review
- Enrollment approval/rejection
- Program or class assignment
- Enrollment status tracking
- Enrollment compliance checks

### 5.5 Document Management

Responsibilities:

- Required document checklist
- Student document uploads
- Instructor credential document uploads
- Document status tracking
- Document review history

### 5.6 Course and Class Management

Responsibilities:

- Course/program setup
- Class/cohort creation
- Student roster management
- Instructor assignment
- Schedule association

### 5.7 Schedule Management

Responsibilities:

- Session scheduling
- Class calendar
- Instructor schedule assignment
- Attendance session generation

### 5.8 Attendance Management

Responsibilities:

- Attendance session creation
- Attendance marking
- Attendance correction workflow
- Attendance summaries
- Attendance compliance calculation

### 5.9 Instructor Compliance

Responsibilities:

- Instructor profiles
- Credential requirements
- Credential expiration tracking
- Compliance status
- Assignment warnings or restrictions

### 5.10 Assessments

Responsibilities:

- Assessment/exam setup
- Result recording
- Pass/fail or score tracking
- Assessment-based eligibility rules

### 5.11 Certificates

Responsibilities:

- Certificate eligibility calculation
- Certificate generation
- Certificate issue tracking
- Certificate revocation/reissue
- Certificate audit trail

### 5.12 Compliance Dashboard

Responsibilities:

- Missing student documents
- Low attendance risks
- Instructor credential issues
- Pending approvals
- Certificate eligibility status
- Compliance exception summaries

### 5.13 Reports

Responsibilities:

- Enrollment reports
- Student compliance reports
- Attendance reports
- Instructor compliance reports
- Certificate reports
- Audit log reports

### 5.14 Audit Logs

Responsibilities:

- Track compliance-sensitive actions
- Preserve before/after values where needed
- Support filtering and review
- Support regulator-ready evidence

---

## 6. Suggested Implementation Phases

### Phase 0 — Project Setup

Deliverables:

- Repository setup
- Frontend and backend bootstrapping
- Database setup
- Local development environment
- Environment variable templates
- Basic CI/CD setup
- Initial documentation

### Phase 1 — Access and Administration

Deliverables:

- Authentication
- User management
- Roles and permissions
- Protected frontend routes
- Protected backend APIs

### Phase 2 — Student and Enrollment Operations

Deliverables:

- Student management
- Enrollment workflow
- Enrollment statuses
- Required document checklist
- Basic enrollment reports

### Phase 3 — Course, Class, and Schedule Operations

Deliverables:

- Course management
- Class/cohort management
- Student roster
- Instructor assignment
- Schedule management

### Phase 4 — Attendance and Compliance Base

Deliverables:

- Attendance session management
- Attendance marking
- Attendance correction
- Attendance summaries
- Attendance audit logs

### Phase 5 — Instructor Compliance and Compliance Dashboard

Deliverables:

- Instructor profiles
- Credential tracking
- Expiration alerts
- Compliance exceptions
- Compliance dashboard

### Phase 6 — Assessments and Certificates

Deliverables:

- Assessment records
- Assessment results
- Certificate eligibility
- Certificate generation
- Certificate audit trail

---

## 7. Local Development Setup

The final commands depend on the selected package manager and framework. The expected setup should follow this pattern:

```bash
# Clone repository
git clone <repository-url>
cd class-pulse

# Install dependencies
npm install

# Copy environment templates
cp .env.example .env
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env

# Start local services
docker compose up -d

# Run database migrations
npm run db:migrate

# Seed baseline data
npm run db:seed

# Start development servers
npm run dev
```

Recommended local services:

- API server
- Web application
- Database
- Local file storage or storage mock
- Email sandbox or notification mock

---

## 8. Environment Variables

Each environment must define its own configuration. Do not commit real secrets.

Example variables:

```bash
NODE_ENV=development
APP_URL=http://localhost:3000
API_URL=http://localhost:4000
DATABASE_URL=postgresql://user:password@localhost:5432/class_pulse
JWT_SECRET=replace-with-local-secret
JWT_EXPIRES_IN=1d
STORAGE_PROVIDER=local
UPLOAD_MAX_SIZE_MB=10
EMAIL_PROVIDER=mock
```

Keep `.env.example` updated whenever configuration changes.

---

## 9. Database and Migration Rules

- All schema changes must use migrations.
- Seed baseline roles and permissions.
- Use controlled status values for workflows.
- Preserve audit history for compliance-sensitive records.
- Prefer soft deletion or inactive statuses over physical deletion.
- Document data migrations that affect existing records.

Minimum entities expected:

```txt
User
Role
Permission
Student
StudentDocument
Enrollment
Course
Class
ClassStudent
Instructor
InstructorCredential
Schedule
AttendanceSession
AttendanceRecord
ComplianceRule
ComplianceException
Assessment
AssessmentResult
Certificate
AuditLog
Notification
Setting
```

---

## 10. API Standards

API responses should be consistent.

Success response:

```json
{
  "success": true,
  "data": {},
  "message": "Operation completed successfully"
}
```

Error response:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": []
  }
}
```

API endpoints should be resource-oriented and versioned if required.

Example endpoints:

```txt
POST   /auth/login
GET    /users
POST   /students
GET    /students/:id
POST   /enrollments
PATCH  /enrollments/:id/status
POST   /attendance-sessions/:id/records
GET    /compliance/dashboard
GET    /reports/attendance
GET    /audit-logs
```

---

## 11. Audit Logging

Audit logs are required for compliance-sensitive actions.

Audit log fields should include:

```txt
id
actor_user_id
action
entity_type
entity_id
before_value
after_value
reason/context
created_at
```

Examples of auditable actions:

- Student profile updated
- Enrollment status changed
- Attendance corrected
- Instructor credential updated
- Certificate generated
- Certificate revoked
- User role changed
- Compliance rule updated

---

## 12. Testing and Verification

Recommended test coverage:

- Authentication tests
- Permission tests
- Enrollment workflow tests
- Attendance logic tests
- Instructor credential compliance tests
- Certificate eligibility tests
- Audit log tests
- API integration tests
- Frontend form validation tests

Manual UAT should be documented for each completed module.

---

## 13. Pull Request Checklist

Before submitting a pull request, confirm:

```md
- [ ] Scope is clear and matches the approved task
- [ ] Code follows existing project patterns
- [ ] Backend validation is implemented
- [ ] Backend authorization is implemented
- [ ] Audit logs are included where required
- [ ] Database migrations are included where required
- [ ] UI handles loading, empty, error, and success states
- [ ] Tests or manual verification steps are included
- [ ] Documentation is updated where needed
- [ ] No secrets or private credentials are committed
```

---

## 14. Documentation Files

This repository should include:

- `README.md` — project overview and setup
- `AGENTS.md` — instructions for AI coding agents and implementation assistants
- `SKILLS.md` — required technical/product skills
- `RULES.md` — mandatory development and governance rules
- `docs/architecture/` — system architecture notes
- `docs/api/` — API documentation
- `docs/database/` — schema and migration notes
- `docs/acceptance-criteria/` — module acceptance criteria
- `docs/uat/` — user acceptance testing scripts

---

## 15. Delivery Governance

Each phase or sprint should include:

- Defined scope
- Acceptance criteria
- Module owner
- Test/verification evidence
- Demo notes
- Known risks
- Change request log, if applicable
- Sign-off status

Scope additions should be reviewed before implementation.

---

## 16. Definition of Done

A feature is complete when:

1. It satisfies acceptance criteria.
2. It works end to end.
3. Validation is implemented.
4. Permissions are enforced.
5. Audit logging is included where required.
6. Tests or manual verification are complete.
7. Documentation is updated where required.
8. It is ready for staging/UAT review.
