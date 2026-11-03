import { Request, Response } from 'express';
import { z } from 'zod';
import * as bcrypt from 'bcrypt';
import { prisma } from '@wac/database';
import { UserRole } from '@wac/types';

const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  password: z.string().min(8),
  role: z.nativeEnum(UserRole),
});

const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  role: z.nativeEnum(UserRole).optional(),
  isActive: z.boolean().optional(),
});

export async function listUsers(req: Request, res: Response): Promise<void> {
  const orgId = req.user!.orgId;

  const users = await prisma.user.findMany({
    where: { orgId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true,
      lastLoginAt: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  res.json({ success: true, data: users });
}

export async function createUser(req: Request, res: Response): Promise<void> {
  const orgId = req.user!.orgId;
  const data = createUserSchema.parse(req.body);

  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) {
    res.status(409).json({ success: false, error: { code: 'CONFLICT', message: 'Email already registered' } });
    return;
  }

  const passwordHash = await bcrypt.hash(data.password, 10);

  const user = await prisma.user.create({
    data: {
      orgId,
      email: data.email,
      name: data.name,
      passwordHash,
      role: data.role as any,
      isActive: true,
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  });

  await prisma.auditLog.create({
    data: {
      orgId,
      userId: req.user!.id,
      action: 'USER_CREATED',
      targetType: 'USER',
      targetId: user.id,
      ipAddress: req.ip,
      details: { email: user.email, role: user.role },
    },
  });

  res.status(201).json({ success: true, data: user });
}

export async function updateUser(req: Request, res: Response): Promise<void> {
  const orgId = req.user!.orgId;
  const id = req.params.id as string;
  const data = updateUserSchema.parse(req.body);

  const existing = await prisma.user.findFirst({ where: { id, orgId } });
  if (!existing) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'User not found' } });
    return;
  }

  const updated = await prisma.user.update({
    where: { id },
    data: {
      ...(data.name && { name: data.name }),
      ...(data.role && { role: data.role as any }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true,
      updatedAt: true,
    },
  });

  await prisma.auditLog.create({
    data: {
      orgId,
      userId: req.user!.id,
      action: 'USER_UPDATED',
      targetType: 'USER',
      targetId: updated.id,
      ipAddress: req.ip,
      details: data,
    },
  });

  res.json({ success: true, data: updated });
}
