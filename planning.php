<?php $pageTitle = 'Planning'; $pageScript = 'planning.js'; include 'includes/header.php'; ?>

<div class="page-header fade-in">
  <h1>Planning</h1>
  <p>Create budgets and track planned spending</p>
</div>

<!-- Tabs -->
<div class="tabs fade-in">
  <button class="tab-btn active" onclick="switchTab('active')" id="tab-active">Active Plans</button>
  <button class="tab-btn" onclick="switchTab('archived')" id="tab-archived">Archived</button>
</div>

<!-- Folder & Search Bar Navigation -->
<div class="folder-nav-container fade-in">
  <div class="folder-row" id="folder-row">
    <!-- Rendered dynamically via js/planning.js -->
  </div>
  <div class="search-bar-container">
    <i class="fi fi-sr-search"></i>
    <input type="text" class="form-control" placeholder="Search plans or items..." id="search-plans" oninput="handleSearch(this.value)">
  </div>
  <div class="planning-actions">
    <!-- CRUD controls will be rendered dynamically here -->
  </div>
</div>

<!-- Plans Container -->
<div id="plans-container" class="fade-in"></div>

<!-- Empty State -->
<div class="empty-state fade-in" id="plans-empty" style="display:none;">
  <i class="fi fi-sr-clipboard" style="font-size:48px;margin-bottom:16px;opacity:.5;"></i>
  <h3>No plans yet</h3>
  <p>Create a spending plan to track your budget</p>
  <button class="btn btn-primary" onclick="openPlanModal()"><i class="fi fi-sr-plus"></i> Create Plan</button>
</div>

<!-- FAB -->
<button class="btn btn-primary fab" onclick="openPlanModal()" title="Create Plan"><i class="fi fi-sr-plus"></i></button>

<?php include 'includes/footer.php'; ?>
