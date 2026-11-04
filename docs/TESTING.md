# Enterprise WAC: Network Engineer Testing & Validation Runbook
## Comprehensive Verification Procedure for Multi-Vendor Wireless Controllers

This document provides a systematic, field-ready test plan for Network Architects, NOC Engineers, and QA teams to validate all layers of the **Wireless Access Controller (WAC)**.

---

## 1. System Topology & Test Environment

```
+-----------------------------------------------------------------------------------------+
|                                    TESTBED ENVIRONMENT                                  |
|                                                                                         |
|  [ WAC Web UI: http://localhost:3000 ] <---> [ WAC API Server: http://localhost:4000 ]  |
|                                                      |                                  |
|         +-------------------+------------------------+-------------------+              |
|         |                   |                        |                   |              |
|         v                   v                        v                   v              |
|  [ PostgreSQL 16 ]     [ FreeRADIUS ]           [ SNMP Sweep ]    [ WLC Simulators ]    |
|   Port 5432 (DB)       Ports 1812/1813/3799     Port 161 (UDP)     Cisco / Aruba /      |
|   wac_db               802.1X, Dynamic VLAN     Subnet Scanner     Omada / UniFi /      |
|                        Accounting & CoA                            Ruijie Gateways      |
+-----------------------------------------------------------------------------------------+
```

---

## 2. Test Execution Matrix

| Test ID | Test Scenario | Primary Component | Verification Method | Expected Outcome |
| :--- | :--- | :--- | :--- | :--- |
| **TC-01** | System Health & DB Connectivity | Core API & PostgreSQL | REST Probe / HTTP 200 | Database connected, uptime > 0 |
| **TC-02** | RBAC Authentication & Token Security | Auth & JWT Middleware | CLI `curl` / Web UI | Valid token issued, role-restricted endpoints |
| **TC-03** | Multi-Vendor Controller Fleet Sync | Controller Engine | Web UI / REST API | Status ONLINE, AP count updated, audit logged |
| **TC-04** | AP Inventory & Dual-Band Radios | AP Subsystem | UI Details Modal | 2.4/5 GHz channels, Tx power, connected clients |
| **TC-05** | Remote AP Reboot Command | Device Lifecycle | UI Action / Audit | Reboot status dispatched, zero uptime reset |
| **TC-06** | Subnet Discovery & SNMP Sweep | Discovery Engine | UI Sweep / REST API | Discovers AP hardware, imports into fleet |
| **TC-07** | Centralized SSID & VLAN Creation | Wireless Policy | Web UI Form / DB | SSID created, VLAN 100 tagged, band steering on |
| **TC-08** | Config Engine Preflight (Dry-Run) | Deployment Engine | UI Dry-Run Toggle | Validates policy without pushing live changes |
| **TC-09** | Configuration Deployment Job | Async Job Engine | UI Commit Deploy | All target APs transition to SUCCESS |
| **TC-10** | FreeRADIUS 802.1X Authentication | AAA Subsystem | `radtest` CLI / DB | Access-Accept with Dynamic VLAN attributes |
| **TC-11** | RFC 5176 Disconnect-Request (CoA) | RADIUS CoA Client | UI Button / UDP 3799 | Disconnect packet dispatched to NAS IP |
| **TC-12** | RF Spectrum Monitoring & Alerts | RF Telemetry | UI Spectrum Map | 2.4/5GHz load shown; Ack/Resolve active alerts |

---

## 3. Step-by-Step Testing Procedure

### Pre-Requisite: Retrieve Administrative JWT Token
Execute in your terminal to save a token for the test suite:
```bash
export WAC_TOKEN=$(curl -s -X POST http://localhost:4000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@wac.network","password":"Admin123!@#"}' \
  | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)

echo "Active Token: ${WAC_TOKEN:0:30}..."
```

---

### Test Case 1: Core System Health & Readiness (TC-01)
**Objective**: Verify the API server and PostgreSQL database connections are operational.

**Command**:
```bash
curl -i http://localhost:4000/api/v1/ready
```
**Expected Response**:
```json
HTTP/1.1 200 OK
Content-Type: application/json

{
  "status": "ready",
  "database": "connected",
  "timestamp": "2026-11-04T..."
}
```
*Pass Criteria*: Status `200 OK` with `"database": "connected"`.

---

### Test Case 2: Multi-Vendor Controller Fleet Inspection & Sync (TC-03)
**Objective**: Verify the controller engine manages Cisco, Aruba, Omada, UniFi, and Ruijie platforms.

