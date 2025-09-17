# CHI TIẾT DỰ ÁN: MODULE CHĂM SÓC KHÁCH HÀNG (CMS)

## 1. GIỚI THIỆU DỰ ÁN

### 1.1. Mục tiêu và Bối cảnh
Dự án Module Chăm sóc Khách hàng (CMS) được phát triển bởi Công ty TNHH Giải Pháp Công Nghệ AthenaFS nhằm số hóa và tối ưu hóa quy trình hoạt động của phòng Chăm sóc Khách hàng (CSKH). Mục tiêu chính là chuyển đổi từ một Call Center truyền thống thành một Contact Center đa kênh hiện đại, tích hợp nhiều kênh giao tiếp như Email, Chat, SMS, Tổng đài (IVR Inbound), Facebook, Zalo và các kênh khác.

### 1.2. Mục tiêu Cốt lõi
- **Nâng cấp lên Contact Center:** Tích hợp đa kênh giao tiếp để hình thành một hệ thống Contact Center toàn diện.
- **Số hóa Quy trình CSKH:** Xây dựng các tính năng để quản lý phiếu yêu cầu (ticket) một cách hiệu quả, bao gồm tạo, theo dõi, phân loại và luân chuyển ticket giữa các phòng ban.
- **Đảm bảo Chất lượng Dịch vụ:** Thiết lập và giám sát các Cam kết Mức độ Dịch vụ (SLA) để đảm bảo thời gian phản hồi và xử lý yêu cầu của khách hàng.

## 2. KIẾN TRÚC HỆ THỐNG VÀ CẤU TRÚC TỔ CHỨC

### 2.1. Kiến trúc Multi-tenant
Hệ thống được thiết kế theo kiến trúc đa công ty (multi-tenant), trong đó mỗi công ty là một tenant riêng biệt với cơ cấu tổ chức độc lập.

### 2.2. Cấu trúc Tổ chức
Mỗi công ty trong hệ thống có một cấu trúc phân cấp rõ ràng:
1. **Company (Công ty):** Tổ chức cao nhất.
2. **Department (Phòng ban):** Các phòng ban trực thuộc công ty.
3. **Team (Đội nhóm):** Các đội nhóm trong một phòng ban.
4. **Team Lead & Agents:** Trưởng nhóm và các nhân viên trong một đội.

### 2.3. Quy trình Phân quyền và Thiết lập Ban đầu
1. Khởi tạo Công ty: Hệ thống Athena tạo hồ sơ công ty mới cho khách hàng.
2. Setup Cấu hình: Cài đặt các biến nghiệp vụ như Action Code, trạng thái hợp đồng.
3. Tạo Tài khoản Vận hành: Hệ thống tạo tài khoản Operation Account cho đội ngũ nội bộ Athena.
4. Tạo Tài khoản Agent: Đội vận hành tạo tài khoản Agent cho khách hàng và gán quyền hạn.
5. Bàn giao: Tài khoản được bàn giao cho khách hàng.
6. Khách hàng Tự cấu hình: CS Admin phía khách hàng tiếp tục thiết lập chi tiết cơ cấu tổ chức.

## 3. CÁC VAI TRÒ NGƯỜI DÙNG (ACTORS)

Hệ thống có 4 vai trò người dùng với cấp độ quyền hạn khác nhau:

### 3.1. Super Admin
- Người có quyền hạn cao nhất trên toàn bộ hệ thống.
- Có thể xem toàn bộ thông tin, báo cáo từ tất cả các công ty khách hàng (tenants).

### 3.2. CS Admin
- Quản trị viên cao nhất của một công ty cụ thể.
- Quản lý tất cả các phòng ban, nhân viên, cấu hình các kênh tương tác và gán agents vào các kênh.

### 3.3. CS Agent
- Nhân viên tác nghiệp chính trên hệ thống.
- Mỗi agent thuộc một phòng ban và có vai trò cụ thể trong phòng ban đó.

### 3.4. CS Operation
- Đội ngũ giám sát và vận hành hệ thống.
- Quản lý các vấn đề như cước gọi và cung cấp hỗ trợ cấp 1 (LV1) cho khách hàng.

## 4. CHỨC NĂNG CHÍNH CỦA HỆ THỐNG

### 4.1. Quản lý Ticket

