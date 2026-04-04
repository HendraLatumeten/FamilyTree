import { Router, Response } from 'express';
import crypto from 'crypto';
import multer from 'multer';
import path from 'path';
import prisma from '../prisma';
import { AuthRequest, authenticateToken } from '../middleware/auth';

const router = Router();

// Multer Config - USE ABSOLUTE RESOLVED PATH
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dest = path.resolve(__dirname, '../../uploads');
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'member-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    console.log(`[BACKEND] Incoming photo upload: ${file.originalname} (${file.mimetype})`);
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only images are allowed'));
    }
  }
});

// PUBLIC ROUTE (No Auth Required)
router.get('/public/:shareId', async (req: any, res: Response) => {
  const { shareId } = req.params;
  try {
    const user = await prisma.user.findUnique({
      where: { treeShareId: shareId, isTreePublic: true },
      include: {
        members: true,
        relationships: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'Tree not found or private' });
    }

    res.json({ members: user.members, relationships: user.relationships });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.use(authenticateToken);

// PROTECTED PUBLISH ROUTE
router.patch('/publish', async (req: AuthRequest, res: Response) => {
  try {
    const shareId = crypto.randomUUID();
    const user = await prisma.user.update({
      where: { id: req.userId! },
      data: {
        treeShareId: shareId,
        isTreePublic: true,
      },
    });

    res.json({ shareId: user.treeShareId });
  } catch (error: any) {
    console.error('Publish Error:', error);
    res.status(400).json({ error: 'Failed to publish tree' });
  }
});

router.get('/members', async (req: AuthRequest, res: Response) => {
  const members = await prisma.member.findMany({
    where: { userId: req.userId! },
  });
  res.json(members);
});

router.post('/members', async (req: AuthRequest, res: Response) => {
  const { name, gender, birthDate } = req.body;
  try {
    const member = await prisma.member.create({
      data: {
        userId: req.userId!,
        name,
        gender,
        title: req.body.title || null,
        photoUrl: req.body.photoUrl || null,
        birthDate: birthDate ? new Date(birthDate) : null,
      },
    });
    res.status(201).json(member);
  } catch (error: any) {
    console.error('Add Member Error:', error);
    res.status(400).json({ error: error.message || 'Invalid data' });
  }
});

router.post('/relationship', async (req: AuthRequest, res: Response) => {
  const { fromMemberId, toMemberId, relationshipType } = req.body;
  try {
    const relationship = await prisma.relationship.create({
      data: {
        userId: req.userId!,
        fromMemberId,
        toMemberId,
        relationshipType,
      },
    });
    res.status(201).json(relationship);
  } catch (error) {
    res.status(400).json({ error: 'Invalid data' });
  }
});

router.get('/tree', async (req: AuthRequest, res: Response) => {
  try {
    const members = await prisma.member.findMany({
      where: { userId: req.userId! },
    });
    const relationships = await prisma.relationship.findMany({
      where: { userId: req.userId! },
    });
    res.json({ members, relationships });
  } catch (error: any) {
    console.error('[BACKEND] Error fetching family tree:', error);
    res.status(500).json({ error: 'Gagal mengambil data silsilah keluarga' });
  }
});

router.patch('/members/:id', async (req: AuthRequest, res: Response) => {
  const id = req.params.id as string;
  const { name, title, photoUrl } = req.body;
  try {
    const member = await prisma.member.update({
      where: { id, userId: req.userId! },
      data: { 
        ...(name && { name }),
        ...(title !== undefined && { title }),
        ...(photoUrl !== undefined && { photoUrl }),
      },
    });
    res.json(member);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update member' });
  }
});

router.post('/members/:id/photo', upload.single('photo'), async (req: AuthRequest, res: Response) => {
  const id = req.params.id as string;
  console.log(`[BACKEND] Processing photo for member: ${id}`);
  
  if (!req.file) {
    console.warn(`[BACKEND] Photo upload failed: No file received`);
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    const photoUrl = `/uploads/${req.file.filename}`;
    console.log(`[BACKEND] Photo saved at: ${photoUrl}`);
    
    const member = await prisma.member.update({
      where: { id, userId: req.userId! },
      data: { photoUrl },
    });
    
    console.log(`[BACKEND] Database updated for member ${id}. PhotoUrl: ${member.photoUrl}`);
    res.json(member);
  } catch (error: any) {
    console.error(`[BACKEND] Error updating member photo:`, error);
    res.status(400).json({ error: 'Failed to update member photo' });
  }
});

router.patch('/members/bulk/positions', async (req: AuthRequest, res: Response) => {
  const { positions } = req.body; // Array of { id, posX, posY }
  try {
    await prisma.$transaction(
      positions.map((p: any) => 
        prisma.member.update({
          where: { id: p.id, userId: req.userId! },
          data: { posX: p.posX, posY: p.posY },
        })
      )
    );
    res.json({ message: 'All positions updated' });
  } catch (error) {
    res.status(400).json({ error: 'Failed to update positions' });
  }
});

router.patch('/members/:id/position', async (req: AuthRequest, res: Response) => {
  const id = req.params.id as string;
  const { posX, posY } = req.body;
  try {
    await prisma.member.update({
      where: { id, userId: req.userId! },
      data: { posX, posY },
    });
    res.json({ message: 'Position updated' });
  } catch (error) {
    res.status(400).json({ error: 'Failed to update position' });
  }
});

router.delete('/members/:id', async (req: AuthRequest, res: Response) => {
  const id = req.params.id as string;
  try {
    // Delete relationships first due to FK constraints
    await prisma.relationship.deleteMany({
      where: {
        userId: req.userId!,
        OR: [{ fromMemberId: id }, { toMemberId: id }],
      },
    });
    await prisma.member.delete({
      where: { id, userId: req.userId! },
    });
    res.json({ message: 'Member deleted' });
  } catch (error) {
    res.status(400).json({ error: 'Failed to delete member' });
  }
});

router.post('/members/sync', async (req: AuthRequest, res: Response) => {
  const { newMembers, newRelationships, positions } = req.body;
  try {
    const result = await prisma.$transaction(async (tx: any) => {
      const idMap: Record<string, string> = {};

      // 1. Create new members and store ID mapping
      for (const m of (newMembers || [])) {
        const created = await tx.member.create({
          data: {
            userId: req.userId!,
            name: m.name,
            gender: m.gender,
            title: m.title || null,
            photoUrl: m.photoUrl || null,
            posX: m.posX,
            posY: m.posY,
          },
        });
        idMap[m.id] = created.id;
      }

      // 2. Create new relationships with substituted IDs
      for (const r of (newRelationships || [])) {
        const fromId = idMap[r.fromMemberId] || r.fromMemberId;
        const toId = idMap[r.toMemberId] || r.toMemberId;
        await tx.relationship.create({
          data: {
            userId: req.userId!,
            fromMemberId: fromId,
            toMemberId: toId,
            relationshipType: r.relationshipType,
          },
        });
      }

      // 3. Update positions for existing members
      for (const p of (positions || [])) {
        // Only update if not a new member (already handled in step 1 if new)
        if (!idMap[p.id]) {
          await tx.member.update({
            where: { id: p.id, userId: req.userId! },
            data: { posX: p.posX, posY: p.posY },
          });
        }
      }
      return { message: 'Sync complete' };
    });
    res.json(result);
  } catch (error: any) {
    console.error('Sync Error:', error);
    res.status(400).json({ error: error.message || 'Failed to sync' });
  }
});

export default router;