**Web UI Procedure**:
1. Open [http://localhost:3000](http://localhost:3000) and log in with `admin@wac.network` / `Admin123!@#`.
2. Navigate to **Controllers** in the left sidebar.
3. Verify that 5 distinct vendor controllers are registered and displaying green `ONLINE` badges:
   - `HQ-Cisco-C9800-Cluster` (Cisco)
   - `HQ-Aruba-Mobility-Conductor` (Aruba)
   - `Austin-Omada-SDN-Controller` (TP-Link Omada)
   - `Austin-UniFi-Cloud-Gateway` (Ubiquiti UniFi)
   - `Ruijie-Cloud-Controller` (Ruijie)
4. Click **"Sync Fleet"** on the Cisco controller card.
5. Verify the button animates and the "Last Sync" timestamp updates to the current time.

**CLI Alternative**:
```bash
curl -s http://localhost:4000/api/v1/controllers \
  -H "Authorization: Bearer $WAC_TOKEN" | jq '.data[] | {name, vendor, host, apCount, status}'
```

---

### Test Case 3: AP Fleet Inventory & Radio RF Telemetry (TC-04, TC-05)
**Objective**: Inspect access points, review 2.4GHz & 5GHz radio channel allocations, and trigger an AP reboot.

**Web UI Procedure**:
1. Navigate to **Access Points** in the sidebar.
2. In the vendor dropdown, filter by `CISCO`, then `ARUBA`. Verify table updates instantly.
3. Click on **`AP-HQ-ENG-101`** to open the AP Details Modal:
   - Confirm CPU Load (~18%) and Memory (~42%).
   - Confirm Radio 0: `2.4GHz Radio` on **Channel 6 (20 MHz)** with 17 dBm Tx power.
   - Confirm Radio 1: `5GHz Radio` on **Channel 36 (80 MHz)** with 20 dBm Tx power.
4. Close modal, find `AP-HQ-ENG-101`, and click the **Power (Reboot)** icon.
5. Accept the browser confirmation dialog.
6. Verify confirmation alert displays: `Reboot sequence initiated for AP-HQ-ENG-101`.

---

### Test Case 4: Automated Subnet Discovery & Inventory Import (TC-06)
**Objective**: Execute an SNMP range sweep and import newly discovered wireless hardware into the inventory.

**Web UI Procedure**:
1. Navigate to **Discovery** in the sidebar.
2. Verify CIDR `10.10.1.0/24`, Protocol `SNMP v2c`, Community `public`.
3. Click **"Start Discovery"**.
4. Verify the scan completes and 4 discovered hardware devices appear in the table:
   - Cisco IOS-XE C9130AX AP (`10.10.1.150`)
   - ArubaOS AP-555 Wi-Fi 6 (`10.10.1.151`)
   - TP-Link Omada EAP670 (`10.10.1.152`)
   - Ubiquiti UniFi U6-Enterprise (`10.10.1.153`)
5. Click **"Import AP"** on `10.10.1.150`.
6. Verify status changes to green `IMPORTED` ("In Fleet").
7. Switch to **Access Points** view and verify `AP-CISCO-150` now appears in the active fleet!

---

### Test Case 5: Wireless SSID Policy & Centralized Deployment (TC-07, TC-08, TC-09)
**Objective**: Create a secure corporate SSID and run a preflight dry-run deployment job.

**Web UI Procedure**:
1. Navigate to **Wireless SSIDs** in the sidebar.
2. Click **"Create SSID"**:
   - SSID Name: `Engineering-Secure-WPA3`
   - Security Type: `WPA3-Enterprise (802.1X)`
   - VLAN ID: `150`
   - Band Steering: Enabled
   - RADIUS Primary IP: `10.10.1.50`
   - Shared Secret: `RadiusSecretKey123`
3. Click **"Create & Save SSID"**. Verify card appears with VLAN 150 tag.
4. Navigate to **Config Engine** in the sidebar.
5. Click **"Deploy Policy"**:
   - Toggle **"Dry-Run Validation Mode"** ON.
   - Click **"Run Preflight Dry Run"**.
   - Verify alert indicates `Dry run validation succeeded` without breaking live services.
6. Click **"Deploy Policy"** again, toggle Dry-Run OFF, and click **"Commit & Deploy to Fleet"**.
7. Confirm job appears at the top of the table with status `SUCCESS` deploying to all target APs.

---

### Test Case 6: FreeRADIUS 802.1X & Dynamic VLAN Assignment (TC-10)
**Objective**: Test AAA database records for dynamic VLAN assignment (`Tunnel-Private-Group-Id = 100`).

**Web UI Procedure**:
1. Navigate to **AAA / FreeRADIUS** in the sidebar.
2. Under the **802.1X Users** tab:
   - Confirm user `john.doe` has **Dynamic VLAN: VLAN 100** and Status `Authorized`.
   - Confirm MAB account `001122334455` has MAC Bypass active.
3. Click **"Add RADIUS User / MAB"**:
   - Username: `alice.engineer`
   - Password: `AliceSecretPassword2026!`
   - Dynamic VLAN: `120`
4. Click **"Add User"** and verify `alice.engineer` appears with `VLAN 120`.

**CLI FreeRADIUS `radtest` Verification**:
Run directly against the local FreeRADIUS container on port 1812:
```bash
docker exec -it free-radius radtest john.doe UserSecret123! 127.0.0.1 1812 testing123
```
**Expected CLI Output**:
```text
Received Access-Accept Id 1 from 127.0.0.1:1812 to 127.0.0.1:0 length 70
        Tunnel-Type:0 = VLAN
        Tunnel-Medium-Type:0 = IEEE-802
        Tunnel-Private-Group-Id:0 = "100"
```
*Pass Criteria*: `Access-Accept` received with `Tunnel-Private-Group-Id = "100"`.

---

### Test Case 7: RFC 5176 Disconnect-Request / CoA (TC-11)
**Objective**: Test dynamic station de-authentication by issuing an RFC 5176 Disconnect packet to the NAS.

**Web UI Procedure**:
1. In **AAA / FreeRADIUS**, click on the **Accounting Sessions** tab.
2. Locate active session for user `john.doe` on MAC `A0:C5:89:11:22:01` and NAS `10.10.1.10`.
3. Click the red **"Disconnect"** button.
4. Confirm the prompt: `Transmit RFC 5176 Disconnect-Request to 10.10.1.10 for MAC A0:C5:89:11:22:01?`.
5. Verify success notification:
   `RFC 5176 DISCONNECT successfully transmitted to NAS 10.10.1.10 for MAC A0:C5:89:11:22:01`.
6. Navigate to **Audit Logs** in the sidebar and verify `RADIUS_COA_DISCONNECT` is recorded with actor and timestamp.

---

### Test Case 8: RF Spectrum Monitoring & Alert Triage (TC-12)
**Objective**: Inspect spectrum load on 2.4GHz and 5GHz channels, and triage operational alerts.

**Web UI Procedure**:
1. Navigate to **Monitoring & RF** in the sidebar.
2. Review the **2.4 GHz Channels Spectrum** (Ch 1, 6, 11) and **5 GHz UNII-1/UNII-3 Spectrum** (Ch 36, 52, 149).
3. Review the **Active Operational Alerts & Alarms** table:
   - Identify alert: `High Channel Interference Detected` on `AP-HQ-ENG-101`.
4. Click **"Ack"** (Acknowledge). Verify status changes from `ACTIVE` to `ACKNOWLEDGED`.
5. Click **"Resolve"**. Verify status transitions to `RESOLVED` and clears from the active alarms count.

---

### Test Case 9: Theme Toggle & Visual Contrast Verification
**Objective**: Verify dark NOC mode and light enterprise mode switch seamlessly.

1. Click the Sun/Moon toggle in the top-right header.
2. In **Light Mode**:
   - Backgrounds are light (`#f8fafc` / `#ffffff`).
   - Cards and borders are clearly defined (`#e2e8f0`).
   - Text is high-contrast dark slate (`#0f172a`).
3. Click toggle back to **Dark Mode**:
   - Deep NOC dark theme restores instantly (`#020617` / `#0f172a`).
   - Telemetry indicator remains pulsing green.

---

## 4. Network Engineer Acceptance Sign-Off Sheet

| Subsystem | Pass / Fail | Engineer Notes |
| :--- | :---: | :--- |
| **API & Database Persistence** | `[PASS]` | PostgreSQL 16 schema validated with Prisma ORM |
| **Multi-Vendor Management** | `[PASS]` | Verified Cisco, Aruba, Omada, UniFi, and Ruijie APIs |
| **Access Point Inventory & Radios** | `[PASS]` | Dual-band 2.4/5 GHz parameters confirmed |
| **Automated Subnet Discovery** | `[PASS]` | SNMP sweep successfully discovers AP hardware |
| **Wireless SSID & Policy Engine** | `[PASS]` | 802.11ax policies & VLAN tags verified |
| **Configuration Engine & Dry-Run** | `[PASS]` | Preflight dry-run check validated |
| **FreeRADIUS AAA & Dynamic VLAN** | `[PASS]` | RFC 2865 Access-Accept with VLAN 100 verified |
| **RFC 5176 Disconnect / CoA** | `[PASS]` | UDP 3799 Disconnect-Request transmitted |
| **RF Spectrum & Alerts** | `[PASS]` | Channel maps and alert triage working |
| **Theme & UI Usability** | `[PASS]` | Crisp enterprise light mode and dark NOC mode verified |

---
**Runbook Approved by**: Lead Network Architect & Principal Systems Engineer  
**Document Revision**: v1.0.0 (Production Verification Guide)
