/* ── Inflow JS ── */
(function() {
  let editId = null;

  function init() {
    // Initialize Flatpickr MonthSelect plugin
    const monthInput = document.getElementById('filter-month');
    if (monthInput) {
      flatpickr(monthInput, {
        plugins: [
          new monthSelectPlugin({
            shorthand: true,
            dateFormat: "Y-m",
            altFormat: "F Y"
          })
        ],
        onChange: function(selectedDates, dateStr, instance) {
          const clearBtn = document.getElementById('clear-month-filter');
          if (clearBtn) {
            clearBtn.style.display = dateStr ? 'block' : 'none';
          }
          render();
        }
      });
    }

    window.clearMonthFilter = function() {
      if (monthInput && monthInput._flatpickr) {
        monthInput._flatpickr.clear();
        const clearBtn = document.getElementById('clear-month-filter');
        if (clearBtn) clearBtn.style.display = 'none';
        render();
      }
    };
    
    render();
  }

  function getFiltered() {
    const monthInput = document.getElementById('filter-month');
    const month = monthInput ? monthInput.value : '';
    
    let inflows = getInflows();
    if (month) inflows = inflows.filter(i => i.date && i.date.substring(0,7) === month);
    return inflows.sort((a, b) => b.date.localeCompare(a.date));
  }

  function render() {
    const inflows = getFiltered();
    const container = document.getElementById('inflow-list');
    const empty = document.getElementById('inflow-empty');
    const countEl = document.getElementById('inflow-count');
    const totalEl = document.getElementById('inflow-total');
    if (!container || !empty) return;

    const total = inflows.reduce((s, i) => s + parseFloat(i.amount || 0), 0);
    if (countEl) countEl.textContent = inflows.length + ' inflow' + (inflows.length !== 1 ? 's' : '');
    if (totalEl) totalEl.textContent = 'Total: ' + currency(total);

    if (!inflows.length) {
      container.innerHTML = '';
      empty.style.display = '';
      return;
    }
    empty.style.display = 'none';

    container.innerHTML = inflows.map(i => {
      return `<div class="tx-item">
        <div class="tx-cat-dot" style="background:var(--text3);"></div>
        <div class="tx-info">
          <div class="tx-note">${escHtml(i.note || 'Inflow')}</div>
          <div class="tx-meta">
            <span>${formatDate(i.date)}</span>
          </div>
        </div>
        <div class="tx-amount" style="color:#34d399; font-weight:700;">+${currency(i.amount)}</div>
        <div class="tx-actions">
          <button class="btn btn-ghost btn-icon btn-sm" onclick="openInflowModal('${i.id}')" title="Edit"><i class="fi fi-sr-edit"></i></button>
          <button class="btn btn-danger btn-icon btn-sm" onclick="deleteInflow('${i.id}')" title="Delete"><i class="fi fi-sr-trash"></i></button>
        </div>
      </div>`;
    }).join('');
  }

  function escHtml(s) {
    const d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  window.openInflowModal = function(id) {
    editId = id || null;
    const inflow = id ? getInflows().find(i => i.id === id) : null;

    const body = `
      <div class="form-group">
        <label>Date</label>
        <input type="date" class="form-control" id="m-inflow-date" value="${inflow ? inflow.date : todayStr()}">
      </div>
      <div class="form-group">
        <label>Amount</label>
        <input type="number" class="form-control" id="m-inflow-amount" placeholder="0" min="0" step="any" value="${inflow ? inflow.amount : ''}">
      </div>
      <div class="form-group">
        <label>Note (optional)</label>
        <input type="text" class="form-control" id="m-inflow-note" placeholder="Salary, Freelance, Gift..." value="${inflow ? escHtml(inflow.note || '') : ''}">
      </div>`;

    showModal(id ? 'Edit Inflow' : 'Add Inflow', body, [
      { label: 'Cancel', cls: 'btn-ghost', action: hideModal },
      { label: id ? 'Save' : 'Add', cls: 'btn-primary', action: saveInflow }
    ]);

    // Auto-focus amount
    setTimeout(() => document.getElementById('m-inflow-amount').focus(), 200);
  };

  function saveInflow() {
    const amount = parseFloat(document.getElementById('m-inflow-amount').value);
    if (!amount || amount <= 0) { showToast('Enter a valid amount', 'error'); return; }

    const inflows = getInflows();
    const data = {
      date: document.getElementById('m-inflow-date').value || todayStr(),
      amount: amount,
      note: document.getElementById('m-inflow-note').value.trim()
    };

    if (editId) {
      const idx = inflows.findIndex(i => i.id === editId);
      if (idx >= 0) Object.assign(inflows[idx], data);
    } else {
      inflows.push({ id: uuid(), ...data });
    }

    saveInflows(inflows);
    hideModal();
    showToast(editId ? 'Inflow updated!' : 'Inflow logged!');
    editId = null;
    render();
  }

  window.deleteInflow = function(id) {
    showModal('Delete Inflow', '<p>Are you sure you want to delete this inflow entry? This cannot be undone.</p>', [
      { label: 'Cancel', cls: 'btn-ghost', action: hideModal },
      { label: 'Delete', cls: 'btn-danger', action: () => {
        const inflows = getInflows().filter(i => i.id !== id);
        saveInflows(inflows);
        hideModal();
        showToast('Inflow deleted');
        render();
      }}
    ]);
  };

  document.addEventListener('DOMContentLoaded', init);
})();
