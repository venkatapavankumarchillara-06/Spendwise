import './server.js';
import { spawn } from 'child_process';

setTimeout(() => {
  const child = spawn('node', ['./server/test_e2e.js'], { stdio: 'inherit' });
  child.on('exit', (code) => {
    process.exit(code || 0);
  });
}, 2000);
