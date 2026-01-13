const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

const { connectDb } = require('./config/db');
const { initModels } = require('./models/initModels');
const { makeAuthMiddleware } = require('./middleware/authMiddleware');
const { makeAdminController } = require('./controllers/adminController');
const { makeAdminRoutes } = require('./routes/adminRoutes');

dotenv.config();

if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: path.join(__dirname, '../auth-service/.env') });
  dotenv.config({ path: path.join(__dirname, '../booking-service/.env') });
}

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Admin Service is running');
});

const start = async () => {
  const { authConn, bookingConn } = await connectDb();
  const models = initModels({ authConn, bookingConn });

  const auth = makeAuthMiddleware({ User: models.User });
  const controller = makeAdminController(models);
  const routes = makeAdminRoutes({ auth, controller });


  app.use('/api/v1/admin', routes);


  app.use('/', routes);

  app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Not found' });
  });

  const PORT = Number(process.env.PORT) || Number(process.env.ADMIN_PORT) || 5007;
  app.listen(PORT, () => {
    console.log(`Admin Service running on port ${PORT}`);
  });
};

start().catch((err) => {
  console.error('Admin service failed to start:', err);
  process.exit(1);
});
