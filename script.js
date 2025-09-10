class InfiniteMarquee {
    constructor(selector, options = {}) {
        this.marquee = document.querySelector(selector);
        if (!this.marquee) return;

        this.content = this.marquee.querySelector('.marquee-content');
        if (!this.content) return;

        this.speed = options.speed || 60; // pixels per second
        this.isRunning = false;
        this.animationId = null;
        this.currentPosition = 0;

        this.init();
    }

    init() {
        // Clone the content to create seamless loop
        this.cloneContent();
        // Set initial position
        this.resetPosition();
        // Start the animation
        this.start();

        // Handle visibility change to pause/resume for performance
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pause();
            } else {
                this.start();
            }
        });

        // Handle window resize
        window.addEventListener('resize', () => {
            this.handleResize();
        });
    }

    cloneContent() {
        // Clone the original content multiple times for seamless loop
        const originalContent = this.content.innerHTML;
        // Create enough clones to ensure smooth infinite scroll
        this.content.innerHTML = originalContent + originalContent + originalContent;
    }

    resetPosition() {
        // Start with content already visible (position 0 means fully visible)
        this.currentPosition = 0;
        this.content.style.transform = `translateX(${this.currentPosition}px)`;
    }

    handleResize() {
        // Keep current relative position on resize
        // Don't reset to avoid jumping during resize
    }

    animate() {
        if (!this.isRunning) return;

        // Move left at consistent speed
        this.currentPosition -= this.speed / 60; // 60fps

        // Calculate when to reset (when first clone is completely off-screen)
        const contentWidth = this.content.offsetWidth / 3; // Divided by 3 because we have 3 copies

        // Reset position when the first set of content has moved completely left
        if (this.currentPosition <= -contentWidth) {
            this.currentPosition = 0; // Reset to fully visible position
        }

        // Apply transform
        this.content.style.transform = `translateX(${this.currentPosition}px)`;

        // Continue animation
        this.animationId = requestAnimationFrame(() => this.animate());
    }

    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.animate();
        }
    }

    pause() {
        this.isRunning = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    updateSpeed(newSpeed) {
        this.speed = newSpeed;
    }

    destroy() {
        this.pause();
        window.removeEventListener('resize', this.handleResize);
        document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    }
}

// Floating Images Screensaver Class
class FloatingImages {
    constructor() {
        this.images = [];
        this.animationId = null;
        this.isActive = true;
        this.heroSection = document.querySelector('.hero');
        this.heroImages = document.querySelectorAll('.hero-images img');

        // Bind methods to preserve context
        this.handleScroll = this.handleScroll.bind(this);
        this.handleResize = this.handleResize.bind(this);

        this.init();
    }

    init() {
        if (!this.heroImages.length) {
            console.log('No hero images found');
            return;
        }

        console.log(`Found ${this.heroImages.length} hero images`);

        // Wait a bit for images to load
        setTimeout(() => {
            // Initialize each image
            this.heroImages.forEach((img, index) => {
                this.setupImage(img, index);
            });

            // Start animation
            this.animate();

            // Handle scroll for fade out effect
            this.handleScroll();
            window.addEventListener('scroll', this.handleScroll);
            window.addEventListener('resize', this.handleResize);
        }, 100);
    }

    setupImage(img, index) {
        // Make images absolutely positioned
        img.style.position = 'fixed';
        img.style.zIndex = '10';
        img.style.pointerEvents = 'none';
        img.style.transition = 'opacity 0.3s ease';

        // Force image dimensions if not loaded
        if (!img.width || !img.height) {
            img.style.width = '60px';
            img.style.height = '60px';
        }

        // Get image dimensions
        const imgWidth = img.offsetWidth || 60;
        const imgHeight = img.offsetHeight || 60;

        // Create image object with random initial position and velocity
        const imageObj = {
            element: img,
            width: imgWidth,
            height: imgHeight,
            x: Math.random() * Math.max(100, window.innerWidth - imgWidth),
            y: Math.random() * Math.max(100, window.innerHeight - imgHeight),
            vx: (Math.random() - 0.5) * 3, // Random velocity between -1.5 and 1.5
            vy: (Math.random() - 0.5) * 3,
            minSpeed: 1,
            maxSpeed: 2
        };

        // Ensure minimum speed
        if (Math.abs(imageObj.vx) < imageObj.minSpeed) {
            imageObj.vx = imageObj.vx >= 0 ? imageObj.minSpeed : -imageObj.minSpeed;
        }
        if (Math.abs(imageObj.vy) < imageObj.minSpeed) {
            imageObj.vy = imageObj.vy >= 0 ? imageObj.minSpeed : -imageObj.minSpeed;
        }

        // Set initial position
        imageObj.element.style.left = `${imageObj.x}px`;
        imageObj.element.style.top = `${imageObj.y}px`;

        this.images.push(imageObj);
        console.log(`Setup image ${index}:`, imageObj);
    }

