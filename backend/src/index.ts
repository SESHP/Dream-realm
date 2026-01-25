import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import characterRoutes from './routes/character';
import villageRoutes from './routes/village';
import mapRoutes from './routes/map';
import inventoryRoutes from './routes/inventory';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/auth', authRoutes);
app.use('/character', characterRoutes);
app.use('/village', villageRoutes);
app.use('/map', mapRoutes);
app.use('/api/inventory', inventoryRoutes);


// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Dream Realm API is running' });
});

app.listen(PORT, () => {
  console.log(`🌙 Dream Realm server running on port ${PORT}`);
});