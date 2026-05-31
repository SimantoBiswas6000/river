/* ── Cart JS ── */
(function() {
  let editId = null;

  function init() {
    document.getElementById('filter-cart-cat').addEventListener('change', render);
    render();
  }

  function getFiltered() {
    const cat = document.getElementById('filter-cart-cat').value;
    let items = getCart();
    if (cat) items = items.filter(i => i.category === cat);
    return items;
  }

  function render() {
    const items = getFiltered();
    const container = document.getElementById('cart-list');
    const empty = document.getElementById('cart-empty');
    const countEl = document.getElementById('cart-count');
    const totalEl = document.getElementById('cart-total');

    const total = items.reduce((s, i) => s + parseFloat(i.maxPrice || 0), 0);
    countEl.textContent = items.length + ' item' + (items.length !== 1 ? 's' : '');
    totalEl.textContent = 'Est: ' + currency(total);

    if (!items.length) {
      container.innerHTML = '';
      empty.style.display = '';
      return;
    }
    empty.style.display = 'none';

    container.innerHTML = items.map(item => {
      return `<div class="card" style="cursor:default;">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px;">
          <div>
            <h3 style="font-size:1.05rem;margin-bottom:4px;">${escHtml(item.name)}</h3>
            <span class="badge badge-${item.category}">${item.category}</span>
          </div>
        </div>
        <div style="display:flex;gap:16px;margin-bottom:16px;">
          <div>
            <div style="color:var(--text3);font-size:.75rem;">Max Price</div>
            <div style="font-weight:600;font-size:1.1rem;">${currency(item.maxPrice)}</div>
          </div>
          ${item.minPrice ? `<div>
            <div style="color:var(--text3);font-size:.75rem;">Min Price</div>
            <div style="font-weight:500;color:var(--text2);">${currency(item.minPrice)}</div>
          </div>` : ''}
        </div>
        <div style="display:flex;gap:8px;">
          <button class="btn btn-primary btn-sm" onclick="buyNow('${item.id}')"><i class="fi fi-sr-shopping-cart"></i> Buy Now</button>
          <button class="btn btn-ghost btn-sm" onclick="openCartModal('${item.id}')"><i class="fi fi-sr-edit"></i> Edit</button>
          <button class="btn btn-danger btn-sm" onclick="deleteCartItem('${item.id}')"><i class="fi fi-sr-trash"></i></button>
        </div>
      </div>`;
    }).join('');
  }

  function escHtml(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

  /* Add/Edit Cart Item Modal */
  window.openCartModal = function(id) {
    editId = id || null;
    const item = id ? getCart().find(i => i.id === id) : null;

    const body = `
      <div class="form-group">
        <label>Item Name</label>
        <input type="text" class="form-control" id="m-cart-name" placeholder="e.g. Headphones" value="${item ? escHtml(item.name) : ''}">
      </div>
      <div class="form-group">
        <label>Type</label>
        <select class="form-control" id="m-cart-cat">${cartCategoryOptions(item ? item.category : '')}</select>
      </div>
      <div class="form-group">
        <label>Max Price</label>
        <input type="number" class="form-control" id="m-cart-max" placeholder="0" min="0" step="any" value="${item ? item.maxPrice : ''}">
      </div>
      <div class="form-group">
        <label>Min Price (optional)</label>
        <input type="number" class="form-control" id="m-cart-min" placeholder="0" min="0" step="any" value="${item && item.minPrice ? item.minPrice : ''}">
      </div>`;

    showModal(id ? 'Edit Cart Item' : 'Add to Cart', body, [
      { label: 'Cancel', cls: 'btn-ghost', action: hideModal },
      { label: id ? 'Save' : 'Add', cls: 'btn-primary', action: saveCartItem }
    ]);
    setTimeout(() => document.getElementById('m-cart-name').focus(), 200);
  };

  function saveCartItem() {
    const name = document.getElementById('m-cart-name').value.trim();
    const max = parseFloat(document.getElementById('m-cart-max').value);
    if (!name) { showToast('Enter item name', 'error'); return; }
    if (!max || max <= 0) { showToast('Enter max price', 'error'); return; }

    const cart = getCart();
    const data = {
      name,
      category: document.getElementById('m-cart-cat').value,
      maxPrice: max,
      minPrice: parseFloat(document.getElementById('m-cart-min').value) || 0
    };

    if (editId) {
      const idx = cart.findIndex(i => i.id === editId);
      if (idx >= 0) Object.assign(cart[idx], data);
    } else {
      cart.push({ id: uuid(), ...data });
    }

    saveCart(cart);
    hideModal();
    showToast(editId ? 'Item updated!' : 'Item added to cart!');
    editId = null;
    render();
  }

  /* Buy Now — creates transaction and removes from cart */
  window.buyNow = function(itemId) {
    const item = getCart().find(i => i.id === itemId);
    if (!item) return;

    const body = `
      <p style="color:var(--text2);margin-bottom:16px;">Buying: <strong>${escHtml(item.name)}</strong></p>
      <div class="form-group">
        <label>Actual Price Paid</label>
        <input type="number" class="form-control" id="m-buy-price" value="${item.maxPrice}" min="0" step="any">
      </div>
      <div class="form-group">
        <label>Transaction Category</label>
        <select class="form-control" id="m-buy-cat">${categoryOptions()}</select>
      </div>
      <div class="form-group">
        <label>Date</label>
        <input type="date" class="form-control" id="m-buy-date" value="${todayStr()}">
      </div>
      <div class="form-group">
        <label>Note (optional)</label>
        <input type="text" class="form-control" id="m-buy-note" value="Bought: ${escHtml(item.name)}">
      </div>`;

    showModal('Buy Now', body, [
      { label: 'Cancel', cls: 'btn-ghost', action: hideModal },
      { label: 'Confirm Purchase', cls: 'btn-primary', action: () => {
        const price = parseFloat(document.getElementById('m-buy-price').value);
        if (!price || price <= 0) { showToast('Enter price', 'error'); return; }

        // Create transaction
        const txs = getTransactions();
        txs.push({
          id: uuid(),
          date: document.getElementById('m-buy-date').value || todayStr(),
          category: document.getElementById('m-buy-cat').value,
          amount: price,
          note: document.getElementById('m-buy-note').value.trim(),
          fromPlan: null
        });
        saveTransactions(txs);

        // Remove from cart
        const cart = getCart().filter(i => i.id !== itemId);
        saveCart(cart);

        hideModal();
        showToast('Purchase recorded! Item removed from cart.');
        render();
      }}
    ]);
  };

  /* Delete cart item */
  window.deleteCartItem = function(id) {
    showModal('Delete Item', '<p>Remove this item from your cart?</p>', [
      { label: 'Cancel', cls: 'btn-ghost', action: hideModal },
      { label: 'Delete', cls: 'btn-danger', action: () => {
        const cart = getCart().filter(i => i.id !== id);
        saveCart(cart);
        hideModal();
        showToast('Item removed from cart');
        render();
      }}
    ]);
  };

  document.addEventListener('DOMContentLoaded', init);
})();
