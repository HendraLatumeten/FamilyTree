import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import authRoutes from './routes/auth';
import familyRoutes from './routes/family';
import adminRoutes from './routes/admin';
import prisma, { seedAdmin } from './prisma';

dotenv.config();

// Run Admin Seeder
seedAdmin().then(() => console.log("[BACKEND] Admin Seeder finished"));

const app = express();
const PORT = process.env.PORT || 4000;

// Ensure uploads directory exists - USE ABSOLUTE PATH
const uploadsDir = path.resolve(__dirname, '../uploads');
console.log(`[BACKEND] Uploads directory initialized at: ${uploadsDir}`);
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(uploadsDir));

app.use('/api/auth', authRoutes);
app.use('/api/family', familyRoutes);
app.use('/api/admin', adminRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
