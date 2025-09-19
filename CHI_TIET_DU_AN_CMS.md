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
1.1.	Hệ thống Athena tiếp nhận thông tin đăng ký và tạo mới Company Profile cho khách hàng.
1.2.	Thực hiện setup các cấu hình không cố định như: Action Code, trạng thái hợp đồng, và các biến nghiệp vụ khác.

2. 2.	Tạo tài khoản vận hành
2.1.	Sau khi công ty được khởi tạo, hệ thống tạo tài khoản vận hành (Operation Account) dành cho đội ngũ nội bộ quản trị.
2.2.	Các tài khoản này được cấp cho team vận hành để quản lý ban đầu.

3. 3.	Phân quyền tài khoản Agents
3.1.	Dựa trên thông tin và yêu cầu phân quyền do khách hàng cung cấp, team vận hành sẽ khởi tạo tài khoản Agent cho công ty đó.
3.2.	Quyền hạn được gán theo vai trò cụ thể (Role/Permission).

4. 4.	Cung cấp tài khoản cho khách hàng

4.1.	Tài khoản đã được khởi tạo sẽ được bàn giao cho khách hàng.

4.2.	CS Admin phía khách hàng tiếp tục thực hiện setup chi tiết về cơ cấu tổ chức của họ trên hệ thống.

5. 5.	Tổ chức phòng ban (Department)
5.1.	CS Admin tạo mới Department, chỉ định Head of Department.
5.2.	Thêm các Agent vào từng phòng ban liên quan.

6. 6.	Khởi tạo Team & khung giờ làm việc
6.1.	CS Admin khởi tạo Team theo nghiệp vụ cụ thể.
6.2.	Gán khung giờ làm việc (Working Shift/Business Hour) cho từng team.
7.	Phân quyền báo cáo cho Agents
7.1.	Tại danh sách Agents, CS Admin chỉ định quyền truy cập báo cáo.
7.2.	Từ đó xác định Agent nào có thể xem được báo cáo tác nghiệp của các nhân viên liên quan.


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
- **Mô tả:** Cho phép người dùng CS Admin, CS Agent hoặc hệ thống tạo mới ticket để ghi nhận yêu cầu/sự cố/feedback của khách hàng. Tính năng bao gồm 2 phần thủ công và tự động
**Đối tượng:** CS Admin, CS Agent
**Tiền điều kiện:** 1/ Đã đăng nhập vào hệ thống
2 /Tài khoản được phép tạo ticket
- **Thông tin cần nhập:**

  - Tên ticket, Phân loại (Inquiry, Complaint, Request), Mức độ ưu tiên
  - Thông tin khách hàng (SĐT, Họ tên, CCCD, Địa chỉ)
  - Nội dung yêu cầu và tài liệu đính kèm (tùy chọn)
- **Quy tắc nghiệp vụ:**
  - `BR_01`: Trạng thái ban đầu của ticket là "Chờ kiểm duyệt"
  - `BR_02`: ID ticket có định dạng: `[Nguồn tạo ticket] + 6 chữ số tự động tăng`
  - `BR_03`: Nếu là khách hàng mới, hệ thống sẽ tự động tạo mã khách hàng (CIF) và lưu thông tin

#### 4.1.2. Khởi tạo Ticket Tự động
Hệ thống có khả năng tự động tạo ticket từ các kênh tương tác: Cho phép người dùng CS Admin, CS Agent hoặc hệ thống tạo mới ticket để ghi nhận yêu cầu/sự cố/feedback của khách hàng. Tính năng bao gồm 2 phần thủ công và tự động


**Từ Kênh Chat (Facebook, Zalo, Direct Chat):**
- Kích hoạt khi khách hàng gửi tin nhắn mới và cuộc hội thoại trước đó đang ở trạng thái "resolved"
- Ticket mặc định được chuyển về phòng CSKH
- Tên ticket có định dạng: `{yyyyMMddHHmmss} - Tin nhắn từ {tên kênh}`
- Yêu cầu phi chức năng: Hệ thống phải có khả năng khởi tạo thành công 100 tickets tự động tại cùng một thời điểm

