# AGENTS.md — Class Pulse Implementation Agent Guide

## 1. Purpose

This document defines how AI coding agents, engineering assistants, and automation tools should operate when contributing to the Class Pulse project.

Class Pulse is a compliance-first training operations platform. The implementation must prioritize operational reliability, audit defensibility, controlled access, data integrity, and regulator-ready workflows over rapid feature accumulation.

Any coding agent working on this project must follow this guide before making architectural, code, database, workflow, or UI changes.

---

## 2. Product Context

Class Pulse supports day-to-day training and education operations, including student enrollment, course and class management, attendance tracking, instructor compliance, assessment management, certificate generation, reporting, and audit trails.

The system should be built as an operational platform, not only as a collection of screens. Every major action should be traceable, permission-controlled, and connected to the compliance model.

Core operating priorities:

1. Regulatory readiness
2. Stable operational workflows
3. Accurate student and instructor records
4. Defensible attendance, assessment, and certificate data
5. Role-based access control
6. Clear reporting and audit logs
7. Controlled change management

---

## 3. Implementation Principles

### 3.1 Build Compliance-Critical Workflows First

Prioritize modules that support required operations and compliance validation:

1. Authentication and access control
2. Users, roles, and permissions
3. Student profiles
4. Enrollment workflows
5. Course, class, and cohort setup
6. Attendance tracking
7. Instructor compliance tracking
8. Audit logs
9. Compliance dashboard and reporting
10. Assessments and certificate generation

Avoid starting with advanced dashboards, cosmetic enhancements, or automation-heavy features before the operational foundation is stable.

### 3.2 Treat Auditability as a Core Requirement

For all compliance-relevant actions, capture:

- Actor user ID
- Action type
- Target entity type
- Target entity ID
- Before value, where applicable
- After value, where applicable
- Timestamp
- Source/context, where applicable
- Reason/comment, where required

Examples of auditable actions:

- Student created or updated
- Enrollment submitted, approved, rejected, cancelled, or completed
- Attendance marked or corrected
- Instructor credential added, changed, expired, or renewed
- Assessment result recorded or modified
- Certificate generated, revoked, or reissued
- User role changed
- Required document uploaded, replaced, approved, or rejected

### 3.3 Avoid Hidden Business Logic in UI Components

Business rules must not live only inside frontend components.

Frontend screens may display validation messages and guide user actions, but backend services must enforce:

- Required fields
- Status transitions
- Role permissions
- Certificate eligibility
- Attendance thresholds
- Instructor eligibility
- Document requirements
- Compliance exceptions

### 3.4 Prefer Explicit Status Workflows

Use clear status values and controlled transitions rather than loose text fields.

Example enrollment statuses:

- draft
- submitted
- under_review
- approved
- rejected
- active
- completed
- cancelled

Example certificate statuses:

- not_eligible
- eligible
- generated
- issued
- revoked
- reissued

Status transitions should be validated server-side.

### 3.5 Keep Scope Controlled

Do not introduce large modules, new portals, payment integrations, external CRM integrations, advanced analytics, AI features, or automation layers unless they are explicitly part of the approved scope.

Minor UI improvements are acceptable only when they do not alter business logic, schedule, cost, or module boundaries.

---

## 4. Recommended Project Structure

Use a domain-oriented structure. Organize by business capability, not only by technical layer.

Recommended monorepo structure:

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

Recommended backend domains:

```txt
apps/api/src/modules/
├── auth/
├── users/
├── roles/
├── permissions/
├── students/
├── enrollments/
├── documents/
├── courses/
├── classes/
├── schedules/
├── attendance/
├── instructors/
├── compliance/
├── assessments/
├── certificates/
├── reports/
├── audit-logs/
├── notifications/
└── settings/
```

Recommended frontend domains:

```txt
apps/web/src/features/
├── auth/
├── dashboard/
├── users/
├── students/
├── enrollments/
├── courses/
├── classes/
├── attendance/
├── instructors/
├── compliance/
├── assessments/
├── certificates/
├── reports/
└── settings/
```

---

## 5. Agent Working Rules

### 5.1 Before Making Changes

Before editing code, the agent must:

1. Identify the module being changed.
2. Identify whether the change affects compliance, permissions, audit logs, reporting, or data integrity.
3. Check existing patterns in the codebase before introducing new patterns.
4. Confirm whether new database fields require migrations and seed updates.
5. Confirm whether API contract changes require frontend updates.
6. Confirm whether tests or acceptance criteria need updates.

### 5.2 During Implementation

The agent must:

