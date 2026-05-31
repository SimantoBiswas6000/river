/* ── Planning JS (Plans as Folders) ── */
(function() {
  let currentTab = 'active';
  let activePlanId = Store.get('river_active_plan_id') || null;
  let searchQuery = '';

  function init() {
    renderFolders();
    render();

    // Auto-open plan creation modal if "?new=1" is in the URL search params
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('new')) {
      setTimeout(() => {
        openPlanModal();
      }, 100);
    }
  }

  window.switchTab = function(tab) {
    currentTab = tab;
    document.getElementById('tab-active').classList.toggle('active', tab === 'active');
    document.getElementById('tab-archived').classList.toggle('active', tab === 'archived');
    
    // Auto-select the first plan in the newly selected tab list
    const plans = getFilteredPlansList();
    if (plans.length) {
      activePlanId = plans[0].id;
    } else {
      activePlanId = null;
    }
    Store.set('river_active_plan_id', activePlanId);

    renderFolders();
    render();
  };

  window.switchPlan = function(planId) {
    activePlanId = planId;
    Store.set('river_active_plan_id', planId);
    renderFolders();
    render();
  };

  function getFilteredPlansList() {
    let plans = getPlans().filter(p => currentTab === 'active' ? p.status === 'active' : p.status === 'archived');
    
    // Search Filtering: matches plan title or items inside
    if (searchQuery) {
      plans = plans.filter(p => 
        p.title.toLowerCase().includes(searchQuery) || 
        (p.items || []).some(item => item.name.toLowerCase().includes(searchQuery))
      );
    }

    return plans;
  }

  function renderFolders() {
    const plans = getFilteredPlansList();
    const rowEl = document.getElementById('folder-row');
    if (!rowEl) return;

    // Validate activePlanId against current filtered plans list
    if (activePlanId && !plans.some(p => p.id === activePlanId) && plans.length) {
      activePlanId = plans[0].id;
      Store.set('river_active_plan_id', activePlanId);
    } else if (!plans.length) {
      activePlanId = null;
      Store.set('river_active_plan_id', null);
    }

    let html = '';
    plans.forEach(p => {
      const isActive = activePlanId === p.id;
      html += `
        <button class="folder-pill ${isActive ? 'active' : ''}" onclick="switchPlan('${p.id}')">
          <i class="fi ${isActive ? 'fi-sr-folder-open' : 'fi-sr-folder'}"></i> ${escHtml(p.title)}
        </button>
      `;
    });

    html += `
      <button class="folder-pill add-folder-btn" onclick="openPlanModal()" title="Create New Plan">
        <i class="fi fi-sr-plus"></i> New Plan
      </button>
    `;

    rowEl.innerHTML = html;

    // Update CRUD controls in actions area for the active plan
    const actionsEl = document.querySelector('.planning-actions');
    if (actionsEl) {
      // Remove any existing controls
      const oldCrud = document.getElementById('folder-crud-controls');
      if (oldCrud) oldCrud.remove();

      const activePlan = plans.find(p => p.id === activePlanId);
      if (activePlan) {
        const crudDiv = document.createElement('div');
        crudDiv.id = 'folder-crud-controls';
        crudDiv.style.display = 'flex';
        crudDiv.style.gap = '8px';
        crudDiv.innerHTML = `
          <button class="btn btn-ghost btn-sm" onclick="renameActivePlan()" title="Rename Plan"><i class="fi fi-sr-edit"></i> Rename</button>
          <button class="btn btn-danger btn-sm" onclick="deleteActivePlan()" title="Delete Plan"><i class="fi fi-sr-trash"></i></button>
        `;
        actionsEl.appendChild(crudDiv);
      }
    }
  }

  window.openPlanModal = function() {
    const body = `
      <div class="form-group">
        <label>Plan Title</label>
        <input type="text" class="form-control" id="m-plan-title" placeholder="e.g. Weekend Shopping">
      </div>
      <div class="form-group">
        <label>Date</label>
        <input type="date" class="form-control" id="m-plan-date" value="${todayStr()}">
      </div>`;
    showModal('Create Plan', body, [
      { label: 'Cancel', cls: 'btn-ghost', action: hideModal },
      { label: 'Create', cls: 'btn-primary', action: () => {
        const title = document.getElementById('m-plan-title').value.trim();
        if (!title) { showToast('Enter a plan title', 'error'); return; }
        const plans = getPlans();
        const planId = uuid();
        plans.push({ id: planId, title, date: document.getElementById('m-plan-date').value || todayStr(), status: 'active', items: [] });
        savePlans(plans);

        hideModal();
        showToast('Plan created!');
        currentTab = 'active';
        activePlanId = planId;
        Store.set('river_active_plan_id', planId);

        // Reset search query on creating a plan so it is immediately visible
        searchQuery = '';
        const searchInput = document.getElementById('search-plans');
        if (searchInput) searchInput.value = '';

        document.getElementById('tab-active').classList.add('active');
        document.getElementById('tab-archived').classList.remove('active');
        renderFolders();
        render();
      }}
    ]);
    setTimeout(() => document.getElementById('m-plan-title').focus(), 200);
  };

  window.renameActivePlan = function() {
    const plans = getPlans();
    const plan = plans.find(p => p.id === activePlanId);
    if (!plan) return;

    const body = `
      <div class="form-group">
        <label>Rename Plan</label>
        <input type="text" class="form-control" id="m-plan-rename" value="${escHtml(plan.title)}">
      </div>`;
    showModal('Rename Plan', body, [
      { label: 'Cancel', cls: 'btn-ghost', action: hideModal },
      { label: 'Save Changes', cls: 'btn-primary', action: () => {
        const name = document.getElementById('m-plan-rename').value.trim();
        if (!name) { showToast('Enter plan name', 'error'); return; }
        plan.title = name;
        savePlans(plans);
        hideModal();
        showToast('Plan renamed!');
        renderFolders();
        render();
      }}
    ]);
    setTimeout(() => document.getElementById('m-plan-rename').focus(), 200);
  };

  window.deleteActivePlan = function() {
    const plans = getPlans();
    const plan = plans.find(p => p.id === activePlanId);
    if (!plan) return;

    showModal('Delete Plan', `
      <p>Are you sure you want to delete the plan <strong>${escHtml(plan.title)}</strong>?</p>
      <p style="margin-top:12px;color:var(--text3);font-size:.875rem;">⚠️ Note: This will permanently delete the plan and all its items.</p>`, [
      { label: 'Cancel', cls: 'btn-ghost', action: hideModal },
      { label: 'Delete', cls: 'btn-danger', action: () => {
        const newPlans = plans.filter(p => p.id !== activePlanId);
        savePlans(newPlans);

        hideModal();
        showToast('Plan deleted.');
        
        // Auto select another plan if available
        const remaining = newPlans.filter(p => currentTab === 'active' ? p.status === 'active' : p.status === 'archived');
        if (remaining.length) {
          activePlanId = remaining[0].id;
        } else {
          activePlanId = null;
        }
        Store.set('river_active_plan_id', activePlanId);
        renderFolders();
        render();
      }}
    ]);
  };

  window.handleSearch = function(val) {
    searchQuery = val.trim().toLowerCase();
    renderFolders();
    render();
  };

  function render() {
    const container = document.getElementById('plans-container');
    const empty = document.getElementById('plans-empty');
    if (!container || !empty) return;

    const plans = getFilteredPlansList();
    let activePlan = plans.find(p => p.id === activePlanId);

    // If active plan is not in the list but list has plans, default to first plan
    if (!activePlan && plans.length) {
      activePlan = plans[0];
      activePlanId = activePlan.id;
      Store.set('river_active_plan_id', activePlanId);
    }

    if (!plans.length || !activePlan) {
      container.innerHTML = '';
      empty.style.display = '';

      // Update empty state text based on selected tab
      const emptyTitle = empty.querySelector('h3');
      const emptyDesc = empty.querySelector('p');
      const createBtn = empty.querySelector('button');
      if (emptyTitle && emptyDesc) {
        if (currentTab === 'archived') {
          emptyTitle.textContent = 'No archived plans';
          emptyDesc.textContent = 'Completed plans will appear here in the archive';
          if (createBtn) createBtn.style.display = 'none';
        } else {
          emptyTitle.textContent = 'No plans yet';
          emptyDesc.textContent = 'Create a spending plan to track your budget';
          if (createBtn) createBtn.style.display = '';
        }
      }
      return;
    }

    empty.style.display = 'none';
    const p = activePlan;

    // Filter items inside the active plan if searching
    let items = p.items || [];
    if (searchQuery) {
      items = items.filter(item => item.name.toLowerCase().includes(searchQuery));
    }

    const uncrossed = items.filter(i => !i.crossed);
    const crossed = items.filter(i => i.crossed);
    const budget = uncrossed.reduce((s, i) => s + parseFloat(i.maxPrice || 0), 0);
    const totalItems = items.length;
    const crossedCount = crossed.length;

    const itemsHtml = items.map(item => `
      <div class="plan-item ${item.crossed ? 'crossed' : ''}">
        ${p.status === 'active' ? `<button class="plan-item-check" onclick="toggleItem('${p.id}','${item.id}')" title="Toggle">✓</button>` : '<span style="width:20px;"></span>'}
        <span class="plan-item-name">${escHtml(item.name)}</span>
        <span class="badge badge-${item.category}" style="font-size:.7rem;">${item.category}</span>
        <span class="plan-item-price">${currency(item.maxPrice)}${item.minPrice ? ' <span style="color:var(--text3);font-size:.8rem;">min ' + currency(item.minPrice) + '</span>' : ''}</span>
        ${p.status === 'active' ? `<button class="btn btn-danger btn-icon btn-sm" onclick="removeItem('${p.id}','${item.id}')" title="Remove" style="width:28px;height:28px;font-size:.7rem;display:inline-flex;align-items:center;justify-content:center;"><i class="fi fi-sr-cross" style="font-size:8px;"></i></button>` : ''}
      </div>`).join('');

    const lastCat = Store.get(`river_quick_cat_${p.id}`) || '';

    container.innerHTML = `
      <div class="card plan-card" id="plan-card-${p.id}" style="margin-bottom:20px;">
        <div class="plan-card-header" style="cursor: default;">
          <div style="display:flex;gap:12px;align-items:flex-start;">
            <div>
              <h3 style="font-size:1.4rem;margin-bottom:4px;color:var(--text);"><i class="fi fi-sr-folder-open" style="color:var(--accent);margin-right:8px;"></i>${escHtml(p.title)}</h3>
              <div style="color:var(--text3);font-size:.85rem;margin-left:28px;">${formatDate(p.date)} · ${totalItems} item${totalItems !== 1 ? 's' : ''} · ${crossedCount} skipped</div>
            </div>
          </div>
          <div style="text-align:right;">
            <div class="plan-budget" style="font-size:1.4rem;">${currency(budget)}</div>
            <div style="color:var(--text3);font-size:.75rem;">live budget</div>
          </div>
        </div>
        
        <div class="plan-card-content" style="display:block;">
          <div class="plan-items">${itemsHtml || (searchQuery ? '<p style="color:var(--text3);padding:12px 0;">No items match your search</p>' : '<p style="color:var(--text3);padding:12px 0;">No items added yet</p>')}</div>
          ${p.status === 'active' ? `
          <!-- Inline Quick Add Form -->
          <div class="plan-quick-add" onclick="event.stopPropagation();">
            <input type="text" class="form-control form-control-sm quick-add-name" placeholder="Item name..." id="qa-name-${p.id}" onkeydown="handleQuickAddKey(event, '${p.id}')" tabindex="0">
            <select class="form-control form-control-sm quick-add-cat" id="qa-cat-${p.id}" onchange="saveQuickAddCat('${p.id}', this.value)" onkeydown="handleQuickAddKey(event, '${p.id}')" tabindex="0">
              ${categoryOptions(lastCat)}
            </select>
            <input type="number" class="form-control form-control-sm quick-add-max" placeholder="Max Price" id="qa-price-${p.id}" onkeydown="handleQuickAddKey(event, '${p.id}')" min="0" step="any" tabindex="0">
            <input type="number" class="form-control form-control-sm quick-add-min" placeholder="Min Price" id="qa-min-${p.id}" onkeydown="handleQuickAddKey(event, '${p.id}')" min="0" step="any" tabindex="0">
            <button class="btn btn-primary btn-sm quick-add-btn" onclick="submitQuickAddItem('${p.id}')" title="Quick Add" tabindex="0">
              <i class="fi fi-sr-plus"></i><span class="quick-add-btn-text"> Add Item</span>
            </button>
          </div>
          
          <div style="display:flex;gap:8px;margin-top:16px;flex-wrap:wrap;align-items:center;" onclick="event.stopPropagation();">
            <button class="btn btn-primary btn-sm" onclick="finishPlan('${p.id}')" tabindex="0"><i class="fi fi-sr-check"></i> Finish Plan</button>
            <button class="btn btn-danger btn-sm" onclick="deleteActivePlan()" style="margin-left:auto;" tabindex="0"><i class="fi fi-sr-trash"></i> Delete</button>
          </div>` : ''}
        </div>
      </div>`;
  }

  function escHtml(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

  /* Toggle cross-off */
  window.toggleItem = function(planId, itemId) {
    const plans = getPlans();
    const plan = plans.find(p => p.id === planId);
    if (plan) {
      const item = plan.items.find(i => i.id === itemId);
      if (item) item.crossed = !item.crossed;
      savePlans(plans);
      render();
    }
  };

  /* Remove item */
  window.removeItem = function(planId, itemId) {
    const plans = getPlans();
    const plan = plans.find(p => p.id === planId);
    if (plan) {
      plan.items = plan.items.filter(i => i.id !== itemId);
      savePlans(plans);
      render();
    }
  };

  /* Finish Plan Flow */
  window.finishPlan = function(planId) {
    const plans = getPlans();
    const plan = plans.find(p => p.id === planId);
    if (!plan) return;

    const uncrossed = plan.items.filter(i => !i.crossed);
    if (!uncrossed.length) {
      // All items crossed — archive directly with no transactions
      plan.status = 'archived';
      savePlans(plans);
      showToast(`Plan "${plan.title}" archived!`);

      const remaining = plans.filter(p => p.status === 'active');
      activePlanId = remaining.length ? remaining[0].id : null;
      Store.set('river_active_plan_id', activePlanId);
      renderFolders();
      render();
      return;
    }

    let idx = 0;
    const transactions = [];

    function processItem() {
      if (idx >= uncrossed.length) {
        const allTxs = getTransactions();
        transactions.forEach(t => allTxs.push(t));
        saveTransactions(allTxs);
        plan.status = 'archived';
        savePlans(plans);
        hideModal();
        showToast(`Plan "${plan.title}" finished! ${transactions.length} transactions recorded.`);
        
        // Auto select another plan if available
        const remaining = plans.filter(p => p.status === 'active');
        if (remaining.length) {
          activePlanId = remaining[0].id;
        } else {
          activePlanId = null;
        }
        Store.set('river_active_plan_id', activePlanId);

        renderFolders();
        render();
        return;
      }

      const item = uncrossed[idx];
      const body = `
        <p style="color:var(--text2);margin-bottom:16px;">Item ${idx+1} of ${uncrossed.length}: <strong>${escHtml(item.name)}</strong></p>
        <div class="form-group">
          <label>Actual Price Paid</label>
          <input type="number" class="form-control" id="m-finish-price" value="${item.maxPrice}" min="0" step="any">
        </div>
        <div class="form-group">
          <label>Date</label>
          <input type="date" class="form-control" id="m-finish-date" value="${todayStr()}">
        </div>
        <div class="form-group">
          <label>Note (optional)</label>
          <input type="text" class="form-control" id="m-finish-note" value="${escHtml(item.name)} — ${escHtml(plan.title)}">
        </div>`;

      showModal('Finish Plan — Record Purchase', body, [
        { label: 'Skip', cls: 'btn-ghost', action: () => { idx++; processItem(); }},
        { label: idx === uncrossed.length - 1 ? 'Finish' : 'Next →', cls: 'btn-primary', action: () => {
          const price = parseFloat(document.getElementById('m-finish-price').value);
          if (!price || price <= 0) { showToast('Enter actual price', 'error'); return; }
          transactions.push({
            id: uuid(),
            date: document.getElementById('m-finish-date').value || todayStr(),
            category: item.category,
            amount: price,
            note: document.getElementById('m-finish-note').value.trim(),
            fromPlan: plan.id
          });
          idx++;
          processItem();
        }}
      ]);
    }

    processItem();
  };

  /* Inline Quick Add Submission */
  window.submitQuickAddItem = function(planId) {
    const nameEl = document.getElementById(`qa-name-${planId}`);
    const catEl = document.getElementById(`qa-cat-${planId}`);
    const priceEl = document.getElementById(`qa-price-${planId}`);
    const minEl = document.getElementById(`qa-min-${planId}`);

    const name = nameEl.value.trim();
    const price = parseFloat(priceEl.value);
    const minPrice = parseFloat(minEl.value) || 0;
    const category = catEl.value;

    if (!name) { showToast('Enter item name', 'error'); nameEl.focus(); return; }
    if (!price || price <= 0) { showToast('Enter max price limit', 'error'); priceEl.focus(); return; }

    const plans = getPlans();
    const plan = plans.find(p => p.id === planId);
    if (plan) {
      plan.items.push({ id: uuid(), name, category, maxPrice: price, minPrice: minPrice, crossed: false });
      savePlans(plans);
    }

    Store.set(`river_quick_cat_${planId}`, category);

    nameEl.value = '';
    priceEl.value = '';
    minEl.value = '';
    showToast('Item added!');
    render();

    setTimeout(() => {
      const el = document.getElementById(`qa-name-${planId}`);
      if (el) el.focus();
    }, 50);
  };

  window.saveQuickAddCat = function(planId, val) {
    Store.set(`river_quick_cat_${planId}`, val);
  };

  window.handleQuickAddKey = function(event, planId) {
    if (event.key === 'Enter') {
      if (event.repeat) return;
      event.preventDefault();
      
      const activeEl = document.activeElement;
      const nameEl = document.getElementById(`qa-name-${planId}`);
      const catEl = document.getElementById(`qa-cat-${planId}`);
      const priceEl = document.getElementById(`qa-price-${planId}`);
      const minEl = document.getElementById(`qa-min-${planId}`);

      if (activeEl === nameEl) {
        if (catEl) catEl.focus();
      } else if (activeEl === catEl) {
        if (priceEl) priceEl.focus();
      } else if (activeEl === priceEl) {
        if (minEl) minEl.focus();
      } else if (activeEl === minEl) {
        submitQuickAddItem(planId);
      } else {
        submitQuickAddItem(planId);
      }
    }
  };

  document.addEventListener('DOMContentLoaded', init);
})();
