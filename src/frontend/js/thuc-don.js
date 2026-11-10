/* ==== Script 1 (tách từ thuc-don.html) ==== */
// Scroll to Top functionality
        (function() {
            const scrollBtn = document.getElementById('back-to-top');
            
            if (!scrollBtn) {
                console.error('Scroll button not found!');
                return;
            }
            
            console.log('Scroll to top button initialized');
            
            // Show/hide button based on scroll position
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
            
            // Smooth scroll to top when clicked
            scrollBtn.addEventListener('click', function(e) {
                e.preventDefault();
                console.log('Scroll to top clicked!');
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            });
        })();
