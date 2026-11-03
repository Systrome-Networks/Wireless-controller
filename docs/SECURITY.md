# Enterprise Security Architecture

### 1. Role-Based Access Control (RBAC)
The WAC platform defines 7 distinct operational roles:
1. **SUPER_ADMIN**: Global system management, cross-tenant administration, system settings.
2. **ORG_ADMIN**: Organization-wide administrative access, user management, site creation.
3. **NETWORK_ADMIN**: Controller registration, AP management, configuration deployment, discovery.
4. **WIRELESS_ADMIN**: SSID management, RF tuning, AP Group policies, wireless client monitoring.
5. **SECURITY_ADMIN**: RADIUS user management, Dynamic VLAN policies, 802.1X credentials, CoA disconnect.
6. **OPERATOR**: NOC operational monitoring, alert acknowledgment, AP reboot, discovery scans.
7. **AUDITOR**: Read-only compliance inspection, configuration diffs, audit trail review.

### 2. Authentication & Credential Storage
- Passwords are encrypted using salted `bcrypt` with 10 hashing rounds.
- Brute-force protection: 5 consecutive failed login attempts lock the account for 15 minutes.
- API authentication uses stateless RS256/HS256 signed JSON Web Tokens (JWT) with short-lived access tokens (24h) and secure refresh tokens (7d).
- Vendor credentials (WLC API tokens, SSH keys, SNMP communities, RADIUS shared secrets) are stored encrypted at rest.

### 3. Audit Logging
Every state-changing administrative action (`USER_LOGIN`, `ORG_CREATED`, `SITE_CREATED`, `CONFIG_DEPLOY`, `AP_REBOOT`, `COA_DISCONNECT`) writes an immutable record to the `audit_logs` table recording:
- Organization ID
- User ID and email
- Origin IP address
- Action code and target entity ID
- Exact before/after JSON diffs
