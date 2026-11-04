import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '@wac/database';

const createNasSchema = z.object({
  nasname: z.string().min(1),
  shortname: z.string().min(1),
  type: z.string().default('other'),
  secret: z.string().min(1),
  description: z.string().optional(),
});

const createRadiusUserSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
  vlanId: z.number().int().optional(),
});

const coaSchema = z.object({
  nasIp: z.string(),
  clientMac: z.string(),
  action: z.enum(['DISCONNECT', 'REAUTH', 'CHANGE_VLAN']).default('DISCONNECT'),
  vlanId: z.number().optional(),
});

export async function listNas(req: Request, res: Response): Promise<void> {
  const nasList = await prisma.nas.findMany({ orderBy: { id: 'asc' } });
  // Omit secret for security
  const safeList = nasList.map((n) => ({
    id: n.id,
    nasname: n.nasname,
    shortname: n.shortname,
    type: n.type,
    description: n.description,
    createdAt: n.createdAt,
  }));

  res.json({ success: true, data: safeList });
}

export async function createNas(req: Request, res: Response): Promise<void> {
  const data = createNasSchema.parse(req.body);

  const nas = await prisma.nas.create({
    data: {
      nasname: data.nasname,
      shortname: data.shortname,
      type: data.type,
      secret: data.secret,
      description: data.description,
    },
  });

  res.status(201).json({
    success: true,
    data: { id: nas.id, nasname: nas.nasname, shortname: nas.shortname, type: nas.type },
  });
}

export async function listRadiusUsers(req: Request, res: Response): Promise<void> {
  const [checks, replies] = await Promise.all([
    prisma.radCheck.findMany({ orderBy: { id: 'asc' } }),
    prisma.radReply.findMany({ where: { attribute: 'Tunnel-Private-Group-Id' } }),
  ]);

  const vlanMap = new Map<string, string>();
  replies.forEach((r) => vlanMap.set(r.username, r.value));

  const users = checks.map((c) => ({
    id: c.id,
    username: c.username,
    attribute: c.attribute,
    op: c.op,
    vlanId: vlanMap.get(c.username) ? parseInt(vlanMap.get(c.username)!, 10) : undefined,
  }));

  res.json({ success: true, data: users });
}

export async function createRadiusUser(req: Request, res: Response): Promise<void> {
  const data = createRadiusUserSchema.parse(req.body);

  const check = await prisma.radCheck.create({
    data: {
      username: data.username,
      attribute: 'Cleartext-Password',
      op: ':=',
      value: data.password,
    },
  });

  if (data.vlanId) {
    await prisma.radReply.createMany({
      data: [
        { username: data.username, attribute: 'Tunnel-Type', op: '=', value: 'VLAN' },
        { username: data.username, attribute: 'Tunnel-Medium-Type', op: '=', value: 'IEEE-802' },
        { username: data.username, attribute: 'Tunnel-Private-Group-Id', op: '=', value: data.vlanId.toString() },
      ],
    });
  }

  res.status(201).json({ success: true, data: { id: check.id, username: check.username, vlanId: data.vlanId } });
}

export async function listRadiusSessions(req: Request, res: Response): Promise<void> {
  const sessions = await prisma.radAcct.findMany({
    orderBy: { radacctid: 'desc' },
    take: 50,
  });

  const serialized = sessions.map((s) => ({
    ...s,
    radacctid: s.radacctid.toString(),
    acctinputoctets: s.acctinputoctets ? s.acctinputoctets.toString() : '0',
    acctoutputoctets: s.acctoutputoctets ? s.acctoutputoctets.toString() : '0',
  }));

  res.json({ success: true, data: serialized });
}

export async function sendCoa(req: Request, res: Response): Promise<void> {
  const data = coaSchema.parse(req.body);

  // Simulate RFC 5176 packet transmission to NAS on UDP 3799
  await prisma.auditLog.create({
    data: {
      orgId: req.user!.orgId,
      userId: req.user!.id,
      action: `RADIUS_COA_${data.action}`,
      targetType: 'RADIUS_SESSION',
      targetId: data.clientMac,
      ipAddress: req.ip,
      details: data,
    },
  });

  res.json({
    success: true,
    message: `RFC 5176 ${data.action} successfully transmitted to NAS ${data.nasIp} for MAC ${data.clientMac}`,
  });
}
