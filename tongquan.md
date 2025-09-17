# Tổng quan Dự án: Module Chăm sóc Khách hàng (CSM) của AthenaFS

## 1. Mục tiêu và Bối cảnh

[cite_start]Dự án này tập trung vào việc phát triển một Module Chăm sóc Khách hàng (CSM) toàn diện cho Công ty TNHH Giải Pháp Công Nghệ AthenaFS[cite: 21, 54, 93]. [cite_start]Mục tiêu chính là số hóa và tối ưu hóa quy trình của phòng Chăm sóc Khách hàng (CSKH)[cite: 74, 82].

### Mục tiêu Cốt lõi:
* [cite_start]**Nâng cấp lên Contact Center:** Chuyển đổi từ Call Center hiện tại thành một Contact Center đa kênh bằng cách tích hợp các kênh giao tiếp như Email, Chat, SMS, Tổng đài (IVR Inbound), Facebook, Zalo, và các kênh khác[cite: 76, 77, 79, 80].
* [cite_start]**Số hóa Quy trình CSKH:** Xây dựng các tính năng để quản lý phiếu yêu cầu (ticket) một cách hiệu quả[cite: 82]. [cite_start]Điều này bao gồm việc tạo, theo dõi, phân loại, và luân chuyển ticket giữa các phòng ban liên quan[cite: 75, 83, 85].
* [cite_start]**Đảm bảo Chất lượng Dịch vụ:** Thiết lập và giám sát các Cam kết Mức độ Dịch vụ (SLA) để đảm bảo thời gian phản hồi và xử lý yêu cầu của khách hàng[cite: 84].

### Phạm vi Thực hiện:
* [cite_start]Tích hợp và quản lý đa kênh giao tiếp để hình thành Contact Center[cite: 79].
* Phát triển các tính năng CSM bao gồm:
    * [cite_start]Khởi tạo và theo dõi ticket[cite: 82, 83].
    * [cite_start]Phân loại ticket theo loại yêu cầu và mức độ ưu tiên[cite: 83].
    * [cite_start]Thiết lập, giám sát và thực thi SLA[cite: 84].
    * [cite_start]Phân quyền xử lý ticket theo từng phòng ban[cite: 85].

## 2. Các Vai trò Người dùng (Actors)

Hệ thống có các vai trò người dùng được xác định rõ ràng với các cấp độ quyền hạn khác nhau:

* [cite_start]**Super Admin:** Là người có quyền hạn cao nhất trên toàn bộ hệ thống[cite: 89]. [cite_start]Có thể xem toàn bộ thông tin, báo cáo từ tất cả các công ty khách hàng (tenants) trên hệ thống[cite: 90].
* [cite_start]**CS Admin:** Là quản trị viên cao nhất của một công ty cụ thể[cite: 131]. [cite_start]Chịu trách nhiệm quản lý tất cả các phòng ban, nhân viên, cấu hình các kênh tương tác và gán agents vào các kênh đó[cite: 131, 132, 133].
* [cite_start]**CS Agent:** Là nhân viên tác nghiệp chính trên hệ thống[cite: 134]. [cite_start]Mỗi agent thuộc một phòng ban và có vai trò cụ thể trong phòng ban đó[cite: 134, 135].
* [cite_start]**CS Operation:** Đội ngũ giám sát và vận hành hệ thống[cite: 136]. [cite_start]Quản lý các vấn đề như cước gọi và cung cấp hỗ trợ cấp 1 (LV1) cho khách hàng[cite: 136, 137].

## 3. Cấu trúc Tổ chức và Luồng Phân quyền

Hệ thống được thiết kế để hỗ trợ cấu trúc đa công ty (multi-tenant), trong đó mỗi công ty có cơ cấu tổ chức riêng.

### Cấu trúc Tổ chức:
[cite_start]Mỗi công ty có một cấu trúc phân cấp rõ ràng[cite: 163]:
1.  **Company:** Tổ chức cao nhất.
2.  **Department:** Các phòng ban trực thuộc công ty.
3.  **Team:** Các đội nhóm trong một phòng ban.
4.  **Team Lead & Agents:** Trưởng nhóm và các nhân viên trong một đội.

