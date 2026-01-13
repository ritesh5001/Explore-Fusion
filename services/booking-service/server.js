const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');


const packageRoutes = require('./routes/packages');
const bookingRoutes = require('./routes/bookings');
const itineraryRoutes = require('./routes/itineraries');

dotenv.config();

const app = express();


app.use(express.json());
app.use(cors());


mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ef_booking_db')
  .then(() => console.log('✅ Booking DB Connected'))
  .catch(err => console.error('DB Error:', err));



app.use('/api/v1/packages', packageRoutes);
app.use('/api/v1/bookings', bookingRoutes);
app.use('/api/v1/itineraries', itineraryRoutes);


const PORT = process.env.PORT || 5003;
app.listen(PORT, () => console.log(`📅 Booking Service running on port ${PORT}`));