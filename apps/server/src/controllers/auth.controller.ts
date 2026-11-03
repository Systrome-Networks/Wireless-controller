import { Request, Response } from 'express';
import { z } from 'zod';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { prisma } from '@wac/database';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';
import { AuthUser } from '../middleware/auth.js';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const refreshSchema = z.object({
  refreshToken: z.string(),
});

export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = loginSchema.parse(req.body);

  const user = await prisma.user.findUnique({
    where: { email },
    include: { organization: true },
  });

  if (!user || !user.isActive) {
    res.status(401).json({
      success: false,
      error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' },
    });
    return;
  }

  if (user.lockedUntil && user.lockedUntil > new Date()) {
    res.status(403).json({
      success: false,
      error: { code: 'ACCOUNT_LOCKED', message: 'Account is temporarily locked. Try again later.' },
    });
    return;
  }

  const isValidPassword = await bcrypt.compare(password, user.passwordHash);
  if (!isValidPassword) {
    const failedLogins = user.failedLogins + 1;
    const lockedUntil = failedLogins >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null;

    await prisma.user.update({
      where: { id: user.id },
      data: { failedLogins, lockedUntil },
    });

    res.status(401).json({
      success: false,
      error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' },
    });
    return;
  }

  // Reset failed logins on success
  await prisma.user.update({
    where: { id: user.id },
    data: { failedLogins: 0, lockedUntil: null, lastLoginAt: new Date() },
  });

  const payload: AuthUser = {
    id: user.id,
    orgId: user.orgId,
    email: user.email,
    role: user.role as any,
    name: user.name,
  };

  const accessToken = jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn as any,
  });

  const refreshToken = jwt.sign({ id: user.id }, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn as any,
  });

  // Record audit log
  await prisma.auditLog.create({
    data: {
      orgId: user.orgId,
      userId: user.id,
      action: 'USER_LOGIN',
      targetType: 'USER',
      targetId: user.id,
      ipAddress: req.ip,
      details: { email: user.email },
    },
  });

  logger.info('User successfully authenticated', { userId: user.id, email: user.email, role: user.role });

  res.json({
    success: true,
    data: {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        orgId: user.orgId,
        orgName: user.organization.name,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    },
  });
}

export async function refresh(req: Request, res: Response): Promise<void> {
  const { refreshToken } = refreshSchema.parse(req.body);

  try {
    const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret) as { id: string };
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: { organization: true },
    });

    if (!user || !user.isActive) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'User account disabled or not found' },
      });
      return;
    }

    const payload: AuthUser = {
      id: user.id,
      orgId: user.orgId,
      email: user.email,
      role: user.role as any,
      name: user.name,
    };

    const newAccessToken = jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn as any,
    });

    res.json({
      success: true,
      data: {
        accessToken: newAccessToken,
      },
    });
  } catch (err) {
    res.status(401).json({
      success: false,
      error: { code: 'INVALID_TOKEN', message: 'Refresh token expired or invalid' },
    });
  }
}

export async function me(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED' } });
    return;
  }

  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    include: { organization: true },
  });

  if (!user) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'User not found' } });
    return;
  }

  res.json({
    success: true,
    data: {
      id: user.id,
      orgId: user.orgId,
      orgName: user.organization.name,
      email: user.email,
      name: user.name,
      role: user.role,
      lastLoginAt: user.lastLoginAt,
    },
  });
}