### Quy trình Phân quyền và Thiết lập Ban đầu:
1.  [cite_start]**Khởi tạo Công ty:** Hệ thống Athena tạo một hồ sơ công ty (Company Profile) mới cho khách hàng[cite: 100, 102, 103].
2.  [cite_start]**Setup Cấu hình:** Thực hiện cài đặt các biến nghiệp vụ như Action Code, trạng thái hợp đồng[cite: 105, 106].
3.  [cite_start]**Tạo Tài khoản Vận hành:** Hệ thống tạo tài khoản Operation Account cho đội ngũ nội bộ Athena để quản trị ban đầu[cite: 107, 110, 111].
4.  [cite_start]**Tạo Tài khoản Agent:** Đội vận hành tạo tài khoản Agent cho khách hàng dựa trên yêu cầu và gán quyền hạn theo vai trò (Role/Permission)[cite: 115, 118, 120].
5.  [cite_start]**Bàn giao:** Tài khoản được bàn giao cho khách hàng[cite: 122, 124].
6.  [cite_start]**Khách hàng Tự cấu hình:** CS Admin phía khách hàng tiếp tục thiết lập chi tiết cơ cấu tổ chức của họ trên hệ thống, bao gồm[cite: 141, 142]:
    * [cite_start]Tạo phòng ban (Department) và chỉ định trưởng phòng (Head of Department)[cite: 144, 146].
    * [cite_start]Thêm Agents vào các phòng ban tương ứng[cite: 148].
    * [cite_start]Khởi tạo các đội (Team) và gán khung giờ làm việc[cite: 150, 152, 154].
    * [cite_start]Phân quyền xem báo cáo cho Agents[cite: 156, 158].

## 4. Đặc tả Chức năng Chi tiết

### 4.1. Quản lý Ticket

Đây là chức năng cốt lõi của hệ thống, bao gồm việc tạo và quản lý các yêu cầu từ khách hàng.

#### **4.1.1. Khởi tạo Ticket Thủ công**
* [cite_start]**Mô tả:** Cho phép CS Admin và CS Agent tạo ticket một cách thủ công để ghi nhận yêu cầu của khách hàng[cite: 203, 204, 205].
* [cite_start]**Luồng chính:** Agent nhấn nút "Khởi tạo" -> Hệ thống hiển thị form -> Agent nhập thông tin ticket -> Agent nhấn "Lưu" -> Hệ thống tạo ticket[cite: 219, 220, 221, 222].
* **Thông tin cần nhập:**
    * [cite_start]Tên ticket, Phân loại (Inquiry, Complaint, Request), Mức độ ưu tiên[cite: 247, 248, 249].
    * [cite_start]Thông tin khách hàng (SĐT, Họ tên, CCCD, Địa chỉ)[cite: 253, 254, 257, 258, 259]. [cite_start]Nếu SĐT đã tồn tại, hệ thống sẽ gợi ý thông tin khách hàng[cite: 254].
    * [cite_start]Nội dung yêu cầu và tài liệu đính kèm (tùy chọn)[cite: 260, 261].
* **Quy tắc nghiệp vụ (Business Rules):**
    * [cite_start]`BR_01`: Trạng thái ban đầu của ticket là "Chờ kiểm duyệt"[cite: 227].
    * [cite_start]`BR_02`: ID ticket có định dạng: `[Nguồn tạo ticket] + 6 chữ số tự động tăng` (Ví dụ: `[FB Mess] 000001`)[cite: 235, 236, 237].
    * [cite_start]`BR_03`: Nếu là khách hàng mới, hệ thống sẽ tự động tạo mã khách hàng (CIF) và lưu thông tin vào cơ sở dữ liệu[cite: 239, 241, 242].

#### **4.1.2. Khởi tạo Ticket Tự động**
Hệ thống có khả năng tự động tạo ticket từ các kênh tương tác khác nhau.

* **Từ Kênh Chat (Facebook, Zalo, Direct Chat):**
    * [cite_start]**Kích hoạt:** Khi khách hàng gửi tin nhắn mới và cuộc hội thoại trước đó đang ở trạng thái "resolved"[cite: 279, 281, 324, 325].
    * **Quy tắc nghiệp vụ:**
        * [cite_start]Ticket mặc định được chuyển về phòng CSKH[cite: 299, 300].
        * [cite_start]Tên ticket có định dạng: `{yyyyMMddHHmmss} - Tin nhắn từ {tên kênh}`[cite: 301, 302].
        * [cite_start]Đối với Direct Chat từ website, ticket chỉ được tạo nếu hệ thống có thu thập thông tin khách hàng trước khi chat[cite: 328, 329, 330].
    * [cite_start]**Yêu cầu phi chức năng:** Hệ thống phải có khả năng khởi tạo thành công 100 tickets tự động tại cùng một thời điểm[cite: 335].

