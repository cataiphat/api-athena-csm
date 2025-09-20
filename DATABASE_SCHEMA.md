# Database Schema Documentation

## Overview
Athena Customer Service Management System - Single-tenant architecture database schema documentation for all models and their relationships.

**Architecture:** Single-tenant (one database per company deployment)
**Database:** MySQL
**ORM:** Prisma

## Architecture Notes

### Single-Tenant Design
- Each company deployment has its own separate database instance
- No `companyId` fields needed - all data belongs to the single tenant
- When deploying for a new company, clone the entire codebase and database
- Complete isolation between different company instances
- Simplified access control without company-level filtering

### Key Changes from Multi-Tenant
- Removed `Company` model entirely
- Removed `companyId` foreign keys from all models
- Simplified unique constraints (no longer need company-scoped uniqueness)
- Streamlined authentication and authorization logic
- Direct relationships without company-level indirection

## Core Models

### 1. User Model
**Table:** `users`
- `id` (String, Primary Key): Unique user identifier
- `email` (String, Unique): User email address
- `password` (String): Encrypted password
- `firstName` (String): User's first name
- `lastName` (String): User's last name
- `phone` (String, Optional): Phone number
- `avatar` (String, Optional): Avatar URL
- `status` (UserStatus, Default: ACTIVE): User status (ACTIVE, INACTIVE, SUSPENDED)
- `departmentId` (String, Optional, Foreign Key): Department reference
- `teamId` (String, Optional, Foreign Key): Team reference
- `roleId` (String, Foreign Key): Role reference (Required)
- `canAccessReports` (Boolean, Default: false): Report access permission
- `settings` (Json, Optional): User-specific settings
- `lastLoginAt` (DateTime, Optional): Last login timestamp
- `createdAt` (DateTime): Creation timestamp
- `updatedAt` (DateTime): Last update timestamp

**Relations:**
- Many-to-one: Department, Team, Role
- One-to-one: Department (as head), Team (as leader)
- One-to-many: Assigned Tickets, Created Tickets, Comments, Attachments, Channel Agents, Notifications

### 2. Role Model
**Table:** `roles`
- `id` (String, Primary Key): Unique role identifier
- `name` (String, Unique): Role name (e.g., "Department Manager", "Senior Agent")
- `description` (String, Optional): Role description
- `type` (UserRole): Built-in role type (SUPER_ADMIN, CS_ADMIN, DEPARTMENT_HEAD, TEAM_LEADER, CS_AGENT, CS_OPERATION)
- `isActive` (Boolean, Default: true): Role status
- `createdAt` (DateTime): Creation timestamp
- `updatedAt` (DateTime): Last update timestamp

**Relations:**
- One-to-many: Users, Role Permissions

### 3. Permission Model
**Table:** `permissions`
- `id` (String, Primary Key): Unique permission identifier
- `name` (String): Permission name (e.g., "create_ticket", "manage_users")
- `description` (String, Optional): Permission description
- `resource` (ResourceType): Resource type (USER, DEPARTMENT, TEAM, TICKET, etc.)
- `action` (PermissionType): Action type (CREATE, READ, UPDATE, DELETE, MANAGE, etc.)
- `conditions` (Json, Optional): Additional conditions (e.g., own department only)
- `isActive` (Boolean, Default: true): Permission status
- `createdAt` (DateTime): Creation timestamp
- `updatedAt` (DateTime): Last update timestamp

**Constraints:**
- Unique: [resource, action, name]

**Relations:**
- One-to-many: Role Permissions

### 4. RolePermission Model
**Table:** `role_permissions`
- `id` (String, Primary Key): Unique identifier
- `roleId` (String, Foreign Key): Role reference
- `permissionId` (String, Foreign Key): Permission reference
- `conditions` (Json, Optional): Override or additional conditions
- `createdAt` (DateTime): Creation timestamp

**Constraints:**
- Unique: [roleId, permissionId] - Unique permission per role

**Relations:**
- Many-to-one: Role, Permission

## Organizational Models

### 5. Department Model
**Table:** `departments`
- `id` (String, Primary Key): Unique department identifier
- `name` (String, Unique): Department name
- `description` (String, Optional): Department description
- `headId` (String, Optional, Unique, Foreign Key): Department head user reference
- `isActive` (Boolean, Default: true): Department status
- `createdAt` (DateTime): Creation timestamp
- `updatedAt` (DateTime): Last update timestamp

**Relations:**
- Many-to-one: Head (User)
- One-to-many: Users, Teams, Tickets, Channel Agents

### 6. Team Model
**Table:** `teams`
- `id` (String, Primary Key): Unique team identifier
- `name` (String): Team name
- `description` (String, Optional): Team description
- `departmentId` (String, Foreign Key): Department reference
- `leaderId` (String, Optional, Unique, Foreign Key): Team leader user reference
- `isActive` (Boolean, Default: true): Team status
- `createdAt` (DateTime): Creation timestamp
- `updatedAt` (DateTime): Last update timestamp

