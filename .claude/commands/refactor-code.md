# /refactor-code

Safe code refactoring workflow.

Usage: /refactor-code <file-path> [reason]

Guides safe code improvements while preserving functionality.

---

Validate target:
```bash
if [ -z "$ARGUMENTS" ]; then
    echo "❌ Error: File path required"
    echo "Usage: /refactor-code <file-path> [reason]"
    exit 1
fi

FILE_PATH=$(echo "$ARGUMENTS" | awk '{print $1}')
REASON=$(echo "$ARGUMENTS" | cut -d' ' -f2-)

if [ ! -f "$FILE_PATH" ]; then
    echo "❌ Error: File not found: $FILE_PATH"
    exit 1
fi

echo "♻️  Code Refactoring Workflow"
echo "━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Target: $FILE_PATH"
if [ "$REASON" != "$FILE_PATH" ]; then
    echo "Reason: $REASON"
fi
echo ""
```

Analyze current code:
```bash
echo "📊 Current Code Analysis:"
echo ""

LINE_COUNT=$(wc -l < "$FILE_PATH" | tr -d ' ')
FUNC_COUNT=$(grep -c "function\|const.*=.*=>\\|class " "$FILE_PATH" 2>/dev/null || echo "0")
COMMENT_COUNT=$(grep -c "\/\/\|\/\*\|\*\/" "$FILE_PATH" 2>/dev/null || echo "0")

echo "Stats:"
echo "  • Lines: $LINE_COUNT"
echo "  • Functions/Classes: $FUNC_COUNT"
echo "  • Comments: $COMMENT_COUNT"
echo ""

# Complexity indicators
if [ $LINE_COUNT -gt 300 ]; then
    echo "⚠️  Large file - consider splitting into modules"
fi

if grep -q "TODO\|FIXME\|HACK" "$FILE_PATH"; then
    echo "📌 Contains TODO/FIXME markers:"
    grep -n "TODO\|FIXME\|HACK" "$FILE_PATH" | sed 's/^/  /'
    echo ""
fi

# Code smells
echo "🔍 Potential Issues:"
ISSUES_FOUND=0

if grep -q "console\.log" "$FILE_PATH"; then
    CONSOLE_COUNT=$(grep -c "console\.log" "$FILE_PATH")
    echo "  • $CONSOLE_COUNT console.log statements (remove or use proper logging)"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

if grep -q "any" "$FILE_PATH"; then
    ANY_COUNT=$(grep -c ": any" "$FILE_PATH" 2>/dev/null || echo "0")
    if [ $ANY_COUNT -gt 0 ]; then
        echo "  • $ANY_COUNT 'any' types (add proper typing)"
        ISSUES_FOUND=$((ISSUES_FOUND + 1))
    fi
fi

LONG_LINES=$(awk 'length > 120' "$FILE_PATH" | wc -l | tr -d ' ')
if [ $LONG_LINES -gt 0 ]; then
    echo "  • $LONG_LINES lines > 120 characters (improve readability)"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

if [ $ISSUES_FOUND -eq 0 ]; then
    echo "  ✅ No obvious issues detected"
fi
echo ""
```

Check for tests:
```bash
echo "🧪 Test Coverage:"
echo ""

FILENAME=$(basename "$FILE_PATH")
FILENAME_NO_EXT="${FILENAME%.*}"
EXTENSION="${FILENAME##*.}"

# Look for test file
TEST_FILE=""
TEST_PATTERNS=(
    "$(dirname "$FILE_PATH")/${FILENAME_NO_EXT}.test.${EXTENSION}"
    "$(dirname "$FILE_PATH")/${FILENAME_NO_EXT}.spec.${EXTENSION}"
    "tests/${FILENAME_NO_EXT}.test.${EXTENSION}"
    "__tests__/${FILENAME_NO_EXT}.test.${EXTENSION}"
)

for pattern in "${TEST_PATTERNS[@]}"; do
    if [ -f "$pattern" ]; then
        TEST_FILE="$pattern"
        break
    fi
done

if [ -n "$TEST_FILE" ]; then
    TEST_COUNT=$(grep -c "test(\\|it(\\|describe(" "$TEST_FILE" 2>/dev/null || echo "0")
    echo "  ✅ Test file found: $TEST_FILE"
    echo "  • Test count: $TEST_COUNT"
    echo ""
    echo "  ⚠️  IMPORTANT: Run tests before and after refactoring!"
else
    echo "  ⚠️  No test file found"
    echo "  • Consider writing tests before refactoring"
    echo ""
fi
```

Show refactoring checklist:
```bash
echo "━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "♻️  Safe Refactoring Checklist:"
echo ""
echo "## Before Refactoring:"
echo "   • [ ] Run all tests (ensure they pass)"
echo "   • [ ] Create backup or checkpoint: /checkpoint"
echo "   • [ ] Understand what the code does"
echo "   • [ ] Identify specific improvements needed"
echo ""
echo "## Common Refactoring Patterns:"
echo ""
echo "Extract Function:"
echo "   • Identify repeated code blocks"
echo "   • Extract to named function with clear purpose"
echo "   • Keep functions small and focused"
echo ""
echo "Improve Naming:"
echo "   • Replace vague names (data, tmp, x)"
echo "   • Use descriptive names (userData, tempValue, index)"
echo "   • Be consistent with project conventions"
echo ""
echo "Simplify Logic:"
echo "   • Replace nested ifs with early returns"
echo "   • Use clear boolean expressions"
echo "   • Extract complex conditions to named variables"
echo ""
echo "Type Safety:"
echo "   • Replace 'any' with specific types"
echo "   • Add type annotations for clarity"
echo "   • Use type guards for runtime checks"
echo ""
echo "Error Handling:"
echo "   • Add try/catch where needed"
echo "   • Validate inputs at boundaries"
echo "   • Provide meaningful error messages"
echo ""
echo "## After Refactoring:"
echo "   • [ ] Run all tests (ensure still passing)"
echo "   • [ ] Manual testing of affected features"
echo "   • [ ] Code review (or self-review)"
echo "   • [ ] Update documentation/comments"
echo "   • [ ] Run linter/formatter"
echo ""
echo "## Safety Rules:"
echo "   🚫 Don't change behavior, only structure"
echo "   🚫 Don't refactor and add features together"
echo "   ✅ Make small, incremental changes"
echo "   ✅ Test after each change"
echo "   ✅ Commit working states frequently"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✨ Ready to refactor safely!"
```
