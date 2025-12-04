#!/usr/bin/env node

/**
 * Diagnostic script to test Claude Code CLI on your n8n server
 * Run this on your server to diagnose the issue:
 * node test-claude-cli.js
 */

const { spawn } = require('child_process');
const { query } = require('@anthropic-ai/claude-agent-sdk');

console.log('=== Claude Code Diagnostic Tool ===\n');

// Test 1: Check if Claude Code CLI is installed
console.log('Test 1: Checking if Claude Code CLI is installed...');
const whichClaude = spawn('which', ['claude']);

whichClaude.stdout.on('data', (data) => {
  console.log(`✅ Claude found at: ${data.toString().trim()}`);
});

whichClaude.stderr.on('data', (data) => {
  console.error(`❌ Error: ${data.toString()}`);
});

whichClaude.on('close', (code) => {
  if (code !== 0) {
    console.error('❌ Claude CLI is NOT installed');
    console.log('\nTo install Claude Code CLI:');
    console.log('  npm install -g @anthropic-ai/claude-code');
    console.log('  claude auth\n');
    process.exit(1);
  }
  
  // Test 2: Check Claude version
  console.log('\nTest 2: Checking Claude CLI version...');
  const versionCheck = spawn('claude', ['--version']);
  
  versionCheck.stdout.on('data', (data) => {
    console.log(`✅ Version: ${data.toString().trim()}`);
  });
  
  versionCheck.stderr.on('data', (data) => {
    console.error(`⚠️  ${data.toString()}`);
  });
  
  versionCheck.on('close', (code) => {
    if (code !== 0) {
      console.error('❌ Failed to get Claude version');
      process.exit(1);
    }
    
    // Test 3: Test authentication with a simple query
    console.log('\nTest 3: Testing Claude authentication and SDK...');
    testClaudeSDK();
  });
});

async function testClaudeSDK() {
  try {
    console.log('Running simple query: "echo hello"');
    
    const messages = [];
    const abortController = new AbortController();
    
    // Set a 30 second timeout
    const timeoutId = setTimeout(() => {
      abortController.abort();
    }, 30000);
    
    for await (const message of query({
      prompt: 'echo "hello from claude"',
      abortController,
      options: {
        maxTurns: 5,
        model: 'sonnet',
        permissionMode: 'bypassPermissions',
      }
    })) {
      messages.push(message);
      
      if (message.type === 'result') {
        clearTimeout(timeoutId);
        console.log('✅ Claude SDK working correctly!');
        console.log(`   Result: ${message.result || message.error}`);
        console.log(`   Duration: ${message.duration_ms}ms`);
        console.log(`   Turns: ${message.num_turns}`);
        console.log(`   Cost: $${message.total_cost_usd}`);
        
        console.log('\n=== All tests passed! ===');
        console.log('Your Claude Code setup is working correctly.');
        console.log('The issue might be:');
        console.log('  1. Project path permissions');
        console.log('  2. Invalid project path');
        console.log('  3. Specific prompt causing issues\n');
        return;
      }
    }
    
    clearTimeout(timeoutId);
  } catch (error) {
    console.error('\n❌ Claude SDK test failed:');
    console.error(`   Error: ${error.message}`);
    console.error(`   Stack: ${error.stack}`);
    
    if (error.message.includes('Authentication') || error.message.includes('auth')) {
      console.log('\n💡 Solution: Run "claude auth" to authenticate');
    } else if (error.message.includes('ENOENT')) {
      console.log('\n💡 Solution: Claude CLI is not in PATH. Reinstall with:');
      console.log('   npm install -g @anthropic-ai/claude-code');
    } else {
      console.log('\n💡 Check Claude Code CLI installation and authentication');
    }
    
    process.exit(1);
  }
}


