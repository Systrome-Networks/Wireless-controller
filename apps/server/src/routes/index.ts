import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { requirePermission, requireRole } from '../middleware/rbac.js';
import { UserRole } from '@wac/types';

import * as authCtrl from '../controllers/auth.controller.js';
import * as orgCtrl from '../controllers/org.controller.js';
import * as siteCtrl from '../controllers/site.controller.js';
import * as userCtrl from '../controllers/user.controller.js';
import * as auditCtrl from '../controllers/audit.controller.js';
import * as healthCtrl from '../controllers/health.controller.js';

export const router = Router();

// Liveness / readiness probes
router.get('/health', healthCtrl.healthCheck);
router.get('/ready', healthCtrl.readinessCheck);

// Authentication routes
router.post('/auth/login', authCtrl.login);
router.post('/auth/refresh', authCtrl.refresh);
router.get('/auth/me', authenticate, authCtrl.me);

// Organizations
router.get('/organizations', authenticate, requirePermission('org:read'), orgCtrl.listOrganizations);
router.get('/organizations/:id', authenticate, requirePermission('org:read'), orgCtrl.getOrganization);
router.post('/organizations', authenticate, requireRole(UserRole.SUPER_ADMIN), orgCtrl.createOrganization);

// Sites
router.get('/sites', authenticate, requirePermission('org:read'), siteCtrl.listSites);
router.get('/sites/:id', authenticate, requirePermission('org:read'), siteCtrl.getSite);
router.post('/sites', authenticate, requirePermission('org:write'), siteCtrl.createSite);

// Users
router.get('/users', authenticate, requirePermission('user:read'), userCtrl.listUsers);
router.post('/users', authenticate, requirePermission('user:write'), userCtrl.createUser);
router.patch('/users/:id', authenticate, requirePermission('user:write'), userCtrl.updateUser);

// Audit logs
router.get('/audit-logs', authenticate, requirePermission('audit:read'), auditCtrl.listAuditLogs);
