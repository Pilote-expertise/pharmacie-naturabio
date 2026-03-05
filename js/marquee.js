/**
 * PHARMACIE NATURABIO - Marquee JavaScript
 * Scrolling Banner / Product Carousel
 */

(function() {
    'use strict';

    // ===== Marquee Configuration =====
    const CONFIG = {
        speed: 30, // seconds for full cycle
        pauseOnHover: true,
        duplicateContent: true
    };

    // ===== Marquee Data =====
    const marqueeItems = [
        {
            type: 'product',
            text: 'Nouveauté : Vitamine C Liposomale',
            image: 'assets/images/placeholders/product-thumb.jpg'
        },
        {
            type: 'info',
            text: 'Livraison gratuite dès 49€ d\'achat'
        },
        {
            type: 'product',
            text: 'Huile Essentielle de Ravintsara Bio',
            image: 'assets/images/placeholders/product-thumb.jpg'
        },
        {
            type: 'event',
            text: 'Atelier Aromathérapie - Samedi 25 janvier'
        },
        {
            type: 'promo',
            text: '-20% sur la gamme Puressentiel'
        },
        {
            type: 'product',
            text: 'Coffret Immunité Hiver',
            image: 'assets/images/placeholders/product-thumb.jpg'
        },
        {
            type: 'info',
            text: 'Click & Collect disponible'
        },
        {
            type: 'product',
            text: 'Spiruline Bio Française',
            image: 'assets/images/placeholders/product-thumb.jpg'
        }
    ];

    // ===== Initialize Marquee =====
    function initMarquee() {
        const marqueeContainer = document.querySelector('.marquee');
        if (!marqueeContainer) return;

        const marqueeContent = marqueeContainer.querySelector('.marquee-content');
        if (!marqueeContent) return;

        // Generate marquee items
        const itemsHTML = generateMarqueeItems(marqueeItems);

        // Duplicate content for seamless loop
        if (CONFIG.duplicateContent) {
            marqueeContent.innerHTML = itemsHTML + itemsHTML;
        } else {
            marqueeContent.innerHTML = itemsHTML;
        }

        // Set animation speed
        marqueeContent.style.animationDuration = `${CONFIG.speed}s`;

        // Pause on hover
        if (CONFIG.pauseOnHover) {
            marqueeContainer.addEventListener('mouseenter', () => {
                marqueeContent.style.animationPlayState = 'paused';
            });

            marqueeContainer.addEventListener('mouseleave', () => {
                marqueeContent.style.animationPlayState = 'running';
            });
        }
    }

    // ===== Generate Marquee Items HTML =====
    function generateMarqueeItems(items) {
        return items.map((item, index) => {
            let html = '<div class="marquee-item">';

            if (item.image) {
                html += `<img src="${item.image}" alt="" class="placeholder-image">`;
            }

            html += `<span>${item.text}</span>`;
            html += '</div>';

            // Add divider between items
            if (index < items.length - 1) {
                html += '<div class="marquee-divider"></div>';
            }

            return html;
        }).join('');
    }

    // ===== Dynamic Marquee Update =====
    window.updateMarquee = function(newItems) {
        const marqueeContent = document.querySelector('.marquee-content');
        if (!marqueeContent) return;

        const itemsHTML = generateMarqueeItems(newItems);
        marqueeContent.innerHTML = CONFIG.duplicateContent ? itemsHTML + itemsHTML : itemsHTML;
    };

    // ===== Seasonal Marquee Messages =====
    function getSeasonalMessages() {
        const month = new Date().getMonth();
        const messages = [];

        // Winter (Dec, Jan, Feb)
        if (month === 11 || month === 0 || month === 1) {
            messages.push({
                type: 'info',
                text: 'Renforcez votre immunité avec nos produits naturels'
            });
            messages.push({
                type: 'product',
                text: 'Cure Vitamine D + Zinc',
                image: 'assets/images/placeholders/product-thumb.jpg'
            });
        }

        // Spring (Mar, Apr, May)
        if (month >= 2 && month <= 4) {
            messages.push({
                type: 'info',
                text: 'Préparez-vous aux allergies saisonnières'
            });
            messages.push({
                type: 'product',
                text: 'Spray nasal naturel anti-allergies',
                image: 'assets/images/placeholders/product-thumb.jpg'
            });
        }

        // Summer (Jun, Jul, Aug)
        if (month >= 5 && month <= 7) {
            messages.push({
                type: 'info',
                text: 'Protégez votre peau naturellement cet été'
            });
            messages.push({
                type: 'product',
                text: 'Huile solaire naturelle SPF30',
                image: 'assets/images/placeholders/product-thumb.jpg'
            });
        }

        // Autumn (Sep, Oct, Nov)
        if (month >= 8 && month <= 10) {
            messages.push({
                type: 'info',
                text: 'Boostez votre énergie pour la rentrée'
            });
            messages.push({
                type: 'product',
                text: 'Spiruline & Ginseng Bio',
                image: 'assets/images/placeholders/product-thumb.jpg'
            });
        }

        return messages;
    }

    // ===== Initialize with Seasonal Content =====
    function initSeasonalMarquee() {
        const seasonalMessages = getSeasonalMessages();
        const allItems = [...marqueeItems, ...seasonalMessages];

        // Shuffle items for variety
        const shuffled = allItems.sort(() => Math.random() - 0.5);

        const marqueeContent = document.querySelector('.marquee-content');
        if (!marqueeContent) return;

        const itemsHTML = generateMarqueeItems(shuffled);
        marqueeContent.innerHTML = CONFIG.duplicateContent ? itemsHTML + itemsHTML : itemsHTML;
    }

    // ===== Run on DOM Ready =====
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initMarquee);
    } else {
        initMarquee();
    }

})();
