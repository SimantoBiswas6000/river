<?php $pageTitle = 'Transactions'; $pageScript = 'transactions.js'; include 'includes/header.php'; ?>

<div class="page-header fade-in">
  <h1>Transactions</h1>
  <p>Track and manage your spending</p>
</div>

<!-- Quick Add Transaction -->
<div class="card fade-in" style="margin-bottom: 20px; padding: 16px;">
  <div class="tx-quick-add" id="tx-quick-add-container">
    <!-- Rendered dynamically via js/transactions.js -->
  </div>
</div>

<!-- Filters -->
<div class="filters fade-in">
  <div style="position:relative; display:flex; align-items:center; min-width:180px;">
    <input type="text" class="form-control" id="filter-month" placeholder="All Months" readonly style="padding-right:32px; width:100%;">
    <i class="fi fi-sr-cross-circle" id="clear-month-filter" style="position:absolute; right:10px; cursor:pointer; color:var(--text3); display:none; font-size:1.1rem; opacity:.7; transition:opacity .2s;" onmouseover="this.style.opacity=1" onmouseout="this.style.opacity=.7" onclick="clearMonthFilter()"></i>
  </div>
  <select class="form-control" id="filter-category">
    <option value="">All Categories</option>
    <option value="junk">Junk</option>
    <option value="meal">Meal</option>
    <option value="transportation">Transportation</option>
    <option value="health">Health</option>
    <option value="education">Education</option>
    <option value="tour">Tour</option>
  </select>
  <div style="margin-left:auto; display:flex; gap:8px; align-items:center;">
    <span id="tx-count" style="color:var(--text3); font-size:.85rem;"></span>
    <span id="tx-total" style="font-weight:600; color:var(--accent); font-size:.95rem;"></span>
  </div>
</div>

<!-- Transaction List -->
<div class="tx-list fade-in" id="tx-list"></div>

<!-- Empty State -->
<div class="empty-state fade-in" id="tx-empty" style="display:none;">
  <i class="fi fi-sr-receipt" style="font-size:48px;margin-bottom:16px;opacity:.5;"></i>
  <h3>No transactions yet</h3>
  <p>Start tracking your expenses by adding your first transaction</p>
  <button class="btn btn-primary" onclick="openTxModal()"><i class="fi fi-sr-plus"></i> Add Transaction</button>
</div>

<!-- FAB -->
<button class="btn btn-primary fab" onclick="openTxModal()" title="Add Transaction"><i class="fi fi-sr-plus"></i></button>

<?php include 'includes/footer.php'; ?>
