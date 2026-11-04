# Systrome Enterprise Wireless Access Controller (WAC)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Docker Compose](https://img.shields.io/badge/Docker%20Compose-Ready-blue?logo=docker)](docker-compose.yml)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D20.0.0-green.svg?logo=node.js)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue.svg?logo=typescript)](https://www.typescriptlang.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue?logo=postgresql)](https://www.postgresql.org)
[![FreeRADIUS](https://img.shields.io/badge/FreeRADIUS-3.0-orange)](https://freeradius.org)

An enterprise-grade, multi-vendor **Wireless Access Controller (WAC)** platform designed to centrally manage, orchestrate, monitor, and provision large-scale distributed wireless infrastructure across **Cisco Catalyst/Aironet**, **Aruba Instant/AOS-8/10**, **TP-Link Omada**, **Ubiquiti UniFi**, **Ruijie Reyee**, and **Native CAPWAP / OpenWrt** devices.

---

## ⚡ 1-Step Quickstart (Docker Compose)

Deploy the complete WAC platform (PostgreSQL 16, Redis 7, Backend API & WebSocket Hub, Frontend Dashboard with NGINX reverse proxy, and FreeRADIUS 3.0 AAA Engine) in a single command:

```bash
docker compose up --build -d
```

> **Automated Setup**: The container stack automatically waits for database availability, synchronizes the database schema with Prisma, and seeds default enterprise accounts, vendor controllers, AP inventories, and FreeRADIUS users on first boot!

### Access Endpoints

- **Web Dashboard**: [http://localhost:3000](http://localhost:3000)
- **REST API Gateway**: [http://localhost:4000/api/v1](http://localhost:4000/api/v1)
- **WebSocket Gateway**: `ws://localhost:4000/ws`
- **Default Super Admin**: `admin@wac.network` / `Admin123!@#`

For full configuration options, environment overrides, and operational runbooks, see [DEPLOYMENT.md](file:///home/thetypo36/Documents/antigravity/friendly-babbage/docs/DEPLOYMENT.md).

---

## 🚀 Key Features

- **Multi-Vendor Controller Management**: Single-pane-of-glass orchestration for Cisco, Aruba, TP-Link Omada, Ubiquiti UniFi, and Ruijie controllers with real-time status and telemetry sync.
- **Access Point Fleet Management**: Multi-vendor AP inventory, remote reboot, configuration drift detection, RF radio statistics (2.4 GHz, 5 GHz, 6 GHz Wi-Fi 6E/7), and client association tracking.
- **Enterprise Wireless SSIDs**: Centralized 802.11 SSID management with WPA2/WPA3-Personal, WPA2/WPA3-Enterprise (802.1X), VLAN tags, Fast BSS Transition (802.11r), and FreeRADIUS integration.
- **Policy & Configuration Engine**: Preflight dry-run validation, staged deployments, rollbacks, and multi-controller policy distribution.
- **Subnet Scanner & AP Discovery**: Automated CIDR scanning (`10.10.1.0/24`) with SNMP v2c/v3 probes and 1-click import into management groups.
- **Monitoring & Spectrum RF Optimization**: Dynamic channel load analysis, high CPU/memory threshold alerting, and active alert lifecycle workflows.
- **Built-in AAA & FreeRADIUS Management**: Manage 802.1X users, MAC Authentication Bypass (MAB), dynamic VLAN assignments, NAS clients, active accounting sessions, and RFC 5176 CoA/Disconnect triggers.
- **Enterprise Multi-Tenancy & RBAC**: Hierarchical Organizations, Sites, Buildings, Floors, and 7 granular roles (`SUPER_ADMIN`, `NETWORK_ADMIN`, `SECURITY_ADMIN`, `RF_ENGINEER`, `HELPDESK`, `AUDITOR`, `READ_ONLY`).
- **Modern Responsive UI**: Dark & Light theme support with Tailwind CSS, Lucide icons, and Recharts spectrum visualization.

---

## 📦 Architecture & Services

```
├── apps/
│   ├── server/           # Express API gateway, WebSocket hub, RBAC & vendor adapters
│   └── web/              # React 18 SPA (Vite + Tailwind + Recharts + Lucide)
├── packages/
│   ├── database/         # Prisma ORM schema, migrations, seed script & PostgreSQL client
│   └── types/            # Shared domain interfaces, enums, DTOs & permission types
├── docker/
│   ├── Dockerfile.server # Multi-stage Dockerfile for API & WebSocket server
│   ├── Dockerfile.web    # Multi-stage Dockerfile for React SPA served via NGINX
│   ├── Dockerfile.freeradius # FreeRADIUS 3.0 with PostgreSQL rlm_sql driver
│   ├── entrypoint.server.sh  # Automated DB wait, schema push & idempotent seeding
│   ├── freeradius/       # FreeRADIUS SQL & clients configuration
│   └── nginx.conf        # Production NGINX reverse proxy with /api and /ws proxying
├── docs/
│   ├── ARCHITECTURE.md   # Architectural design document
│   ├── DATABASE.md       # Database schema specifications & relations
│   ├── API.md            # Complete REST API & WebSocket specifications
│   ├── SECURITY.md       # Security, cryptography, and RBAC matrix
│   ├── TESTING.md        # 8-step Network Engineer verification runbook
│   ├── DEPLOYMENT.md     # Docker Compose quickstart & production improvement evaluation
│   └── ROADMAP.md        # Long-term feature roadmap
├── docker-compose.yml    # Root 1-step orchestration file
└── .env.example          # Environment variable template
```

---

## 🔐 Default User Accounts

| Email | Password | Role |
| :--- | :--- | :--- |
| `admin@wac.network` | `Admin123!@#` | `SUPER_ADMIN` |
| `netops@wac.network` | `Admin123!@#` | `NETWORK_ADMIN` |
| `secops@wac.network` | `Admin123!@#` | `SECURITY_ADMIN` |
| `rfspec@wac.network` | `Admin123!@#` | `RF_ENGINEER` |
| `support@wac.network`| `Admin123!@#` | `HELPDESK` |
| `auditor@wac.network`| `Admin123!@#` | `AUDITOR` |
| `guest@wac.network`  | `Admin123!@#` | `READ_ONLY` |

---

## 🛠️ Local Development (Without Docker)

If you prefer developing directly on your host machine:

```bash
# 1. Install dependencies
npm install

# 2. Start PostgreSQL & Redis (e.g. locally or via docker)
# Set DATABASE_URL and REDIS_URL in .env

# 3. Synchronize database and seed data
npm run db:push
npm run db:seed

# 4. Start backend API & WebSocket server
npm run dev:server

# 5. In a separate terminal, start frontend dev server
npm run dev:web
```

---

## 📚 Documentation Index

- [Architecture Design (docs/ARCHITECTURE.md)](file:///home/thetypo36/Documents/antigravity/friendly-babbage/docs/ARCHITECTURE.md)
- [Deployment & Evaluation Guide (docs/DEPLOYMENT.md)](file:///home/thetypo36/Documents/antigravity/friendly-babbage/docs/DEPLOYMENT.md)
- [Network Engineer Testing Runbook (docs/TESTING.md)](file:///home/thetypo36/Documents/antigravity/friendly-babbage/docs/TESTING.md)
- [Database Schema (docs/DATABASE.md)](file:///home/thetypo36/Documents/antigravity/friendly-babbage/docs/DATABASE.md)
- [REST API & WebSocket API (docs/API.md)](file:///home/thetypo36/Documents/antigravity/friendly-babbage/docs/API.md)
- [Security Matrix & RBAC (docs/SECURITY.md)](file:///home/thetypo36/Documents/antigravity/friendly-babbage/docs/SECURITY.md)
- [Platform Roadmap (docs/ROADMAP.md)](file:///home/thetypo36/Documents/antigravity/friendly-babbage/docs/ROADMAP.md)

---

## 📄 License

Proprietary / Enterprise Edition &copy; 2026 Systrome Networks. All Rights Reserved.
