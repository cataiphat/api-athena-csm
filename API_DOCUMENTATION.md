# Athena Customer Service Management API Documentation

This document provides a detailed overview of all the API endpoints available in the Athena Customer Service Management system.

**Base URL**: `http://localhost:3000/api/v1`

**Authentication**: All private endpoints require an `Authorization` header with a bearer token.
`Authorization: Bearer YOUR_JWT_TOKEN`

---

## 1. Authentication (/auth)

### 1.1. Login
- **Description**: Authenticates a user and returns a JWT token pair (access and refresh).
- **Endpoint**: `POST /auth/login`
- **Access**: Public

**cURL Command:**
```bash
curl -X POST \
  http://localhost:3000/api/v1/auth/login \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "superadmin@athenafs.com",
    "password": "password123"
  }'
```

### 1.2. Refresh Token
- **Description**: Obtains a new access token using a valid refresh token.
- **Endpoint**: `POST /auth/refresh`
- **Access**: Public

**cURL Command:**
```bash
curl -X POST \
  http://localhost:3000/api/v1/auth/refresh \
  -H 'Content-Type: application/json' \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'
```

### 1.3. Get User Profile
- **Description**: Retrieves the profile of the currently authenticated user.
- **Endpoint**: `GET /auth/profile`
- **Access**: Private

**cURL Command:**
```bash
curl -X GET \
  http://localhost:3000/api/v1/auth/profile \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

### 1.4. Logout
- **Description**: Logs out the user. (Note: This is a placeholder and doesn't invalidate the token on the server-side in the current implementation).
- **Endpoint**: `POST /auth/logout`
- **Access**: Private

**cURL Command:**
```bash
curl -X POST \
  http://localhost:3000/api/v1/auth/logout \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

### 1.5. Check Token
- **Description**: Verifies if the current access token is valid.
- **Endpoint**: `GET /auth/check-token`
- **Access**: Private

**cURL Command:**
```bash
curl -X GET \
  http://localhost:3000/api/v1/auth/check-token \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

---

## 2. Users (/users)

### 2.1. Get All Users
- **Description**: Retrieves a paginated list of users with filtering and sorting options.
- **Endpoint**: `GET /users`
- **Access**: Private (Role-based filtering applies)
- **Query Parameters**: `page`, `limit`, `sortBy`, `sortOrder`, `search`, `status`, `role`, `departmentId`

**cURL Command:**
```bash
curl -X GET \
  'http://localhost:3000/api/v1/users?page=1&limit=10&sortBy=createdAt&sortOrder=desc' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

### 2.2. Get User by ID
- **Description**: Retrieves detailed information for a specific user.
- **Endpoint**: `GET /users/:id`
- **Access**: Private (Role-based filtering applies)

**cURL Command:**
```bash
curl -X GET \
  http://localhost:3000/api/v1/users/USER_ID \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

### 2.3. Create New User
- **Description**: Creates a new user.
- **Endpoint**: `POST /users`
- **Access**: Private (Super Admin, CS Admin)

**cURL Command:**
```bash
curl -X POST \
  http://localhost:3000/api/v1/users \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -d '{
    "email": "new.user@example.com",
    "password": "password123",
    "firstName": "New",
    "lastName": "User",
    "role": "CS_AGENT",
    "companyId": "COMPANY_ID",
    "departmentId": "DEPARTMENT_ID"
  }'
```

### 2.4. Update User
- **Description**: Updates an existing user's information.
- **Endpoint**: `PUT /users/:id`
- **Access**: Private (Super Admin, CS Admin, or user themselves)

**cURL Command:**
```bash
curl -X PUT \
  http://localhost:3000/api/v1/users/USER_ID \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -d '{
    "firstName": "UpdatedFirstName",
    "phone": "1234567890"
  }'
```

### 2.5. Delete User
- **Description**: Deletes a user (soft delete by setting status to INACTIVE).
- **Endpoint**: `DELETE /users/:id`
- **Access**: Private (Super Admin, CS Admin)

**cURL Command:**
```bash
curl -X DELETE \
  http://localhost:3000/api/v1/users/USER_ID \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

---

## 3. Companies (/companies)

### 3.1. Get All Companies
- **Description**: Retrieves a list of all companies.
- **Endpoint**: `GET /companies`
- **Access**: Private (Super Admin only)
- **Query Parameters**: `page`, `limit`, `sortBy`, `sortOrder`, `search`

