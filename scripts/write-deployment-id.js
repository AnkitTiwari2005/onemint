const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const targetFile = path.join(__dirname, '..', '.deployment-id');

let deploymentId = '';

// Try reading git commit hash
try {
  const commit = execSync('git rev-parse --short HEAD', { stdio: ['ignore', 'pipe', 'ignore'] })
    .toString()
    .trim();
  if (commit) {
    deploymentId = `${commit}-${Date.now()}`;
  }
} catch {
  // Git not available or not a repo
}

if (!deploymentId) {
  deploymentId = `dpl-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

fs.writeFileSync(targetFile, deploymentId.trim(), 'utf8');
console.log(`[write-deployment-id] Generated deployment ID: ${deploymentId.trim()}`);
