import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import prisma from '../prisma';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key';
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword },
    });
    res.status(201).json({ message: 'User created', userId: user.id });
  } catch (error) {
    res.status(400).json({ error: 'User already exists or invalid data' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || (user.password && !(await bcrypt.compare(password, user.password)))) {
      return res.status(401).json({ error: 'Email atau password salah' });
    }

    if (!user.isActive) {
      return res.status(403).json({ error: 'Akun Anda telah dinonaktifkan. Silakan hubungi admin.' });
    }

    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ 
      token, 
      name: user.name, 
      role: user.role,
      isActive: user.isActive 
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/google-login', async (req, res) => {
  const { credential } = req.body;
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return res.status(400).json({ error: 'Format token Google tidak valid' });
    }

    const { email, name, sub: googleId } = payload;

    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // Buat user baru jika belum ada
      user = await prisma.user.create({
        data: {
          email,
          name: name || 'Google User',
          googleId,
          treeShareId: `tree-${Math.random().toString(36).substring(2, 10)}`
        },
      });
    } else if (!user.googleId) {
      // Hubungkan akun Google jika user sudah ada tapi belum punya googleId
      user = await prisma.user.update({
        where: { id: user.id },
        data: { googleId },
      });
    }

    if (!user.isActive) {
      return res.status(403).json({ error: 'Akun Anda telah dinonaktifkan.' });
    }

    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ 
      token, 
      name: user.name, 
      role: user.role,
      isActive: user.isActive 
    });
  } catch (error) {
    console.error('Google Auth Error:', error);
    res.status(401).json({ error: 'Gagal melakukan autentikasi Google' });
  }
});

export default router;
