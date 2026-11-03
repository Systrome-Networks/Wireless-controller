import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '@wac/database';

const siteSchema = z.object({
  name: z.string().min(2),
  timezone: z.string().default('UTC'),
  address: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export async function listSites(req: Request, res: Response): Promise<void> {
  const orgId = req.user!.orgId;

  const sites = await prisma.site.findMany({
    where: { orgId },
    include: {
      buildings: {
        include: { floors: true },
      },
      _count: {
        select: {
          accessPoints: true,
          wirelessClients: true,
          controllers: true,
        },
      },
    },
    orderBy: { name: 'asc' },
  });

  res.json({ success: true, data: sites });
}

export async function getSite(req: Request, res: Response): Promise<void> {
  const orgId = req.user!.orgId;
  const id = req.params.id as string;

  const site = await prisma.site.findFirst({
    where: { id, orgId },
    include: {
      buildings: { include: { floors: true } },
      accessPoints: {
        select: {
          id: true,
          name: true,
          ipAddress: true,
          macAddress: true,
          vendor: true,
          model: true,
          status: true,
          connectedClientsCount: true,
        },
      },
      _count: { select: { wirelessClients: true, controllers: true } },
    },
  });

  if (!site) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Site not found' } });
    return;
  }

  res.json({ success: true, data: site });
}

export async function createSite(req: Request, res: Response): Promise<void> {
  const orgId = req.user!.orgId;
  const data = siteSchema.parse(req.body);

  const site = await prisma.site.create({
    data: {
      orgId,
      ...data,
    },
  });

  await prisma.auditLog.create({
    data: {
      orgId,
      userId: req.user!.id,
      action: 'SITE_CREATED',
      targetType: 'SITE',
      targetId: site.id,
      ipAddress: req.ip,
      details: data,
    },
  });

  res.status(201).json({ success: true, data: site });
}
