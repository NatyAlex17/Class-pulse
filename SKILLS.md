# SKILLS.md — Required Engineering Skills for Class Pulse

## 1. Purpose

This file defines the technical and product skills required to implement, review, and maintain the Class Pulse platform. It should be used by human developers, AI coding agents, and delivery reviewers to understand the expected engineering capability for the project.

Class Pulse is a compliance-first operational platform. The required skill set goes beyond basic CRUD development. Contributors must understand secure workflows, role-based permissions, audit logging, compliance data, reporting, and phased delivery.

---

## 2. Core Product Understanding

Contributors must understand the following product domains:

- Student profile management
- Enrollment workflows
- Required document tracking
- Course and program setup
- Class and cohort management
- Instructor assignment
- Instructor credential compliance
- Attendance tracking
- Assessment and exam records
- Certificate eligibility and generation
- Compliance exceptions
- Audit logs
- Operational reporting
- Administrative settings

The system should reflect how the organization operates day to day, not just how data is stored.

---

## 3. Backend Development Skills

Backend contributors should be able to implement:

- Modular backend architecture
- REST API design
- Authentication and authorization
- Role-based access control
- Input validation
- DTO/schema validation
- Business-rule services
- Repository/data-access layers
- Database migrations
- Transaction-safe operations
- Audit logging
- File upload handling
- Report/query endpoints
- Error handling
- API documentation
- Unit and integration tests

Expected backend patterns:

- Separate controllers/routes from business logic.
- Keep compliance logic in services or policy layers.
- Validate status transitions server-side.
- Record audit logs for compliance-relevant mutations.
- Keep API responses consistent.
- Avoid leaking sensitive internal errors to users.

---

## 4. Frontend Development Skills

Frontend contributors should be able to implement:

- Protected routes
- Role-aware navigation
- Reusable layout components
- Data tables with filtering and pagination
- Form validation
- Multi-step workflows
- Status badges
- Empty, loading, and error states
- File upload UI
- Detail pages for operational records
- Dashboard cards and compliance summaries
- UAT-friendly screens
- Accessible and responsive interfaces

Expected frontend patterns:

- Keep API calls organized by feature.
- Use shared types where available.
- Avoid duplicating business rules that must be enforced by the backend.
- Show clear validation and error messages.
- Keep workflow screens aligned with acceptance criteria.
- Use permission-aware UI, but do not rely on UI permissions alone.

---

## 5. Database and Data Modeling Skills

Contributors should be comfortable designing and maintaining relational data models for:

- Users and roles
- Students
- Enrollments
- Courses
- Classes/cohorts
- Instructor credentials
- Attendance sessions and records
- Assessments and results
- Certificates
- Compliance rules and exceptions
- Audit logs
- Notifications
- Settings

Required database skills:

- Schema design
- Normalization where appropriate
- Referential integrity
- Migration management
- Indexing for operational queries
- Soft deletion/status-based deactivation
- Transaction handling
- Seed data creation
- Data export/reporting queries

Important rule: compliance-relevant records should not be physically deleted unless explicitly approved. Prefer status changes or soft deletion with audit history.

---

## 6. Security and Access Control Skills

Contributors must understand:

- Authentication flows
- Password security
- Token/session handling
- Role-based access control
- Permission guards
- API authorization
- Secure file upload handling
- Environment secret management
- Sensitive data redaction
- Least-privilege access

Every protected backend endpoint must enforce authorization. Frontend-only permission checks are not sufficient.

---

## 7. Compliance and Audit Skills

Contributors must understand how to build systems where actions are traceable.

Required capability:

- Identify compliance-sensitive actions
- Create audit log entries
- Preserve historical records
- Track status transitions
- Track document changes
- Track attendance corrections
- Track certificate generation/revocation
- Track instructor credential changes
- Design reports that support compliance review

Audit records should be reliable, consistent, and queryable.

---

## 8. DevOps and Environment Skills

Contributors should understand:

- Local development setup
- Environment variable management
- Docker/Docker Compose
- CI/CD pipelines
- Staging and production separation
- Database migration execution
- Backup planning
- Release tagging
- Deployment verification
- Error monitoring and logging

Recommended environments:

```txt
local
staging / UAT
production
```

No production deployment should be performed without a clear release note, migration plan, and rollback consideration.

---

## 9. Testing Skills

Contributors should be able to write and maintain:

- Unit tests
- API integration tests
- Permission tests
- Workflow tests
- Regression tests
- Form validation tests
- Manual UAT checklists

Critical workflows requiring tests:

- Login and protected routes
- User role assignment
- Enrollment status transitions
- Student document requirements
- Attendance marking and correction
- Instructor credential expiration
- Certificate eligibility
- Audit log creation

---

## 10. Documentation Skills

Contributors should document:

- Setup instructions
- Environment variables
- API endpoints
- Database models
- Module responsibilities
- Business rules
- Acceptance criteria
- UAT instructions
- Known limitations
- Deployment notes

Documentation should be clear enough that a new developer or reviewer can understand the system without relying on informal chat history.

---

## 11. AI Coding Agent Skills

AI coding agents should be able to:

- Read existing code patterns before modifying files
- Follow domain-driven module boundaries
- Generate small, reviewable patches
- Add tests where appropriate
- Explain business logic changes
- Identify permission and audit implications
- Avoid speculative changes outside the requested task
- Produce clear implementation summaries

Agents should not invent product requirements. If an assumption is necessary, it should be stated clearly in the implementation summary.

---

## 12. Delivery and Governance Skills

Contributors should understand phased delivery and scope control.

Every module should be delivered with:

- Defined scope
- Acceptance criteria
- Implementation notes
- Test evidence or manual verification
- Known risks
- Client review notes, where applicable

Changes should be classified as:

- Minor refinement
- Workflow clarification
- Compliance-critical correction
- Scope expansion
- Future enhancement

Scope expansions require approval before implementation.

---

## 13. Minimum Contributor Competency Checklist

A contributor is ready to work on this project if they can:

- Build secure CRUD workflows
- Enforce backend permissions
- Design clean relational models
- Implement audit logging
- Write migration-safe changes
- Build responsive operational screens
- Handle form validation and errors
- Write or update tests
- Follow existing architecture
- Document implementation decisions
