const fs = require('fs');
const path = require('path');
const createUploadRoutes = require('./routes/uploadRoutes');

const initUpload = async () => {
  const uploadsDir = path.join(__dirname, 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const router = createUploadRoutes(uploadsDir);
  return { router, uploadsDir };
};

module.exports = { initUpload };
