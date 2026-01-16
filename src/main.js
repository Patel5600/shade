import './style.css'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'

// Register GSAP Plugins
gsap.registerPlugin(ScrollTrigger)

// Initialize Lenis for Smooth Scroll
const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  direction: 'vertical',
  gestureDirection: 'vertical',
  smooth: true,
  mouseMultiplier: 1,
  smoothTouch: false,
  touchMultiplier: 2,
})

function raf(time) {
  lenis.raf(time)
  requestAnimationFrame(raf)
}

requestAnimationFrame(raf)

// Colors for Placeholders (if not set in style)
document.querySelectorAll('.placeholder-image').forEach(el => {
  if (el.dataset.color) {
    el.style.backgroundColor = el.dataset.color;
  }
});

// Animations
const initAnimations = () => {

  // Hero Reveal
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

  tl.to('.reveal-text', {
    y: 0,
    opacity: 1,
    duration: 1.5,
    stagger: 0.2,
    delay: 0.2
  })
    .to('.hero-subtitle', {
      opacity: 1,
      duration: 1,
      y: 0
    }, '-=1')
    .to('.scroll-indicator', {
      opacity: 1,
      duration: 1,
      y: 0
    }, '-=0.5');

  // Parallax / Fade for Sections
  gsap.utils.toArray('.section').forEach(section => {
    // Title Animation
    gsap.fromTo(section.querySelector('.section-title'),
      { y: 50, opacity: 0 },
      {
        scrollTrigger: {
          trigger: section,
          start: 'top 80%',
          toggleActions: 'play none none reverse'
        },
        y: 0, opacity: 1, duration: 1
      }
    )

    // Studio Collage Parallax Reveal
    const collageItems = section.querySelectorAll('.collage-item');
    if (collageItems.length > 0) {
      collageItems.forEach((item, index) => {
        const speed = item.dataset.speed || 1;
        gsap.fromTo(item,
          { y: 50 * speed, opacity: 0 },
          {
            scrollTrigger: {
              trigger: section,
              start: 'top 75%',
              toggleActions: 'play none none reverse'
            },
            y: 0,
            opacity: 1,
            duration: 1.2,
            delay: index * 0.2,
            ease: 'power3.out'
          }
        );
      });
    }
  });

  // Stagger Grid Items
  gsap.fromTo('.card',
    {
      y: 50,
      opacity: 0
    },
    {
      scrollTrigger: {
        trigger: '.gallery-grid',
        start: 'top 75%'
      },
      y: 0,
      opacity: 1,
      duration: 1,
      stagger: 0.1,
      ease: 'power2.out'
    }
  );

  // Testimonials Animation
  gsap.fromTo('.testimonial-card',
    {
      y: 30,
      opacity: 0
    },
    {
      scrollTrigger: {
        trigger: '.testimonial-grid',
        start: 'top 80%'
      },
      y: 0,
      opacity: 1,
      duration: 1,
      stagger: 0.2,
      ease: 'power2.out'
    }
  );

}

