# Athena Customer Service Management API

## 🎯 Tổng quan

Athena Customer Service Management API là một hệ thống quản lý dịch vụ khách hàng toàn diện, được thiết kế để hỗ trợ doanh nghiệp trong việc quản lý và xử lý các yêu cầu từ khách hàng thông qua nhiều kênh khác nhau. Hệ thống được thiết kế theo kiến trúc single-tenant với phân quyền 6 cấp độ và tích hợp đa nhà cung cấp dịch vụ.

## ✨ **Cập nhật mới nhất**

### 🔄 **Chuyển đổi Database**
- **Chuyển từ PostgreSQL sang MySQL** để tương thích và hiệu suất tốt hơn
- Cập nhật tất cả cấu hình Prisma và connection strings

### 🎫 **Quản lý trạng thái Ticket nâng cao**
- **Trạng thái mới**: WAIT, PROCESS, SLA_ROV (SLA Risk of Violation), SLA_POV (SLA Point of Violation), CLOSED, DONE, CANCELLED
- **Quy trình cải tiến**: Quản lý vòng đời ticket tốt hơn với giám sát SLA

### 🔐 **Hệ thống phân quyền linh hoạt**
- **Quản lý quyền động**: Bảng Permission và Role mới cho kiểm soát truy cập linh hoạt
- **Phân quyền chi tiết**: Hệ thống phân quyền dựa trên tài nguyên và hành động
- **Gán vai trò**: Gán vai trò động với quyền tùy chỉnh

### ⚙️ **Tối ưu hóa cấu hình**
- **Cấu hình Provider tập trung**: Cấu hình email/messaging provider tập trung trong .env
- **Quản lý kênh thống nhất**: Quản lý tất cả kênh giao tiếp trong một hệ thống
- **Môi trường đơn giản**: .env được tối ưu cho single-tenant architecture

## 🏗️ Kiến trúc hệ thống

### Tech Stack
- **Backend**: Node.js với TypeScript
- **Framework**: Express.js
- **Database**: MySQL với Prisma ORM
- **Authentication**: JWT với refresh token
- **Validation**: Joi
- **Logging**: Winston
- **File Upload**: Multer
- **Rate Limiting**: Express Rate Limit
- **Multi-Provider Support**: Gmail, Outlook, Facebook, Telegram, Zalo

### Cấu trúc dự án
```
src/
├── config/           # Cấu hình ứng dụng
├── shared/           # Utilities và middleware dùng chung
│   ├── middleware/   # Authentication, logging, error handling
│   ├── utils/        # Helper functions, JWT, logger
│   ├── types/        # TypeScript type definitions
│   ├── constants/    # Hằng số ứng dụng
│   ├── providers/    # Multi-provider system
│   │   ├── interfaces/   # Provider interfaces
│   │   ├── email/       # Email providers (Gmail, Outlook)
│   │   └── messaging/   # Messaging providers (Facebook, Telegram, Zalo)
│   └── services/     # Shared services
└── modules/          # Các module chức năng
    ├── auth/         # Xác thực và phân quyền
    ├── user/         # Quản lý người dùng

    ├── department/   # Quản lý phòng ban
    ├── team/         # Quản lý team và giờ làm việc
    ├── ticket/       # Quản lý ticket
    ├── channel/      # Quản lý kênh liên lạc
    ├── sla/          # Quản lý SLA
    ├── notification/ # Hệ thống thông báo
    └── provider/     # Provider management APIs
```

## 🚀 Tính năng chính

### 1. Single-tenant Architecture
- Hệ thống được thiết kế dành riêng cho một doanh nghiệp
- Dữ liệu và cấu hình tập trung, không cần cô lập tenant
- Quản lý phân quyền theo vai trò và phòng ban

### 2. Quản lý người dùng và phân quyền nâng cao
- **6 cấp độ quyền**:
  - `SUPER_ADMIN`: Quản trị toàn hệ thống
  - `CS_ADMIN`: Quản trị hệ thống, assign quyền xem báo cáo
  - `DEPARTMENT_HEAD`: Trưởng phòng, quản lý phòng ban
  - `TEAM_LEADER`: Trưởng nhóm, quản lý team
  - `CS_AGENT`: Nhân viên xử lý ticket
  - `CS_OPERATION`: Nhân viên vận hành