**Từ Cuộc gọi Inbound (Tổng đài):** Cho phép người dùng CS Admin, CS Agent hoặc hệ thống tạo mới ticket để ghi nhận yêu cầu/sự cố/feedback của khách hàng. Tính năng bao gồm 2 phần thủ công và tự động

- Kích hoạt khi có cuộc gọi đến số hotline của công ty
- Hệ thống tự động tạo ticket và phân loại dựa trên hành vi của khách hàng (phím bấm IVR hoặc intent của Voicebot)
- Nội dung ticket đính kèm file ghi âm cuộc gọi
- Yêu cầu phi chức năng: Khởi tạo 100 tickets đồng thời; ticket phải được tạo trong vòng 5 giây sau khi cuộc gọi kết thúc

#### 4.1.3. Danh sách và Chi tiết Ticket
**Hiển thị Danh sách:** Cho phép người dùng trong 1 công ty thấy toàn bộ các tickets đang có. Ngoài ra bộ lọc, và tìm kiếm nhằm hỗ trợ người dùng trong quá trình tác nghiệp hiệu quả hơn
**Đối tượng:** CS Agents, CS Admin, Agents
**Quy tắc nghiệp vụ:** 
- Phân quyền hiển thị theo vai trò người dùng Hiện bảng danh sách các tickets thuộc công ty của agents đó. Super Admin: Hiện danh sách của tất cả công ty. 
BR_01: Danh sách tickets hiện lên phải thuộc công ty của agents đó 
BR_02: Quy tắc khi hiện tickets theo phân quyền: 
● CS Admin; CS Agents: Hiện toàn bộ 
● Department Lead, Agents: Hiện toàn bộ tickets assign cho phòng ban đó. Nếu lịch sử phiếu đã từng được assign cho phòng ban đó, cho phép hiển thị trong danh sách. 
BR_03: Search theo ticket id hoặc tên ticket 
BR_04: Các tiêu chí đã chọn trong bộ lọc phải giữ nguyên, chỉ reset khi logout khỏi Athena Spear 
BR_05: Đối với bộ lọc, áp dụng cơ chế “Live filtering”. 

- Chức năng tìm kiếm và bộ lọc "live" theo nhiều tiêu chí
- Yêu cầu phi chức năng: Tốc độ truy vấn không quá 10 giây

**Hiển thị Chi tiết:**
- Xem đầy đủ thông tin ticket, thông tin khách hàng, lịch sử tương tác và khu vực thảo luận nội bộ

#### 4.1.4. Cập nhật Trạng thái Ticket 
**Mô tả** Tính năng cho phép cập nhật trạng thái của phiếu yêu cầu (ticket) một cách thủ công hoặc tự động, nhằm giúp các agent và người dùng hệ thống nắm bắt tình trạng xử lý, từ đó tác nghiệp hiệu quả hơn.

**Cập nhật Thủ công:** Agent đang phụ trách ticket có thể thay đổi trạng thái
**Đối tượng:** CS Admin, CS Agent, Hệ thống 
**Quy tắc nghiệp vụ:** BR_01: Các tên trạng thái có thể tùy chỉnh theo công ty, nhưng vẫn đảm bảo các trạng thái mà Athena Spear đề ra dựa trên mã Code.
BR_02: Các tính năng trên phiếu sẽ ẩn tùy thuộc vào trạng thái phiếu:
●	WAIT; PROCESS; SLA_ROV; SLA_POV:
Không cần ẩn tính năng
●	CLOSED, DONE, CANCELLED: Chỉ hiện
chi tiết phiếu; Reopen (Chỉ CS Agent or CS Admin); Còn lại ẩn hết (Thảo luận => Chỉ hiện lịch sử thảo luận)
BR_03: CLOSED, DONE, CANCELLED phải
reopen mới được phép chuyển sang các trạng thái khác

**Cập nhật Tự động:**
- Vi phạm SLA: Hệ thống tự động cập nhật trạng thái và nâng mức độ ưu tiên
- Ticket quá hạn: Ticket chưa xử lý sau 10 ngày sẽ tự động chuyển sang trạng thái "Đã Hủy"

