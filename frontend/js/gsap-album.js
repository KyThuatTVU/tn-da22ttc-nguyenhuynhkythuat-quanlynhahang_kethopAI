// Register ScrollTrigger if gsap is loaded
if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

// Expose GSAP card layout animation function globally
window.initGSAPAnimationsForContainer = function(container) {
    if (!container || typeof gsap === 'undefined') return;

    const items = container.querySelectorAll('.gallery-item');
    if (items.length === 0) return;

    // Reset items to their initial animation state
    gsap.killTweensOf(items);

    // Stagger animation with 3D rotation entry immediately on render
    gsap.fromTo(items,
        {
            opacity: 0,
            y: 40,
            rotationX: 10,
            transformOrigin: "center bottom"
        },
        {
            opacity: 1,
            y: 0,
            rotationX: 0,
            duration: 0.6,
            ease: "power2.out",
            stagger: 0.05
        }
    );
};

// Animate category headers and static elements on scroll
document.addEventListener('DOMContentLoaded', () => {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    const sections = document.querySelectorAll('.scroll-mt-32');
    sections.forEach(section => {
        const title = section.querySelector('h2');
        const badge = section.querySelector('.count-badge');
        
        if (title) {
            gsap.fromTo(title, 
                { opacity: 0, y: 30, letterSpacing: "2px" },
                { 
                    opacity: 1, 
                    y: 0, 
                    letterSpacing: "0px", 
                    duration: 1.2, 
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: section,
                        start: "top 88%",
                        toggleActions: "play none none none"
                    }
                }
            );
        }

        if (badge) {
            gsap.fromTo(badge,
                { opacity: 0, scale: 0.8 },
                {
                    opacity: 1,
                    scale: 1,
                    duration: 1,
                    delay: 0.2,
                    ease: "elastic.out(1, 0.6)",
                    scrollTrigger: {
                        trigger: section,
                        start: "top 88%",
                        toggleActions: "play none none none"
                    }
                }
            );
        }
    });
});
