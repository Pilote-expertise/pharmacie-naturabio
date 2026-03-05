/**
 * PHARMACIE NATURABIO - Search & Filters JavaScript
 * Product Search and Filtering System
 */

(function() {
    'use strict';

    // ===== Configuration =====
    const CONFIG = {
        productsPerPage: 12,
        searchDelay: 300,
        dataPath: 'data/products.json'
    };

    // ===== State =====
    let state = {
        products: [],
        filteredProducts: [],
        categories: [],
        benefits: [],
        filters: {
            search: '',
            category: null,
            subcategory: null,
            benefits: [],
            priceMin: 0,
            priceMax: 100,
            badges: [],
            sort: 'relevance'
        },
        currentPage: 1
    };

    // ===== Initialize =====
    async function init() {
        await loadProducts();
        bindEvents();
        applyFiltersFromURL();
        renderProducts();
        renderFilters();
    }

    // ===== Load Products =====
    async function loadProducts() {
        try {
            const response = await fetch(CONFIG.dataPath);
            const data = await response.json();
            state.products = data.products || [];
            state.categories = data.categories || [];
            state.benefits = data.benefits || [];
            state.filteredProducts = [...state.products];

            // Calculate price range
            if (state.products.length > 0) {
                const prices = state.products.map(p => p.price);
                state.filters.priceMax = Math.ceil(Math.max(...prices));
            }
        } catch (error) {
            console.error('Error loading products:', error);
            state.products = [];
            state.filteredProducts = [];
        }
    }

    // ===== Apply Filters =====
    function applyFilters() {
        let filtered = [...state.products];

        // Search filter
        if (state.filters.search) {
            const searchLower = state.filters.search.toLowerCase();
            filtered = filtered.filter(product => {
                return product.name.toLowerCase().includes(searchLower) ||
                       product.brand.toLowerCase().includes(searchLower) ||
                       product.description.toLowerCase().includes(searchLower) ||
                       (product.benefits && product.benefits.some(b => b.includes(searchLower)));
            });
        }

        // Category filter
        if (state.filters.category) {
            filtered = filtered.filter(product => product.category === state.filters.category);
        }

        // Subcategory filter
        if (state.filters.subcategory) {
            filtered = filtered.filter(product => product.subcategory === state.filters.subcategory);
        }

        // Benefits filter
        if (state.filters.benefits.length > 0) {
            filtered = filtered.filter(product => {
                return state.filters.benefits.every(benefit =>
                    product.benefits && product.benefits.includes(benefit)
                );
            });
        }

        // Price filter
        filtered = filtered.filter(product => {
            return product.price >= state.filters.priceMin &&
                   product.price <= state.filters.priceMax;
        });

        // Badges filter (bio, nouveau, promo)
        if (state.filters.badges.length > 0) {
            filtered = filtered.filter(product => {
                return state.filters.badges.some(badge =>
                    product.badges && product.badges.includes(badge)
                );
            });
        }

        // Sort
        switch (state.filters.sort) {
            case 'price-asc':
                filtered.sort((a, b) => a.price - b.price);
                break;
            case 'price-desc':
                filtered.sort((a, b) => b.price - a.price);
                break;
            case 'name':
                filtered.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'rating':
                filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
                break;
            case 'newest':
                filtered.sort((a, b) => {
                    const aNew = a.badges && a.badges.includes('nouveau') ? 1 : 0;
                    const bNew = b.badges && b.badges.includes('nouveau') ? 1 : 0;
                    return bNew - aNew;
                });
                break;
            default: // relevance
                // Keep original order or sort by rating
                filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        }

        state.filteredProducts = filtered;
        state.currentPage = 1;
        updateURL();
        renderProducts();
        updateResultsCount();
    }

    // ===== Render Products =====
    function renderProducts() {
        const container = document.querySelector('.products-grid');
        if (!container) return;

        const start = (state.currentPage - 1) * CONFIG.productsPerPage;
        const end = start + CONFIG.productsPerPage;
        const pageProducts = state.filteredProducts.slice(start, end);

        if (pageProducts.length === 0) {
            container.innerHTML = `
                <div class="empty-state" style="grid-column: 1 / -1;">
                    <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                    <h3 class="empty-state-title">Aucun produit trouvé</h3>
                    <p class="empty-state-text">Essayez de modifier vos critères de recherche</p>
                    <button class="btn btn-primary" onclick="NaturabioSearch.resetFilters()">
                        Réinitialiser les filtres
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = pageProducts.map(product => renderProductCard(product)).join('');
        renderPagination();
    }

    // ===== Render Product Card =====
    function renderProductCard(product) {
        const badges = (product.badges || []).map(badge => {
            const badgeClass = badge === 'nouveau' ? 'badge-new' :
                              badge === 'promo' ? 'badge-promo' :
                              badge === 'bio' ? 'badge-bio' : 'badge-primary';
            const badgeText = badge === 'nouveau' ? 'Nouveau' :
                             badge === 'promo' ? 'Promo' :
                             badge === 'bio' ? 'Bio' : badge;
            return `<span class="badge ${badgeClass}">${badgeText}</span>`;
        }).join('');

        const priceHTML = product.oldPrice
            ? `<span class="product-price">${formatPrice(product.price)}</span>
               <span class="product-price-old">${formatPrice(product.oldPrice)}</span>`
            : `<span class="product-price">${formatPrice(product.price)}</span>`;

        const productDataJSON = JSON.stringify({
            id: product.id,
            name: product.name,
            brand: product.brand,
            price: product.price,
            oldPrice: product.oldPrice,
            images: product.images
        }).replace(/"/g, '&quot;');

        return `
            <article class="card product-card">
                <a href="produit.html?id=${product.id}" class="card-image">
                    <div class="placeholder-image"></div>
                    <div class="product-badges">${badges}</div>
                    <div class="product-actions">
                        <button class="action-btn tooltip" data-tooltip="Ajouter aux favoris" aria-label="Ajouter aux favoris">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                            </svg>
                        </button>
                        <button class="action-btn tooltip" data-tooltip="Aperçu rapide" aria-label="Aperçu rapide">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                        </button>
                    </div>
                </a>
                <div class="card-body">
                    <p class="product-brand">${product.brand}</p>
                    <h3 class="product-name">
                        <a href="produit.html?id=${product.id}">${product.name}</a>
                    </h3>
                    <div>${priceHTML}</div>
                    <button class="btn btn-primary btn-sm btn-block add-to-cart"
                            data-add-to-cart="${productDataJSON}">
                        Ajouter au panier
                    </button>
                </div>
            </article>
        `;
    }

    // ===== Render Filters =====
    function renderFilters() {
        renderCategoryFilters();
        renderBenefitsFilters();
        renderPriceFilter();
        renderBadgeFilters();
    }

    // ===== Render Category Filters =====
    function renderCategoryFilters() {
        const container = document.querySelector('[data-filter="categories"]');
        if (!container) return;

        const html = state.categories.map(category => {
            const productCount = state.products.filter(p => p.category === category.id).length;
            const isActive = state.filters.category === category.id;

            const subcategoriesHTML = category.subcategories ? category.subcategories.map(sub => {
                const subCount = state.products.filter(p => p.subcategory === sub.id).length;
                const subActive = state.filters.subcategory === sub.id;
                return `
                    <label class="filter-option filter-sub">
                        <input type="radio" name="subcategory" value="${sub.id}" ${subActive ? 'checked' : ''}>
                        ${sub.name} <span>(${subCount})</span>
                    </label>
                `;
            }).join('') : '';

            return `
                <div class="filter-category ${isActive ? 'active' : ''}">
                    <label class="filter-option">
                        <input type="radio" name="category" value="${category.id}" ${isActive ? 'checked' : ''}>
                        ${category.name} <span>(${productCount})</span>
                    </label>
                    ${isActive && subcategoriesHTML ? `<div class="filter-subcategories">${subcategoriesHTML}</div>` : ''}
                </div>
            `;
        }).join('');

        container.innerHTML = `
            <label class="filter-option">
                <input type="radio" name="category" value="" ${!state.filters.category ? 'checked' : ''}>
                Toutes les catégories
            </label>
            ${html}
        `;
    }

    // ===== Render Benefits Filters =====
    function renderBenefitsFilters() {
        const container = document.querySelector('[data-filter="benefits"]');
        if (!container) return;

        container.innerHTML = state.benefits.map(benefit => {
            const productCount = state.products.filter(p =>
                p.benefits && p.benefits.includes(benefit.id)
            ).length;
            const isChecked = state.filters.benefits.includes(benefit.id);

            return `
                <label class="filter-option">
                    <input type="checkbox" name="benefit" value="${benefit.id}" ${isChecked ? 'checked' : ''}>
                    ${benefit.name} <span>(${productCount})</span>
                </label>
            `;
        }).join('');
    }

    // ===== Render Price Filter =====
    function renderPriceFilter() {
        const container = document.querySelector('[data-filter="price"]');
        if (!container) return;

        const maxPrice = Math.ceil(Math.max(...state.products.map(p => p.price)));

        container.innerHTML = `
            <div class="price-range">
                <input type="range" min="0" max="${maxPrice}"
                       value="${state.filters.priceMax}" id="price-range">
                <div class="price-range-values">
                    <span>${formatPrice(state.filters.priceMin)}</span>
                    <span>${formatPrice(state.filters.priceMax)}</span>
                </div>
            </div>
        `;
    }

    // ===== Render Badge Filters =====
    function renderBadgeFilters() {
        const container = document.querySelector('[data-filter="badges"]');
        if (!container) return;

        const badgeOptions = [
            { id: 'bio', name: 'Bio' },
            { id: 'nouveau', name: 'Nouveautés' },
            { id: 'promo', name: 'Promotions' }
        ];

        container.innerHTML = badgeOptions.map(badge => {
            const count = state.products.filter(p =>
                p.badges && p.badges.includes(badge.id)
            ).length;
            const isChecked = state.filters.badges.includes(badge.id);

            return `
                <label class="filter-option">
                    <input type="checkbox" name="badge" value="${badge.id}" ${isChecked ? 'checked' : ''}>
                    ${badge.name} <span>(${count})</span>
                </label>
            `;
        }).join('');
    }

    // ===== Render Pagination =====
    function renderPagination() {
        const container = document.querySelector('.pagination');
        if (!container) return;

        const totalPages = Math.ceil(state.filteredProducts.length / CONFIG.productsPerPage);
        if (totalPages <= 1) {
            container.innerHTML = '';
            return;
        }

        let html = '';

        // Previous button
        html += `
            <button class="pagination-btn" ${state.currentPage === 1 ? 'disabled' : ''} data-page="${state.currentPage - 1}">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="15,18 9,12 15,6"></polyline>
                </svg>
            </button>
        `;

        // Page numbers
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= state.currentPage - 1 && i <= state.currentPage + 1)) {
                html += `
                    <button class="pagination-btn ${i === state.currentPage ? 'active' : ''}" data-page="${i}">
                        ${i}
                    </button>
                `;
            } else if (i === state.currentPage - 2 || i === state.currentPage + 2) {
                html += '<span class="pagination-dots">...</span>';
            }
        }

        // Next button
        html += `
            <button class="pagination-btn" ${state.currentPage === totalPages ? 'disabled' : ''} data-page="${state.currentPage + 1}">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="9,18 15,12 9,6"></polyline>
                </svg>
            </button>
        `;

        container.innerHTML = html;
    }

    // ===== Update Results Count =====
    function updateResultsCount() {
        const countElement = document.querySelector('.results-count');
        if (countElement) {
            countElement.textContent = `${state.filteredProducts.length} produit${state.filteredProducts.length > 1 ? 's' : ''} trouvé${state.filteredProducts.length > 1 ? 's' : ''}`;
        }
    }

    // ===== Bind Events =====
    function bindEvents() {
        // Search input
        const searchInput = document.querySelector('[data-search]');
        if (searchInput) {
            const debouncedSearch = debounce((value) => {
                state.filters.search = value;
                applyFilters();
            }, CONFIG.searchDelay);

            searchInput.addEventListener('input', (e) => {
                debouncedSearch(e.target.value);
            });
        }

        // Sort select
        const sortSelect = document.querySelector('[data-sort]');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                state.filters.sort = e.target.value;
                applyFilters();
            });
        }

        // Category filters
        document.addEventListener('change', (e) => {
            if (e.target.name === 'category') {
                state.filters.category = e.target.value || null;
                state.filters.subcategory = null;
                renderCategoryFilters();
                applyFilters();
            }

            if (e.target.name === 'subcategory') {
                state.filters.subcategory = e.target.value || null;
                applyFilters();
            }

            if (e.target.name === 'benefit') {
                if (e.target.checked) {
                    state.filters.benefits.push(e.target.value);
                } else {
                    state.filters.benefits = state.filters.benefits.filter(b => b !== e.target.value);
                }
                applyFilters();
            }

            if (e.target.name === 'badge') {
                if (e.target.checked) {
                    state.filters.badges.push(e.target.value);
                } else {
                    state.filters.badges = state.filters.badges.filter(b => b !== e.target.value);
                }
                applyFilters();
            }
        });

        // Price range
        document.addEventListener('input', (e) => {
            if (e.target.id === 'price-range') {
                state.filters.priceMax = parseInt(e.target.value);
                const priceDisplay = document.querySelector('.price-range-values span:last-child');
                if (priceDisplay) {
                    priceDisplay.textContent = formatPrice(state.filters.priceMax);
                }
            }
        });

        document.addEventListener('change', (e) => {
            if (e.target.id === 'price-range') {
                applyFilters();
            }
        });

        // Pagination
        document.addEventListener('click', (e) => {
            const pageBtn = e.target.closest('[data-page]');
            if (pageBtn && !pageBtn.disabled) {
                state.currentPage = parseInt(pageBtn.dataset.page);
                renderProducts();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });

        // Reset filters
        const resetBtn = document.querySelector('[data-reset-filters]');
        if (resetBtn) {
            resetBtn.addEventListener('click', resetFilters);
        }
    }

    // ===== Reset Filters =====
    function resetFilters() {
        state.filters = {
            search: '',
            category: null,
            subcategory: null,
            benefits: [],
            priceMin: 0,
            priceMax: Math.ceil(Math.max(...state.products.map(p => p.price))),
            badges: [],
            sort: 'relevance'
        };

        const searchInput = document.querySelector('[data-search]');
        if (searchInput) searchInput.value = '';

        const sortSelect = document.querySelector('[data-sort]');
        if (sortSelect) sortSelect.value = 'relevance';

        renderFilters();
        applyFilters();
    }

    // ===== URL State Management =====
    function updateURL() {
        const params = new URLSearchParams();

        if (state.filters.search) params.set('q', state.filters.search);
        if (state.filters.category) params.set('cat', state.filters.category);
        if (state.filters.subcategory) params.set('sub', state.filters.subcategory);
        if (state.filters.benefits.length) params.set('ben', state.filters.benefits.join(','));
        if (state.filters.badges.length) params.set('badge', state.filters.badges.join(','));
        if (state.filters.sort !== 'relevance') params.set('sort', state.filters.sort);

        const newURL = params.toString() ? `?${params.toString()}` : window.location.pathname;
        window.history.replaceState({}, '', newURL);
    }

    function applyFiltersFromURL() {
        const params = new URLSearchParams(window.location.search);

        if (params.has('q')) state.filters.search = params.get('q');
        if (params.has('cat')) state.filters.category = params.get('cat');
        if (params.has('sub')) state.filters.subcategory = params.get('sub');
        if (params.has('ben')) state.filters.benefits = params.get('ben').split(',');
        if (params.has('badge')) state.filters.badges = params.get('badge').split(',');
        if (params.has('sort')) state.filters.sort = params.get('sort');

        // Update UI
        const searchInput = document.querySelector('[data-search]');
        if (searchInput) searchInput.value = state.filters.search;

        const sortSelect = document.querySelector('[data-sort]');
        if (sortSelect) sortSelect.value = state.filters.sort;

        applyFilters();
    }

    // ===== Utility Functions =====
    function formatPrice(price) {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR'
        }).format(price);
    }

    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // ===== Public API =====
    window.NaturabioSearch = {
        init,
        applyFilters,
        resetFilters,
        getProducts: () => state.filteredProducts,
        getFilters: () => state.filters
    };

    // ===== Initialize on DOM Ready =====
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
