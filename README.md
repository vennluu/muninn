# Muninn - Personal CRM & Data Management

Muninn là một ứng dụng quản lý dữ liệu cá nhân (CRM) bao gồm Backend (Go) và Frontend (React).

## 📋 Yêu cầu hệ thống (Prerequisites)

Trước khi cài đặt, hãy đảm bảo máy bạn đã cài đặt:

- **Go**: Phiên bản 1.23 trở lên ([Tải về](https://go.dev/dl/))
- **Node.js**: Phiên bản 16 trở lên & npm ([Tải về](https://nodejs.org/))
- **PostgreSQL**: Cơ sở dữ liệu ([Tải về](https://www.postgresql.org/download/))

---

## 🚀 Cài đặt & Chạy ứng dụng

### 1. Clone Source Code

```bash
git clone https://github.com/crea8r/muninn.git
cd muninn
```

### 2. Cấu hình Database (PostgreSQL)

1. Tạo database mới tên là `muninn` trong PostgreSQL.
2. Chạy file migration để tạo bảng dữ liệu:
   
   Dùng tool quản lý DB (như DBeaver, pgAdmin) hoặc dòng lệnh để chạy file SQL tại:
   `server/migrations/001_initial_schema.sql`

### 3. Cài đặt & Chạy Backend (Server)

Di chuyển vào thư mục server:

```bash
cd server
```

Tạo file `.env` từ cấu hình mẫu:

```bash
# Tạo file .env
touch .env
```

Mở file `.env` và điền thông tin cấu hình (ví dụ):

```env
DATABASE_URL=postgres://user:password@localhost:5432/muninn?sslmode=disable
JWT_SECRET=your_super_secret_key
PORT=8080
```
*(Thay `user`, `password` bằng thông tin PostgreSQL của bạn)*

Cài đặt dependencies và chạy server:

```bash
# Tải thư viện
go mod tidy

# Chạy server
./start-web.sh
# Hoặc: go run cmd/api/main.go
```
Backend sẽ chạy tại: `http://localhost:8080`

### 4. Cài đặt & Chạy Frontend (Webapp)

Mở một terminal mới, di chuyển vào thư mục webapp:

```bash
cd webapp
```

Tạo file `.env`:

```bash
touch .env
```

Nội dung file `.env` cho Frontend:

```env
PORT=3000
REACT_APP_API_URL=http://localhost:8080
```

Cài đặt và chạy:

```bash
# Cài đặt thư viện
npm install

# Chạy ứng dụng
npm start
```
Frontend sẽ chạy tại: `http://localhost:3000`

---

## 🛠 Cấu trúc dự án

- **/server**: Mã nguồn Backend (Golang, Chi Router, SQLC).
- **/webapp**: Mã nguồn Frontend (ReactJS, TypeScript, Chakra UI).
- **/sql**: Các file SQL mẫu và dữ liệu test.

## 📝 API Documentation

API backend chạy tại `http://localhost:8080`.
Các endpoints chính:
- `/api/health`: Kiểm tra trạng thái server.
- `/api/v1/...`: Các API dữ liệu chính.