**Constraints:**
- Unique: [departmentId, name] - Unique team name per department

**Relations:**
- Many-to-one: Department, Leader (User)
- One-to-many: Users, Working Hours, Tickets, Channel Agents

### 7. WorkingHours Model
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

### 8. Customer Model
**Table:** `customers`
- `id` (String, Primary Key): Unique customer identifier
- `cif` (String, Unique): Customer Identification Number
- `externalId` (String, Optional): External ID from providers (Facebook, Telegram, etc.)
- `firstName` (String): Customer's first name
- `lastName` (String): Customer's last name
- `phone` (String, Optional): Customer phone
- `email` (String, Optional): Customer email
- `address` (String, Optional): Customer address
- `idNumber` (String, Optional): ID number (CCCD/CMND)
- `createdAt` (DateTime): Creation timestamp
- `updatedAt` (DateTime): Last update timestamp

**Relations:**
- One-to-many: Tickets, Channel Messages

### 9. Ticket Model
**Table:** `tickets`
- `id` (String, Primary Key): Unique ticket identifier
- `ticketNumber` (String, Unique): Human-readable ticket number
- `title` (String): Ticket title
- `description` (String): Ticket description
- `type` (TicketType): Ticket type (INQUIRY, COMPLAINT, REQUEST)
- `priority` (TicketPriority, Default: MEDIUM): Ticket priority (LOW, MEDIUM, HIGH, URGENT)
- `status` (TicketStatus, Default: WAIT): Ticket status (WAIT, PROCESS, CLOSED, DONE, SLA_ROV, SLA_POV, CANCELLED)
- `source` (String): Source channel
- `customerId` (String, Foreign Key): Customer reference
- `creatorId` (String, Foreign Key): Creator user reference
- `assigneeId` (String, Optional, Foreign Key): Assignee user reference
- `departmentId` (String, Foreign Key): Department reference
- `teamId` (String, Optional, Foreign Key): Team reference
- `channelId` (String, Optional, Foreign Key): Channel reference
- `slaId` (String, Optional, Foreign Key): SLA reference
- `firstResponseAt` (DateTime, Optional): First response timestamp
- `resolvedAt` (DateTime, Optional): Resolution timestamp
- `closedAt` (DateTime, Optional): Closure timestamp
- `dueDate` (DateTime, Optional): Ticket due date
- `tags` (String, Optional): Comma-separated tags
- `metadata` (Json, Optional): Additional ticket data
- `createdAt` (DateTime): Creation timestamp
- `updatedAt` (DateTime): Last update timestamp

**Relations:**
- Many-to-one: Customer, Creator (User), Assignee (User), Department, Team, Channel, SLA
- One-to-many: Comments, Attachments, SLA Tracking

### 10. TicketComment Model
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

### 11. Attachment Model
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

### 12. Channel Model
**Table:** `channels`
- `id` (String, Primary Key): Unique channel identifier
- `name` (String, Unique): Channel name
- `type` (ChannelType): Channel type (EMAIL, FACEBOOK, ZALO, TELEGRAM, DIRECT_CHAT, PHONE)
- `status` (ChannelStatus, Default: ACTIVE): Channel status (ACTIVE, INACTIVE, ERROR)
- `config` (Json): Channel configuration (API keys, tokens, etc.)
- `createdAt` (DateTime): Creation timestamp
- `updatedAt` (DateTime): Last update timestamp

**Relations:**
- One-to-many: Channel Agents, Channel Messages, Tickets

### 13. ChannelAgent Model
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

### 14. ChannelMessage Model
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
- Many-to-one: Channel, Customer (optional)

## SLA & Notification Models

### 15. SLA Model
**Table:** `slas`
- `id` (String, Primary Key): Unique SLA identifier
- `name` (String, Unique): SLA name
- `description` (String, Optional): SLA description
- `ticketType` (TicketType): Ticket type for this SLA
- `priority` (TicketPriority): SLA priority level
- `firstResponseTimeHours` (Integer): First response time in hours
- `resolutionTimeHours` (Integer): Resolution time in hours
- `businessHoursOnly` (Boolean, Default: true): Apply SLA only during business hours
- `status` (SLAStatus, Default: ACTIVE): SLA status
- `createdAt` (DateTime): Creation timestamp
- `updatedAt` (DateTime): Last update timestamp

**Relations:**
- One-to-many: Tickets, SLA Tracking

### 16. SLATracking Model
**Table:** `sla_tracking`
- `id` (String, Primary Key): Unique tracking identifier
- `ticketId` (String, Foreign Key): Ticket reference
- `slaId` (String, Foreign Key): SLA reference
- `firstResponseDue` (DateTime): First response deadline
- `resolutionDue` (DateTime): Resolution deadline
- `firstResponseAt` (DateTime, Optional): First response timestamp
- `resolvedAt` (DateTime, Optional): Resolution timestamp
- `firstResponseBreach` (Boolean, Default: false): First response SLA breached
- `resolutionBreach` (Boolean, Default: false): Resolution SLA breached
- `createdAt` (DateTime): Creation timestamp
- `updatedAt` (DateTime): Last update timestamp