**cURL Command:**
```bash
curl -X GET \
  'http://localhost:3000/api/v1/companies?limit=5' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

### 3.2. Get Company by ID
- **Description**: Retrieves details for a specific company.
- **Endpoint**: `GET /companies/:id`
- **Access**: Private (Super Admin or members of the company)

**cURL Command:**
```bash
curl -X GET \
  http://localhost:3000/api/v1/companies/COMPANY_ID \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

### 3.3. Get Company Statistics
- **Description**: Retrieves statistics for a specific company.
- **Endpoint**: `GET /companies/:id/stats`
- **Access**: Private (Super Admin or members of the company)

**cURL Command:**
```bash
curl -X GET \
  http://localhost:3000/api/v1/companies/COMPANY_ID/stats \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

### 3.4. Create New Company
- **Description**: Creates a new company.
- **Endpoint**: `POST /companies`
- **Access**: Private (Super Admin only)

**cURL Command:**
```bash
curl -X POST \
  http://localhost:3000/api/v1/companies \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -d '{
    "name": "New Awesome Company",
    "description": "A description for the new company."
  }'
```

### 3.5. Update Company
- **Description**: Updates an existing company.
- **Endpoint**: `PUT /companies/:id`
- **Access**: Private (Super Admin or CS Admin of the company)

**cURL Command:**
```bash
curl -X PUT \
  http://localhost:3000/api/v1/companies/COMPANY_ID \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -d '{
    "name": "Updated Company Name"
  }'
```

### 3.6. Delete Company
- **Description**: Deletes a company.
- **Endpoint**: `DELETE /companies/:id`
- **Access**: Private (Super Admin only)

**cURL Command:**
```bash
curl -X DELETE \
  http://localhost:3000/api/v1/companies/COMPANY_ID \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

---

## 4. Departments (/departments)

### 4.1. Get All Departments
- **Description**: Retrieves a list of departments.
- **Endpoint**: `GET /departments`
- **Access**: Private (All authenticated users, filtered by company)
- **Query Parameters**: `page`, `limit`, `sortBy`, `sortOrder`, `search`

**cURL Command:**
```bash
curl -X GET \
  'http://localhost:3000/api/v1/departments' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

### 4.2. Get Department by ID
- **Description**: Retrieves details for a specific department.
- **Endpoint**: `GET /departments/:id`
- **Access**: Private (Users within the same company)

**cURL Command:**
```bash
curl -X GET \
  http://localhost:3000/api/v1/departments/DEPARTMENT_ID \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

### 4.3. Create New Department
- **Description**: Creates a new department.
- **Endpoint**: `POST /departments`
- **Access**: Private (Super Admin, CS Admin)

**cURL Command:**
```bash
curl -X POST \
  http://localhost:3000/api/v1/departments \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -d '{
    "name": "Sales Department",
    "description": "Handles all sales inquiries.",
    "companyId": "COMPANY_ID",
    "leaderId": "USER_ID"
  }'
```

### 4.4. Update Department
- **Description**: Updates an existing department.
- **Endpoint**: `PUT /departments/:id`
- **Access**: Private (Super Admin, CS Admin)

**cURL Command:**
```bash
curl -X PUT \
  http://localhost:3000/api/v1/departments/DEPARTMENT_ID \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -d '{
    "name": "Customer Support Department"
  }'
```

### 4.5. Delete Department
- **Description**: Deletes a department.
- **Endpoint**: `DELETE /departments/:id`
- **Access**: Private (Super Admin, CS Admin)

**cURL Command:**
```bash
curl -X DELETE \
  http://localhost:3000/api/v1/departments/DEPARTMENT_ID \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

---

## 5. Tickets (/tickets)

### 5.1. Get All Tickets
- **Description**: Retrieves a list of tickets with advanced filtering.
- **Endpoint**: `GET /tickets`
- **Access**: Private (Role-based filtering)
- **Query Parameters**: `page`, `limit`, `sortBy`, `sortOrder`, `search`, `status`, `type`, `priority`, `assigneeId`, `departmentId`, `createdFrom`, `createdTo`

**cURL Command:**
```bash
curl -X GET \
  'http://localhost:3000/api/v1/tickets?status=PROCESS&priority=HIGH' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

