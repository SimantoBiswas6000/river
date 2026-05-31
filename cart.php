<?php $pageTitle = 'Cart'; $pageScript = 'cart.js'; include 'includes/header.php'; ?>

<div class="page-header fade-in">
  <h1>Cart</h1>
  <p>Your future purchase wishlist</p>
</div>

<!-- Filters -->
<div class="filters fade-in">
  <select class="form-control" id="filter-cart-cat">
    <option value="">All Types</option>
    <option value="need">Need</option>
    <option value="want">Want</option>
    <option value="crucial">Crucial</option>
  </select>
  <div style="margin-left:auto; display:flex; gap:8px; align-items:center;">
    <span id="cart-count" style="color:var(--text3); font-size:.85rem;"></span>
    <span id="cart-total" style="font-weight:600; color:var(--accent); font-size:.95rem;"></span>
  </div>
</div>

<!-- Cart List -->
<div class="card-grid" id="cart-list" style="grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));"></div>

<!-- Empty State -->
<div class="empty-state fade-in" id="cart-empty" style="display:none;">
  <i class="fi fi-sr-shopping-cart" style="font-size:48px;margin-bottom:16px;opacity:.5;"></i>
  <h3>Your cart is empty</h3>
  <p>Add items you plan to buy in the future</p>
  <button class="btn btn-primary" onclick="openCartModal()"><i class="fi fi-sr-plus"></i> Add to Cart</button>
</div>

<!-- FAB -->
<button class="btn btn-primary fab" onclick="openCartModal()" title="Add to Cart"><i class="fi fi-sr-plus"></i></button>

<?php include 'includes/footer.php'; ?>
