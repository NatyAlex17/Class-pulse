# RULES.md — Class Verse Development Rules

## 1. Purpose

This file defines mandatory development rules for the Class Verse project. It is intended for developers, reviewers, and AI coding agents.

These rules exist to protect implementation quality, regulatory readiness, data integrity, security, delivery governance, and scope control.

---

## 2. Golden Rules

1. Compliance-critical logic must be enforced on the backend.
2. Every protected action must pass authorization checks.
3. Every compliance-relevant mutation must create an audit log.
4. Never commit secrets, passwords, tokens, private keys, or production credentials.
5. Do not introduce major scope changes without approval.
6. Do not permanently delete compliance-relevant records unless explicitly approved.
7. Keep changes small, focused, and reviewable.
8. Follow existing project patterns before introducing new ones.
9. Do not duplicate business entities or create parallel models unnecessarily.
10. A feature is not complete until it is tested or manually verified against acceptance criteria.

---

## 3. Scope Control Rules

### 3.1 Allowed Without Formal Change Request

The following are acceptable if they do not affect architecture, timeline, cost, or core workflows:

- Small label changes
- Minor UI alignment fixes
- Minor form validation message improvements
- Small table column display adjustments
- Minor copy/text improvements
- Small usability improvements within approved workflows

### 3.2 Requires Review

The following require review before implementation:

- Workflow status changes
- Additional required fields
- Changes to certificate eligibility
- Changes to attendance rules
- Changes to instructor compliance rules
- Changes to dashboard metrics
- New document requirements
- New report formats
- New user roles or permissions

### 3.3 Requires Formal Change Request

The following should not be implemented without explicit approval:

- New portals
- Payment integration
- CRM integration
- External LMS integration
- Advanced analytics beyond agreed reports
- AI features
- Mobile applications
- Major automation workflows
- New regulatory modules outside the approved phase
- Major data model redesigns after development has started

---

## 4. Architecture Rules

1. Organize code by domain/module.
2. Keep controller/route logic thin.
3. Keep business rules in service or policy layers.
4. Keep data access in repository or ORM layers.
5. Keep validation schemas close to module boundaries or shared packages.
6. Reuse shared types and constants where available.
7. Avoid circular dependencies between modules.
8. Avoid large utility files that become dumping grounds.
9. Avoid hardcoded role names across the codebase; centralize them.
10. Avoid hardcoded compliance thresholds unless the requirement explicitly says they are fixed.

---

## 5. Backend Rules

1. All incoming data must be validated.
2. All protected endpoints must require authentication.
3. All role-restricted endpoints must enforce authorization server-side.
4. All mutation endpoints must return clear success or error responses.
5. All status transitions must be validated.
6. All compliance-relevant mutations must create audit logs.
7. All file uploads must validate file size, file type, and record ownership.
8. API responses must be consistent.
9. Errors must not expose sensitive implementation details.
10. Use transactions for multi-step operations that must succeed or fail together.

Example status-transition rule:

```txt
An enrollment cannot move directly from draft to completed.
An enrollment must be approved before it becomes active.
A certificate cannot be generated unless eligibility checks pass.
```

---

## 6. Frontend Rules

1. Protected pages must require authentication.
2. Navigation must respect user permissions.
3. UI permission checks must not replace backend permission checks.
4. Forms must show clear validation messages.
5. Tables should support practical operations such as search, filter, sort, or pagination where needed.
6. Use reusable components for common patterns.
7. Every data-loading screen must handle loading, empty, error, and success states.
8. Avoid embedding core compliance logic only in frontend components.
9. Avoid duplicate API clients or inconsistent request handling.
10. Keep screens aligned with approved workflows and acceptance criteria.

---

## 7. Database Rules

1. Use migrations for schema changes.
2. Do not manually change production schema outside the approved migration process.
3. Add indexes for frequently queried operational data.
4. Use foreign keys or equivalent integrity constraints where applicable.
5. Use soft deletion or status fields for compliance-relevant entities.
6. Preserve historical records for attendance, enrollment, instructor compliance, and certificates.
7. Avoid nullable fields unless the business workflow allows incomplete data.
8. Use clear enum/status values for controlled workflows.
9. Seed required roles, permissions, and baseline settings.
10. Document any migration that changes existing data.

---

## 8. Audit Logging Rules

Audit logs are required for:

