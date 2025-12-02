function showLoading(container) {
    container.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
}

function showEmpty(container, message) {
    container.innerHTML = `<div class="empty-state">${message}</div>`;
}

function val(v) {
    if (v === null || v === undefined || v === '') return 'N/A';
    return v;
}

