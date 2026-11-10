/* ==== Script 1 (tách từ /tin-tuc-chi-tiet/) ==== */
// Smooth scroll animations
        gsap.registerPlugin(ScrollTrigger);

        gsap.from('article', {
            opacity: 0,
            y: 50,
            duration: 1,
            scrollTrigger: {
                trigger: 'article',
                start: 'top 80%'
            }
        });

        gsap.from('aside > div', {
            opacity: 0,
            x: 50,
            duration: 0.8,
            stagger: 0.2,
            scrollTrigger: {
                trigger: 'aside',
                start: 'top 80%'
            }
        });
