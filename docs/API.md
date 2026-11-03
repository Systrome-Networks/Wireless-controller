# WAC REST API Documentation (`/api/v1`)

### Standard Response Envelope
All API endpoints return JSON conforming to this structure:
```json
{
  "success": true,
  "data": { ... }
}
```
Errors return:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": []
  }
}
```

### Endpoints (Phase 1)
- `GET /api/v1/health`: Liveness probe.
- `GET /api/v1/ready`: Readiness probe verifying database connectivity.
- `POST /api/v1/auth/login`: Authenticate with email and password. Returns access and refresh JWTs.
- `POST /api/v1/auth/refresh`: Issue new access token using refresh token.
- `GET /api/v1/auth/me`: Get active authenticated user profile.
- `GET /api/v1/organizations`: List organizations for current user.
- `GET /api/v1/organizations/:id`: Get detailed organization with site counts.
- `POST /api/v1/organizations`: Create new organization (SUPER_ADMIN only).
- `GET /api/v1/sites`: List sites in organization.
- `GET /api/v1/sites/:id`: Get site details, buildings, and associated AP counts.
- `POST /api/v1/sites`: Create new site.
- `GET /api/v1/users`: List users in organization.
- `POST /api/v1/users`: Create user with specific RBAC role.
- `PATCH /api/v1/users/:id`: Update user role or active status.
- `GET /api/v1/audit-logs`: List paginated operational audit records.
