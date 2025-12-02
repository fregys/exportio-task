let selectedInventoryId = null;
let selectedProductId = null;
let inventoriesData = [];
let productsData = [];
let currentSecondFieldKey = null;

const inventoriesContainer = document.getElementById('inventoriesContainer');
const productsContainer = document.getElementById('productsContainer');
const detailContainer = document.getElementById('detailContainer');
const loadInventoriesBtn = document.getElementById('loadInventories');
const selectedInventoryBadge = document.getElementById('selectedInventoryBadge');
const selectedProductBadge = document.getElementById('selectedProductBadge');
const inventorySearch = document.getElementById('inventorySearch');
const productSearch = document.getElementById('productSearch');

function renderInventoryItem(inv) {
    return `
        <div class="list-item" data-inventory-id="${inv.inventory_id}">
            <div class="list-item-label">${inv.name || 'N/A'}</div>
            <div class="list-item-id">ID: ${inv.inventory_id}</div>
        </div>
    `;
}

function renderProductItem(prod) {
    return `
        <div class="product-item" data-product-id="${prod.id}">
            <div class="product-name">${prod.name || 'N/A'}</div>
            <div class="product-id">ID: ${prod.id}</div>
        </div>
    `;
}

function renderProductDetail(prod) {
    const textFields = prod.text_fields || {};
    const prices = prod.prices || {};
    const stock = prod.stock || {};
    const locations = prod.locations || {};
    const images = prod.images || {};
    const links = prod.links || {};
    const variants = prod.variants || {};
    const tags = prod.tags || [];

    const sortedKeys = Object.keys(textFields).sort();
    const sortedFields = sortedKeys.map(key => ({ key, value: textFields[key] }));

    const secondFieldKey = sortedFields[1] ? sortedFields[1].key : null;
    currentSecondFieldKey = secondFieldKey;

    function renderTextField(field, index) {
        if (index === 1) {
            return `
                <div class="detail-item full-width">
                    <div class="detail-label">${field.key} (Editable)</div>
                    <textarea id="secondFieldInput" class="editable-textarea">${val(field.value) === 'N/A' ? '' : field.value}</textarea>
                    <div class="editable-actions">
                        <button class="btn-save" id="saveSecondFieldBtn" onclick="saveSecondField()">Save</button>
                        <span id="saveStatus" class="save-status"></span>
                    </div>
                </div>
            `;
        } else {
            return `<div class="detail-item full-width"><div class="detail-label">${field.key}</div><div class="detail-value">${val(field.value)}</div></div>`;
        }
    }

    return `
        <div class="detail-section">
            <div class="detail-section-title">Basic Information</div>
            <div class="detail-grid">
                <div class="detail-item"><div class="detail-label">SKU</div><div class="detail-value">${val(prod.sku)}</div></div>
                <div class="detail-item"><div class="detail-label">EAN</div><div class="detail-value">${val(prod.ean)}</div></div>
                <div class="detail-item"><div class="detail-label">ASIN</div><div class="detail-value">${val(prod.asin)}</div></div>
                <div class="detail-item"><div class="detail-label">Is Bundle</div><div class="detail-value">${prod.is_bundle !== undefined ? (prod.is_bundle ? 'Yes' : 'No') : 'N/A'}</div></div>
                <div class="detail-item"><div class="detail-label">Tax Rate</div><div class="detail-value">${prod.tax_rate !== undefined ? prod.tax_rate + '%' : 'N/A'}</div></div>
                <div class="detail-item"><div class="detail-label">Star Rating</div><div class="detail-value">${val(prod.star)}</div></div>
                <div class="detail-item"><div class="detail-label">Category ID</div><div class="detail-value">${val(prod.category_id)}</div></div>
                <div class="detail-item"><div class="detail-label">Manufacturer ID</div><div class="detail-value">${val(prod.manufacturer_id)}</div></div>
                <div class="detail-item"><div class="detail-label">Average Cost</div><div class="detail-value">${val(prod.average_cost)}</div></div>
                <div class="detail-item"><div class="detail-label">Average Landed Cost</div><div class="detail-value">${val(prod.average_landed_cost)}</div></div>
            </div>
        </div>

        <div class="detail-section">
            <div class="detail-section-title">Dimensions & Weight</div>
            <div class="detail-grid">
                <div class="detail-item"><div class="detail-label">Weight (kg)</div><div class="detail-value">${val(prod.weight)}</div></div>
                <div class="detail-item"><div class="detail-label">Height (m)</div><div class="detail-value">${val(prod.height)}</div></div>
                <div class="detail-item"><div class="detail-label">Width (m)</div><div class="detail-value">${val(prod.width)}</div></div>
                <div class="detail-item"><div class="detail-label">Length (m)</div><div class="detail-value">${val(prod.length)}</div></div>
            </div>
        </div>

        <div class="detail-section">
            <div class="detail-section-title">Tags</div>
            <div class="detail-value">${tags.length > 0 ? tags.map(t => `<span class="tag">${t}</span>`).join(' ') : 'N/A'}</div>
        </div>

        <div class="detail-section">
            <div class="detail-section-title">Prices</div>
            <div class="detail-grid">
                ${Object.keys(prices).length > 0 
                    ? Object.entries(prices).map(([k, v]) => `<div class="detail-item"><div class="detail-label">Price Group ${k}</div><div class="detail-value">${v}</div></div>`).join('')
                    : '<div class="detail-item"><div class="detail-value">N/A</div></div>'}
            </div>
        </div>

        <div class="detail-section">
            <div class="detail-section-title">Stock</div>
            <div class="detail-grid">
                ${Object.keys(stock).length > 0 
                    ? Object.entries(stock).map(([k, v]) => `<div class="detail-item"><div class="detail-label">${k}</div><div class="detail-value">${v}</div></div>`).join('')
                    : '<div class="detail-item"><div class="detail-value">N/A</div></div>'}
            </div>
        </div>

        <div class="detail-section">
            <div class="detail-section-title">Locations</div>
            <div class="detail-grid">
                ${Object.keys(locations).length > 0 
                    ? Object.entries(locations).map(([k, v]) => `<div class="detail-item"><div class="detail-label">${k}</div><div class="detail-value">${v}</div></div>`).join('')
                    : '<div class="detail-item"><div class="detail-value">N/A</div></div>'}
            </div>
        </div>

        <div class="detail-section">
            <div class="detail-section-title">Text Fields</div>
            <div class="detail-grid">
                ${sortedFields.length > 0 
                    ? sortedFields.map((field, index) => renderTextField(field, index)).join('')
                    : '<div class="detail-item"><div class="detail-value">N/A</div></div>'}
            </div>
        </div>

        <div class="detail-section">
            <div class="detail-section-title">Images</div>
            <div class="detail-grid">
                ${Object.keys(images).length > 0 
                    ? Object.entries(images).map(([k, v]) => `<div class="detail-item full-width"><div class="detail-label">Image ${k}</div><div class="detail-value"><a href="${v}" target="_blank">${v}</a></div></div>`).join('')
                    : '<div class="detail-item"><div class="detail-value">N/A</div></div>'}
            </div>
        </div>

        <div class="detail-section">
            <div class="detail-section-title">Links</div>
            <div class="detail-grid">
                ${Object.keys(links).length > 0 
                    ? Object.entries(links).map(([k, v]) => `<div class="detail-item"><div class="detail-label">${k}</div><div class="detail-value">Product: ${v.product_id || 'N/A'}, Variant: ${v.variant_id || 'N/A'}</div></div>`).join('')
                    : '<div class="detail-item"><div class="detail-value">N/A</div></div>'}
            </div>
        </div>

        <div class="detail-section">
            <div class="detail-section-title">Variants</div>
            ${Object.keys(variants).length > 0 
                ? Object.entries(variants).map(([id, v]) => `
                    <div class="variant-item">
                        <div class="variant-header">Variant ID: ${id}</div>
                        <div class="detail-grid">
                            <div class="detail-item"><div class="detail-label">Name</div><div class="detail-value">${val(v.name)}</div></div>
                            <div class="detail-item"><div class="detail-label">SKU</div><div class="detail-value">${val(v.sku)}</div></div>
                            <div class="detail-item"><div class="detail-label">EAN</div><div class="detail-value">${val(v.ean)}</div></div>
                            <div class="detail-item"><div class="detail-label">ASIN</div><div class="detail-value">${val(v.asin)}</div></div>
                        </div>
                        <div class="detail-grid">
                            ${v.prices ? Object.entries(v.prices).map(([pk, pv]) => `<div class="detail-item"><div class="detail-label">Price ${pk}</div><div class="detail-value">${pv}</div></div>`).join('') : ''}
                        </div>
                        <div class="detail-grid">
                            ${v.stock ? Object.entries(v.stock).map(([sk, sv]) => `<div class="detail-item"><div class="detail-label">Stock ${sk}</div><div class="detail-value">${sv}</div></div>`).join('') : ''}
                        </div>
                        <div class="detail-grid">
                            ${v.locations ? Object.entries(v.locations).map(([lk, lv]) => `<div class="detail-item"><div class="detail-label">Location ${lk}</div><div class="detail-value">${lv}</div></div>`).join('') : ''}
                        </div>
                    </div>
                `).join('')
                : '<div class="detail-value">N/A</div>'}
        </div>
    `;
}

