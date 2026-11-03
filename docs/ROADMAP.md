# Product Implementation Roadmap & Checklist

| Feature / Subsystem | Status | Phase | Notes |
| :--- | :--- | :---: | :--- |
| **Monorepo Architecture** | Implemented | 1 | TypeScript workspaces (`apps/*`, `packages/*`) |
| **Database Schema (Prisma)** | Implemented | 1 | Multi-tenant PostgreSQL with FreeRADIUS tables |
| **Authentication & RBAC** | Implemented | 1 | JWT, bcrypt, 7 enterprise roles & permission matrix |
| **Organizations & Sites API** | Implemented | 1 | Full multi-tenant hierarchy and audit logging |
| **Enterprise Web Dashboard Shell** | Implemented | 1 | React 18, Vite, Tailwind CSS, Dark/Light NOC theme |
| **Multi-Vendor Adapter Interface** | In Progress | 2 | Common `WirelessAdapter` specification |
| **Cisco Catalyst 9800 Adapter** | Not Started | 2 | RESTCONF / API integration |
| **Aruba AOS 8/10 Adapter** | Not Started | 2 | Mobility Conductor REST API integration |
| **TP-Link Omada Adapter** | Not Started | 2 | Omada OpenAPI integration |
| **Ubiquiti UniFi Adapter** | Not Started | 2 | UniFi Controller API integration |
| **Ruijie Cloud Adapter** | Not Started | 2 | Ruijie Open Platform API integration |
| **Multi-Vendor Hardware Simulator** | In Progress | 2 | Mock testbed for all 5 vendors |
| **SNMP v2c/v3 Engine** | In Progress | 2 | Polling, MIB-II, IEEE 802.11 MIB profiles |
| **Automated Subnet Discovery** | Not Started | 2 | IP range scanner with MAC/LLDP discovery |
| **Unified AP Inventory & Details** | Not Started | 2 | Multi-vendor unified AP views & actions |
| **Centralized SSID Management** | Not Started | 3 | Vendor-neutral SSID definitions |
| **AP Grouping & Overrides** | Not Started | 3 | Bulk policy mapping and VLAN overrides |
| **Radio & RF Management** | Not Started | 3 | Channel, width, tx power, band steering |
| **Configuration Engine & Jobs** | Not Started | 3 | Asynchronous job execution with dry-run |
| **Configuration Drift & Rollback** | Not Started | 3 | Detect drift, snapshot rollback |
| **CAPWAP RFC 5415/5416 Engine** | Not Started | 4 | UDP 5246/5247 codec, discovery, join, echo |
| **FreeRADIUS PostgreSQL AAA** | Not Started | 5 | 802.1X, Dynamic VLAN, radcheck, radacct |
| **RFC 5176 Disconnect & CoA** | Not Started | 5 | Dynamic client disconnect & authorization change |
| **Real-time Telemetry & Metrics** | Not Started | 6 | WebSocket live feeds, Prometheus exporter |
| **Threshold-based Alert Engine** | Not Started | 6 | Channel interference, AP down, CPU spike alarms |
| **RF Conflict & Topology Visualizer** | Not Started | 6 | Channel map and LLDP topology visualization |
| **Firmware Management** | Not Started | 7 | Staged upgrades and version compatibility |
| **Docker Compose Deployment** | Not Started | 8 | Production compose stack with FreeRADIUS, Redis |
