# /safe-switch

Switch branches safely with automatic stashing.

Usage: /safe-switch <branch-name>

## What this command does:
1. Shows current uncommitted changes
2. Automatically stashes them with descriptive message
3. Switches to target branch
4. Confirms switch and shows stash info for recovery

---

Check current status:
```bash
echo "📊 Current Branch: $(git branch --show-current)"
echo ""
echo "Uncommitted changes:"
git status --short
echo ""
```

Stash changes if they exist:
```bash
if ! git diff-index --quiet HEAD --; then
    CURRENT_BRANCH=$(git branch --show-current)
    git stash push -m "Auto-stash from $CURRENT_BRANCH before switching to $ARGUMENTS"
    echo "💾 Changes stashed"
else
    echo "✅ No changes to stash"
fi
```

Switch to target branch:
```bash
git checkout "$ARGUMENTS"
```

Confirm and show recovery info:
```bash
echo ""
echo "✅ Switched to: $(git branch --show-current)"
echo ""
echo "To recover your stashed work:"
git stash list | head -1
echo "Run: git stash pop"
```
