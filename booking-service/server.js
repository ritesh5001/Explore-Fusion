const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const bookingRoutes = require('./routes/bookingRoutes');

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());
mongoose.connect('mongodb://127.0.0.1:27017/ef-bookings')
  .then(() => console.log('Booking Service DB Connected'))
  .catch((err) => console.log(err));

app.use('/api/v1', bookingRoutes);

const PORT = process.env.PORT || 5003;
app.listen(PORT, () => console.log(`Booking Service running on port ${PORT}`));