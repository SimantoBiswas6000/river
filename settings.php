<?php $pageTitle = 'Settings'; $pageScript = 'settings.js'; include 'includes/header.php'; ?>

<div class="page-header fade-in">
  <h1>Settings</h1>
  <p>Manage your preferences and data</p>
</div>

<!-- Currency Settings -->
<div class="settings-section card fade-in">
  <h3><i class="fi fi-sr-settings-sliders"></i> Currency Settings</h3>
  <div class="form-group">
    <label>Currency Symbol</label>
    <input type="text" class="form-control" id="set-currency" placeholder="৳" maxlength="5" style="max-width:120px;">
  </div>
  <button class="btn btn-primary" onclick="saveSettings()"><i class="fi fi-sr-disk"></i> Save Settings</button>
</div>

<!-- Export -->
<div class="settings-section card fade-in">
  <h3><i class="fi fi-sr-upload"></i> Export Data</h3>
  <p style="color:var(--text3);font-size:.875rem;margin-bottom:16px;">Download your data as a backup file</p>
  <div style="display:flex;gap:12px;flex-wrap:wrap;">
    <button class="btn btn-ghost" onclick="exportJSON()"><i class="fi fi-sr-download"></i> Export JSON</button>
    <button class="btn btn-ghost" onclick="exportCSV()"><i class="fi fi-sr-download"></i> Export CSV (Transactions)</button>
  </div>
</div>

<!-- Import -->
<div class="settings-section card fade-in">
  <h3><i class="fi fi-sr-download"></i> Import Data</h3>
  <p style="color:var(--text3);font-size:.875rem;margin-bottom:16px;">Restore from a previously exported JSON backup</p>
  <div class="form-group">
    <input type="file" class="form-control" id="import-file" accept=".json" style="padding:8px;">
  </div>
  <button class="btn btn-primary" onclick="importJSON()"><i class="fi fi-sr-upload"></i> Import JSON Backup</button>
</div>

<!-- Danger Zone -->
<div class="settings-section card fade-in" style="border-color:rgba(239,68,68,.3);">
  <h3 style="color:var(--danger);"><i class="fi fi-sr-triangle-warning"></i> Danger Zone</h3>
  <p style="color:var(--text3);font-size:.875rem;margin-bottom:16px;">This action cannot be undone. All your data will be permanently deleted.</p>
  <button class="btn btn-danger" onclick="clearAllData()"><i class="fi fi-sr-trash"></i> Clear All Data</button>
</div>

<?php include 'includes/footer.php'; ?>