* **Từ Cuộc gọi Inbound (Tổng đài):**
    * [cite_start]**Kích hoạt:** Khi có một cuộc gọi đến số hotline của công ty[cite: 362].
    * [cite_start]**Luồng chính:** Khách hàng gọi -> Hệ thống tự động tạo ticket -> Hệ thống phân loại ticket dựa trên hành vi của khách hàng (phím bấm IVR hoặc intent của Voicebot)[cite: 370, 371, 372, 373].
    * **Quy tắc nghiệp vụ:**
        * [cite_start]Tên ticket có định dạng bao gồm thời gian, số hotline và thông tin khách hàng (nếu xác định được)[cite: 382, 383, 387].
        * [cite_start]Nội dung ticket đính kèm file ghi âm cuộc gọi[cite: 407].
        * [cite_start]Khi cuộc gọi được chuyển đến agent, thông tin ticket sẽ tự động hiển thị trên màn hình của agent[cite: 414, 415].
    * [cite_start]**Yêu cầu phi chức năng:** Khởi tạo 100 tickets đồng thời; ticket phải được tạo trong vòng 5 giây sau khi cuộc gọi kết thúc[cite: 418, 420, 421].

#### **4.1.3. Danh sách và Chi tiết Ticket**
* **Hiển thị Danh sách:**
    * [cite_start]Người dùng có thể xem danh sách tất cả các ticket[cite: 431].
    * **Phân quyền hiển thị:**
        * [cite_start]Super Admin: Thấy ticket của tất cả công ty[cite: 480].
        * [cite_start]CS Admin/CS Agents: Thấy toàn bộ ticket trong công ty của họ[cite: 463].
        * [cite_start]Department Lead/Agents: Chỉ thấy các ticket được gán cho phòng ban của họ[cite: 464].
    * [cite_start]**Chức năng:** Tìm kiếm theo ID/tên ticket [cite: 468][cite_start], bộ lọc "live" theo trạng thái, phòng ban, mức độ ưu tiên, kênh, và ngày tạo[cite: 471, 501, 502, 503, 504, 506, 507].
    * [cite_start]**Yêu cầu phi chức năng:** Tốc độ truy vấn cho bộ lọc và tìm kiếm không quá 10 giây[cite: 473].
* **Hiển thị Chi tiết:**
    * [cite_start]Cho phép xem đầy đủ thông tin của một ticket, bao gồm thông tin phiếu, thông tin khách hàng, lịch sử tương tác, và khu vực thảo luận nội bộ giữa các agent[cite: 657, 658, 687, 702, 708, 711].

#### **4.1.4. Cập nhật Trạng thái Ticket**
* [cite_start]**Cập nhật Thủ công:** Agent đang phụ trách (PIC) ticket có thể thay đổi trạng thái của nó[cite: 522, 535, 541].
* **Cập nhật Tự động:**
    * [cite_start]**Vi phạm SLA:** Hệ thống tự động cập nhật trạng thái (ví dụ: `SLA_ROV` - Quá SLA tiếp nhận, `SLA_POV` - Quá SLA xử lý) và nâng mức độ ưu tiên khi ticket vi phạm SLA[cite: 559, 563, 565, 567, 634, 639].
    * [cite_start]**Ticket quá hạn:** Ticket chưa được xử lý sau 10 ngày sẽ tự động chuyển sang trạng thái "Đã Hủy" (`CANCELLED`)[cite: 573, 576, 581, 583, 647].
* **Các Trạng thái Chính:**
    * [cite_start]`WAIT`: Chờ tiếp nhận[cite: 608, 607].
    * [cite_start]`PROCESS`: Đang xử lý[cite: 616, 617].
    * [cite_start]`CLOSED`: Phiếu đóng[cite: 620, 619].
    * [cite_start]`DONE`: Hoàn thành[cite: 624, 623].
    * [cite_start]`CANCELLED`: Đã hủy[cite: 645, 644].
