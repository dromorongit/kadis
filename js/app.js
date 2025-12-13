// Global variables
let products = [];
let cart = [];
const OWNER_WHATSAPP_NUMBER = '2330538380937'; // WhatsApp Business phone number

// DOM ready
document.addEventListener('DOMContentLoaded', async function() {
    await loadProducts();
    loadCart();
    updateCartCount();
    setupEventListeners();
    initializePage();
});

// Load products from API
async function loadProducts() {
    try {
        const response = await fetch('https://kadis-production.up.railway.app/api/products');
        if (response.ok) {
            products = await response.json();
            console.log(`Loaded ${products.length} products from API`);
            console.log('Sample products:', products.slice(0, 3).map(p => ({ id: p.id, title: p.title, category: p.category })));
        } else {
            throw new Error(`API responded with status ${response.status}`);
        }
    } catch (error) {
        console.error('Error loading products from API:', error);
        products = [];
        // Show user-friendly error message
        const productGrids = document.querySelectorAll('.product-grid');
        productGrids.forEach(grid => {
            grid.innerHTML = '<p style="text-align: center; color: #666; padding: 40px;">Unable to load products. Please try again later.</p>';
        });
    }
}

// Cart management
function loadCart() {
    const savedCart = localStorage.getItem('kadisCart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
    }
}

function saveCart() {
    localStorage.setItem('kadisCart', JSON.stringify(cart));
    updateCartCount();
}

function updateCartCount() {
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    const cartCountElements = document.querySelectorAll('#cart-count');
    cartCountElements.forEach(el => el.textContent = count);
}

function sendProductWhatsAppMessage(product, quantity = 1, size = null) {
    const sizeText = size ? ` (Size: ${size})` : '';
    const message = encodeURIComponent(`Hi! I want to buy: ${product.title}${sizeText} - ₵${product.price} (Qty: ${quantity})`);

    const whatsappUrl = `https://wa.me/${OWNER_WHATSAPP_NUMBER}?text=${message}`;
    window.open(whatsappUrl, '_blank');
}

function addToCart(productId, quantity = 1, size = null) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existingItem = cart.find(item => item.id === productId && item.size === size);
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            id: product.id,
            title: product.title,
            price: product.price,
            image: product.images[0],
            quantity: quantity,
            size: size
        });
    }
    saveCart();
    showNotification('Product added to cart!');
    
    // Send WhatsApp message with product details
    sendProductWhatsAppMessage(product, quantity, size);
}

function removeFromCart(index) {
    cart.splice(index, 1);
    saveCart();
    renderCart();
}

function updateCartQuantity(index, quantity) {
    if (quantity <= 0) {
        removeFromCart(index);
    } else {
        cart[index].quantity = quantity;
        saveCart();
        renderCart();
    }
}

// Product rendering
function renderProductCard(product) {
    const oldPriceHtml = product.old_price ? `<span class="old-price">${product.currency}${product.old_price}</span>` : '';
    
    // Handle products with no images or empty images array
    let imageHtml = '';
    if (product.images && product.images.length > 0 && product.images[0]) {
        imageHtml = `<img src="${product.images[0]}" alt="${product.title}" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjUwIiBoZWlnaHQ9IjI1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjhmOWZhIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzZiNzU3NSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg=='">`;
    } else {
        imageHtml = `<div class="no-image-placeholder">No Image Available</div>`;
    }
    
    return `
        <div class="product-card">
            ${imageHtml}
            <h3>${product.title}</h3>
            <p class="price">${product.currency}${product.price} ${oldPriceHtml}</p>
            <p class="description" style="display: none;">${product.description}</p>
            <div class="product-actions">
                <button class="btn btn-primary" onclick="addToCart('${product.id}')">Add to Cart</button>
                <a href="pages/product.html?id=${product.id}" class="btn btn-outline-primary">View More</a>
            </div>
        </div>
    `;
}

function renderProducts(container, filterFn = null) {
    let filteredProducts = filterFn ? products.filter(filterFn) : products;
    container.innerHTML = filteredProducts.map(renderProductCard).join('');
}

