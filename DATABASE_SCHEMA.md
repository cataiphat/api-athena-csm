# Database Schema Documentation

## Overview
Athena Customer Service Management System - Complete database schema documentation for all models and their relationships.

## Core Models

### 1. Company Model
**Table:** `companies`
- `id` (String, Primary Key): Unique company identifier
- `name` (String): Company name
- `domain` (String, Unique): Company domain for multi-tenancy
- `settings` (Json, Optional): Company-specific settings
- `isActive` (Boolean, Default: true): Company status
- `createdAt` (DateTime): Creation timestamp
- `updatedAt` (DateTime): Last update timestamp

**Relations:**
- One-to-many: Users, Departments, Teams, Channels, Customers, Tickets, SLAs, Roles, Notifications

### 2. User Model
**Table:** `users`
- `id` (String, Primary Key): Unique user identifier
- `email` (String, Unique): User email address
- `password` (String): Encrypted password
- `firstName` (String): User's first name
- `lastName` (String): User's last name
- `phone` (String, Optional): Phone number
- `avatar` (String, Optional): Avatar URL
- `status` (UserStatus, Default: ACTIVE): User status (ACTIVE, INACTIVE, SUSPENDED)
- `companyId` (String, Foreign Key): Company reference
- `departmentId` (String, Optional, Foreign Key): Department reference
- `teamId` (String, Optional, Foreign Key): Team reference
- `roleId` (String, Foreign Key): Role reference (Required)
- `canAccessReports` (Boolean, Default: false): Report access permission
- `settings` (Json, Optional): User-specific settings
- `lastLoginAt` (DateTime, Optional): Last login timestamp
- `createdAt` (DateTime): Creation timestamp
- `updatedAt` (DateTime): Last update timestamp

**Relations:**
- Many-to-one: Company, Department, Team, Role
- One-to-one: Department (as head), Team (as leader)
- One-to-many: Assigned Tickets, Created Tickets, Comments, Attachments, Channel Agents, Notifications

### 3. Role Model
**Table:** `roles`
- `id` (String, Primary Key): Unique role identifier
- `name` (String): Role name (e.g., "Department Manager", "Senior Agent")
- `description` (String, Optional): Role description
- `type` (UserRole): Built-in role type (SUPER_ADMIN, CS_ADMIN, DEPARTMENT_HEAD, TEAM_LEADER, CS_AGENT, CS_OPERATION)
- `companyId` (String, Optional, Foreign Key): Company reference (null for built-in roles)
- `isActive` (Boolean, Default: true): Role status
- `createdAt` (DateTime): Creation timestamp
- `updatedAt` (DateTime): Last update timestamp

**Constraints:**
- Unique: [name, companyId] - Unique role name per company

**Relations:**
- Many-to-one: Company (optional)
- One-to-many: Users, Role Permissions

### 4. Permission Model
**Table:** `permissions`
- `id` (String, Primary Key): Unique permission identifier
- `name` (String, Unique): Permission name
- `description` (String, Optional): Permission description
- `resource` (ResourceType): Resource type (USER, COMPANY, DEPARTMENT, TEAM, TICKET, etc.)
- `action` (PermissionType): Action type (CREATE, READ, UPDATE, DELETE, MANAGE)
- `createdAt` (DateTime): Creation timestamp

**Relations:**
- One-to-many: Role Permissions

### 5. RolePermission Model
**Table:** `role_permissions`
- `id` (String, Primary Key): Unique identifier
- `roleId` (String, Foreign Key): Role reference
- `permissionId` (String, Foreign Key): Permission reference
- `createdAt` (DateTime): Creation timestamp

**Constraints:**
- Unique: [roleId, permissionId] - Unique permission per role

**Relations:**
- Many-to-one: Role, Permission

## Organizational Models

### 6. Department Model
**Table:** `departments`
- `id` (String, Primary Key): Unique department identifier
- `name` (String): Department name
- `description` (String, Optional): Department description
- `companyId` (String, Foreign Key): Company reference
- `headId` (String, Optional, Foreign Key): Department head user reference
- `isActive` (Boolean, Default: true): Department status
- `createdAt` (DateTime): Creation timestamp
- `updatedAt` (DateTime): Last update timestamp

