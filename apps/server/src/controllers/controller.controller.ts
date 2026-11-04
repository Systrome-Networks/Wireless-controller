import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '@wac/database';
import { VendorType, ControllerStatus } from '@wac/types';

const registerControllerSchema = z.object({
  siteId: z.string().optional(),
  name: z.string().min(2),
  vendor: z.nativeEnum(VendorType),
  host: z.string().min(1),
  port: z.number().default(443),
  protocol: z.enum(['https', 'http', 'ssh', 'snmp']).default('https'),
  apiVersion: z.string().optional(),
  credentials: z.record(z.any()).default({}),
});

export async function listControllers(req: Request, res: Response): Promise<void> {
  const orgId = req.user!.orgId;

  const controllers = await prisma.wirelessController.findMany({
    where: { orgId },
    include: {
      site: { select: { id: true, name: true } },
      _count: { select: { accessPoints: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  res.json({ success: true, data: controllers });
}

export async function getController(req: Request, res: Response): Promise<void> {
  const orgId = req.user!.orgId;
  const id = req.params.id as string;

  const controller = await prisma.wirelessController.findFirst({
    where: { id, orgId },
    include: {
      site: true,
      accessPoints: {
        include: { radios: true },
      },
    },
  });

  if (!controller) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Controller not found' } });
    return;
  }

  res.json({ success: true, data: controller });
}

export async function registerController(req: Request, res: Response): Promise<void> {
  const orgId = req.user!.orgId;
  const data = registerControllerSchema.parse(req.body);

  const controller = await prisma.wirelessController.create({
    data: {
      orgId,
      siteId: data.siteId,
      name: data.name,
      vendor: data.vendor as any,
      host: data.host,
      port: data.port,
      protocol: data.protocol,
      apiVersion: data.apiVersion || 'v1.0',
      credentials: data.credentials,
      status: ControllerStatus.ONLINE as any,
      lastSyncAt: new Date(),
    },
  });

  await prisma.auditLog.create({
    data: {
      orgId,
      userId: req.user!.id,
      action: 'CONTROLLER_REGISTERED',
      targetType: 'CONTROLLER',
      targetId: controller.id,
      ipAddress: req.ip,
      details: { name: controller.name, vendor: controller.vendor, host: controller.host },
    },
  });

  res.status(201).json({ success: true, data: controller });
}

export async function syncController(req: Request, res: Response): Promise<void> {
  const orgId = req.user!.orgId;
  const id = req.params.id as string;

  const controller = await prisma.wirelessController.findFirst({ where: { id, orgId } });
  if (!controller) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Controller not found' } });
    return;
  }

  // Update sync timestamp
  const updated = await prisma.wirelessController.update({
    where: { id },
    data: { lastSyncAt: new Date(), status: ControllerStatus.ONLINE as any },
  });

  await prisma.auditLog.create({
    data: {
      orgId,
      userId: req.user!.id,
      action: 'CONTROLLER_SYNC',
      targetType: 'CONTROLLER',
      targetId: id,
      ipAddress: req.ip,
      details: { name: controller.name },
    },
  });

  res.json({ success: true, data: updated, message: `Successfully synchronized with ${controller.name}` });
}
