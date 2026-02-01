// ========================================
// EDUNEST - INTERACTIVE FUNCTIONALITY
// ========================================
import { api } from './api.js';

// ========== DOM ELEMENTS ==========
const navbar = document.getElementById('navbar');
const mobileMenuToggle = document.getElementById('mobileMenuToggle');
const navMenu = document.getElementById('navMenu');
const navLinks = document.querySelectorAll('.nav-link');
const scrollToTopBtn = document.getElementById('scrollToTop');
const inquiryForm = document.getElementById('inquiryForm');
const formSuccess = document.getElementById('formSuccess');
const formError = document.getElementById('formError');
const prevTestimonialBtn = document.getElementById('prevTestimonial');
const nextTestimonialBtn = document.getElementById('nextTestimonial');
const testimonialDots = document.getElementById('testimonialDots');
const galleryItems = document.querySelectorAll('.gallery-item');

// ========== STATE ==========
let currentTestimonial = 0;
const testimonials = document.querySelectorAll('.testimonial-card');
let testimonialInterval;

// ========== MOBILE MENU ==========
mobileMenuToggle?.addEventListener('click', () => {
    navMenu.classList.toggle('active');

    // Animate hamburger icon
    const spans = mobileMenuToggle.querySelectorAll('span');
    if (navMenu.classList.contains('active')) {
        spans[0].style.transform = 'rotate(45deg) translateY(8px)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'rotate(-45deg) translateY(-8px)';
    } else {
        spans[0].style.transform = '';
        spans[1].style.opacity = '1';
        spans[2].style.transform = '';
    }
});

// Close mobile menu when clicking a link
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        const spans = mobileMenuToggle.querySelectorAll('span');
        spans[0].style.transform = '';
        spans[1].style.opacity = '1';
        spans[2].style.transform = '';
    });
});

// ========== SMOOTH SCROLLING ==========
// ========== SMOOTH SCROLLING ==========
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        const targetId = link.getAttribute('href');

        // Only intercept hash links (internal page scolling)
        if (targetId.startsWith('#')) {
            e.preventDefault();
            const targetSection = document.querySelector(targetId);

            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 80; // Account for fixed navbar
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        }
    });
});

// ========== ACTIVE SECTION HIGHLIGHTING ==========
function updateActiveNav() {
    const sections = document.querySelectorAll('section[id]');
    const scrollPosition = window.scrollY + 100;

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');

        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });
}

// ========== NAVBAR SCROLL EFFECT ==========
function handleNavbarScroll() {
    if (window.scrollY > 100) {
        navbar.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.15)';
    } else {
        navbar.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.08)';
    }
}

// ========== SCROLL TO TOP BUTTON ==========
function handleScrollToTop() {
    if (window.scrollY > 500) {
        scrollToTopBtn.classList.add('visible');
    } else {
        scrollToTopBtn.classList.remove('visible');
    }
}

scrollToTopBtn?.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// ========== SCROLL REVEAL ANIMATIONS ==========
function revealElements() {
    const reveals = document.querySelectorAll('.reveal');

    reveals.forEach(element => {
        const windowHeight = window.innerHeight;
        const elementTop = element.getBoundingClientRect().top;
        const elementVisible = 150;

        if (elementTop < windowHeight - elementVisible) {
            element.classList.add('active');
        }
    });
}

// Add reveal class to elements that should animate
function initRevealElements() {
    const elementsToReveal = [
        '.about-card',
        '.stat-card',
        '.program-card',
        '.safety-card',
        '.feature-large',
        '.contact-card'
    ];

    elementsToReveal.forEach(selector => {
        document.querySelectorAll(selector).forEach(el => {
            el.classList.add('reveal');
        });
    });
}

// ========== TESTIMONIAL CAROUSEL ==========
function createTestimonialDots() {
    testimonials.forEach((_, index) => {
        const dot = document.createElement('div');
        dot.classList.add('testimonial-dot');
        if (index === 0) dot.classList.add('active');
        dot.addEventListener('click', () => showTestimonial(index));
        testimonialDots?.appendChild(dot);
    });
}

