import { PrismaClient, UserRole, VendorType, ApStatus, RadioBand, SecurityType, AlertSeverity } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // 1. Create Organization
  const org = await prisma.organization.upsert({
    where: { slug: 'acme-corp' },
    update: {},
    create: {
      name: 'Acme Global Networks',
      slug: 'acme-corp',
      description: 'Enterprise Enterprise Campus and Remote Branches',
      settings: {
        alertNotificationsEmail: 'alerts@acme.com',
        snmpDefaultCommunity: 'public',
        syslogServer: '10.10.1.50:514',
      },
    },
  });
  console.log(`✅ Organization created: ${org.name} (${org.id})`);

  // 2. Create Sites & Buildings
  const siteHq = await prisma.site.create({
    data: {
      orgId: org.id,
      name: 'Headquarters - San Jose',
      timezone: 'America/Los_Angeles',
      address: '100 Innovation Way, San Jose, CA',
      latitude: 37.3382,
      longitude: -121.8863,
    },
  });

  const siteBranch = await prisma.site.create({
    data: {
      orgId: org.id,
      name: 'Branch Office - Austin',
      timezone: 'America/Chicago',
      address: '200 Silicon Hills Blvd, Austin, TX',
      latitude: 30.2672,
      longitude: -97.7431,
    },
  });

  const bldgHq = await prisma.building.create({
    data: {
      siteId: siteHq.id,
      name: 'Building A (Engineering)',
      floorCount: 3,
    },
  });

  await prisma.floor.createMany({
    data: [
      { buildingId: bldgHq.id, floorNumber: 1, name: 'Ground Floor / Reception' },
      { buildingId: bldgHq.id, floorNumber: 2, name: 'Level 2 Engineering Lab' },
      { buildingId: bldgHq.id, floorNumber: 3, name: 'Level 3 Executive' },
    ],
  });

  // 3. Create Users
  const passwordHash = await bcrypt.hash('Admin123!@#', 10);
  const usersData = [
    { email: 'admin@wac.network', name: 'Master Super Administrator', role: UserRole.SUPER_ADMIN },
    { email: 'orgadmin@acme.com', name: 'Sarah Connor (Org Admin)', role: UserRole.ORG_ADMIN },
    { email: 'netadmin@acme.com', name: 'Alex Murphy (Network Admin)', role: UserRole.NETWORK_ADMIN },
    { email: 'wireless@acme.com', name: 'Miles Dyson (Wireless Admin)', role: UserRole.WIRELESS_ADMIN },
    { email: 'security@acme.com', name: 'Ellen Ripley (Security Admin)', role: UserRole.SECURITY_ADMIN },
    { email: 'operator@acme.com', name: 'John Matrix (NOC Operator)', role: UserRole.OPERATOR },
    { email: 'auditor@acme.com', name: 'Arthur Dent (Auditor)', role: UserRole.AUDITOR },
  ];

  for (const u of usersData) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        orgId: org.id,
        email: u.email,
        passwordHash,
        name: u.name,
        role: u.role,
        isActive: true,
      },
    });
  }
  console.log(`✅ ${usersData.length} users created across all RBAC tiers`);

  // 4. Create Multi-Vendor Controllers
  const controllers = await Promise.all([
    prisma.wirelessController.create({
      data: {
        orgId: org.id,
        siteId: siteHq.id,
        name: 'HQ-Cisco-C9800-Cluster',
        vendor: VendorType.CISCO,
        host: '10.10.1.10',
        port: 443,
        protocol: 'https',
        apiVersion: 'v17.9',
        status: 'ONLINE',
        apCount: 24,
        credentials: { username: 'admin', authType: 'token' },
      },
    }),
    prisma.wirelessController.create({
      data: {
        orgId: org.id,
        siteId: siteHq.id,
        name: 'HQ-Aruba-Mobility-Conductor',
        vendor: VendorType.ARUBA,
        host: '10.10.2.10',
        port: 4343,
        protocol: 'https',
        apiVersion: 'v10.4',
        status: 'ONLINE',
        apCount: 18,
        credentials: { username: 'admin', authType: 'token' },
      },
    }),
    prisma.wirelessController.create({
      data: {
        orgId: org.id,
        siteId: siteBranch.id,
        name: 'Austin-Omada-SDN-Controller',
        vendor: VendorType.OMADA,
        host: '10.10.3.10',
        port: 8043,
        protocol: 'https',
        apiVersion: 'v5.12',
        status: 'ONLINE',
        apCount: 12,
        credentials: { omadacId: 'omada-hq-site', authType: 'openapi' },
      },
    }),
    prisma.wirelessController.create({
      data: {
        orgId: org.id,
        siteId: siteBranch.id,
        name: 'Austin-UniFi-Cloud-Gateway',
        vendor: VendorType.UNIFI,
        host: '10.10.4.10',
        port: 8443,
        protocol: 'https',
        apiVersion: 'v8.1',
        status: 'ONLINE',
        apCount: 8,
        credentials: { apiKey: 'unifi_api_key_sample' },
      },
    }),
    prisma.wirelessController.create({
      data: {
        orgId: org.id,
        siteId: siteBranch.id,
        name: 'Ruijie-Cloud-Controller',
        vendor: VendorType.RUIJIE,
        host: '10.10.5.10',
        port: 443,
        protocol: 'https',
        apiVersion: 'v3.0',
        status: 'ONLINE',
        apCount: 6,
        credentials: { tenantId: 'ruijie-tenant-01' },
      },
    }),
  ]);
  console.log(`✅ ${controllers.length} multi-vendor controllers registered`);

  // 5. Create AP Groups
  const groupHq = await prisma.apGroup.create({
    data: {
      orgId: org.id,
      name: 'HQ-Campus-Group',
      description: 'All 802.11ax/Wi-Fi 6 APs in San Jose Campus',
      tags: ['hq', 'campus', 'wifi6'],
    },
  });

  const groupBranch = await prisma.apGroup.create({
    data: {
      orgId: org.id,
      name: 'Branch-Offices-Group',
      description: 'Standard branch configuration',
      tags: ['branch', 'retail'],
    },
  });

  // 6. Create SSIDs
  const ssidCorp = await prisma.ssid.create({
    data: {
      orgId: org.id,
      name: 'Acme-Corp-Secure',
      enabled: true,
      broadcastSsid: true,
      securityType: SecurityType.WPA2_ENTERPRISE,
      vlanId: 100,
      clientIsolation: false,
      bandSteering: true,
      minDataRateMbps: 12,
      bands: ['BAND_2_4GHZ', 'BAND_5GHZ'],
      radiusPrimaryIp: '10.10.1.50',
      radiusSecondaryIp: '10.10.1.51',
      radiusPort: 1812,
      radiusSecret: 'RadiusSecretKey123',
    },
  });

  const ssidGuest = await prisma.ssid.create({
    data: {
      orgId: org.id,
      name: 'Acme-Guest',
      enabled: true,
      broadcastSsid: true,
      securityType: SecurityType.WPA2_PERSONAL,
      passphrase: 'WelcomeGuest2026!',
      vlanId: 200,
      clientIsolation: true,
      bandSteering: true,
      minDataRateMbps: 6,
      maxBandwidthDownKbps: 10000,
      maxBandwidthUpKbps: 5000,
      bands: ['BAND_2_4GHZ', 'BAND_5GHZ'],
    },
  });

  const ssidIot = await prisma.ssid.create({
    data: {
      orgId: org.id,
      name: 'Acme-IoT-Sensors',
      enabled: true,
      broadcastSsid: false,
      securityType: SecurityType.WPA2_PERSONAL,
      passphrase: 'SecureIoT2026#Key',
      vlanId: 300,
      clientIsolation: true,
      bandSteering: false,
      bands: ['BAND_2_4GHZ'],
    },
  });

  // Map SSIDs to AP Groups
  await prisma.apGroupSsid.createMany({
    data: [
      { apGroupId: groupHq.id, ssidId: ssidCorp.id },
      { apGroupId: groupHq.id, ssidId: ssidGuest.id },
      { apGroupId: groupHq.id, ssidId: ssidIot.id },
      { apGroupId: groupBranch.id, ssidId: ssidCorp.id },
      { apGroupId: groupBranch.id, ssidId: ssidGuest.id },
    ],
  });

  // 7. Create Access Points and Radios
  const apDefinitions = [
    { name: 'AP-HQ-ENG-101', mac: '00:2A:6A:11:22:01', ip: '10.10.1.101', vendor: VendorType.CISCO, model: 'Catalyst 9130AX', wlc: controllers[0], site: siteHq, group: groupHq },
    { name: 'AP-HQ-ENG-102', mac: '00:2A:6A:11:22:02', ip: '10.10.1.102', vendor: VendorType.CISCO, model: 'Catalyst 9130AX', wlc: controllers[0], site: siteHq, group: groupHq },
    { name: 'AP-HQ-EXEC-201', mac: '00:0B:86:33:44:01', ip: '10.10.2.101', vendor: VendorType.ARUBA, model: 'AP-555 Wi-Fi 6', wlc: controllers[1], site: siteHq, group: groupHq },
    { name: 'AP-HQ-EXEC-202', mac: '00:0B:86:33:44:02', ip: '10.10.2.102', vendor: VendorType.ARUBA, model: 'AP-555 Wi-Fi 6', wlc: controllers[1], site: siteHq, group: groupHq },
    { name: 'AP-ATX-OFFICE-01', mac: '50:D4:F7:55:66:01', ip: '10.10.3.101', vendor: VendorType.OMADA, model: 'EAP670 AX5400', wlc: controllers[2], site: siteBranch, group: groupBranch },
    { name: 'AP-ATX-OFFICE-02', mac: '74:83:C2:77:88:01', ip: '10.10.4.101', vendor: VendorType.UNIFI, model: 'U6-Enterprise', wlc: controllers[3], site: siteBranch, group: groupBranch },
    { name: 'AP-ATX-WAREHOUSE-01', mac: '20:4E:71:99:AA:01', ip: '10.10.5.101', vendor: VendorType.RUIJIE, model: 'RG-AP840-I', wlc: controllers[4], site: siteBranch, group: groupBranch },
    { name: 'AP-CAPWAP-NATIVE-01', mac: 'E0:63:DA:AA:BB:01', ip: '10.10.6.101', vendor: VendorType.NATIVE_CAPWAP, model: 'OpenWrt CAPWAP AP', wlc: null, site: siteHq, group: groupHq },
  ];

  for (const apDef of apDefinitions) {
    const ap = await prisma.accessPoint.create({
      data: {
        orgId: org.id,
        siteId: apDef.site.id,
        controllerId: apDef.wlc?.id,
        apGroupId: apDef.group.id,
        name: apDef.name,
        macAddress: apDef.mac,
        ipAddress: apDef.ip,
        serialNumber: `SN-${apDef.mac.replace(/:/g, '')}`,
        vendor: apDef.vendor,
        model: apDef.model,
        firmwareVersion: 'v1.4.2-prod',
        status: ApStatus.ONLINE,
        uptimeSeconds: 86400 * 12,
        cpuUsagePercent: 18.5,
        memoryUsagePercent: 42.1,
        connectedClientsCount: 14,
        configDrift: 'IN_SYNC',
      },
    });

    // Create 2.4GHz Radio
    const r24 = await prisma.radio.create({
      data: {
        apId: ap.id,
        radioIndex: 0,
        band: RadioBand.BAND_2_4GHZ,
        channel: 6,
        channelWidth: 20,
        txPowerDbm: 17,
        adminState: 'ENABLED',
        operationalState: 'UP',
        utilizationPercent: 28.4,
        clientCount: 4,
      },
    });

    // Create 5GHz Radio
    const r5 = await prisma.radio.create({
      data: {
        apId: ap.id,
        radioIndex: 1,
        band: RadioBand.BAND_5GHZ,
        channel: 36,
        channelWidth: 80,
        txPowerDbm: 20,
        adminState: 'ENABLED',
        operationalState: 'UP',
        utilizationPercent: 14.2,
        clientCount: 10,
      },
    });

    // Create sample connected wireless clients
    await prisma.wirelessClient.createMany({
      data: [
        {
          orgId: org.id,
          siteId: apDef.site.id,
          apId: ap.id,
          radioId: r5.id,
          ssidId: ssidCorp.id,
          macAddress: `A0:C5:89:${apDef.mac.substring(9)}`,
          ipAddress: `10.100.1.${10 + apDef.mac.charCodeAt(15)}`,
          hostname: `MacBook-Pro-${apDef.name}`,
          osType: 'macOS Sonoma',
          vlan: 100,
          rssiDbm: -58,
          snrDb: 34,
          rxBytes: BigInt(128492000),
          txBytes: BigInt(84729100),
          authMethod: '802.1X / EAP-TLS',
        },
        {
          orgId: org.id,
          siteId: apDef.site.id,
          apId: ap.id,
          radioId: r24.id,
          ssidId: ssidGuest.id,
          macAddress: `F4:D0:23:${apDef.mac.substring(9)}`,
          ipAddress: `10.200.1.${20 + apDef.mac.charCodeAt(15)}`,
          hostname: `iPhone-15-${apDef.name}`,
          osType: 'iOS 17.5',
          vlan: 200,
          rssiDbm: -67,
          snrDb: 25,
          rxBytes: BigInt(45100200),
          txBytes: BigInt(12948000),
          authMethod: 'WPA2-PSK',
        },
      ],
    });
  }
  console.log(`✅ ${apDefinitions.length} APs and sample clients seeded`);

  // 8. FreeRADIUS Configuration (NAS & Test Users)
  await prisma.nas.createMany({
    data: [
      { nasname: '10.10.1.10', shortname: 'cisco-wlc-hq', type: 'cisco', secret: 'RadiusSecretKey123', description: 'Cisco 9800 WLC' },
      { nasname: '10.10.2.10', shortname: 'aruba-conductor-hq', type: 'aruba', secret: 'RadiusSecretKey123', description: 'Aruba Conductor' },
      { nasname: '10.10.3.10', shortname: 'omada-wlc-atx', type: 'other', secret: 'RadiusSecretKey123', description: 'TP-Link Omada' },
      { nasname: '127.0.0.1', shortname: 'localhost', type: 'other', secret: 'testing123', description: 'Local FreeRADIUS test client' },
    ],
  });

  // FreeRADIUS RadCheck (802.1X test users & MAB clients)
  await prisma.radCheck.createMany({
    data: [
      { username: 'john.doe', attribute: 'Cleartext-Password', op: ':=', value: 'UserSecret123!' },
      { username: 'jane.smith', attribute: 'Cleartext-Password', op: ':=', value: 'UserSecret123!' },
      // MAC Authentication Bypass entry (colon-delimited or lower-case)
      { username: '001122334455', attribute: 'Auth-Type', op: ':=', value: 'Accept' },
    ],
  });

  // FreeRADIUS RadReply (Dynamic VLAN assignment)
  await prisma.radReply.createMany({
    data: [
      { username: 'john.doe', attribute: 'Tunnel-Type', op: '=', value: 'VLAN' },
      { username: 'john.doe', attribute: 'Tunnel-Medium-Type', op: '=', value: 'IEEE-802' },
      { username: 'john.doe', attribute: 'Tunnel-Private-Group-Id', op: '=', value: '100' },
      { username: 'jane.smith', attribute: 'Tunnel-Type', op: '=', value: 'VLAN' },
      { username: 'jane.smith', attribute: 'Tunnel-Medium-Type', op: '=', value: 'IEEE-802' },
      { username: 'jane.smith', attribute: 'Tunnel-Private-Group-Id', op: '=', value: '100' },
    ],
  });

  // FreeRADIUS Sample Accounting Session
  await prisma.radAcct.create({
    data: {
      acctsessionid: 'sess-849201948',
      acctuniqueid: 'uniq-982348123',
      username: 'john.doe',
      nasipaddress: '10.10.1.10',
      callingstationid: 'A0:C5:89:11:22:01',
      framedipaddress: '10.100.1.15',
      acctstarttime: new Date(Date.now() - 3600000),
      acctsessiontime: 3600,
      acctinputoctets: BigInt(52428800),
      acctoutputoctets: BigInt(209715200),
    },
  });

  // 9. Alert Rules & Active Alerts
  const ruleCpu = await prisma.alertRule.create({
    data: {
      orgId: org.id,
      name: 'AP High CPU Utilization',
      metric: 'HIGH_CPU',
      condition: 'GT',
      threshold: 85,
      severity: AlertSeverity.WARNING,
      cooldownMinutes: 15,
      enabled: true,
    },
  });

  await prisma.alert.create({
    data: {
      orgId: org.id,
      ruleId: ruleCpu.id,
      title: 'High Channel Interference Detected',
      message: 'Channel 36 on AP-HQ-ENG-101 experiencing 42% co-channel interference',
      severity: AlertSeverity.WARNING,
      targetType: 'AP',
      targetId: 'AP-HQ-ENG-101',
      status: 'ACTIVE',
    },
  });

  console.log('✅ FreeRADIUS, NAS, SSIDs, and Alerts successfully seeded.');
  console.log('🎉 Database seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