**Constraints:**
- Unique: [companyId, name] - Unique department name per company

**Relations:**
- Many-to-one: Company, Head (User)
- One-to-many: Users, Teams, Tickets, Channel Agents

### 7. Team Model
**Table:** `teams`
- `id` (String, Primary Key): Unique team identifier
- `name` (String): Team name
- `description` (String, Optional): Team description
- `companyId` (String, Foreign Key): Company reference
- `departmentId` (String, Foreign Key): Department reference
- `leaderId` (String, Optional, Foreign Key): Team leader user reference
- `isActive` (Boolean, Default: true): Team status
- `createdAt` (DateTime): Creation timestamp
- `updatedAt` (DateTime): Last update timestamp

**Constraints:**
- Unique: [departmentId, name] - Unique team name per department

**Relations:**
- Many-to-one: Company, Department, Leader (User)
- One-to-many: Users, Tickets, Working Hours, Channel Agents

### 8. WorkingHours Model
**Table:** `working_hours`
- `id` (String, Primary Key): Unique identifier
- `teamId` (String, Foreign Key): Team reference
- `dayOfWeek` (Integer): Day of week (0=Sunday, 6=Saturday)
- `startTime` (String): Start time (HH:MM format)
- `endTime` (String): End time (HH:MM format)
- `isActive` (Boolean, Default: true): Working hours status
- `createdAt` (DateTime): Creation timestamp
- `updatedAt` (DateTime): Last update timestamp

**Constraints:**
- Unique: [teamId, dayOfWeek] - One working hours per team per day

**Relations:**
- Many-to-one: Team

## Customer & Ticket Models

### 9. Customer Model
**Table:** `customers`
- `id` (String, Primary Key): Unique customer identifier
- `name` (String): Customer name
- `email` (String, Optional): Customer email
- `phone` (String, Optional): Customer phone
- `companyId` (String, Foreign Key): Company reference
- `metadata` (Json, Optional): Additional customer data
- `createdAt` (DateTime): Creation timestamp
- `updatedAt` (DateTime): Last update timestamp

**Relations:**
- Many-to-one: Company
- One-to-many: Tickets, Channel Messages

### 10. Ticket Model
**Table:** `tickets`
- `id` (String, Primary Key): Unique ticket identifier
- `ticketNumber` (String, Unique): Human-readable ticket number
- `title` (String): Ticket title
- `description` (String): Ticket description
- `status` (TicketStatus): Ticket status (WAIT, PROCESS, CLOSED, DONE, SLA_ROV, SLA_POV, CANCELLED)
- `priority` (Priority): Ticket priority (LOW, MEDIUM, HIGH, URGENT)
- `companyId` (String, Foreign Key): Company reference
- `customerId` (String, Foreign Key): Customer reference
- `creatorId` (String, Foreign Key): Creator user reference
- `assigneeId` (String, Optional, Foreign Key): Assignee user reference
- `departmentId` (String, Foreign Key): Department reference
- `teamId` (String, Optional, Foreign Key): Team reference
- `channelId` (String, Optional, Foreign Key): Channel reference
- `slaId` (String, Optional, Foreign Key): SLA reference
- `dueDate` (DateTime, Optional): Ticket due date
- `resolvedAt` (DateTime, Optional): Resolution timestamp
- `closedAt` (DateTime, Optional): Closure timestamp
- `tags` (String Array): Ticket tags
- `metadata` (Json, Optional): Additional ticket data
- `createdAt` (DateTime): Creation timestamp
- `updatedAt` (DateTime): Last update timestamp

**Relations:**
- Many-to-one: Company, Customer, Creator (User), Assignee (User), Department, Team, Channel, SLA
- One-to-many: Comments, Attachments, SLA Tracking, Notifications

