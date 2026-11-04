# Enterprise Deployment & Orchestration Guide

This document provides the operational runbook for deploying the **Systrome Wireless Access Controller (WAC)** platform in a single step using **Docker Compose**, followed by an in-depth architectural evaluation of deployment strategies for enterprise-scale multi-campus production environments.

---

## 1. Quickstart: 1-Step Installation

The entire WAC platform (PostgreSQL 16, Redis 7, Backend API & WebSocket Hub, Frontend Dashboard with NGINX reverse proxy, and FreeRADIUS 3.0 AAA Engine) is configured to launch with zero manual interventions. Database migrations and initial seeding are executed automatically during first boot.

### Prerequisites

- **Docker Engine**: `>= 24.0.0`
- **Docker Compose (V2)**: `>= 2.20.0`
- **System Memory**: Minimum 4 GB RAM (8 GB recommended for large inventories)
- **Ports Available on Host**:
  - `3000` (Web UI & NGINX Gateway)
  - `4000` (Direct REST API & WebSocket)
  - `5432` (PostgreSQL Database)
  - `6379` (Redis In-Memory Cache)
  - `1812/udp` (FreeRADIUS Authentication)
  - `1813/udp` (FreeRADIUS Accounting)
  - `3799/udp` (FreeRADIUS RFC 5176 CoA / Disconnect)

### Launching the Stack

From the root of the repository, execute:

```bash
# 1. Clone or navigate to the repository
cd /path/to/Wireless-controller

# 2. (Optional) Copy environment defaults
cp .env.example .env

# 3. Build and launch all containers in detached mode
docker compose up --build -d
```

### Watching the Initialization Progress

```bash
docker compose logs -f backend
```

You will see:
1. `⏳ Waiting for PostgreSQL database to be reachable...`
2. `✅ PostgreSQL database connection established.`
3. `🔄 Synchronizing database schema via Prisma...`
4. `🌱 Fresh database detected. Executing automatic initial seed...`
5. `✅ Seed data populated successfully (Admin: admin@wac.network / Admin123!@#)`
6. `🚀 Launching WAC Enterprise API & WebSocket Gateway...`

---

## 2. Container Topology & Architecture

```
                                  [ Access Points / Controllers / Network Admins ]
                                                         │
                                                         ▼
                                 ┌──────────────────────────────────────────────┐
                                 │            Docker Bridge Network             │
                                 │                  (wac_net)                   │
                                 └───────────────────────┬──────────────────────┘
                                                         │
                        ┌────────────────────────────────┼──────────────────────────────┐
                        ▼                                ▼                              ▼
        ┌───────────────────────────────┐ ┌───────────────────────────────┐ ┌───────────────────────┐
        │        wac-frontend           │ │         wac-backend           │ │    wac-freeradius     │
        │         Port: 3000            │ │          Port: 4000           │ │ Ports: 1812, 1813,    │
        │   (NGINX Reverse Proxy +      │ │  (Express + WS Hub + Prisma)  │ │      3799 (UDP)       │
        │    React 18 Dashboard SPA)    │ │                               │ │ (rlm_sql_postgresql)  │
        └───────────────┬───────────────┘ └──────────────┬────────────────┘ └───────────┬───────────┘
                        │ /api & /ws                     │                              │
                        └────────────────────────────────┤                              │
                                                         ▼                              ▼
                                          ┌──────────────────────────────┐ ┌────────────────────────┐
                                          │            wac-db            │ │       wac-redis        │
                                          │          Port: 5432          │ │       Port: 6379       │
                                          │       (PostgreSQL 16)        │ │        (Redis 7)       │
                                          │   Volume: wac_pgdata         │ │   Volume: wac_redisdata│
                                          └──────────────────────────────┘ └────────────────────────┘
```

---

## 3. Access URLs & Default Credentials