### 2.1. Quản lý Team và giờ làm việc
- Tạo và quản lý team trong phòng ban
- Phân công team leader và thành viên
- Cấu hình giờ làm việc cho từng team
- Theo dõi hiệu suất team
- Phân quyền xem báo cáo theo team

### 3. Quản lý Ticket nâng cao
- Tạo, cập nhật, phân công ticket theo team
- Hỗ trợ upload file đính kèm với validation
- Theo dõi lịch sử xử lý chi tiết
- Hệ thống comment và ghi chú nội bộ
- Tự động tạo ticket từ tin nhắn/email đến
- Phân công ticket theo team và working hours
- SLA tracking với auto-escalation

### 4. Multi-Provider System 🌟 (Centralized Configuration)
#### Email Providers
- **Gmail**: OAuth2 authentication, full email management
- **Outlook**: Microsoft Graph API integration
- Gửi/nhận email, quản lý attachments
- Thread và reply management
- **Centralized Setup**: Cấu hình email providers tập trung

#### Messaging Providers
- **Facebook Messenger**: Page messaging, webhook support
- **Facebook Fanpage**: Fanpage messaging với advanced features
- **Telegram**: Bot API integration, file/media support
- **Zalo**: Official Account API, business messaging
- **Unified Channels**: Quản lý tất cả channels trong một hệ thống
- **Webhook Integration**: Real-time message receiving

#### Provider Features
- **Extensible Architecture**: Dễ dàng thêm provider mới
- **Unified Interface**: API thống nhất cho tất cả providers
- **Webhook Support**: Real-time message receiving
- **Connection Testing**: Test kết nối provider
- **Configuration Management**: Quản lý cấu hình từng provider

### 5. SLA Management
- Thiết lập và theo dõi SLA
- Cảnh báo vi phạm SLA
- Báo cáo hiệu suất

### 6. Hệ thống thông báo
- Thông báo real-time
- Email notifications
- Webhook notifications

## 📋 Yêu cầu hệ thống

- Node.js >= 18.0.0
- MySQL >= 8.0
- Redis (optional, for caching)

## 🛠️ Cài đặt và chạy

### 1. Clone repository
```bash
git clone <repository-url>
cd athena-customer-service-management
```

### 2. Cài đặt dependencies
```bash
npm install
```

### 3. Cấu hình môi trường
```bash
cp .env.example .env
```

Cập nhật các biến môi trường trong file `.env`:

```env
# Database
DATABASE_URL="mysql://username:password@localhost:3306/athena_cms"

# JWT
JWT_SECRET="your-super-secret-jwt-key"
JWT_REFRESH_SECRET="your-super-secret-refresh-key"
JWT_EXPIRES_IN="1h"
JWT_REFRESH_EXPIRES_IN="7d"

# Server
PORT=3000
NODE_ENV="development"
API_VERSION="v1"

# Sample token for development
SAMPLE_TOKEN="sample-token-for-development"

# Provider configurations for the system
# These settings are used for all provider integrations

# Gmail API
GMAIL_CLIENT_ID="your-gmail-client-id"
GMAIL_CLIENT_SECRET="your-gmail-client-secret"
GMAIL_REDIRECT_URI="http://localhost:3000/auth/gmail/callback"

# Outlook/Microsoft Graph API
OUTLOOK_CLIENT_ID="your-outlook-client-id"
OUTLOOK_CLIENT_SECRET="your-outlook-client-secret"
OUTLOOK_TENANT_ID="your-outlook-tenant-id"
OUTLOOK_REDIRECT_URI="http://localhost:3000/auth/outlook/callback"

# Facebook Messenger & Fanpage
FACEBOOK_APP_ID="your-facebook-app-id"
FACEBOOK_APP_SECRET="your-facebook-app-secret"
FACEBOOK_VERIFY_TOKEN="your-webhook-verify-token"

# Telegram Bot
TELEGRAM_BOT_TOKEN="your-telegram-bot-token"
TELEGRAM_WEBHOOK_SECRET="your-webhook-secret"

# Zalo Official Account
ZALO_APP_ID="your-zalo-app-id"
ZALO_APP_SECRET="your-zalo-app-secret"
ZALO_ACCESS_TOKEN="your-zalo-access-token"
```

