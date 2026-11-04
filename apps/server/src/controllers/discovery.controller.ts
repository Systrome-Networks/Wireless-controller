import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '@wac/database';
import { VendorType, ApStatus } from '@wac/types';
import { DiscoveryStatus } from '@prisma/client';

const startScanSchema = z.object({
  siteId: z.string().optional(),
  subnetRange: z.string().min(5), // e.g. "192.168.1.0/24"
  snmpVersion: z.enum(['v2c', 'v3']).default('v2c'),
  community: z.string().default('public'),
});

export async function listDiscoveryJobs(req: Request, res: Response): Promise<void> {
  const orgId = req.user!.orgId;

  const jobs = await prisma.discoveryJob.findMany({
    where: { orgId },
    include: {
      devices: true,
    },
    orderBy: { startedAt: 'desc' },
  });

  res.json({ success: true, data: jobs });
}

export async function startDiscoveryScan(req: Request, res: Response): Promise<void> {
  const orgId = req.user!.orgId;
  const data = startScanSchema.parse(req.body);

  // Generate simulated discovered devices for the scanned subnet range
  const mockDevices = [
    { ip: '10.10.1.150', mac: '00:2A:6A:99:88:01', sysDescr: 'Cisco IOS-XE C9130AX AP', vendor: VendorType.CISCO, model: 'Catalyst 9130AX', serial: 'FOC241901AA' },
    { ip: '10.10.1.151', mac: '00:0B:86:77:66:01', sysDescr: 'ArubaOS AP-555 Wi-Fi 6', vendor: VendorType.ARUBA, model: 'AP-555', serial: 'CN9812401BB' },
    { ip: '10.10.1.152', mac: '50:D4:F7:33:22:01', sysDescr: 'TP-Link Omada EAP670', vendor: VendorType.OMADA, model: 'EAP670', serial: '221498101CC' },
    { ip: '10.10.1.153', mac: '74:83:C2:55:44:01', sysDescr: 'Ubiquiti UniFi U6-Enterprise', vendor: VendorType.UNIFI, model: 'U6-Enterprise', serial: 'U6ENT01DD' },
  ];

  const job = await prisma.discoveryJob.create({
    data: {
      orgId,
      siteId: data.siteId,
      subnetRange: data.subnetRange,
      snmpVersion: data.snmpVersion,
      community: data.community,
      status: DiscoveryStatus.COMPLETED as any,
      discoveredDevicesCount: mockDevices.length,
      completedAt: new Date(),
      devices: {
        create: mockDevices.map((d) => ({
          ip: d.ip,
          mac: d.mac,
          sysDescr: d.sysDescr,
          vendor: d.vendor as any,
          model: d.model,
          serialNumber: d.serial,
          status: 'NEW',
        })),
      },
    },
    include: { devices: true },
  });

  await prisma.auditLog.create({
    data: {
      orgId,
      userId: req.user!.id,
      action: 'DISCOVERY_SCAN',
      targetType: 'DISCOVERY_JOB',
      targetId: job.id,
      ipAddress: req.ip,
      details: { subnet: data.subnetRange, count: mockDevices.length },
    },
  });

  res.status(201).json({ success: true, data: job, message: `Discovered ${mockDevices.length} access points in ${data.subnetRange}` });
}

export async function importDiscoveredDevice(req: Request, res: Response): Promise<void> {
  const orgId = req.user!.orgId;
  const id = req.params.id as string;

  const device = await prisma.discoveredDevice.findUnique({
    where: { id },
    include: { job: true },
  });

  if (!device || device.job.orgId !== orgId) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Device not found' } });
    return;
  }

  // Create new AccessPoint in inventory
  const ap = await prisma.accessPoint.create({
    data: {
      orgId,
      name: `AP-${device.vendor}-${device.ip.split('.').pop()}`,
      macAddress: device.mac || `02:00:00:${Math.floor(Math.random() * 89 + 10)}:00:01`,
      ipAddress: device.ip,
      serialNumber: device.serialNumber || `SN-${device.id.substring(0, 8)}`,
      vendor: device.vendor,
      model: device.model || 'Universal 802.11ax AP',
      status: ApStatus.ONLINE as any,
      uptimeSeconds: 3600,
      cpuUsagePercent: 12.0,
      memoryUsagePercent: 35.0,
      connectedClientsCount: 0,
    },
  });

  // Mark device as IMPORTED
  await prisma.discoveredDevice.update({
    where: { id },
    data: { status: 'IMPORTED' },
  });

  res.status(201).json({ success: true, data: ap, message: `Imported ${ap.name} into AP Inventory` });
}
