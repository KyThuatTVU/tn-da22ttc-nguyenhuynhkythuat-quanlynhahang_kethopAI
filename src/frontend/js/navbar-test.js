/* ==== Script 1 (tách từ navbar-test.html) ==== */
function updateInfo() {
            document.getElementById('screen-width').textContent = screen.width;
            document.getElementById('viewport-width').textContent = window.innerWidth;
            
            const navbar = document.getElementById('navbar');
            if (navbar) {
                document.getElementById('navbar-height').textContent = navbar.offsetHeight;
            }
        }
        
        updateInfo();
        window.addEventListener('resize', updateInfo);
        
        // Wait for navbar to load
        setTimeout(() => {
            const navbar = document.getElementById('navbar');
            if (navbar) {
                // Add visual indicators
                const buttons = navbar.querySelectorAll('.lg\\:hidden button, .lg\\:hidden a');
                buttons.forEach((btn, index) => {
                    btn.style.outline = '2px solid rgba(255, 0, 0, 0.3)';
                    btn.title = `Button ${index + 1}: ${btn.offsetWidth}x${btn.offsetHeight}px`;
                });
                
                console.log('✅ Navbar loaded');
                console.log('📏 Button sizes:');
                buttons.forEach((btn, index) => {
                    console.log(`  Button ${index + 1}: ${btn.offsetWidth}x${btn.offsetHeight}px`);
                });
            }
        }, 1000);
