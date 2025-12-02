async function loadInventories() {
    showLoading(inventoriesContainer);
    loadInventoriesBtn.disabled = true;
    
    try {
        const res = await fetch('/api/inventories/');
        const data = await res.json();
        
        if (data.status === 'SUCCESS' && data.inventories) {
            inventoriesData = data.inventories;
            inventoriesContainer.innerHTML = inventoriesData.map(renderInventoryItem).join('');
            
            inventoriesContainer.querySelectorAll('.list-item').forEach(item => {
                item.addEventListener('click', () => {
                    const id = parseInt(item.dataset.inventoryId);
                    const inv = inventoriesData.find(i => i.inventory_id === id);
                    if (inv) selectInventory(id, inv.name);
                });
            });
        } else {
            showEmpty(inventoriesContainer, 'No inventories found');
        }
    } catch (e) {
        console.error(e);
        showEmpty(inventoriesContainer, 'Failed to load inventories');
    }
    
    loadInventoriesBtn.disabled = false;
}

async function selectInventory(inventoryId, inventoryName) {
    inventoriesContainer.querySelectorAll('.list-item').forEach(i => i.classList.remove('selected'));
    inventoriesContainer.querySelector(`[data-inventory-id="${inventoryId}"]`)?.classList.add('selected');
    
    selectedInventoryId = inventoryId;
    selectedProductId = null;
    selectedInventoryBadge.textContent = `${inventoryName} (#${inventoryId})`;
    selectedProductBadge.textContent = '';
    
    showEmpty(detailContainer, 'Select a product');
    showLoading(productsContainer);
    
    try {
        const res = await fetch(`/api/inventories/${inventoryId}/products/`);
        const data = await res.json();
        
        if (data.status === 'SUCCESS' && data.products) {
            productsData = Object.entries(data.products).map(([id, prod]) => ({...prod, id}));
            productsContainer.innerHTML = productsData.map(renderProductItem).join('');
            
            productsContainer.querySelectorAll('.product-item').forEach(item => {
                item.addEventListener('click', () => selectProduct(item.dataset.productId));
            });
        } else {
            showEmpty(productsContainer, 'No products found');
        }
    } catch (e) {
        console.error(e);
        showEmpty(productsContainer, 'Failed to load products');
    }
}

async function selectProduct(productId) {
    productsContainer.querySelectorAll('.product-item').forEach(i => i.classList.remove('selected'));
    productsContainer.querySelector(`[data-product-id="${productId}"]`)?.classList.add('selected');
    
    selectedProductId = productId;
    selectedProductBadge.textContent = `Product #${productId}`;
    
    showLoading(detailContainer);
    
    try {
        const res = await fetch(`/api/inventories/${selectedInventoryId}/products/${productId}/`);
        const data = await res.json();
        
        if (data.status === 'SUCCESS' && data.products && data.products[productId]) {
            detailContainer.innerHTML = renderProductDetail(data.products[productId]);
        } else {
            showEmpty(detailContainer, 'Failed to load details');
        }
    } catch (e) {
        console.error(e);
        showEmpty(detailContainer, 'Failed to load details');
    }
}

async function saveSecondField() {
    const input = document.getElementById('secondFieldInput');
    const btn = document.getElementById('saveSecondFieldBtn');
    const status = document.getElementById('saveStatus');
    
    if (!selectedInventoryId || !selectedProductId || !currentSecondFieldKey) {
        status.textContent = 'Cannot save';
        status.className = 'save-status error';
        return;
    }
    
    const value = input.value.trim();
    btn.disabled = true;
    status.textContent = 'Saving...';
    status.className = 'save-status';
    
    try {
        const res = await fetch(`/api/inventories/${selectedInventoryId}/products/${selectedProductId}/`, {
            method: 'PATCH',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({new_value: value})
        });
        const data = await res.json();
        
        if (data.status === 'SUCCESS') {
            status.textContent = 'Saved!';
            status.className = 'save-status success';
        } else {
            status.textContent = data.error_message || 'Failed';
            status.className = 'save-status error';
        }
    } catch (e) {
        status.textContent = 'Failed';
        status.className = 'save-status error';
    }
    
    btn.disabled = false;
    setTimeout(() => { status.textContent = ''; }, 3000);
}

loadInventoriesBtn.addEventListener('click', loadInventories);
inventorySearch.addEventListener('input', e => filterInventories(e.target.value));
productSearch.addEventListener('input', e => filterProducts(e.target.value));
