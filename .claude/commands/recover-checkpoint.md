# /recover-checkpoint

Recover from a previous checkpoint.

Shows available checkpoints and helps restore saved state.

---

List available checkpoints:
```bash
echo "📍 Available Checkpoints:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# List checkpoint branches
echo "Checkpoint Branches:"
git branch | grep "checkpoint-" | sed 's/^[ *]*/  /'

echo ""

# List checkpoint context files
if [ -d ".claude/checkpoints" ]; then
    echo "Checkpoint Snapshots:"
    ls -1t .claude/checkpoints/ | head -10 | while read file; do
        echo "  $file"
        if [ -f ".claude/checkpoints/$file" ]; then
            head -2 ".claude/checkpoints/$file" | sed 's/^/    /'
        fi
        echo ""
    done
else
    echo "  No checkpoint snapshots found"
fi
```

Show recovery instructions:
```bash
echo "━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "To recover a checkpoint:"
echo ""
echo "1. View checkpoint details:"
echo "   cat .claude/checkpoints/checkpoint-<timestamp>.txt"
echo ""
echo "2. Switch to checkpoint branch:"
echo "   git checkout checkpoint-<branch>-<timestamp>"
echo ""
echo "3. Or cherry-pick specific commits:"
echo "   git cherry-pick <commit-hash>"
echo ""
echo "4. Recover stashed work:"
echo "   git stash list"
echo "   git stash pop stash@{0}"
```
