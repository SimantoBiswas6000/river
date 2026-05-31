<?php $pageTitle = 'Statistics'; $pageScript = 'stats.js'; include 'includes/header.php'; ?>

<div class="page-header fade-in">
  <h1>Financial Statistics</h1>
  <p>Easy-to-understand insights, visual graphs, and dynamic savings analyses</p>
</div>

<!-- Friendly Health Check & Metrics Overview -->
<div class="card-grid card-grid-3 fade-in" style="margin-bottom: 24px;">
  <!-- Savings Rate -->
  <div class="card stat-card stat-balance" style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; min-height: 180px;">
    <div style="font-size: .85rem; font-weight: 600; color: var(--text2); letter-spacing: 0.5px; text-transform: uppercase;">Savings Rate</div>
    <div style="font-size: 2.5rem; font-weight: 700; color: #34d399;" id="stat-savings-rate">0%</div>
    <div style="font-size: .8rem; color: var(--text3);" id="stat-savings-label">No income logged yet</div>
  </div>

  <!-- Burn Rate -->
  <div class="card stat-card stat-spent" style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; min-height: 180px;">
    <div style="font-size: .85rem; font-weight: 600; color: var(--text2); letter-spacing: 0.5px; text-transform: uppercase;">Daily Burn Rate</div>
    <div style="font-size: 2.2rem; font-weight: 700; color: #fb7185;" id="stat-burn-rate">৳0</div>
    <div style="font-size: .8rem; color: var(--text3);">Average spent per day</div>
  </div>

  <!-- Financial Diagnosis -->
  <div class="card stat-card" style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; min-height: 180px; border-color: var(--advice-card-border);">
    <div style="font-size: .85rem; font-weight: 600; color: var(--text2); letter-spacing: 0.5px; text-transform: uppercase;">Health Diagnosis</div>
    <div style="font-size: 1.25rem; font-weight: 600; text-align: center; line-height: 1.4;" class="text-purple-dynamic" id="stat-health-status">🌱 Loading analysis...</div>
    <div style="font-size: .8rem; color: var(--text3); text-align: center;" id="stat-health-desc">Financial advice tailored for you</div>
  </div>
</div>

<!-- Friendly Normal Person Insights Panel -->
<div class="card fade-in advice-card" style="margin-bottom: 24px;">
  <h3 style="margin-bottom: 16px; font-size: 1.15rem; display: flex; align-items: center; gap: 8px;" class="text-purple-dynamic">
    <i class="fi fi-sr-bulb" style="font-size: 1.2rem;"></i> Actions & Practical Advice
  </h3>
  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;" class="card-grid-2">
    <div>
      <h4 style="font-size: 0.95rem; font-weight: 600; margin-bottom: 8px; color: var(--text);">The 50/30/20 Spending Rule</h4>
      <p style="color: var(--text2); font-size: 0.85rem; line-height: 1.5; margin-bottom: 12px;">
        A standard healthy financial practice suggests spending <strong>50% on Needs</strong>, <strong>30% on Wants</strong>, and saving at least <strong>20%</strong>. Here is how your real spending compares:
      </p>
      <div style="display: flex; flex-direction: column; gap: 8px;" id="rule-comparison-container">
        <!-- Rendered dynamically -->
      </div>
    </div>
    
    <div>
      <h4 style="font-size: 0.95rem; font-weight: 600; margin-bottom: 8px; color: var(--text);">Habits & Behaviors</h4>
      <div style="display: flex; flex-direction: column; gap: 10px; font-size: 0.85rem;" id="insights-list">
        <!-- Rendered dynamically -->
      </div>
    </div>
  </div>
</div>

<!-- Visual Graphs Layer -->
<div class="card-grid card-grid-2 fade-in" style="margin-bottom: 24px;">
  <!-- Cumulative Net Worth Line Chart -->
  <div class="card">
    <h3 style="margin-bottom: 16px; font-size: 1.1rem; display: flex; align-items: center; gap: 8px;">
      <i class="fi fi-sr-chart-line-up" style="color: #34d399;"></i> Savings & Balance Growth Over Time
    </h3>
    <div style="position: relative; height: 280px; display: flex; align-items: center; justify-content: center;">
      <canvas id="balance-trend-chart"></canvas>
      <div id="balance-trend-empty" class="empty-state" style="display:none;">
        <p>Log transactions and inflows to see your savings curve grow!</p>
      </div>
    </div>
  </div>

  <!-- Inflow vs Outflow Comparison Bar Chart -->
  <div class="card">
    <h3 style="margin-bottom: 16px; font-size: 1.1rem; display: flex; align-items: center; gap: 8px;">
      <i class="fi fi-sr-chart-histogram" style="color: #60a5fa;"></i> Inflow vs Outflow (Monthly Trends)
    </h3>
    <div style="position: relative; height: 280px; display: flex; align-items: center; justify-content: center;">
      <canvas id="monthly-compare-chart"></canvas>
      <div id="monthly-compare-empty" class="empty-state" style="display:none;">
        <p>No historical monthly comparison data available yet.</p>
      </div>
    </div>
  </div>
</div>

<!-- Detailed Expenses & Inflow Breakdown -->
<div class="card-grid card-grid-2 fade-in">
  <!-- Interactive Category Breakdown -->
  <div class="card">
    <h3 style="margin-bottom: 16px; font-size: 1.1rem; display: flex; align-items: center; gap: 8px;">
      <i class="fi fi-sr-chart-pie" style="color: #a78bfa;"></i> Spending Categories
    </h3>
    <div style="position: relative; height: 280px; display: flex; align-items: center; justify-content: center;">
      <canvas id="category-donut-chart"></canvas>
      <div id="category-donut-empty" class="empty-state" style="display:none;">
        <p>No spending category data logged.</p>
      </div>
    </div>
  </div>

  <!-- Peak Spending Analysis -->
  <div class="card">
    <h3 style="margin-bottom: 16px; font-size: 1.1rem; display: flex; align-items: center; gap: 8px;">
      <i class="fi fi-sr-calendar-exclamation" style="color: #f43f5e;"></i> Peak Spending Days
    </h3>
    <div style="position: relative; height: 280px; display: flex; align-items: center; justify-content: center;">
      <canvas id="day-bar-chart"></canvas>
      <div id="day-bar-empty" class="empty-state" style="display:none;">
        <p>Log transactions to analyze peak spending days.</p>
      </div>
    </div>
  </div>
</div>

<?php include 'includes/footer.php'; ?>
