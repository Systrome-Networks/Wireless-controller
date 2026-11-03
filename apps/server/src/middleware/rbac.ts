import { Request, Response, NextFunction } from 'express';
import { UserRole, Permission } from '@wac/types';

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.SUPER_ADMIN]: [
    'org:read', 'org:write',
    'user:read', 'user:write',
    'controller:read', 'controller:write',
    'ap:read', 'ap:write', 'ap:reboot',
    'wireless:read', 'wireless:write',
    'config:deploy', 'config:rollback',
    'radius:read', 'radius:write', 'radius:coa',
    'discovery:read', 'discovery:execute',
    'monitor:read', 'alert:manage',
    'audit:read',
  ],
  [UserRole.ORG_ADMIN]: [
    'org:read', 'org:write',
    'user:read', 'user:write',
    'controller:read', 'controller:write',
    'ap:read', 'ap:write', 'ap:reboot',
    'wireless:read', 'wireless:write',
    'config:deploy', 'config:rollback',
    'radius:read', 'radius:write', 'radius:coa',
    'discovery:read', 'discovery:execute',
    'monitor:read', 'alert:manage',
    'audit:read',
  ],
  [UserRole.NETWORK_ADMIN]: [
    'org:read',
    'controller:read', 'controller:write',
    'ap:read', 'ap:write', 'ap:reboot',
    'wireless:read', 'wireless:write',
    'config:deploy', 'config:rollback',
    'radius:read', 'radius:write', 'radius:coa',
    'discovery:read', 'discovery:execute',
    'monitor:read', 'alert:manage',
    'audit:read',
  ],
  [UserRole.WIRELESS_ADMIN]: [
    'org:read',
    'controller:read',
    'ap:read', 'ap:write', 'ap:reboot',
    'wireless:read', 'wireless:write',
    'config:deploy',
    'radius:read',
    'discovery:read',
    'monitor:read', 'alert:manage',
  ],
  [UserRole.SECURITY_ADMIN]: [
    'org:read',
    'user:read',
    'controller:read',
    'ap:read',
    'wireless:read',
    'radius:read', 'radius:write', 'radius:coa',
    'monitor:read', 'alert:manage',
    'audit:read',
  ],
  [UserRole.OPERATOR]: [
    'org:read',
    'controller:read',
    'ap:read', 'ap:reboot',
    'wireless:read',
    'radius:read',
    'discovery:read', 'discovery:execute',
    'monitor:read', 'alert:manage',
  ],
  [UserRole.AUDITOR]: [
    'org:read',
    'user:read',
    'controller:read',
    'ap:read',
    'wireless:read',
    'radius:read',
    'discovery:read',
    'monitor:read',
    'audit:read',
  ],
};

export function requirePermission(...required: Permission[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      });
      return;
    }

    const userRole = req.user.role;
    const permissions = ROLE_PERMISSIONS[userRole] || [];

    const hasPermission = required.every((p) => permissions.includes(p));
    if (!hasPermission) {
      res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: `Access denied. Role ${userRole} lacks required permissions: ${required.join(', ')}`,
        },
      });
      return;
    }

    next();
  };
}

export function requireRole(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: `Access denied. Allowed roles: ${roles.join(', ')}`,
        },
      });
      return;
    }

    next();
  };
}