* [cite_start]**Quy tắc nghiệp vụ:** Các ticket ở trạng thái `CLOSED`, `DONE`, `CANCELLED` phải được "Reopen" trước khi có thể chuyển sang trạng thái khác[cite: 598, 599].

### 4.2. Quản lý SLA

* **Khởi tạo SLA:**
    * [cite_start]**Đối tượng:** Chỉ CS Admin mới có quyền tạo SLA[cite: 731, 756].
    * [cite_start]**Thông tin cấu hình:** Tên SLA, Loại ticket, Mức độ ưu tiên, Thời gian phản hồi, Thời gian xử lý, và có áp dụng Giờ hành chính hay không[cite: 814, 815, 816, 817, 818, 820].
    * [cite_start]**Quy tắc nghiệp vụ:** Tên SLA không được trùng trong cùng một công ty[cite: 758]. [cite_start]Không được tạo các quy tắc SLA trùng lặp (cùng loại ticket và mức độ ưu tiên)[cite: 764].
* **Theo dõi (Track) SLA:**
    * [cite_start]**Đối tượng:** Hệ thống[cite: 801].
    * [cite_start]**Luồng hoạt động:** Hệ thống bắt đầu đếm giờ ngay khi ticket được tạo[cite: 825]. [cite_start]Hệ thống ghi nhận thời gian phản hồi đầu tiên (FRT) khi agent tiếp nhận và thời gian xử lý (RT) khi agent hoàn thành ticket[cite: 826, 827, 828].
    * [cite_start]**Yêu cầu phi chức năng:** Đồng hồ đếm ngược của SLA phải được cập nhật gần thời gian thực (độ trễ ≤ 1 phút)[cite: 779, 833].

### 4.3. Quản lý Kênh (Channel)

* **Thêm Kênh mới (Chat & Email):**
    * [cite_start]**Đối tượng:** CS Admin[cite: 951, 1012].
    * [cite_start]**Luồng chính:** Chọn loại kênh (Facebook, Zalo, Email,...) -> Cung cấp thông tin cấu hình (ví dụ: app password cho Gmail) -> Hệ thống kiểm tra và kết nối -> Gán agents được phép tác nghiệp trên kênh[cite: 963, 965, 969, 1033, 1062, 1066].
    * [cite_start]**Quy tắc nghiệp vụ:** Không được thêm các kênh trùng lặp trong cùng một công ty[cite: 987, 1048].
    * [cite_start]**Yêu cầu phi chức năng (Bảo mật):** Thông tin cấu hình kênh phải được mã hóa khi lưu trong cơ sở dữ liệu[cite: 989, 1050].
* **Tác nghiệp trên Kênh Email:**
    * [cite_start]**Hiển thị Hộp thư:** Agents được gán quyền có thể xem hộp thư đến, đi, spam,... tương tự như một trình duyệt email thông thường[cite: 1074, 1075, 1093].
    * [cite_start]**Soạn Email:** Agents có thể soạn và gửi email trực tiếp từ hệ thống, sử dụng một trình soạn thảo rich-text[cite: 1149, 1150, 1200].

### 4.4. Quản lý Tổ chức (Phòng ban & Agents)

* **Quản lý Phòng ban (Department):**
    * [cite_start]**Đối tượng:** CS Admin[cite: 1278].
    * [cite_start]**Chức năng:** Tạo, cập nhật, và xem danh sách/chi tiết các phòng ban[cite: 1267, 1315, 1361, 1402].
    * [cite_start]**Thông tin:** Tên phòng ban, mô tả, trưởng phòng, và danh sách agents thành viên[cite: 1338, 1339, 1340, 1341].
    * [cite_start]**Quy tắc nghiệp vụ:** Tên phòng ban không được trùng trong một công ty[cite: 1297]. [cite_start]Một agent không thể thuộc nhiều phòng ban khác nhau[cite: 1300, 1301].
* **Quản lý Agents:**
    * [cite_start]**Đối tượng:** CS Admin, CS Lead (Trưởng phòng/nhóm)[cite: 1448].
    * [cite_start]**Chức năng:** Hiển thị danh sách nhân viên[cite: 1444].
    * [cite_start]**Phân quyền:** CS Admin xem được tất cả agents trong công ty, trong khi CS Lead chỉ xem được agents trong department của mình[cite: 1458, 1460].