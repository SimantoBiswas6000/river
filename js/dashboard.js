/* ── Dashboard JS ── */
(function() {
  let activeView = 'doughnut'; // 'doughnut' or 'trend'
  const now = new Date();
  const currentMonthStr = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0');
  let selectedMonth = currentMonthStr; // default to current month YYYY-MM
  let doughnutChart = null;
  let trendChart = null;

  function init() {
    updateStats();
    renderChartControls();
    renderChart();
    renderRecent();
    renderQuickAdd();
  }

  function getMonthLabel(m) {
    if (m === 'all') return 'All Time';
    const parts = m.split('-');
    const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, 1);
    return d.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
  }

  function renderChartControls() {
    const txs = getTransactions();
    const monthsSet = new Set();
    monthsSet.add(currentMonthStr); // Always include current month in options
    txs.forEach(t => {
      if (t.date && t.date.length >= 7) {
        monthsSet.add(t.date.substring(0, 7)); // YYYY-MM
      }
    });
    const months = Array.from(monthsSet).sort((a, b) => b.localeCompare(a)); // Descending

    const select = document.getElementById('spending-month-select');
    if (select) {
      const prevVal = select.value || selectedMonth;
      let html = '<option value="all">All Time</option>';
      months.forEach(m => {
        const parts = m.split('-');
        const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, 1);
        const label = d.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
        html += `<option value="${m}">${label}</option>`;
      });
      select.innerHTML = html;
      if (Array.from(select.options).some(o => o.value === prevVal)) {
        select.value = prevVal;
      } else {
        select.value = currentMonthStr;
      }
      selectedMonth = select.value;
      
      select.onchange = function() {
        selectedMonth = this.value;
        renderChart();
      };
    }

    const toggleBtn = document.getElementById('spending-view-toggle');
    if (toggleBtn) {
      toggleBtn.onclick = function() {
        activeView = activeView === 'doughnut' ? 'trend' : 'doughnut';
        renderChart();
      };
    }
  }

  function updateStats() {
    const txs = getTransactions();
    const spent = txs.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
    const inflows = getInflows();
    const income = inflows.reduce((sum, i) => sum + parseFloat(i.amount || 0), 0);
    const balance = income - spent;

    document.getElementById('stat-spent').textContent = currency(spent);
    const balEl = document.getElementById('stat-balance');
    if (balEl) {
      balEl.textContent = currency(balance);
      balEl.style.color = balance < 0 ? 'var(--danger)' : '';
    }
  }

  function renderChart() {
    const select = document.getElementById('spending-month-select');
    const toggleBtn = document.getElementById('spending-view-toggle');
    const titleEl = document.getElementById('spending-card-title');

    if (activeView === 'doughnut') {
      // Toggle visibility
      document.getElementById('chart-container').style.display = 'flex';
      document.getElementById('trend-container').style.display = 'none';
      if (select) select.style.display = 'block';
      if (titleEl) {
        titleEl.textContent = selectedMonth === 'all' ? 'Spending Share (All Time)' : `Spending Share (${getMonthLabel(selectedMonth)})`;
      }
      if (toggleBtn) {
        toggleBtn.innerHTML = '<i class="fi fi-sr-chart-histogram"></i>';
        toggleBtn.title = 'Show Monthly Trend';
      }

      // Filter txs
      let txs = getTransactions();
      if (selectedMonth !== 'all') {
        txs = txs.filter(t => t.date && t.date.startsWith(selectedMonth));
      }

      const data = {};
      Object.keys(CATEGORIES).forEach(c => data[c] = 0);
      txs.forEach(t => { if (data[t.category] !== undefined) data[t.category] += parseFloat(t.amount || 0); });

      const hasData = Object.values(data).some(v => v > 0);
      const canvas = document.getElementById('spending-chart');
      const empty = document.getElementById('chart-empty');

      if (doughnutChart) { doughnutChart.destroy(); doughnutChart = null; }
      if (trendChart) { trendChart.destroy(); trendChart = null; }

      if (!hasData) {
        canvas.style.display = 'none';
        empty.style.display = '';
        return;
      }
      canvas.style.display = '';
      empty.style.display = 'none';

      const labels = Object.keys(data).filter(k => data[k] > 0);
      const values = labels.map(k => data[k]);
      const colors = labels.map(k => CATEGORIES[k].color);

      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      const tickColor = isDark ? '#94a3b8' : '#475569';
      const tooltipBg = isDark ? '#1e293b' : '#ffffff';
      const tooltipColor = isDark ? '#e2e8f0' : '#0f172a';
      const tooltipBorder = isDark ? 'rgba(148, 163, 184, 0.1)' : 'rgba(0, 0, 0, 0.08)';

      doughnutChart = new Chart(canvas, {
        type: 'doughnut',
        data: {
          labels: labels.map(l => l.charAt(0).toUpperCase() + l.slice(1)),
          datasets: [{ data: values, backgroundColor: colors, borderWidth: 0, hoverOffset: 8 }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '65%',
          plugins: {
            legend: {
              position: 'bottom',
              labels: { color: tickColor, padding: 16, usePointStyle: true, pointStyleWidth: 10, font: { family: 'Inter', size: 12 } }
            },
            tooltip: {
              backgroundColor: tooltipBg,
              titleColor: tooltipColor,
              bodyColor: tooltipColor,
              borderColor: tooltipBorder,
              borderWidth: 1,
              titleFont: { family: 'Inter' },
              bodyFont: { family: 'Inter' },
              padding: 12,
              callbacks: { label: ctx => ' ' + ctx.label + ': ' + currency(ctx.raw) }
            }
          }
        }
      });

    } else {
      // Toggle visibility
      document.getElementById('chart-container').style.display = 'none';
      document.getElementById('trend-container').style.display = 'block';
      if (select) select.style.display = 'none';
      if (titleEl) titleEl.textContent = 'Monthly Category Trend';
      if (toggleBtn) {
        toggleBtn.innerHTML = '<i class="fi fi-sr-chart-pie"></i>';
        toggleBtn.title = 'Show Category Share';
      }

      const txs = getTransactions();
      const monthsSet = new Set();
      txs.forEach(t => {
        if (t.date && t.date.length >= 7) {
          monthsSet.add(t.date.substring(0, 7));
        }
      });
      const months = Array.from(monthsSet).sort(); // chronological ascending

      const canvas = document.getElementById('spending-trend-chart');
      const empty = document.getElementById('trend-empty');

      if (doughnutChart) { doughnutChart.destroy(); doughnutChart = null; }
      if (trendChart) { trendChart.destroy(); trendChart = null; }

      if (months.length === 0) {
        canvas.style.display = 'none';
        empty.style.display = '';
        return;
      }
      canvas.style.display = '';
      empty.style.display = 'none';

      const monthData = {};
      months.forEach(m => {
        monthData[m] = {};
        Object.keys(CATEGORIES).forEach(c => monthData[m][c] = 0);
      });
      txs.forEach(t => {
        const m = t.date ? t.date.substring(0, 7) : '';
        if (monthData[m] && monthData[m][t.category] !== undefined) {
          monthData[m][t.category] += parseFloat(t.amount || 0);
        }
      });

      const datasets = Object.keys(CATEGORIES).map(c => {
        return {
          label: c.charAt(0).toUpperCase() + c.slice(1),
          data: months.map(m => monthData[m][c]),
          backgroundColor: CATEGORIES[c].color,
          borderRadius: 4
        };
      });

      const formattedMonths = months.map(m => {
        const parts = m.split('-');
        const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, 1);
        return d.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
      });

      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      const gridColor = isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.05)';
      const tickColor = isDark ? '#94a3b8' : '#475569';
      const tooltipBg = isDark ? '#1e293b' : '#ffffff';
      const tooltipColor = isDark ? '#e2e8f0' : '#0f172a';
      const tooltipBorder = isDark ? 'rgba(148, 163, 184, 0.1)' : 'rgba(0, 0, 0, 0.08)';

      trendChart = new Chart(canvas, {
        type: 'bar',
        data: {
          labels: formattedMonths,
          datasets: datasets
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: { color: tickColor, padding: 16, usePointStyle: true, pointStyleWidth: 10, font: { family: 'Inter', size: 12 } }
            },
            tooltip: {
              backgroundColor: tooltipBg,
              titleColor: tooltipColor,
              bodyColor: tooltipColor,
              borderColor: tooltipBorder,
              borderWidth: 1,
              titleFont: { family: 'Inter' },
              bodyFont: { family: 'Inter' },
              padding: 12,
              callbacks: {
                label: ctx => ` ${ctx.dataset.label}: ${currency(ctx.raw)}`
              }
            }
          },
          scales: {
            x: {
              stacked: true,
              grid: { display: false },
              ticks: { color: tickColor }
            },
            y: {
              stacked: true,
              grid: { color: gridColor },
              ticks: { color: tickColor }
            }
          }
        }
      });
    }
  }

  function renderRecent() {
    const txs = getTransactions().sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);
    const container = document.getElementById('recent-transactions');
    const empty = document.getElementById('tx-empty');

    // Remove old tx-items but keep the empty state div intact
    container.querySelectorAll('.tx-item').forEach(el => el.remove());

    if (!txs.length) {
      if (empty) empty.style.display = '';
      return;
    }
    if (empty) empty.style.display = 'none';

    const html = txs.map(t => {
      const cat = CATEGORIES[t.category] || {};
      return '<div class="tx-item">'
        + '<div class="tx-cat-dot" style="background:' + (cat.color || 'var(--text3)') + ';"></div>'
        + '<div class="tx-info">'
        + '<div class="tx-note">' + escHtml(t.note || t.category) + '</div>'
        + '<div class="tx-meta"><span>' + formatDate(t.date) + '</span><span class="badge badge-' + t.category + '">' + t.category + '</span></div>'
        + '</div>'
        + '<div class="tx-amount negative">' + currency(t.amount) + '</div>'
        + '</div>';
    }).join('');

    if (empty) {
      empty.insertAdjacentHTML('beforebegin', html);
    } else {
      container.insertAdjacentHTML('beforeend', html);
    }
  }

  function escHtml(s) {
    const d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  function renderQuickAdd() {
    const container = document.getElementById('tx-quick-add-container');
    if (!container) return;
    const lastCat = Store.get('river_quick_tx_cat') || 'meal';
    const displayCat = lastCat.charAt(0).toUpperCase() + lastCat.slice(1);
    container.innerHTML = ''
      + '<input type="text" class="form-control form-control-sm quick-add-name" placeholder="Description (e.g. Starbucks)" id="qa-tx-note" onkeydown="handleQuickTxKey(event)" tabindex="0">'
      + '<div class="autocomplete-container">'
      + '  <input type="text" class="form-control form-control-sm quick-add-cat" id="qa-tx-cat" placeholder="Category" autocomplete="off" onkeydown="handleQuickTxKey(event)" onfocus="showCategorySuggestions()" oninput="filterCategorySuggestions()" onblur="hideCategorySuggestionsWithDelay()" tabindex="0" value="' + displayCat + '">'
      + '  <div class="autocomplete-suggestions" id="qa-tx-cat-suggestions"></div>'
      + '</div>'
      + '<input type="date" class="form-control form-control-sm quick-add-date" id="qa-tx-date" value="' + todayStr() + '" onkeydown="handleQuickTxKey(event)" tabindex="0">'
      + '<input type="number" class="form-control form-control-sm quick-add-max" placeholder="Amount" id="qa-tx-amount" onkeydown="handleQuickTxKey(event)" min="0" step="any" tabindex="0">'
      + '<button class="btn btn-primary btn-sm quick-add-btn" onclick="submitQuickTx()" title="Add Transaction" tabindex="0">'
      + '<i class="fi fi-sr-plus"></i><span class="quick-add-btn-text"> Add Transaction</span>'
      + '</button>';

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

  /* Dashboard-specific submitQuickTx — saves, then refreshes all dashboard panels */
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
    txs.push({ id: uuid(), date, category, amount, note: finalNote, fromPlan: null });
    saveTransactions(txs);
    Store.set('river_quick_tx_cat', category);

    noteEl.value = '';
    amountEl.value = '';

    showToast('Transaction added!');
    
    // Refresh dashboard data panels without destroying the DOM elements
    updateStats();
    renderChartControls();
    renderChart();
    renderRecent();

    // Re-focus the note input synchronously keeping keyboard open
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
  window.addEventListener('themechange', () => { renderChart(); });
})();