**Các Trạng thái Chính:**
- `WAIT`: Chờ tiếp nhận Hệ thống/ Người dùng Các ticket được tạo tự động/ Được tạo thủ công
- `PROCESS`: Đang xử lý Hệ thống Khi có người PIC ticket đó (hoặc được chỉ định)
- `CLOSED`: Phiếu đóng Người dùng Người dùng chọn
- `DONE`: Hoàn thành Người dùng Người dùng chọn
- `SLA_ROV`: Quá SLA tiếp nhận Hệ thống Khi vi phạm SLA Tiếp nhận Hệ thống Khi hệ thống track được ticket không thỏa SLA


- `SLA_POV`: Quá SLA xử lý Hệ thống Khi vi phạm SLA Xử lý Hệ thống Khi hệ thống track được ticket không thỏa SLA


- `CANCELLED`: Đã hủy Hệ thống Quá 10 ngày phiếu chưa xử lý

#### 4.1.5. Hiện chi tiết ticket 
**Mô tả:** Cho phép người dùng CS Admin, CS Agent được phép xem chi tiết của 1 tickets. Nhằm hỗ trợ người dùng trong việc tác nghiệp trên 1 ticket yêu cầu từ khách hàng. Khả năng xem chi tiết khách hàng, thông tin phiếu, bình luận giữa các agent với.
**Đối tượng:** CS Admin, CS Agent, Agents

**Tiền điều kiện:** 1/ Đã đăng nhập vào hệ thống
2 /Tài khoản được phép xem chi tiết ticket
**Quy tắc nghiệp vụ:** 
- BR_01: Chỉ hiển thị thông tin của ticket được gán cho mình hoặc có vai trò CS Admin, CS Operation

### 4.2. Quản lý SLA

#### 4.2.1. Khởi tạo SLA
- Chỉ CS Admin mới có quyền tạo SLA
- Thông tin cấu hình: Tên SLA, Loại ticket, Mức độ ưu tiên, Thời gian phản hồi, Thời gian xử lý, Giờ hành chính
●	Tên SLA
●	Loại ticket (Inquiry, Complaint, Request)
●	Mức độ ưu tiên (Thấp, Trung Bình, Cao, Ưu Tiên)
●	Thời gian phản hồi (hh:mm:ss)
●	Thời gian xử lý (hh:mm:ss)
●	Ghi chú
●	Giờ hành chính (True; False)

- Quy tắc nghiệp vụ: Tên SLA không được trùng; Không tạo SLA trùng lặp

#### 4.2.2. Theo dõi (Track) SLA 
Hệ thống cần áp dụng và theo dõi các rule SLA đã được gán cho mỗi ticket. SLA quy định thời gian phản hồi đầu tiên và thời gian xử lý hoàn tất. Khi ticket được tạo hoặc thay đổi (ví dụ: đổi nhóm, đổi priority, đổi category), hệ thống sẽ tự động tính toán lại deadline theo SLA policy tương ứng và gắn vào ticket.

- Hệ thống tự động theo dõi SLA bắt đầu từ khi ticket được tạo
- Ghi nhận thời gian phản hồi đầu tiên (FRT) và thời gian xử lý (RT)
- Yêu cầu phi chức năng: Đồng hồ đếm ngược cập nhật gần thời gian thực (độ trễ ≤ 1 phút)

### 4.3. Quản lý Kênh (Channel)

#### 4.3.1. Thêm Kênh mới (Chat & Email)
Tính năng cho phép CS Admin của công ty cấu hình kênh giao tiếp nhằm hỗ trợ cho việc tác nghiệp tối ưu hơn.

- Chỉ CS Admin có quyền thêm kênh mới
- Luồng chính: Chọn loại kênh → Cung cấp thông tin cấu hình → Hệ thống kiểm tra và kết nối → Gán agents
B1: Chọn nút thêm kênh và chọn kênh chat muốn cấu hình (Facebook, Zalo, Direct Chat,...)
B2: Kết nối tới kênh đó bằng cách cung cấp các thông tin cấu hình đã chuẩn bị
B3: Hệ thống thực hiện bước kiểm tra và thông báo kết quả
B4: Chọn các agents được phép tham gia vào kênh để tác nghiệp
B5: Nhấn nút hoàn tất B6: Kết thúc luồng
Email:
Đăng nhập vào hệ thống Có role là CS Admin
Các thông tin để cấu hình đã được lấy: GMAIL:
imap: imap.gmail.com port: 993
email:
app password (có thể dùng chung cho 1 email)


