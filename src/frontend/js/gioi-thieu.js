/* ==== Script 1 (tách từ gioi-thieu.html) ==== */
// Lightbox Gallery Script
        const galleryImages = [
            { src: 'images/g1.jpg', alt: 'Logo Nhà hàng' },
            { src: 'images/g2.jpg', alt: 'Không gian nhà hàng' },
            { src: 'images/g3.jpg', alt: 'Khu vực phục vụ' },
            { src: 'images/g10.jpg', alt: 'Không gian bên trong' },
            { src: 'images/g5.jpg', alt: 'Món ăn đặc sản' },
            { src: 'images/g6.jpg', alt: 'Bàn ăn' },
            { src: 'images/g7.jpg', alt: 'Khu vực tiếp khách' },
            { src: 'images/g8.jpg', alt: 'Món ăn' },
            { src: 'images/g9.jpg', alt: 'Không gian xanh' },
            { src: 'images/g4.jpg', alt: 'Góc nhà hàng' },
            { src: 'images/g11.jpg', alt: 'Món ăn đặc biệt' }
        ];

        let currentIndex = 0;
        const lightbox = document.getElementById('lightbox');
        const lightboxImg = document.getElementById('lightbox-img');
        const lightboxCounter = document.getElementById('lightbox-counter');
        const lightboxThumbnails = document.getElementById('lightbox-thumbnails');

        // Open lightbox
        document.querySelectorAll('.gallery-item').forEach(item => {
            item.addEventListener('click', function () {
                currentIndex = parseInt(this.dataset.index);
                showLightbox();
            });
        });

        // Close lightbox
        document.getElementById('lightbox-close').addEventListener('click', closeLightbox);
        lightbox.addEventListener('click', function (e) {
            if (e.target === lightbox) closeLightbox();
        });

        // Navigation
        document.getElementById('lightbox-prev').addEventListener('click', () => {
            currentIndex = (currentIndex - 1 + galleryImages.length) % galleryImages.length;
            updateLightbox();
        });

        document.getElementById('lightbox-next').addEventListener('click', () => {
            currentIndex = (currentIndex + 1) % galleryImages.length;
            updateLightbox();
        });

        // Keyboard navigation
        document.addEventListener('keydown', function (e) {
            if (!lightbox.classList.contains('hidden')) {
                if (e.key === 'ArrowLeft') document.getElementById('lightbox-prev').click();
                if (e.key === 'ArrowRight') document.getElementById('lightbox-next').click();
                if (e.key === 'Escape') closeLightbox();
            }
        });

        function showLightbox() {
            lightbox.classList.remove('hidden');
            lightbox.classList.add('flex');
            document.body.style.overflow = 'hidden';
            updateLightbox();
            createThumbnails();
        }

        function closeLightbox() {
            lightbox.classList.add('hidden');
            lightbox.classList.remove('flex');
            document.body.style.overflow = '';
        }

        function updateLightbox() {
            lightboxImg.src = galleryImages[currentIndex].src;
            lightboxImg.alt = galleryImages[currentIndex].alt;
            lightboxCounter.textContent = `${currentIndex + 1} / ${galleryImages.length}`;
            updateThumbnailActive();
        }

        function createThumbnails() {
            if (lightboxThumbnails.children.length > 0) return;

            galleryImages.forEach((img, index) => {
                const thumb = document.createElement('img');
                thumb.src = img.src;
                thumb.alt = img.alt;
                thumb.className = 'w-16 h-16 object-cover cursor-pointer border-2 border-transparent hover:border-orange-500 transition-all';
                thumb.dataset.index = index;
                thumb.addEventListener('click', () => {
                    currentIndex = index;
                    updateLightbox();
                });
                lightboxThumbnails.appendChild(thumb);
            });
        }

        function updateThumbnailActive() {
            const thumbs = lightboxThumbnails.querySelectorAll('img');
            thumbs.forEach((thumb, index) => {
                if (index === currentIndex) {
                    thumb.classList.add('border-orange-500');
                    thumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                } else {
                    thumb.classList.remove('border-orange-500');
                }
            });
        }

/* ==== Script 2 (tách từ gioi-thieu.html) ==== */
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
                    scrollBtn.classList.add('show');
                } else {
                    scrollBtn.style.opacity = '0';
                    scrollBtn.style.visibility = 'hidden';
                    scrollBtn.classList.remove('show');
                }
            }
            
            window.addEventListener('scroll', checkScroll);
            
            // Check on load
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
