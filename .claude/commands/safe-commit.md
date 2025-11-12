# /safe-commit

Commit with full awareness of repository state.

Usage: /safe-commit "<commit message>"

## Safety checks:
1. Shows ALL modified, staged, and untracked files
2. Shows what WILL be committed vs what WON'T
3. Warns about files you might have forgotten
4. Creates commit with your message

---

Show complete repository status:
```bash
echo "📊 FULL REPOSITORY STATUS"
echo "========================="
echo ""

echo "📍 Current Branch: $(git branch --show-current)"
echo ""

echo "✅ STAGED (will be committed):"
git diff --cached --stat
if [ -z "$(git diff --cached --stat)" ]; then
    echo "  (none)"
fi
echo ""

echo "⚠️  MODIFIED (not staged, will NOT be committed):"
git diff --stat
if [ -z "$(git diff --stat)" ]; then
    echo "  (none)"
fi
echo ""

echo "❓ UNTRACKED (will NOT be committed):"
git ls-files --others --exclude-standard
if [ -z "$(git ls-files --others --exclude-standard)" ]; then
    echo "  (none)"
fi
echo ""
```

Confirm scope:
```bash
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "About to commit with message:"
echo "  \"$ARGUMENTS\""
echo ""

MODIFIED_COUNT=$(git diff --name-only | wc -l)
if [ "$MODIFIED_COUNT" -gt 0 ]; then
    echo "⚠️  WARNING: $MODIFIED_COUNT modified files are NOT staged"
    echo "   These will NOT be included in the commit"
fi
```

Create the commit:
```bash
git commit -m "$ARGUMENTS"
echo ""
echo "✅ Commit created successfully"
git log -1 --oneline
```
