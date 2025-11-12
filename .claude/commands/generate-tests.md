# /generate-tests

Generate comprehensive tests for code files.

Usage: /generate-tests <file-path> [test-framework]

Analyzes the target file and generates appropriate test coverage.

---

Analyze target file:
```bash
if [ -z "$ARGUMENTS" ]; then
    echo "❌ Error: File path required"
    echo "Usage: /generate-tests <file-path> [test-framework]"
    exit 1
fi

FILE_PATH=$(echo "$ARGUMENTS" | awk '{print $1}')
TEST_FRAMEWORK=$(echo "$ARGUMENTS" | awk '{print $2}')

if [ ! -f "$FILE_PATH" ]; then
    echo "❌ Error: File not found: $FILE_PATH"
    exit 1
fi

echo "📊 Analyzing: $FILE_PATH"
echo ""

# Show file stats
echo "File Stats:"
wc -l "$FILE_PATH" | awk '{print "  • Lines:", $1}'
grep -c "function\|const.*=.*=>\\|class " "$FILE_PATH" 2>/dev/null | awk '{print "  • Functions/Classes:", $1}'
echo ""
```

Check for existing tests:
```bash
# Determine test file path based on project structure
if [ -d "tests" ]; then
    TEST_DIR="tests"
elif [ -d "test" ]; then
    TEST_DIR="test"
elif [ -d "__tests__" ]; then
    TEST_DIR="__tests__"
else
    TEST_DIR="$(dirname "$FILE_PATH")"
fi

FILENAME=$(basename "$FILE_PATH")
FILENAME_NO_EXT="${FILENAME%.*}"
EXTENSION="${FILENAME##*.}"

# Common test file patterns
TEST_FILE_PATTERNS=(
    "${TEST_DIR}/${FILENAME_NO_EXT}.test.${EXTENSION}"
    "${TEST_DIR}/${FILENAME_NO_EXT}.spec.${EXTENSION}"
    "$(dirname "$FILE_PATH")/${FILENAME_NO_EXT}.test.${EXTENSION}"
    "$(dirname "$FILE_PATH")/${FILENAME_NO_EXT}.spec.${EXTENSION}"
)

echo "🔍 Checking for existing tests..."
EXISTING_TEST=""
for pattern in "${TEST_FILE_PATTERNS[@]}"; do
    if [ -f "$pattern" ]; then
        EXISTING_TEST="$pattern"
        break
    fi
done

if [ -n "$EXISTING_TEST" ]; then
    echo "  ✅ Found: $EXISTING_TEST"
    TEST_COUNT=$(grep -c "test(\\|it(\\|describe(" "$EXISTING_TEST" 2>/dev/null || echo "0")
    echo "  • Existing tests: $TEST_COUNT"
else
    echo "  📝 No existing tests found"
    echo "  • Will create: ${TEST_DIR}/${FILENAME_NO_EXT}.test.${EXTENSION}"
fi
echo ""
```

Show test generation plan:
```bash
echo "📋 Test Generation Plan:"
echo ""
echo "Target: $FILE_PATH"
echo "Test File: ${EXISTING_TEST:-${TEST_DIR}/${FILENAME_NO_EXT}.test.${EXTENSION}}"
echo ""
echo "Will generate tests for:"
echo "  • All exported functions"
echo "  • Edge cases and error handling"
echo "  • Integration scenarios"
echo "  • Mock setup if needed"
echo ""

if [ -n "$TEST_FRAMEWORK" ]; then
    echo "Framework: $TEST_FRAMEWORK"
else
    # Auto-detect framework from package.json
    if [ -f "package.json" ]; then
        if grep -q "\"jest\"" package.json; then
            echo "Framework: Jest (detected)"
        elif grep -q "\"vitest\"" package.json; then
            echo "Framework: Vitest (detected)"
        elif grep -q "\"mocha\"" package.json; then
            echo "Framework: Mocha (detected)"
        else
            echo "Framework: Will use standard patterns"
        fi
    fi
fi
echo ""
echo "✨ Ready to generate comprehensive tests!"
```
