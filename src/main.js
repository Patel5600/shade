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
    gsap.fromTo(section.querySelector('.section-title'), 
      {
        y: 50,
        opacity: 0
      },
      {
        scrollTrigger: {
          trigger: section,
          start: 'top 80%',
          toggleActions: 'play none none reverse'
        },
        y: 0,
        opacity: 1,
        duration: 1
      }
    )
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
  
}

// Wait for DOM
window.addEventListener('DOMContentLoaded', () => {
  initAnimations();
});
