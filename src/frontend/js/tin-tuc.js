/* ==== Script 1 (tách từ /tin-tuc/) ==== */
// Scroll to Top functionality
        (function() {
            const scrollBtn = document.getElementById('back-to-top');
            if (!scrollBtn) return;
            
            function checkScroll() {
                if (window.pageYOffset > 300) {
                    scrollBtn.style.opacity = '1';
                    scrollBtn.style.visibility = 'visible';
                } else {
                    scrollBtn.style.opacity = '0';
                    scrollBtn.style.visibility = 'hidden';
                }
            }
            
            window.addEventListener('scroll', checkScroll);
            checkScroll();
            
            scrollBtn.addEventListener('click', function(e) {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        })();
