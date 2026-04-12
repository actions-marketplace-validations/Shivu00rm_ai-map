#!/bin/bash
#
# .ai-map Framework Setup
#
# Usage:
#   curl -fsSL https://raw.githubusercontent.com/YOUR_USERNAME/ai-map-framework/main/setup.sh | bash
#   OR
#   bash setup.sh /path/to/your/project
#

set -e

TARGET="${1:-.}"

if [ ! -d "$TARGET" ]; then
    echo "Error: Directory '$TARGET' does not exist."
    exit 1
fi

echo "Setting up .ai-map in: $TARGET"

# Create .ai-map directory
mkdir -p "$TARGET/.ai-map"
mkdir -p "$TARGET/.github"

# Copy template files (if running from framework dir)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [ -d "$SCRIPT_DIR/template" ]; then
    cp -rn "$SCRIPT_DIR/template/.ai-map/"* "$TARGET/.ai-map/" 2>/dev/null || true
    cp -n "$SCRIPT_DIR/template/AGENTS.md" "$TARGET/AGENTS.md" 2>/dev/null || true
    cp -n "$SCRIPT_DIR/template/CLAUDE.md" "$TARGET/CLAUDE.md" 2>/dev/null || true
    cp -n "$SCRIPT_DIR/template/.cursorrules" "$TARGET/.cursorrules" 2>/dev/null || true
    cp -n "$SCRIPT_DIR/template/.windsurfrules" "$TARGET/.windsurfrules" 2>/dev/null || true
    cp -n "$SCRIPT_DIR/template/.github/copilot-instructions.md" "$TARGET/.github/copilot-instructions.md" 2>/dev/null || true
    echo "Done! Template files copied to $TARGET/.ai-map/"
else
    # Create minimal template files inline
    for file in README.md ARCHITECTURE.md SOP.md FLOW_MAP.md GOAL_TRACKER.md DECISIONS.md KNOWN_ISSUES.md SESSION_LOG.md; do
        if [ ! -f "$TARGET/.ai-map/$file" ]; then
            echo "# ${file%.md}" > "$TARGET/.ai-map/$file"
            echo "" >> "$TARGET/.ai-map/$file"
            echo "<!-- Fill this in with your project details -->" >> "$TARGET/.ai-map/$file"
        fi
    done
    echo "Done! Empty template files created in $TARGET/.ai-map/"
fi

echo ""
echo "Next steps:"
echo "  1. Edit .ai-map/README.md with your project overview"
echo "  2. Edit .ai-map/ARCHITECTURE.md with your system design"
echo "  3. Edit .ai-map/SOP.md with your coding patterns"
echo "  4. Start a conversation with your AI agent — it will read .ai-map/ first"
