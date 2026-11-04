import { Request, Response } from 'express';
import { prisma } from '@wac/database';
import { AlertStatus } from '@prisma/client';

export async function getMetricsSummary(req: Request, res: Response): Promise<void> {
  const orgId = req.user!.orgId;

  const [totalAps, onlineAps, offlineAps, totalClients, controllersCount, activeAlertsCount, radios] = await Promise.all([
    prisma.accessPoint.count({ where: { orgId } }),
    prisma.accessPoint.count({ where: { orgId, status: 'ONLINE' } }),
    prisma.accessPoint.count({ where: { orgId, status: 'OFFLINE' } }),
    prisma.wirelessClient.count({ where: { orgId } }),
    prisma.wirelessController.count({ where: { orgId } }),
    prisma.alert.count({ where: { orgId, status: 'ACTIVE' } }),
    prisma.radio.findMany({
      where: { accessPoint: { orgId } },
      select: { band: true, channel: true, utilizationPercent: true, clientCount: true },
    }),
  ]);

  // Aggregate channel utilization
  const channelStats = radios.map((r) => ({
    band: r.band,
    channel: r.channel,
    utilization: r.utilizationPercent,
    clients: r.clientCount,
  }));

  res.json({
    success: true,
    data: {
      totalAps,
      onlineAps,
      offlineAps,
      totalClients,
      controllersCount,
      activeAlertsCount,
      channelStats,
    },
  });
}

export async function listAlerts(req: Request, res: Response): Promise<void> {
  const orgId = req.user!.orgId;

  const alerts = await prisma.alert.findMany({
    where: { orgId },
    include: {
      acknowledgedBy: { select: { id: true, name: true, email: true } },
    },
    orderBy: { triggeredAt: 'desc' },
  });

  res.json({ success: true, data: alerts });
}

export async function acknowledgeAlert(req: Request, res: Response): Promise<void> {
  const orgId = req.user!.orgId;
  const id = req.params.id as string;

  const alert = await prisma.alert.findFirst({ where: { id, orgId } });
  if (!alert) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Alert not found' } });
    return;
  }

  const updated = await prisma.alert.update({
    where: { id },
    data: {
      status: AlertStatus.ACKNOWLEDGED as any,
      acknowledgedByUserId: req.user!.id,
    },
  });

  res.json({ success: true, data: updated });
}

export async function resolveAlert(req: Request, res: Response): Promise<void> {
  const orgId = req.user!.orgId;
  const id = req.params.id as string;

  const alert = await prisma.alert.findFirst({ where: { id, orgId } });
  if (!alert) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Alert not found' } });
    return;
  }

  const updated = await prisma.alert.update({
    where: { id },
    data: {
      status: AlertStatus.RESOLVED as any,
      resolvedAt: new Date(),
    },
  });

  res.json({ success: true, data: updated });
}