### 11. TicketComment Model
**Table:** `ticket_comments`
- `id` (String, Primary Key): Unique comment identifier
- `content` (String): Comment content
- `isInternal` (Boolean, Default: false): Internal vs customer communication
- `ticketId` (String, Foreign Key): Ticket reference
- `authorId` (String, Foreign Key): Author user reference
- `createdAt` (DateTime): Creation timestamp
- `updatedAt` (DateTime): Last update timestamp

**Relations:**
- Many-to-one: Ticket, Author (User)
- One-to-many: Attachments

### 12. Attachment Model
**Table:** `attachments`
- `id` (String, Primary Key): Unique attachment identifier
- `fileName` (String): Original file name
- `filePath` (String): Storage path
- `fileSize` (Integer): File size in bytes
- `mimeType` (String): MIME type
- `type` (AttachmentType): Attachment category (IMAGE, DOCUMENT, VIDEO, AUDIO, OTHER)
- `ticketId` (String, Optional, Foreign Key): Ticket reference (for ticket attachments)
- `commentId` (String, Optional, Foreign Key): Comment reference (for comment attachments)
- `uploadedBy` (String, Foreign Key): Uploader user reference
- `createdAt` (DateTime): Creation timestamp

**Relations:**
- Many-to-one: Ticket (optional), Comment (optional), Uploader (User)

## Channel & Communication Models

### 13. Channel Model
**Table:** `channels`
- `id` (String, Primary Key): Unique channel identifier
- `name` (String): Channel name
- `type` (ChannelType): Channel type (EMAIL, FACEBOOK, TELEGRAM, ZALO, WHATSAPP, WEBCHAT)
- `companyId` (String, Foreign Key): Company reference
- `config` (Json): Channel configuration (API keys, tokens, etc.)
- `isActive` (Boolean, Default: true): Channel status
- `createdAt` (DateTime): Creation timestamp
- `updatedAt` (DateTime): Last update timestamp

**Constraints:**
- Unique: [companyId, name] - Unique channel name per company

**Relations:**
- Many-to-one: Company
- One-to-many: Channel Agents, Channel Messages, Tickets

### 14. ChannelAgent Model (Enhanced)
**Table:** `channel_agents`
- `id` (String, Primary Key): Unique identifier
- `channelId` (String, Foreign Key): Channel reference
- `userId` (String, Optional, Foreign Key): Individual user assignment
- `departmentId` (String, Optional, Foreign Key): Department assignment
- `teamId` (String, Optional, Foreign Key): Team assignment
- `isActive` (Boolean, Default: true): Assignment status
- `createdAt` (DateTime): Creation timestamp
- `updatedAt` (DateTime): Last update timestamp

**Constraints:**
- Unique: [channelId, userId] - Unique user per channel
- Unique: [channelId, departmentId] - Unique department per channel
- Unique: [channelId, teamId] - Unique team per channel

**Relations:**
- Many-to-one: Channel, User (optional), Department (optional), Team (optional)

### 15. ChannelMessage Model
**Table:** `channel_messages`
- `id` (String, Primary Key): Unique message identifier
- `externalId` (String, Optional): ID from external platform
- `content` (String): Message content
- `messageType` (String): Message type (text, image, file, etc.)
- `direction` (String): Message direction (inbound, outbound)
- `channelId` (String, Foreign Key): Channel reference
- `customerId` (String, Optional, Foreign Key): Customer reference
- `ticketId` (String, Optional, Foreign Key): Associated ticket reference
- `metadata` (Json, Optional): Platform-specific metadata
- `createdAt` (DateTime): Creation timestamp

**Relations:**
- Many-to-one: Channel, Customer (optional), Ticket (optional)

## SLA & Notification Models

### 16. SLA Model
**Table:** `slas`
- `id` (String, Primary Key): Unique SLA identifier
- `name` (String): SLA name
- `description` (String, Optional): SLA description
- `companyId` (String, Foreign Key): Company reference
- `responseTime` (Integer): Response time in minutes
- `resolutionTime` (Integer): Resolution time in minutes
- `priority` (Priority): SLA priority level
- `isActive` (Boolean, Default: true): SLA status
- `createdAt` (DateTime): Creation timestamp
- `updatedAt` (DateTime): Last update timestamp

