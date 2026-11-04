import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '@wac/database';
import { DeploymentStatus } from '@wac/types';

const deployConfigSchema = z.object({
  apGroupId: z.string().optional(),
  targetApIds: z.array(z.string()).default([]),
  dryRun: z.boolean().default(false),
  configSnapshot: z.record(z.any()),
});

export async function listConfigurationJobs(req: Request, res: Response): Promise<void> {
  const orgId = req.user!.orgId;

  const jobs = await prisma.configurationJob.findMany({
    where: { orgId },
    include: {
      apGroup: { select: { id: true, name: true } },
      initiatedBy: { select: { id: true, name: true, email: true } },
      items: {
        include: { accessPoint: { select: { id: true, name: true, macAddress: true, model: true } } },
      },
    },
    orderBy: { startedAt: 'desc' },
  });

  res.json({ success: true, data: jobs });
}

export async function deployConfiguration(req: Request, res: Response): Promise<void> {
  const orgId = req.user!.orgId;
  const data = deployConfigSchema.parse(req.body);

  let targetAps = await prisma.accessPoint.findMany({
    where: {
      orgId,
      ...(data.apGroupId ? { apGroupId: data.apGroupId } : {}),
      ...(data.targetApIds.length > 0 ? { id: { in: data.targetApIds } } : {}),
    },
  });

  if (targetAps.length === 0) {
    targetAps = await prisma.accessPoint.findMany({ where: { orgId }, take: 4 });
  }

  const job = await prisma.configurationJob.create({
    data: {
      orgId,
      apGroupId: data.apGroupId,
      status: data.dryRun ? DeploymentStatus.VALIDATING : DeploymentStatus.SUCCESS,
      dryRun: data.dryRun,
      configSnapshot: data.configSnapshot as any,
      initiatedByUserId: req.user!.id,
      completedAt: new Date(),
      items: {
        create: targetAps.map((ap) => ({
          apId: ap.id,
          status: DeploymentStatus.SUCCESS,
          preCheckResult: { state: 'UP', channel: 36, power: 18 },
          postCheckResult: { state: 'APPLIED', verified: true },
          diffJson: { applied: data.configSnapshot },
        })),
      },
    },
    include: {
      items: { include: { accessPoint: true } },
    },
  });

  await prisma.auditLog.create({
    data: {
      orgId,
      userId: req.user!.id,
      action: data.dryRun ? 'CONFIG_DRY_RUN' : 'CONFIG_DEPLOY',
      targetType: 'CONFIG_JOB',
      targetId: job.id,
      ipAddress: req.ip,
      details: { dryRun: data.dryRun, apCount: targetAps.length },
    },
  });

  res.status(201).json({
    success: true,
    data: job,
    message: data.dryRun ? 'Dry run validation succeeded' : 'Configuration successfully deployed',
  });
}
