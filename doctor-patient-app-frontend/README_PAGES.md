# Hướng Dẫn Sử Dụng Các Trang Mới - HOA BINH HOSPITAL

## Tổng Quan

Dự án đã được cập nhật với 4 trang mới cho phần Doctor, bao gồm:
- **Home** (`/home`) - Trang chủ giới thiệu bệnh viện
- **About** (`/about`) - Trang thông tin về bệnh viện
- **Services** (`/services`) - Trang dịch vụ y tế
- **Contact** (`/contact`) - Trang liên hệ

## Cấu Trúc File

### Các File Mới Được Tạo:

1. **Components:**
   - `src/pages/DoctorHomePage.jsx` - Trang Home
   - `src/pages/DoctorAbout.jsx` - Trang About
   - `src/pages/DoctorServices.jsx` - Trang Services
   - `src/pages/DoctorContact.jsx` - Trang Contact

2. **Routing:**
   - Đã cập nhật `src/App.js` với các route mới

3. **Styling:**
   - Đã thêm CSS vào `src/pages/doctor.css`

## Tính Năng Của Từng Trang

### 1. Trang Home (`/home`)

**Tính năng chính:**
- Hero section với thông tin giới thiệu bệnh viện
- Thống kê bệnh viện (số bác sĩ, bệnh nhân, năm kinh nghiệm)
- Preview các dịch vụ y tế
- Thông tin liên hệ nhanh
- Nút chuyển đến Dashboard và các trang khác

**Các phần:**
- Hero section với hình ảnh và nút CTA
- Stats section hiển thị con số ấn tượng
- Services preview với 4 dịch vụ chính
- About preview giới thiệu ngắn gọn
- Contact info với thông tin liên hệ

### 2. Trang About (`/about`)

**Tính năng chính:**
- Lịch sử phát triển bệnh viện
- Giá trị cốt lõi của bệnh viện
- Thành tựu và con số ấn tượng
- Timeline lịch sử phát triển
- Đội ngũ lãnh đạo
- Sứ mệnh và tầm nhìn

**Các phần:**
- Hero section
- Introduction với lịch sử
- Values section (4 giá trị cốt lõi)
- Achievements section
- Timeline section (6 cột mốc)
- Team section (3 thành viên lãnh đạo)
- Mission & Vision
- CTA section

### 3. Trang Services (`/services`)

**Tính năng chính:**
- Danh sách đầy đủ các dịch vụ y tế
- Tìm kiếm và lọc dịch vụ theo danh mục
- Bảng giá chi tiết
- Gói ưu đãi đặc biệt
- Thông tin chi tiết từng dịch vụ

**Các phần:**
- Hero section
- Search & Filter section
- Services grid (10 dịch vụ)
- Pricing table
- Special offers (2 gói ưu đãi)
- CTA section

**Dịch vụ bao gồm:**
- Khám bệnh tổng quát
- Chẩn đoán hình ảnh
- Phẫu thuật tim mạch
- Khám nhi khoa
- Khám phụ khoa
- Khám nam khoa
- Khám thần kinh
- Khám tiết niệu
- Khám răng hàm mặt
- Vật lý trị liệu

### 4. Trang Contact (`/contact`)

**Tính năng chính:**
- Form liên hệ với validation
- Bản đồ Google Maps
- Thông tin liên hệ chi tiết
- FAQ (Câu hỏi thường gặp)
- Liên kết mạng xã hội

**Các phần:**
- Hero section
- Contact info cards
- Contact form với validation
- Google Maps iframe
- FAQ section
- Social media links
- CTA section

## Cách Sử Dụng

### 1. Truy Cập Các Trang

Sau khi đăng nhập với tài khoản Doctor, bạn có thể:

1. **Từ Navigation Bar:** Click vào các menu HOME, ABOUT, SERVICES, CONTACT
2. **Từ URL:** Truy cập trực tiếp các đường dẫn:
   - `/home`
   - `/about`
   - `/services`
   - `/contact`

### 2. Điều Hướng

- **Navigation Bar:** Luôn hiển thị ở đầu trang với menu chính
- **Sidebar:** Chứa các chức năng chính của Doctor
- **Nút Dashboard:** Chuyển về trang quản lý chính (`/doctor`)
- **Nút Đăng xuất:** Thoát khỏi hệ thống

### 3. Responsive Design

Tất cả các trang đều được thiết kế responsive:
- **Desktop:** Hiển thị đầy đủ layout
- **Tablet:** Tự động điều chỉnh grid
- **Mobile:** Stack layout theo chiều dọc

## Tính Năng Đặc Biệt

### 1. Form Validation (Contact Page)

Form liên hệ có validation đầy đủ:
- **Họ tên:** Bắt buộc
- **Email:** Bắt buộc, định dạng email
- **Số điện thoại:** Bắt buộc, định dạng số VN
- **Tiêu đề:** Bắt buộc
- **Nội dung:** Bắt buộc

### 2. Search & Filter (Services Page)

