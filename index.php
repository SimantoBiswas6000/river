<?php $pageTitle = 'Dashboard'; $pageScript = 'dashboard.js'; include 'includes/header.php'; ?>

<div class="page-header fade-in">
  <h1>Dashboard</h1>
  <p>Your all-time financial overview</p>
</div>

<!-- Quick Actions -->
<div style="display: flex; gap: 12px; margin-bottom: 24px;" class="fade-in">
  <a href="planning.php?new=1" class="btn btn-primary"><i class="fi fi-sr-clipboard"></i> New Plan</a>
  <a href="transactions.php" class="btn btn-ghost"><i class="fi fi-sr-receipt"></i> View Ledger</a>
</div>

<!-- Quick Add Transaction -->
<div class="card fade-in" style="margin-bottom: 24px; padding: 16px;">
  <div class="tx-quick-add" id="tx-quick-add-container">
    <!-- Rendered dynamically via js/dashboard.js -->
  </div>
</div>

<!-- Stat Cards -->
<div class="card-grid card-grid-2 fade-in" id="stat-cards">
  <div class="card stat-card stat-spent">
    <div class="picasso-bg">
      <div class="shape shape-1"></div>
      <div class="shape shape-2"></div>
      <div class="shape shape-3"></div>
      <div class="shape shape-4"></div>
    </div>
    <div class="stat-icon"><i class="fi fi-sr-chart-line-up"></i></div>
    <div class="stat-value" id="stat-spent">৳0</div>
    <div class="stat-label">Spent</div>
  </div>
  <div class="card stat-card stat-balance">
    <div class="picasso-bg">
      <div class="shape shape-1"></div>
      <div class="shape shape-2"></div>
      <div class="shape shape-3"></div>
      <div class="shape shape-4"></div>
    </div>
    <div class="stat-icon"><i class="fi fi-sr-wallet"></i></div>
    <div class="stat-value" id="stat-balance">৳0</div>
    <div class="stat-label">Balance</div>
  </div>
</div>

<!-- Chart + Recent Transactions -->
<div class="card-grid card-grid-2 fade-in" style="margin-top: 24px;">
  <div class="card fade-in" id="spending-card">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
      <h3 id="spending-card-title" style="font-size: 1.1rem; margin: 0;">Spending Share</h3>
      <div style="display: flex; gap: 8px; align-items: center;">
        <select id="spending-month-select" class="form-control form-control-sm" style="width: auto; height: 32px; padding: 4px 8px; margin: 0;"></select>
        <button id="spending-view-toggle" class="btn btn-ghost btn-sm" style="height: 32px; padding: 0 10px;" title="Toggle View Mode"><i class="fi fi-sr-chart-histogram"></i></button>
      </div>
    </div>
    <div id="chart-container" style="position: relative; max-height: 300px; display: flex; align-items: center; justify-content: center;">
      <canvas id="spending-chart"></canvas>
      <div id="chart-empty" class="empty-state" style="display:none; padding: 30px;">
        <p>No spending data yet</p>
      </div>
    </div>
    <div id="trend-container" style="position: relative; height: 300px; display: none;">
      <canvas id="spending-trend-chart"></canvas>
      <div id="trend-empty" class="empty-state" style="display:none; padding: 30px;">
        <p>No monthly spending trend data yet</p>
      </div>
    </div>
  </div>
  <div class="card fade-in">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
      <h3 style="font-size: 1.1rem;">Recent Transactions</h3>
      <a href="transactions.php" class="btn btn-ghost btn-sm">View All</a>
    </div>
    <div class="tx-list" id="recent-transactions">
      <div class="empty-state" id="tx-empty" style="display:none; padding: 20px;">
        <p>No transactions yet</p>
      </div>
    </div>
  </div>
</div>



<?php include 'includes/footer.php'; ?>
