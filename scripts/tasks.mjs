import { spawn } from 'node:child_process';
import { cp, mkdir } from 'node:fs/promises';

const apps = ['fido2-demo', 'fido2-lab', 'webauthn-decoder'];
const command = process.argv[2];
const children = new Set();
function stop() {
  for (const child of children) {
    if (!child.pid) continue;
    try {
      if (process.platform === 'win32') child.kill('SIGTERM');
      else process.kill(-child.pid, 'SIGTERM');
    } catch (error) {
      if (error.code !== 'ESRCH') console.error(error.message);
    }
  }
}
process.on('SIGINT', () => { stop(); process.exit(130); });
process.on('SIGTERM', () => { stop(); process.exit(143); });
function run(args, cwd = '.') {
  return new Promise((resolve, reject) => {
    const child = spawn('npm', args, { cwd, stdio: 'inherit', detached: process.platform !== 'win32' });
    children.add(child);
    child.on('error', reject);
    child.on('exit', code => {
      children.delete(child);
      code === 0 ? resolve() : reject(new Error(`npm ${args.join(' ')} exited ${code} in ${cwd}`));
    });
  });
}
try {
  if (command === 'dev') {
    await Promise.all([
      ...apps.map((app, i) => run(['run', 'dev', '--', '--host', '127.0.0.1', '--port', String(5181 + i), '--strictPort'], `apps/${app}`)),
      run(['exec', '--', 'vite', '--host', '127.0.0.1', '--port', '5173', '--strictPort']),
    ]);
  } else if (command === 'test') {
    await run(['test'], 'apps/fido2-demo');
    await run(['exec', '--', 'vitest', 'run'], 'apps/webauthn-decoder');
  } else {
    if (!['install', 'lint', 'build'].includes(command)) throw new Error('Unknown task');
    if (command === 'build') await run(['exec', '--', 'vite', 'build']);
    for (const app of apps) {
      await run(command === 'install' ? ['ci'] : ['run', command], `apps/${app}`);
      if (command === 'build') {
        await mkdir(`dist/${app}`, { recursive: true });
        await cp(`apps/${app}/dist`, `dist/${app}`, { recursive: true });
      }
    }
  }
} catch (error) {
  console.error(error.message);
  stop();
  process.exitCode = 1;
}
