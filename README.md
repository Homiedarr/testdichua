# Chùa Tịnh Tâm – Multiplayer HTML 3D (tối đa 20 người)

## 1. Yêu cầu
- Windows 10/11 hoặc Windows Server.
- Node.js bản LTS (khuyến nghị Node.js 20 hoặc mới hơn).
- Máy chủ và máy người chơi cùng mạng LAN nếu chỉ chạy local.
- Trình duyệt Chrome hoặc Edge hiện đại.
- Internet trên máy chủ để tải Three.js từ CDN khi mở game.

## 2. Cài đặt trên máy chủ
1. Cài Node.js LTS từ https://nodejs.org/ (giữ lựa chọn Add to PATH).
2. Giải nén thư mục `temple-multiplayer`.
3. Mở Command Prompt hoặc PowerShell tại thư mục này.
4. Chạy:
   ```powershell
   npm install
   npm start
   ```
5. Khi thấy `Temple Multiplayer running: http://localhost:3000`, server đã chạy.
6. Trên máy chủ mở `http://localhost:3000` để thử.

## 3. Cho máy khác trong LAN tham gia
1. Trên máy chủ mở CMD và chạy `ipconfig`.
2. Ghi lại IPv4 của card mạng LAN, ví dụ `192.168.1.50`.
3. Cho phép TCP port 3000 trên Windows Firewall (PowerShell chạy Run as Administrator):
   ```powershell
   New-NetFirewallRule -DisplayName "Temple Multiplayer TCP 3000" -Direction Inbound -Protocol TCP -LocalPort 3000 -Action Allow
   ```
4. Trên các máy khác cùng mạng, mở:
   `http://192.168.1.50:3000`
   Thay IP ví dụ bằng IPv4 thực tế của máy chủ.
5. Nhập tên và chọn **Vào chùa**. Tối đa 20 người chơi đồng thời.

## 4. Chạy nền / dừng server
- Chạy: `npm start`
- Dừng: nhấn `Ctrl + C` trong cửa sổ terminal.
- Muốn server luôn hoạt động, có thể dùng Windows Task Scheduler hoặc cài dịch vụ quản lý Node.js như NSSM/PM2.

## 5. Kiểm tra
- Mở game ở 2 trình duyệt hoặc 2 máy khác nhau.
- Di chuyển bằng WASD hoặc phím mũi tên.
- Nhấn Enter để tập trung vào ô chat; gửi tin nhắn bằng nút Gửi.
- HUD hiển thị số người đang ở trong phòng.

## 6. Lưu ý quan trọng
- Đây là bản MVP để thử nghiệm trong mạng LAN, không phải game production.
- Mỗi người chơi có thể thấy vị trí và chat của người khác; server giới hạn 20 kết nối đã tham gia.
- Three.js được tải từ jsDelivr CDN nên máy chơi cần Internet. Nếu mạng công ty chặn CDN, cần tải Three.js về local và đổi đường dẫn import.
- Chưa có tài khoản, lưu tiến độ, kiểm duyệt chat, chống gian lận nâng cao, voice chat, mobile joystick hoặc mã hóa HTTPS.
- Không mở port trực tiếp ra Internet nếu chưa bổ sung xác thực, HTTPS, rate limit và các biện pháp bảo mật.
- Nếu chỉ dùng trong LAN, không cần NAT/port forwarding trên router.