#### 4.1.1. Khởi tạo Ticket Thủ công
- **Mô tả:** Cho phép CS Admin và CS Agent tạo ticket thủ công để ghi nhận yêu cầu của khách hàng.
- **Thông tin cần nhập:**
  - Tên ticket, Phân loại (Inquiry, Complaint, Request), Mức độ ưu tiên
  - Thông tin khách hàng (SĐT, Họ tên, CCCD, Địa chỉ)
  - Nội dung yêu cầu và tài liệu đính kèm (tùy chọn)
- **Quy tắc nghiệp vụ:**
  - `BR_01`: Trạng thái ban đầu của ticket là "Chờ kiểm duyệt"
  - `BR_02`: ID ticket có định dạng: `[Nguồn tạo ticket] + 6 chữ số tự động tăng`
  - `BR_03`: Nếu là khách hàng mới, hệ thống sẽ tự động tạo mã khách hàng (CIF) và lưu thông tin

#### 4.1.2. Khởi tạo Ticket Tự động
Hệ thống có khả năng tự động tạo ticket từ các kênh tương tác:

**Từ Kênh Chat (Facebook, Zalo, Direct Chat):**
- Kích hoạt khi khách hàng gửi tin nhắn mới và cuộc hội thoại trước đó đang ở trạng thái "resolved"
- Ticket mặc định được chuyển về phòng CSKH
- Tên ticket có định dạng: `{yyyyMMddHHmmss} - Tin nhắn từ {tên kênh}`
- Yêu cầu phi chức năng: Hệ thống phải có khả năng khởi tạo thành công 100 tickets tự động tại cùng một thời điểm

**Từ Cuộc gọi Inbound (Tổng đài):**
- Kích hoạt khi có cuộc gọi đến số hotline của công ty
- Hệ thống tự động tạo ticket và phân loại dựa trên hành vi của khách hàng (phím bấm IVR hoặc intent của Voicebot)
- Nội dung ticket đính kèm file ghi âm cuộc gọi
- Yêu cầu phi chức năng: Khởi tạo 100 tickets đồng thời; ticket phải được tạo trong vòng 5 giây sau khi cuộc gọi kết thúc

#### 4.1.3. Danh sách và Chi tiết Ticket
**Hiển thị Danh sách:**
- Phân quyền hiển thị theo vai trò người dùng
- Chức năng tìm kiếm và bộ lọc "live" theo nhiều tiêu chí
- Yêu cầu phi chức năng: Tốc độ truy vấn không quá 10 giây

**Hiển thị Chi tiết:**
- Xem đầy đủ thông tin ticket, thông tin khách hàng, lịch sử tương tác và khu vực thảo luận nội bộ

#### 4.1.4. Cập nhật Trạng thái Ticket
**Cập nhật Thủ công:** Agent đang phụ trách ticket có thể thay đổi trạng thái

**Cập nhật Tự động:**
- Vi phạm SLA: Hệ thống tự động cập nhật trạng thái và nâng mức độ ưu tiên
- Ticket quá hạn: Ticket chưa xử lý sau 10 ngày sẽ tự động chuyển sang trạng thái "Đã Hủy"

**Các Trạng thái Chính:**
- `WAIT`: Chờ tiếp nhận
- `PROCESS`: Đang xử lý
- `CLOSED`: Phiếu đóng
- `DONE`: Hoàn thành
- `CANCELLED`: Đã hủy

### 4.2. Quản lý SLA

#### 4.2.1. Khởi tạo SLA
- Chỉ CS Admin mới có quyền tạo SLA
- Thông tin cấu hình: Tên SLA, Loại ticket, Mức độ ưu tiên, Thời gian phản hồi, Thời gian xử lý, Giờ hành chính
- Quy tắc nghiệp vụ: Tên SLA không được trùng; Không tạo SLA trùng lặp

#### 4.2.2. Theo dõi (Track) SLA
- Hệ thống tự động theo dõi SLA bắt đầu từ khi ticket được tạo
- Ghi nhận thời gian phản hồi đầu tiên (FRT) và thời gian xử lý (RT)
- Yêu cầu phi chức năng: Đồng hồ đếm ngược cập nhật gần thời gian thực (độ trễ ≤ 1 phút)

### 4.3. Quản lý Kênh (Channel)

