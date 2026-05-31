/* ── Settings JS ── */
(function() {
  function init() {
    const s = getSettings();
    const curEl = document.getElementById('set-currency');
    if (curEl) curEl.value = s.currency || '৳';
  }

  window.saveSettings = function() {
    const cur = document.getElementById('set-currency').value.trim() || '৳';
    Store.set('river_settings', { currency: cur });
    showToast('Settings saved!');
  };

  /* Export all data as JSON */
  window.exportJSON = function() {
    const data = {
      river_settings: Store.get('river_settings'),
      river_inflows: Store.get('river_inflows') || [],
      river_transactions: Store.get('river_transactions') || [],
      river_plans: Store.get('river_plans') || [],
      river_cart: Store.get('river_cart') || [],
      exported_at: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    downloadBlob(blob, 'river-backup-' + todayStr() + '.json');
    showToast('JSON backup downloaded!');
  };

  /* Export transactions as CSV */
  window.exportCSV = function() {
    const txs = getTransactions();
    if (!txs.length) { showToast('No transactions to export', 'error'); return; }

    const s = getSettings();
    let csv = 'Date,Category,Amount (' + s.currency + '),Note,From Plan\n';
    txs.forEach(t => {
      csv += `${t.date},${t.category},${t.amount},"${(t.note || '').replace(/"/g, '""')}",${t.fromPlan || ''}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    downloadBlob(blob, 'river-transactions-' + todayStr() + '.csv');
    showToast('CSV downloaded!');
  };

  /* Import JSON backup */
  window.importJSON = function() {
    const fileInput = document.getElementById('import-file');
    const file = fileInput.files[0];
    if (!file) { showToast('Select a JSON file first', 'error'); return; }

    const reader = new FileReader();
    reader.onload = function(e) {
      try {
        const data = JSON.parse(e.target.result);

        // Validate structure — at least one recognized data key must be a valid array/object
        const hasValidData = 
          (Array.isArray(data.river_transactions)) ||
          (Array.isArray(data.river_inflows)) ||
          (Array.isArray(data.river_plans)) ||
          (Array.isArray(data.river_cart)) ||
          (data.river_settings && typeof data.river_settings === 'object');

        if (!hasValidData) {
          showToast('Invalid backup file — no River data found', 'error');
          return;
        }

        showModal('Import Backup', `
          <p>This will <strong>replace all current data</strong> with the imported backup.</p>
          <div style="margin-top:12px;color:var(--text3);font-size:.875rem;">
            <p>💰 Inflows: ${(data.river_inflows || []).length}</p>
            <p>📊 Transactions: ${(data.river_transactions || []).length}</p>
            <p>📋 Plans: ${(data.river_plans || []).length}</p>
            <p>🛒 Cart items: ${(data.river_cart || []).length}</p>
            ${data.exported_at ? '<p>📅 Exported: ' + formatDate(data.exported_at) + '</p>' : ''}
          </div>`, [
          { label: 'Cancel', cls: 'btn-ghost', action: hideModal },
          { label: 'Import & Replace', cls: 'btn-danger', action: () => {
            if (data.river_settings) Store.set('river_settings', data.river_settings);
            if (data.river_inflows) Store.set('river_inflows', data.river_inflows);
            if (data.river_transactions) Store.set('river_transactions', data.river_transactions);
            if (data.river_plans) Store.set('river_plans', data.river_plans);
            if (data.river_cart) Store.set('river_cart', data.river_cart);
            hideModal();
            showToast('Data imported successfully!');
            init();
          }}
        ]);
      } catch (err) {
        showToast('Invalid JSON file: ' + err.message, 'error');
      }
    };
    reader.readAsText(file);
  };

  /* Clear all data */
  window.clearAllData = function() {
    showModal('Clear All Data', `
      <p style="color:var(--danger);font-weight:600;">⚠️ This will permanently delete ALL your data:</p>
      <ul style="color:var(--text2);margin:12px 0 0 20px;font-size:.9rem;">
        <li>All financial inflows</li>
        <li>All transactions</li>
        <li>All plans (active and archived)</li>
        <li>All cart items</li>
        <li>Settings (currency)</li>
      </ul>
      <p style="margin-top:12px;color:var(--text3);font-size:.85rem;">Consider exporting a backup first.</p>`, [
      { label: 'Cancel', cls: 'btn-ghost', action: hideModal },
      { label: 'Delete Everything', cls: 'btn-danger', action: () => {
        // Double confirmation
        hideModal();
        setTimeout(() => {
          showModal('Are you absolutely sure?', '<p>Type <strong>DELETE</strong> to confirm:</p><div class="form-group" style="margin-top:12px;"><input type="text" class="form-control" id="confirm-delete" placeholder="Type DELETE"></div>', [
            { label: 'Cancel', cls: 'btn-ghost', action: hideModal },
            { label: 'Confirm Delete', cls: 'btn-danger', action: () => {
              if (document.getElementById('confirm-delete').value !== 'DELETE') {
                showToast('Type DELETE to confirm', 'error');
                return;
              }
              Store.remove('river_settings');
              Store.remove('river_inflows');
              Store.remove('river_transactions');
              Store.remove('river_plans');
              Store.remove('river_cart');
              hideModal();
              showToast('All data cleared');
              init();
            }}
          ]);
        }, 350);
      }}
    ]);
  };

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  document.addEventListener('DOMContentLoaded', init);
})();
