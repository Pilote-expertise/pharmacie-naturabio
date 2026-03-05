/**
 * PHARMACIE NATURABIO - Main JavaScript
 * Navigation, Scroll Effects, Global Utilities
 */

(function() {
    'use strict';

    // ===== Configuration =====
    const CONFIG = {
        scrollThreshold: 50,
        animationDelay: 100,
        transitionDuration: 300
    };

    // ===== DOM Elements =====
    const DOM = {
        header: document.querySelector('.header'),
        menuToggle: document.querySelector('.menu-toggle'),
        navMobile: document.querySelector('.nav-mobile'),
        navLinks: document.querySelectorAll('.nav-main a, .nav-mobile a'),
        backToTop: document.querySelector('.back-to-top'),
        accordions: document.querySelectorAll('.accordion'),
        tabs: document.querySelectorAll('.tabs'),
        modals: document.querySelectorAll('.modal'),
        modalBackdrops: document.querySelectorAll('.modal-backdrop')
    };

    // ===== Header Scroll Effect =====
    function initHeaderScroll() {
        if (!DOM.header) return;

        let lastScroll = 0;
        let ticking = false;

        function updateHeader() {
            const currentScroll = window.pageYOffset;

            if (currentScroll > CONFIG.scrollThreshold) {
                DOM.header.classList.add('scrolled');
            } else {
                DOM.header.classList.remove('scrolled');
            }

            lastScroll = currentScroll;
            ticking = false;
        }

        window.addEventListener('scroll', function() {
            if (!ticking) {
                window.requestAnimationFrame(updateHeader);
                ticking = true;
            }
        }, { passive: true });
    }

    // ===== Mobile Navigation =====
    function initMobileNav() {
        if (!DOM.menuToggle || !DOM.navMobile) return;

        DOM.menuToggle.addEventListener('click', function() {
            this.classList.toggle('active');
            DOM.navMobile.classList.toggle('active');
            document.body.classList.toggle('nav-open');
        });

        // Close menu when clicking on a link
        DOM.navMobile.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', function() {
                DOM.menuToggle.classList.remove('active');
                DOM.navMobile.classList.remove('active');
                document.body.classList.remove('nav-open');
            });
        });

        // Close menu on escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && DOM.navMobile.classList.contains('active')) {
                DOM.menuToggle.classList.remove('active');
                DOM.navMobile.classList.remove('active');
                document.body.classList.remove('nav-open');
            }
        });
    }

    // ===== Active Navigation Link =====
    function initActiveNavLink() {
        const currentPath = window.location.pathname;
        const currentPage = currentPath.split('/').pop() || 'index.html';

        DOM.navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href === currentPage || (currentPage === '' && href === 'index.html')) {
                link.classList.add('active');
            }
        });
    }

    // ===== Smooth Scroll =====
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const targetId = this.getAttribute('href');
                if (targetId === '#') return;

                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    e.preventDefault();
                    const headerHeight = DOM.header ? DOM.header.offsetHeight : 0;
                    const targetPosition = targetElement.offsetTop - headerHeight - 20;

                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    // ===== Back to Top Button =====
    function initBackToTop() {
        if (!DOM.backToTop) return;

        function toggleBackToTop() {
            if (window.pageYOffset > 300) {
                DOM.backToTop.classList.add('visible');
            } else {
                DOM.backToTop.classList.remove('visible');
            }
        }

        window.addEventListener('scroll', toggleBackToTop, { passive: true });

        DOM.backToTop.addEventListener('click', function(e) {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // ===== Accordions =====
    function initAccordions() {
        DOM.accordions.forEach(accordion => {
            const items = accordion.querySelectorAll('.accordion-item');

            items.forEach(item => {
                const header = item.querySelector('.accordion-header');

                header.addEventListener('click', function() {
                    const isActive = item.classList.contains('active');

                    // Close all items in this accordion
                    items.forEach(i => i.classList.remove('active'));

                    // Open clicked item if it wasn't active
                    if (!isActive) {
                        item.classList.add('active');
                    }
                });
            });
        });
    }

    // ===== Tabs =====
    function initTabs() {
        document.querySelectorAll('[data-tabs]').forEach(tabsContainer => {
            const tabButtons = tabsContainer.querySelectorAll('.tab-btn');
            const tabContents = tabsContainer.querySelectorAll('.tab-content');

            tabButtons.forEach(button => {
                button.addEventListener('click', function() {
                    const targetId = this.getAttribute('data-tab');

                    // Update buttons
                    tabButtons.forEach(btn => btn.classList.remove('active'));
                    this.classList.add('active');

                    // Update content
                    tabContents.forEach(content => {
                        content.classList.remove('active');
                        if (content.id === targetId) {
                            content.classList.add('active');
                        }
                    });
                });
            });
        });
    }

    // ===== Modals =====
    function initModals() {
        // Open modal
        document.querySelectorAll('[data-modal-open]').forEach(trigger => {
            trigger.addEventListener('click', function() {
                const modalId = this.getAttribute('data-modal-open');
                const modal = document.getElementById(modalId);
                const backdrop = document.querySelector('.modal-backdrop');

                if (modal && backdrop) {
                    modal.classList.add('active');
                    backdrop.classList.add('active');
                    document.body.style.overflow = 'hidden';
                }
            });
        });

        // Close modal
        document.querySelectorAll('[data-modal-close], .modal-backdrop').forEach(trigger => {
            trigger.addEventListener('click', function() {
                closeAllModals();
            });
        });

        // Close on escape
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                closeAllModals();
            }
        });

        function closeAllModals() {
            document.querySelectorAll('.modal.active').forEach(modal => {
                modal.classList.remove('active');
            });
            document.querySelectorAll('.modal-backdrop.active').forEach(backdrop => {
                backdrop.classList.remove('active');
            });
            document.body.style.overflow = '';
        }
    }

    // ===== Quantity Selectors =====
    function initQuantitySelectors() {
        document.querySelectorAll('.quantity-selector').forEach(selector => {
            const minusBtn = selector.querySelector('[data-quantity="minus"]');
            const plusBtn = selector.querySelector('[data-quantity="plus"]');
            const input = selector.querySelector('input');

            if (!minusBtn || !plusBtn || !input) return;

            const min = parseInt(input.getAttribute('min')) || 1;
            const max = parseInt(input.getAttribute('max')) || 99;

            minusBtn.addEventListener('click', function() {
                let value = parseInt(input.value) || min;
                if (value > min) {
                    input.value = value - 1;
                    input.dispatchEvent(new Event('change'));
                }
            });

            plusBtn.addEventListener('click', function() {
                let value = parseInt(input.value) || min;
                if (value < max) {
                    input.value = value + 1;
                    input.dispatchEvent(new Event('change'));
                }
            });

            input.addEventListener('change', function() {
                let value = parseInt(this.value) || min;
                if (value < min) value = min;
                if (value > max) value = max;
                this.value = value;
            });
        });
    }

    // ===== Scroll Animations =====
    function initScrollAnimations() {
        const animatedElements = document.querySelectorAll('[data-animate]');
        if (!animatedElements.length) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const delay = entry.target.getAttribute('data-animate-delay') || 0;
                    setTimeout(() => {
                        entry.target.classList.add('animated');
                    }, parseInt(delay));
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        animatedElements.forEach(el => observer.observe(el));
    }

    // ===== Form Validation =====
    function initFormValidation() {
        document.querySelectorAll('form[data-validate]').forEach(form => {
            form.addEventListener('submit', function(e) {
                let isValid = true;
                const requiredFields = form.querySelectorAll('[required]');

                requiredFields.forEach(field => {
                    const error = field.parentElement.querySelector('.form-error');

                    if (!field.value.trim()) {
                        isValid = false;
                        field.classList.add('error');
                        if (error) error.style.display = 'block';
                    } else {
                        field.classList.remove('error');
                        if (error) error.style.display = 'none';
                    }

                    // Email validation
                    if (field.type === 'email' && field.value.trim()) {
                        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                        if (!emailRegex.test(field.value)) {
                            isValid = false;
                            field.classList.add('error');
                            if (error) {
                                error.textContent = 'Veuillez entrer une adresse email valide';
                                error.style.display = 'block';
                            }
                        }
                    }
                });

                if (!isValid) {
                    e.preventDefault();
                }
            });
        });
    }

    // ===== Lazy Loading Images =====
    function initLazyLoading() {
        const lazyImages = document.querySelectorAll('img[data-src]');
        if (!lazyImages.length) return;

        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.getAttribute('data-src');
                    img.removeAttribute('data-src');
                    imageObserver.unobserve(img);
                }
            });
        }, {
            rootMargin: '50px 0px'
        });

        lazyImages.forEach(img => imageObserver.observe(img));
    }

    // ===== Product Gallery =====
    function initProductGallery() {
        const mainImage = document.querySelector('.product-gallery-main img');
        const thumbs = document.querySelectorAll('.product-gallery-thumb');

        if (!mainImage || !thumbs.length) return;

        thumbs.forEach(thumb => {
            thumb.addEventListener('click', function() {
                const newSrc = this.querySelector('img').src;
                mainImage.src = newSrc;

                thumbs.forEach(t => t.classList.remove('active'));
                this.classList.add('active');
            });
        });
    }

    // ===== Notification Toast =====
    window.showToast = function(message, type = 'info', duration = 3000) {
        const existingToast = document.querySelector('.toast');
        if (existingToast) {
            existingToast.remove();
        }

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <span>${message}</span>
            <button class="toast-close">&times;</button>
        `;

        document.body.appendChild(toast);

        // Trigger animation
        setTimeout(() => toast.classList.add('visible'), 10);

        // Auto close
        const timeout = setTimeout(() => {
            toast.classList.remove('visible');
            setTimeout(() => toast.remove(), 300);
        }, duration);

        // Manual close
        toast.querySelector('.toast-close').addEventListener('click', () => {
            clearTimeout(timeout);
            toast.classList.remove('visible');
            setTimeout(() => toast.remove(), 300);
        });
    };

    // ===== Utility Functions =====
    window.NaturabioUtils = {
        // Format price
        formatPrice: function(price) {
            return new Intl.NumberFormat('fr-FR', {
                style: 'currency',
                currency: 'EUR'
            }).format(price);
        },

        // Debounce function
        debounce: function(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        },

        // Throttle function
        throttle: function(func, limit) {
            let inThrottle;
            return function(...args) {
                if (!inThrottle) {
                    func.apply(this, args);
                    inThrottle = true;
                    setTimeout(() => inThrottle = false, limit);
                }
            };
        },

        // Get URL parameter
        getUrlParam: function(param) {
            const urlParams = new URLSearchParams(window.location.search);
            return urlParams.get(param);
        },

        // Set URL parameter
        setUrlParam: function(param, value) {
            const url = new URL(window.location);
            url.searchParams.set(param, value);
            window.history.pushState({}, '', url);
        },

        // Remove URL parameter
        removeUrlParam: function(param) {
            const url = new URL(window.location);
            url.searchParams.delete(param);
            window.history.pushState({}, '', url);
        }
    };

    // ===== Hero Slideshow =====
    function initHeroSlideshow() {
        const slideshow = document.querySelector('.hero-slideshow');
        if (!slideshow) return;

        const slides = slideshow.querySelectorAll('.hero-slide');
        const dots = slideshow.querySelectorAll('.hero-dot');
        const prevBtn = slideshow.querySelector('.hero-arrow-prev');
        const nextBtn = slideshow.querySelector('.hero-arrow-next');

        if (slides.length === 0) return;

        let currentSlide = 0;
        let autoplayInterval;
        const autoplayDelay = 5000; // 5 seconds

        function showSlide(index) {
            // Handle wraparound
            if (index >= slides.length) index = 0;
            if (index < 0) index = slides.length - 1;

            // Update slides
            slides.forEach((slide, i) => {
                slide.classList.toggle('active', i === index);
            });

            // Update dots
            dots.forEach((dot, i) => {
                dot.classList.toggle('active', i === index);
            });

            currentSlide = index;
        }

        function nextSlide() {
            showSlide(currentSlide + 1);
        }

        function prevSlide() {
            showSlide(currentSlide - 1);
        }

        function startAutoplay() {
            stopAutoplay();
            autoplayInterval = setInterval(nextSlide, autoplayDelay);
        }

        function stopAutoplay() {
            if (autoplayInterval) {
                clearInterval(autoplayInterval);
            }
        }

        // Event listeners
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                nextSlide();
                startAutoplay(); // Reset autoplay timer
            });
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                prevSlide();
                startAutoplay(); // Reset autoplay timer
            });
        }

        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                showSlide(index);
                startAutoplay(); // Reset autoplay timer
            });
        });

        // Pause on hover
        slideshow.addEventListener('mouseenter', stopAutoplay);
        slideshow.addEventListener('mouseleave', startAutoplay);

        // Touch/swipe support
        let touchStartX = 0;
        let touchEndX = 0;

        slideshow.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        slideshow.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            const diff = touchStartX - touchEndX;

            if (Math.abs(diff) > 50) { // Minimum swipe distance
                if (diff > 0) {
                    nextSlide();
                } else {
                    prevSlide();
                }
                startAutoplay();
            }
        }, { passive: true });

        // Start autoplay
        startAutoplay();
    }

    // ===== Initialize All =====
    function init() {
        initHeaderScroll();
        initMobileNav();
        initActiveNavLink();
        initSmoothScroll();
        initBackToTop();
        initAccordions();
        initTabs();
        initModals();
        initQuantitySelectors();
        initScrollAnimations();
        initFormValidation();
        initLazyLoading();
        initProductGallery();
        initHeroSlideshow();

        // Mark page as loaded
        document.body.classList.add('loaded');
    }

    // Run on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
