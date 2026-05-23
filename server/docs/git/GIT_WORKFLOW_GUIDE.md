# Git & GitHub Workflow Guide

A detailed professional Git and GitHub workflow guide for real team projects.

This guide explains how to work with branches, commits, pull, push, merge, pull requests, and merge conflicts in a clean and professional way.

---

## Table of Contents

1. [Why Git Workflow Is Important](#why-git-workflow-is-important)
2. [Recommended Branch Structure](#recommended-branch-structure)
3. [Branch Purpose](#branch-purpose)
4. [Branch Naming Convention](#branch-naming-convention)
5. [Daily Git Workflow](#daily-git-workflow)
6. [Feature Development Workflow](#feature-development-workflow)
7. [Bug Fix Workflow](#bug-fix-workflow)
8. [Hotfix Workflow](#hotfix-workflow)
9. [Commit Message Rules](#commit-message-rules)
10. [Push Workflow](#push-workflow)
11. [Pull Workflow](#pull-workflow)
12. [Merge Workflow](#merge-workflow)
13. [GitHub Pull Request Workflow](#github-pull-request-workflow)
14. [Merge Conflict Handling](#merge-conflict-handling)
15. [Delete Branch After Merge](#delete-branch-after-merge)
16. [Common Git Commands](#common-git-commands)
17. [Real Project Examples](#real-project-examples)
18. [Best Practices](#best-practices)
19. [Things You Should Avoid](#things-you-should-avoid)
20. [Recommended Final Workflow](#recommended-final-workflow)

---

## Why Git Workflow Is Important

A proper Git workflow helps developers work safely and professionally.

It helps you:

- Keep code organized
- Avoid breaking production code
- Track every change clearly
- Work with multiple developers safely
- Review code before merging
- Fix bugs without affecting main code
- Maintain clean project history
- Understand who changed what and why
- Roll back changes when something goes wrong

Without a good workflow, a project can become messy very quickly.

Example problem without workflow:

```txt
Developer 1 works directly on main
Developer 2 also works directly on main
Both push different changes
Production code breaks
Nobody knows which commit caused the issue
```

Professional solution:

```txt
main
develop
feature branch
pull request
review
merge
test
release
```

---

## Recommended Branch Structure

For most professional projects, this structure is clean and easy to maintain:

```txt
main
│
├── develop
│
├── feature/logger
├── feature/auth-system
├── feature/payment-system
├── feature/user-dashboard
│
├── fix/login-validation
├── fix/docker-compose-issue
├── fix/prisma-error-handling
│
└── hotfix/production-server-crash
```

---

## Branch Purpose

| Branch | Purpose |
|---|---|
| `main` | Production-ready stable code |
| `develop` | Main development branch |
| `feature/*` | New feature development |
| `fix/*` | Normal bug fixing |
| `hotfix/*` | Emergency production bug fixing |
| `docs/*` | Documentation related work |
| `refactor/*` | Code improvement without changing behavior |
| `test/*` | Testing related work |
| `chore/*` | Maintenance work |

---

## Branch Naming Convention

Branch names should be short, meaningful, and lowercase.

Use this format:

```txt
type/short-description
```

---

### Feature Branch Examples

Use `feature/*` when adding something new.

```txt
feature/logger
feature/auth-system
feature/payment-system
feature/admin-dashboard
feature/docker-setup
feature/user-profile
feature/appointment-booking
```

Example command:

```bash
git checkout -b feature/logger
```

---

### Fix Branch Examples

Use `fix/*` when fixing normal bugs.

```txt
fix/login-validation
fix/prisma-p2025-error
fix/docker-network-issue
fix/user-role-check
fix/api-response-format
```

Example command:

```bash
git checkout -b fix/prisma-p2025-error
```

---

### Hotfix Branch Examples

Use `hotfix/*` only for urgent production issues.

```txt
hotfix/server-crash
hotfix/payment-failed
hotfix/security-issue
hotfix/database-connection-error
```

Example command:

```bash
git checkout -b hotfix/server-crash
```

---

### Docs Branch Examples

Use `docs/*` when writing or updating documentation.

```txt
docs/git-workflow-guide
docs/api-documentation
docs/logger-usage-guide
docs/docker-setup-guide
```

Example command:

```bash
git checkout -b docs/git-workflow-guide
```

---

### Refactor Branch Examples

Use `refactor/*` when improving code structure without adding new features.

```txt
refactor/logger-architecture
refactor/auth-service
refactor/error-handler
refactor/project-structure
```

Example command:

```bash
git checkout -b refactor/logger-architecture
```

---

## Daily Git Workflow

Before starting work every day, always update your local branch.

```bash
git checkout develop
git pull origin develop
```

Then create a new branch for your task.

```bash
git checkout -b feature/logger
```

After work:

```bash
git status
git add .
git commit -m "feat(logger): add winston logger setup"
git push origin feature/logger
```

Then create a Pull Request on GitHub.

---

## Feature Development Workflow

Use this workflow when adding a new feature.

Example: You want to add Winston logger to your backend.

### Step 1: Go to develop branch

```bash
git checkout develop
```

### Step 2: Pull latest code

```bash
git pull origin develop
```

### Step 3: Create feature branch

```bash
git checkout -b feature/logger
```

### Step 4: Write your code

Example changes:

```txt
server/src/app/utils/logger.ts
server/docs/logging/LOGGER_USAGE_GUIDE.md
server/src/app/middlewares/globalErrorHandler.ts
```

### Step 5: Check changed files

```bash
git status
```

Example output:

```txt
modified:   server/src/app/middlewares/globalErrorHandler.ts
new file:   server/src/app/utils/logger.ts
new file:   server/docs/logging/LOGGER_USAGE_GUIDE.md
```

### Step 6: Add files

Add all files:

```bash
git add .
```

Or add specific files:

```bash
git add server/src/app/utils/logger.ts
git add server/docs/logging/LOGGER_USAGE_GUIDE.md
```

### Step 7: Commit changes

```bash
git commit -m "feat(logger): add winston logging system"
```

### Step 8: Push branch to GitHub

```bash
git push origin feature/logger
```

### Step 9: Create Pull Request

On GitHub:

```txt
feature/logger → develop
```

### Step 10: Merge after review

After review and testing, merge the PR into `develop`.

---

## Bug Fix Workflow

Use this workflow when fixing a normal bug.

Example: Prisma `P2025` error is not handled properly.

### Step 1: Start from develop

```bash
git checkout develop
git pull origin develop
```

### Step 2: Create fix branch

```bash
git checkout -b fix/prisma-p2025-error
```

### Step 3: Fix the issue

Example file:

```txt
server/src/app/errors/handlePrismaError.ts
```

### Step 4: Check status

```bash
git status
```

### Step 5: Add and commit

```bash
git add .
git commit -m "fix(prisma): handle P2025 record not found error"
```

### Step 6: Push branch

```bash
git push origin fix/prisma-p2025-error
```

### Step 7: Create PR

```txt
fix/prisma-p2025-error → develop
```

---

## Hotfix Workflow

Use hotfix when production has an urgent issue.

Example: Production server is crashing.

### Step 1: Start from main

For hotfix, start from `main` because the issue is in production.

```bash
git checkout main
git pull origin main
```

### Step 2: Create hotfix branch

```bash
git checkout -b hotfix/server-crash
```

### Step 3: Fix the issue

Make the required code changes.

### Step 4: Commit

```bash
git add .
git commit -m "hotfix(server): prevent production crash on invalid request"
```

### Step 5: Push

```bash
git push origin hotfix/server-crash
```

### Step 6: Merge into main

Create PR:

```txt
hotfix/server-crash → main
```

### Step 7: Also merge main into develop

After hotfix is merged into `main`, update `develop` too.

```bash
git checkout develop
git pull origin develop
git merge main
git push origin develop
```

This keeps `develop` updated with the production fix.

---

## Commit Message Rules

A professional commit message should explain what changed.

Use this structure:

```txt
type(scope): short description
```

Example:

```bash
git commit -m "feat(auth): add JWT login system"
```

---

## Commit Types

| Type | Meaning | Example |
|---|---|---|
| `feat` | New feature | `feat(auth): add login API` |
| `fix` | Bug fix | `fix(user): resolve validation issue` |
| `docs` | Documentation | `docs(git): add workflow guide` |
| `refactor` | Code improvement | `refactor(logger): improve logger structure` |
| `style` | Formatting only | `style(ui): format dashboard layout` |
| `test` | Test related | `test(auth): add login unit tests` |
| `chore` | Maintenance | `chore(deps): update dependencies` |
| `perf` | Performance | `perf(api): optimize query performance` |
| `build` | Build system | `build(docker): update backend Dockerfile` |
| `ci` | CI/CD config | `ci(github): add deploy workflow` |
| `hotfix` | Urgent production fix | `hotfix(server): fix production crash` |

---

## Good Commit Examples

### Logger

```bash
git commit -m "feat(logger): add winston logging system"
```

```bash
git commit -m "docs(logger): add logger usage guide"
```

```bash
git commit -m "refactor(logger): move logging docs into server docs"
```

---

### Authentication

```bash
git commit -m "feat(auth): add JWT access and refresh token"
```

```bash
git commit -m "fix(auth): resolve invalid refresh token issue"
```

```bash
git commit -m "refactor(auth): separate auth service logic"
```

---

### Prisma

```bash
git commit -m "fix(prisma): handle P2025 record not found error"
```

```bash
git commit -m "feat(prisma): add appointment relation schema"
```

```bash
git commit -m "chore(prisma): run database migration"
```

---

### Docker

```bash
git commit -m "feat(docker): add postgres and backend compose setup"
```

```bash
git commit -m "fix(docker): resolve missing postgres volume issue"
```

```bash
git commit -m "docs(docker): add local setup instructions"
```

---

### Documentation

```bash
git commit -m "docs(git): add GitHub workflow guide"
```

```bash
git commit -m "docs(api): update authentication endpoint docs"
```

---

## Bad Commit Examples

Avoid unclear commit messages.

```bash
git commit -m "update"
```

```bash
git commit -m "fix"
```

```bash
git commit -m "done"
```

```bash
git commit -m "final"
```

```bash
git commit -m "change something"
```

These are bad because they do not explain what changed.

---

## Push Workflow

After committing, push your branch to GitHub.

```bash
git push origin branch-name
```

Example:

```bash
git push origin feature/logger
```

If this is your first push for a new branch, you can also use:

```bash
git push -u origin feature/logger
```

After using `-u`, next time you can simply use:

```bash
git push
```

---

## Pull Workflow

Use pull to get latest code from GitHub.

```bash
git pull origin develop
```

Example daily pull:

```bash
git checkout develop
git pull origin develop
```

If you are working on a feature branch and want latest develop changes:

```bash
git checkout feature/logger
git pull origin develop
```

This brings latest `develop` code into your current branch.

---

## Merge Workflow

Merge means combining one branch into another.

Example:

```txt
feature/logger → develop
```

### Step 1: Go to develop

```bash
git checkout develop
```

### Step 2: Pull latest develop

```bash
git pull origin develop
```

### Step 3: Merge feature branch

```bash
git merge feature/logger
```

### Step 4: Push develop

```bash
git push origin develop
```

Full command flow:

```bash
git checkout develop
git pull origin develop
git merge feature/logger
git push origin develop
```

---

## GitHub Pull Request Workflow

Professional teams usually do not merge directly from terminal.

They use Pull Requests.

### Pull Request Flow

```txt
feature/logger
   ↓
push to GitHub
   ↓
create pull request
   ↓
code review
   ↓
merge into develop
```

### PR Source and Target

| Work Type | Source Branch | Target Branch |
|---|---|---|
| New feature | `feature/*` | `develop` |
| Bug fix | `fix/*` | `develop` |
| Documentation | `docs/*` | `develop` |
| Refactor | `refactor/*` | `develop` |
| Hotfix | `hotfix/*` | `main` |
| Release | `develop` | `main` |

---

## Pull Request Title Examples

```txt
feat(logger): add winston logging system
```

```txt
fix(prisma): handle P2025 error properly
```

```txt
docs(git): add Git workflow guide
```

```txt
refactor(auth): improve token validation flow
```

---

## Pull Request Description Template

Use this template in GitHub PR description:

```md
## Summary

- Added Winston logger setup
- Added request and error logging
- Added logger usage documentation

## Changes

- Created logger utility
- Updated global error handler
- Added logging docs inside server/docs/logging

## Testing

- Tested API error response
- Checked logs in development
- Verified server starts successfully

## Related Branch

feature/logger
```

---

## Merge Conflict Handling

A merge conflict happens when Git cannot automatically decide which code to keep.

Example conflict message:

```txt
CONFLICT (content): Merge conflict in server/src/app.ts
Automatic merge failed; fix conflicts and then commit the result.
```

---

### Conflict Marker Example

Inside the conflicted file, you may see:

```txt
<<<<<<< HEAD
console.log("Old code from develop");
=======
console.log("New code from feature branch");
>>>>>>> feature/logger
```

Meaning:

| Part | Meaning |
|---|---|
| `<<<<<<< HEAD` | Current branch code |
| `=======` | Separator |
| `>>>>>>> feature/logger` | Incoming branch code |

---

### How To Fix Conflict

1. Open the conflicted file
2. Decide which code should stay
3. Remove conflict markers
4. Save the file
5. Add the fixed file
6. Commit the merge

Example fixed code:

```ts
console.log("Final correct code");
```

Then run:

```bash
git add .
git commit -m "fix: resolve merge conflict"
```

---

## Real Merge Conflict Example

Suppose `develop` has:

```ts
const PORT = 5000;
```

Your branch has:

```ts
const PORT = process.env.PORT || 5000;
```

Git may show:

```ts
<<<<<<< HEAD
const PORT = 5000;
=======
const PORT = process.env.PORT || 5000;
>>>>>>> feature/env-config
```

You should keep the better version:

```ts
const PORT = process.env.PORT || 5000;
```

Then:

```bash
git add .
git commit -m "fix: resolve port config merge conflict"
```

---

## Delete Branch After Merge

After a branch is merged, delete it to keep the repository clean.

### Delete local branch

```bash
git branch -d feature/logger
```

If Git says the branch is not fully merged and you are sure you want to delete it:

```bash
git branch -D feature/logger
```

### Delete remote branch

```bash
git push origin --delete feature/logger
```

---

## Common Git Commands

### Check current branch

```bash
git branch
```

### See all local and remote branches

```bash
git branch -a
```

### Check changed files

```bash
git status
```

### Add all changed files

```bash
git add .
```

### Add specific file

```bash
git add server/src/app.ts
```

### Commit changes

```bash
git commit -m "feat(scope): message"
```

### Push branch

```bash
git push origin branch-name
```

### Pull latest code

```bash
git pull origin develop
```

### See commit history

```bash
git log --oneline
```

### See remote URL

```bash
git remote -v
```

### See last commit

```bash
git log -1 --oneline
```

### See difference before commit

```bash
git diff
```

### See staged difference

```bash
git diff --staged
```

---

## Undo Commands

Be careful with undo commands.

### Undo unstaged file changes

```bash
git checkout -- file-name
```

Example:

```bash
git checkout -- server/src/app.ts
```

### Unstage added files

```bash
git reset
```

### Undo last commit but keep changes

```bash
git reset --soft HEAD~1
```

Use this when commit message was wrong or you forgot to add something.

### Undo last commit and remove changes

```bash
git reset --hard HEAD~1
```

Be careful. This removes changes permanently from local working tree.

---

## Stash Workflow

Use stash when you have unfinished work but need to switch branches.

### Save current changes temporarily

```bash
git stash
```

### See stash list

```bash
git stash list
```

### Bring back latest stash

```bash
git stash pop
```

Example use case:

```txt
You are working on feature/logger.
Suddenly you need to switch to develop.
Git does not allow because you have uncommitted changes.
Use git stash.
Switch branch.
Later come back and run git stash pop.
```

Commands:

```bash
git stash
git checkout develop
git pull origin develop
git checkout feature/logger
git stash pop
```

---

## Real Project Example 1: Add Logger Feature

Task: Add Winston logger in backend.

```bash
git checkout develop
git pull origin develop
git checkout -b feature/logger
```

After coding:

```bash
git status
git add .
git commit -m "feat(logger): add winston logging system"
git push origin feature/logger
```

Create PR:

```txt
feature/logger → develop
```

After merge:

```bash
git checkout develop
git pull origin develop
git branch -d feature/logger
```

---

## Real Project Example 2: Fix Prisma P2025 Error

Task: Handle Prisma `P2025` record not found error.

```bash
git checkout develop
git pull origin develop
git checkout -b fix/prisma-p2025-error
```

After fixing:

```bash
git add .
git commit -m "fix(prisma): handle P2025 record not found error"
git push origin fix/prisma-p2025-error
```

Create PR:

```txt
fix/prisma-p2025-error → develop
```

---

## Real Project Example 3: Add Git Documentation

Task: Add Git workflow documentation.

```bash
git checkout develop
git pull origin develop
git checkout -b docs/git-workflow-guide
```

Create file:

```txt
GIT_WORKFLOW_GUIDE.md
```

Commit:

```bash
git add GIT_WORKFLOW_GUIDE.md
git commit -m "docs(git): add detailed workflow guide"
git push origin docs/git-workflow-guide
```

Create PR:

```txt
docs/git-workflow-guide → develop
```

---

## Real Project Example 4: Docker Compose Fix

Task: Fix Docker Compose missing volume issue.

```bash
git checkout develop
git pull origin develop
git checkout -b fix/docker-compose-volume
```

After fixing `docker-compose.yml`:

```bash
git add docker-compose.yml
git commit -m "fix(docker): add missing postgres volume"
git push origin fix/docker-compose-volume
```

Create PR:

```txt
fix/docker-compose-volume → develop
```

---

## What To Do Before Every Commit

Before committing, check:

```bash
git status
```

Then review changes:

```bash
git diff
```

If everything is okay:

```bash
git add .
git commit -m "type(scope): message"
```

---

## What To Do Before Every Push

Before push, make sure:

1. Code runs locally
2. No unnecessary files are added
3. Commit message is meaningful
4. You are pushing the correct branch

Check current branch:

```bash
git branch
```

Push:

```bash
git push origin your-branch-name
```

---

## What To Do Before Merge

Before merging into `develop`:

1. Pull latest `develop`
2. Resolve conflicts if any
3. Run project locally
4. Test important features
5. Review changed files
6. Then merge or create PR

Commands:

```bash
git checkout develop
git pull origin develop
git merge feature/logger
git push origin develop
```

---

## Recommended `.gitignore`

For Node.js / Next.js / Prisma / Docker projects:

```gitignore
node_modules
.env
.env.local
.env.development
.env.production
dist
build
.next
coverage
logs
*.log
.DS_Store
.vscode
```

Important: Never commit `.env` files because they may contain secrets.

---

## Professional Team Workflow

Recommended team workflow:

```txt
main
 ↑
develop
 ↑
feature/* / fix/* / docs/* / refactor/*
```

Meaning:

1. Developers create separate branches from `develop`
2. Developers push their branches
3. They create Pull Requests into `develop`
4. Team reviews the code
5. Code is merged into `develop`
6. After testing, `develop` is merged into `main`

---

## Release Workflow

When development is complete and tested:

```bash
git checkout main
git pull origin main
git merge develop
git push origin main
```

Or create PR:

```txt
develop → main
```

This is safer for team projects.

---

## Best Practices

### DO

- Always pull latest code before starting work
- Create separate branch for each task
- Use meaningful branch names
- Write small commits
- Use professional commit messages
- Push your branch regularly
- Use Pull Requests for team projects
- Review code before merging
- Delete old branches after merge
- Keep `main` stable
- Keep `.env` files out of Git
- Test before pushing

---

## Things You Should Avoid

### DON'T

- Do not work directly on `main`
- Do not commit `.env`
- Do not use commit messages like `update`, `done`, `fix`
- Do not push broken code
- Do not ignore merge conflicts
- Do not mix many unrelated changes in one commit
- Do not create random branch names
- Do not delete branches before merge
- Do not force push on shared branches unless absolutely necessary
- Do not merge without testing

---

## Simple Workflow For Solo Developer

If you are working alone, still follow a clean workflow:

```bash
git checkout develop
git pull origin develop
git checkout -b feature/task-name
```

After work:

```bash
git add .
git commit -m "feat(scope): meaningful message"
git push origin feature/task-name
```

Then merge into develop:

```bash
git checkout develop
git pull origin develop
git merge feature/task-name
git push origin develop
```

Finally, when stable:

```bash
git checkout main
git pull origin main
git merge develop
git push origin main
```

---

## Simple Workflow For Team

For team projects, use Pull Requests:

```txt
develop
   ↓
create feature branch
   ↓
commit changes
   ↓
push branch
   ↓
create PR into develop
   ↓
review
   ↓
merge
   ↓
test develop
   ↓
merge develop into main
```

---

## Recommended Learning Order

Learn these commands in this order:

1. `git status`
2. `git add`
3. `git commit`
4. `git push`
5. `git pull`
6. `git branch`
7. `git checkout`
8. `git merge`
9. `git stash`
10. Pull Request workflow
11. Merge conflict handling

---

## Final Recommended Workflow

Use this workflow for most projects:

```txt
main
 ↑
develop
 ↑
feature/logger
```

Full command example:

```bash
git checkout develop
git pull origin develop
git checkout -b feature/logger

# write code

git status
git add .
git commit -m "feat(logger): add winston logging system"
git push origin feature/logger
```

Then GitHub PR:

```txt
feature/logger → develop
```

After testing:

```txt
develop → main
```

---

## Final Notes

Git is not only for saving code. It is a professional system for managing project history, collaboration, reviews, releases, and production safety.

A clean Git workflow makes you look professional as a developer and helps the team trust your work.
