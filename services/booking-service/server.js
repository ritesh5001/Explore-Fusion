const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');


const packageRoutes = require('./routes/packages');
const bookingRoutes = require('./routes/bookingRoutes');
const itineraryRoutes = require('./routes/itineraries');
const reviewRoutes = require('./routes/reviewRoutes');
const buddyRoutes = require('./routes/buddyRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

dotenv.config();

const app = express();


app.use(express.json());
app.use(cors());


mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ef_booking_db')
  .then(() => console.log('✅ Booking DB Connected'))
  .catch(err => console.error('DB Error:', err));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'booking',
    env: process.env.NODE_ENV,
  });
});

app.use('/api/v1/packages', packageRoutes);
app.use('/api/v1/bookings', bookingRoutes);
app.use('/api/v1/itineraries', itineraryRoutes);
app.use('/api/v1/reviews', reviewRoutes);
app.use('/api/v1/matches', buddyRoutes);
app.use('/api/v1/notifications', notificationRoutes);

// Backward compatibility for direct service calls; mounted last to avoid shadowing other /api/v1 routes.
// NOTE: bookingRoutes has a broad '/:id' matcher, so mount other legacy routers before it.
app.use('/', buddyRoutes);
app.use('/', reviewRoutes);
app.use('/', notificationRoutes);
app.use('/', bookingRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Not found',
  });
});


const PORT = process.env.PORT || 5003;
app.listen(PORT, () => console.log(`📅 Booking Service running on port ${PORT}`));