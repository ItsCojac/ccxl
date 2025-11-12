# /debug-logs

Analyze logs for errors and patterns.

Usage: /debug-logs [log-file-or-command]

Analyzes log files or command output for errors, warnings, and patterns.

---

Determine log source:
```bash
echo "🔍 Log Analysis"
echo "━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ -z "$ARGUMENTS" ]; then
    # No arguments - try to find common log locations
    echo "📂 Searching for log files..."
    echo ""

    LOG_LOCATIONS=(
        "logs/*.log"
        "*.log"
        ".next/cache/*.log"
        "npm-debug.log"
        "yarn-error.log"
        "/var/log/app.log"
    )

    FOUND_LOGS=""
    for location in "${LOG_LOCATIONS[@]}"; do
        if ls $location 2>/dev/null; then
            FOUND_LOGS="$FOUND_LOGS $(ls $location 2>/dev/null)"
        fi
    done

    if [ -z "$FOUND_LOGS" ]; then
        echo "No log files found in common locations."
        echo ""
        echo "Usage options:"
        echo "  /debug-logs <file.log>        # Analyze specific log file"
        echo "  /debug-logs npm run dev       # Analyze command output"
        exit 0
    else
        echo "Found logs:"
        echo "$FOUND_LOGS" | tr ' ' '\n' | sed 's/^/  • /'
        echo ""
        LOG_FILE=$(echo "$FOUND_LOGS" | awk '{print $1}')
        echo "Analyzing most recent: $LOG_FILE"
    fi
else
    # Check if argument is a file or command
    FIRST_ARG=$(echo "$ARGUMENTS" | awk '{print $1}')
    if [ -f "$FIRST_ARG" ]; then
        LOG_FILE="$ARGUMENTS"
        echo "📄 Analyzing file: $LOG_FILE"
    else
        echo "📦 Will analyze command output: $ARGUMENTS"
        echo ""
        echo "Note: Run the command and pipe output:"
        echo "  $ARGUMENTS 2>&1 | tee debug.log"
        echo "  /debug-logs debug.log"
        exit 0
    fi
fi
echo ""
```

Analyze errors and warnings:
```bash
if [ -f "$LOG_FILE" ]; then
    echo "🚨 Errors and Warnings:"
    echo ""

    # Count severity levels
    ERROR_COUNT=$(grep -ci "error" "$LOG_FILE" 2>/dev/null || echo "0")
    WARN_COUNT=$(grep -ci "warn" "$LOG_FILE" 2>/dev/null || echo "0")
    FAIL_COUNT=$(grep -ci "fail" "$LOG_FILE" 2>/dev/null || echo "0")

    echo "Summary:"
    echo "  • Errors: $ERROR_COUNT"
    echo "  • Warnings: $WARN_COUNT"
    echo "  • Failures: $FAIL_COUNT"
    echo ""

    if [ $ERROR_COUNT -gt 0 ]; then
        echo "Recent Errors:"
        grep -i "error" "$LOG_FILE" | tail -10 | sed 's/^/  /'
        echo ""
    fi

    if [ $WARN_COUNT -gt 0 ]; then
        echo "Recent Warnings:"
        grep -i "warn" "$LOG_FILE" | tail -10 | sed 's/^/  /'
        echo ""
    fi
fi
```

Pattern analysis:
```bash
if [ -f "$LOG_FILE" ]; then
    echo "📊 Pattern Analysis:"
    echo ""

    # Common error patterns
    echo "Common Issues:"

    # Dependency errors
    if grep -qi "cannot find module\|module not found" "$LOG_FILE"; then
        echo "  • Missing dependencies (run npm install)"
    fi

    # Port conflicts
    if grep -qi "EADDRINUSE\|port.*already in use" "$LOG_FILE"; then
        echo "  • Port conflict (something already using the port)"
    fi

    # Permission errors
    if grep -qi "EACCES\|permission denied" "$LOG_FILE"; then
        echo "  • Permission errors (check file/directory permissions)"
    fi

    # Syntax errors
    if grep -qi "SyntaxError\|Unexpected token" "$LOG_FILE"; then
        echo "  • Syntax errors in code"
    fi

    # Type errors
    if grep -qi "TypeError\|undefined is not" "$LOG_FILE"; then
        echo "  • Type errors (null/undefined access)"
    fi

    # Network errors
    if grep -qi "ECONNREFUSED\|ETIMEDOUT\|network" "$LOG_FILE"; then
        echo "  • Network connectivity issues"
    fi

    echo ""
fi
```

Show debugging tips:
```bash
echo "━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🔧 Debugging Checklist:"
echo ""
echo "Immediate Actions:"
echo "  • [ ] Read full error message (don't just skim)"
echo "  • [ ] Check error line number in code"
echo "  • [ ] Verify all dependencies installed"
echo "  • [ ] Check environment variables set"
echo ""
echo "Investigation:"
echo "  • [ ] Add console.log before error line"
echo "  • [ ] Check if error is consistent or intermittent"
echo "  • [ ] Test in isolation (minimal reproduction)"
echo "  • [ ] Search error message online"
echo ""
echo "Common Fixes:"
echo "  • npm install        # Reinstall dependencies"
echo "  • rm -rf node_modules package-lock.json && npm install"
echo "  • Check .env file has all required variables"
echo "  • Restart dev server"
echo "  • Clear cache: rm -rf .next/cache"
echo ""
echo "✨ Good luck debugging!"
```
