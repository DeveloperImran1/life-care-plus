# GIT_COMMANDS.md

# Git Commands Guide

A complete Git commands reference guide with practical explanations and real-world examples.

---

# Why Learn Git Commands?

Git commands help developers:

- Track project changes
- Collaborate safely in teams
- Manage branches professionally
- Prevent code loss
- Maintain project history
- Work efficiently in production projects

---

# Initialize Git Repository

If your project does not have Git initialized:

```bash
git init
```

## Example

```bash
mkdir my-project

cd my-project

git init
```

This creates a `.git` folder.

---

# Clone Repository

Clone an existing GitHub repository.

```bash
git clone repository-url
```

## Example

```bash
git clone https://github.com/mehedi/life-care-plus.git
```

---

# Check Current Branch

```bash
git branch
```

## Example Output

```txt
* develop
  main
```

`*` means your current branch.

---

# Show All Branches

```bash
git branch -a
```

## Example Output

```txt
* develop
  feature/logger
  main
  remotes/origin/main
  remotes/origin/develop
```

Shows:

- Local branches
- Remote branches

---

# Create New Branch

## Feature Branch

```bash
git checkout -b feature/logger
```

## Example

```bash
git checkout -b feature/auth-system
```

Creates and switches to the branch.

---

# Switch Branch

```bash
git checkout develop
```

## Example

```bash
git checkout main
```

Switches current branch.

---

# Check Changed Files

```bash
git status
```

## Example Output

```txt
modified: src/app.ts
new file: logger.ts
```

Useful before commit.

---

# Add All Files

```bash
git add .
```

Stages all changed files.

---

# Add Specific File

```bash
git add src/app.ts
```

## Example

```bash
git add package.json
```

Stages only selected file.

---

# Commit Changes

```bash
git commit -m "feat(logger): add winston logger"
```

---

# Professional Commit Structure

```txt
type(scope): short description
```

---

# Common Commit Types

| Type     | Purpose          |
| -------- | ---------------- |
| feat     | New feature      |
| fix      | Bug fix          |
| docs     | Documentation    |
| refactor | Code improvement |
| chore    | Maintenance      |
| test     | Testing          |
| style    | Formatting       |
| perf     | Performance      |

---

# Commit Examples

## Feature

```bash
git commit -m "feat(auth): add JWT authentication"
```

---

## Fix

```bash
git commit -m "fix(prisma): handle P2025 error"
```

---

## Refactor

```bash
git commit -m "refactor(logger): improve logging architecture"
```

---

## Documentation

```bash
git commit -m "docs(git): add git workflow guide"
```

---

# Bad Commit Examples ❌

```bash
git commit -m "update"
```

```bash
git commit -m "done"
```

These are not professional.

---

# Push Branch

```bash
git push origin feature/logger
```

## Example

```bash
git push origin feature/docker-setup
```

Uploads branch to GitHub.

---

# Pull Latest Code

```bash
git pull origin develop
```

## Example

```bash
git pull origin main
```

Downloads latest code.

---

# Fetch Latest Changes

```bash
git fetch
```

Fetches changes without merging.

---

# Merge Branch

```bash
git merge feature/logger
```

## Example Workflow

```bash
git checkout develop

git pull origin develop

git merge feature/logger
```

---

# Delete Local Branch

```bash
git branch -d feature/logger
```

Deletes local branch after merge.

---

# Delete Remote Branch

```bash
git push origin --delete feature/logger
```

Deletes GitHub branch.

---

# See Commit History

```bash
git log --oneline
```

## Example Output

```txt
8f3a123 feat(auth): add JWT authentication
1b2d333 fix(api): resolve validation issue
```

---

# Detailed Commit History

```bash
git log
```

Shows full commit details.

---

# Undo Last Commit (Keep Changes)

```bash
git reset --soft HEAD~1
```

Useful if commit message is wrong.

---

# Undo Last Commit Completely

```bash
git reset --hard HEAD~1
```

⚠️ Deletes commit and changes.

---

# Restore File

```bash
git checkout -- file-name
```

## Example

```bash
git checkout -- src/app.ts
```

Restores file to previous state.

---

# See Remote Repository

```bash
git remote -v
```

## Example Output

```txt
origin https://github.com/mehedi/project.git
```

---

# Add Remote Repository

```bash
git remote add origin repository-url
```

## Example

```bash
git remote add origin https://github.com/mehedi/project.git
```

---

# Rename Branch

```bash
git branch -m old-name new-name
```

## Example

```bash
git branch -m feature/test feature/logger
```

---

# Stash Changes

Temporarily save changes.

```bash
git stash
```

---

# Restore Stash

```bash
git stash pop
```

---

# See Stash List

```bash
git stash list
```

---

# Rebase Branch

```bash
git rebase develop
```

Used for cleaner commit history.

---

# Cherry Pick Commit

```bash
git cherry-pick commit-id
```

Copies a specific commit.

---

# Merge Conflict Example

## Conflict Message

```txt
CONFLICT (content): Merge conflict in app.ts
```

---

# Conflict Code Example

```txt
<<<<<<< HEAD
Old Code
=======
New Code
>>>>>>> feature/logger
```

---

# Resolve Conflict

1. Open file
2. Keep correct code
3. Remove conflict markers
4. Add file again

```bash
git add .
```

5. Commit changes

```bash
git commit -m "fix: resolve merge conflict"
```

---

# Real Project Workflow Example

## Step 1: Pull Latest Code

```bash
git checkout develop

git pull origin develop
```

---

## Step 2: Create Feature Branch

```bash
git checkout -b feature/logger
```

---

## Step 3: Work On Project

```bash
git status
```

---

## Step 4: Add Files

```bash
git add .
```

---

## Step 5: Commit

```bash
git commit -m "feat(logger): add winston logging setup"
```

---

## Step 6: Push Branch

```bash
git push origin feature/logger
```

---

## Step 7: Merge Into develop

```bash
git checkout develop

git pull origin develop

git merge feature/logger

git push origin develop
```

---

# Professional Daily Workflow

```txt
1. Pull latest develop
2. Create new branch
3. Write code
4. Add files
5. Commit properly
6. Push branch
7. Merge into develop
8. Test everything
9. Merge into main
```

---

# Recommended Branch Naming

## Feature

```txt
feature/logger
feature/payment-system
feature/docker-setup
```

---

## Fix

```txt
fix/login-error
fix/docker-network
```

---

## Hotfix

```txt
hotfix/production-crash
```

---

# Recommended .gitignore

```txt
node_modules
.env
dist
logs
*.log
```

---

# Most Important Commands Summary

| Command      | Purpose              |
| ------------ | -------------------- |
| git status   | Check changed files  |
| git add .    | Stage files          |
| git commit   | Save changes         |
| git push     | Upload code          |
| git pull     | Download latest code |
| git branch   | See branches         |
| git checkout | Switch branch        |
| git merge    | Merge branches       |
| git log      | See commit history   |

---

# Final Notes

- Always pull latest code before work
- Never work directly on `main`
- Write professional commit messages
- Push code regularly
- Keep commits small and clean
- Use separate branches for every feature
- Resolve conflicts carefully
- Maintain clean Git history

---

# Final Recommended Workflow

```txt
develop
   ↓
feature/*
   ↓
commit
   ↓
push
   ↓
merge develop
   ↓
test
   ↓
main
```
