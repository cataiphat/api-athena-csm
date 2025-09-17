## Mục lục
- [**Quản lý phiên bản** ](#qun-l-phin-bn)
- [**MỤC LỤC** ](#mc-lc)
- [**Table of Contents** ](#table-of-contents)
- [**2. Các chức năng hệ thống** ](#2-cc-chc-nng-h-thng)
- [**3. Quy trình nghiệp vụ** ](#3-quy-trnh-nghip-v)
- [**2. Quản lý ticket** ](#2-qun-l-ticket)
- [**2.1. Khởi tạo ticket thủ công** ](#21-khi-to-ticket-th-cng)
- [**2.2. Khởi tạo ticket tự động tại kênh chat** ](#22-khi-to-ticket-t-ng-ti-knh-chat)
- [**2.3. Khởi tạo ticket tự động inbound call** ](#23-khi-to-ticket-t-ng-inbound-call)
- [**2.4. Danh sách tickets** ](#24-danh-sch-tickets)
- [**2.5. Update ticket status** ](#25-update-ticket-status)
- [**3. Quản lý SLA** ](#3-qun-l-sla)
- [**3.1. Khởi tạo SLA** ](#31-khi-to-sla)
- [**3.2. Track SLA** ](#32-track-sla)
- [**4.1. Khởi tạo Department** ](#41-khi-to-department)
- [**4.2. Cập nhật department** ](#42-cp-nht-department)
- [**5.1. Thêm mới Chat channel** ](#51-thm-mi-chat-channel)
- [**5.2. Thêm mới Email channel** ](#52-thm-mi-email-channel)
- [**5.4. Soạn email** ](#54-son-email)
- [**Hình ảnh wireframe (Hình số 3):** ](#hnh-nh-wireframe-hnh-s-3)
- [**5.5. Cấu hình cho mỗi kênh** ](#55-cu-hnh-cho-mi-knh)
- [**6.1. Tạo phòng ban mới** ](#61-to-phng-ban-mi)
- [**6.2. Cập nhật phòng ban** ](#62-cp-nht-phng-ban)
- [**7.2. Hiển thị chi tiết nhân viên** ](#72-hin-th-chi-tit-nhn-vin)

![](media/image1.png){width="5.395833333333333in"
height="3.5208333333333335in"}![](media/image2.png){width="7.489582239720035in"
height="8.249998906386702in"}

![](media/image3.png){width="0.7291655730533684in"
height="0.46874890638670164in"}

> FSD - CSM Module

# **Quản lý phiên bản** 

![](media/image3.png){width="0.7291655730533684in"
height="0.46874890638670164in"}

> FSD - CSM Module

# **MỤC LỤC** 

# **Table of Contents** 

![](media/image3.png){width="0.7291655730533684in"
height="0.46874890638670164in"}

> FSD - CSM Module

![](media/image3.png){width="0.7291655730533684in"
height="0.46874890638670164in"}

> FSD - CSM Module
>
> lượng tenants (Công ty), Số lượng Department trong công ty, Số lượng
> HĐ trong từng
>
> công ty.
>
> [CS Admin:]{.underline} Là người có quyền hạn cao nhất của 1 công ty
> trên hệ thống, quản lý tất cả
>
> phòng ban phía dưới và nhân viên của họ, có khả năng thêm các kênh
> tương tác và assign
>
> agents vào kênh.
>
> [CS Agent:]{.underline} Là những agents đang thực hiện tác nghiệp trên
> hệ thống, mỗi agent sẽ được
>
> thêm vô phòng ban liên quan và có vai trò riêng trong phòng ban đó
>
> [CS Operation:]{.underline} Là actors giám sát hệ thống, quản lý cước
> gọi cũng như hỗ trợ vận hành
>
> LV1 cho khách hàng.

# **2. Các chức năng hệ thống** 

# **3. Quy trình nghiệp vụ** 

![](media/image3.png){width="0.7291655730533684in"
height="0.46874890638670164in"}![](media/image4.png){width="4.375in"
height="4.604166666666667in"}

> FSD - CSM Module

![](media/image3.png){width="0.7291655730533684in" height="0.46875in"}

> FSD - CSM Module

![](media/image3.png){width="0.7291655730533684in"
height="0.46875in"}![](media/image5.jpg){width="5.833333333333333in"
height="6.281248906386701in"}

> FSD - CSM Module

# **2. Quản lý ticket** 

# **2.1. Khởi tạo ticket thủ công** 

> *➢* Activity Diagram/Sequence Diagram
>
> 8
>
> *Văn bản này thuộc sở hữu của Công ty TNHH Giải Pháp Công Nghệ
> AthenaFS, nghiêm cấm sao chép dưới*
>
> *mọi hình thức.*

![](media/image3.png){width="0.7291655730533684in" height="0.46875in"}

> FSD - CSM Module
>
> *➢* Mô tả tính năng

![](media/image3.png){width="0.7291655730533684in" height="0.46875in"}

> FSD - CSM Module
>
> BR_02: ID ticket khởi tạo theo quy tắc: \[Nguồn tạo
>
> ticket\] 6 digits auto increment.
>
> VD: \[FB Mess\] 000001; \[Inbound Voicebot\] 0000001;
>
> \[ZNS\] 000001\...
>
> BR_03: Trường hợp thông tin khách hàng mới hoàn
>
> toàn (chưa có trong hệ thống). Agent cần phải nhập đủ
>
> các trường thông tin khách hàng. Hệ thống sẽ tự khởi
>
> tạo CIF và lưu thông tin KH vào DB sau khi ticket tạo
>
> xong
>
> Yêu cầu phi chức năng
>
> *➢* Mô tả màn hình
>
> Nhập thông tin ticket:
>
> ● Tên ticket
>
> ● Phân loại (Inquiry, Complaint, Request)
>
> ● Mức độ ưu tiên
>
> ● Sau khi chọn Phân Loại và Mức độ ưu tiên, SLA tương ứng sẽ được hiện
>
> ra và cho phép áp dụng hay không áp dụng SLA này
>
> Nhập thông tin đầu vào:
>
> ● Thông tin khách hàng
>
> ○ Nhập SĐT =\> Dropdown xổ ra nếu KH với SĐT đó đã được lưu
>
> trên hệ thống. Nếu không có hiện các trường tương ứng phía dưới
>
> cho người tạo phiếu cung cấp thêm
>
> ○ Họ và tên
>
> ○ CCCD
>
> ○ Địa chỉ
>
> ● Nội dung yêu cầu
>
> ● Tài liệu đính kèm (Optional)
>
> 10
>
> *Văn bản này thuộc sở hữu của Công ty TNHH Giải Pháp Công Nghệ
> AthenaFS, nghiêm cấm sao chép dưới*
>
> *mọi hình thức.*

![](media/image3.png){width="0.7291655730533684in"
height="0.46875in"}![](media/image6.jpg){width="5.520833333333333in"
height="3.7291655730533684in"}

> FSD - CSM Module

# **2.2. Khởi tạo ticket tự động tại kênh chat** 

> *➢* Activity Diagram/Sequence Diagram
>
> *➢* Mô tả tính năng

![](media/image3.png){width="0.7291655730533684in" height="0.46875in"}

> FSD - CSM Module
>
> 2/ Kênh chat người dùng nhắn tới đã được cấu hình
>
> vào hệ thống

![](media/image3.png){width="0.7291655730533684in" height="0.46875in"}

> FSD - CSM Module
>
> ● Tin nhắn mới từ KH khi hộp thoại đang ở
>
> trạng thái resolved. Sau khi tạo thành công,
>
> trạng thái hộp thoại tự động chuyển thành
>
> opened
>
> ● Đối với direct chat (từ website) chỉ bắt đầu
>
> khởi tạo ticket nếu như kênh chat từ website
>
> có thu thập thông tin KH. Ví dụ:
>
> ○ B1: Trước khi nhắn tin, KH nhập thông
>
> tin liên hệ
>
> ○ B2: Nhập lời nhắn
>
> ○ B3: Gửi
>
> Yêu cầu phi chức năng NF_01: Khả năng khởi tạo thành công 100 tickets
> tự
>
> động cùng 1 thời điểm.
>
> *➢* Mô tả màn hình
>
> 13
>
> *Văn bản này thuộc sở hữu của Công ty TNHH Giải Pháp Công Nghệ
> AthenaFS, nghiêm cấm sao chép dưới*
>
> *mọi hình thức.*

![](media/image3.png){width="0.7291655730533684in"
height="0.46875in"}![](media/image7.jpg){width="5.229166666666667in"
height="4.760415573053368in"}

> FSD - CSM Module

# **2.3. Khởi tạo ticket tự động inbound call** 

> *➢* Activity Diagram/Sequence Diagram
>
> *➢* Mô tả tính năng

![](media/image3.png){width="0.7291655730533684in" height="0.46875in"}

> FSD - CSM Module

![](media/image3.png){width="0.7291655730533684in" height="0.46875in"}

> FSD - CSM Module
>
> BR_03: Nội dung phiếu:
>
> ● Thông tin phiếu:
>
> ○ Tên: BR_02
>
> ○ Ngày tạo: HH:mm:ss dd-MM-yyyy
>
> ○ Phân Loại: Mặc định để trống
>
> ○ SLA
>
> ○ Thông tin KH: SĐT liên hệ tới; Thông
>
> tin KH (Nếu xác định được từ SĐT)
>
> ● Thông tin đầu vào:
>
> ○ File đính kèm: Script ghi âm cuộc gọi
>
> ○ Nội dung yêu cầu:
>
> ■ Voicebot đính kèm script cuộc
>
> gọi
>
> ■ IVR: Nội dung tương ứng với
>
> phím bấm của KH
>
> BR_04: Đối với IVR, khi KH bấm phím chuyển
>
> hướng về agent và agent nghe máy. Giao diện agents
>
> hiển thị thông tin phiếu hiện tại nhằm hỗ trợ tác
>
> nghiệp cho agents. Phiếu tự động đánh trạng thái đang
>
> xử lý khi 1 trong 2 kết thúc cuộc gọi.
>
> Yêu cầu phi chức năng NF_01: Khả năng khởi tạo thành công 100 tickets
> tự
>
> động cùng 1 thời điểm.
>
> NF_02: Đối với các cuộc Inbound, ticket tạo thành
>
> công trễ nhất là 5s sau kết thúc nghiệp vụ.
>
> *➢* Mô tả màn hình

# **2.4. Danh sách tickets** 

> *➢* Activity Diagram/Sequence Diagram
>
> 16

![](media/image3.png){width="0.7291655730533684in"
height="0.46874890638670164in"}![](media/image8.jpg){width="5.604166666666667in"
height="3.5416655730533684in"}

> FSD - CSM Module
>
> *➢* Mô tả tính năng

![](media/image3.png){width="0.7291655730533684in"
height="0.46874890638670164in"}

> FSD - CSM Module
>
> agents đó.
>
> Super Admin: Hiện danh sách của tất cả công ty.

![](media/image3.png){width="0.7291655730533684in"
height="0.46874890638670164in"}

> FSD - CSM Module
>
> *➢* Mô tả màn hình
>
> ● Bảng danh sách
>
> ○ Mặc định hiện 10 items/page. Cho phép điều chỉnh 15, 20, 25, 30
>
> items/page
>
> ○ Các trường trong bảng:
>
> ○ Ticket Id
>
> ○ Tên Ticket (Cho phép sort A-Z; Z-A)
>
> ○ Trạng thái
>
> ○ Phân loại
>
> ○ Kênh
>
> ○ Phòng ban thực hiện
>
> ○ Người thực hiện
>
> ○ Mức độ (Cho phép sort: Ưu tiên-Thấp; Thấp-Ưu tiên)
>
> ○ Ngày tạo
>
> ○ Ngày cập nhật
>
> ● Thanh search: Search theo tên ticket hoặc id (Placeholder:" Nhập tên
>
> phiếu hoặc id")
>
> ● Bộ lọc:
>
> ○ Chọn 1 hoặc nhiều trạng thái
>
> ○ Chọn 1 hoặc nhiều phòng ban
>
> ○ Chọn 1 hoặc nhiều mức độ
>
> ○ Chọn 1 hoặc nhiều mức độ
>
> ○ Chọn 1 hoặc nhiều kênh
>
> ○ Double datepicker cho ngày tạo (Maximum range: 60 ngày)
>
> ○ Skeleton Loading: Khi đang thực hiện truy vấn
>
> ○ Icon không có giá trị: Khi truy vấn không có kết quả
>
> 19

![](media/image3.png){width="0.7291655730533684in"
height="0.46874890638670164in"}![](media/image9.jpg){width="5.895833333333333in"
height="6.624998906386701in"}

> FSD - CSM Module

# **2.5. Update ticket status** 

> *➢* Activity Diagram/Sequence Diagram
>
> 20

![](media/image3.png){width="0.7291655730533684in"
height="0.46874890638670164in"}

> FSD - CSM Module
>
> *➢* Mô tả tính năng

![](media/image3.png){width="0.7291655730533684in"
height="0.46874890638670164in"}

> FSD - CSM Module
>
> ○ Tiền điều kiện mới:
>
> ■ Ticket có gắn SLA
>
> ■ Đăng nhập vào hệ thống
>
> ■ Trigger mới: Khi các điều kiện
>
> từ SLA không thỏa mãn
>
> ■ Người thực hiện: Hệ thống
>
> ○ Process:
>
> ■ B1: Hệ thống track quá thời hạn
>
> SLA
>
> ■ B2: Hệ thống tự cập nhật trạng
>
> thái tương ứng với SLA đó, cập
>
> nhật mức độ thành "Ưu tiên"
>
> ■ B3: Hệ thống gửi thông báo cho
>
> account đó
>
> ■ B4: Kết thúc luồng
>
> ● Sub-process 2:
>
> ○ Tiền điều kiện mới:
>
> ■ Ticket chưa xử lý đã quá 10
>
> ngày
>
> ■ Đăng nhập vào hệ thống
>
> ■ Trigger mới: Ticket chưa xử lý
>
> quá 10 ngày
>
> ■ Người thực hiện: Hệ thống
>
> ○ Process:
>
> ■ B1: Hệ thống track được ticket
>
> đã quá 10 ngày xử lý
>
> ■ B2: Hệ thống cập nhật trạng
>
> thái thành "Đã Hủy"
>
> ■ B3: Hệ thống gửi thông báo cho
>
> 22

![](media/image3.png){width="0.7291655730533684in"
height="0.46874890638670164in"}

> FSD - CSM Module
>
> account đó
>
> ○ B4: Kết thúc luồng
>
> Luồng thất bại

![](media/image3.png){width="0.7291655730533684in"
height="0.46874890638670164in"}![](media/image10.jpg){width="5.041665573053368in"
height="3.302082239720035in"}

> FSD - CSM Module

![](media/image3.png){width="0.7291655730533684in"
height="0.46874890638670164in"}

> FSD - CSM Module

![](media/image3.png){width="0.7291655730533684in"
height="0.46874890638670164in"}

> FSD - CSM Module
>
> ● Thông tin khách hàng:
>
> ○ Tên khách hàng
>
> ○ SĐT
>
> ○ Email
>
> ○ Địa chỉ
>
> ● Thông tin đầu vào
>
> ● Lịch sử của phiếu
>
> ○ Danh sách lịch sử tương tác của phiếu (Trạng thái, thảo luận, cập
>
> nhật nội dung, cập nhật người phụ trách)
>
> ● Thảo luận
>
> ○ Người bình luận: Nội dung bình luận
>
> 26

![](media/image3.png){width="0.7291655730533684in"
height="0.46874890638670164in"}![](media/image11.jpg){width="5.895833333333333in"
height="6.020832239720035in"}

> FSD - CSM Module

# **3. Quản lý SLA** 

# **3.1. Khởi tạo SLA** 

> *➢* Activity Diagram/Sequence Diagram
>
> 27

![](media/image3.png){width="0.7291655730533684in"
height="0.46874890638670164in"}

> FSD - CSM Module
>
> *➢* Mô tả tính năng

![](media/image3.png){width="0.7291655730533684in"
height="0.46874890638670164in"}

> FSD - CSM Module

![](media/image3.png){width="0.7291655730533684in"
height="0.46874890638670164in"}

> FSD - CSM Module
>
> ● Tên SLA
>
> ● Loại ticket (Inquiry, Complaint, Request)
>
> ● Mức độ ưu tiên (Thấp, Trung Bình, Cao, Ưu Tiên)
>
> ● Thời gian phản hồi (hh:mm:ss)
>
> ● Thời gian xử lý (hh:mm:ss)
>
> ● Ghi chú
>
> ● Giờ hành chính (True; False)

# **3.2. Track SLA** 

> *➢* Activity Diagram/Sequence Diagram
>
> *➢* Mô tả tính năng

![](media/image3.png){width="0.7291655730533684in"
height="0.46874890638670164in"}

> FSD - CSM Module

![](media/image3.png){width="0.7291655730533684in"
height="0.46874890638670164in"}![](media/image12.jpg){width="5.843748906386701in"
height="5.760416666666667in"}

> FSD - CSM Module
>
> *➢* Mô tả màn hình
>
> **4. Quản lý Department**

# **4.1. Khởi tạo Department** 

> *➢* Activity Diagram/Sequence Diagram
>
> *➢* Mô tả tính năng

![](media/image3.png){width="0.7291655730533684in"
height="0.46874890638670164in"}

> FSD - CSM Module
>
> mới phòng ban trong hệ thống, phục vụ cho việc tổ
>
> chức và phân loại nhân sự, phân quyền và quản lý
>
> công việc theo cơ cấu tổ chức.

![](media/image3.png){width="0.7291655730533684in"
height="0.46874890638670164in"}

> FSD - CSM Module
>
> BR_03: Trạng thái phòng ban mặc định khi khởi tạo
>
> là "ACTIVE"
>
> Yêu cầu phi chức năng
>
> *➢* Mô tả màn hình
>
> ● Modal để khởi tạo:
>
> ○ Tên phòng ban (required)
>
> ○ Mô tả (optional)
>
> ○ Dropdown chọn 1: Người phụ trách (required)
>
> ○ Dropdown chọn nhiều: Thêm agents (optional)
>
> ● Các trường cần lưu trên DB:
>
> ○ department_id
>
> ○ dept_name
>
> ○ dept_desc
>
> ○ dept_lead: user_id
>
> ○ dept_status
>
> ○ created_at
>
> ○ updated_at

# **4.2. Cập nhật department** 

> *➢* Activity Diagram/Sequence Diagram
>
> *➢* Mô tả tính năng

![](media/image3.png){width="0.7291655730533684in"
height="0.46874890638670164in"}

> FSD - CSM Module

![](media/image3.png){width="0.7291655730533684in"
height="0.46874890638670164in"}![](media/image13.jpg){width="5.03125in"
height="7.156248906386701in"}

> FSD - CSM Module
>
> *➢* Mô tả màn hình
>
> **5. Channel**

# **5.1. Thêm mới Chat channel** 

> *➢* Activity Diagram/Sequence Diagram
>
> 36

![](media/image3.png){width="0.7291655730533684in"
height="0.46874890638670164in"}

> FSD - CSM Module
>
> *➢* Mô tả tính năng

![](media/image3.png){width="0.7291655730533684in"
height="0.46874890638670164in"}

> FSD - CSM Module
>
> Luồng thay thế

![](media/image3.png){width="0.7291655730533684in"
height="0.46874890638670164in"}![](media/image14.jpg){width="5.458332239720035in"
height="7.656248906386701in"}

> FSD - CSM Module
>
> *➢* Mô tả màn hình

# **5.2. Thêm mới Email channel** 

> *➢* Activity Diagram/Sequence Diagram
>
> 39

![](media/image3.png){width="0.7291655730533684in"
height="0.46874890638670164in"}

> FSD - CSM Module
>
> *➢* Mô tả tính năng

![](media/image3.png){width="0.7291655730533684in"
height="0.46874890638670164in"}

> FSD - CSM Module
>
> B2: Kết nối tới kênh đó bằng cách cung cấp các thông
>
> tin cấu hình đã chuẩn bị
>
> B3: Hệ thống thực hiện bước kiểm tra và thông báo
>
> kết quả
>
> B4: Chọn các agents được phép tham gia vào kênh để
>
> tác nghiệp
>
> B5: Nhấn nút hoàn tất
>
> B6: Kết thúc luồng
>
> Luồng thay thế

![](media/image3.png){width="0.7291655730533684in"
height="0.46874890638670164in"}

> FSD - CSM Module

![](media/image3.png){width="0.7291655730533684in"
height="0.46874890638670164in"}

> FSD - CSM Module
>
> 3/ Vấn đề về mạng, hiện thông báo: "Kết nối thất bại,
>
> vui lòng kiểm tra đường truyền mạng"

![](media/image3.png){width="0.7291655730533684in"
height="0.46874890638670164in"}![](media/image15.png){width="4.687498906386701in"
height="6.156248906386701in"}

> FSD - CSM Module

# **5.4. Soạn email** 

> *➢* Activity Diagram/Sequence Diagram
>
> *➢* Mô tả tính năng

![](media/image3.png){width="0.7291655730533684in"
height="0.46874890638670164in"}

> FSD - CSM Module

![](media/image3.png){width="0.7291655730533684in"
height="0.46874890638670164in"}

> FSD - CSM Module
>
> nối thất bại, vui lòng kiểm tra đường truyền mạng"
>
> Quy tắc nghiệp vụ
>
> Yêu cầu phi chức năng NF_01: Khả năng mở rộng cho rich-text có thể
> thêm,
>
> sửa, xoá, chọn, chỉnh sửa chữ ký.
>
> NF_02: Khả năng mở rộng cho các input field (To, cc,
>
> bcc) hiện ra danh sách email đã từng được gửi và cho
>
> phép chọn trong danh sách email đó
>
> *➢* Mô tả màn hình
>
> ● From: Email đã tích hợp vào channel đó (Không được thay đổi)
>
> ● To: (Gửi 1 hoặc nhiều email cùng lúc)
>
> ● cc: (Thêm 1 hoặc nhiều email)
>
> ● bcc: (Thêm 1 hoặc nhiều email)
>
> ● Nội dung: Rich text
>
> 46

![](media/image3.png){width="0.7291655730533684in"
height="0.46874890638670164in"}![](media/image15.png){width="4.6875in"
height="6.156248906386701in"}

> FSD - CSM Module

# **Hình ảnh wireframe (Hình số 3):** 

# **5.5. Cấu hình cho mỗi kênh** 

> *➢* Activity Diagram/Sequence Diagram
>
> *➢* Mô tả tính năng

![](media/image3.png){width="0.7291655730533684in"
height="0.46874890638670164in"}

> FSD - CSM Module

![](media/image3.png){width="0.7291655730533684in"
height="0.46874890638670164in"}

> FSD - CSM Module
>
> Luồng thất bại
>
> Quy tắc nghiệp vụ
>
> Yêu cầu phi chức năng NF_01: Khả năng mở rộng cho rich-text có thể
> thêm,
>
> sửa, xoá, chọn, chỉnh sửa chữ ký.
>
> NF_02: Khả năng mở rộng cho các input field (To, cc,
>
> bcc) hiện ra danh sách email đã từng được gửi và cho
>
> phép chọn trong danh sách email đó
>
> 49

![](media/image3.png){width="0.7291655730533684in"
height="0.46874890638670164in"}![](media/image12.jpg){width="5.843748906386701in"
height="5.760416666666667in"}

> FSD - CSM Module
>
> *➢* Mô tả màn hình
>
> **6. Manage Department**

# **6.1. Tạo phòng ban mới** 

> *➢* Activity Diagram/Sequence Diagram
>
> *➢* Mô tả tính năng

![](media/image3.png){width="0.7291655730533684in"
height="0.46874890638670164in"}

> FSD - CSM Module
>
> mới phòng ban trong hệ thống, phục vụ cho việc tổ
>
> chức và phân loại nhân sự, phân quyền và quản lý
>
> công việc theo cơ cấu tổ chức.

![](media/image3.png){width="0.7291655730533684in"
height="0.46874890638670164in"}

> FSD - CSM Module
>
> *➢* Mô tả màn hình
>
> ● Tên phòng ban (required)
>
> ● Mô tả (optional)
>
> ● Dropdown chọn 1: Người phụ trách (required)
>
> ● Dropdown chọn nhiều: Thêm agents (optional)

# **6.2. Cập nhật phòng ban** 

> *➢* Activity Diagram/Sequence Diagram
>
> *➢* Mô tả tính năng

![](media/image3.png){width="0.7291655730533684in"
height="0.46874890638670164in"}

> FSD - CSM Module
>
> B2. Nhập thông tin muốn thay đổi (Tên, mô tả, trưởng
>
> phòng, thêm/xoá agents)
>
> B3. Nhấn nút xác nhận
>
> B4. Kết thúc luồng
>
> Luồng thay thế
>
> Luồng thất bại

![](media/image3.png){width="0.7291655730533684in"
height="0.46874890638670164in"}

> FSD - CSM Module
>
> Tính năng liên quan

![](media/image3.png){width="0.7291655730533684in"
height="0.46874890638670164in"}

> FSD - CSM Module
>
> quản lý trực với mỗi phòng ban liên quan.

![](media/image3.png){width="0.7291655730533684in"
height="0.46874890638670164in"}

> FSD - CSM Module
>
> *➢* Mô tả tính năng

![](media/image3.png){width="0.7291655730533684in"
height="0.46874890638670164in"}

> FSD - CSM Module
>
> Quy tắc nghiệp vụ
>
> Yêu cầu phi chức năng
>
> *➢* Mô tả màn hình

# **7.2. Hiển thị chi tiết nhân viên** 

> *➢* Activity Diagram/Sequence Diagram
>
> *➢* Mô tả tính năng

![](media/image3.png){width="0.7291655730533684in"
height="0.46874890638670164in"}

> FSD - CSM Module
>
> Yêu cầu phi chức năng
>
> *➢* Mô tả màn hình
>
> 58
