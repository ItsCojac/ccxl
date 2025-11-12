# /plan-feature

Plan a new feature before implementation.

Usage: /plan-feature <feature-description>

Creates a structured plan including architecture, files to modify, and implementation steps.

---

Show feature context:
```bash
if [ -z "$ARGUMENTS" ]; then
    echo "❌ Error: Feature description required"
    echo "Usage: /plan-feature <feature-description>"
    exit 1
fi

echo "🎯 Feature Planning"
echo "━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Feature: $ARGUMENTS"
echo ""
```

Analyze current project structure:
```bash
echo "📊 Project Context:"
echo ""

# Show tech stack
if [ -f "package.json" ]; then
    echo "Language: JavaScript/TypeScript"

    # Detect frameworks
    FRAMEWORKS=""
    if grep -q "\"react\"" package.json; then
        FRAMEWORKS="$FRAMEWORKS React"
    fi
    if grep -q "\"next\"" package.json; then
        FRAMEWORKS="$FRAMEWORKS Next.js"
    fi
    if grep -q "\"vue\"" package.json; then
        FRAMEWORKS="$FRAMEWORKS Vue"
    fi
    if grep -q "\"express\"" package.json; then
        FRAMEWORKS="$FRAMEWORKS Express"
    fi

    if [ -n "$FRAMEWORKS" ]; then
        echo "Frameworks:$FRAMEWORKS"
    fi
fi

echo ""

# Show key directories
echo "Key Directories:"
for dir in src lib app pages components api routes services utils; do
    if [ -d "$dir" ]; then
        FILE_COUNT=$(find "$dir" -type f -name "*.js" -o -name "*.ts" -o -name "*.jsx" -o -name "*.tsx" 2>/dev/null | wc -l | tr -d ' ')
        echo "  • $dir/ ($FILE_COUNT files)"
    fi
done
echo ""
```

Show planning template:
```bash
echo "📋 Feature Planning Template:"
echo ""
echo "## 1. Goal & Requirements"
echo "   • What: [Feature description]"
echo "   • Why: [Business value]"
echo "   • Who: [Users affected]"
echo ""
echo "## 2. Technical Approach"
echo "   • Architecture: [How it fits in current system]"
echo "   • Dependencies: [New libraries needed]"
echo "   • Data model: [New schemas/types]"
echo ""
echo "## 3. Files to Create/Modify"
echo "   New files:"
echo "   • [ ] [file path] - [purpose]"
echo ""
echo "   Modified files:"
echo "   • [ ] [file path] - [changes needed]"
echo ""
echo "## 4. Implementation Steps"
echo "   • [ ] Step 1: [First task]"
echo "   • [ ] Step 2: [Next task]"
echo "   • [ ] Step 3: [Following task]"
echo ""
echo "## 5. Testing Strategy"
echo "   • [ ] Unit tests: [What to test]"
echo "   • [ ] Integration tests: [Workflows to verify]"
echo "   • [ ] Manual testing: [User scenarios]"
echo ""
echo "## 6. Risks & Considerations"
echo "   • Performance: [Any concerns]"
echo "   • Security: [Auth/validation needs]"
echo "   • Breaking changes: [Impact on existing code]"
echo ""
echo "## 7. Rollout Plan"
echo "   • Feature flag: [Yes/No]"
echo "   • Deployment: [Strategy]"
echo "   • Rollback: [How to undo if needed]"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✨ Fill in each section before starting implementation"
```