| Service | Access Endpoint | Credentials | Notes |
| :--- | :--- | :--- | :--- |
| **Web UI Dashboard** | [http://localhost:3000](http://localhost:3000) | `admin@wac.network` / `Admin123!@#` | Role: `SUPER_ADMIN` |
| **REST API Gateway** | [http://localhost:4000/api/v1](http://localhost:4000/api/v1) | Bearer JWT Token | Full OpenAPI / Swagger compatible |
| **WebSocket Hub** | `ws://localhost:4000/ws` | Authorized JWT | Real-time AP metrics & alerts |
| **PostgreSQL 16** | `localhost:5432` | `wac` / `wac_secret_2026` / `wac_db` | Persistent volume `wac_pgdata` |
| **Redis In-Memory** | `localhost:6379` | *No password by default* | Persistent volume `wac_redisdata` |
| **FreeRADIUS 3.0** | `localhost:1812` (UDP) | Secret: `RadiusSecretKey123` | Direct SQL driver to `wac-db` |

### Seeded Accounts Available Out-of-the-Box

| Email | Password | Role | Permissions Scope |
| :--- | :--- | :--- | :--- |
| `admin@wac.network` | `Admin123!@#` | `SUPER_ADMIN` | Global system control, organizations, controllers |
| `netops@wac.network` | `Admin123!@#` | `NETWORK_ADMIN` | AP provisioning, SSID creation, RF radio optimization |
| `secops@wac.network` | `Admin123!@#` | `SECURITY_ADMIN` | FreeRADIUS 802.1X, MAB users, RFC 5176 CoA disconnect |
| `rfspec@wac.network` | `Admin123!@#` | `RF_ENGINEER` | Spectrum management, channel power, DCA/TPC tuning |
| `support@wac.network`| `Admin123!@#` | `HELPDESK` | Client troubleshooting, AP ping, radio signal check |
| `auditor@wac.network`| `Admin123!@#` | `AUDITOR` | Read-only compliance and immutable audit logs |
| `guest@wac.network`  | `Admin123!@#` | `READ_ONLY` | Read-only inventory viewer |

---

## 4. Verification & Testing

### 1. Healthcheck Verification
```bash
# Verify all 5 containers are running and reported healthy
docker compose ps
```

### 2. API Healthcheck
```bash
curl -s http://localhost:4000/health | jq .
# Expected output: { "status": "ok", "timestamp": "..." }
```

### 3. Authenticate and Query AP Fleet
```bash
TOKEN=$(curl -s -X POST http://localhost:4000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@wac.network","password":"Admin123!@#"}' | jq -r '.data.tokens.accessToken')

curl -s -H "Authorization: Bearer $TOKEN" http://localhost:4000/api/v1/aps | jq .
```

### 4. Test FreeRADIUS 802.1X Authentication
```bash
# Test corporate user authentication via radtest
radtest john.doe CorporateSecure2026! localhost:1812 0 RadiusSecretKey123
# Expected output: Received Access-Accept
```

---

## 5. Architectural Evaluation: Is Docker Compose the Best Way?

The user asks: **"Is Docker Compose the best way to do it, and what can we improve?"**

### Direct Verdict

| Context | Is Docker Compose the Best Choice? | Verdict Rationale |
| :--- | :---: | :--- |
| **Lab & Developer Testing** | ⭐ **YES (Best)** | Zero infrastructure dependencies, instant setup, reproducible. |
| **Branch Appliance / Edge WAC** | ⭐ **YES (Best)** | Dedicated hardware appliances (1U / OpenWrt / NUC) running single-node WAC with systemd supervision. |
| **Enterprise Campus (500–5,000 APs)** | ⚠️ **Acceptable with Caveats** | Can run on an enterprise bare-metal server with NVMe storage and ECC RAM, but lacks automatic node failover. |
| **Tier-1 Telecom / Multi-Campus (10,000+ APs)** | ❌ **NO (Not Recommended)** | Single-Host bottleneck, lacks horizontal scaling, no automated rolling zero-downtime upgrades, no High Availability (HA) if the host kernel panics. |

---

## 6. What Can We Improve? Enterprise Production Roadmap

To upgrade this single-node Docker Compose setup into a carrier-grade, highly available enterprise platform, implement the following architectural enhancements:

### 1. Orchestration: Migrate from Compose to Kubernetes / Helm
- **Why**: Docker Compose cannot span multiple physical machines. If the host hardware fails, the entire WAC is down until manual intervention.
- **Improvement**:
  - Deploy with **Kubernetes (k8s)** or **HashiCorp Nomad**.
  - Package as an enterprise **Helm Chart** (`systrome-wac-helm`).
  - Deploy `wac-backend` as a **Deployment** with a `HorizontalPodAutoscaler` (HPA) scaling pods dynamically based on CPU/Memory and active WebSocket connections.
  - Run `wac-frontend` behind an Ingress Controller (NGINX Ingress, Traefik, or Cilium Service Mesh).

### 2. High-Availability Database Layer: Patroni PostgreSQL Cluster
- **Why**: The Compose setup uses a single PostgreSQL container. If the disk fills or the container crashes, writes freeze.
- **Improvement**:
  - Deploy PostgreSQL with **Patroni** + **etcd** / **Consul** for automated Raft-based leader election and zero-loss failover (<5 seconds).
  - Use streaming replication with 1 Primary and 2 Read Standbys.
  - Point read-heavy endpoints (e.g. historical client telemetry, audit logs) to read replicas using **PgBouncer** connection pooling.
  - Implement continuous incremental backups using **pgBackRest** or AWS S3 / MinIO WAL-G archiving.

### 3. Distributed Cache & Session State: Redis Sentinel or Cluster
- **Why**: In a multi-replica backend setup, WebSocket connections and background jobs need distributed state.
- **Improvement**:
  - Migrate single Redis container to **Redis Sentinel** (3 nodes) for automatic master-replica failover, or **Redis Cluster** for sharding.
  - Use Redis Streams or Pub/Sub to synchronize WebSocket broadcast events across multiple WAC backend replicas (so an AP reboot event received on Server A is pushed to a browser connected to Server B).

### 4. Resilient AAA: Geo-Distributed Anycast FreeRADIUS
- **Why**: 802.1X/RADIUS authentication packets are UDP. Latency spikes causes Wi-Fi association timeouts (EAP timeouts).
- **Improvement**:
  - Deploy FreeRADIUS as an **Anycast BGP service**: APs and switches across campuses send RADIUS packets to a virtual IP (VIP) routed to the geographically closest FreeRADIUS cluster node.
  - Use PostgreSQL multi-region read replicas or CockroachDB to keep the `nas`, `radcheck`, and `radacct` tables synchronized globally with sub-millisecond local reads.

### 5. Control Plane vs. Data Plane Separation (Edge CAPWAP Gateway)
- **Why**: Managing thousands of Access Points with centralized data tunneling (CAPWAP data plane) requires massive packet throughput that should never compete with Node.js REST API threads.
- **Improvement**:
  - Decouple the **Control Plane** (WAC REST/GraphQL/WS UI) from the **Data Plane** (CAPWAP encapsulation / VXLAN termination).
  - Use high-performance DPDK or eBPF/XDP tunnels on dedicated Linux edge routers to handle client traffic forwarding, while WAC manages configuration, RF orchestration, and policy via standard NETCONF / RESTCONF / OpenWrt ubus.

### 6. Edge Ingress, mTLS & Automated PKI
- **Why**: Plain HTTP or self-signed certificates require manual trust installs and create security audit flags.
- **Improvement**:
  - Front the system with **Traefik** or **Envoy** with automated ACME/Let's Encrypt TLS certificates.
  - Issue **mTLS (Mutual TLS)** x509 client certificates to native Access Points and controllers so all API calls and CAPWAP tunnels are authenticated at the cryptographic hardware level.

### 7. Observability: Prometheus, Grafana & Loki Stack
- **Why**: Production network engineers need 30-day trends for RF interference, noise floor, channel utilization, and client association rates.
- **Improvement**:
  - Add `wac-prometheus` scraper scraping metrics from `wac-backend/metrics`.
  - Add `node-exporter` and `postgres_exporter`.
  - Provide pre-built Grafana dashboards visualizing AP fleet health, radio channel occupancy, and FreeRADIUS authentication success vs. failure rates.

---

## 7. Operational Management Commands

### Viewing Real-Time Logs
```bash
# View all container logs
docker compose logs -f

# View only backend server logs
docker compose logs -f backend

# View FreeRADIUS live authentication debug
docker compose logs -f freeradius
```

### Restarting a Specific Service
```bash
docker compose restart backend
docker compose restart freeradius
```

### Performing Database Backup
```bash
docker compose exec db pg_dump -U wac wac_db > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Restoring Database from Backup
```bash
cat backup_file.sql | docker compose exec -T db psql -U wac wac_db
```

### Stopping and Tearing Down the Stack
```bash
# Stop containers (preserves database and cache volumes)
docker compose down

# Stop containers AND delete volumes (complete fresh reset)
docker compose down -v
```
