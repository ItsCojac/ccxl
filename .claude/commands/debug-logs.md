# Debug Logs

Analyze log files or console output to identify and diagnose issues.

## Instructions

1. **Gather Logs**:
   - Collect relevant log files or console output
   - Note timestamps of when the issue occurred
   - Include context (what operation was being performed)

2. **Parse and Filter**:
   - Focus on errors, warnings, and relevant info messages
   - Look for patterns or recurring issues
   - Identify the sequence of events leading to the problem

3. **Analyze**:
   - Match errors to source code locations
   - Trace the execution flow
   - Identify root cause vs symptoms
   - Check for:
     - Stack traces and error messages
     - Timing/performance issues
     - Resource exhaustion
     - Configuration problems
     - External service failures

4. **Correlate**:
   - Connect multiple log entries to build timeline
   - Link errors to specific user actions or API calls
   - Identify patterns across multiple occurrences

5. **Diagnose**:
   - Determine the root cause
   - Assess severity and impact
   - Identify affected components

6. **Recommend**:
   - Suggest immediate fixes
   - Propose long-term solutions
   - Recommend additional logging if needed

## Output Format

```markdown
## 📊 Log Analysis Summary
**Time Period**: [When the issue occurred]
**Severity**: [Critical/High/Medium/Low]
**Affected Component**: [What's broken]

## 🔍 Key Findings
### Errors Found
- **[Timestamp]**: [Error message]
  - **Location**: [File:Line or component]
  - **Cause**: [What triggered it]

### Warning Signs
- [List of warnings that preceded the error]

### Timeline
1. [T+0s]: [First relevant event]
2. [T+5s]: [Next event]
...

## 🎯 Root Cause
[Clear explanation of what's actually wrong]

## 🛠️ Recommended Fixes
### Immediate
- [ ] [Quick fix to stop the bleeding]

### Long-term
- [ ] [Proper solution]

### Monitoring
- [ ] [Additional logging to add]
```