- Keep changes small and reviewable.
- Avoid mixing unrelated changes in one commit or patch.
- Add validation for all user inputs.
- Enforce authorization on all protected backend endpoints.
- Add audit logs for compliance-relevant changes.
- Use shared types and validation schemas where available.
- Preserve existing naming conventions.
- Avoid hardcoding business rules inside UI components.
- Avoid breaking existing workflows unless explicitly instructed.

### 5.3 After Implementation

The agent must summarize:

- Files changed
- Features implemented
- Business rules added or changed
- Database changes made
- Tests added or updated
- Risks or assumptions
- Manual verification steps

---

## 6. Module Priority Guidance

### Sprint 0 — Foundation

Target:

- Repository setup
- Environment configuration
- Database connection
- Migration setup
- CI/CD baseline
- Auth architecture
- Shared coding conventions

### Sprint 1 — Auth, Users, Roles, Permissions

Target:

- Login/logout
- Protected routes
- User management
- Role assignment
- Permission enforcement

### Sprint 2 — Students and Enrollments

Target:

- Student CRUD
- Student profile
- Enrollment creation
- Enrollment review workflow
- Required document checklist

### Sprint 3 — Courses, Classes, Cohorts, Scheduling

Target:

- Course management
- Class/cohort setup
- Student roster
- Instructor assignment
- Session scheduling

### Sprint 4 — Attendance and Audit Trail

Target:

- Attendance sessions
- Attendance marking
- Attendance correction workflow
- Attendance summaries
- Audit events

### Sprint 5 — Instructor Compliance and Compliance Dashboard

Target:

- Instructor profiles
- Credential tracking
- Expiration alerts
- Compliance exceptions
- Dashboard summaries

### Sprint 6 — Assessments and Certificates

Target:

- Assessment records
- Result management
- Certificate eligibility
- Certificate generation
- Certificate audit trail

---

## 7. Data Model Guidance

Minimum core entities:

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

Use relational integrity where applicable. Avoid deleting compliance-relevant records permanently. Prefer soft deletion or status-based deactivation where audit history matters.

---

## 8. API Design Guidance

All APIs should follow predictable resource-based naming.

Examples:

```txt
POST   /auth/login
POST   /auth/logout
GET    /users
POST   /users
GET    /students
POST   /students
GET    /students/:id
PATCH  /students/:id
POST   /students/:id/documents
GET    /enrollments
POST   /enrollments
PATCH  /enrollments/:id/status
GET    /classes/:id/attendance
POST   /attendance-sessions/:id/records
PATCH  /attendance-records/:id/correction
GET    /compliance/dashboard
GET    /audit-logs
```

API responses should be consistent:

```json
{
  "success": true,
  "data": {},
  "message": "Operation completed successfully"
}
```

Error responses should be consistent:

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

---

## 9. Security Requirements

Every agent must preserve the following requirements:

- No unauthenticated access to protected resources.
- No role escalation through frontend-only checks.
- Backend must enforce authorization.
- Sensitive data must not be logged in plain text.
- File uploads must validate type, size, and ownership.
- Passwords must be hashed using approved secure methods.
- Tokens must be handled securely.
- Environment secrets must not be committed.
- Audit logs must not expose unnecessary sensitive data.

---

## 10. Testing Expectations

Agents should add or update tests when changing:

- Authentication
- Permissions
- Enrollment status workflow
- Attendance logic
- Instructor compliance logic
- Certificate eligibility
- Reports
- Database migrations
- API contracts

Minimum test types:

- Unit tests for business rules
- Integration tests for API endpoints
- Permission tests for protected actions
- Regression tests for critical workflows

---

## 11. Definition of Done

A feature is not complete until:

1. It meets the acceptance criteria.
2. It passes validation and permission checks.
3. It includes audit logs where required.
4. It handles error states.
5. It has appropriate tests or documented manual verification.
6. It does not break existing workflows.
7. It is documented where needed.
8. It is ready for demo or UAT review.

---

## 12. Do Not Do

Do not:

- Bypass backend permission checks.
- Add major features outside the approved scope.
- Store compliance rules only in frontend code.
- Delete compliance records permanently without explicit approval.
- Introduce unreviewed third-party services.
- Commit secrets, tokens, passwords, or private keys.
- Create duplicate models for the same business entity.
- Use inconsistent status names.
- Mix refactoring with new feature work unnecessarily.
- Ignore audit logging on critical actions.

---

## 13. Agent Output Format

When completing a task, the coding agent should report:

```md
## Summary

- What was implemented

## Files Changed

- File paths and purpose

## Business Rules Applied

- Rules enforced

## Database Changes

- Migrations or schema changes

## Tests / Verification

- Tests added or manual checks performed

## Risks / Assumptions

- Anything that needs human review
```
