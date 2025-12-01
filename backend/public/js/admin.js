// Admin Panel JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Auto-hide alerts after 5 seconds
    const alerts = document.querySelectorAll('.alert');
    alerts.forEach(alert => {
        setTimeout(() => {
            const bsAlert = new bootstrap.Alert(alert);
            bsAlert.close();
        }, 5000);
    });

    // Confirm delete actions
    const deleteButtons = document.querySelectorAll('[data-confirm-delete]');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            const message = this.getAttribute('data-confirm-delete') || 'Are you sure you want to delete this item?';
            if (!confirm(message)) {
                e.preventDefault();
            }
        });
    });

    // Image preview for product forms
    setupImagePreview();

    // Form validation
    setupFormValidation();

    // Search functionality
    setupSearch();

    // Table sorting
    setupTableSorting();

    // Mobile sidebar toggle
    setupMobileSidebar();
});

function setupImagePreview() {
    const imageInputs = document.querySelectorAll('[data-image-preview]');
    imageInputs.forEach(input => {
        input.addEventListener('input', function() {
            const urls = this.value.split('\n').filter(url => url.trim());
            const previewContainer = document.getElementById(this.getAttribute('data-image-preview'));

            if (previewContainer && urls.length > 0) {
                previewContainer.innerHTML = urls.map((url, index) => `
                    <div class="image-preview-item">
                        <img src="${url.trim()}" alt="Preview ${index + 1}"
                             onerror="this.src='/images/placeholder.png'"
                             class="img-thumbnail">
                        <small class="text-muted">${index === 0 ? 'Main Image' : `Image ${index + 1}`}</small>
                    </div>
                `).join('');
            }
        });
    });
}

function setupFormValidation() {
    const forms = document.querySelectorAll('.needs-validation');
    forms.forEach(form => {
        form.addEventListener('submit', function(event) {
            if (!form.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
            }
            form.classList.add('was-validated');
        });
    });

    // Real-time validation for specific fields
    const priceInputs = document.querySelectorAll('input[name="price"], input[name="oldPrice"], input[name="promoPrice"]');
    priceInputs.forEach(input => {
        input.addEventListener('input', function() {
            const value = parseFloat(this.value);
            if (value < 0) {
                this.setCustomValidity('Price cannot be negative');
            } else {
                this.setCustomValidity('');
            }
        });
    });

    // Promo price validation
    const promoPriceInput = document.querySelector('input[name="promoPrice"]');
    const regularPriceInput = document.querySelector('input[name="price"]');

    if (promoPriceInput && regularPriceInput) {
        promoPriceInput.addEventListener('input', function() {
            const promoPrice = parseFloat(this.value) || 0;
            const regularPrice = parseFloat(regularPriceInput.value) || 0;

            if (promoPrice >= regularPrice && regularPrice > 0) {
                this.setCustomValidity('Promo price should be less than regular price');
            } else {
                this.setCustomValidity('');
            }
        });
    }
}

function setupSearch() {
    const searchInputs = document.querySelectorAll('[data-search]');
    searchInputs.forEach(input => {
        let timeout;
        input.addEventListener('input', function() {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                const searchTerm = this.value.toLowerCase();
                const target = this.getAttribute('data-search');
                const rows = document.querySelectorAll(`#${target} tbody tr`);

                rows.forEach(row => {
                    const text = row.textContent.toLowerCase();
                    row.style.display = text.includes(searchTerm) ? '' : 'none';
                });
            }, 300);
        });
    });
}

function setupTableSorting() {
    const tables = document.querySelectorAll('[data-sortable]');
    tables.forEach(table => {
        const headers = table.querySelectorAll('th[data-sort]');

        headers.forEach(header => {
            header.style.cursor = 'pointer';
            header.addEventListener('click', function() {
                const column = this.getAttribute('data-sort');
                const order = this.getAttribute('data-order') === 'asc' ? 'desc' : 'asc';

                // Reset all headers
                headers.forEach(h => h.removeAttribute('data-order'));
                this.setAttribute('data-order', order);

                sortTable(table, column, order);
            });
        });
    });
}

function sortTable(table, column, order) {
    const tbody = table.querySelector('tbody');
    const rows = Array.from(tbody.querySelectorAll('tr'));

    rows.sort((a, b) => {
        const aValue = getCellValue(a, column);
        const bValue = getCellValue(b, column);

        let result = 0;
        if (aValue < bValue) result = -1;
        if (aValue > bValue) result = 1;

        return order === 'asc' ? result : -result;
    });

    rows.forEach(row => tbody.appendChild(row));
}

function getCellValue(row, column) {
    const cell = row.querySelector(`[data-column="${column}"]`) || row.cells[column];
    if (!cell) return '';

    const text = cell.textContent.trim();
    const number = parseFloat(text.replace(/[^\d.-]/g, ''));

    return isNaN(number) ? text.toLowerCase() : number;
}

function setupMobileSidebar() {
    const sidebar = document.getElementById('sidebar');
    const toggleBtn = document.querySelector('[data-bs-toggle="collapse"][data-bs-target="#sidebar"]');

    if (sidebar && toggleBtn) {
        toggleBtn.addEventListener('click', function() {
            sidebar.classList.toggle('show');
        });

        // Close sidebar when clicking outside
        document.addEventListener('click', function(e) {
            if (!sidebar.contains(e.target) && !toggleBtn.contains(e.target)) {
                sidebar.classList.remove('show');
            }
        });
    }
}

// Utility functions
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        const bsAlert = new bootstrap.Alert(notification);
        bsAlert.close();
    }, 5000);
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'GHS'
    }).format(amount);
}

function formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Export functions for global use
window.AdminUtils = {
    showNotification,
    formatCurrency,
    formatDate
};