class InfiniteMarquee {
  constructor(selector, options = {}) {
    this.marquee = document.querySelector(selector);
    if (!this.marquee) return;

    this.content = this.marquee.querySelector(".marquee-content");
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
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        this.pause();
      } else {
        this.start();
      }
    });

    // Handle window resize
    window.addEventListener("resize", () => {
      this.handleResize();
    });
  }

  cloneContent() {
    // Clone the original content multiple times for seamless loop
    const originalContent = this.content.innerHTML;
    // Create enough clones to ensure smooth infinite scroll
    this.content.innerHTML =
      originalContent + originalContent + originalContent;
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
    window.removeEventListener("resize", this.handleResize);
    document.removeEventListener(
      "visibilitychange",
      this.handleVisibilityChange
    );
  }
}

// True Infinite Horizontal Scroll Class
class TrueInfiniteScroll {
  constructor(selector) {
    this.container = document.querySelector(selector);
    if (!this.container) return;

    this.originalHTML = this.container.innerHTML;
    this.items = [];
    this.itemWidth = 0;
    this.totalCopies = 5; // Number of copies to create
    this.isScrolling = false;

    this.init();
  }

  init() {
    console.log("Initializing true infinite scroll...");

    // Store original items data
    this.storeOriginalItems();

    // Clear container and rebuild with multiple copies
    this.buildInfiniteItems();

    // Calculate dimensions
    setTimeout(() => {
      this.calculateDimensions();
      this.setInitialPosition();
      this.attachScrollListener();
    }, 100);
  }

  storeOriginalItems() {
    const originalItems = Array.from(this.container.children);
    this.items = originalItems.map((item) => ({
      img: item.querySelector("img").src,
      alt: item.querySelector("img").alt,
      text: item.querySelector(".desc-text").textContent,
    }));
    console.log("Stored", this.items.length, "original items");
  }

  buildInfiniteItems() {
    this.container.innerHTML = "";

    // Create multiple sets of items
    for (let copy = 0; copy < this.totalCopies; copy++) {
      this.items.forEach((item) => {
        const scrollItem = document.createElement("div");
        scrollItem.className = "scroll-item";

        const img = document.createElement("img");
        img.src = item.img;
        img.alt = item.alt;

        const text = document.createElement("p");
        text.className = "desc-text";
        text.textContent = item.text;

        scrollItem.appendChild(img);
        scrollItem.appendChild(text);
        this.container.appendChild(scrollItem);
      });
    }

    console.log("Built", this.container.children.length, "total items");
  }

  calculateDimensions() {
    // Calculate width of one complete set
    const firstSetItems = Array.from(this.container.children).slice(
      0,
      this.items.length
    );
    this.itemWidth = 0;

    firstSetItems.forEach((item, index) => {
      this.itemWidth += item.offsetWidth;
      if (index < firstSetItems.length - 1) {
        this.itemWidth += 32; // gap between items
      }
    });

    console.log("One set width:", this.itemWidth);
  }

  setInitialPosition() {
    // Start at position where we can scroll both ways
    const middlePosition = this.itemWidth * Math.floor(this.totalCopies / 2);
    this.container.scrollLeft = middlePosition;
    console.log("Set initial scroll to:", middlePosition);
  }

  attachScrollListener() {
    this.container.addEventListener("scroll", () => {
      if (this.isScrolling) return;

      const scrollLeft = this.container.scrollLeft;
      const resetThreshold = 50;

      // If scrolled too far left (near beginning)
      if (scrollLeft <= resetThreshold) {
        this.isScrolling = true;
        this.container.scrollLeft = scrollLeft + this.itemWidth;
        setTimeout(() => (this.isScrolling = false), 10);
      }

      // If scrolled too far right (near end)
      const maxScroll = this.container.scrollWidth - this.container.clientWidth;
      if (scrollLeft >= maxScroll - resetThreshold) {
        this.isScrolling = true;
        this.container.scrollLeft = scrollLeft - this.itemWidth;
        setTimeout(() => (this.isScrolling = false), 10);
      }
    });
  }

  destroy() {
    this.container.innerHTML = this.originalHTML;
  }
}

// Floating Images Screensaver Class
class FloatingImages {
  constructor() {
    this.images = [];
    this.animationId = null;
    this.isActive = true;
    this.heroSection = document.querySelector(".hero");
    this.heroImages = document.querySelectorAll(".hero-images img");

    // Bind methods to preserve context
    this.handleScroll = this.handleScroll.bind(this);
    this.handleResize = this.handleResize.bind(this);

    this.init();
  }