- User creation, update, role change, or deactivation
- Student creation or profile update
- Enrollment creation or status change
- Required document upload, replacement, approval, rejection, or deletion
- Course or class creation/update when it affects active students
- Instructor assignment
- Instructor credential creation, update, expiration, renewal, or removal
- Attendance marking or correction
- Assessment result creation or change
- Certificate generation, issue, revocation, or reissue
- Compliance rule change
- System setting change

Audit logs should include:

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

Do not store unnecessary sensitive data in audit logs.

---

## 9. Permission Rules

Minimum role categories:

- Super Admin
- Admin / Operations Staff
- Instructor
- Student / Learner
- Compliance Reviewer
- Read-only Auditor, if needed

Rules:

1. Super Admin can manage system-level configuration.
2. Admin can manage operational workflows based on assigned permissions.
3. Instructor can only manage assigned classes, attendance, or related records as allowed.
4. Student can only access their own records, if a student portal is part of the approved scope.
5. Compliance Reviewer can view compliance records and reports.
6. Read-only Auditor can view approved audit/reporting data without making changes.

Do not grant broad permissions by default.

---

## 10. Compliance Rules

Compliance logic should be explicit and testable.

Examples:

- A student with missing required documents should be flagged.
- A student who does not meet attendance requirements should not be certificate-eligible.
- An instructor with expired credentials should be flagged as non-compliant.
- A class should not be marked complete if required attendance or assessment data is missing.
- A certificate should not be generated without eligibility confirmation.

Compliance exceptions should be stored and visible in dashboards/reports.

---

## 11. Certificate Rules

Certificate generation must depend on defined eligibility checks.

Minimum eligibility inputs:

- Enrollment status
- Course/class completion status
- Attendance requirement
- Assessment result, where applicable
- Required student documents
- Compliance exceptions

Certificate actions must be audited:

- Generated
- Issued
- Revoked
- Reissued

Do not allow certificate generation from frontend-only checks.

---

## 12. Attendance Rules

Attendance tracking must preserve correction history.

Rules:

1. Attendance records should be tied to a class/session.
2. Attendance should be tied to a student enrollment or class roster.
3. Changes after initial marking should require a correction reason where appropriate.
4. Attendance summaries should be calculated consistently.
5. Attendance records should be auditable.

Common attendance values:

```txt
present
absent
late
excused
pending
```

---

## 13. Instructor Compliance Rules

Instructor compliance must track credentials and eligibility.

Rules:

1. Instructor credentials should include issue date, expiration date, type, and proof document where applicable.
2. Expired credentials should trigger compliance exceptions.
3. Missing required credentials should trigger compliance exceptions.
4. Instructor assignment should warn or block when compliance rules require it.
5. Credential updates must be audited.

---

## 14. Reporting Rules

Reports should be generated from reliable backend queries, not frontend-only aggregation for official records.

Priority reports:

- Enrollment report
- Student compliance report
- Attendance report
- Instructor compliance report
- Certificate report
- Audit log report

Reports should support filters such as date range, course, class, status, and compliance state where applicable.

---

## 15. Testing Rules

Tests are required or strongly expected for:

- Authentication
- Permission enforcement
- Enrollment transitions
- Attendance updates and corrections
- Instructor credential expiration
- Certificate eligibility
- Audit log creation
- Compliance dashboard summaries

Manual verification must be documented if automated tests are not yet available.

---

## 16. Git and Pull Request Rules

Recommended branch naming:

```txt
feature/module-name-short-description
fix/module-name-short-description
chore/task-description
hotfix/issue-description
```

Pull request description should include:

```md
## Summary

## Scope

## Screens / API Changed

## Database Changes

## Tests / Verification

## Risks

## Screenshots, if UI changed
```

Do not mix large refactors with feature work unless explicitly approved.

---

## 17. Environment and Secret Rules

1. Keep `.env.example` updated.
2. Never commit real `.env` files.
3. Never expose production credentials in logs.
4. Use separate credentials for local, staging, and production.
5. Rotate secrets if accidental exposure occurs.
6. Store secrets only in approved secret management systems or deployment environment variables.

---

## 18. Definition of Done Rules

A task is done only when:

- The requested workflow works end to end.
- Validation is implemented.
- Permission checks are implemented.
- Audit logs are implemented where required.
- Database migrations are included where required.
- UI states are handled.
- Tests or manual verification are completed.
- Documentation is updated where required.
- Acceptance criteria are satisfied.
