function filterInventories(term) {
    const items = inventoriesContainer.querySelectorAll('.list-item');
    term = term.toLowerCase();
    items.forEach(item => {
        const text = item.textContent.toLowerCase();
        item.classList.toggle('hidden', term && !text.includes(term));
    });
}

function filterProducts(term) {
    const items = productsContainer.querySelectorAll('.product-item');
    term = term.toLowerCase();
    items.forEach(item => {
        const text = item.textContent.toLowerCase();
        item.classList.toggle('hidden', term && !text.includes(term));
    });
}