  init() {
    if (!this.heroImages.length) {
      console.log("No hero images found");
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
      window.addEventListener("scroll", this.handleScroll);
      window.addEventListener("resize", this.handleResize);
    }, 100);
  }

  setupImage(img, index) {
    // Make images absolutely positioned
    img.style.position = "fixed";
    img.style.zIndex = "10";
    img.style.pointerEvents = "none";
    img.style.transition = "opacity 0.3s ease";

    // Force image dimensions if not loaded
    if (!img.width || !img.height) {
      img.style.width = "60px";
      img.style.height = "60px";
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
      maxSpeed: 2,
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

    this.images.forEach((imageObj) => {
      // Update position
      imageObj.x += imageObj.vx;
      imageObj.y += imageObj.vy;

      // Bounce off edges
      if (imageObj.x <= 0 || imageObj.x >= window.innerWidth - imageObj.width) {
        imageObj.vx = -imageObj.vx;
        imageObj.x = Math.max(
          0,
          Math.min(window.innerWidth - imageObj.width, imageObj.x)
        );
      }

      if (
        imageObj.y <= 0 ||
        imageObj.y >= window.innerHeight - imageObj.height
      ) {
        imageObj.vy = -imageObj.vy;
        imageObj.y = Math.max(
          0,
          Math.min(window.innerHeight - imageObj.height, imageObj.y)
        );
      }

      // Apply position
      imageObj.element.style.left = `${imageObj.x}px`;
      imageObj.element.style.top = `${imageObj.y}px`;
    });

    this.animationId = requestAnimationFrame(() => this.animate());
  }

  handleScroll() {
    const scrollY = window.scrollY;
    const heroHeight = this.heroSection
      ? this.heroSection.offsetHeight
      : window.innerHeight;

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
    this.images.forEach((imageObj) => {
      imageObj.element.style.opacity = opacity;
    });
  }

  handleResize() {
    // Adjust positions if window is resized
    this.images.forEach((imageObj) => {
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
    window.removeEventListener("scroll", this.handleScroll);
    window.removeEventListener("resize", this.handleResize);

    // Reset image styles
    this.images.forEach((imageObj) => {
      imageObj.element.style.position = "";
      imageObj.element.style.zIndex = "";
      imageObj.element.style.left = "";
      imageObj.element.style.top = "";
      imageObj.element.style.opacity = "";
      imageObj.element.style.pointerEvents = "";
    });
  }
}

// Image Stack Cycling Class - Smooth Layered Stacking
class ImageStack {
  constructor(stackContainer) {
    this.container = stackContainer;
    this.images = Array.from(stackContainer.querySelectorAll(".s-img"));
    this.currentIndex = 0;
    this.isAnimating = false;
    this.autoPlayInterval = null;
    this.autoPlayDelay = 3000; // 3 seconds between auto-advances

    this.init();
  }

  init() {
    if (this.images.length === 0) return;

    console.log(
      `Initializing smooth image stack with ${this.images.length} images`
    );

    // Set initial state
    this.updateStack();

    // Add click listener to container
    this.container.addEventListener("click", (e) => {
      if (!this.isAnimating) {
        this.nextImage();
      }
    });

    // Add hover events to pause/resume auto-play
    this.container.addEventListener("mouseenter", () => {
      this.pauseAutoPlay();
    });

    this.container.addEventListener("mouseleave", () => {
      this.startAutoPlay();
    });

    // Start auto-play
    this.startAutoPlay();
  }

  nextImage() {
    this.isAnimating = true;

    // Move to next image in correct order
    this.currentIndex = (this.currentIndex + 1) % this.images.length;
    this.updateStack();

    // Reset animation flag after transition completes
    setTimeout(() => {
      this.isAnimating = false;
    }, 800); // Match CSS transition duration
  }

  updateStack() {
    this.images.forEach((img, index) => {
      // Clear all classes
      img.classList.remove(
        "active",
        "behind-1",
        "behind-2",
        "behind-3",
        "behind-4",
        "behind-5",
        "behind-6",
        "behind-7",
        "behind-8"
      );

      // Set classes based on position relative to current active image
      if (index === this.currentIndex) {
        img.classList.add("active");
      } else {
        // Calculate how far behind this image is from the active one
        let distance =
          (index - this.currentIndex + this.images.length) % this.images.length;

        if (distance <= 4) {
          img.classList.add(`behind-${distance}`);
        }
        // Images beyond behind-4 will use the default transform state
      }
    });

    console.log(`Active image index: ${this.currentIndex}`);
  }

  startAutoPlay() {
    if (this.autoPlayInterval) return;

    this.autoPlayInterval = setInterval(() => {
      if (!this.isAnimating) {
        this.nextImage();
      }
    }, this.autoPlayDelay);
  }

  pauseAutoPlay() {
    if (this.autoPlayInterval) {
      clearInterval(this.autoPlayInterval);
      this.autoPlayInterval = null;
    }
  }

  destroy() {
    this.pauseAutoPlay();
    this.container.removeEventListener("click", this.nextImage);
    this.container.removeEventListener("mouseenter", this.pauseAutoPlay);
    this.container.removeEventListener("mouseleave", this.startAutoPlay);
  }
}

// Smooth scroll functionality
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute("href"));
      if (target) {
        target.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    });
  });
}