**Constraints:**
- Unique: [ticketId, slaId] - One SLA tracking per ticket per SLA

**Relations:**
- Many-to-one: Ticket, SLA

### 17. Notification Model
**Table:** `notifications`
- `id` (String, Primary Key): Unique notification identifier
- `title` (String): Notification title
- `message` (String): Notification message
- `type` (String): Notification type (e.g., sla_violation, ticket_assigned)
- `userId` (String, Foreign Key): Target user reference
- `ticketId` (String, Optional, Foreign Key): Related ticket reference
- `isRead` (Boolean, Default: false): Read status
- `metadata` (Json, Optional): Additional notification data
- `createdAt` (DateTime): Creation timestamp
- `readAt` (DateTime, Optional): Read timestamp

**Relations:**
- Many-to-one: User

## System Models

### 18. AuditLog Model
**Table:** `audit_logs`
- `id` (String, Primary Key): Unique log identifier
- `action` (String): Action performed (CREATE, UPDATE, DELETE)
- `entity` (String): Entity affected (TICKET, USER, etc.)
- `entityId` (String): ID of the affected entity
- `userId` (String, Optional): User who performed the action
- `changes` (Json, Optional): Details of what changed
- `metadata` (Json, Optional): Additional context
- `createdAt` (DateTime): Creation timestamp

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

### TicketStatus
- `WAIT`: Waiting for processing
- `PROCESS`: Being processed
- `CLOSED`: Closed ticket
- `DONE`: Completed ticket
- `SLA_ROV`: SLA Risk of Violation
- `SLA_POV`: SLA Point of Violation
- `CANCELLED`: Cancelled ticket

### TicketType
- `INQUIRY`: Inquiry ticket
- `COMPLAINT`: Complaint ticket
- `REQUEST`: Request ticket

### TicketPriority
- `LOW`: Low priority
- `MEDIUM`: Medium priority
- `HIGH`: High priority
- `URGENT`: Urgent priority

### ChannelType
- `EMAIL`: Email channel
- `FACEBOOK`: Facebook channel
- `ZALO`: Zalo channel
- `TELEGRAM`: Telegram channel
- `DIRECT_CHAT`: Direct chat channel
- `PHONE`: Phone channel

### PermissionType
- `CREATE`: Create permission
- `READ`: Read permission
- `UPDATE`: Update permission
- `DELETE`: Delete permission
- `ASSIGN`: Assign permission
- `APPROVE`: Approve permission
- `EXPORT`: Export permission
- `IMPORT`: Import permission
- `MANAGE`: Full management permission

### ResourceType
- `USER`: User resource
- `DEPARTMENT`: Department resource
- `TEAM`: Team resource
- `TICKET`: Ticket resource
- `CUSTOMER`: Customer resource
- `CHANNEL`: Channel resource
- `SLA`: SLA resource
- `NOTIFICATION`: Notification resource
- `REPORT`: Report resource
- `PERMISSION`: Permission resource

### AttachmentType
- `IMAGE`: Image files
- `DOCUMENT`: Document files
- `VIDEO`: Video files
- `AUDIO`: Audio files
- `OTHER`: Other file types

### ChannelStatus
- `ACTIVE`: Active channel
- `INACTIVE`: Inactive channel
- `ERROR`: Channel has an error

### SLAStatus
- `ACTIVE`: Active SLA
- `INACTIVE`: Inactive SLA

## Database Optimization

### Indexes
The following indexes are automatically created by Prisma:

**Primary Keys:**
- All models have `id` field as primary key with CUID

**Unique Constraints:**
- `users.email` - Unique email addresses
- `departments.name` - Unique department names
- `teams.[departmentId, name]` - Unique team names per department
- `roles.name` - Unique role names
- `customers.cif` - Unique customer identification numbers
- `tickets.ticketNumber` - Unique ticket numbers
- `channels.name` - Unique channel names
- `slas.name` - Unique SLA names

**Foreign Key Indexes:**
- Automatically created for all foreign key relationships
- Improves JOIN performance and referential integrity

### Performance Considerations

**Query Optimization:**
- Use `select` to limit returned fields
- Use `include` judiciously to avoid N+1 queries
- Implement pagination for large datasets
- Use database-level filtering instead of application-level

**Connection Management:**
- Use connection pooling
- Monitor connection usage
- Implement proper connection cleanup

**Monitoring:**
- Track slow queries
- Monitor database performance metrics
- Regular maintenance and optimization

### Backup Strategy
- Regular automated backups
- Point-in-time recovery capability
- Test backup restoration procedures
- Separate backup storage location
