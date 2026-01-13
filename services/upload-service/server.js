const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(cors());

// 1. Ensure 'uploads' directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// 2. Configure Multer (Where to save files)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Save in 'uploads' folder
  },
  filename: (req, file, cb) => {
    // Generate unique name: timestamp + original name
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

// 3. Serve images statically (so frontend can see them)
// Access images at: http://localhost:5005/uploads/filename.jpg
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 4. Routes
app.post('/api/v1/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  // Return the URL that the frontend needs to save
  const imageUrl = `/uploads/${req.file.filename}`;
  res.json({ 
    message: 'File uploaded successfully', 
    imageUrl: imageUrl 
  });
});

const PORT = process.env.PORT || 5005;
app.listen(PORT, () => console.log(`Upload Service running on port ${PORT}`));