function toggleDescription(button) {
    const card = button.closest('.product-card');
    const desc = card.querySelector('.description');
    if (desc.style.display === 'none') {
        desc.style.display = 'block';
        button.textContent = 'View Less';
    } else {
        desc.style.display = 'none';
        button.textContent = 'View More';
    }
}

// Cart rendering
function renderCart() {
    const cartContainer = document.getElementById('cart-items');
    const cartSummary = document.getElementById('cart-summary');

    if (!cartContainer || !cartSummary) return;

    if (cart.length === 0) {
        cartContainer.innerHTML = '<p>Your cart is empty.</p>';
        cartSummary.innerHTML = '<h2>Order Summary</h2><p>Subtotal: ₵0.00</p><p>Shipping: ₵0.00</p><p><strong>Total: ₵0.00</strong></p>';
        return;
    }

    cartContainer.innerHTML = cart.map((item, index) => `
        <div class="cart-item">
            <img src="${item.image}" alt="${item.title}">
            <div class="cart-item-details">
                <h3>${item.title}</h3>
                <p class="price">₵${item.price}</p>
                <p>Size: ${item.size || 'N/A'}</p>
                <label>Quantity: <input type="number" value="${item.quantity}" min="1" onchange="updateCartQuantity(${index}, parseInt(this.value))"></label>
                <button onclick="removeFromCart(${index})">Remove</button>
            </div>
        </div>
    `).join('');

    const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const shipping = subtotal > 100 ? 0 : 10;
    const total = subtotal + shipping;

    cartSummary.innerHTML = `
        <h2>Order Summary</h2>
        <p>Subtotal: ₵${subtotal.toFixed(2)}</p>
        <p>Shipping: ₵${shipping.toFixed(2)}</p>
        <p><strong>Total: ₵${total.toFixed(2)}</strong></p>
        <a href="checkout.html" class="btn btn-primary">Proceed to Checkout</a>
    `;
}

// Product detail page
async function loadProductDetail() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    let product = products.find(p => p.id === productId);

    // If not found in loaded products, try to fetch from API
    if (!product) {
        try {
            const response = await fetch(`https://kadis-production.up.railway.app/api/products/${productId}`);
            if (response.ok) {
                product = await response.json();
            }
        } catch (error) {
            console.error('Error fetching product:', error);
        }
    }

    if (!product) {
        document.querySelector('main').innerHTML = '<p>Product not found.</p>';
        return;
    }

    document.getElementById('product-title').textContent = `${product.title} - Kadi's Collectionz`;
    document.getElementById('main-image').src = `${product.images[0]}`;
    document.getElementById('main-image').alt = product.title;
    document.getElementById('product-name').textContent = product.title;

    // Handle pricing (regular price, old price, promo price)
    let priceHtml = `${product.currency}${product.price}`;
    if (product.old_price) {
        priceHtml += ` <span class="old-price">${product.currency}${product.old_price}</span>`;
    }
    if (product.isPromoActive && product.promoPrice) {
        priceHtml = `${product.currency}${product.promoPrice} <span class="promo-original">${product.currency}${product.price}</span>`;
    }
    document.getElementById('product-price').innerHTML = priceHtml;

    // Descriptions
    document.getElementById('product-short-description').textContent = product.shortDescription || '';
    document.getElementById('product-description').textContent = product.description;

    // Product details
    if (product.brand) {
        document.getElementById('product-brand').textContent = product.brand;
        document.getElementById('brand-info').style.display = 'block';
    }
    if (product.material) {
        document.getElementById('product-material').textContent = product.material;
        document.getElementById('material-info').style.display = 'block';
    }
    if (product.dimensions && (product.dimensions.length || product.dimensions.width || product.dimensions.height)) {
        const dims = product.dimensions;
        document.getElementById('product-dimensions').textContent = `${dims.length || 0} x ${dims.width || 0} x ${dims.height || 0} cm`;
        document.getElementById('dimensions-info').style.display = 'block';
    }
    if (product.weight) {
        document.getElementById('product-weight').textContent = `${product.weight} kg`;
        document.getElementById('weight-info').style.display = 'block';
    }
    if (product.careInstructions) {
        document.getElementById('product-care').textContent = product.careInstructions;
        document.getElementById('care-info').style.display = 'block';
    }

    // Tags
    if (product.tags && product.tags.length > 0) {
        const tagsHtml = product.tags.map(tag => `<span class="tag">${tag}</span>`).join('');
        document.getElementById('product-tags').innerHTML = tagsHtml;
        document.getElementById('tags-section').style.display = 'block';
    }

    // Size selector
    const sizeSelector = document.getElementById('size-selector');
    if (product.sizes && product.sizes.length > 0) {
        sizeSelector.innerHTML = `
            <label for="size">Size:</label>
            <div class="size-options">
                ${product.sizes.map(size => `<div class="size-option" data-size="${size}">${size}</div>`).join('')}
            </div>
        `;
    } else {
        sizeSelector.innerHTML = '';
    }

    // Thumbnails
    const thumbnails = document.getElementById('thumbnails');
    thumbnails.innerHTML = product.images.map((img, index) => `
        <img src="${img}" alt="${product.title} ${index + 1}" onclick="changeMainImage('${img}')" class="${index === 0 ? 'active' : ''}">
    `).join('');

    // Related products
    const relatedProducts = products.filter(p => p.category && product.category && p.category.toLowerCase() === product.category.toLowerCase() && p.id !== product.id).slice(0, 4);
    const relatedContainer = document.getElementById('related-products');
    relatedContainer.innerHTML = relatedProducts.map(renderProductCard).join('');

    // Event listeners
    document.getElementById('add-to-cart').addEventListener('click', () => {
        const quantity = parseInt(document.getElementById('quantity').value);
        const selectedSize = document.querySelector('.size-option.selected')?.dataset.size || null;
        addToCart(product.id, quantity, selectedSize);
    });

    // Size selection
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('size-option')) {
            document.querySelectorAll('.size-option').forEach(el => el.classList.remove('selected'));
            e.target.classList.add('selected');
        }
    });
}

