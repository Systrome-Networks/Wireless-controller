# Enterprise-Grade Multi-Vendor Wireless Access Controller (WAC)
## System Architecture

### 1. Overview
The Wireless Access Controller (WAC) is a centralized, enterprise-grade network management platform designed to orchestrate, monitor, configure, and secure large-scale wireless infrastructure across multiple hardware vendors.

```
+-----------------------------------------------------------------------------------+
|                           ENTERPRISE WEB DASHBOARD                                |
|          React 18 + TypeScript + Vite + Tailwind CSS + Recharts + WebSockets      |
+------------------------------------------+----------------------------------------+
                                           | HTTPS / WSS
                                           v
+-----------------------------------------------------------------------------------+
|                              API GATEWAY / REST API                               |
|               Express + TypeScript + JWT/RBAC + Zod Validation + Rate Limits      |
|           /api/v1/auth, /controllers, /access-points, /ssids, /discovery, ...     |
+------------------------------------------+----------------------------------------+
                                           |
    +--------------------------------------+-----------------------------------+
    |                                      |                                   |
    v                                      v                                   v
+-----------------------+      +-----------------------+      +---------------------+
| CORE SERVICES         |      | BACKGROUND WORKERS    |      | PERSISTENCE & CACHE |
| - Org & Site Service  |      | - Discovery Scanner   |      | - PostgreSQL 16     |
| - Inventory Service   | <--> | - Config Deployer     | <--> |   (Prisma ORM)      |
| - Config Engine       |      | - Telemetry Collector |      | - Redis 7           |
| - AAA / RADIUS Service|      | - Alert Evaluator     |      |   (Cache + Queues)  |
| - Alerting Service    |      | - CAPWAP Daemon       |      | - Prometheus /      |
| - RF & Topology Svc   |      |                       |      |   Grafana Metrics   |
+-----------------------+      +-----------------------+      +---------------------+
                                           |
                                           v
+-----------------------------------------------------------------------------------+
|                             DEVICE COMMUNICATION LAYER                            |
+-------------------+--------------------+--------------------+---------------------+
| VENDOR ADAPTERS   | CAPWAP SUBSYSTEM   | SNMP ENGINE        | AAA / FREERADIUS    |
| - Cisco C9800/Aire| - RFC 5415 Parser  | - SNMP v2c/v3      | - PostgreSQL Tables |
| - Aruba AOS 8/10  | - RFC 5416 802.11  | - MIB-II / 802.11  | - Dynamic VLAN/MAB  |
| - TP-Link Omada   | - Discovery / Join | - Vendor OIDs      | - RFC 5176 CoA /    |
| - Ubiquiti UniFi  | - Echo Keepalive   | - Polling & Traps  |   Disconnect Packet |
| - Ruijie Cloud    | - WTP State Mach.  | - Subnet Discovery | - 802.1X / EAP      |
+-------------------+--------------------+--------------------+---------------------+
```

### 2. Monorepo Organization
- `apps/server`: Express API server, RBAC authorization, audit logging, WebSocket hub.
- `apps/worker`: Asynchronous network scanner, telemetry poller, config deployer.
- `apps/web`: React 18 / Tailwind CSS enterprise dashboard.
- `packages/database`: Prisma ORM schema, migrations, connection pool, seed data.
- `packages/types`: Shared domain interfaces, request/response models, enums.
- `packages/adapters`: Multi-vendor wireless adapters (Cisco, Aruba, Omada, UniFi, Ruijie) and vendor simulator.
- `packages/snmp`: SNMP v2c/v3 client engine with vendor MIB profiles.
- `docker/`: Docker Compose, FreeRADIUS configurations, Prometheus, Grafana.
