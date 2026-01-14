const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const aiRoutes = require('./routes/aiRoutes');

dotenv.config({ quiet: true });

const app = express();
app.use(express.json());
app.use(cors());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'ai',
    env: process.env.NODE_ENV,
  });
});

app.use('/', aiRoutes);

const PORT = process.env.PORT || 5004;
app.listen(PORT, () => console.log(`AI Service running on port ${PORT}`));