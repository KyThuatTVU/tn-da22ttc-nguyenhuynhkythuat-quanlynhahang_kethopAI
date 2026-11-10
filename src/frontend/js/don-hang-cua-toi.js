/* ==== Script 1 (tách từ don-hang-cua-toi.html) ==== */
// Animate page header only (không animate order cards vì my-orders.js đã xử lý)
        document.addEventListener('DOMContentLoaded', () => {
            gsap.from('.text-center.mb-8', {
                y: 30,
                opacity: 0,
                duration: 0.6,
                ease: 'power3.out'
            });

            gsap.from('.filter-buttons', {
                y: 20,
                opacity: 0,
                duration: 0.6,
                delay: 0.2,
                ease: 'power3.out'
            });
        });
