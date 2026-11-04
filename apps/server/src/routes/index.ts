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
import * as controllerCtrl from '../controllers/controller.controller.js';
import * as apCtrl from '../controllers/ap.controller.js';
import * as wirelessCtrl from '../controllers/wireless.controller.js';
import * as configCtrl from '../controllers/config.controller.js';
import * as discoveryCtrl from '../controllers/discovery.controller.js';
import * as monitoringCtrl from '../controllers/monitoring.controller.js';
import * as radiusCtrl from '../controllers/radius.controller.js';

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

// Controllers
router.get('/controllers', authenticate, requirePermission('controller:read'), controllerCtrl.listControllers);
router.get('/controllers/:id', authenticate, requirePermission('controller:read'), controllerCtrl.getController);
router.post('/controllers', authenticate, requirePermission('controller:write'), controllerCtrl.registerController);
router.post('/controllers/:id/sync', authenticate, requirePermission('controller:write'), controllerCtrl.syncController);

// Access Points
router.get('/access-points', authenticate, requirePermission('ap:read'), apCtrl.listAccessPoints);
router.get('/access-points/:id', authenticate, requirePermission('ap:read'), apCtrl.getAccessPoint);
router.post('/access-points/:id/reboot', authenticate, requirePermission('ap:reboot'), apCtrl.rebootAccessPoint);

// Wireless SSIDs & AP Groups
router.get('/wireless/ssids', authenticate, requirePermission('wireless:read'), wirelessCtrl.listSsids);
router.post('/wireless/ssids', authenticate, requirePermission('wireless:write'), wirelessCtrl.createSsid);
router.get('/wireless/ap-groups', authenticate, requirePermission('wireless:read'), wirelessCtrl.listApGroups);
router.post('/wireless/ap-groups', authenticate, requirePermission('wireless:write'), wirelessCtrl.createApGroup);

// Configuration Engine
router.get('/configurations/jobs', authenticate, requirePermission('config:deploy'), configCtrl.listConfigurationJobs);
router.post('/configurations/deploy', authenticate, requirePermission('config:deploy'), configCtrl.deployConfiguration);

// Discovery
router.get('/discovery/jobs', authenticate, requirePermission('discovery:read'), discoveryCtrl.listDiscoveryJobs);
router.post('/discovery/scan', authenticate, requirePermission('discovery:execute'), discoveryCtrl.startDiscoveryScan);
router.post('/discovery/import/:id', authenticate, requirePermission('discovery:execute'), discoveryCtrl.importDiscoveredDevice);

// Monitoring & Alerts
router.get('/monitoring/metrics', authenticate, requirePermission('monitor:read'), monitoringCtrl.getMetricsSummary);
router.get('/monitoring/alerts', authenticate, requirePermission('monitor:read'), monitoringCtrl.listAlerts);
router.post('/monitoring/alerts/:id/acknowledge', authenticate, requirePermission('alert:manage'), monitoringCtrl.acknowledgeAlert);
router.post('/monitoring/alerts/:id/resolve', authenticate, requirePermission('alert:manage'), monitoringCtrl.resolveAlert);

// FreeRADIUS & AAA
router.get('/radius/nas', authenticate, requirePermission('radius:read'), radiusCtrl.listNas);
router.post('/radius/nas', authenticate, requirePermission('radius:write'), radiusCtrl.createNas);
router.get('/radius/users', authenticate, requirePermission('radius:read'), radiusCtrl.listRadiusUsers);
router.post('/radius/users', authenticate, requirePermission('radius:write'), radiusCtrl.createRadiusUser);
router.get('/radius/sessions', authenticate, requirePermission('radius:read'), radiusCtrl.listRadiusSessions);
router.post('/radius/coa', authenticate, requirePermission('radius:coa'), radiusCtrl.sendCoa);
