# GitHub Pull Request Guide

## What Is Pull Request?

A Pull Request (PR) is a request to merge code from one branch into another branch.

Usually:

```txt
feature branch → develop
```

---

# Professional PR Workflow

```txt
Create Branch
   ↓
Write Code
   ↓
Commit Changes
   ↓
Push Branch
   ↓
Create Pull Request
   ↓
Code Review
   ↓
Merge
```

---

# Step 1: Create Branch

```bash
git checkout -b feature/logger
```

---

# Step 2: Commit Code

```bash
git add .

git commit -m "feat(logger): add winston logging system"
```

---

# Step 3: Push Branch

```bash
git push origin feature/logger
```

---

# Step 4: Open GitHub

Go to repository.

GitHub will show:

```txt
Compare & pull request
```

Click it.

---

# Step 5: Create Pull Request

## Base Branch

```txt
develop
```

---

## Compare Branch

```txt
feature/logger
```

---

# PR Title Example

```txt
feat(logger): add professional winston logging system
```

---

# PR Description Example

```txt
## Changes

- Added Winston logger
- Added Morgan middleware
- Added request tracking
- Added error logging
- Added log rotation

## Tested

- npm run dev
- API requests
- Error handling
```

---

# Step 6: Code Review

Team members review:

- Code quality
- Bugs
- Architecture
- Performance

---

# Step 7: Merge Pull Request

Click:

```txt
Merge Pull Request
```

---

# Step 8: Delete Branch

After merge:

```txt
Delete Branch
```

Or terminal:

```bash
git branch -d feature/logger
```

---

# Best Practices

## ✅ DO

- Keep PR small
- Write clear title
- Add description
- Test code before PR
- Pull latest develop

---

## ❌ DON'T

- Don't push broken code
- Don't create huge PRs
- Don't skip testing
- Don't merge without review
