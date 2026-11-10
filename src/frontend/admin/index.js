/* ==== Script 1 (tách từ index.html) ==== */
// Redirect to new dashboard
        window.location.href = 'dashboard.html';

/* ==== Script 2 (tách từ index.html) ==== */
// Check admin authentication
        async function checkAuth() {
            try {
                const response = await fetch('http://localhost:3000/api/admin-auth/check-session', {
                    credentials: 'include'
                });
                const data = await response.json();
                
                if (!data.isAuthenticated) {
                    window.location.href = 'dang-nhap-admin.html';
                    return;
                }
                
                console.log('Admin logged in:', data.data);
            } catch (error) {
                console.error('Error checking auth:', error);
                window.location.href = 'dang-nhap-admin.html';
            }
        }
        
        // Check on page load
        checkAuth();
        
        // Sidebar active state
        document.querySelectorAll('.sidebar-link').forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
                this.classList.add('active');
            });
        });
