import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '@wac/database';
import { UserRole } from '@wac/types';

const createOrgSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().optional(),
});

export async function listOrganizations(req: Request, res: Response): Promise<void> {
  const user = req.user!;

  const where = user.role === UserRole.SUPER_ADMIN ? {} : { id: user.orgId };

  const orgs = await prisma.organization.findMany({
    where,
    include: {
      _count: {
        select: {
          sites: true,
          controllers: true,
          accessPoints: true,
          users: true,
        },
      },
    },
    orderBy: { name: 'asc' },
  });

  res.json({ success: true, data: orgs });
}

export async function getOrganization(req: Request, res: Response): Promise<void> {
  const user = req.user!;
  const id = req.params.id as string;

  if (user.role !== UserRole.SUPER_ADMIN && user.orgId !== id) {
    res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Unauthorized organization access' } });
    return;
  }

  const org = await prisma.organization.findUnique({
    where: { id },
    include: {
      sites: {
        include: {
          _count: { select: { accessPoints: true, buildings: true } },
        },
      },
      _count: { select: { controllers: true, accessPoints: true, users: true, ssids: true } },
    },
  });

  if (!org) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Organization not found' } });
    return;
  }

  res.json({ success: true, data: org });
}

export async function createOrganization(req: Request, res: Response): Promise<void> {
  const data = createOrgSchema.parse(req.body);

  const existing = await prisma.organization.findUnique({ where: { slug: data.slug } });
  if (existing) {
    res.status(409).json({ success: false, error: { code: 'CONFLICT', message: 'Organization slug already in use' } });
    return;
  }

  const org = await prisma.organization.create({ data });

  await prisma.auditLog.create({
    data: {
      orgId: org.id,
      userId: req.user!.id,
      action: 'ORG_CREATED',
      targetType: 'ORGANIZATION',
      targetId: org.id,
      ipAddress: req.ip,
      details: data,
    },
  });

  res.status(201).json({ success: true, data: org });
}
