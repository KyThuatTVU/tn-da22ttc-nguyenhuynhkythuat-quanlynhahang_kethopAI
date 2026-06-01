-- Tạo bảng chatbot_tri_thuc để lưu trữ tri thức cho chatbot
CREATE TABLE IF NOT EXISTS chatbot_tri_thuc (
    id INT NOT NULL AUTO_INCREMENT,
    tieu_de VARCHAR(255) NOT NULL COMMENT 'Tiêu đề tri thức',
    noi_dung TEXT NOT NULL COMMENT 'Nội dung chi tiết',
    ngay_tao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ngay_cap_nhat DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FULLTEXT KEY idx_fulltext_search (tieu_de, noi_dung)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Bảng lưu tri thức cho chatbot RAG';

-- Thêm dữ liệu mẫu
INSERT INTO chatbot_tri_thuc (tieu_de, noi_dung) VALUES
('Thông tin chủ nhà hàng', 'Chủ nhà hàng Phương Nam là bà Nguyễn Thị Phương Nam, người sáng lập và điều hành nhà hàng từ năm 2010. Bà có hơn 20 năm kinh nghiệm trong ngành ẩm thực Việt Nam.'),
('Chính sách đổi trả', 'Nhà hàng chấp nhận đổi trả món ăn trong vòng 15 phút nếu món không đúng yêu cầu hoặc có vấn đề về chất lượng. Khách hàng vui lòng thông báo cho nhân viên ngay khi phát hiện.'),
('Chương trình khách hàng thân thiết', 'Khách hàng tích lũy điểm thưởng khi đặt hàng. Mỗi 100,000đ tích được 10 điểm. 100 điểm đổi được voucher 50,000đ. Điểm có hiệu lực 12 tháng.'),
('Giờ cao điểm', 'Giờ cao điểm của nhà hàng: 11h30-13h30 (trưa) và 18h00-20h00 (tối). Khách đặt bàn trước để được phục vụ tốt nhất.'),
('Đặc sản nhà hàng', 'Các món đặc sản nổi tiếng: Cá lóc nướng trui, Lẩu mắm Phương Nam, Gỏi cuốn tôm thịt, Bánh xèo miền Tây. Tất cả đều được chế biến theo công thức gia truyền.'),
('Phương thức thanh toán', 'Nhà hàng chấp nhận thanh toán bằng tiền mặt, chuyển khoản ngân hàng, ví điện tử (MoMo, ZaloPay, VNPay), và thẻ tín dụng/ghi nợ.'),
('Chính sách giao hàng', 'Giao hàng trong bán kính 5km. Phí giao hàng 20,000đ. Miễn phí giao hàng cho đơn từ 200,000đ. Thời gian giao hàng trung bình 30-45 phút.'),
('Đặt bàn tiệc', 'Nhà hàng phục vụ đặt tiệc từ 10 người trở lên. Có menu tiệc cố định và menu tự chọn. Đặt trước ít nhất 2 ngày. Liên hệ: 0123 456 789 để được tư vấn chi tiết.')
ON DUPLICATE KEY UPDATE noi_dung = VALUES(noi_dung);
