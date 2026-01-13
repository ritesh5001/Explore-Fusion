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
// Support both direct service calls (/) and versioned calls (/api/v1/posts).
// Gateway currently rewrites /api/v1/posts -> /, so we keep both.
app.use('/api/v1/posts', postRoutes);
app.use('/', postRoutes);

app.use((req, res) => {
	res.status(404).json({
		success: false,
		message: 'Not found',
	});
});

const PORT = process.env.PORT || 5002;
app.listen(PORT, () => console.log(`Post Service running on port ${PORT}`));