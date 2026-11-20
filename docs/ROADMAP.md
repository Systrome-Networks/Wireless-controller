# Product Implementation Roadmap & Feature Checklist

## Strategic Architecture Focus: Systrome-First

The WAC development roadmap prioritizes **native Systrome Wireless Access Points** as the primary Tier-1 hardware ecosystem via **MQTT over TLS + OpenWrt UCI/Ubus**, followed by third-party vendor proxy adapters.

---

## 1. Feature Status & Implementation Matrix

| Feature / Subsystem | Status | Phase | Documentation / Location |
| :--- | :---: | :---: | :--- |
| **Monorepo Architecture** | ✅ Implemented | 1 | TypeScript workspaces (`apps/*`, `packages/*`) |
| **PostgreSQL 16 Database Schema** | ✅ Implemented | 1 | Multi-tenant schema with FreeRADIUS SQL in `packages/database` |
| **Authentication & RBAC** | ✅ Implemented | 1 | JWT, bcrypt, 7 enterprise roles & permission matrix |
| **Enterprise Web Dashboard UI** | ✅ Implemented | 1 | React 18, Vite, Tailwind CSS, Dark/Light NOC theme in `apps/web` |
| **Dedicated Management Views** | ✅ Implemented | 1 | APs, Controllers, SSIDs, Config Engine, Discovery, RF, RADIUS |
| **FreeRADIUS 3.0 Integration** | ✅ Implemented | 1 | Direct PostgreSQL AAA (`nas`, `radcheck`, `radacct`, RFC 5176 CoA) |
| **1-Step Docker Compose Stack** | ✅ Implemented | 1 | `docker-compose.yml` (`db`, `redis`, `backend`, `frontend`, `freeradius`) |
| **Network Engineer Runbook** | ✅ Implemented | 1 | `docs/TESTING.md` with CLI verification & radtest |
| **Systrome Native AP MQTT Architecture** | 📘 Documented | 2 | `docs/SYSTROME_AP_ARCHITECTURE.md` |
| **Systrome MQTT Broker Integration** | 🟡 Next to Build | 2 | Mosquitto container with TLS 8883 in `docker-compose.yml` |
| **Backend MQTT Ingestion Worker** | 🟡 Next to Build | 2 | `apps/server/src/workers/mqtt.worker.ts` for telemetry & LWT |
| **Device-Twin Config Engine** | 🟡 Next to Build | 2 | Desired vs. Reported JSON push to `systrome/ap/{mac}/config/desired` |
| **Systrome AP OpenWrt Agent** | 🟡 Next to Build | 2 | `systrome-agent` daemon bridging `ubus`, `uci`, and MQTT |
| **Dual-Bank FOTA Firmware Manager** | 🟡 Planned | 2 | A/B partition safe updates via `systrome/ap/{mac}/rpc/request` |
| **Dynamic Radio Resource Mgmt (Auto-RF)**| 🟡 Planned | 3 | Dynamic Channel Assignment (DCA) and Transmit Power Control (TPC) |
| **Live Remote Web Troubleshooting** | 🟡 Planned | 3 | Web terminal, remote pcap stream, and live ping/iperf |
| **3rd-Party: Cisco C9800 Adapter** | ⚪ Secondary | 4 | Cisco IOS-XE RESTCONF proxy adapter |
| **3rd-Party: Aruba AOS 8/10 Adapter** | ⚪ Secondary | 4 | Aruba Mobility Conductor REST API adapter |
| **3rd-Party: TP-Link Omada Adapter** | ⚪ Secondary | 4 | Omada OpenAPI adapter |
| **3rd-Party: Ubiquiti UniFi Adapter** | ⚪ Secondary | 4 | UniFi Controller API adapter |
| **3rd-Party: Ruijie Cloud Adapter** | ⚪ Secondary | 4 | Ruijie Reyee Cloud adapter |

---

## 2. Phase 2 Delivery Milestones (Systrome AP Core)

```
[Phase 2.1: Messaging Infrastructure]
  ├── Add Mosquitto TLS broker service to docker-compose.yml
  └── Generate CA and device mTLS certificates

[Phase 2.2: Backend MQTT Ingestion & RPC Engine]
  ├── Create apps/server/src/services/mqtt.service.ts
  ├── Ingest status, telemetry, events, and config/reported
  └── Push real-time updates directly to frontend WebSocket hub

[Phase 2.3: Device Twin & OpenWrt Agent Prototype]
  ├── Implement Desired State generator in config.controller.ts
  ├── Build reference OpenWrt systrome-agent script in Python/Go/Lua
  └── Test automatic rollback watchdog upon simulated network failure
```
