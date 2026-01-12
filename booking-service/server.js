const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const bookingRoutes = require('./routes/bookingRoutes');
const connectDB = require('./config/db');

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());
connectDB();

app.use('/api/v1', bookingRoutes);

const PORT = process.env.PORT || 5003;
app.listen(PORT, () => console.log(`Booking Service running on port ${PORT}`));