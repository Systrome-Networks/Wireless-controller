import { Request, Response } from 'express';
import { prisma } from '@wac/database';

export async function healthCheck(req: Request, res: Response): Promise<void> {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    service: 'wac-api-server',
    version: '1.0.0',
  });
}

export async function readinessCheck(req: Request, res: Response): Promise<void> {
  try {
    // Ping database
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: 'ready',
      database: 'connected',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    res.status(503).json({
      status: 'not_ready',
      database: 'disconnected',
      error: error.message,
    });
  }
}