smpt:smtp.gmail.com port: 587
email:
app password (có thể dùng chung cho 1 email)

B1: Tại kênh tương ứng, chọn vào nút thêm mới kênh
B2: Kết nối tới kênh đó bằng cách cung cấp các thông tin cấu hình đã chuẩn bị
B3: Hệ thống thực hiện bước kiểm tra và thông báo kết quả
B4: Chọn các agents được phép tham gia vào kênh để tác nghiệp
B5: Nhấn nút hoàn tất B6: Kết thúc luồng


- Quy tắc nghiệp vụ: Không thêm kênh trùng lặp trong cùng công ty
BR_01: Khi thêm kênh, kênh sẽ được thêm theo công ty. Agent được phép tác nghiệp trên kênh trong trường hợp Admin add vào kênh đó
BR_02: Trong mỗi công ty, không được phép thêm 2 kênh giống nhau.

- Yêu cầu phi chức năng: Thông tin cấu hình kênh phải được mã hóa khi lưu

#### 4.3.2. Tác nghiệp trên Kênh Email
- Agents có thể xem hộp thư đến, đi, spam như trình duyệt email thông thường
- Soạn và gửi email trực tiếp từ hệ thống với trình soạn thảo rich-text
Tính năng cho phép Agent đang tác nghiệp trên channel này có thể xem hộp thư đã được tích hợp trên hệ thống
Đối tượng	CS Admin, CS Agents
Luồng chính	B1: Tại kênh email đã tích hợp, nhấn chọn nút inboxes.
B2: Hệ thống chuyển màn hiển thị danh sách email (Mặc định danh sách hộp thư đến)
B3: Người dùng chọn theo tiêu chí (Hộp thư đến, Hộp thư đi, Starred, Spam)
B4: Hệ thống trả ra danh sách theo tiêu chí tương ứng B5: Kết thúc luồng
Quy tắc nghiệp vụ	BR_01: Double date picker, không được phép chọn ngày tương lai
BR_02: Format ngày giờ trên từng hộp thư:
●	Trong ngày:
○	<1p: “Bây giờ”
○	>=1p: Để giờ hiện tại (HH:mm)
●	>24h: (dd-MM-yyyy) BR_03:
Yêu cầu phi chức năng	NF_01: Thời gian không cần cập nhật real-time, nhưng phải update mỗi khi thời gian thay đổi, độ trễ < 5s/6s
Tên tính năng	Soạn email


Mô tả	Tính năng cho phép Agent đang tác nghiệp trên kênh đó có thể khởi tạo email và gửi ra cho KH
Đối tượng	CS Admin, CS Agents
Tính năng liên quan	Include: Thêm mới email channel
Điều kiện kích hoạt	Nút Soạn Thư
Tiền điều kiện	1/ Kênh email phải được tích hợp thành công
2/ Agent phải được thêm vào kênh để tác nghiệp 3/ Đăng nhập vào hệ thống
Hậu điều kiện	Thành công gửi được email và người gửi nhận được thư
Luồng chính	B1: Tại kênh email đã tích hợp, nhấn chọn nút inboxes.
B2: Hệ thống chuyển màn hiển thị danh sách email (Mặc định danh sách hộp thư đến)
B3: Nhận nút “Soạn Thư” or “Compose” để soạn thư B4: Hệ thống hiển thị giao diện để soạn
B5: Người dùng soạn thư và nhấn nút gửi
B6: Hệ thống gửi mail tới những người liên quan B7: Kết thúc luồng
Yêu cầu phi chức năng	NF_01: Khả năng mở rộng cho rich-text có thể thêm, sửa, xoá, chọn, chỉnh sửa chữ ký.
NF_02: Khả năng mở rộng cho các input field (To, cc, bcc) hiện ra danh sách email đã từng được gửi và cho phép chọn trong danh sách email đó

