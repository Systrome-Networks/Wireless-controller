import { Request, Response } from 'express';
import { prisma } from '@wac/database';
import { ApStatus, VendorType } from '@wac/types';

export async function listAccessPoints(req: Request, res: Response): Promise<void> {
  const orgId = req.user!.orgId;
  const vendor = req.query.vendor as VendorType | undefined;
  const status = req.query.status as ApStatus | undefined;
  const siteId = req.query.siteId as string | undefined;
  const apGroupId = req.query.apGroupId as string | undefined;
  const search = req.query.search as string | undefined;

  const where: any = { orgId };

  if (vendor) where.vendor = vendor;
  if (status) where.status = status;
  if (siteId) where.siteId = siteId;
  if (apGroupId) where.apGroupId = apGroupId;
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { ipAddress: { contains: search } },
      { macAddress: { contains: search, mode: 'insensitive' } },
      { model: { contains: search, mode: 'insensitive' } },
    ];
  }

  const aps = await prisma.accessPoint.findMany({
    where,
    include: {
      site: { select: { id: true, name: true } },
      controller: { select: { id: true, name: true, vendor: true } },
      apGroup: { select: { id: true, name: true } },
      radios: true,
      _count: { select: { wirelessClients: true } },
    },
    orderBy: { name: 'asc' },
  });

  res.json({ success: true, data: aps });
}

export async function getAccessPoint(req: Request, res: Response): Promise<void> {
  const orgId = req.user!.orgId;
  const id = req.params.id as string;

  const ap = await prisma.accessPoint.findFirst({
    where: { id, orgId },
    include: {
      site: true,
      building: true,
      controller: true,
      apGroup: {
        include: {
          apGroupSsids: {
            include: { ssid: true },
          },
        },
      },
      radios: true,
      wirelessClients: {
        include: { ssid: true },
        orderBy: { connectedAt: 'desc' },
      },
    },
  });

  if (!ap) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Access Point not found' } });
    return;
  }

  res.json({ success: true, data: ap });
}

export async function rebootAccessPoint(req: Request, res: Response): Promise<void> {
  const orgId = req.user!.orgId;
  const id = req.params.id as string;

  const ap = await prisma.accessPoint.findFirst({ where: { id, orgId } });
  if (!ap) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Access Point not found' } });
    return;
  }

  // Update AP uptime and state to simulate reboot transition
  const updated = await prisma.accessPoint.update({
    where: { id },
    data: {
      uptimeSeconds: 0,
      status: ApStatus.ONLINE as any,
      lastSeenAt: new Date(),
    },
  });

  await prisma.auditLog.create({
    data: {
      orgId,
      userId: req.user!.id,
      action: 'AP_REBOOT',
      targetType: 'ACCESS_POINT',
      targetId: id,
      ipAddress: req.ip,
      details: { name: ap.name, macAddress: ap.macAddress, vendor: ap.vendor },
    },
  });

  res.json({ success: true, data: updated, message: `Reboot sequence initiated for ${ap.name} (${ap.macAddress})` });
}