### 4. Thiết lập database
```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed database (optional)
npx prisma db seed
```

### 5. Build và chạy ứng dụng
```bash
# Development
npm run dev

# Production
npm run build
npm start
```

## 🔧 API Documentation

### Authentication
Tất cả API endpoints (trừ health check và webhooks) đều yêu cầu authentication header:
```
Authorization: Bearer <your-jwt-token>
```

Để test với sample token:
```
Authorization: Bearer sample-token-for-development
```

### Base URL
```
http://localhost:3000/api/v1
```

### Core Endpoints

#### Authentication
- `POST /auth/login` - Đăng nhập
- `POST /auth/refresh` - Refresh token
- `GET /auth/check-token` - Kiểm tra token

#### Users
- `GET /users/me` - Thông tin người dùng hiện tại
- `PUT /users/me` - Cập nhật thông tin cá nhân
- `GET /users` - Danh sách người dùng (role-based filtering)
- `POST /users` - Tạo người dùng mới
- `GET /users/:id` - Chi tiết người dùng
- `PUT /users/:id` - Cập nhật người dùng
- `PUT /users/:id/report-access` - Cập nhật quyền xem báo cáo (CS_ADMIN only)
- `DELETE /users/:id` - Xóa người dùng



#### Departments
- `GET /departments` - Danh sách phòng ban
- `POST /departments` - Tạo phòng ban mới
- `GET /departments/:id` - Chi tiết phòng ban
- `PUT /departments/:id` - Cập nhật phòng ban

#### Teams 🆕
- `GET /teams` - Danh sách team (role-based filtering)
- `POST /teams` - Tạo team mới
- `GET /teams/:id` - Chi tiết team
- `PUT /teams/:id` - Cập nhật team
- `DELETE /teams/:id` - Xóa team
- `POST /teams/:id/members` - Thêm thành viên vào team
- `DELETE /teams/:id/members` - Xóa thành viên khỏi team
- `GET /teams/stats` - Thống kê team

#### Tickets
- `GET /tickets` - Danh sách ticket
- `POST /tickets` - Tạo ticket mới
- `GET /tickets/:id` - Chi tiết ticket
- `PUT /tickets/:id` - Cập nhật ticket
- `POST /tickets/:id/comments` - Thêm comment
- `POST /tickets/:id/attachments` - Upload file đính kèm

#### Channels
- `GET /channels` - Danh sách kênh
- `POST /channels` - Tạo kênh mới
- `GET /channels/:id` - Chi tiết kênh
- `PUT /channels/:id` - Cập nhật kênh
- `POST /channels/:id/test` - Test kết nối kênh

#### Provider APIs 🌟
##### Email Operations
- `POST /providers/channels/:channelId/email/send` - Gửi email
- `GET /providers/channels/:channelId/email/receive` - Nhận email

##### Messaging Operations
- `POST /providers/channels/:channelId/message/send` - Gửi tin nhắn
- `POST /providers/channels/:channelId/webhook` - Webhook endpoint
- `GET /providers/channels/:channelId/webhook/verify` - Verify webhook

##### Provider Management
- `POST /providers/channels/:channelId/test` - Test connection
- `GET /providers/supported` - Danh sách providers được hỗ trợ
- `GET /providers/:providerType/capabilities` - Capabilities của provider

#### SLA
- `GET /sla` - Danh sách SLA
- `POST /sla` - Tạo SLA mới
- `GET /sla/:id` - Chi tiết SLA
- `PUT /sla/:id` - Cập nhật SLA

#### Notifications
- `GET /notifications` - Danh sách thông báo
- `POST /notifications` - Tạo thông báo
- `PUT /notifications/:id/read` - Đánh dấu đã đọc

## 🔌 Provider Configuration

