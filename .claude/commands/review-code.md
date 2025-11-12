# /review-code

Comprehensive code review for security and quality.

Usage: /review-code <file-or-directory>

Reviews code for common issues, security vulnerabilities, and quality concerns.

---

Validate target:
```bash
if [ -z "$ARGUMENTS" ]; then
    echo "❌ Error: File or directory path required"
    echo "Usage: /review-code <file-or-directory>"
    exit 1
fi

TARGET="$ARGUMENTS"

if [ ! -e "$TARGET" ]; then
    echo "❌ Error: Path not found: $TARGET"
    exit 1
fi

echo "🔍 Code Review"
echo "━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
```

Gather files to review:
```bash
if [ -f "$TARGET" ]; then
    FILES="$TARGET"
    echo "Reviewing file: $TARGET"
else
    echo "Reviewing directory: $TARGET"
    FILES=$(find "$TARGET" -type f \( -name "*.js" -o -name "*.ts" -o -name "*.jsx" -o -name "*.tsx" -o -name "*.py" -o -name "*.go" \) 2>/dev/null)
    FILE_COUNT=$(echo "$FILES" | wc -l | tr -d ' ')
    echo "Found $FILE_COUNT code files"
fi
echo ""
```

Security scan:
```bash
echo "🔒 Security Scan:"
echo ""

SECURITY_ISSUES=0

for file in $FILES; do
    if [ ! -f "$file" ]; then
        continue
    fi

    # SQL injection check
    if grep -nE "(SELECT|INSERT|UPDATE|DELETE).*\+.*\$|\+.*\(|exec\(.*SELECT" "$file" 2>/dev/null | head -3; then
        echo "  ⚠️  Possible SQL injection in $file"
        SECURITY_ISSUES=$((SECURITY_ISSUES + 1))
    fi

    # Hardcoded credentials
    if grep -niE "(password|api[_-]?key|secret|token)\s*=\s*['\"].{8,}" "$file" 2>/dev/null | head -3; then
        echo "  🚫 Possible hardcoded credentials in $file"
        SECURITY_ISSUES=$((SECURITY_ISSUES + 1))
    fi

    # eval/exec usage
    if grep -nE "\beval\s*\(|\bexec\s*\(" "$file" 2>/dev/null | head -3; then
        echo "  ⚠️  eval()/exec() usage in $file"
        SECURITY_ISSUES=$((SECURITY_ISSUES + 1))
    fi

    # XSS risks
    if grep -nE "innerHTML\s*=|dangerouslySetInnerHTML" "$file" 2>/dev/null | head -3; then
        echo "  ⚠️  XSS risk in $file"
        SECURITY_ISSUES=$((SECURITY_ISSUES + 1))
    fi
done

if [ $SECURITY_ISSUES -eq 0 ]; then
    echo "  ✅ No security issues detected"
fi
echo ""
```

Code quality checks:
```bash
echo "📊 Code Quality:"
echo ""

for file in $FILES; do
    if [ ! -f "$file" ]; then
        continue
    fi

    FILENAME=$(basename "$file")

    # Check file length
    LINE_COUNT=$(wc -l < "$file" | tr -d ' ')
    if [ $LINE_COUNT -gt 500 ]; then
        echo "  ⚠️  $FILENAME: Large file ($LINE_COUNT lines) - consider splitting"
    fi

    # Check for console.log
    CONSOLE_COUNT=$(grep -c "console\.log" "$file" 2>/dev/null || echo "0")
    if [ $CONSOLE_COUNT -gt 0 ]; then
        echo "  📝 $FILENAME: $CONSOLE_COUNT console.log statements - remove before production"
    fi

    # Check for TODO/FIXME
    TODO_COUNT=$(grep -c "TODO\|FIXME" "$file" 2>/dev/null || echo "0")
    if [ $TODO_COUNT -gt 0 ]; then
        echo "  📌 $FILENAME: $TODO_COUNT TODO/FIXME comments"
    fi
done
echo ""
```

Show review summary:
```bash
echo "━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 Review Checklist:"
echo ""
echo "Security:"
echo "  • [ ] No SQL injection vulnerabilities"
echo "  • [ ] No hardcoded credentials"
echo "  • [ ] No unsafe eval/exec usage"
echo "  • [ ] No XSS vulnerabilities"
echo "  • [ ] Input validation present"
echo ""
echo "Code Quality:"
echo "  • [ ] Functions are focused and small"
echo "  • [ ] Variables have descriptive names"
echo "  • [ ] Error handling is comprehensive"
echo "  • [ ] Comments explain why, not what"
echo "  • [ ] No debug code left in"
echo ""
echo "Testing:"
echo "  • [ ] Critical paths have tests"
echo "  • [ ] Edge cases are covered"
echo "  • [ ] Mocks are used appropriately"
echo ""
echo "Performance:"
echo "  • [ ] No unnecessary re-renders"
echo "  • [ ] Database queries are optimized"
echo "  • [ ] No memory leaks"
echo ""
echo "✨ Review complete - address any issues found above"
```