function showTestimonial(index) {
    testimonials.forEach((testimonial, i) => {
        testimonial.classList.remove('active');
        if (i === index) {
            testimonial.classList.add('active');
        }
    });

    // Update dots
    const dots = testimonialDots?.querySelectorAll('.testimonial-dot');
    dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
    });

    currentTestimonial = index;
}

function nextTestimonial() {
    currentTestimonial = (currentTestimonial + 1) % testimonials.length;
    showTestimonial(currentTestimonial);
}

function prevTestimonial() {
    currentTestimonial = (currentTestimonial - 1 + testimonials.length) % testimonials.length;
    showTestimonial(currentTestimonial);
}

function startTestimonialAutoplay() {
    testimonialInterval = setInterval(nextTestimonial, 6000);
}

function stopTestimonialAutoplay() {
    clearInterval(testimonialInterval);
}

prevTestimonialBtn?.addEventListener('click', () => {
    stopTestimonialAutoplay();
    prevTestimonial();
    startTestimonialAutoplay();
});

nextTestimonialBtn?.addEventListener('click', () => {
    stopTestimonialAutoplay();
    nextTestimonial();
    startTestimonialAutoplay();
});

// ========== FORM VALIDATION & SUBMISSION ==========
inquiryForm?.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Hide previous messages
    formSuccess.style.display = 'none';
    formError.style.display = 'none';

    // Get form values
    const name = document.getElementById('parentName').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const message = inquiryForm.querySelector('textarea').value.trim();

    // Basic validation
    if (!name || !email || !phone) {
        formError.textContent = 'Please fill out all required fields.';
        formError.style.display = 'flex';
        return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        formError.textContent = 'Please enter a valid email address.';
        formError.style.display = 'flex';
        return;
    }

    // Submit via API
    const submitBtn = inquiryForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;

    try {
        // Use unified API (handles offline/localStorage fallback)
        const result = await api.submitInquiry({ name, email, phone, message });

        if (result.success || result.id) {
            formSuccess.style.display = 'flex';
            formSuccess.innerHTML = `✓ ${result.message}`;
            inquiryForm.reset();

            // Hide success message after 5 seconds
            setTimeout(() => {
                formSuccess.style.display = 'none';
            }, 5000);
        } else {
            throw new Error(result.error || 'Submission failed');
        }
    } catch (err) {
        console.error('Submission error:', err);
        formError.textContent = `✗ ${err.message}`;
        formError.style.display = 'flex';
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
});

// ========== GALLERY LIGHTBOX (Simple) ==========
galleryItems.forEach(item => {
    item.addEventListener('click', () => {
        const imageSrc = item.getAttribute('data-image');
        const overlay = item.querySelector('.gallery-overlay span').textContent;

        // You could implement a full lightbox here
        // For now, just log the action
        console.log(`Opening gallery image: ${imageSrc} - ${overlay}`);

        // Simple implementation: Open image in new tab
        // window.open(imageSrc, '_blank');
    });
});

// ========== INITIALIZE ON PAGE LOAD ==========
function init() {
    initRevealElements();
    createTestimonialDots();
    startTestimonialAutoplay();
    revealElements();
    updateActiveNav();
}

// ========== EVENT LISTENERS ==========
window.addEventListener('scroll', () => {
    handleNavbarScroll();
    handleScrollToTop();
    revealElements();
    updateActiveNav();
});

window.addEventListener('DOMContentLoaded', init);

// ========== ADD FADE-IN ANIMATION TO HERO ==========
window.addEventListener('load', () => {
    const heroContent = document.querySelector('.hero-content');
    if (heroContent) {
        heroContent.classList.add('fade-in-up');
    }
});

// ========== CONSOLE MESSAGE ==========
console.log('%cEduNest 🏫', 'color: #FF8C42; font-size: 24px; font-weight: bold;');
console.log('%cNurturing Tomorrow\'s Bright Minds', 'color: #4A90E2; font-size: 14px;');
console.log('Website built with care for early childhood education excellence.');