function changeMainImage(imageSrc) {
    document.getElementById('main-image').src = `${imageSrc}`;
    document.querySelectorAll('#thumbnails img').forEach(img => img.classList.remove('active'));
    event.target.classList.add('active');
}

// Checkout
function loadCheckout() {
    const orderSummary = document.getElementById('order-summary');
    if (!orderSummary) return;

    const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const shipping = calculateShippingFee();
    const total = subtotal + shipping;

    orderSummary.innerHTML = `
        <h2>Order Summary</h2>
        ${cart.map(item => `
            <p>${item.title} (${item.quantity}) - ₵${(item.price * item.quantity).toFixed(2)}</p>
        `).join('')}
        <p><strong>Subtotal: ₵${subtotal.toFixed(2)}</strong></p>
        <p><strong>Shipping: ₵${shipping.toFixed(2)}</strong></p>
        <p><strong>Total: ₵${total.toFixed(2)}</strong></p>
    `;

    // Add event listener for shipping method changes
    const shippingSelect = document.getElementById('shipping');
    if (shippingSelect) {
        shippingSelect.addEventListener('change', updateOrderSummary);
    }
}

function calculateShippingFee() {
    const shippingSelect = document.getElementById('shipping');
    if (!shippingSelect || !shippingSelect.value) return 0;

    const shippingValue = shippingSelect.value;
    const fee = shippingValue.split('-')[1];
    return parseInt(fee) || 0;
}

function updateOrderSummary() {
    const orderSummary = document.getElementById('order-summary');
    if (!orderSummary) return;

    const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const shipping = calculateShippingFee();
    const total = subtotal + shipping;

    orderSummary.innerHTML = `
        <h2>Order Summary</h2>
        ${cart.map(item => `
            <p>${item.title} (${item.quantity}) - ₵${(item.price * item.quantity).toFixed(2)}</p>
        `).join('')}
        <p><strong>Subtotal: ₵${subtotal.toFixed(2)}</strong></p>
        <p><strong>Shipping: ₵${shipping.toFixed(2)}</strong></p>
        <p><strong>Total: ₵${total.toFixed(2)}</strong></p>
    `;
}

