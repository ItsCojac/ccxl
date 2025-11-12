# /safe-reset

Safe alternative to `git reset --hard`.

Usage: /safe-reset [commit]

Automatically creates backup branch before resetting.

---

Create safety backup:
```bash
CURRENT_BRANCH=$(git branch --show-current)
BACKUP_BRANCH="backup-${CURRENT_BRANCH}-$(date +%Y%m%d-%H%M%S)"

git branch "$BACKUP_BRANCH"
echo "✅ Created backup branch: $BACKUP_BRANCH"
echo ""
```

Show what will be lost:
```bash
TARGET="${ARGUMENTS:-HEAD}"
echo "⚠️  Changes that will be DISCARDED:"
echo ""
git diff "$TARGET" --stat
echo ""
```

Confirm operation:
```bash
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "About to reset to: $TARGET"
echo "Backup available at: $BACKUP_BRANCH"
echo ""
echo "⚠️  This will discard all uncommitted changes"
echo "Type 'yes' to proceed:"
read -r CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo "❌ Reset cancelled"
    exit 0
fi
```

Perform the reset:
```bash
git reset --hard "$TARGET"
echo ""
echo "✅ Reset complete"
echo ""
echo "💾 To recover: git checkout $BACKUP_BRANCH"
```
