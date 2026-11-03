/**
 * Enterprise Multi-Vendor Wireless Access Controller (WAC)
 * Core Domain Types & Common Interfaces
 */

// ==========================================
// 1. ROLES, RBAC & TENANCY
// ==========================================

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ORG_ADMIN = 'ORG_ADMIN',
  NETWORK_ADMIN = 'NETWORK_ADMIN',
  WIRELESS_ADMIN = 'WIRELESS_ADMIN',
  SECURITY_ADMIN = 'SECURITY_ADMIN',
  OPERATOR = 'OPERATOR',
  AUDITOR = 'AUDITOR',
}

export type Permission =
  | 'org:read'
  | 'org:write'
  | 'user:read'
  | 'user:write'
  | 'controller:read'
  | 'controller:write'
  | 'ap:read'
  | 'ap:write'
  | 'ap:reboot'
  | 'wireless:read'
  | 'wireless:write'
  | 'config:deploy'
  | 'config:rollback'
  | 'radius:read'
  | 'radius:write'
  | 'radius:coa'
  | 'discovery:read'
  | 'discovery:execute'
  | 'monitor:read'
  | 'alert:manage'
  | 'audit:read';

export interface User {
  id: string;
  orgId: string;
  email: string;
  name: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Site {
  id: string;
  orgId: string;
  name: string;
  timezone: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Building {
  id: string;
  siteId: string;
  name: string;
  floorCount: number;
}

// ==========================================
// 2. VENDORS & CONTROLLERS
// ==========================================

export enum VendorType {
  CISCO = 'CISCO',
  ARUBA = 'ARUBA',
  OMADA = 'OMADA',
  UNIFI = 'UNIFI',
  RUIJIE = 'RUIJIE',
  NATIVE_CAPWAP = 'NATIVE_CAPWAP',
}

export enum ControllerStatus {
  ONLINE = 'ONLINE',
  OFFLINE = 'OFFLINE',
  DEGRADED = 'DEGRADED',
  AUTH_ERROR = 'AUTH_ERROR',
}

export interface WirelessController {
  id: string;
  orgId: string;
  siteId?: string;
  name: string;
  vendor: VendorType;
  host: string;
  port: number;
  protocol: 'https' | 'http' | 'ssh' | 'snmp';
  apiVersion?: string;
  status: ControllerStatus;
  lastSync?: Date;
  apCount: number;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

// ==========================================
// 3. ACCESS POINTS & RADIOS
// ==========================================

export enum ApStatus {
  ONLINE = 'ONLINE',
  OFFLINE = 'OFFLINE',
  PROVISIONING = 'PROVISIONING',
  JOINING = 'JOINING',
  ERROR = 'ERROR',
}

export enum RadioBand {
  BAND_2_4GHZ = '2.4GHz',
  BAND_5GHZ = '5GHz',
  BAND_6GHZ = '6GHz',
}

export interface RadioConfiguration {
  id: string;
  apId: string;
  radioIndex: number;
  band: RadioBand;
  channel: number;
  channelWidth: 20 | 40 | 80 | 160 | 320;
  txPowerDbm: number;
  adminState: 'ENABLED' | 'DISABLED';
  operationalState: 'UP' | 'DOWN';
  utilizationPercent: number;
  noiseFloorDbm: number;
  clientCount: number;
}

export interface AccessPoint {
  id: string;
  orgId: string;
  siteId?: string;
  buildingId?: string;
  controllerId?: string;
  name: string;
  macAddress: string;
  ipAddress: string;
  serialNumber?: string;
  vendor: VendorType;
  model: string;
  firmwareVersion?: string;
  status: ApStatus;
  apGroupId?: string;
  capwapState?: string;
  uptimeSeconds: number;
  cpuUsagePercent: number;
  memoryUsagePercent: number;
  connectedClientsCount: number;
  lastSeenAt: Date;
  configDrift: 'IN_SYNC' | 'DRIFT_DETECTED' | 'PENDING_DEPLOY';
  radios?: RadioConfiguration[];
}

// ==========================================
// 4. WIRELESS NETWORKS & CONFIGURATION
// ==========================================

export enum SecurityType {
  OPEN = 'OPEN',
  WPA2_PERSONAL = 'WPA2_PERSONAL',
  WPA2_ENTERPRISE = 'WPA2_ENTERPRISE',
  WPA3_PERSONAL = 'WPA3_PERSONAL',
  WPA3_ENTERPRISE = 'WPA3_ENTERPRISE',
  WPA2_WPA3_MIXED = 'WPA2_WPA3_MIXED',
}

export interface SSIDConfig {
  id?: string;
  orgId: string;
  name: string; // SSID Name
  enabled: boolean;
  broadcastSsid: boolean;
  securityType: SecurityType;
  passphrase?: string;
  vlanId: number;
  clientIsolation: boolean;
  bandSteering: boolean;
  minDataRateMbps?: number;
  bands: RadioBand[];
  radiusPrimaryIp?: string;
  radiusSecondaryIp?: string;
  radiusPort?: number;
  radiusSecret?: string;
}

export interface ApGroup {
  id: string;
  orgId: string;
  name: string;
  description?: string;
  tags?: string[];
  ssidIds: string[];
  apCount: number;
}

export enum DeploymentStatus {
  PENDING = 'PENDING',
  VALIDATING = 'VALIDATING',
  IN_PROGRESS = 'IN_PROGRESS',
  SUCCESS = 'SUCCESS',
  PARTIAL_SUCCESS = 'PARTIAL_SUCCESS',
  FAILED = 'FAILED',
  ROLLED_BACK = 'ROLLED_BACK',
  OUT_OF_SYNC = 'OUT_OF_SYNC',
}

export interface ConfigurationJob {
  id: string;
  orgId: string;
  apGroupId?: string;
  targetApIds: string[];
  status: DeploymentStatus;
  dryRun: boolean;
  initiatedByUserId: string;
  startedAt: Date;
  completedAt?: Date;
  errorSummary?: string;
  details?: Record<string, unknown>;
}

// ==========================================
// 5. WIRELESS CLIENTS
// ==========================================

export interface WirelessClient {
  id: string;
  orgId: string;
  siteId?: string;
  apId: string;
  apName?: string;
  radioBand: RadioBand;
  ssid: string;
  macAddress: string;
  ipAddress?: string;
  hostname?: string;
  vlan: number;
  rssiDbm: number;
  snrDb: number;
  rxBytes: number;
  txBytes: number;
  connectedAt: Date;
  lastSeenAt: Date;
  authMethod: string;
}

// ==========================================
// 6. FREERADIUS & AAA
// ==========================================

export interface NasDevice {
  id: string;
  nasname: string; // IP or FQDN
  shortname: string;
  type: string;
  secret: string;
  description?: string;
}

export interface RadiusUser {
  id: string;
  username: string;
  attribute: string;
  op: string;
  value: string;
  groupName?: string;
  vlanId?: number;
}

export interface RadiusAccountingSession {
  radacctid: number;
  acctsessionid: string;
  username: string;
  nasipaddress: string;
  nasportid?: string;
  acctstarttime: Date;
  acctstoptime?: Date;
  acctsessiontime?: number;
  acctinputoctets: number;
  acctoutputoctets: number;
  calledstationid?: string;
  callingstationid?: string; // Client MAC
  terminatecause?: string;
  framedipaddress?: string;
}

export interface CoaRequest {
  nasIp: string;
  clientMac: string;
  clientIp?: string;
  sessionTimeout?: number;
  vlanId?: number;
  action: 'DISCONNECT' | 'REAUTH' | 'CHANGE_VLAN';
}

// ==========================================
// 7. DISCOVERY & SNMP
// ==========================================

export interface DiscoveryScanRequest {
  orgId: string;
  siteId?: string;
  subnetRange: string; // e.g. "192.168.1.0/24"
  snmpVersion: 'v2c' | 'v3';
  community?: string;
  v3User?: string;
  v3AuthKey?: string;
  v3PrivKey?: string;
  timeoutMs?: number;
  concurrency?: number;
}

export interface DiscoveredDevice {
  ip: string;
  mac?: string;
  sysDescr?: string;
  vendor: VendorType;
  model?: string;
  serialNumber?: string;
  status: 'NEW' | 'IMPORTED' | 'IGNORED';
  discoveredAt: Date;
}

// ==========================================
// 8. MONITORING, ALERTS & WEBSOCKET
// ==========================================

export enum AlertSeverity {
  CRITICAL = 'CRITICAL',
  WARNING = 'WARNING',
  INFO = 'INFO',
}

export interface Alert {
  id: string;
  orgId: string;
  title: string;
  message: string;
  severity: AlertSeverity;
  targetType: 'AP' | 'CONTROLLER' | 'SSID' | 'RADIUS' | 'SYSTEM';
  targetId: string;
  status: 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED';
  triggeredAt: Date;
  resolvedAt?: Date;
}

export interface WebSocketEvent<T = unknown> {
  type:
    | 'TELEMETRY_UPDATE'
    | 'AP_STATUS_CHANGE'
    | 'ALERT_TRIGGERED'
    | 'ALERT_RESOLVED'
    | 'DEPLOYMENT_PROGRESS'
    | 'DISCOVERY_UPDATE';
  orgId: string;
  timestamp: string;
  payload: T;
}