### 5.2. Get Ticket Statistics
- **Description**: Retrieves statistics about tickets.
- **Endpoint**: `GET /tickets/stats`
- **Access**: Private (All authenticated users)

**cURL Command:**
```bash
curl -X GET \
  http://localhost:3000/api/v1/tickets/stats \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

### 5.3. Get Ticket by ID
- **Description**: Retrieves details for a specific ticket.
- **Endpoint**: `GET /tickets/:id`
- **Access**: Private (Users with access to the ticket)

**cURL Command:**
```bash
curl -X GET \
  http://localhost:3000/api/v1/tickets/TICKET_ID \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

### 5.4. Create New Ticket
- **Description**: Creates a new ticket. Can include file attachments.
- **Endpoint**: `POST /tickets`
- **Access**: Private (All authenticated users)

**cURL Command (JSON part):**
```bash
curl -X POST \
  http://localhost:3000/api/v1/tickets \
  -H 'Content-Type: multipart/form-data' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -F 'title=My New Support Ticket' \
  -F 'description=Details about the issue.' \
  -F 'type=REQUEST' \
  -F 'priority=MEDIUM' \
  -F 'customerId=CUSTOMER_ID' \
  -F 'departmentId=DEPARTMENT_ID' \
  -F 'attachments=@/path/to/your/file.txt'
```

### 5.5. Update Ticket
- **Description**: Updates an existing ticket.
- **Endpoint**: `PUT /tickets/:id`
- **Access**: Private (Users with access to the ticket)

**cURL Command:**
```bash
curl -X PUT \
  http://localhost:3000/api/v1/tickets/TICKET_ID \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -d '{
    "status": "DONE",
    "priority": "LOW"
  }'
```

### 5.6. Delete Ticket
- **Description**: Deletes a ticket (soft delete).
- **Endpoint**: `DELETE /tickets/:id`
- **Access**: Private (Super Admin, CS Admin)

**cURL Command:**
```bash
curl -X DELETE \
  http://localhost:3000/api/v1/tickets/TICKET_ID \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

### 5.7. Add Comment to Ticket
- **Description**: Adds a comment to a ticket.
- **Endpoint**: `POST /tickets/:id/comments`
- **Access**: Private (Users with access to the ticket)

**cURL Command:**
```bash
curl -X POST \
  http://localhost:3000/api/v1/tickets/TICKET_ID/comments \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -d '{
    "content": "This is a new comment on the ticket.",
    "isInternal": false
  }'
```

---

## 6. Channels (/channels)

### 6.1. Get All Channels
- **Description**: Retrieves a list of communication channels.
- **Endpoint**: `GET /channels`
- **Access**: Private (All authenticated users, filtered by company)
- **Query Parameters**: `page`, `limit`, `sortBy`, `sortOrder`, `search`, `type`

**cURL Command:**
```bash
curl -X GET \
  'http://localhost:3000/api/v1/channels' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

### 6.2. Get Channel by ID
- **Description**: Retrieves details for a specific channel.
- **Endpoint**: `GET /channels/:id`
- **Access**: Private (Users within the same company)

**cURL Command:**
```bash
curl -X GET \
  http://localhost:3000/api/v1/channels/CHANNEL_ID \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

### 6.3. Create New Channel
- **Description**: Creates a new communication channel.
- **Endpoint**: `POST /channels`
- **Access**: Private (Super Admin, CS Admin)

**cURL Command:**
```bash
curl -X POST \
  http://localhost:3000/api/v1/channels \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -d '{
    "name": "Support Email Channel",
    "type": "EMAIL",
    "companyId": "COMPANY_ID",
    "config": {
      "provider": "gmail",
      "email": "support@example.com",
      "clientId": "GMAIL_CLIENT_ID",
      "clientSecret": "GMAIL_CLIENT_SECRET",
      "redirectUri": "http://localhost:3000/auth/gmail/callback",
      "refreshToken": "GMAIL_REFRESH_TOKEN"
    }
  }'
```

### 6.4. Update Channel
- **Description**: Updates an existing channel.
- **Endpoint**: `PUT /channels/:id`
- **Access**: Private (Super Admin, CS Admin)

**cURL Command:**
```bash
curl -X PUT \
  http://localhost:3000/api/v1/channels/CHANNEL_ID \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -d '{
    "name": "Primary Support Email"
  }'
