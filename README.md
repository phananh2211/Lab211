Markdown
# Hệ Thống Quản Lý Phòng Thí Nghiệm Lab 211 (HUST)

> Nền tảng web thông minh phục vụ nghiên cứu khoa học, vận hành thiết bị, quản lý đề tài và đối soát tài chính trực tuyến tại **Phòng 211 - C5, Trường Vật liệu, Đại học Bách khoa Hà Nội**.

---

## Giới Thiệu Dự Án

Hệ thống **Lab 211 Management** được phát triển nhằm tối ưu hóa quy trình hoạt động nội bộ của phòng thí nghiệm, cung cấp các công cụ tự động hóa toàn diện cho Giảng viên, Nghiên cứu sinh và Sinh viên:
* **Quản lý & Đặt lịch thiết bị:** Đặt lịch tuần, chống xung đột lịch bằng cơ chế khóa cơ sở dữ liệu (`btree_gist`), xác thực mã PIN bảo mật khi hủy lịch.
* **Quản lý Đề tài & Nhiệm vụ:** Giao việc theo nhóm, theo dõi tiến độ hoàn thành, đính kèm minh chứng báo cáo (GitHub, Overleaf, Google Drive).
* **Quản lý Kho & Vật tư tiêu hao:** Theo dõi tồn kho hóa chất, bột gốm, linh kiện điện tử theo thời gian thực, cảnh báo tự động khi lượng tồn chạm ngưỡng tối thiểu.
* **Đề xuất mua sắm & Giải ngân tài chính:** Tích hợp quét mã QR VietQR bảo mật, kết nối trực tiếp với bảng thông tin ngân hàng cá nhân hóa.
* **Hệ thống thông báo đẩy & Đa xác thực:** Hỗ trợ xác thực hai lớp TOTP (Authenticator) và thông báo thời gian thực qua Realtime/Web Push Notification.

---

## Công Nghệ Sử Dụng

* **Frontend:** React (Vite), CSS Modules / Inline Styling, SweetAlert2, React Hot Toast.
* **Backend & Database:** Supabase (PostgreSQL, Row Level Security - RLS, Realtime Subscriptions, PL/pgSQL RPC Functions).
* **Authentication:** Supabase Auth (Email xác thực miền trường, Multi-Factor Authentication).
* **Notifications:** Firebase Cloud Messaging (FCM) & Web Push API.

---

## Cấu Trúc Thư Mục Dự Án

```text
├── public/                 # Tài nguyên tĩnh & Service Worker (firebase-messaging-sw.js)
├── src/
│   ├── components
│   ├── AdminDashboard.jsx
│   ├── LecturerDashboard.jsx
│   ├── StudentDashboard.jsx
│   ├── App.jsx 
│   ├── supabaseClient.js
│   └── main.jsx 
├── .env
└── README.md 


Hướng Dẫn Cài Đặt & Chạy Dự Án (Local Development)
1. Yêu cầu chuẩn bị
Đã cài đặt Node.js (phiên bản 18.x trở lên).

Có một dự án trên Supabase và cấu hình các bảng cơ sở dữ liệu theo mã nguồn SQL hệ thống.

2. Các bước thiết lập
Clone repository về máy:

Bash
git clone https://github.com/username/lab211-management.git
cd lab211-management
Cài đặt các gói thư viện phụ thuộc:

Bash
npm install
Cấu hình biến môi trường:
Tạo file .env ở thư mục gốc và cấu hình các thông số kết nối Supabase của bạn:

Code snippet
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
Chạy ứng dụng ở môi trường phát triển:

Bash
npm run dev
Truy cập trình duyệt tại địa chỉ: http://localhost:5173

Cơ Chế Bảo Mật & Phân Quyền
Row Level Security: Toàn bộ các bảng dữ liệu trên Supabase đều được kích hoạt chính sách RLS khắt khe, tách bạch rõ ràng giữa dữ liệu công khai (AAL1) và dữ liệu tài chính/bảo mật nhạy cảm (yêu cầu AAL2).

Chỉ chấp nhận tài khoản có đuôi @hust.edu.vn (Giảng viên) hoặc @sis.hust.edu.vn (Sinh viên) được phép đăng ký và truy cập hệ thống.

Các giao dịch tài chính nội bộ và thao tác quan trọng đều được xử lý thông qua các hàm bảo mật RPC (confirm_transfer, book_equipment, delete_my_booking) ở cấp độ cơ sở dữ liệu nhằm chống lặp yêu cầu (Replay Protection).

Nhóm Tác Giả & Phát Triển
Đơn vị: Bộ môn Khoa học và Kỹ thuật Vật liệu - Trường Vật liệu, Đại học Bách khoa Hà Nội.

Phòng thí nghiệm: Lab 211 - C5.
