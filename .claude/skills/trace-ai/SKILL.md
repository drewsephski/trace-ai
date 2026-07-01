```markdown
# trace-ai Development Patterns

> Auto-generated skill from repository analysis

## Overview
This skill teaches you the core development patterns, coding conventions, and workflows used in the `trace-ai` TypeScript codebase. It covers file organization, import/export styles, commit message conventions, and how to write and run tests using Vitest. This guide helps ensure consistency and efficiency when contributing to the project.

## Coding Conventions

### File Naming
- Use **camelCase** for file names.
  - Example: `userProfile.ts`, `traceEngine.tsx`

### Import Style
- Use **alias imports** to reference modules.
  - Example:
    ```typescript
    import { TraceEngine } from '@core/traceEngine';
    ```

### Export Style
- **Mixed** export style: both named and default exports are used.
  - Named export:
    ```typescript
    export function runTrace() { ... }
    ```
  - Default export:
    ```typescript
    export default TraceEngine;
    ```

### Commit Messages
- Use **conventional commit** style.
- Prefix with the type, such as `fix`.
- Keep messages concise (average: 42 characters).
  - Example:
    ```
    fix: correct trace calculation for edge cases
    ```

## Workflows

### Testing
**Trigger:** When you want to run the test suite.
**Command:** `/test`

1. Ensure all dependencies are installed.
2. Run Vitest to execute all test files matching `*.test.tsx`.
   ```bash
   npx vitest
   ```
3. Review the output to check for passing and failing tests.

### Commit Changes
**Trigger:** When committing code changes.
**Command:** `/commit`

1. Stage your changes.
   ```bash
   git add .
   ```
2. Write a commit message using the conventional format:
   ```
   <type>: <short description>
   ```
   Example:
   ```
   fix: resolve import alias in traceEngine
   ```
3. Commit your changes.
   ```bash
   git commit -m "fix: resolve import alias in traceEngine"
   ```

## Testing Patterns

- All tests use the **Vitest** framework.
- Test files are named with the pattern `*.test.tsx`.
- Example test file:
  ```typescript
  import { describe, it, expect } from 'vitest';
  import { runTrace } from '@core/traceEngine';

  describe('runTrace', () => {
    it('should return correct trace output', () => {
      expect(runTrace(input)).toEqual(expectedOutput);
    });
  });
  ```

## Commands

| Command   | Purpose                                 |
|-----------|-----------------------------------------|
| /test     | Run the full test suite with Vitest      |
| /commit   | Commit changes using conventional style  |
```