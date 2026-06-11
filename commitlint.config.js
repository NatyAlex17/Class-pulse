module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [
      2,
      "always",
      [
        "feat",
        "fix",
        "refactor",
        "test",
        "docs",
        "chore",
        "ci",
        "perf",
        "style",
        "revert",
      ],
    ],
    "scope-enum": [
      2,
      "always",
      [
        // Core domains
        "auth",
        "users",
        "students",
        "enrollments",
        "courses",
        "classes",
        "attendance",
        "instructors",
        "compliance",
        "documents",
        "assessments",
        "certificates",
        "reports",
        "audit",
        // Workspace/infra
        "root", // ← monorepo root changes
        "monorepo", // ← alternative
        "api",
        "web",
        "infra",
        "docs",
        "shared",
      ],
    ],
    "type-case": [2, "always", "lowercase"],
    "scope-case": [2, "always", "lowercase"],
    "subject-case": [2, "always", "lowercase"],
    "subject-empty": [2, "never"],
    "subject-full-stop": [2, "never"],
  },
};
