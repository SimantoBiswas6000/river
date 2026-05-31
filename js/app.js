/* ── River Core Utilities ── */
const Store = {
  get(key) { try { return JSON.parse(localStorage.getItem(key)); } catch { return null; } },
  set(key, val) { localStorage.setItem(key, JSON.stringify(val)); },
  remove(key) { localStorage.removeItem(key); }
};

function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

function getSettings() {
  return Store.get('river_settings') || { currency: '৳' };
}

function getTransactions() { return Store.get('river_transactions') || []; }
function saveTransactions(t) { Store.set('river_transactions', t); }
function getPlans() { return Store.get('river_plans') || []; }
function savePlans(p) { Store.set('river_plans', p); }
function getCart() { return Store.get('river_cart') || []; }
function saveCart(c) { Store.set('river_cart', c); }
function getInflows() { return Store.get('river_inflows') || []; }
function saveInflows(i) { Store.set('river_inflows', i); }

function currency(amount) {
  const s = getSettings();
  return s.currency + parseFloat(amount || 0).toLocaleString('en-IN');
}

function formatDate(d) {
  if (!d) return '';
  const dt = new Date(d);
  return dt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function todayStr() {
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
}

const CATEGORIES = {
  meal: { color: '#1be0e0', icon: '🍽️' },
  transportation: { color: '#ffb236', icon: '🚌' },
  education: { color: '#3de022', icon: '📚' },
  health: { color: '#b8ff66', icon: '💊' },
  tour: { color: '#ff425e', icon: '✈️' },
  junk: { color: '#c084fc', icon: '🍟' }
};

const CART_CATEGORIES = {
  need: { color: '#1be0e0' },
  want: { color: '#ffb236' },
  crucial: { color: '#3de022' }
};

/* ── Modal System ── */
function showModal(title, bodyHTML, actions) {
  let overlay = document.getElementById('modal-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'modal-overlay';
    overlay.className = 'modal-overlay';
    overlay.innerHTML = '<div class="modal"><form id="modal-form" onsubmit="event.preventDefault();" style="margin:0;"><div class="modal-header"><h2 id="modal-title"></h2><button type="button" class="modal-close" onclick="hideModal()"><i class="fi fi-sr-cross" style="font-size:12px;"></i></button></div><div id="modal-body"></div><div class="modal-actions" id="modal-actions"></div></form></div>';
    document.body.appendChild(overlay);
    overlay.addEventListener('click', e => { if (e.target === overlay) hideModal(); });
  }
  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-body').innerHTML = bodyHTML;
  
  const form = document.getElementById('modal-form');
  form.onsubmit = (e) => {
    e.preventDefault();
  };

  const actEl = document.getElementById('modal-actions');
  actEl.innerHTML = '';
  if (actions) {
    actions.forEach(a => {
      const btn = document.createElement('button');
      btn.className = 'btn ' + (a.cls || 'btn-ghost');
      btn.innerHTML = a.label;
      btn.onclick = a.action;
      
      // Mark primary or danger action buttons as type="submit"
      if (a.cls && (a.cls.includes('btn-primary') || a.cls.includes('btn-danger'))) {
        btn.type = 'submit';
      } else {
        btn.type = 'button';
      }
      actEl.appendChild(btn);
    });
  }
  requestAnimationFrame(() => overlay.classList.add('active'));
}

function hideModal() {
  const o = document.getElementById('modal-overlay');
  if (o) o.classList.remove('active');
}

/* ── Toast System ── */
function showToast(msg, type = 'success') {
  let c = document.querySelector('.toast-container');
  if (!c) { c = document.createElement('div'); c.className = 'toast-container'; document.body.appendChild(c); }
  const t = document.createElement('div');
  t.className = 'toast toast-' + type;
  t.textContent = msg;
  c.appendChild(t);
  setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 300); }, 3000);
}

/* ── Category Select HTML ── */
function categoryOptions(selected) {
  return Object.keys(CATEGORIES).map(c =>
    `<option value="${c}" ${selected===c?'selected':''}>${c.charAt(0).toUpperCase()+c.slice(1)}</option>`
  ).join('');
}

function cartCategoryOptions(selected) {
  return Object.keys(CART_CATEGORIES).map(c =>
    `<option value="${c}" ${selected===c?'selected':''}>${c.charAt(0).toUpperCase()+c.slice(1)}</option>`
  ).join('');
}

/* ── Mobile sidebar toggle ── */
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.mobile-toggle');
  const sidebar = document.querySelector('.sidebar');
  if (toggle && sidebar) {
    toggle.addEventListener('click', () => sidebar.classList.toggle('open'));
    document.querySelector('.main')?.addEventListener('click', () => sidebar.classList.remove('open'));
  }
});

/* ── Keyboard Shortcuts & Mobile Touch Hold Gestures ── */
(function() {
  const ext = window.location.pathname.endsWith('.php') ? '.php' : '.html';

  // Global modal for quick transaction
  window.openQuickTransactionModal = function() {
    const lastCat = Store.get('river_quick_tx_cat') || 'meal';
    const formHTML = `
      <div class="form-group">
        <label for="m-tx-note">Description</label>
        <input type="text" id="m-tx-note" class="form-control" placeholder="e.g. Starbucks" tabindex="1">
      </div>
      <div class="form-group">
        <label for="m-tx-cat">Category</label>
        <select id="m-tx-cat" class="form-control" tabindex="2">
          ${categoryOptions(lastCat)}
        </select>
      </div>
      <div class="form-group">
        <label for="m-tx-date">Date</label>
        <input type="date" id="m-tx-date" class="form-control" value="${todayStr()}" tabindex="3">
      </div>
      <div class="form-group">
        <label for="m-tx-amount">Amount</label>
        <input type="number" id="m-tx-amount" class="form-control" placeholder="0.00" min="0" step="any" tabindex="4">
      </div>
    `;

    showModal('Quick Add Transaction', formHTML, [
      { label: 'Cancel', cls: 'btn-ghost', action: hideModal },
      { label: 'Add Transaction', cls: 'btn-primary', action: () => {
        const noteEl = document.getElementById('m-tx-note');
        const catEl = document.getElementById('m-tx-cat');
        const dateEl = document.getElementById('m-tx-date');
        const amountEl = document.getElementById('m-tx-amount');

        const note = noteEl.value.trim();
        const amount = parseFloat(amountEl.value);
        const category = catEl.value;
        const date = dateEl.value || todayStr();
        const finalNote = note || (category.charAt(0).toUpperCase() + category.slice(1));

        if (!amount || amount <= 0) {
          showToast('Enter a valid amount', 'error');
          amountEl.focus();
          return;
        }

        const txs = getTransactions();
        txs.push({ id: uuid(), date, category, amount, note: finalNote, fromPlan: null });
        saveTransactions(txs);
        Store.set('river_quick_tx_cat', category);

        hideModal();
        showToast('Transaction added!');
        
        // Refresh active views
        if (typeof init === 'function') {
          init();
        } else {
          window.location.reload();
        }
      }}
    ]);

    setTimeout(() => {
      const input = document.getElementById('m-tx-note');
      if (input) input.focus();
    }, 150);
  };
})();

