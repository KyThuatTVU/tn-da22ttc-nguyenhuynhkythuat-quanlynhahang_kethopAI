# DANH SÁCH YÊU CẦU CÔNG VIỆC & RÀNG BUỘC PHÁT TRIỂN

> [!IMPORTANT]
> ## ⚠️ NGUYÊN TẮC CỐT LÕI (CẤM VI PHẠM)
> 1. **CẤM TỰ Ý SỬA CODE KHÔNG LIÊN QUAN**: Chỉ sửa đúng những file trực tiếp liên quan đến yêu cầu. Tuyệt đối không thay đổi, định dạng lại (reformat), hay chạm vào các phần code khác.
> 2. **ĐỌC KỸ CODE VÀ TỰ TÌM FILE**: AI có nhiệm vụ tự phân tích cấu trúc dự án, tự tìm các file cần sửa để thực hiện yêu cầu. Khách hàng chỉ cung cấp yêu cầu nghiệp vụ, không cần chỉ ra file.
> 3. **TÔN TRỌNG PHONG CÁCH VIẾT CODE**: Tuân thủ đúng các nguyên tắc thiết kế, kiến trúc và quy chuẩn định dạng sẵn có của dự án.

> [!IMPORTANT]
> ## 🛡️ QUY TRÌNH LÀM VIỆC AN TOÀN (AI BẮT BUỘC TUÂN THỦ)
> 1. **Đọc & Làm rõ**: AI đọc yêu cầu trong file. Nếu có bất kỳ điểm nào mơ hồ, chưa rõ ràng hoặc có rủi ro cao, AI **phải chat hỏi lại User** để làm rõ trước khi đụng vào code.
> 2. **Tóm tắt phương án**: Trước khi viết code, AI cần nhắn tin ngắn gọn trên chat: *"Tôi đã hiểu yêu cầu. Tôi dự kiến sửa đổi các file [A, B] với phương án là [...]. Bạn có đồng ý không?"*.
> 3. **Chờ xác nhận**: Chỉ khi nhận được sự đồng ý của User (ví dụ: *"Làm đi"*, *"Ok"*,...), AI mới được phép tiến hành sửa đổi code.
> 4. **Kiểm tra & Cập nhật**: Sau khi thực hiện xong, AI kiểm tra lỗi và cập nhật kết quả (danh sách file đã sửa, tóm tắt thay đổi) vào file này để lưu lịch sử.

---

## 📌 YÊU CẦU CÔNG VIỆC HIỆN TẠI
*(Nhập yêu cầu mới cần làm vào đây)*

- **Nội dung yêu cầu**:
  - 3.4.1 Mô hình phân cấp chức năng. Vẽ mô hình phân cấp chức năng (BFD) cho dự án, thiết kế đơn giản, tập trung vào nghiệp vụ truyền thống của nhà hàng (không đưa các quy trình kỹ thuật AI phức tạp vào sơ đồ).

---

## ⏳ TIẾN ĐỘ THỰC HIỆN & BÁO CÁO KẾT QUẢ
*(AI tự động cập nhật sau khi hoàn thành)*

- **Trạng thái**: `[Đã hoàn thành]`
- **Các file thực tế AI đã chỉnh sửa**:
  - [sodo_phancap_chucnang.html](file:///d:/KhoaLuanTotNghiep2026/sodo_phancap_chucnang.html) [NEW]
- **Tóm tắt thay đổi & Kết quả**:
  - Thiết kế sơ đồ phân cấp chức năng (Business Function Diagram - BFD) chuẩn tương tác bằng thư viện Mermaid.js với cấu trúc 3 cấp rõ ràng.
  - Phân rã chi tiết thành 4 phân hệ cốt lõi: Khách hàng, Nhân viên, Quản lý, và Quản trị hệ thống, phản ánh chính xác các thực thể và chức năng trong mã nguồn.
  - Tích hợp tính năng chuyển đổi giao diện Sáng/Tối (Light/Dark mode) và nút tải trực tiếp ảnh vector SVG phục vụ việc nhúng sơ đồ vào tài liệu báo cáo Word.
- **Hướng dẫn kiểm tra**:
  - Mở tệp [sodo_phancap_chucnang.html](file:///d:/KhoaLuanTotNghiep2026/sodo_phancap_chucnang.html) trên trình duyệt, kiểm tra hiển thị sơ đồ phân cấp dạng cây, thử nghiệm các tính năng đổi giao diện và nút tải ảnh SVG.

---

## 📜 LỊCH SỬ CÁC YÊU CẦU ĐÃ HOÀN THÀNH
*(Lưu lại lịch sử công việc)*

- **Yêu cầu #1 (Ngày 06/06/2026)**: Vẽ sơ đồ kiến trúc hệ thống 4 tầng chi tiết mô tả đầy đủ các dịch vụ, các công nghệ và luồng giao tiếp ([sodokientruc.html](file:///d:/KhoaLuanTotNghiep2026/sodokientruc.html)). -> `Đã hoàn thành`
- **Yêu cầu #2 (Ngày 06/06/2026)**: Vẽ lại 4 sơ đồ hoạt động gợi ý món ăn theo đúng phong cách hình ảnh mẫu zigzag, vòng tròn icon và mũi tên slanted của Khách hàng, Việt hóa tất cả thuật ngữ chuyên ngành và đồng bộ cả 3 file. -> `Đã hoàn thành`
- **Yêu cầu #3 (Ngày 06/06/2026)**: Vẽ sơ đồ phân cấp chức năng (BFD) cho dự án ([sodo_phancap_chucnang.html](file:///d:/KhoaLuanTotNghiep2026/sodo_phancap_chucnang.html)). -> `Đã hoàn thành`