// Initialize everything when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  // Create the infinite marquee
  const marquee = new InfiniteMarquee("#marquee", {
    speed: 80, // Adjust speed as needed (pixels per second)
  });

  // Initialize floating images screensaver
  const floatingImages = new FloatingImages();

  // Initialize image stacks
  const imageStacks = document.querySelectorAll(".image-stack");
  imageStacks.forEach((stack) => {
    new ImageStack(stack);
  });

  // Initialize TRUE infinite horizontal scroll
  const infiniteScroll = new TrueInfiniteScroll("#infinite-scroll");

  // APPROACH STACKED CARDS - Scroll Animation
  class ApproachCards {
    constructor() {
      this.cards = document.querySelectorAll(".approach-card");
      this.container = document.querySelector(".approach-container");
      this.visibleCards = new Set();
      this.isAnimating = false;

      if (this.cards.length === 0) return;

      this.init();
    }

    init() {
      // Set up intersection observer for scroll-triggered animations
      this.setupIntersectionObserver();

      // Add click handlers for card interactions
      this.setupClickHandlers();
    }

    setupIntersectionObserver() {
      const options = {
        root: null,
        rootMargin: "0px 0px -20% 0px",
        threshold: 0.1,
      };

      this.observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.animateCardIn(entry.target);
          }
        });
      }, options);

      this.cards.forEach((card) => {
        this.observer.observe(card);
      });
    }

    animateCardIn(card) {
      const approachIndex = parseInt(card.dataset.approach);

      if (this.visibleCards.has(approachIndex)) return;

      this.visibleCards.add(approachIndex);

      // Stagger the animation based on card index
      setTimeout(() => {
        card.classList.add("visible");
      }, approachIndex * 300); // 300ms delay between each card
    }

    setupClickHandlers() {
      this.cards.forEach((card) => {
        card.addEventListener("click", () => {
          this.handleCardClick(card);
        });
      });
    }

    handleCardClick(clickedCard) {
      if (this.isAnimating) return;

      this.isAnimating = true;
      const clickedIndex = parseInt(clickedCard.dataset.approach);

      // Bring clicked card to front
      clickedCard.style.zIndex = "10";

      // Reset other cards z-index
      this.cards.forEach((card) => {
        if (card !== clickedCard) {
          const cardIndex = parseInt(card.dataset.approach);
          card.style.zIndex = cardIndex.toString();
        }
      });

      // Reset animation lock
      setTimeout(() => {
        this.isAnimating = false;
      }, 300);
    }

    destroy() {
      if (this.observer) {
        this.observer.disconnect();
      }
    }
  }

  // Initialize approach cards
  const approachCards = new ApproachCards();

  // Initialize smooth scrolling
  initSmoothScroll();

  // Add loading fade-in effect
  document.body.style.opacity = "0";
  document.body.style.transition = "opacity 0.3s ease-in-out";

  setTimeout(function () {
    document.body.style.opacity = "1";
  }, 100);
});

// Handle page unload
window.addEventListener("beforeunload", function () {
  // Clean up marquee if it exists
  if (window.marquee && typeof window.marquee.destroy === "function") {
    window.marquee.destroy();
  }
});

// Team section image debugging
document.addEventListener("DOMContentLoaded", function () {
  const teamImages = document.querySelectorAll(".team-member img");
  console.log("🔍 Found", teamImages.length, "team member images");

  teamImages.forEach((img, index) => {
    console.log(`Image ${index + 1}:`, img.src);

    // Test if image loads
    img.addEventListener("load", function () {
      console.log("✅ Successfully loaded:", this.src);
    });

    img.addEventListener("error", function () {
      console.log("❌ Failed to load:", this.src);

      // Try alternative paths
      const altPaths = [
        `./images/team/${this.alt.toLowerCase()}.png`,
        `images/team/${this.alt.toLowerCase()}.png`,
        `/images/team/${this.alt.toLowerCase()}.png`,
      ];

      console.log("🔄 Trying alternative paths for", this.alt);
      tryAlternativePath(this, altPaths, 0);
    });
  });
});

function tryAlternativePath(img, paths, index) {
  if (index >= paths.length) {
    console.log("💥 All alternative paths failed for", img.alt);
    return;
  }

  const testImg = new Image();
  testImg.onload = function () {
    console.log("✅ Alternative path works:", paths[index]);
    img.src = paths[index];
  };
  testImg.onerror = function () {
    console.log("❌ Alternative path failed:", paths[index]);
    tryAlternativePath(img, paths, index + 1);
  };
  testImg.src = paths[index];
}