function submitOrder(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const shippingFee = calculateShippingFee();
    const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const total = subtotal + shippingFee;

    const order = {
        order_id: Date.now().toString(),
        customer: {
            name: formData.get('name'),
            phone: formData.get('phone'),
            email: formData.get('email') || null,
            address: formData.get('address')
        },
        shipping_method: formData.get('shipping'),
        items: cart.map(item => ({
            product_id: item.id,
            title: item.title,
            price: item.price,
            quantity: item.quantity,
            variant: item.size
        })),
        subtotal: subtotal,
        shipping: shippingFee,
        total: total,
        payment_method: formData.get('payment'),
        timestamp: new Date().toISOString()
    };

    // Save order
    saveOrder(order);

    // Send WhatsApp message
    sendWhatsAppMessage(order);

    // Clear cart
    cart = [];
    saveCart();

    // Redirect to confirmation
    window.location.href = `order-confirmation.html?id=${order.order_id}`;
}

async function saveOrder(order) {
    try {
        const response = await fetch('https://kadis-production.up.railway.app/api/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(order)
        });

        if (response.ok) {
            const result = await response.json();
            console.log('Order saved:', result);
            return result;
        } else {
            throw new Error('Failed to save order');
        }
    } catch (error) {
        console.error('Error saving order:', error);
        // Fallback: just log it
        console.log('Order logged locally:', order);
        return { orderId: order.order_id };
    }
}

function sendWhatsAppMessage(order) {
    const message = encodeURIComponent(`New Order from Kadi's Collectionz!

Order ID: ${order.order_id}
Customer: ${order.customer.name}
Phone: ${order.customer.phone}
Address: ${order.customer.address}
Shipping Method: ${order.shipping_method}

Items:
${order.items.map(item => `- ${item.title} (${item.quantity}) - ₵${item.price}`).join('\n')}

Subtotal: ₵${order.subtotal}
Shipping: ₵${order.shipping}
Total: ₵${order.total}
Payment: ${order.payment_method}`);

    const whatsappUrl = `https://wa.me/${OWNER_WHATSAPP_NUMBER}?text=${message}`;
    window.open(whatsappUrl, '_blank');
}

function sendContactWhatsAppMessage(contactData) {
    const message = encodeURIComponent(`New Contact Message from Kadi's Collectionz!

Name: ${contactData.name}
Email: ${contactData.email}

Message:
${contactData.message}`);

    const whatsappUrl = `https://wa.me/${OWNER_WHATSAPP_NUMBER}?text=${message}`;
    window.open(whatsappUrl, '_blank');
}

// Order confirmation
function loadOrderConfirmation() {
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('id');
    document.getElementById('order-id').textContent = orderId || 'N/A';
}

// Setup event listeners
function setupEventListeners() {
    // Hamburger menu
    const hamburger = document.querySelector('.hamburger');
    const nav = document.querySelector('nav ul');
    if (hamburger && nav) {
        hamburger.addEventListener('click', () => {
            nav.classList.toggle('active');
        });
    }

    // Contact form
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(contactForm);
            const contactData = {
                name: formData.get('name'),
                email: formData.get('email'),
                message: formData.get('message')
            };
            sendContactWhatsAppMessage(contactData);
            showNotification('Thank you for your message! We will get back to you soon.');
            contactForm.reset();
        });
    }

    // Newsletter
    const newsletterForms = document.querySelectorAll('.newsletter-form');
    newsletterForms.forEach(form => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            alert('Thank you for subscribing!');
            form.reset();
        });
    });

    // Checkout form
    const checkoutForm = document.getElementById('checkout-form');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', submitOrder);
    }
}

// Initialize page-specific functionality
function initializePage() {
    const path = window.location.pathname;
    console.log('Current path:', path);

    if (path.includes('product.html')) {
        loadProductDetail();
    } else if (path.includes('cart.html')) {
        renderCart();
    } else if (path.includes('checkout.html')) {
        loadCheckout();
    } else if (path.includes('order-confirmation.html')) {
        loadOrderConfirmation();
    } else if (path.includes('index.html') || path === '/' || path.endsWith('/')) {
        // Home page - load all products
        renderProducts(document.getElementById('featured-grid'), null);
    }
}


// Utility functions
function showNotification(message) {
    // Simple notification - in a real app, use a proper notification library
    alert(message);
}