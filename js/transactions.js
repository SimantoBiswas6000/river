/* ── Transactions JS ── */
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

    document.getElementById('filter-category').addEventListener('change', render);
    render();
    renderQuickAdd();
  }

  function getFiltered() {
    const month = document.getElementById('filter-month').value;
    const cat = document.getElementById('filter-category').value;
    let txs = getTransactions();
    if (month) txs = txs.filter(t => t.date && t.date.substring(0,7) === month);
    if (cat) txs = txs.filter(t => t.category === cat);
    return txs.sort((a, b) => b.date.localeCompare(a.date));
  }

  function render() {
    const txs = getFiltered();
    const container = document.getElementById('tx-list');
    const empty = document.getElementById('tx-empty');
    const countEl = document.getElementById('tx-count');
    const totalEl = document.getElementById('tx-total');

    const total = txs.reduce((s, t) => s + parseFloat(t.amount || 0), 0);
    countEl.textContent = txs.length + ' transaction' + (txs.length !== 1 ? 's' : '');
    totalEl.textContent = 'Total: ' + currency(total);

    if (!txs.length) {
      container.innerHTML = '';
      empty.style.display = '';
      return;
    }
    empty.style.display = 'none';

    container.innerHTML = txs.map(t => {
      const cat = CATEGORIES[t.category] || {};
      const planBadge = t.fromPlan ? ' <span style="font-size:.7rem;color:var(--text3);"><i class="fi fi-sr-clipboard" style="font-size:10px;"></i> from plan</span>' : '';
      return `<div class="tx-item">
        <div class="tx-cat-dot" style="background:${cat.color || 'var(--text3)'};"></div>
        <div class="tx-info">
          <div class="tx-note">${escHtml(t.note || t.category)}${planBadge}</div>
          <div class="tx-meta">
            <span>${formatDate(t.date)}</span>
            <span class="badge badge-${t.category}">${t.category}</span>
          </div>
        </div>
        <div class="tx-amount negative">${currency(t.amount)}</div>
        <div class="tx-actions">
          <button class="btn btn-ghost btn-icon btn-sm" onclick="openTxModal('${t.id}')" title="Edit"><i class="fi fi-sr-edit"></i></button>
          <button class="btn btn-danger btn-icon btn-sm" onclick="deleteTx('${t.id}')" title="Delete"><i class="fi fi-sr-trash"></i></button>
        </div>
      </div>`;
    }).join('');
  }

  function escHtml(s) {
    const d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  window.openTxModal = function(id) {
    editId = id || null;
    const tx = id ? getTransactions().find(t => t.id === id) : null;

    const body = `
      <div class="form-group">
        <label>Date</label>
        <input type="date" class="form-control" id="m-tx-date" value="${tx ? tx.date : todayStr()}">
      </div>
      <div class="form-group">
        <label>Category</label>
        <select class="form-control" id="m-tx-cat">${categoryOptions(tx ? tx.category : '')}</select>
      </div>
      <div class="form-group">
        <label>Amount</label>
        <input type="number" class="form-control" id="m-tx-amount" placeholder="0" min="0" step="any" value="${tx ? tx.amount : ''}">
      </div>
      <div class="form-group">
        <label>Note (optional)</label>
        <input type="text" class="form-control" id="m-tx-note" placeholder="What was this for?" value="${tx ? escHtml(tx.note || '') : ''}">
      </div>`;

    showModal(id ? 'Edit Transaction' : 'Add Transaction', body, [
      { label: 'Cancel', cls: 'btn-ghost', action: hideModal },
      { label: id ? 'Save' : 'Add', cls: 'btn-primary', action: saveTx }
    ]);

    // Auto-focus amount
    setTimeout(() => document.getElementById('m-tx-amount').focus(), 200);
  };

  function saveTx() {
    const amount = parseFloat(document.getElementById('m-tx-amount').value);
    if (!amount || amount <= 0) { showToast('Enter a valid amount', 'error'); return; }

    const txs = getTransactions();
    const data = {
      date: document.getElementById('m-tx-date').value || todayStr(),
      category: document.getElementById('m-tx-cat').value,
      amount: amount,
      note: document.getElementById('m-tx-note').value.trim()
    };

    if (editId) {
      const idx = txs.findIndex(t => t.id === editId);
      if (idx >= 0) Object.assign(txs[idx], data);
    } else {
      txs.push({ id: uuid(), ...data, fromPlan: null });
    }

    saveTransactions(txs);
    hideModal();
    showToast(editId ? 'Transaction updated!' : 'Transaction added!');
    editId = null;
    render();
  }

  window.deleteTx = function(id) {
    showModal('Delete Transaction', '<p>Are you sure you want to delete this transaction? This cannot be undone.</p>', [
      { label: 'Cancel', cls: 'btn-ghost', action: hideModal },
      { label: 'Delete', cls: 'btn-danger', action: () => {
        const txs = getTransactions().filter(t => t.id !== id);
        saveTransactions(txs);
        hideModal();
        showToast('Transaction deleted');
        render();
      }}
    ]);
  };

  function renderQuickAdd() {
    const container = document.getElementById('tx-quick-add-container');
    if (!container) return;
    const lastCat = Store.get('river_quick_tx_cat') || 'meal';
    const displayCat = lastCat.charAt(0).toUpperCase() + lastCat.slice(1);
    container.innerHTML = `
      <input type="text" class="form-control form-control-sm quick-add-name" placeholder="Description (e.g. Starbucks)" id="qa-tx-note" onkeydown="handleQuickTxKey(event)" tabindex="0">
      <div class="autocomplete-container">
        <input type="text" class="form-control form-control-sm quick-add-cat" id="qa-tx-cat" placeholder="Category" autocomplete="off" onkeydown="handleQuickTxKey(event)" onfocus="showCategorySuggestions()" oninput="filterCategorySuggestions()" onblur="hideCategorySuggestionsWithDelay()" tabindex="0" value="${displayCat}">
        <div class="autocomplete-suggestions" id="qa-tx-cat-suggestions"></div>
      </div>
      <input type="date" class="form-control form-control-sm quick-add-date" id="qa-tx-date" value="${todayStr()}" onkeydown="handleQuickTxKey(event)" tabindex="0">
      <input type="number" class="form-control form-control-sm quick-add-max" placeholder="Amount" id="qa-tx-amount" onkeydown="handleQuickTxKey(event)" min="0" step="any" tabindex="0">
      <button class="btn btn-primary btn-sm quick-add-btn" onclick="submitQuickTx()" title="Add Transaction" tabindex="0">
        <i class="fi fi-sr-plus"></i><span class="quick-add-btn-text"> Add Transaction</span>
      </button>
    `;

    // Synchronously focus on description on initial page load
    setTimeout(() => {
      const el = document.getElementById('qa-tx-note');
      if (el) el.focus();
    }, 50);
  }

  window.showCategorySuggestions = function() {
    const suggestionsContainer = document.getElementById('qa-tx-cat-suggestions');
    if (!suggestionsContainer) return;
    suggestionsContainer.style.display = 'block';
    filterCategorySuggestions();

    const catInput = document.getElementById('qa-tx-cat');
    if (catInput) {
      setTimeout(() => catInput.select(), 50);
    }
  };

  window.hideCategorySuggestions = function() {
    const suggestionsContainer = document.getElementById('qa-tx-cat-suggestions');
    if (suggestionsContainer) {
      suggestionsContainer.style.display = 'none';
    }
  };

  window.hideCategorySuggestionsWithDelay = function() {
    setTimeout(() => {
      hideCategorySuggestions();
      const catInput = document.getElementById('qa-tx-cat');
      if (catInput) {
        const val = catInput.value.trim().toLowerCase();
        const matched = Object.keys(CATEGORIES).find(c => c === val);
        if (!matched) {
          const lastCat = Store.get('river_quick_tx_cat') || Object.keys(CATEGORIES)[0];
          catInput.value = lastCat.charAt(0).toUpperCase() + lastCat.slice(1);
        }
      }
    }, 200);
  };

  window.filterCategorySuggestions = function() {
    const catInput = document.getElementById('qa-tx-cat');
    const suggestionsContainer = document.getElementById('qa-tx-cat-suggestions');
    if (!catInput || !suggestionsContainer) return;

    const val = catInput.value.trim().toLowerCase();
    const suggestions = Object.keys(CATEGORIES).filter(c => c.toLowerCase().includes(val));

    if (suggestions.length === 0) {
      suggestionsContainer.innerHTML = '<div style="padding: 8px 12px; font-size: 0.8rem; color: var(--text3); text-align: center;">No matches found</div>';
      return;
    }

    suggestionsContainer.innerHTML = suggestions.map((c, idx) => {
      const catInfo = CATEGORIES[c];
      const isSelected = val === c || (val === '' && idx === 0);
      return `<div class="autocomplete-suggestion-item ${isSelected ? 'active' : ''}" data-value="${c}" onclick="selectCategory('${c}')">
        <div class="suggestion-dot" style="background: ${catInfo.color};"></div>
        <span>${c.charAt(0).toUpperCase() + c.slice(1)}</span>
      </div>`;
    }).join('');
  };

  window.selectCategory = function(cat) {
    const catInput = document.getElementById('qa-tx-cat');
    if (catInput) {
      catInput.value = cat.charAt(0).toUpperCase() + cat.slice(1);
      Store.set('river_quick_tx_cat', cat);
    }
    hideCategorySuggestions();
  };

  window.submitQuickTx = function() {
    const noteEl = document.getElementById('qa-tx-note');
    const catEl = document.getElementById('qa-tx-cat');
    const dateEl = document.getElementById('qa-tx-date');
    const amountEl = document.getElementById('qa-tx-amount');

    const note = noteEl.value.trim();
    const amount = parseFloat(amountEl.value);
    const category = catEl.value.trim().toLowerCase();
    const date = dateEl.value || todayStr();

    const finalNote = note || (category.charAt(0).toUpperCase() + category.slice(1));

    if (!amount || amount <= 0) {
      showToast('Enter a valid amount', 'error');
      amountEl.focus();
      return;
    }

    if (!CATEGORIES[category]) {
      showToast('Select a valid category', 'error');
      catEl.focus();
      return;
    }

    const txs = getTransactions();
    txs.push({
      id: uuid(),
      date: date,
      category: category,
      amount: amount,
      note: finalNote,
      fromPlan: null
    });
    
    saveTransactions(txs);
    Store.set('river_quick_tx_cat', category);

    // Manually clear inputs instantly without rebuilding DOM
    noteEl.value = '';
    amountEl.value = '';

    showToast('Transaction added!');
    render();

    // Focus description input synchronously to keep keyboard open
    noteEl.focus();
  };

  window.handleQuickTxKey = function(event) {
    if (event.key === 'Enter') {
      if (event.repeat) return;
      event.preventDefault();
      
      const activeEl = document.activeElement;
      const noteEl = document.getElementById('qa-tx-note');
      const catEl = document.getElementById('qa-tx-cat');
      const dateEl = document.getElementById('qa-tx-date');
      const amountEl = document.getElementById('qa-tx-amount');

      if (activeEl === noteEl) {
        if (catEl) {
          catEl.focus();
          showCategorySuggestions();
        }
      } else if (activeEl === catEl) {
        const activeSuggestion = document.querySelector('.autocomplete-suggestion-item.active');
        if (activeSuggestion) {
          selectCategory(activeSuggestion.dataset.value);
        } else {
          const val = catEl.value.trim().toLowerCase();
          const matched = Object.keys(CATEGORIES).find(c => c === val || c.startsWith(val));
          if (matched) {
            selectCategory(matched);
          } else {
            const firstCat = Object.keys(CATEGORIES)[0];
            selectCategory(firstCat);
          }
        }
        if (amountEl) amountEl.focus();
      } else if (activeEl === dateEl) {
        if (amountEl) amountEl.focus();
      } else {
        submitQuickTx();
      }
    } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      const suggestionsContainer = document.getElementById('qa-tx-cat-suggestions');
      if (suggestionsContainer && suggestionsContainer.style.display !== 'none') {
        event.preventDefault();
        const items = Array.from(suggestionsContainer.querySelectorAll('.autocomplete-suggestion-item'));
        if (items.length === 0) return;
        
        let activeIdx = items.findIndex(el => el.classList.contains('active'));
        if (event.key === 'ArrowDown') {
          activeIdx = (activeIdx + 1) % items.length;
        } else {
          activeIdx = (activeIdx - 1 + items.length) % items.length;
        }
        
        items.forEach((item, idx) => {
          if (idx === activeIdx) {
            item.classList.add('active');
            item.scrollIntoView({ block: 'nearest' });
          } else {
            item.classList.remove('active');
          }
        });
      }
    } else if (event.key === 'Escape') {
      hideCategorySuggestions();
    }
  };

  document.addEventListener('DOMContentLoaded', init);
})();

