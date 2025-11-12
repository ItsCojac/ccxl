# /git-safety-status

Comprehensive git status check before operations.

Shows everything you need to know before any git operation.

---

```bash
echo "🔍 COMPREHENSIVE GIT STATUS"
echo "=============================="
echo ""

echo "📍 Current Branch:"
git branch --show-current
echo ""

echo "📊 Working Directory Status:"
git status --short
echo ""

echo "💾 Stashed Changes:"
git stash list
if [ -z "$(git stash list)" ]; then
    echo "  (none)"
fi
echo ""

echo "🌿 Recent Branches:"
git branch --sort=-committerdate | head -5
echo ""

echo "🔄 Unpushed Commits:"
git log @{u}.. --oneline 2>/dev/null || echo "  (Branch not tracking remote)"
echo ""

echo "⚠️  SAFETY WARNINGS:"
echo "━━━━━━━━━━━━━━━━━━"

# Check for many uncommitted changes
CHANGED_FILES=$(git diff --name-only | wc -l)
STAGED_FILES=$(git diff --cached --name-only | wc -l)
if [ "$CHANGED_FILES" -gt 10 ] || [ "$STAGED_FILES" -gt 10 ]; then
    echo "  ⚠️  Large number of changes ($CHANGED_FILES modified, $STAGED_FILES staged)"
fi

# Check for untracked files
UNTRACKED=$(git ls-files --others --exclude-standard | wc -l)
if [ "$UNTRACKED" -gt 0 ]; then
    echo "  ⚠️  $UNTRACKED untracked files"
fi

# Check if behind remote
git fetch --quiet 2>/dev/null
BEHIND=$(git rev-list --count HEAD..@{u} 2>/dev/null || echo "0")
if [ "$BEHIND" -gt 0 ]; then
    echo "  ⚠️  $BEHIND commits behind remote"
fi

# Check if ahead of remote
AHEAD=$(git rev-list --count @{u}..HEAD 2>/dev/null || echo "0")
if [ "$AHEAD" -gt 0 ]; then
    echo "  ℹ️  $AHEAD unpushed commits"
fi

if [ "$CHANGED_FILES" -eq 0 ] && [ "$STAGED_FILES" -eq 0 ] && [ "$UNTRACKED" -eq 0 ]; then
    echo "  ✅ Working directory clean"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━"
echo "Ready for git operations"
```
