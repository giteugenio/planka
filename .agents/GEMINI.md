# Instructions for Gemini Agent - Planka Kanban Project

You are an AI assistant working on the Planka Kanban codebase.
To optimize context window and save tokens, do not read the entire codebase recursively. 

Use the documentation files located in `.agents/codebase/` to navigate the project dynamically based on the requested task.

---

## 📂 Context Mapping Rules

When performing a task, consult ONLY the corresponding `.md` files in `.agents/codebase/` before editing or reading code:

### 1. New Feature / Feature Enhancement
* Primary context: @./.agents/codebase/ARCHITECTURE.md
* Rules & Standards: @./.agents/codebase/CONVENTIONS.md
* File Locations: @./.agents/codebase/STRUCTURE.md

### 2. Bug Fixes & Refactoring
* Primary context: @./.agents/codebase/STRUCTURE.md
* Edge Cases & Risks: @./.agents/codebase/CONCERNS.md

### 3. Writing or Updating Tests
* Testing Guidelines: @./.agents/codebase/TESTING.md
* Code Standards: @./.agents/codebase/CONVENTIONS.md

### 4. External Services & Dependencies
* Third-party Integrations: @./.agents/codebase/INTEGRATIONS.md
* Tech Stack & Libraries: @./.agents/codebase/STACK.md

---

## 🚀 Execution Rules for Gemini

1. **Token Efficiency:** Always read `@./.agents/codebase/STRUCTURE.md` first to locate the specific file(s) that need modification instead of searching the whole directory.
2. **Conventions:** Follow coding guidelines strictly as defined in `@./.agents/codebase/CONVENTIONS.md`.
3. **Safety Check:** Before finalizing architectural changes or complex fixes, double-check known technical debt in `@./.agents/codebase/CONCERNS.md`.