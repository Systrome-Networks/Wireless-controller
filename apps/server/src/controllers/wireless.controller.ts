import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '@wac/database';
import { SecurityType } from '@wac/types';

const createSsidSchema = z.object({
  name: z.string().min(1),
  enabled: z.boolean().default(true),
  broadcastSsid: z.boolean().default(true),
  securityType: z.nativeEnum(SecurityType).default(SecurityType.WPA2_PERSONAL),
  passphrase: z.string().optional(),
  vlanId: z.number().int().min(1).max(4094).default(1),
  clientIsolation: z.boolean().default(false),
  bandSteering: z.boolean().default(true),
  minDataRateMbps: z.number().optional().default(12),
  bands: z.array(z.string()).default(['BAND_2_4GHZ', 'BAND_5GHZ']),
  radiusPrimaryIp: z.string().optional(),
  radiusSecondaryIp: z.string().optional(),
  radiusPort: z.number().optional().default(1812),
  radiusSecret: z.string().optional(),
});

const createApGroupSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  tags: z.array(z.string()).default([]),
  ssidIds: z.array(z.string()).default([]),
});

export async function listSsids(req: Request, res: Response): Promise<void> {
  const orgId = req.user!.orgId;

  const ssids = await prisma.ssid.findMany({
    where: { orgId },
    include: {
      apGroupSsids: {
        include: { apGroup: { select: { id: true, name: true } } },
      },
      _count: { select: { wirelessClients: true } },
    },
    orderBy: { name: 'asc' },
  });

  res.json({ success: true, data: ssids });
}

export async function createSsid(req: Request, res: Response): Promise<void> {
  const orgId = req.user!.orgId;
  const data = createSsidSchema.parse(req.body);

  const existing = await prisma.ssid.findUnique({
    where: { orgId_name: { orgId, name: data.name } },
  });
  if (existing) {
    res.status(409).json({ success: false, error: { code: 'CONFLICT', message: 'SSID with this name already exists' } });
    return;
  }

  const ssid = await prisma.ssid.create({
    data: {
      orgId,
      ...data,
      bands: data.bands as any,
    },
  });

  await prisma.auditLog.create({
    data: {
      orgId,
      userId: req.user!.id,
      action: 'SSID_CREATED',
      targetType: 'SSID',
      targetId: ssid.id,
      ipAddress: req.ip,
      details: { name: ssid.name, security: ssid.securityType, vlan: ssid.vlanId },
    },
  });

  res.status(201).json({ success: true, data: ssid });
}

export async function listApGroups(req: Request, res: Response): Promise<void> {
  const orgId = req.user!.orgId;

  const groups = await prisma.apGroup.findMany({
    where: { orgId },
    include: {
      apGroupSsids: {
        include: { ssid: true },
      },
      _count: { select: { accessPoints: true } },
    },
    orderBy: { name: 'asc' },
  });

  res.json({ success: true, data: groups });
}

export async function createApGroup(req: Request, res: Response): Promise<void> {
  const orgId = req.user!.orgId;
  const data = createApGroupSchema.parse(req.body);

  const group = await prisma.apGroup.create({
    data: {
      orgId,
      name: data.name,
      description: data.description,
      tags: data.tags as any,
      apGroupSsids: {
        create: data.ssidIds.map((ssidId) => ({
          ssidId,
        })),
      },
    },
    include: {
      apGroupSsids: { include: { ssid: true } },
    },
  });

  await prisma.auditLog.create({
    data: {
      orgId,
      userId: req.user!.id,
      action: 'AP_GROUP_CREATED',
      targetType: 'AP_GROUP',
      targetId: group.id,
      ipAddress: req.ip,
      details: { name: group.name },
    },
  });

  res.status(201).json({ success: true, data: group });
}
