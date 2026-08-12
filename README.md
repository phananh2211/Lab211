# 🧪 Hệ Thống Quản Lý Phòng Thí Nghiệm Lab 211 (HUST)

<div align="center">

  <img src="https://img.shields.io/badge/React-18.x-blue?style=for-the-badge&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/Supabase-Database-green?style=for-the-badge&logo=supabase" alt="Supabase" />
  <img src="https://img.shields.io/badge/Vite-Build%20Tool-orange?style=for-the-badge&logo=vite" alt="Vite" />
  <img src="https://img.shields.io/badge/Status-Active-success?style=for-the-badge" alt="Status" />

  <p><b>Nền tảng web thông minh phục vụ nghiên cứu khoa học, vận hành thiết bị, quản lý đề tài và đối soát tài chính trực tuyến tại Phòng 211 - C5, Trường Vật liệu, Đại học Bách khoa Hà Nội.</b></p>

</div>

---

## Tính Năng Nổi Bật

* **Quản lý & Đặt lịch thiết bị:** Đặt lịch theo tuần, cơ chế chống xung đột lịch bằng khóa cơ sở dữ liệu, xác thực mã PIN bảo mật khi hủy lịch.
* **Quản lý Đề tài & Nhiệm vụ:** Phân công công việc nhóm, theo dõi tiến độ hoàn thành trực quan, hỗ trợ đính kèm minh chứng báo cáo (GitHub, Overleaf, Google Drive).
* **Quản lý Kho & Vật tư tiêu hao:** Kiểm soát tồn kho hóa chất, bột gốm, linh kiện điện tử theo thời gian thực, tự động cảnh báo khi tồn kho chạm ngưỡng tối thiểu.
* **Đề xuất mua sắm & Giải ngân tài chính:** Tích hợp quét mã QR VietQR bảo mật, đồng bộ quỹ nội bộ và liên kết trực tiếp với thông tin ngân hàng cá nhân.
* **Thông báo & Bảo mật đa lớp:** Hỗ trợ xác thực hai lớp TOTP (MFA) qua ứng dụng Authenticator và nhận thông báo thời gian thực qua Realtime/Web Push Notification.

---

## Công Nghệ Sử Dụng

| Thành phần | Công nghệ / Thư viện |
| :--- | :--- |
| **Frontend** | React (Vite), CSS Modules / Inline Styling, SweetAlert2, React Hot Toast |
| **Backend & Database** | Supabase (PostgreSQL, RLS, Realtime Subscriptions, PL/pgSQL RPC Functions) |
| **Authentication** | Supabase Auth (Định danh email trường, Multi-Factor Authentication) |
| **Notifications** | Firebase Cloud Messaging (FCM) & Web Push API |

---

## Cấu Trúc Thư Mục Dự Án

```
├── public/                 # Tài nguyên tĩnh & Service Worker (firebase-messaging-sw.js)
├── src/
│   ├── components/         # Các thành phần giao diện thành phần (SettingsTab, Footer, v.v.)
│   ├── AdminDashboard.jsx  # Bảng điều khiển Quản trị viên
│   ├── LecturerDashboard.jsx# Bảng điều khiển Giảng viên
│   ├── StudentDashboard.jsx# Bảng điều khiển Sinh viên
│   ├── App.jsx             # Điều hướng chính, xác thực phiên & thông báo
│   ├── supabaseClient.js   # Khởi tạo kết nối Supabase Client
│   └── main.jsx            # Điểm khởi chạy React
├── .env                    # Biến môi trường
└── README.md               # Tài liệu dự án
```

**Hướng Dẫn Cài Đặt & Chạy Dự Án**
1. Yêu cầu chuẩn bị
Đã cài đặt Node.js (phiên bản 18.x trở lên).

Có một dự án trên Supabase và đã cấu hình các bảng cơ sở dữ liệu theo mã nguồn SQL hệ thống.

2. Các bước thiết lập
Bước 1: Clone repository về máy

```
git clone https://github.com/username/lab211-management.git
cd lab211-management
```

Bước 2: Cài đặt các gói thư viện phụ thuộc

```
npm install
```

Bước 3: Cấu hình biến môi trường
Tạo file .env ở thư mục gốc và điền các thông số kết nối Supabase của bạn:

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```
Bước 4: Chạy ứng dụng ở môi trường phát triển

```
npm run dev
```
Truy cập trình duyệt tại địa chỉ: http://localhost:5173

## Cơ Chế Bảo Mật & Phân Quyền
* **Row Level Security**: Các bảng dữ liệu áp dụng chính sách RLS khắt khe, phân tách rõ ràng giữa dữ liệu công khai và dữ liệu tài chính/bảo mật nhạy cảm.

* **Xác thực định danh**: Hệ thống chỉ chấp nhận tài khoản có đuôi @hust.edu.vn (Giảng viên) hoặc @sis.hust.edu.vn (Sinh viên) đăng ký và truy cập.

* **RPC Secured Workflow**: Các giao dịch tài chính và thao tác nhạy cảm được thực thi thông qua các hàm bảo mật RPC ở tầng cơ sở dữ liệu để chống lặp yêu cầu.

## Nhóm Tác Giả & Phát Triển
* **Đơn vị quản lý**: Bộ môn Khoa học và Kỹ thuật Vật liệu - Trường Vật liệu, Đại học Bách khoa Hà Nội.

* **Địa điểm**: Phòng thí nghiệm Lab 211 - C5.