```

### 6.5. Delete Channel
- **Description**: Deletes a channel.
- **Endpoint**: `DELETE /channels/:id`
- **Access**: Private (Super Admin, CS Admin)

**cURL Command:**
```bash
curl -X DELETE \
  http://localhost:3000/api/v1/channels/CHANNEL_ID \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

### 6.6. Test Channel Connection
- **Description**: Tests the connection for a specific channel.
- **Endpoint**: `POST /channels/:id/test`
- **Access**: Private (Users with access to the channel)

**cURL Command:**
```bash
curl -X POST \
  http://localhost:3000/api/v1/channels/CHANNEL_ID/test \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

---

## 7. SLAs (/slas)

### 7.1. Get All SLAs
- **Description**: Retrieves a list of Service Level Agreements.
- **Endpoint**: `GET /slas`
- **Access**: Private (All authenticated users, filtered by company)
- **Query Parameters**: `page`, `limit`, `sortBy`, `sortOrder`, `search`

**cURL Command:**
```bash
curl -X GET \
  'http://localhost:3000/api/v1/slas' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

### 7.2. Get SLA by ID
- **Description**: Retrieves details for a specific SLA.
- **Endpoint**: `GET /slas/:id`
- **Access**: Private (Users within the same company)

**cURL Command:**
```bash
curl -X GET \
  http://localhost:3000/api/v1/slas/SLA_ID \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

### 7.3. Create New SLA
- **Description**: Creates a new SLA.
- **Endpoint**: `POST /slas`
- **Access**: Private (Super Admin, CS Admin)

**cURL Command:**
```bash
curl -X POST \
  http://localhost:3000/api/v1/slas \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -d '{
    "name": "High Priority SLA",
    "firstResponseTimeHours": 1,
    "resolutionTimeHours": 4,
    "companyId": "COMPANY_ID"
  }'
```

### 7.4. Update SLA
- **Description**: Updates an existing SLA.
- **Endpoint**: `PUT /slas/:id`
- **Access**: Private (Super Admin, CS Admin)

**cURL Command:**
```bash
curl -X PUT \
  http://localhost:3000/api/v1/slas/SLA_ID \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -d '{
    "resolutionTimeHours": 3
  }'
```

### 7.5. Delete SLA
- **Description**: Deletes an SLA.
- **Endpoint**: `DELETE /slas/:id`
- **Access**: Private (Super Admin, CS Admin)

**cURL Command:**
```bash
curl -X DELETE \
  http://localhost:3000/api/v1/slas/SLA_ID \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

---

## 8. Notifications (/notifications)

### 8.1. Get User's Notifications
- **Description**: Retrieves notifications for the authenticated user.
- **Endpoint**: `GET /notifications`
- **Access**: Private (All authenticated users)
- **Query Parameters**: `page`, `limit`, `sortBy`, `sortOrder`, `type`, `status`

**cURL Command:**
```bash
curl -X GET \
  'http://localhost:3000/api/v1/notifications?status=unread' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

### 8.2. Get Unread Notification Count
- **Description**: Retrieves the count of unread notifications.
- **Endpoint**: `GET /notifications/unread-count`
- **Access**: Private (All authenticated users)

**cURL Command:**
```bash
curl -X GET \
  http://localhost:3000/api/v1/notifications/unread-count \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

### 8.3. Get Notification by ID
- **Description**: Retrieves a specific notification.
- **Endpoint**: `GET /notifications/:id`
- **Access**: Private (Owner of the notification)

**cURL Command:**
```bash
curl -X GET \
  http://localhost:3000/api/v1/notifications/NOTIFICATION_ID \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

### 8.4. Create New Notification
- **Description**: Creates a new notification for one or more users.
- **Endpoint**: `POST /notifications`
- **Access**: Private (Super Admin, CS Admin)

**cURL Command:**
```bash
curl -X POST \
  http://localhost:3000/api/v1/notifications \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -d '{
    "title": "System Maintenance",
    "message": "The system will be down for maintenance tonight.",
    "type": "INFO",
    "userIds": ["USER_ID_1", "USER_ID_2"]
  }'
```

### 8.5. Mark Notification as Read
- **Description**: Marks a specific notification as read.
- **Endpoint**: `PUT /notifications/:id/read`
- **Access**: Private (Owner of the notification)

**cURL Command:**
```bash
curl -X PUT \
  http://localhost:3000/api/v1/notifications/NOTIFICATION_ID/read \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