// Pencil Drawing Effect
const initPencilEffect = () => {
  const canvas = document.getElementById('pencil-canvas');
  if (!canvas) return;

  // Mobile check
  if (window.matchMedia('(max-width: 768px)').matches || 'ontouchstart' in window) {
    return;
  }

  const ctx = canvas.getContext('2d');
  let width, height;
  let points = [];
  let mouse = { x: 0, y: 0 };
  let lastMouse = { x: 0, y: 0 };

  const resize = () => {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
  };

  window.addEventListener('resize', resize);
  resize();

  // Settings
  const settings = {
    color: '#2B2B2B',
    opacity: 0.85,
    maxLife: 1650, // 1.65s
    lineWidth: 2
  };

  class Point {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.birth = Date.now();
      this.life = settings.maxLife;
      this.alpha = settings.opacity;
    }

    draw(ctx, prevPoint) {
      if (!prevPoint) return;

      const age = Date.now() - this.birth;
      const lifeLeft = Math.max(0, this.life - age);
      const alpha = (lifeLeft / 800); // fade duration approx 800ms fadeout at end? Or just linear fade? 
      // User asked for "fade out smoothly after 2.5s" implies it stays for 2.5s then fades? 
      // "Strokes fade out smoothly after 2.5 seconds" could mean they start fading immediately or stay then fade.
      // Let's implement: Visible for most of life, then fade out in last 800ms.

      let currentAlpha = settings.opacity;
      if (age > (settings.maxLife - 800)) {
        currentAlpha = settings.opacity * ((settings.maxLife - age) / 800);
      }

      if (currentAlpha <= 0) return false;

      ctx.globalAlpha = currentAlpha;
      ctx.beginPath();
      ctx.moveTo(prevPoint.x, prevPoint.y);
      ctx.lineTo(this.x, this.y);
      ctx.strokeStyle = settings.color;
      ctx.lineWidth = settings.lineWidth; // Could add pressure simulation speed-based here
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();
      ctx.globalAlpha = 1;

      return true;
    }
  }

  // Tracking
  let isScrolling = false;
  let scrollTimeout;

  window.addEventListener('scroll', () => {
    isScrolling = true;
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      isScrolling = false;
    }, 100);
  });

  window.addEventListener('mousemove', (e) => {
    // Disable on mobile/touch
    if ('ontouchstart' in window) return;

    // Disable on scroll
    if (isScrolling) return;

    // Ignore on inputs/buttons/interactive
    const target = e.target;
    if (
      target.tagName === 'BUTTON' ||
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.tagName === 'SELECT' ||
      target.tagName === 'A' ||
      target.closest('button') ||
      target.closest('a') ||
      target.closest('.interactive')
    ) {
      return;
    }

    mouse.x = e.clientX;
    mouse.y = e.clientY;

    // Smooth lag/interpolation could be added here, but direct drawing feels more responsive for a pencil.
    // Logic: add point to array
    points.push(new Point(mouse.x, mouse.y));
  });

  // Render Loop
  const render = () => {
    ctx.clearRect(0, 0, width, height);

    // Remove old points
    const now = Date.now();
    // We need to redraw all points that are still alive?
    // Actually, creating a fading trail effect usually involves:
    // 1. Drawing new segments to the canvas
    // 2. Clear canvas and redraw all valid segments with updated opacity? This is expensive for long lines.
    // 3. Or fade the entire canvas? "ctx.globalCompositeOperation = 'destination-out'; ctx.fillStyle = 'rgba(0,0,0,0.1)'; ctx.fillRect..."
    // The requirement says "fade out smoothly after 2.5 seconds".
    // 
    // Optimization for "Auto remove stroke paths":
    // Let's keep a list of active paths (arrays of points).
    // Since it's a continuous line, we can just store the list of points.
    // 
    // NOTE: Redrawing thousands of points every frame (60fps) is heavy.
    // Better approach for "fading strokes":
    // Draw to canvas. Don't clear every frame.
    // BUT we need them to fade out INDIVIDUALLY after 2.5s.
    // If I draw permanent pixels, I can't easily fade just the old ones without clearing.
    //
    // Hybrid approach:
    // Store localized segments.
    // 
    // "Performance: fps_target: 60, gpu_acceleration: true" => implies we should be careful.
    // 
    // Let's try the "Redraw all active points" approach first. If `points` gets too big, we slice.
    // `points` array will grow. 
    // 2.5s at 60 mouse moves per second ~ 150 points if moving constantly. That's trivial for Canvas.
    // Even 1000 segments is fine.

    // Filter dead points first (optimization)
    // We need to keep continuity. If a point dies, the line breaks. 
    // Actually, if smooth fade is needed, the tail just disappears.

    if (points.length > 0) {
      // Remove old points
      while (points.length > 0 && (now - points[0].birth > settings.maxLife)) {
        points.shift();
      }

      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      // Pencil "Edge" & "Smudge"
      ctx.shadowBlur = 1;
      ctx.shadowColor = 'rgba(43, 43, 43, 0.2)';

      // Draw segments
      for (let i = 1; i < points.length; i++) {
        const p1 = points[i - 1];
        const p2 = points[i];

        // Opacity / Age
        const age = now - p2.birth;
        let alpha = settings.opacity;
        if (age > (settings.maxLife - 800)) {
          alpha = Math.max(0, settings.opacity * ((settings.maxLife - age) / 800));
        }

        if (alpha > 0.05) {
          ctx.beginPath();

          // Jitter (Natural Hand)
          const jitter = 0.5;
          const jx1 = (Math.random() - 0.5) * jitter;
          const jy1 = (Math.random() - 0.5) * jitter;
          const jx2 = (Math.random() - 0.5) * jitter;
          const jy2 = (Math.random() - 0.5) * jitter;

          ctx.moveTo(p1.x + jx1, p1.y + jy1);
          ctx.lineTo(p2.x + jx2, p2.y + jy2);

          // Texture (Grain)
          const grain = 0.8 + Math.random() * 0.4;
          let finalAlpha = alpha * grain;
          finalAlpha = Math.min(1, Math.max(0, finalAlpha));

          ctx.strokeStyle = `rgba(43, 43, 43, ${finalAlpha})`;
          ctx.lineWidth = settings.lineWidth + (Math.random() * 0.5); // Pressure variation

          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(render);
  };

  render();
};

// Wait for DOM
window.addEventListener('DOMContentLoaded', () => {
  initAnimations();
  initPencilEffect();
  initMagneticEffect();
  initBookInteraction();
});

// Interactive Book Logic
const initBookInteraction = () => {
  const book = document.getElementById('interactive-book');
  const items = book.querySelectorAll('.book-cover, .book-page');
  const backdrop = document.createElement('div');
  backdrop.className = 'book-overlay-backdrop';
  document.body.appendChild(backdrop);

  let isExpanded = false;
  let pageIndex = 0; // 0 = cover, 1 = page 1, etc.
  const totalPages = items.length;

  // Sound effects (optional, minimal synthetic placeholders)
  // Real implementation would use Audio objects if requested, keeping it visual for now.

  const resetBook = (e) => {
    if (e) e.stopPropagation();

    // Close Book
    isExpanded = false;
    book.classList.remove('expanded');
    backdrop.classList.remove('active');

    // Reset pages after short delay to allow closing animation to start
    setTimeout(() => {
      items.forEach(item => item.classList.remove('flipped'));
      pageIndex = 0;
    }, 300);
  };

  const handleBookClick = () => {
    if (!isExpanded) {
      // Step 1: Expand
      isExpanded = true;
      book.classList.add('expanded');
      backdrop.classList.add('active');
    } else {
      // Step 2: Turn Pages
      if (pageIndex < totalPages) {
        // Flip current page/cover
        items[pageIndex].classList.add('flipped');
        pageIndex++;
      } else {
        // All pages flipped, reset self?
        // User said "upto 5 pages". After 5, we can close or do nothing.
        // Let's close it on the click AFTER the last page
        resetBook();
      }
    }
  };

  book.addEventListener('click', handleBookClick);
  backdrop.addEventListener('click', resetBook);

  // Close on Escape key
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isExpanded) resetBook();
  });
};