- **Tìm kiếm:** Theo tên hoặc mô tả dịch vụ
- **Lọc theo danh mục:** Tất cả, Nội khoa, Ngoại khoa, Chẩn đoán, Chuyên khoa
- **Hiển thị real-time:** Kết quả cập nhật ngay lập tức

### 3. Interactive Elements

- **Hover effects:** Tất cả card và button có hiệu ứng hover
- **Smooth transitions:** Animation mượt mà
- **Loading states:** Hiển thị trạng thái loading khi cần

## Màu Sắc và Theme

**Palette chính:**
- **Primary:** #1bb9b7 (Teal)
- **Secondary:** #0f8483 (Dark Teal)
- **Background:** #f9f9f9 (Light Gray)
- **Text:** #333 (Dark Gray)
- **Accent:** #ff6b6b (Red for badges)

**Typography:**
- **Heading:** Bold, 2.2rem - 2.5rem
- **Body:** Regular, 1rem - 1.2rem
- **Small:** 0.9rem - 1rem

## Cấu Hình và Tùy Chỉnh

### 1. Thay Đổi Nội Dung

Để thay đổi nội dung, chỉnh sửa các file JSX tương ứng:

```javascript
// Ví dụ: Thay đổi thông tin bệnh viện trong DoctorHomePage.jsx
const stats = [
  { number: '50+', label: 'Bác Sĩ Chuyên Khoa', icon: <FaStethoscope /> },
  // Thêm hoặc sửa thống kê
];
```

### 2. Thay Đổi Dịch Vụ

Trong `DoctorServices.jsx`:

```javascript
const services = [
  {
    id: 1,
    title: 'Tên Dịch Vụ Mới',
    category: 'internal',
    description: 'Mô tả dịch vụ',
    price: '500,000 VNĐ',
    duration: '30-45 phút',
    icon: <FaStethoscope />,
    features: ['Tính năng 1', 'Tính năng 2']
  },
  // Thêm dịch vụ mới
];
```

### 3. Thay Đổi Thông Tin Liên Hệ

Trong `DoctorContact.jsx`:

```javascript
const contactInfo = [
  {
    icon: <FaPhone />,
    title: 'Điện Thoại',
    details: [
      'Số điện thoại mới',
      'Hotline mới'
    ]
  },
  // Cập nhật thông tin
];
```

### 4. Thay Đổi Hình Ảnh

Thêm hình ảnh vào thư mục `public/images/` và cập nhật đường dẫn:

```javascript
<img src="/images/ten-hinh-anh.jpg" alt="Mô tả" />
```

## Lưu Ý Quan Trọng

### 1. Hình Ảnh

Các trang đã sử dụng hình ảnh bệnh viện Hoa Bình thực tế:
- **Hình ảnh chính:** [Bệnh viện Hoa Bình](https://hiephoibenhvientu.com.vn/wp-content/uploads/2018/09/bvhoabinh1.jpg) được sử dụng cho:
  - Hero section trong trang Home
  - About preview trong trang Home  
  - Introduction section trong trang About

Để hoàn thiện thêm, có thể cần:
- Thêm logo bệnh viện vào `public/images/logo.png`
- Thêm hình ảnh bác sĩ vào `public/images/doctor-1.jpg`, `doctor-2.jpg`, `doctor-3.jpg`

### 2. Google Maps

Bản đồ hiện tại sử dụng placeholder URL. Cần thay thế bằng:
- API key Google Maps hợp lệ
- Tọa độ thực tế của bệnh viện Hoa Bình

### 3. Form Submission

Form liên hệ hiện tại chỉ simulate. Cần:
- Kết nối với backend API
- Xử lý email notification
- Lưu trữ dữ liệu

### 4. Social Media Links

Các link mạng xã hội hiện tại là placeholder. Cần:
- Cập nhật URL thực tế của các trang mạng xã hội
- Thêm tracking analytics nếu cần

## Troubleshooting

### 1. Lỗi Import Icons

Nếu gặp lỗi import icons, đảm bảo đã cài đặt:
```bash
npm install react-icons
```

### 2. Lỗi Routing

Nếu không thể truy cập các trang, kiểm tra:
- File `App.js` đã import đúng components
- Routes đã được định nghĩa đúng
- Không có lỗi syntax trong components

### 3. Lỗi Styling

Nếu CSS không hoạt động:
- Kiểm tra file `doctor.css` đã được import
- Đảm bảo class names đúng
- Kiểm tra responsive breakpoints

## Kết Luận

Các trang mới đã được tạo hoàn chỉnh với:
- ✅ Thiết kế hiện đại và responsive
- ✅ Navigation thống nhất
- ✅ Nội dung chi tiết và đầy đủ
- ✅ Form validation
- ✅ Interactive elements
- ✅ SEO-friendly structure
- ✅ Routing đơn giản (bỏ /doctor/)

Chỉ cần thêm hình ảnh thực tế và kết nối backend để hoàn thiện hệ thống. 