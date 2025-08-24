# JavaScript Style Guide

## General Rules
- Use **ESNext** features when available, transpiled if needed.
- Prefer **TypeScript** for new codebases; `.ts` or `.tsx` files when possible.
- Indentation: **2 spaces**.
- Use **semicolons** at the end of every statement.
- Always use **const** for values that do not change, **let** otherwise. Avoid `var`.

## Naming Conventions
- Use `camelCase` for variables and functions.
- Use `PascalCase` for classes and React components.
- Constants (shared across files) may use `UPPER_CASE_WITH_UNDERSCORES`.
- File names should be **kebab-case**.

## Code Formatting
- **One statement per line**.
- Use **trailing commas** in multi-line objects/arrays.
- Keep line length ≤ 100 chars (soft limit).
- Prefer template literals (`` `...` ``) over string concatenation.

## Functions
- Prefer **arrow functions** for inline and callbacks.
- Use **named functions** when exporting for clarity.
- Functions should be small, single-responsibility. If >20 lines, consider refactor.

## Imports/Exports
- Use **ES modules** (`import/export`).
- Group imports: external libs, internal modules, styles.
- Use **absolute paths** if project supports it (`@/components/...`).
- Avoid default exports when possible; prefer named exports.

## Objects & Arrays
- Use **object destructuring** and **array destructuring**.
- When possible, prefer immutability (`map`, `filter`, `spread`) instead of mutation.

## Error Handling
- Always use `try/catch` for async/await.
- Wrap fetch/HTTP requests with clear error messages.
- Log errors with context.

## Comments & Documentation
- Use **JSDoc/TSDoc** for public functions, classes, and complex logic.
- Prefer self-explanatory code over comments.

## Example

```javascript
// utils/math-ops.js
export const add = (a, b) => {
  if (typeof a !== "number" || typeof b !== "number") {
    throw new TypeError("add: both arguments must be numbers");
  }
  return a + b;
};

// components/Button.tsx
import React from "react";

interface ButtonProps {
  label: string;
  onClick: () => void;
}

export const Button: React.FC<ButtonProps> = ({ label, onClick }) => {
  return (
    <button
      type="button"
      className="btn btn-primary"
      onClick={onClick}
    >
      {label}
    </button>
  );
};

