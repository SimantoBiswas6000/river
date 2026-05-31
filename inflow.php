<?php $pageTitle = 'Inflow'; $pageScript = 'inflow.js'; include 'includes/header.php'; ?>

<div class="page-header fade-in">
  <h1>Inflow Ledger</h1>
  <p>Track and manage your financial inflows</p>
</div>


<!-- Filters -->
<div class="filters fade-in">
  <div style="position:relative; display:flex; align-items:center; min-width:180px;">
    <input type="text" class="form-control" id="filter-month" placeholder="All Months" readonly style="padding-right:32px; width:100%;">
    <i class="fi fi-sr-cross-circle" id="clear-month-filter" style="position:absolute; right:10px; cursor:pointer; color:var(--text3); display:none; font-size:1.1rem; opacity:.7; transition:opacity .2s;" onmouseover="this.style.opacity=1" onmouseout="this.style.opacity=.7" onclick="clearMonthFilter()"></i>
  </div>
  <div style="margin-left:auto; display:flex; gap:8px; align-items:center;">
    <span id="inflow-count" style="color:var(--text3); font-size:.85rem;"></span>
    <span id="inflow-total" style="font-weight:600; color:var(--accent); font-size:.95rem;"></span>
  </div>
</div>

<!-- Inflow List -->
<div class="tx-list fade-in" id="inflow-list"></div>

<!-- Empty State -->
<div class="empty-state fade-in" id="inflow-empty" style="display:none;">
  <i class="fi fi-sr-sack-dollar" style="font-size:48px;margin-bottom:16px;opacity:.5;color:var(--success);"></i>
  <h3>No inflows recorded yet</h3>
  <p>Start tracking your income streams by logging your first inflow</p>
  <button class="btn btn-primary" onclick="openInflowModal()"><i class="fi fi-sr-plus"></i> Add Inflow</button>
</div>

<!-- FAB -->
<button class="btn btn-primary fab" onclick="openInflowModal()" title="Add Inflow"><i class="fi fi-sr-plus"></i></button>

<?php include 'includes/footer.php'; ?>
