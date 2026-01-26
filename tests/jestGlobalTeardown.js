const fs = require('fs');
const path = require('path');

const PID_FILE = path.resolve(__dirname, '../.gateway-test.pid');

module.exports = async () => {
  if (!fs.existsSync(PID_FILE)) return;

  const pidContent = fs.readFileSync(PID_FILE, 'utf-8').trim();
  fs.unlinkSync(PID_FILE);
  const pid = Number(pidContent);
  if (!pid || Number.isNaN(pid)) return;

  try {
    process.kill(pid, 'SIGTERM');
  } catch (error) {
    if (error.code !== 'ESRCH') {
      throw error;
    }
  }
};