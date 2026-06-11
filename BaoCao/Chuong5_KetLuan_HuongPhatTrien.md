# CHƯƠNG 5: KẾT LUẬN VÀ HƯỚNG PHÁT TRIỂN

## 1. Kết luận

### 1.1. Kết quả đạt được

Sau quá trình nghiên cứu và phát triển, đồ án đã hoàn thành mục tiêu xây dựng hệ thống quản lý nhà hàng tích hợp các tính năng gợi ý sản phẩm thông minh.

Về chức năng quản lý, hệ thống đã quản lý đầy đủ các nghiệp vụ của nhà hàng từ nhân sự, thực đơn, đơn hàng, kho nguyên liệu đến chấm công và tính lương. Giao diện được thiết kế riêng cho từng đối tượng sử dụng gồm khách hàng, nhân viên và quản trị viên. Hệ thống cũng tích hợp thanh toán online qua MoMo, giúp khách hàng thanh toán nhanh chóng và thuận tiện.

Về tính năng AI, đồ án đã ứng dụng thuật toán Apriori để phân tích giỏ hàng, tìm ra các món ăn thường được gọi cùng nhau. Bên cạnh đó, hệ thống sử dụng thuật toán SVD trong lọc cộng tác để gợi ý món ăn dựa trên sở thích người dùng. Đặc biệt, đồ án đã kết hợp nhiều phương pháp gợi ý như lọc cộng tác, lọc nội dung và độ phổ biến thành phương pháp Hybrid để tăng độ chính xác. Hệ thống cũng xây dựng chatbot với RAG để tư vấn khách hàng 24/7 về thực đơn, giá cả và các thông tin nhà hàng.

Về công nghệ, Backend sử dụng Node.js, Express.js kết hợp RESTful API và GraphQL để xử lý dữ liệu hiệu quả. Phần AI được tách riêng bằng Python, giúp dễ bảo trì và nâng cấp. Cơ sở dữ liệu MySQL được thiết kế theo mô hình quan hệ, đảm bảo tính toàn vẹn dữ liệu.

### 1.2. Ý nghĩa của đồ án

Về mặt thực tiễn, hệ thống giúp nhà hàng số hóa quy trình quản lý, giảm thiểu công việc thủ công. Đồ án nâng cao trải nghiệm khách hàng thông qua gợi ý món ăn phù hợp với sở thích cá nhân. Bên cạnh đó, hệ thống hỗ trợ chủ nhà hàng ra quyết định kinh doanh thông qua phân tích dữ liệu và báo cáo.

Về mặt học thuật, đồ án đã ứng dụng thành công các thuật toán Machine Learning vào bài toán thực tế. Hệ thống kết hợp nhiều công nghệ hiện đại như Node.js, Python, RAG và GraphQL trong một hệ thống thống nhất. Đồ án cũng là tài liệu tham khảo hữu ích cho các sinh viên nghiên cứu về hệ thống quản lý và AI.

### 1.3. Hạn chế

Mặc dù đã đạt được nhiều kết quả tích cực, đồ án vẫn còn một số hạn chế. Dữ liệu huấn luyện cho mô hình AI còn hạn chế, ảnh hưởng đến độ chính xác của gợi ý. Chatbot mới chỉ trả lời được các câu hỏi cơ bản, chưa xử lý tốt các tình huống phức tạp. Chức năng thanh toán mới chỉ hỗ trợ MoMo, chưa tích hợp thêm các cổng thanh toán khác. Giao diện mobile chưa được tối ưu hoàn toàn cho mọi kích thước màn hình.

## 2. Hướng phát triển

### 2.1. Nâng cấp tính năng AI

Về cải thiện thuật toán gợi ý, hệ thống cần thu thập thêm dữ liệu người dùng để huấn luyện mô hình chính xác hơn. Đồ án có thể thêm yếu tố thời gian như buổi sáng, trưa, tối vào thuật toán gợi ý để đề xuất món phù hợp với từng khung giờ. Hệ thống cũng nên phát triển tính năng gợi ý món ăn dựa trên thời tiết hoặc sự kiện đặc biệt để tăng trải nghiệm người dùng.

