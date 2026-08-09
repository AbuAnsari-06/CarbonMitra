# Contributing to CarbonMitra

Thank you for contributing to CarbonMitra! We welcome contributions to help scale dMRV and climate finance for smallholder farmers.

---

## 📋 Code of Conduct

Maintain an inclusive, safe, and collaborative environment. Treat all team members and contributors with respect.

---

## 🛠️ Development Conventions

### TypeScript & Strict Mode
- All code must pass TypeScript compilation under `"strict": true`.
- Avoid using `any` types. Declare explicit interfaces in `/src/types.ts` or corresponding service files.
- Place all imports at the top of the file.

### Backend Architecture
- Express API endpoints in `server.ts` or `/functions/src/routes`.
- Services must be encapsulated inside `/functions/src/services` (backend) or `/src/services` (frontend).
- Always return standard error envelopes via `AppError` and `globalErrorHandler`.
- Never expose private keys or secret API tokens to the client browser.

### Frontend Component Design
- Follow single-responsibility principles for React components.
- Use Tailwind CSS utility classes for styling.
- All icons must be imported from `lucide-react`.

---

## 💬 Commit Message Guidelines

We follow Conventional Commits standard:

```
<type>(<scope>): <short description>
```

### Supported Types
- `feat`: A new user-facing feature or API endpoint
- `fix`: A bug fix or error correction
- `refactor`: Code reorganization or optimization without changing functionality
- `docs`: Documentation updates (`README.md`, comments, specifications)
- `style`: Formatting, missing semi-colons, whitespace adjustments
- `test`: Adding or modifying automated test suites
- `chore`: Updating dependencies, build scripts, or repository configuration

### Examples
- `feat(services): add landService and creditService API modules`
- `fix(blockchain): wrap token transfer call with atomic nonce manager`
- `refactor(functions): reorganize functions/src into config, services, and middleware`
- `docs(readme): add architecture diagram and setup instructions`

---

## 🧪 Verification Before Submitting PRs

Run all checks prior to creating a pull request:
```bash
# Run Linter & Type Check
npm run lint

# Verify Production Build
npm run build
```