### Gmail Setup
1. Tạo Google Cloud Project
2. Enable Gmail API
3. Tạo OAuth2 credentials
4. Cấu hình redirect URI
5. Lấy refresh token thông qua OAuth flow

### Outlook Setup
1. Đăng ký Azure App
2. Cấu hình Microsoft Graph permissions
3. Lấy tenant ID, client ID, client secret
4. Setup OAuth2 flow

### Facebook Setup
1. Tạo Facebook App
2. Setup Messenger Platform
3. Cấu hình webhook URL
4. Lấy page access token

### Telegram Setup
1. Tạo bot qua @BotFather
2. Lấy bot token
3. Setup webhook URL

### Zalo Setup
1. Đăng ký Zalo Official Account
2. Tạo Zalo App
3. Cấu hình webhook
4. Lấy access token

## 🔐 Bảo mật

### Authentication & Authorization
- JWT-based authentication với refresh token
- Role-based access control (RBAC)
- Department và team-based access control

### Data Protection
- Input validation với Joi
- SQL injection protection với Prisma
- XSS protection
- Rate limiting

### Provider Security
- OAuth2 authentication cho email providers
- Webhook signature verification
- Secure token storage
- API rate limiting

### File Upload Security
- File type validation
- File size limits
- Secure file storage

## 📊 Monitoring & Logging

### Logging
- Structured logging với Winston
- Request/response logging
- Error tracking
- Performance monitoring
- Provider activity logging

### Health Check
```bash
GET /health
```

Response:
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 3600,
  "version": "1.0.0"
}
```

## 🧪 Testing

### Chạy tests
```bash
# Unit tests
npm run test

# Integration tests
npm run test:integration

# Coverage
npm run test:coverage
```

### Test với sample data
Hệ thống đã được seed với dữ liệu mẫu:

**Tài khoản test:**
- Super Admin: `superadmin@athenafs.com` / `password123`
- CS Admin: `csadmin@demo.com` / `password123`
- CS Agent: `agent@demo.com` / `password123`

### Test Provider APIs
```bash
# Test email sending
curl -X POST http://localhost:3000/api/v1/providers/channels/{channelId}/email/send \
  -H "Authorization: Bearer sample-token-for-development" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "test@example.com",
    "subject": "Test Email",
    "body": "This is a test email"
  }'

# Test message sending
curl -X POST http://localhost:3000/api/v1/providers/channels/{channelId}/message/send \
  -H "Authorization: Bearer sample-token-for-development" \
  -H "Content-Type: application/json" \
  -d '{
    "recipientId": "user123",
    "content": "Hello from API!"
  }'
```

## 🚀 Deployment

### Docker
```bash
# Build image
docker build -t athena-cms-api .

# Run container
docker run -p 3000:3000 athena-cms-api
```

### PM2 (Production)
```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start ecosystem.config.js

# Monitor
pm2 monit
```

## 📈 Performance

### Optimization
- Database indexing
- Query optimization với Prisma
- Response compression
- Caching strategies
- Provider connection pooling

### Scalability
- Horizontal scaling ready
- Load balancer compatible
- Database connection pooling
- Provider factory pattern

## 🔄 Extensibility

### Thêm Provider mới
1. Implement interface `IEmailProvider` hoặc `IMessagingProvider`
2. Thêm vào `ProviderFactory`
3. Cập nhật validation schemas
4. Thêm configuration options
5. Hỗ trợ per-company configuration

### Centralized Provider Configuration
- Cấu hình providers tập trung cho toàn hệ thống
- Không cần thay đổi code khi thêm provider mới
- Dynamic provider loading
- Secure credential management

### Custom Business Logic
- Event-driven architecture
- Plugin system ready
- Webhook extensibility
- Team-based workflow customization

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

Để được hỗ trợ, vui lòng tạo issue trên GitHub hoặc liên hệ team phát triển.

---

**Athena Customer Service Management API** - Giải pháp quản lý dịch vụ khách hàng toàn diện với hỗ trợ đa kênh, phân quyền 6 cấp độ, và quản lý team nâng cao cho doanh nghiệp.