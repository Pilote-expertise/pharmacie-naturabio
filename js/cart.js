/**
 * PHARMACIE NATURABIO - Cart JavaScript
 * Shopping Cart Management with localStorage
 */

(function() {
    'use strict';

    // ===== Cart Configuration =====
    const CART_KEY = 'naturabio_cart';
    const DELIVERY_OPTIONS = {
        clickCollect: { id: 'click-collect', name: 'Click & Collect', price: 0, delay: '2h' },
        standard: { id: 'standard', name: 'Livraison Standard', price: 4.90, delay: '3-5 jours' },
        express: { id: 'express', name: 'Livraison Express', price: 9.90, delay: '24h' }
    };
    const FREE_DELIVERY_THRESHOLD = 49;

    // ===== Cart State =====
    let cart = {
        items: [],
        delivery: DELIVERY_OPTIONS.clickCollect,
        loyaltyPoints: 0
    };

    // ===== Initialize Cart =====
    function init() {
        loadCart();
        updateCartUI();
        bindEvents();
    }

    // ===== Load Cart from localStorage =====
    function loadCart() {
        try {
            const savedCart = localStorage.getItem(CART_KEY);
            if (savedCart) {
                const parsed = JSON.parse(savedCart);
                cart.items = parsed.items || [];
                cart.delivery = parsed.delivery || DELIVERY_OPTIONS.clickCollect;
                cart.loyaltyPoints = parsed.loyaltyPoints || 0;
            }
        } catch (e) {
            console.error('Error loading cart:', e);
            cart.items = [];
        }
    }

    // ===== Save Cart to localStorage =====
    function saveCart() {
        try {
            localStorage.setItem(CART_KEY, JSON.stringify(cart));
        } catch (e) {
            console.error('Error saving cart:', e);
        }
    }

    // ===== Add Item to Cart =====
    function addItem(product, quantity = 1) {
        const existingItem = cart.items.find(item => item.id === product.id);

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.items.push({
                id: product.id,
                name: product.name,
                brand: product.brand,
                price: product.price,
                oldPrice: product.oldPrice,
                image: product.images ? product.images[0] : 'placeholder.jpg',
                quantity: quantity
            });
        }

        saveCart();
        updateCartUI();

        // Show notification
        if (typeof showToast === 'function') {
            showToast(`${product.name} ajouté au panier`, 'success');
        }

        return true;
    }

    // ===== Remove Item from Cart =====
    function removeItem(productId) {
        const index = cart.items.findIndex(item => item.id === productId);
        if (index > -1) {
            const removedItem = cart.items[index];
            cart.items.splice(index, 1);
            saveCart();
            updateCartUI();

            if (typeof showToast === 'function') {
                showToast(`${removedItem.name} retiré du panier`, 'info');
            }
        }
    }

    // ===== Update Item Quantity =====
    function updateQuantity(productId, quantity) {
        const item = cart.items.find(item => item.id === productId);
        if (item) {
            if (quantity <= 0) {
                removeItem(productId);
            } else {
                item.quantity = quantity;
                saveCart();
                updateCartUI();
            }
        }
    }

    // ===== Clear Cart =====
    function clearCart() {
        cart.items = [];
        cart.delivery = DELIVERY_OPTIONS.clickCollect;
        saveCart();
        updateCartUI();
    }

    // ===== Get Cart Totals =====
    function getTotals() {
        const subtotal = cart.items.reduce((sum, item) => {
            return sum + (item.price * item.quantity);
        }, 0);

        const deliveryPrice = subtotal >= FREE_DELIVERY_THRESHOLD && cart.delivery.id !== 'express'
            ? 0
            : cart.delivery.price;

        const total = subtotal + deliveryPrice;
        const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);
        const savings = cart.items.reduce((sum, item) => {
            if (item.oldPrice) {
                return sum + ((item.oldPrice - item.price) * item.quantity);
            }
            return sum;
        }, 0);

        // Calculate loyalty points (1 point per euro spent)
        const pointsEarned = Math.floor(total);

        return {
            subtotal,
            deliveryPrice,
            total,
            itemCount,
            savings,
            pointsEarned,
            freeDeliveryRemaining: Math.max(0, FREE_DELIVERY_THRESHOLD - subtotal)
        };
    }

    // ===== Set Delivery Option =====
    function setDelivery(deliveryId) {
        const option = Object.values(DELIVERY_OPTIONS).find(d => d.id === deliveryId);
        if (option) {
            cart.delivery = option;
            saveCart();
            updateCartUI();
        }
    }

    // ===== Update Cart UI =====
    function updateCartUI() {
        const totals = getTotals();

        // Update cart count in header
        const cartCountElements = document.querySelectorAll('.cart-count');
        cartCountElements.forEach(el => {
            el.textContent = totals.itemCount > 0 ? totals.itemCount : '';
        });

        // Update cart page if present
        updateCartPage();
    }

    // ===== Update Cart Page =====
    function updateCartPage() {
        const cartItemsContainer = document.querySelector('.cart-items');
        const cartSummary = document.querySelector('.cart-summary');
        const cartEmpty = document.querySelector('.cart-empty');

        if (!cartItemsContainer) return;

        const totals = getTotals();

        // Show/hide empty state
        if (cart.items.length === 0) {
            cartItemsContainer.style.display = 'none';
            if (cartSummary) cartSummary.style.display = 'none';
            if (cartEmpty) cartEmpty.style.display = 'block';
            return;
        }

        cartItemsContainer.style.display = 'block';
        if (cartSummary) cartSummary.style.display = 'block';
        if (cartEmpty) cartEmpty.style.display = 'none';

        // Render cart items
        cartItemsContainer.innerHTML = cart.items.map(item => `
            <div class="cart-item" data-id="${item.id}">
                <div class="cart-item-image">
                    <div class="placeholder-image"></div>
                </div>
                <div class="cart-item-info">
                    <h3>${item.name}</h3>
                    <p>${item.brand}</p>
                </div>
                <div class="quantity-selector">
                    <button data-quantity="minus" aria-label="Diminuer la quantité">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                    </button>
                    <input type="number" value="${item.quantity}" min="1" max="99" aria-label="Quantité">
                    <button data-quantity="plus" aria-label="Augmenter la quantité">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                    </button>
                </div>
                <div class="cart-item-price">${formatPrice(item.price * item.quantity)}</div>
                <button class="cart-item-remove" aria-label="Supprimer">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3,6 5,6 21,6"></polyline>
                        <path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6M8,6V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2V6"></path>
                        <line x1="10" y1="11" x2="10" y2="17"></line>
                        <line x1="14" y1="11" x2="14" y2="17"></line>
                    </svg>
                </button>
            </div>
        `).join('');

        // Render cart summary
        if (cartSummary) {
            const deliveryOptionsHTML = Object.values(DELIVERY_OPTIONS).map(option => {
                const isSelected = cart.delivery.id === option.id;
                const isFree = option.id === 'click-collect' || (totals.subtotal >= FREE_DELIVERY_THRESHOLD && option.id !== 'express');
                const displayPrice = isFree ? 'Gratuit' : formatPrice(option.price);

                return `
                    <label class="delivery-option ${isSelected ? 'selected' : ''}">
                        <input type="radio" name="delivery" value="${option.id}" ${isSelected ? 'checked' : ''}>
                        <div class="delivery-option-info">
                            <h4>${option.name}</h4>
                            <p>Disponible sous ${option.delay}</p>
                        </div>
                        <span class="delivery-option-price">${displayPrice}</span>
                    </label>
                `;
            }).join('');

            cartSummary.innerHTML = `
                <h3>Récapitulatif</h3>

                <div class="cart-summary-row">
                    <span>Sous-total</span>
                    <span>${formatPrice(totals.subtotal)}</span>
                </div>

                ${totals.savings > 0 ? `
                    <div class="cart-summary-row" style="color: var(--color-success);">
                        <span>Économies</span>
                        <span>-${formatPrice(totals.savings)}</span>
                    </div>
                ` : ''}

                <div class="cart-delivery-options">
                    <h4>Mode de livraison</h4>
                    ${deliveryOptionsHTML}
                </div>

                ${totals.freeDeliveryRemaining > 0 ? `
                    <div class="alert alert-info" style="margin-bottom: var(--spacing-md);">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="16" x2="12" y2="12"></line>
                            <line x1="12" y1="8" x2="12.01" y2="8"></line>
                        </svg>
                        <div class="alert-content">
                            Plus que ${formatPrice(totals.freeDeliveryRemaining)} pour bénéficier de la livraison gratuite !
                        </div>
                    </div>
                ` : ''}

                <div class="cart-summary-row">
                    <span>Livraison</span>
                    <span>${totals.deliveryPrice === 0 ? 'Gratuit' : formatPrice(totals.deliveryPrice)}</span>
                </div>

                <div class="cart-summary-row total">
                    <span>Total</span>
                    <span>${formatPrice(totals.total)}</span>
                </div>

                <div style="font-size: var(--text-sm); color: var(--color-text-muted); margin-top: var(--spacing-md);">
                    <p>Vous gagnez <strong>${totals.pointsEarned} points fidélité</strong> avec cette commande.</p>
                    <p style="font-size: var(--text-xs); margin-top: 4px;">Points cumulés sur les produits parapharmacie uniquement (hors médicaments).</p>
                </div>

                <button class="btn btn-primary btn-block" style="margin-top: var(--spacing-lg);">
                    Passer la commande
                </button>

                <p style="font-size: var(--text-xs); color: var(--color-text-muted); text-align: center; margin-top: var(--spacing-md);">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle;">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                        <path d="M7,11V7a5,5,0,0,1,10,0v4"></path>
                    </svg>
                    Paiement 100% sécurisé
                </p>
            `;
        }

        // Rebind cart events
        bindCartPageEvents();
    }

    // ===== Bind Cart Page Events =====
    function bindCartPageEvents() {
        // Quantity selectors
        document.querySelectorAll('.cart-item .quantity-selector').forEach(selector => {
            const cartItem = selector.closest('.cart-item');
            const productId = parseInt(cartItem.dataset.id);
            const minusBtn = selector.querySelector('[data-quantity="minus"]');
            const plusBtn = selector.querySelector('[data-quantity="plus"]');
            const input = selector.querySelector('input');

            minusBtn.addEventListener('click', () => {
                const newQuantity = parseInt(input.value) - 1;
                updateQuantity(productId, newQuantity);
            });

            plusBtn.addEventListener('click', () => {
                const newQuantity = parseInt(input.value) + 1;
                updateQuantity(productId, newQuantity);
            });

            input.addEventListener('change', () => {
                updateQuantity(productId, parseInt(input.value));
            });
        });

        // Remove buttons
        document.querySelectorAll('.cart-item-remove').forEach(btn => {
            btn.addEventListener('click', () => {
                const cartItem = btn.closest('.cart-item');
                const productId = parseInt(cartItem.dataset.id);
                removeItem(productId);
            });
        });

        // Delivery options
        document.querySelectorAll('input[name="delivery"]').forEach(radio => {
            radio.addEventListener('change', () => {
                setDelivery(radio.value);
            });
        });
    }

    // ===== Bind Global Events =====
    function bindEvents() {
        // Add to cart buttons
        document.addEventListener('click', (e) => {
            const addToCartBtn = e.target.closest('[data-add-to-cart]');
            if (addToCartBtn) {
                e.preventDefault();
                const productData = addToCartBtn.dataset.addToCart;
                try {
                    const product = JSON.parse(productData);
                    addItem(product);
                } catch (err) {
                    console.error('Invalid product data:', err);
                }
            }
        });
    }

    // ===== Format Price =====
    function formatPrice(price) {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR'
        }).format(price);
    }

    // ===== Public API =====
    window.NaturabioCart = {
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        getTotals,
        setDelivery,
        getItems: () => [...cart.items],
        getDelivery: () => cart.delivery
    };

    // ===== Initialize =====
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