// Anti-Magnetic Repulsion Effect
const initMagneticEffect = () => {
  const items = document.querySelectorAll('.studio-collage .collage-item');
  if (!items.length) return;

  const config = {
    radius: 300,        // Interaction radius
    strength: 80,       // Max displacement (pixels)
    ease: 0.1          // Smoothness (Lerp factor)
  };

  const mouse = { x: 0, y: 0 };

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  // Prepare elements with state
  const physicsItems = Array.from(items).map(parent => {
    // We move the inner child to avoid conflicting with GSAP's parent transforms
    const child = parent.querySelector('.placeholder-image') || parent.querySelector('img');
    return {
      parent,
      child,
      x: 0,
      y: 0,
      tx: 0,
      ty: 0
    };
  });

  const loop = () => {
    physicsItems.forEach(item => {
      if (!item.child) return;

      // Calculate center of the anchor (parent)
      const rect = item.parent.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;

      // Vector from Mouse to Center
      const dx = cx - mouse.x;
      const dy = cy - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Repulsion Physics
      if (dist < config.radius) {
        const force = (config.radius - dist) / config.radius; // 0 (edge) to 1 (center)
        item.tx = (dx / dist) * force * config.strength;
        item.ty = (dy / dist) * force * config.strength;
      } else {
        item.tx = 0;
        item.ty = 0;
      }

      // Smooth Movement (Lerp)
      item.x += (item.tx - item.x) * config.ease;
      item.y += (item.ty - item.y) * config.ease;

      // Apply
      // Use efficient transforms with rounding to avoid sub-pixel jitter
      const x = Math.round(item.x * 100) / 100;
      const y = Math.round(item.y * 100) / 100;

      if (Math.abs(x) > 0.1 || Math.abs(y) > 0.1) {
        item.child.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      } else {
        item.child.style.transform = '';
      }
    });

    requestAnimationFrame(loop);
  };

  loop();
};
