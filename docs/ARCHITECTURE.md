# Enterprise-Grade Multi-Vendor Wireless Access Controller (WAC)
## System Architecture & Systrome AP Core

### 1. Overview
The Wireless Access Controller (WAC) is a centralized, enterprise-grade network management platform designed to orchestrate, monitor, configure, and secure wireless infrastructure. 

**Strategic Priority**: The platform implements a **Systrome-First Architecture**, providing deep, native orchestration for Systrome Wireless Access Points via **MQTT over TLS + OpenWrt UCI/Ubus**, while maintaining vendor adapters for legacy and third-party controllers (Cisco, Aruba, TP-Link Omada, Ubiquiti UniFi, Ruijie).

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
| CORE SERVICES         |      | COMMUNICATIONS & BUS  |      | PERSISTENCE & CACHE |
| - Org & Site Service  |      | - Systrome MQTT Engine|      | - PostgreSQL 16     |
| - Inventory Service   | <--> |   (Mosquitto TLS 8883)| <--> |   (Prisma ORM)      |
| - Config Twin Engine  |      | - WebSocket Hub (/ws) |      | - Redis 7           |
| - AAA / RADIUS Service|      | - Background Workers  |      |   (Cache + Queues)  |
| - Alerting Service    |      | - Discovery Scanner   |      | - FreeRADIUS 3.0    |
| - RF & Auto-RRM Svc   |      | - Config Deployer     |      |   (rlm_sql driver)  |
+-----------------------+      +-----------------------+      +---------------------+
                                           |
                                           v
+-----------------------------------------------------------------------------------+
|                             DEVICE COMMUNICATION LAYER                            |
+------------------------------+--------------------+-------------------------------+
| SYSTROME NATIVE AP SUBSYSTEM | AAA / FREERADIUS   | 3RD-PARTY VENDOR ADAPTERS     |
| - MQTT v3.1.1/v5 (TLS 8883)  | - PostgreSQL Tables| - Cisco C9800 / AireOS        |
| - Device Twin (Desired/Rep)  | - Dynamic VLAN/MAB | - Aruba AOS 8/10              |
| - OpenWrt UCI / Ubus Agent   | - RFC 5176 CoA/DM  | - TP-Link Omada               |
| - Instant LWT Offline Alert  | - 802.1X / EAP-TLS | - Ubiquiti UniFi              |
| - Safe-Mode Auto Rollback    | - Accounting (rad) | - Ruijie Cloud                |
| - Sub-second RF Telemetry    |                    | - Legacy SNMP v2c/v3 Engine   |
+------------------------------+--------------------+-------------------------------+
```

### 2. Monorepo Organization
- `apps/server`: Express API server, RBAC authorization, audit logging, WebSocket hub, and MQTT ingestion worker.
- `apps/web`: React 18 / Tailwind CSS enterprise dashboard with full dark/light theme support.
- `packages/database`: Prisma ORM schema, PostgreSQL connection pool, seed data, and FreeRADIUS SQL models.
- `packages/types`: Shared domain interfaces, request/response models, enums, and MQTT payload schemas.
- `docker/`: Single-step Docker Compose orchestration, FreeRADIUS SQL configurations, and NGINX reverse proxy.
- `docs/`: Complete engineering documentation:
  - [Systrome Native AP Architecture (docs/SYSTROME_AP_ARCHITECTURE.md)](file:///home/thetypo36/Documents/antigravity/friendly-babbage/docs/SYSTROME_AP_ARCHITECTURE.md)
  - [Deployment Runbook & Evaluation (docs/DEPLOYMENT.md)](file:///home/thetypo36/Documents/antigravity/friendly-babbage/docs/DEPLOYMENT.md)
  - [Testing Runbook (docs/TESTING.md)](file:///home/thetypo36/Documents/antigravity/friendly-babbage/docs/TESTING.md)
  - [Database Schema (docs/DATABASE.md)](file:///home/thetypo36/Documents/antigravity/friendly-babbage/docs/DATABASE.md)
  - [REST & WebSocket API (docs/API.md)](file:///home/thetypo36/Documents/antigravity/friendly-babbage/docs/API.md)
  - [Security Specifications (docs/SECURITY.md)](file:///home/thetypo36/Documents/antigravity/friendly-babbage/docs/SECURITY.md)
  - [Product Roadmap (docs/ROADMAP.md)](file:///home/thetypo36/Documents/antigravity/friendly-babbage/docs/ROADMAP.md)