Về nâng cấp chatbot, cần tích hợp thêm ngữ cảnh lịch sử hội thoại để chatbot hiểu rõ hơn ý định khách hàng. Chatbot nên được cho phép xử lý đặt món và đặt bàn trực tiếp thông qua hội thoại thay vì chỉ tư vấn. Hệ thống cũng có thể hỗ trợ đa ngôn ngữ để phục vụ khách nước ngoài.

### 2.2. Mở rộng chức năng hệ thống

Về phát triển ứng dụng mobile, đồ án có thể xây dựng app mobile native cho iOS và Android để khách hàng sử dụng thuận tiện hơn. Ứng dụng nên tích hợp thông báo push để cập nhật trạng thái đơn hàng và chương trình khuyến mãi kịp thời.

Về tích hợp thanh toán, hệ thống cần thêm các cổng thanh toán như VNPay, ZaloPay, PayPal để khách hàng có nhiều lựa chọn. Ngoài ra, hệ thống nên hỗ trợ thanh toán bằng ví điện tử và quét mã QR để tăng tính tiện lợi.

Về quản lý khách hàng thân thiết, đồ án có thể xây dựng hệ thống tích điểm và xếp hạng thành viên. Hệ thống nên tự động gửi voucher, ưu đãi cho khách hàng thân thiết để giữ chân và thu hút khách quay lại.

### 2.3. Tối ưu hiệu năng

Về mặt kỹ thuật, hệ thống cần áp dụng caching để giảm thời gian truy vấn dữ liệu. Các truy vấn SQL cần được tối ưu để xử lý nhanh hơn khi dữ liệu tăng lên. Đồ án nên triển khai hệ thống trên cloud như AWS hoặc Azure để dễ mở rộng khi lượng người dùng tăng.

Về bảo mật, hệ thống cần mã hóa thông tin thanh toán và dữ liệu nhạy cảm của khách hàng. Tài khoản quản trị viên nên thêm xác thực hai yếu tố để tăng độ bảo mật. Hệ thống cũng cần kiểm tra và cập nhật các lỗ hổng bảo mật định kỳ.

### 2.4. Phát triển tính năng phân tích dữ liệu

Về Dashboard nâng cao, hệ thống cần xây dựng biểu đồ trực quan cho doanh thu, món bán chạy và khách hàng mới. Đồ án có thể phân tích xu hướng kinh doanh theo thời gian để dự đoán nhu cầu. Hệ thống cũng nên có báo cáo chi tiết về hiệu suất nhân viên và ca làm việc để quản lý dễ dàng theo dõi.

Về dự báo kinh doanh, đồ án có thể ứng dụng thuật toán dự báo để dự đoán doanh thu tháng tới. Hệ thống nên gợi ý nhập nguyên liệu dựa trên xu hướng tiêu thụ để tránh thừa hoặc thiếu hàng. Ngoài ra, hệ thống có thể phân tích món ăn nào nên giữ lại, món nào nên loại bỏ khỏi thực đơn dựa trên dữ liệu bán hàng.

## 3. Tổng kết

Đồ án đã hoàn thành mục tiêu xây dựng một hệ thống quản lý nhà hàng hiện đại, tích hợp AI để cá nhân hóa trải nghiệm người dùng. Hệ thống không chỉ giúp nhà hàng quản lý hiệu quả mà còn nâng cao sự hài lòng của khách hàng thông qua các tính năng gợi ý thông minh và chatbot tự động.

Với những hướng phát triển đã đề xuất, hệ thống có thể mở rộng thêm nhiều tính năng và áp dụng cho nhiều loại hình nhà hàng khác nhau. Đây là nền tảng tốt để tiếp tục nghiên cứu và phát triển các ứng dụng AI trong lĩnh vực dịch vụ ăn uống.