Tên tính năng	Cấu hình cho mỗi kênh


Mô tả	Tính năng cho phép CS Admin đặt lại tên cho kênh mới cũng như thêm Agents mới để tác nghiệp trên kênh
Đối tượng	CS Admin
Tính năng liên quan	Include: Thêm mới email channel Include: Thêm mới chat channel
Điều kiện kích hoạt	Nút “Cấu hình kênh”
Tiền điều kiện	1/ Kênh email hoặc chat bất kì phải được tích hợp thành công
2/ Agent là CS Admin
3/ Đăng nhập vào hệ thống
Hậu điều kiện	Thành công cập nhật thông tin của kênh đó (Danh sách agents hoặc tên kênh)
Luồng chính	B1: Tại kênh muốn cấu hình đã tích hợp, nhấn chọn nút “Cấu hình kênh”
B2: Hệ thống chuyển màn hình cấu hình kênh
B3: Người dùng nhập tên kênh mới hoặc thêm agent B4: Nhấn lưu
B5: Hệ thống kiểm tra và cập nhật lại cấu hình kênh B6: Kết thúc luồng
Luồng thay thế	Tại B3:
❖	Tên kênh đã tồn tại, hệ thống thông báo “Tên đã tồn tại”.
❖	Người dùng nhập lại tên khác chưa tồn tại
❖	Tiếp tục B4


Luồng thất bại	
Quy tắc nghiệp vụ	
Yêu cầu phi chức năng	NF_01: Khả năng mở rộng cho rich-text có thể thêm, sửa, xoá, chọn, chỉnh sửa chữ ký.
NF_02: Khả năng mở rộng cho các input field (To, cc, bcc) hiện ra danh sách email đã từng được gửi và cho phép chọn trong danh sách email đó

### 4.4. Quản lý Tổ chức (Phòng ban & Agents)

#### 4.4.1. Quản lý Phòng ban (Department)
Tên tính năng	Tạo phòng ban mới
Mô tả	Cho phép quản trị viên hoặc người dùng có quyền tạo


	mới phòng ban trong hệ thống, phục vụ cho việc tổ chức và phân loại nhân sự, phân quyền và quản lý công việc theo cơ cấu tổ chức.
Đối tượng	CS Admin
Tính năng liên quan	
Điều kiện kích hoạt	Nút khởi tạo mới phòng ban
Tiền điều kiện	Có quyền sử dụng chức năng khởi tạo Đã đăng nhập vào hệ thống.
Hậu điều kiện	Phòng ban đã được khởi tạo
Luồng chính	B1. Nhấn nút khởi tạo phòng ban B2. Nhập tên phòng ban và mô tả B3. Chỉ định trưởng phòng.
B4. Thêm agents vào phòng ban đó B5. Nhấn nút khởi tạo.
B6. Kết thúc luồng
Luồng thay thế	
Luồng thất bại	
Quy tắc nghiệp vụ	BR_01: Tên phòng ban không được trùng trong 1 công ty
BR_02: Khi chỉ định trưởng phòng or agents vào phòng ban, không được chỉ định những agents đã thuộc phòng ban khác.
Yêu cầu phi chức năng	

Tên tính năng	Cập nhật phòng ban
Mô tả	Tính năng này cho phép Admin cập nhật phòng ban như đổi tên, thêm mới agents, thay đổi trưởng phòng,...
Đối tượng	CS Admin
Tính năng liên quan	Include: Tạo mới phòng ban, Hiển thị danh sách phòng ban
Điều kiện kích hoạt	Nút cập nhật phòng ban
Tiền điều kiện	Có quyền sử dụng chức năng cập nhật Đã đăng nhập vào hệ thống.
Hậu điều kiện	Phòng ban được cập nhật theo nội dung gần nhất
Luồng chính	B1. Tại danh sách phòng ban, chọn phòng ban muốn thay đổi và nhấn nút cập nhật


	B2. Nhập thông tin muốn thay đổi (Tên, mô tả, trưởng phòng, thêm/xoá agents)
