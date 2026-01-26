const fs = require('fs');
const path = require('path');
const http = require('http');
const { spawn } = require('child_process');

const PID_FILE = path.resolve(__dirname, '../.gateway-test.pid');
const PORT = Number(process.env.PORT) || 5050;
const HEALTH_PATH = '/health';

const waitForServer = () =>
  new Promise((resolve, reject) => {
    const timeout = 20000;
    const start = Date.now();

    const check = () => {
      const req = http.request(
        {
          method: 'GET',
          hostname: 'localhost',
          port: PORT,
          path: HEALTH_PATH,
          timeout: 1000,
        },
        (res) => {
          if (res.statusCode === 200) {
            res.resume();
            resolve();
          } else {
            res.resume();
            retry();
          }
        }
      );

      req.on('error', () => retry());
      req.on('timeout', () => {
        req.destroy();
        retry();
      });
      req.end();

      function retry() {
        if (Date.now() - start > timeout) {
          reject(new Error('Gateway health check timed out'));
          return;
        }
        setTimeout(check, 200);
      }
    };

    check();
  });

module.exports = async () => {
  const gatewayDir = path.resolve(__dirname, '../gateway');
  const nodePath = process.execPath;
  const args = [path.join(gatewayDir, 'server.js')];
  const env = { ...process.env, PORT: PORT.toString(), NODE_ENV: 'test' };

  const child = spawn(nodePath, args, {
    cwd: gatewayDir,
    env,
    stdio: ['ignore', 'inherit', 'inherit'],
  });

  fs.writeFileSync(PID_FILE, child.pid.toString(), 'utf-8');

  try {
    await waitForServer();
  } catch (error) {
    child.kill('SIGTERM');
    throw error;
  }
};