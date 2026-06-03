// Summer Flower Effect JavaScript - Hiệu ứng hoa Osaka Vàng (Hè Miền Tây) rơi
// Tự động tải từ admin-layout.js và điều khiển qua Admin Settings
(function() {
    'use strict';

    // Cấu hình hiệu ứng
    const config = {
        petalCount: 45, // Số lượng cánh hoa vừa phải để không bị che khuất tầm nhìn Admin
        minSize: 8,     // Kích thước nhỏ nhất (px)
        maxSize: 18,    // Kích thước lớn nhất (px)
        minDuration: 8, // Thời gian rơi nhanh nhất (s)
        maxDuration: 16,// Thời gian rơi chậm nhất (s)
        minDelay: 0,
        maxDelay: 10,
        // Các ký tự trang trí kết hợp thêm để tăng tính sinh động
        specialChars: ['✨', '🌼', '✿', '💛']
    };

    let isEffectEnabled = false;
    let isInitialized = false;

    // Nhúng CSS cho hiệu ứng cánh hoa rơi
    function injectStyles() {
        if (document.getElementById('osaka-flower-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'osaka-flower-styles';
        style.textContent = `
            /* Osaka Container */
            .osaka-container {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
                z-index: 10; /* Đặt dưới các pop-up/sidebar/dropdown của admin */
                overflow: hidden;
            }

            /* Cánh hoa thiết kế bằng CSS */
            .osaka-petal {
                position: absolute;
                top: -20px;
                opacity: 0.95;
                user-select: none;
                animation: osakaFall linear infinite;
                filter: drop-shadow(0 2px 4px rgba(245, 127, 23, 0.3));
            }

            /* Các loại hình dáng cánh hoa khác nhau */
            .osaka-shape-1 {
                border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
                background: linear-gradient(135deg, #fff59d 0%, #fdd835 60%, #f57f17 100%);
            }

            .osaka-shape-2 {
                border-radius: 50% 0 50% 50%;
                background: linear-gradient(135deg, #ffeb3b 0%, #ffc107 70%, #ff8f00 100%);
            }

            .osaka-shape-3 {
                border-radius: 60% 40% 60% 40%;
                background: linear-gradient(135deg, #fffde7 0%, #fee082 50%, #f57f17 100%);
            }

            /* Phần tử emoji/sparkle */
            .osaka-char {
                font-family: sans-serif;
                text-shadow: 0 0 6px rgba(253, 216, 53, 0.6);
            }

            /* Hoạt ảnh rơi 1: Lắc lư bình thường */
            @keyframes osakaFall {
                0% {
                    transform: translateY(-20px) translateX(0) rotate(0deg) scale(1);
                    opacity: 0;
                }
                10% {
                    opacity: 0.9;
                }
                25% {
                    transform: translateY(25vh) translateX(35px) rotate(45deg) scale(0.95);
                }
                50% {
                    transform: translateY(50vh) translateX(-25px) rotate(110deg) scale(1.05);
                }
                75% {
                    transform: translateY(75vh) translateX(45px) rotate(180deg) scale(0.9);
                }
                90% {
                    opacity: 0.8;
                }
                100% {
                    transform: translateY(102vh) translateX(15px) rotate(240deg) scale(0.95);
                    opacity: 0;
                }
            }

            /* Hoạt ảnh rơi 2: Lắc lư xoay tròn nhiều gió */
            @keyframes osakaFallSway {
                0% {
                    transform: translateY(-20px) translateX(0) rotate(0deg) rotateY(0deg);
                    opacity: 0;
                }
                10% {
                    opacity: 0.95;
                }
                30% {
                    transform: translateY(30vh) translateX(-45px) rotate(90deg) rotateY(180deg);
                }
                60% {
                    transform: translateY(60vh) translateX(55px) rotate(180deg) rotateY(360deg);
                }
                90% {
                    opacity: 0.7;
                    transform: translateY(90vh) translateX(-25px) rotate(270deg) rotateY(540deg);
                }
                100% {
                    transform: translateY(102vh) translateX(-10px) rotate(320deg) rotateY(720deg);
                    opacity: 0;
                }
            }

            /* Phân phối hoạt ảnh ngẫu nhiên */
            .osaka-petal:nth-child(even) {
                animation-timing-function: ease-in-out;
            }

            .osaka-petal:nth-child(odd) {
                animation-timing-function: cubic-bezier(0.25, 0.46, 0.45, 0.94);
            }

            .osaka-petal:nth-child(3n) {
                animation-name: osakaFallSway;
            }
        `;
        document.head.appendChild(style);
    }

    // Tạo container
    function createContainer() {
        let container = document.querySelector('.osaka-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'osaka-container';
            document.body.appendChild(container);
        }
        return container;
    }

    // Tạo một cánh hoa đơn lẻ
    function createPetal(container) {
        if (!isEffectEnabled) return;

        const el = document.createElement('div');
        
        // Random xem là cánh hoa CSS hay Emoji trang trí (tỉ lệ 80% cánh hoa CSS, 20% emoji)
        const isChar = Math.random() < 0.22;
        
        const size = config.minSize + Math.random() * (config.maxSize - config.minSize);
        const left = Math.random() * 100;
        const duration = config.minDuration + Math.random() * (config.maxDuration - config.minDuration);
        const delay = Math.random() * config.maxDelay;
        const opacity = 0.7 + Math.random() * 0.3;

        if (isChar) {
            el.className = 'osaka-petal osaka-char';
            const char = config.specialChars[Math.floor(Math.random() * config.specialChars.length)];
            el.textContent = char;
            el.style.fontSize = `${size + 4}px`;
        } else {
            el.className = `osaka-petal osaka-shape-${Math.floor(Math.random() * 3) + 1}`;
            el.style.width = `${size * 1.1}px`;
            el.style.height = `${size * 1.5}px`;
        }

        // Áp dụng phong cách ngẫu nhiên
        el.style.left = `${left}%`;
        el.style.animationDuration = `${duration}s`;
        el.style.animationDelay = `${delay}s`;
        el.style.opacity = opacity;

        container.appendChild(el);

        // Tự động dọn dẹp và tái sinh cánh hoa sau khi hoàn tất hoạt ảnh
        const totalMs = (duration + delay) * 1000;
        setTimeout(() => {
            if (el.parentNode && isEffectEnabled) {
                el.remove();
                createPetal(container);
            }
        }, totalMs);
    }

    // Khởi động hiệu ứng
    function startEffect() {
        isEffectEnabled = true;
        injectStyles();
        const container = createContainer();
        container.innerHTML = ''; // Xóa sạch cánh cũ nếu có
        
        // Sinh tuần tự các cánh hoa để so le thời gian
        for (let i = 0; i < config.petalCount; i++) {
            setTimeout(() => {
                if (isEffectEnabled) {
                    createPetal(container);
                }
            }, i * 150); // Khoảng cách sinh so le 150ms
        }
        console.log('🌼 Đã bật hiệu ứng hoa Osaka Vàng rơi');
    }

    // Dừng hiệu ứng
    function stopEffect() {
        isEffectEnabled = false;
        const container = document.querySelector('.osaka-container');
        if (container) {
            container.remove();
        }
        console.log('🌼 Đã dừng hiệu ứng hoa Osaka Vàng');
    }

    // Kiểm tra cài đặt và khởi tạo
    async function checkSettingsAndInit() {
        try {
            const apiUrl = window.API_URL || 'http://localhost:3000/api';
            const response = await fetch(`${apiUrl}/settings`);
            const result = await response.json();
            
            if (result.success && result.data) {
                const isEnabled = result.data.hieu_ung_hoa_osaka_admin === '1';
                isEffectEnabled = isEnabled;
            } else {
                isEffectEnabled = true; // Mặc định bật nếu không lấy được cài đặt
            }
        } catch (error) {
            console.log('🌼 Lỗi tải cấu hình, dùng mặc định (Bật)');
            isEffectEnabled = true; 
        }

        if (isEffectEnabled && !isInitialized) {
            isInitialized = true;
            startEffect();
        }
    }

    // Khởi chạy khi DOM sẵn sàng
    function init() {
        checkSettingsAndInit();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Xuất ra global để trang settings hoặc layout có thể gọi trực tiếp
    window.OsakaFlowerEffect = {
        start: function() {
            if (!isEffectEnabled) {
                startEffect();
            }
        },
        stop: stopEffect,
        toggle: function() {
            if (isEffectEnabled) {
                stopEffect();
            } else {
                startEffect();
            }
            return isEffectEnabled;
        },
        refresh: function() {
            // Tải lại cài đặt từ DB và áp dụng ngay lập tức
            checkSettingsAndInit();
        }
    };
})();