    animate() {
        if (!this.isActive) return;

        this.images.forEach(imageObj => {
            // Update position
            imageObj.x += imageObj.vx;
            imageObj.y += imageObj.vy;

            // Bounce off edges
            if (imageObj.x <= 0 || imageObj.x >= window.innerWidth - imageObj.width) {
                imageObj.vx = -imageObj.vx;
                imageObj.x = Math.max(0, Math.min(window.innerWidth - imageObj.width, imageObj.x));
            }

            if (imageObj.y <= 0 || imageObj.y >= window.innerHeight - imageObj.height) {
                imageObj.vy = -imageObj.vy;
                imageObj.y = Math.max(0, Math.min(window.innerHeight - imageObj.height, imageObj.y));
            }

            // Apply position
            imageObj.element.style.left = `${imageObj.x}px`;
            imageObj.element.style.top = `${imageObj.y}px`;
        });

        this.animationId = requestAnimationFrame(() => this.animate());
    }

    handleScroll() {
        const scrollY = window.scrollY;
        const heroHeight = this.heroSection ? this.heroSection.offsetHeight : window.innerHeight;

        // Calculate fade based on scroll position
        const fadeStart = heroHeight * 0.2; // Start fading at 20% of hero height
        const fadeEnd = heroHeight * 0.7; // Completely hidden at 70% of hero height

        let opacity = 1;

        if (scrollY > fadeStart) {
            if (scrollY >= fadeEnd) {
                opacity = 0;
                this.pause();
            } else {
                opacity = 1 - (scrollY - fadeStart) / (fadeEnd - fadeStart);
                if (!this.isActive) this.resume();
            }
        } else {
            if (!this.isActive) this.resume();
        }

        // Apply opacity to all floating images
        this.images.forEach(imageObj => {
            imageObj.element.style.opacity = opacity;
        });
    }

    handleResize() {
        // Adjust positions if window is resized
        this.images.forEach(imageObj => {
            imageObj.x = Math.min(imageObj.x, window.innerWidth - imageObj.width);
            imageObj.y = Math.min(imageObj.y, window.innerHeight - imageObj.height);
        });
    }

    pause() {
        this.isActive = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    resume() {
        if (!this.isActive) {
            this.isActive = true;
            this.animate();
        }
    }

    destroy() {
        this.pause();
        window.removeEventListener('scroll', this.handleScroll);
        window.removeEventListener('resize', this.handleResize);

        // Reset image styles
        this.images.forEach(imageObj => {
            imageObj.element.style.position = '';
            imageObj.element.style.zIndex = '';
            imageObj.element.style.left = '';
            imageObj.element.style.top = '';
            imageObj.element.style.opacity = '';
            imageObj.element.style.pointerEvents = '';
        });
    }
}

// Smooth scroll functionality
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Create the infinite marquee
    const marquee = new InfiniteMarquee('#marquee', {
        speed: 80 // Adjust speed as needed (pixels per second)
    });

    // Initialize floating images screensaver
    const floatingImages = new FloatingImages();

    // Initialize smooth scrolling
    initSmoothScroll();

    // Add loading fade-in effect
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.3s ease-in-out';

    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
});

// Handle page unload
window.addEventListener('beforeunload', function() {
    // Clean up marquee if it exists
    if (window.marquee && typeof window.marquee.destroy === 'function') {
        window.marquee.destroy();
    }
});
