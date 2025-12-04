#!/bin/bash

echo "=== Claude Code Diagnostic Script ==="
echo ""

# Test 1: Check if Claude is installed
echo "Test 1: Checking if Claude CLI is installed..."
if command -v claude &> /dev/null; then
    echo "✅ Claude CLI found at: $(which claude)"
else
    echo "❌ Claude CLI NOT found"
    echo ""
    echo "To install:"
    echo "  npm install -g @anthropic-ai/claude-code"
    echo "  claude auth"
    exit 1
fi

echo ""

# Test 2: Check version
echo "Test 2: Checking Claude CLI version..."
if claude --version &> /dev/null; then
    echo "✅ Version: $(claude --version 2>&1)"
else
    echo "❌ Failed to get version"
    exit 1
fi

echo ""

# Test 3: Test a simple command
echo "Test 3: Testing simple Claude command..."
echo "Running: claude 'echo hello'"

# Create a temp directory for the test
TEST_DIR=$(mktemp -d)
cd "$TEST_DIR"

# Run a simple test
if claude "echo 'test successful'" 2>&1 | grep -q "test successful\|completed\|success"; then
    echo "✅ Claude CLI is working!"
else
    echo "❌ Claude CLI test failed"
    echo ""
    echo "Possible issues:"
    echo "  1. Claude is not authenticated - run: claude auth"
    echo "  2. No Claude Pro/Team subscription"
    echo "  3. Network/firewall issues"
fi

# Cleanup
rm -rf "$TEST_DIR"

echo ""

# Test 4: Check if running as n8n user
echo "Test 4: Environment check..."
echo "Current user: $(whoami)"
echo "NODE_PATH: ${NODE_PATH:-not set}"
echo "PATH: $PATH"

echo ""
echo "=== Diagnostic complete ==="
echo ""
echo "If Claude CLI works here but fails in n8n:"
echo "  1. Check if n8n user has access to Claude"
echo "  2. Verify PATH is set correctly for n8n"
echo "  3. Check project path permissions"
echo "  4. Try running n8n as the same user that ran this script"


