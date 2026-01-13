const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(cors());


const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); 
  },
  filename: (req, file, cb) => {
    
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });



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

const PORT = process.env.PORT || 5005;
app.listen(PORT, () => console.log(`Upload Service running on port ${PORT}`));