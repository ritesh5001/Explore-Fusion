const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

const connectDB = require('./config/db');
const postRoutes = require('./routes/postRoutes');

dotenv.config();

connectDB();

const app = express();
app.use(express.json());
app.use(cors());

// Exposes: GET / and POST /
app.use('/', postRoutes);

const PORT = process.env.PORT || 5002;
app.listen(PORT, () => console.log(`Post Service running on port ${PORT}`));