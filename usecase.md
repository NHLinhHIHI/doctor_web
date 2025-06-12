# Đặc tả Use Case

## 1. Khám Bệnh
| Mục                  | Nội dung |
|----------------------|----------|
| Tên chức năng        | Khám Bệnh |
| Mô tả chức năng      | Cho phép bác sĩ thực hiện khám bệnh cho bệnh nhân, ghi nhận triệu chứng, chẩn đoán và kê đơn thuốc. |
| Đầu vào (Input)      | Thông tin bệnh nhân, triệu chứng, kết quả xét nghiệm (nếu có), thông tin bác sĩ. |
| Xử lý (Processing)   | 1. Xác thực thông tin bệnh nhân. 2. Nhập triệu chứng, chẩn đoán. 3. Lưu thông tin khám bệnh. 4. Kê đơn thuốc (nếu cần). |
| Đầu ra (Output)      | Hồ sơ khám bệnh mới, đơn thuốc (nếu có), thông báo thành công/thất bại. |
| Điều kiện tiền đề    | Bệnh nhân đã đăng ký khám, bác sĩ đã đăng nhập hệ thống. |
| Điều kiện hậu điều   | Thông tin khám bệnh được lưu vào hồ sơ bệnh án. |
| Luồng chính (Main Flow) | 1. Bác sĩ chọn bệnh nhân. 2. Nhập thông tin khám. 3. Lưu kết quả. |
| Luồng phụ (Alt Flow) | 1. Bệnh nhân không tồn tại. 2. Lỗi lưu dữ liệu. |
| Ràng buộc            | Chỉ bác sĩ có quyền thực hiện. Dữ liệu phải bảo mật. |

## 2. Xem Hồ Sơ Bệnh Án
| Mục                  | Nội dung |
|----------------------|----------|
| Tên chức năng        | Xem Hồ Sơ Bệnh Án |
| Mô tả chức năng      | Cho phép người dùng (bác sĩ, bệnh nhân, quản trị viên) xem thông tin chi tiết về hồ sơ bệnh án. |
| Đầu vào (Input)      | Mã bệnh nhân hoặc mã hồ sơ bệnh án. |
| Xử lý (Processing)   | 1. Xác thực quyền truy cập. 2. Truy xuất dữ liệu hồ sơ bệnh án. |
| Đầu ra (Output)      | Thông tin chi tiết hồ sơ bệnh án. |
| Điều kiện tiền đề    | Người dùng đã đăng nhập, có quyền truy cập hồ sơ. |
| Điều kiện hậu điều   | Không thay đổi dữ liệu. |
| Luồng chính (Main Flow) | 1. Người dùng nhập mã bệnh nhân/hồ sơ. 2. Hệ thống hiển thị thông tin. |
| Luồng phụ (Alt Flow) | 1. Không tìm thấy hồ sơ. 2. Không đủ quyền truy cập. |
| Ràng buộc            | Bảo mật thông tin, phân quyền truy cập. |

## 3. Quản Lý Thông Tin Cá Nhân
| Mục                  | Nội dung |
|----------------------|----------|
| Tên chức năng        | Quản Lý Thông Tin Cá Nhân |
| Mô tả chức năng      | Cho phép người dùng cập nhật, chỉnh sửa thông tin cá nhân như họ tên, địa chỉ, số điện thoại, email,... |
| Đầu vào (Input)      | Thông tin cá nhân mới do người dùng nhập. |
| Xử lý (Processing)   | 1. Xác thực người dùng. 2. Kiểm tra hợp lệ dữ liệu. 3. Lưu thông tin mới. |
| Đầu ra (Output)      | Thông báo cập nhật thành công/thất bại, thông tin cá nhân mới. |
| Điều kiện tiền đề    | Người dùng đã đăng nhập. |
| Điều kiện hậu điều   | Thông tin cá nhân được cập nhật trong hệ thống. |
| Luồng chính (Main Flow) | 1. Người dùng nhập thông tin mới. 2. Hệ thống kiểm tra và lưu lại. |
| Luồng phụ (Alt Flow) | 1. Dữ liệu không hợp lệ. 2. Lỗi lưu dữ liệu. |
| Ràng buộc            | Chỉ người dùng được phép sửa thông tin của mình. Dữ liệu phải bảo mật. |

## 4. Đăng Nhập
| Mục                  | Nội dung |
|----------------------|----------|
| Tên chức năng        | Đăng Nhập |
| Mô tả chức năng      | Cho phép người dùng (bác sĩ, bệnh nhân, quản trị viên) đăng nhập vào hệ thống để sử dụng các chức năng phù hợp với vai trò. |
| Đầu vào (Input)      | Tên đăng nhập, mật khẩu. |
| Xử lý (Processing)   | 1. Kiểm tra thông tin đăng nhập. 2. Xác thực tài khoản và mật khẩu. 3. Phân quyền truy cập. |
| Đầu ra (Output)      | Thông báo đăng nhập thành công/thất bại, chuyển hướng đến giao diện phù hợp. |
| Điều kiện tiền đề    | Người dùng đã có tài khoản trên hệ thống. |
| Điều kiện hậu điều   | Người dùng được xác thực và truy cập hệ thống. |
| Luồng chính (Main Flow) | 1. Nhập tên đăng nhập và mật khẩu. 2. Hệ thống xác thực. 3. Đăng nhập thành công. |
| Luồng phụ (Alt Flow) | 1. Sai thông tin đăng nhập. 2. Tài khoản bị khóa. |
| Ràng buộc            | Bảo mật thông tin đăng nhập, giới hạn số lần đăng nhập sai. |

## 5. Đăng Kí Lịch Làm Việc
| Mục                  | Nội dung |
|----------------------|----------|
| Tên chức năng        | Đăng Kí Lịch Làm Việc |
| Mô tả chức năng      | Cho phép bác sĩ đăng kí, cập nhật lịch làm việc của mình trên hệ thống. |
| Đầu vào (Input)      | Thông tin lịch làm việc: ngày, giờ, ca làm việc, ghi chú (nếu có). |
| Xử lý (Processing)   | 1. Xác thực bác sĩ. 2. Kiểm tra hợp lệ lịch đăng kí. 3. Lưu thông tin lịch làm việc. |
| Đầu ra (Output)      | Thông báo đăng kí thành công/thất bại, lịch làm việc mới. |
| Điều kiện tiền đề    | Bác sĩ đã đăng nhập hệ thống. |
| Điều kiện hậu điều   | Lịch làm việc của bác sĩ được cập nhật trên hệ thống. |
| Luồng chính (Main Flow) | 1. Bác sĩ nhập thông tin lịch làm việc. 2. Hệ thống kiểm tra và lưu lại. |
| Luồng phụ (Alt Flow) | 1. Lịch trùng với ca đã đăng kí. 2. Lỗi lưu dữ liệu. |
| Ràng buộc            | Chỉ bác sĩ được phép đăng kí lịch làm việc của mình. |
