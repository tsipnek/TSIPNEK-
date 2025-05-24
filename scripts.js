
document.addEventListener('DOMContentLoaded', () => {
    // Initialize GSAP animations
    gsap.registerPlugin(ScrollTrigger);
    
    const carousel = document.querySelector('.carousel');
    const carouselItems = document.querySelectorAll('.carousel-item');
    let autoScrollTween;
    let totalWidth, itemWidth; // Moved to outer scope for access in click handler

    // Clone items for infinite loop
    const cloneItems = () => {
        const itemsToClone = Array.from(carouselItems);
        itemsToClone.forEach(item => {
            const clone = item.cloneNode(true);
            carousel.appendChild(clone);
        });
    };

    // Initialize carousel
    const initCarousel = () => {
        cloneItems();
        
        // Calculate total width
        const firstItem = carouselItems[0];
        itemWidth = firstItem.offsetWidth + parseInt(getComputedStyle(firstItem).marginRight);
        totalWidth = itemWidth * carouselItems.length;
        
        // Set initial position
        gsap.set(carousel, { scrollTo: 0 });

        // Create infinite scroll animation
        autoScrollTween = gsap.to(carousel, {
            scrollTo: {
                x: totalWidth // Scroll to end of original items
            },
            duration: carouselItems.length * 10, // 4 seconds per item DURATION FOR CAROUSEL
            ease: "none",
            repeat: -1,
            onRepeat: () => {
                // Jump back to start position without animation
                gsap.set(carousel, { scrollTo: 0 });
            }
        });

        // Pause/resume on interaction
        carousel.addEventListener('mouseenter', () => autoScrollTween.pause());
        carousel.addEventListener('mouseleave', () => autoScrollTween.play());
        carousel.addEventListener('touchstart', () => autoScrollTween.pause());
        carousel.addEventListener('touchend', () => autoScrollTween.play());
    };

    // Initialize the carousel
    initCarousel();

    // Updated click handler with AI modifications
    carouselItems.forEach(item => {
        item.addEventListener('click', () => {
            // Pause the auto-scroll animation
            autoScrollTween.pause();
            
            // Calculate center position for clicked item
            const centerPos = item.offsetLeft - (carousel.offsetWidth - item.offsetWidth) / 2;
            
            // Animate to the clicked item
            gsap.to(carousel, {
                scrollTo: { x: centerPos },
                duration: 0.8,
                ease: 'power3.out',
                onComplete: () => {
                    // Update the auto-scroll tween to start from this position
                    const remainingScroll = totalWidth - centerPos;
                    const remainingDuration = (remainingScroll / totalWidth) * (carouselItems.length * 10);
                    
                    autoScrollTween.kill(); // Kill the old tween
                    
                    // Create new auto-scroll tween from current position
                    autoScrollTween = gsap.to(carousel, {
                        scrollTo: {
                            x: totalWidth
                        },
                        duration: remainingDuration,
                        ease: "none",
                        repeat: -1,
                        onRepeat: () => {
                            gsap.set(carousel, { scrollTo: 0 });
                        }
                    });
                }
            });
        });
    });

    // Keep this scroll listener for active item detection
    carousel.addEventListener('scroll', () => {
        const centerPos = carousel.scrollLeft + (carousel.offsetWidth / 2);
        
        document.querySelectorAll('.carousel-item').forEach((item, index) => {
            const itemCenter = item.offsetLeft + (item.offsetWidth / 2);
            if (Math.abs(centerPos - itemCenter) < item.offsetWidth) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    });

    // Mouse drag functionality
    let isDragging = false;
    let startX, scrollLeft;
    
    carousel.addEventListener('mousedown', (e) => {
        isDragging = true;
        startX = e.pageX - carousel.offsetLeft;
        scrollLeft = carousel.scrollLeft;
        carousel.style.cursor = 'grabbing';
        clearTimeout(autoScrollTimeout);
    });

    carousel.addEventListener('mouseleave', () => {
        isDragging = false;
        carousel.style.cursor = 'grab';
    });

    carousel.addEventListener('mouseup', () => {
        isDragging = false;
        carousel.style.cursor = 'grab';
    });

    carousel.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        e.preventDefault();
        const x = e.pageX - carousel.offsetLeft;
        const walk = (x - startX) * 2;
        carousel.scrollLeft = scrollLeft - walk;
    });

    // Add keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') {
            gsap.to(carousel, {
                scrollTo: { x: carousel.scrollLeft - carousel.offsetWidth * 0.6 },
                duration: 0.6,
                ease: 'power3.out'
            });
        }
        if (e.key === 'ArrowRight') {
            gsap.to(carousel, {
                scrollTo: { x: carousel.scrollLeft + carousel.offsetWidth * 0.6 },
                duration: 0.6,
                ease: 'power3.out'
            });
        }
    });

    // Add swipe functionality for mobile
    let touchStartX = 0;
    let touchEndX = 0;

    carousel.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    });

    carousel.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    });

    function handleSwipe() {
        const swipeThreshold = 50;
        const swipeDistance = touchStartX - touchEndX;

        if (Math.abs(swipeDistance) < swipeThreshold) return;

        const scrollAmount = carousel.offsetWidth * 0.6;

        gsap.to(carousel, {
            scrollTo: { 
                x: swipeDistance > 0 
                    ? carousel.scrollLeft + scrollAmount 
                    : carousel.scrollLeft - scrollAmount
            },
            duration: 0.6,
            ease: 'power3.out'
        });
    }

    // Add these new event listeners to handle auto-scroll pause/resume
    let autoScrollTimeout;
    const autoScrollDelay = 3000;
    carousel.addEventListener('mousedown', () => clearTimeout(autoScrollTimeout));
    carousel.addEventListener('mouseup', () => autoScrollTimeout = setTimeout(autoScroll, autoScrollDelay));
    carousel.addEventListener('touchstart', () => clearTimeout(autoScrollTimeout));
    carousel.addEventListener('touchend', () => autoScrollTimeout = setTimeout(autoScroll, autoScrollDelay));

    // Cleanup on unmount (if using SPA framework)
    window.addEventListener('beforeunload', () => {
        clearTimeout(autoScrollTimeout);
        gsap.killTweensOf(carousel);
    });
    
    // Add click handlers for navigation items
    const workNav = document.querySelector('.nav-item:first-child');
    const letterNav = document.querySelector('.nav-item:last-child');

    workNav.addEventListener('click', () => {
        gsap.to(window, {
            duration: 1.5,
            scrollTo: {
                y: '#about',
                offsetY: 50
            },
            ease: 'power3.out'
        });
    });

    letterNav.addEventListener('click', () => {
        gsap.to(window, {
            duration: 1.5,
            scrollTo: {
                y: '#contact',
                offsetY: 50
            },
            ease: 'power3.out'
        });
    });

    // Add hover effect to indicate clickable items
    [workNav, letterNav].forEach(item => {
        item.style.cursor = 'pointer';
    });
    
    // Animate hero elements
    const heroTL = gsap.timeline({ defaults: { duration: 1, ease: 'power3.out' } });
    heroTL.to('.hero h1', { opacity: 1, y: 0, delay: 0.2 })
            .to('.hero h2', { opacity: 1, y: 0 }, '-=0.7')
    
    // Animate sections as they come into view
    gsap.to('.section-header', {
        scrollTrigger: {
            trigger: '.section-header',
            start: 'top 80%',
        },
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power3.out'
    });
    
    // Animate product cards with stagger
    gsap.to('.product-card', {
        scrollTrigger: {
            trigger: '.products-grid',
            start: 'top 80%',
        },
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.05,
        ease: 'power3.out'
    });
    
    // Animate accordions with stagger
    gsap.to('.accordion', {
        scrollTrigger: {
            trigger: '.faq-section',
            start: 'top 80%',
        },
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power3.out'
    });

    
    // Add 3D tilt effect to cards
    const cards = document.querySelectorAll('.product-card');
    cards.forEach(card => {
        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const xPercent = x / rect.width - 0.5;
            const yPercent = y / rect.height - 0.5;
            
            gsap.to(card, {
                rotationY: xPercent * 10,
                rotationX: yPercent * -10,
                duration: 0.5,
                ease: 'power1.out'
            });
        });
        
        card.addEventListener('mouseleave', () => {
            gsap.to(card, {
                rotationY: 0,
                rotationX: 0,
                duration: 0.7,
                ease: 'elastic.out(1, 0.5)'
            });
        });
    });

    // Replace the existing mobile touch interaction code with this:
    if (window.matchMedia("(max-width: 768px)").matches) {
        const productCards = document.querySelectorAll('.product-card:not(.no-hover)');
        
        productCards.forEach(card => {
            let timeoutId;
            
            card.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Add touch-active class
                card.classList.add('touch-active');
                
                // Clear any existing timeout
                if (timeoutId) clearTimeout(timeoutId);
                
                // Remove touch-active class after 3 seconds
                timeoutId = setTimeout(() => {
                    card.classList.remove('touch-active');
                }, 2000); // 2 seconds
            });
        });
    }
    
    // Accordion functionality
    const accordions = document.querySelectorAll('.accordion');
    accordions.forEach(accordion => {
        const header = accordion.querySelector('.accordion-header');
        header.addEventListener('click', () => {
            accordion.classList.toggle('active');
        });
    });
    
    // Create scroll-triggered animations for navigation
    window.addEventListener('scroll', () => {
        const scrollPosition = window.scrollY;
        if (scrollPosition > 100) {
            document.querySelector('.nav').style.boxShadow = '0 30px 60px -15px rgba(0, 0, 0, 0.07)';
            gsap.to('.nav', { padding: '8px', duration: 0.3 });
        } else {
            document.querySelector('.nav').style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.05)';
            gsap.to('.nav', { padding: '10px', duration: 0.3 });
        }
    });
    gsap.fromTo('.footer', 
{ opacity: 0 }, // starting state
{
    scrollTrigger: {
        trigger: '.footer',
        start: 'top 90%', // trigger animation when footer is 90% in view
        toggleActions: 'play none none reverse'
    },
    opacity: 1,
    duration: 3,
    ease: 'power2.out'
}
);

const logoItem = document.querySelector('.nav-item.logo');
logoItem.style.cursor = 'pointer';
logoItem.addEventListener('click', () => {
gsap.to(window, {
    duration: 3,
    scrollTo: {
        y: 0,
        autoKill: false
    },
    ease: "power4.out"
});
});
window.addEventListener('scroll', () => {
const scrollPosition = window.scrollY;
const nav = document.querySelector('.nav');

if (scrollPosition > 100) {
    gsap.to('.nav', { 
        padding: '8px', 
        width: 'auto',
        duration: 0.4,
        boxShadow: '0 35px 60px -15px rgba(0, 0, 0, 0.2)',
        ease: 'power2.out'
    });
} else {
    gsap.to('.nav', { 
        padding: '10px',
        width: '90%',
        duration: 0.4,
        boxShadow: '0 35px 60px -15px rgba(0, 0, 0, 0.2)',
        ease: 'power2.out'
    });
}
});

// Initial animation when page loads
gsap.fromTo('.nav',
{
    width: '90%',
    opacity: 0,
    y: -20
},
{
    opacity: 1,
    y: 0,
    duration: 1,
    ease: 'power3.out'
}
);
});