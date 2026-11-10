/* ==== Script 1 (tách từ /thuc-don/) ==== */
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

/* ==== Glassmorphism 3D: tilt card + light follows the pointer ==== */
(function () {
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const MAX_TILT = 7;
    let frame = null;
    let activeCard = null;
    let pointerX = 0;
    let pointerY = 0;

    if (!finePointer.matches) return;

    function findCard(node) {
        return node instanceof Element ? node.closest('#menu-products .dish-card') : null;
    }

    function resetCard(card) {
        if (!card) return;
        card.style.removeProperty('--rx');
        card.style.removeProperty('--ry');
        card.style.removeProperty('--mx');
        card.style.removeProperty('--my');
    }

    function updateCard() {
        frame = null;
        if (!activeCard) return;

        const rect = activeCard.getBoundingClientRect();
        if (!rect.width || !rect.height) return;

        const px = Math.min(Math.max((pointerX - rect.left) / rect.width, 0), 1);
        const py = Math.min(Math.max((pointerY - rect.top) / rect.height, 0), 1);

        activeCard.style.setProperty('--ry', `${((px - 0.5) * MAX_TILT * 2).toFixed(2)}deg`);
        activeCard.style.setProperty('--rx', `${((0.5 - py) * MAX_TILT * 2).toFixed(2)}deg`);
        activeCard.style.setProperty('--mx', `${(px * 100).toFixed(2)}%`);
        activeCard.style.setProperty('--my', `${(py * 100).toFixed(2)}%`);
    }

    document.addEventListener('pointermove', (event) => {
        if (reduceMotion.matches) return;

        const card = findCard(event.target);
        if (card !== activeCard) {
            resetCard(activeCard);
            activeCard = card;
        }
        if (!activeCard) return;

        pointerX = event.clientX;
        pointerY = event.clientY;
        if (frame === null) frame = requestAnimationFrame(updateCard);
    }, { passive: true });

    document.addEventListener('pointerout', (event) => {
        const card = findCard(event.target);
        if (!card) return;
        if (event.relatedTarget instanceof Node && card.contains(event.relatedTarget)) return;

        resetCard(card);
        if (activeCard === card) activeCard = null;
    }, { passive: true });
})();
