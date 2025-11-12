# /checkpoint

Create a safety checkpoint before major operations.

Saves current state including git branch, uncommitted changes, and context snapshot.

---

Create git checkpoint branch:
```bash
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
CURRENT_BRANCH=$(git branch --show-current)
CHECKPOINT_BRANCH="checkpoint-${CURRENT_BRANCH}-${TIMESTAMP}"

git branch "$CHECKPOINT_BRANCH"
echo "📍 Checkpoint created: $CHECKPOINT_BRANCH"
```

Save context snapshot:
```bash
mkdir -p .claude/checkpoints

cat > .claude/checkpoints/checkpoint-${TIMESTAMP}.txt << EOF
Checkpoint: $(date)
Branch: $(git branch --show-current)
Last commit: $(git log -1 --oneline)

Uncommitted changes:
$(git status --short)

Recent commits:
$(git log -5 --oneline)

Stashes:
$(git stash list)
EOF

echo "💾 Context saved: .claude/checkpoints/checkpoint-${TIMESTAMP}.txt"
```

Show checkpoint info:
```bash
echo ""
echo "✅ Checkpoint complete"
echo ""
echo "To recover this state:"
echo "  git checkout $CHECKPOINT_BRANCH"
echo ""
echo "To view context:"
echo "  cat .claude/checkpoints/checkpoint-${TIMESTAMP}.txt"
```
