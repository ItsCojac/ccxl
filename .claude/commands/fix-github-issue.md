# /fix-github-issue

Systematic GitHub issue fixing workflow.

Usage: /fix-github-issue <issue-number> [repo]

Fetches issue details and creates a structured fixing plan.

---

Fetch issue details:
```bash
if [ -z "$ARGUMENTS" ]; then
    echo "❌ Error: Issue number required"
    echo "Usage: /fix-github-issue <issue-number> [repo]"
    exit 1
fi

ISSUE_NUMBER=$(echo "$ARGUMENTS" | awk '{print $1}')
REPO=$(echo "$ARGUMENTS" | awk '{print $2}')

echo "🐛 GitHub Issue Fixing Workflow"
echo "━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Try to determine repo from git remote if not provided
if [ -z "$REPO" ]; then
    if git remote -v 2>/dev/null | grep -q "github.com"; then
        REPO=$(git remote -v | grep "github.com" | head -1 | sed 's/.*github\.com[:/]\(.*\)\.git.*/\1/')
        echo "📦 Repository: $REPO (auto-detected)"
    else
        echo "❌ Error: Could not determine repository"
        echo "Usage: /fix-github-issue <issue-number> <owner/repo>"
        exit 1
    fi
else
    echo "📦 Repository: $REPO"
fi

echo "🔢 Issue: #$ISSUE_NUMBER"
echo ""

# Check if gh CLI is available
if command -v gh &> /dev/null; then
    echo "📥 Fetching issue details..."
    echo ""
    gh issue view $ISSUE_NUMBER --repo "$REPO" || echo "⚠️  Could not fetch issue (is gh CLI authenticated?)"
    echo ""
else
    echo "💡 Install gh CLI for automatic issue fetching:"
    echo "   https://cli.github.com/"
    echo ""
fi
```

Show fixing workflow:
```bash
echo "━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🔧 Issue Fixing Workflow:"
echo ""
echo "## 1. Reproduce the Issue"
echo "   • [ ] Read issue description carefully"
echo "   • [ ] Identify steps to reproduce"
echo "   • [ ] Confirm bug exists in current code"
echo "   • [ ] Note: [environment, browser, OS details]"
echo ""
echo "## 2. Locate Root Cause"
echo "   • [ ] Search codebase for relevant files"
echo "   • [ ] Add debug logging if needed"
echo "   • [ ] Identify the exact line/function causing issue"
echo "   • [ ] Understand why it's failing"
echo ""
echo "## 3. Plan the Fix"
echo "   Files to modify:"
echo "   • [ ] [file path] - [what needs to change]"
echo ""
echo "   Approach:"
echo "   • [Describe the fix strategy]"
echo ""
echo "   Edge cases to consider:"
echo "   • [ ] [scenario 1]"
echo "   • [ ] [scenario 2]"
echo ""
echo "## 4. Implement Fix"
echo "   • [ ] Write failing test that reproduces the bug"
echo "   • [ ] Implement minimal fix"
echo "   • [ ] Verify test now passes"
echo "   • [ ] Check no other tests broke"
echo ""
echo "## 5. Verify Resolution"
echo "   • [ ] Manual testing of original reproduction steps"
echo "   • [ ] Test on reported environment/platform"
echo "   • [ ] Check for similar issues elsewhere"
echo "   • [ ] Review for any side effects"
echo ""
echo "## 6. Document & Ship"
echo "   • [ ] Update relevant documentation"
echo "   • [ ] Add code comments if behavior is subtle"
echo "   • [ ] Create PR with: 'Fixes #$ISSUE_NUMBER'"
echo "   • [ ] Include: before/after behavior description"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Create a branch for the fix
BRANCH_NAME="fix-issue-$ISSUE_NUMBER"
if git rev-parse --git-dir > /dev/null 2>&1; then
    CURRENT_BRANCH=$(git branch --show-current)
    echo "💡 Suggested workflow:"
    echo ""
    echo "Create fix branch:"
    echo "  git checkout -b $BRANCH_NAME"
    echo ""
    echo "After fixing:"
    echo "  git add ."
    echo "  git commit -m 'fix: resolve issue #$ISSUE_NUMBER'"
    echo "  git push origin $BRANCH_NAME"
    echo "  gh pr create --title 'Fix #$ISSUE_NUMBER: <description>' --body 'Fixes #$ISSUE_NUMBER'"
    echo ""
fi

echo "✨ Ready to fix issue #$ISSUE_NUMBER"
```