### 8.6. Mark All Notifications as Read
- **Description**: Marks all of the user's notifications as read.
- **Endpoint**: `PUT /notifications/read-all`
- **Access**: Private (All authenticated users)

**cURL Command:**
```bash
curl -X PUT \
  http://localhost:3000/api/v1/notifications/read-all \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

### 8.7. Delete Notification
- **Description**: Deletes a notification.
- **Endpoint**: `DELETE /notifications/:id`
- **Access**: Private (Owner of the notification)

**cURL Command:**
```bash
curl -X DELETE \
  http://localhost:3000/api/v1/notifications/NOTIFICATION_ID \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

---

## 9. Provider Operations (/providers)

### 9.1. Send Email
- **Description**: Sends an email through a configured email channel.
- **Endpoint**: `POST /providers/channels/:channelId/email/send`
- **Access**: Private (Users with access to the channel)

**cURL Command:**
```bash
curl -X POST \
  http://localhost:3000/api/v1/providers/channels/CHANNEL_ID/email/send \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -d '{
    "to": "recipient@example.com",
    "subject": "Hello from API",
    "body": "This is the email body."
  }'
```

### 9.2. Receive Emails
- **Description**: Fetches emails from a configured email channel.
- **Endpoint**: `GET /providers/channels/:channelId/email/receive`
- **Access**: Private (Users with access to the channel)

**cURL Command:**
```bash
curl -X GET \
  http://localhost:3000/api/v1/providers/channels/CHANNEL_ID/email/receive \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

### 9.3. Send Message
- **Description**: Sends a message through a configured messaging channel (e.g., Facebook, Zalo).
- **Endpoint**: `POST /providers/channels/:channelId/message/send`
- **Access**: Private (Users with access to the channel)

**cURL Command:**
```bash
curl -X POST \
  http://localhost:3000/api/v1/providers/channels/CHANNEL_ID/message/send \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -d '{
    "recipientId": "RECIPIENT_USER_ID",
    "content": "Hello from the API!"
  }'
```

### 9.4. Handle Webhook
- **Description**: Endpoint for receiving webhook events from providers (e.g., Facebook, Zalo, Telegram).
- **Endpoint**: `POST /providers/channels/:channelId/webhook`
- **Access**: Public

**cURL Command (Example for Facebook):**
```bash
# This is typically called by the provider, not manually.
curl -X POST \
  http://localhost:3000/api/v1/providers/channels/CHANNEL_ID/webhook \
  -H 'Content-Type: application/json' \
  -H 'X-Hub-Signature-256: sha256=... ' \
  -d '{"object":"page","entry":[...]}'
```

### 9.5. Verify Webhook
- **Description**: Endpoint for providers like Facebook to verify the webhook URL.
- **Endpoint**: `GET /providers/channels/:channelId/webhook/verify`
- **Access**: Public

**cURL Command (Example for Facebook):**
```bash
# This is called by the provider during setup.
curl -X GET \
  'http://localhost:3000/api/v1/providers/channels/CHANNEL_ID/webhook/verify?hub.mode=subscribe&hub.challenge=CHALLENGE_TOKEN&hub.verify_token=YOUR_VERIFY_TOKEN'
```

### 9.6. Test Provider Connection
- **Description**: Tests the connection to the provider configured for a channel.
- **Endpoint**: `POST /providers/channels/:channelId/test`
- **Access**: Private (Users with access to the channel)

**cURL Command:**
```bash
curl -X POST \
  http://localhost:3000/api/v1/providers/channels/CHANNEL_ID/test \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

### 9.7. Get Supported Providers
- **Description**: Retrieves a list of all supported providers and their capabilities.
- **Endpoint**: `GET /providers/supported`
- **Access**: Private

**cURL Command:**
```bash
curl -X GET \
  http://localhost:3000/api/v1/providers/supported \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

### 9.8. Get Provider Capabilities
- **Description**: Retrieves the capabilities of a specific provider type.
- **Endpoint**: `GET /providers/:providerType/capabilities`
- **Access**: Private

**cURL Command:**
```bash
curl -X GET \
  http://localhost:3000/api/v1/providers/gmail/capabilities \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```