**Relations:**
- Many-to-one: Company
- One-to-many: Tickets, SLA Tracking

### 17. SLATracking Model
**Table:** `sla_tracking`
- `id` (String, Primary Key): Unique tracking identifier
- `ticketId` (String, Foreign Key): Ticket reference
- `slaId` (String, Foreign Key): SLA reference
- `responseDeadline` (DateTime): Response deadline
- `resolutionDeadline` (DateTime): Resolution deadline
- `respondedAt` (DateTime, Optional): Response timestamp
- `resolvedAt` (DateTime, Optional): Resolution timestamp
- `status` (SLAStatus): SLA status (PENDING, MET, BREACHED)
- `createdAt` (DateTime): Creation timestamp
- `updatedAt` (DateTime): Last update timestamp

**Constraints:**
- Unique: [ticketId, slaId] - One SLA tracking per ticket per SLA

**Relations:**
- Many-to-one: Ticket, SLA

### 18. Notification Model
**Table:** `notifications`
- `id` (String, Primary Key): Unique notification identifier
- `title` (String): Notification title
- `message` (String): Notification message
- `type` (NotificationType): Notification type (TICKET_ASSIGNED, SLA_WARNING, etc.)
- `companyId` (String, Foreign Key): Company reference
- `userId` (String, Foreign Key): Target user reference
- `ticketId` (String, Optional, Foreign Key): Related ticket reference
- `isRead` (Boolean, Default: false): Read status
- `metadata` (Json, Optional): Additional notification data
- `createdAt` (DateTime): Creation timestamp

**Relations:**
- Many-to-one: Company, User, Ticket (optional)

## Enums

### UserRole
- `SUPER_ADMIN`: System super administrator
- `CS_ADMIN`: Customer service administrator
- `DEPARTMENT_HEAD`: Department head
- `TEAM_LEADER`: Team leader
- `CS_AGENT`: Customer service agent
- `CS_OPERATION`: Customer service operations

### UserStatus
- `ACTIVE`: Active user
- `INACTIVE`: Inactive user
- `SUSPENDED`: Suspended user

### TicketStatus (Optimized)
- `WAIT`: Waiting for processing
- `PROCESS`: Being processed
- `CLOSED`: Closed ticket
- `DONE`: Completed ticket
- `SLA_ROV`: SLA response overdue
- `SLA_POV`: SLA resolution overdue
- `CANCELLED`: Cancelled ticket

### Priority
- `LOW`: Low priority
- `MEDIUM`: Medium priority
- `HIGH`: High priority
- `URGENT`: Urgent priority

### ChannelType
- `EMAIL`: Email channel
- `FACEBOOK`: Facebook channel
- `TELEGRAM`: Telegram channel
- `ZALO`: Zalo channel
- `WHATSAPP`: WhatsApp channel
- `WEBCHAT`: Web chat channel

### AttachmentType
- `IMAGE`: Image files
- `DOCUMENT`: Document files
- `VIDEO`: Video files
- `AUDIO`: Audio files
- `OTHER`: Other file types

### ResourceType
- `USER`: User resource
- `COMPANY`: Company resource
- `DEPARTMENT`: Department resource
- `TEAM`: Team resource
- `TICKET`: Ticket resource
- `CUSTOMER`: Customer resource
- `CHANNEL`: Channel resource
- `SLA`: SLA resource
- `NOTIFICATION`: Notification resource
- `REPORT`: Report resource
- `PERMISSION`: Permission resource

### PermissionType
- `CREATE`: Create permission
- `READ`: Read permission
- `UPDATE`: Update permission
- `DELETE`: Delete permission
- `MANAGE`: Full management permission

### NotificationType
- `TICKET_ASSIGNED`: Ticket assignment notification
- `TICKET_UPDATED`: Ticket update notification
- `SLA_WARNING`: SLA warning notification
- `SLA_BREACH`: SLA breach notification
- `COMMENT_ADDED`: Comment added notification

### SLAStatus
- `PENDING`: SLA pending
- `MET`: SLA met
- `BREACHED`: SLA breached
