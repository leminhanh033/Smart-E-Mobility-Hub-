# 🚀 Smart E-Mobility Hub - Hệ thống điều phối phương tiện điện

**Smart E-Mobility Hub** là hệ thống phần mềm quản lý và điều phối mạng lưới phương tiện điện (xe máy điện, xe đạp điện) trong khu đô thị ĐHQG-HCM. Hệ thống hỗ trợ sinh viên tìm kiếm, đặt xe, đặt chỗ đỗ, đăng ký sạc, đồng thời cung cấp cho đơn vị vận hành (Operator) khả năng giám sát toàn mạng lưới, điều phối xe và mô phỏng các kịch bản vận hành thực tế.

---

### 🔍 Bước 0: Kiểm tra môi trường trước khi cài đặt
Mở Terminal (hoặc Command Prompt / PowerShell trên Windows) và chạy các lệnh sau để kiểm tra xem máy bạn đã có công cụ nào:

- Kiểm tra Node.js: 
  node -v
 Nếu báo lỗi, hãy tải Node.js tại nodejs.org
- Kiểm tra npm (thường đi kèm với Node.js):
  npm -v
- Kiểm tra yarn:
  yarn 
### 🔍 Bước 1: Cài đặt
Nếu đã có yarn, sử dụng lệnh yarn install
Nếu chỉ có npm thì sử dụng lệnh npm install
### 🔍 Bước 2: Chạy chương trình
Sử dụng lệnh yarn start hoặc npm start
### 🔍 Bước 3: Sử dụng website
Truy cập đường dẫn để sử dụng các dịch vụ bên user: http://localhost:3000. Trước đó, cần đăng ký và đăng nhập
Truy cập đường dẫn để sử dụng các dịch vụ bên đơn vị vận hành: http://localhost:3000/admin/login. Vì là giả lập nên có thể đăng nhập bằng email hoặc mật khẩu nào cũng được