B3. Nhấn nút xác nhận B4. Kết thúc luồng
Luồng thay thế	
Luồng thất bại	
Quy tắc nghiệp vụ	BR_01: Tên phòng ban không được trùng trong 1 công ty (lowercase giá trị rồi mới so sánh) BR_02: Khi chỉ định trưởng phòng or agents vào phòng ban, không được chỉ định những agents đã thuộc phòng ban khác.

Tên tính năng	Hiển thị danh sách phòng ban
Mô tả	Tính năng sẽ hiển thị danh sách phòng ban, nhằm giúp người quản lý có cái nhìn tổng quan hơn về cơ cấu tổ chức của họ
Đối tượng	CS Admin


Tính năng liên quan	
Điều kiện kích hoạt	Nút “Quản lý phòng ban”
Tiền điều kiện	Có quyền sử dụng chức năng hiển thị Đã đăng nhập vào hệ thống.
Hậu điều kiện	Danh sách phòng ban đã được khởi tạo hiển thị đầy đủ lên màn hình
Luồng chính	B1. Tại thanh điều hướng tab cơ cấu tổ chức, nhấn nút quản lý phòng ban.
B2. Hệ thống hiển thị danh sách phòng ban B3. Kết thúc luồng
Tên tính năng	Hiển thị chi tiết phòng ban
Mô tả	Tính năng cho phép quản lý truy cập để thao tác và


	quản lý trực với mỗi phòng ban liên quan.
Đối tượng	CS Admin
Tính năng liên quan	Include: Hiển thị danh sách phòng ban
Điều kiện kích hoạt	Nút chi tiết phòng ban
Tiền điều kiện	Có quyền sử dụng chức năng hiển thị Đã đăng nhập vào hệ thống.
Hậu điều kiện	Thông tin chi tiết của phòng ban được chọn để xem hiển thị đầy đủ
Luồng chính	B1. Tại danh sách phòng ban
B2. Chọn phòng ban muốn xem chi tiết
B3. Nhấn vào nút hành động và chọn chi tiết
B4. Hệ thống hiển thị thông tin chi tiết phòng ban B3. Kết thúc luồng

**Đối tượng:** CS Admin/ Operation Admin/ Super Admin/ Admin
BR_01: Khi thêm agent trong lúc khởi tạo, chỉ được phép thêm agent đang không có trong phòng ban liên quan.
BR_02: Tên phòng ban không được phép trùng (lowercase giá trị rồi mới so sánh)
BR_03: Trạng thái phòng ban mặc định khi khởi tạo là “ACTIVE”

- CS Admin có thể tạo, cập nhật và xem danh sách/chi tiết phòng ban
- Thông tin: Tên phòng ban, mô tả, trưởng phòng, danh sách agents thành viên
- Quy tắc nghiệp vụ: Tên phòng ban không trùng; Một agent không thuộc nhiều phòng ban

#### 4.4.2. Quản lý Agents
- CS Admin và CS Lead có thể xem danh sách nhân viên
- Phân quyền: CS Admin xem tất cả agents trong công ty; CS Lead chỉ xem agents trong department của mình
Tên tính năng	Hiển thị danh sách agents
Mô tả	Tính năng cho phép hiển thị danh sách agents dưới dạng bảng nhằm phục vụ cho mục đích quản lý nhân viên trên hệ thống
Đối tượng	CS Admin, CS Lead
Tính năng liên quan	
Điều kiện kích hoạt	Nút “Danh sách nhân viên”
Tiền điều kiện	Có quyền với chức năng hiển thị danh sách agents. Agents này được cấp quyền sử dụng CSM trên hệ thống.
Đăng nhập vào hệ thống
Hậu điều kiện	CS Admin: Thành công hiển thị danh sách agents thuộc công ty đó
CS Lead: Thành công hiển thị danh sách agents thuộc department của agent đó.
Luồng chính	B1. Tại thanh điều hướng tab cơ cấu tổ chức, nhấn nút quản lý nhân viên
B2. Hệ thống hiển thị danh sách nhân viên tuỳ thuộc vào phân quyền của nhân viên đó là Lead hay Admin B3. Kết thúc luồng

Tên tính năng	Hiển thị chi tiết nhân viên
Mô tả	Nhằm xem và quản lý được thông tin cơ bản của nhân viên đó.

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
