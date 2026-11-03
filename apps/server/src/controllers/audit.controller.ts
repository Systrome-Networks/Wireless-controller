import { Request, Response } from 'express';
import { prisma } from '@wac/database';

export async function listAuditLogs(req: Request, res: Response): Promise<void> {
  const orgId = req.user!.orgId;
  const page = parseInt((req.query.page as string) || '1', 10);
  const limit = parseInt((req.query.limit as string) || '50', 10);
  const skip = (page - 1) * limit;

  const [total, logs] = await Promise.all([
    prisma.auditLog.count({ where: { orgId } }),
    prisma.auditLog.findMany({
      where: { orgId },
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
  ]);

  res.json({
    success: true,
    data: {
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    },
  });
}
