# Database Schema & Entity Design
## WAC PostgreSQL & Prisma ORM

### 1. Multi-Tenancy & Access Control
- `organizations`: Multi-tenant boundary. Enforces data isolation across all resources.
- `sites`: Campus sites with geographic location and timezone.
- `buildings` & `floors`: Physical layout for indoor AP mapping.
- `users`: Identity accounts with salted bcrypt password hashing, account lockout on failed attempts, and role assignment.
- `audit_logs`: Tamper-evident operational audit trail recording actor, target, IP address, and payload diffs.

### 2. Multi-Vendor Wireless Infrastructure
- `wireless_controllers`: External vendor controllers (Cisco Catalyst, Aruba Conductor, Omada SDN, UniFi Network, Ruijie Cloud) and Native CAPWAP endpoints.
- `access_points`: Normalized access points with MAC, IP, vendor, model, firmware, uptime, and configuration drift status.
- `radios`: Per-band radio interfaces (2.4GHz, 5GHz, 6GHz) tracking channel width, tx power, noise floor, and client load.

### 3. Wireless Networks & Configuration Engine
- `ssids`: Wireless SSIDs with 802.11 security configurations (WPA2/WPA3 Personal & Enterprise, 802.1X, VLAN).
- `ap_groups`: Grouping of APs for bulk policy deployment.
- `ap_group_ssids`: Association mapping between AP groups and SSIDs with optional per-group VLAN overrides.
- `configuration_jobs`: Asynchronous deployment runs with dry-run support, snapshot verification, and rollback history.
- `configuration_job_items`: Per-AP deployment status and diffs.

### 4. Wireless Clients & RF Monitoring
- `wireless_clients`: Active associated stations with MAC, IP, hostname, OS, RSSI, SNR, and bytes transferred.
- `alert_rules` & `alerts`: Threshold-based network alarms (AP offline, high channel utilization, CPU spikes).

### 5. FreeRADIUS AAA Tables
- `nas`: Network Access Servers (Controllers & Autonomous APs) with shared secrets.
- `radcheck`: User authentication credentials (Cleartext-Password, Auth-Type).
- `radreply`: User authorization reply attributes (Tunnel-Type, Tunnel-Medium-Type, Tunnel-Private-Group-Id for dynamic VLANs).
- `radgroupcheck` & `radgroupreply`: Group-level RADIUS profiles.
- `radusergroup`: Mapping users to RADIUS authorization groups.
- `radacct`: RADIUS accounting sessions (Session ID, Start/Stop time, input/output octets).
- `radpostauth`: Authentication request history and outcome.
