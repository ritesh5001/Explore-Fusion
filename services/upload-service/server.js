const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config();
// Dev-friendly fallback: reuse auth-service env (contains ImageKit keys)
dotenv.config({ path: path.join(__dirname, '../auth-service/.env') });

const uploadRoutes = require('./routes/uploadRoutes');

const app = express();
app.use(cors());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'upload',
    env: process.env.NODE_ENV,
  });
});

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });



app.use("/api/v1/upload", uploadRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


app.post('/api/v1/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  
  const imageUrl = `/uploads/${req.file.filename}`;
  res.json({ 
    message: 'File uploaded successfully', 
    imageUrl: imageUrl 
  });
});

const PORT = Number(process.env.UPLOAD_PORT) || 5005;
app.listen(PORT, () => console.log(`Upload Service running on port ${PORT}`));