# Lessons

- When a user refers to "the worktree" in this repository, check for nested Git worktrees under `.worktrees/` before concluding the root checkout is the only relevant codebase.
- When `.worktrees/` is gitignored, treat nested worktrees as potentially active implementation branches even if they do not appear in the root `git diff` or `git status`.
