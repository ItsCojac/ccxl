#!/usr/bin/env bash
for dir in $(find . -type d -mindepth 2 -maxdepth 2); do
  count=$(find "$dir" -maxdepth 1 -type f | wc -l)
  if [ "$count" -gt 5 ] && [ ! -f "$dir/CLAUDE.md" ]; then
    echo "⚠️  Consider adding $dir/CLAUDE.md for module-specific context."
  fi
done