#### 4.3.1. Thêm Kênh mới (Chat & Email)
- Chỉ CS Admin có quyền thêm kênh mới
- Luồng chính: Chọn loại kênh → Cung cấp thông tin cấu hình → Hệ thống kiểm tra và kết nối → Gán agents
- Quy tắc nghiệp vụ: Không thêm kênh trùng lặp trong cùng công ty
- Yêu cầu phi chức năng: Thông tin cấu hình kênh phải được mã hóa khi lưu

#### 4.3.2. Tác nghiệp trên Kênh Email
- Agents có thể xem hộp thư đến, đi, spam như trình duyệt email thông thường
- Soạn và gửi email trực tiếp từ hệ thống với trình soạn thảo rich-text

### 4.4. Quản lý Tổ chức (Phòng ban & Agents)

#### 4.4.1. Quản lý Phòng ban (Department)
- CS Admin có thể tạo, cập nhật và xem danh sách/chi tiết phòng ban
- Thông tin: Tên phòng ban, mô tả, trưởng phòng, danh sách agents thành viên
- Quy tắc nghiệp vụ: Tên phòng ban không trùng; Một agent không thuộc nhiều phòng ban

#### 4.4.2. Quản lý Agents
- CS Admin và CS Lead có thể xem danh sách nhân viên
- Phân quyền: CS Admin xem tất cả agents trong công ty; CS Lead chỉ xem agents trong department của mình

## 5. YÊU CẦU PHI CHỨC NĂNG

### 5.1. Hiệu năng
- Khả năng khởi tạo thành công 100 tickets tự động cùng lúc
- Tốc độ truy vấn cho bộ lọc và tìm kiếm không quá 10 giây
- Ticket từ cuộc gọi inbound phải được tạo trong vòng 5 giây sau khi kết thúc

### 5.2. Thời gian thực
- Đồng hồ đếm ngược của SLA cập nhật gần thời gian thực (độ trễ ≤ 1 phút)

### 5.3. Bảo mật
- Thông tin cấu hình kênh phải được mã hóa khi lưu trong cơ sở dữ liệu

### 5.4. Giao diện người dùng
- Khả năng mở rộng cho rich-text editor (thêm, sửa, xoá, chọn, chỉnh sửa chữ ký)
- Input field cho email hiển thị danh sách email đã từng gửi và cho phép chọn

## 6. QUY TRÌNH NGHIỆP VỤ CHÍNH

### 6.1. Quy trình khởi tạo công ty mới
1. Hệ thống Athena tạo hồ sơ công ty mới
2. Setup cấu hình nghiệp vụ
3. Tạo tài khoản vận hành cho đội ngũ Athena
4. Tạo tài khoản agent theo yêu cầu khách hàng
5. Bàn giao tài khoản cho khách hàng
6. Khách hàng tự cấu hình tổ chức của họ

### 6.2. Quy trình xử lý ticket
1. Ticket được tạo thủ công hoặc tự động từ các kênh
2. Ticket được phân loại và gán cho phòng ban phù hợp
3. Agent tiếp nhận và xử lý ticket
4. Hệ thống theo dõi SLA và cảnh báo khi vi phạm
5. Ticket được cập nhật trạng thái theo tiến độ xử lý
6. Ticket được đóng hoặc hủy theo quy định

## 7. TÍCH HỢP KÊNH GIAO TIẾP

Hệ thống hỗ trợ tích hợp đa kênh giao tiếp:
- Email (Gmail, Outlook, v.v.)
- Chat (Facebook Messenger, Zalo)
- Direct Chat từ website
- Tổng đài (IVR Inbound)
- SMS
- Và các kênh khác theo yêu cầu

## 8. BÁO CÁO VÀ THEO DÕI

Hệ thống cung cấp khả năng theo dõi và báo cáo:
- Super Admin: Xem báo cáo từ tất cả công ty
- CS Admin: Xem báo cáo trong công ty của họ
- CS Lead: Xem báo cáo của department mình
- Agents: Xem báo cáo theo phân quyền được cấp

## 9. KẾT LUẬN

Module Chăm sóc Khách hàng (CMS) của AthenaFS là một giải pháp toàn diện giúp doanh nghiệp chuyển đổi số trong lĩnh vực chăm sóc khách hàng. Với kiến trúc multi-tenant, hệ thống hỗ trợ nhiều công ty với cấu trúc tổ chức độc lập. Các chức năng chính bao gồm quản lý ticket, SLA, kênh giao tiếp và tổ chức, giúp nâng cao chất lượng dịch vụ và hiệu quả hoạt động của phòng CSKH.
