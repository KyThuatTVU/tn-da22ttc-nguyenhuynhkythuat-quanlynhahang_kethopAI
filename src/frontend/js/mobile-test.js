/* ==== Script 1 (tách từ /mobile-test/) ==== */
// Display device info
        function updateDeviceInfo() {
            document.getElementById('screen-size').textContent = `${screen.width} x ${screen.height}`;
            document.getElementById('viewport-size').textContent = `${window.innerWidth} x ${window.innerHeight}`;
            document.getElementById('orientation').textContent = window.innerWidth > window.innerHeight ? 'Landscape' : 'Portrait';
            
            const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            document.getElementById('device-type').textContent = isMobile ? 'Mobile/Tablet' : 'Desktop';
            
            const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
            document.getElementById('touch-support').textContent = hasTouch ? 'Yes ✅' : 'No ❌';
        }

        // Check viewport meta tag
        function checkViewport() {
            const viewport = document.querySelector('meta[name="viewport"]');
            return viewport ? 'Found ✅' : 'Missing ❌';
        }

        // Check responsive CSS
        function checkResponsiveCSS() {
            const link = document.querySelector('link[href*="responsive.css"]');
            return link ? 'Loaded ✅' : 'Not loaded ❌';
        }

        // Check touch events
        function checkTouch() {
            return 'ontouchstart' in window ? 'Supported ✅' : 'Not supported ❌';
        }

        // Check font size
        function checkFontSize() {
            const body = window.getComputedStyle(document.body);
            const fontSize = parseFloat(body.fontSize);
            return fontSize >= 15 ? `${fontSize}px ✅` : `${fontSize}px ❌ (too small)`;
        }

        // Update test results
        function updateTestResults() {
            document.getElementById('viewport-check').textContent = checkViewport();
            document.getElementById('responsive-css-check').textContent = checkResponsiveCSS();
            document.getElementById('touch-check').textContent = checkTouch();
            document.getElementById('font-check').textContent = checkFontSize();
        }

        // Performance monitoring
        window.addEventListener('load', function() {
            setTimeout(() => {
                if (window.performance && window.performance.timing) {
                    const perfData = window.performance.timing;
                    const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
                    document.getElementById('load-time').textContent = `${pageLoadTime}ms`;
                }
                
                if (performance.memory) {
                    const memory = (performance.memory.usedJSHeapSize / 1048576).toFixed(2);
                    document.getElementById('memory-usage').textContent = `${memory} MB`;
                } else {
                    document.getElementById('memory-usage').textContent = 'N/A';
                }
            }, 100);
        });

        // Initialize
        updateDeviceInfo();
        updateTestResults();

        // Update on resize
        window.addEventListener('resize', updateDeviceInfo);
        window.addEventListener('orientationchange', updateDeviceInfo);
