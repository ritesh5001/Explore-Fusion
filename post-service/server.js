const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ef-posts';

mongoose.connect(MONGO_URI)
  .then(() => console.log('Post Service DB Connected'))
  .catch((err) => console.log(err));

const PostSchema = new mongoose.Schema({
  title: String,
  content: String,
  location: String
});

const Post = mongoose.model('Post', PostSchema);


// GET / -> return all posts
app.get('/', async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST / -> create a post
app.post('/', async (req, res) => {
  try {
    const { title, content, location } = req.body;

    if (!title || !content || !location) {
      return res.status(400).json({ message: 'Please provide title, content and location' });
    }

    const newPost = await Post.create({ title, content, location });
    res.status(201).json(newPost);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const PORT = process.env.PORT || 5002;
app.listen(PORT, () => console.log(`Post Service running on port ${PORT}`));