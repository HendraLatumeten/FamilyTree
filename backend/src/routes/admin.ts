import { Router, Response, NextFunction } from 'express';
import prisma from '../prisma';
import { AuthRequest, authenticateToken } from '../middleware/auth';

const router = Router();

// Admin Middleware
const isAdmin = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId }
    });

    if (user && user.role === 'ADMIN') {
      next();
    } else {
      res.status(403).json({ error: 'Akses ditolak. Hanya untuk Admin.' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Apply auth and admin check to all routes in this router
router.use(authenticateToken);
router.use(isAdmin);

// 1. Get all users
router.get('/users', async (req: AuthRequest, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        isTreePublic: true,
        treeShareId: true,
        createdAt: true,
        _count: {
          select: { members: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// 2. Toggle User Status (Active/Inactive)
router.patch('/users/:id/status', async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { isActive } = req.body;

  try {
    const user = await prisma.user.update({
      where: { id },
      data: { isActive }
    });
    res.json({ message: `Status user ${user.name} diperbarui`, isActive: user.isActive });
  } catch (error) {
    res.status(400).json({ error: 'Gagal memperbarui status user' });
  }
});

// 3. Get all published trees
router.get('/published-trees', async (req: AuthRequest, res: Response) => {
  try {
    const trees = await prisma.user.findMany({
      where: { isTreePublic: true },
      select: {
        id: true,
        name: true,
        email: true,
        treeShareId: true,
        _count: {
          select: { members: true }
        }
      }
    });
    res.json(trees);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch published trees' });
  }
});

export default router;
