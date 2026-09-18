# Pi Robot Controller - Android Application (React Native CLI)

Ứng dụng Android điều khiển Robot Raspberry Pi 4 thời gian thực qua Wi-Fi mạng cục bộ (LAN), tích hợp quét mã QR OLED, D-pad với cơ chế Press-and-Hold an toàn, truyền hình ảnh trực tiếp từ camera CSI, kiểm tra 4 động cơ độc lập và theo dõi Telemetry chi tiết.

---

## 1. Yêu Cầu Môi Trường (System Requirements)

- **Node.js:** `>= 18.x` (khuyến nghị Node 20.x hoặc 24.x LTS)
- **Java Development Kit (JDK):** OpenJDK 17 LTS
- **Android SDK:** Android SDK Platform 34 / 35, Build-tools 34.0.0 hoặc 35.0.0
- **Android NDK:** 26.1.x

---

## 2. Cấu Hình Android SDK

Tạo file `android/local.properties` (nếu chưa có) và trỏ đến thư mục Android SDK của máy tính:

```properties
sdk.dir=C\:\\Users\\<YourUsername>\\AppData\\Local\\Android\\Sdk
```
*(Trên Linux/macOS: `sdk.dir=/home/<username>/Android/Sdk`)*

---

## 3. Cài Đặt & Biên Dịch Ứng Dụng (Build Debug APK)

### 3.1. Cài đặt các gói phụ thuộc (Dependencies)
```bash
cd android-app
npm install
```

### 3.2. Kiểm tra TypeScript
```bash
npx tsc --noEmit
```

### 3.3. Biên dịch Debug APK
Trên Windows PowerShell:
```powershell
cd android
.\gradlew.bat assembleDebug
```
Trên Linux / macOS:
```bash
cd android
./gradlew assembleDebug
```

File APK hoàn chỉnh được sinh ra tại:
```
android-app/android/app/build/outputs/apk/debug/app-debug.apk
```

---

## 4. Cài Đặt Lên Thiết Bị Android Thực Tế

Cắm điện thoại Android vào máy tính qua cáp USB và bật chế độ **USB Debugging** (Gỡ lỗi USB):

```bash
# Kiểm tra thiết bị đã kết nối
adb devices

# Cài đặt file APK trực tiếp
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```

---

## 5. Hướng Dẫn Sử Dụng Ứng Dụng

1. Đảm bảo điện thoại và Raspberry Pi 4 kết nối vào **cùng một mạng Wi-Fi**.
2. Mở ứng dụng **Pi Robot Controller** trên điện thoại.
3. Chọn **📷 QUÉT MÃ QR TRÊN OLED** và hướng camera vào màn hình OLED của Robot để tự động xác thực và ghép nối.
4. Màn hình **Dashboard** xuất hiện hiển thị các thông số FPS, CPU, RAM và trạng thái an toàn.
5. Vào màn hình **🎮 ĐIỀU KHIỂN**:
   - Nhấn giữ nút **Tiến / Lùi / Trái / Phải** để di chuyển robot.
   - Thả tay ra khỏi nút $\rightarrow$ robot lập tức dừng lại.
   - Khi có người bước vào camera $\rightarrow$ robot tự động dừng khẩn cấp và khóa di chuyển.
   - Bấm nút **🛑 DỪNG KHẨN CẤP** bất kỳ lúc nào để ngắt điện toàn bộ động cơ.
