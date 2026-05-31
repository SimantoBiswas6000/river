/* ── Statistics JS Controller ── */
(function() {
  let charts = {
    balanceTrend: null,
    monthlyCompare: null,
    categoryDonut: null,
    dayBar: null
  };

  function init() {
    calculateOverview();
    renderBalanceTrend();
    renderMonthlyCompare();
    renderCategoryBreakdown();
    renderPeakSpendingDays();
  }

  function calculateOverview() {
    const txs = getTransactions();
    const inflows = getInflows();

    const spent = txs.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
    const income = inflows.reduce((sum, i) => sum + parseFloat(i.amount || 0), 0);
    const savedAmount = income - spent;

    // 1. Savings Rate
    let savingsRate = 0;
    let savingsLabel = 'No income logged yet';
    let diagnosis = '🌱 Loading...';
    let diagnosisDesc = 'Add transactions and inflows to build a custom financial diagnosis.';

    if (income > 0) {
      savingsRate = Math.round((savedAmount / income) * 100);
      savingsLabel = `Saved ${currency(savedAmount)} out of ${currency(income)}`;
      
      if (savingsRate >= 40) {
        diagnosis = '🚀 Elite Saver Status!';
        diagnosisDesc = 'Outstanding savings strategy! You are building solid long-term wealth.';
      } else if (savingsRate >= 20) {
        diagnosis = '🌱 Secure Savings Health';
        diagnosisDesc = 'Perfect! You meet the gold-standard recommendation of saving at least 20%.';
      } else if (savingsRate >= 5) {
        diagnosis = '🛡️ Safe Margin';
        diagnosisDesc = 'You are saving a small buffer. Try trimming non-essential wants to reach 20%.';
      } else if (savingsRate >= 0) {
        diagnosis = '⚠️ Low Savings Buffer';
        diagnosisDesc = 'Almost all income is consumed instantly. High risk if unexpected expenses occur.';
      } else {
        diagnosis = '🚨 Debt/Capital Burn Alert!';
        diagnosisDesc = `You spent ${currency(Math.abs(savedAmount))} more than your inflow. Consider checking active budgets.`;
      }
    }

    const rateEl = document.getElementById('stat-savings-rate');
    const labelEl = document.getElementById('stat-savings-label');
    const diagnosisEl = document.getElementById('stat-health-status');
    const diagnosisDescEl = document.getElementById('stat-health-desc');

    if (rateEl) {
      rateEl.textContent = (income > 0 ? (savingsRate + '%') : 'N/A');
      rateEl.style.color = savingsRate < 0 ? 'var(--danger)' : (savingsRate >= 20 ? '#34d399' : '#fbbf24');
    }
    if (labelEl) labelEl.textContent = savingsLabel;
    if (diagnosisEl) diagnosisEl.textContent = diagnosis;
    if (diagnosisDescEl) diagnosisDescEl.textContent = diagnosisDesc;

    // 2. Daily Burn Rate
    let elapsedDays = 30; // default view range
    if (txs.length > 0) {
      const dates = txs.map(t => new Date(t.date).getTime());
      const minDate = Math.min(...dates);
      const maxDate = Math.max(...dates, new Date().getTime());
      const diffTime = Math.abs(maxDate - minDate);
      elapsedDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    }
    const dailyBurn = spent / elapsedDays;
    const burnEl = document.getElementById('stat-burn-rate');
    if (burnEl) burnEl.textContent = currency(dailyBurn);

    // 3. 50/30/20 Rule comparison calculations
    // Needs categories: meal, transportation, health, education
    // Wants categories: junk, tour
    let needsSpent = 0;
    let wantsSpent = 0;
    
    txs.forEach(t => {
      const cat = t.category;
      if (['meal', 'transportation', 'health', 'education'].includes(cat)) {
        needsSpent += parseFloat(t.amount || 0);
      } else {
        wantsSpent += parseFloat(t.amount || 0);
      }
    });

    const totalCalculated = income > 0 ? income : (spent > 0 ? spent : 1);
    const needsPct = Math.round((needsSpent / totalCalculated) * 100);
    const wantsPct = Math.round((wantsSpent / totalCalculated) * 100);
    const savedPct = income > 0 ? Math.max(0, savingsRate) : 0;

    const ruleContainer = document.getElementById('rule-comparison-container');
    if (ruleContainer) {
      ruleContainer.innerHTML = `
        <!-- Needs progress bar -->
        <div>
          <div style="display:flex; justify-content:space-between; font-size:.8rem; margin-bottom:4px;">
            <span style="color:var(--text2);">Needs (Standard: 50%)</span>
            <span style="font-weight:600; color:#60a5fa;">${needsPct}%</span>
          </div>
          <div style="height:8px; background:var(--bg3); border-radius:4px; overflow:hidden;">
            <div style="height:100%; width:${Math.min(100, needsPct)}%; background:#60a5fa; border-radius:4px; transition:width 0.5s ease;"></div>
          </div>
        </div>

        <!-- Wants progress bar -->
        <div>
          <div style="display:flex; justify-content:space-between; font-size:.8rem; margin-bottom:4px; margin-top:8px;">
            <span style="color:var(--text2);">Wants (Standard: 30%)</span>
            <span style="font-weight:600; color:#f43f5e;">${wantsPct}%</span>
          </div>
          <div style="height:8px; background:var(--bg3); border-radius:4px; overflow:hidden;">
            <div style="height:100%; width:${Math.min(100, wantsPct)}%; background:#f43f5e; border-radius:4px; transition:width 0.5s ease;"></div>
          </div>
        </div>

        <!-- Savings progress bar -->
        <div>
          <div style="display:flex; justify-content:space-between; font-size:.8rem; margin-bottom:4px; margin-top:8px;">
            <span style="color:var(--text2);">Savings (Standard: 20%)</span>
            <span style="font-weight:600; color:#34d399;">${savedPct}%</span>
          </div>
          <div style="height:8px; background:var(--bg3); border-radius:4px; overflow:hidden;">
            <div style="height:100%; width:${Math.min(100, savedPct)}%; background:#34d399; border-radius:4px; transition:width 0.5s ease;"></div>
          </div>
        </div>
      `;
    }

    // 4. Custom Practical Insights list
    const insightsList = document.getElementById('insights-list');
    if (insightsList) {
      let insights = [];

      // Check top spending category
      const catTotals = {};
      txs.forEach(t => {
        catTotals[t.category] = (catTotals[t.category] || 0) + parseFloat(t.amount || 0);
      });
      let topCat = '';
      let topCatVal = 0;
      Object.keys(catTotals).forEach(c => {
        if (catTotals[c] > topCatVal) {
          topCat = c;
          topCatVal = catTotals[c];
        }
      });

      if (topCat) {
        insights.push(`
          <div style="display:flex; gap:10px; align-items:flex-start; line-height:1.4;">
            <span style="color:#a78bfa; font-weight:bold;">📍</span>
            <span>Your highest spending category is <strong>${topCat.toUpperCase()}</strong> (${currency(topCatVal)}). Try planning ahead next time to limit impulse buys!</span>
          </div>
        `);
      }

      // Check high single transactions
      const highTx = txs.find(t => parseFloat(t.amount || 0) > (spent * 0.25));
      if (highTx && spent > 0) {
        insights.push(`
          <div style="display:flex; gap:10px; align-items:flex-start; line-height:1.4;">
            <span style="color:#fb7185; font-weight:bold;">⚠️</span>
            <span>A single purchase "<strong>${highTx.note || highTx.category}</strong>" consumed <strong>${Math.round((highTx.amount / spent)*100)}%</strong> of your total expenses. Large item impulse tracking!</span>
          </div>
        `);
      }

      // Friendly budgeting check
      if (savingsRate > 30) {
        insights.push(`
          <div style="display:flex; gap:10px; align-items:flex-start; line-height:1.4;">
            <span style="color:#34d399; font-weight:bold;">🌟</span>
            <span>You have superb cash flow headroom. Consider transferring excess funds into a high-yield account or investment ledger.</span>
          </div>
        `);
      } else if (savingsRate < 5 && income > 0) {
        insights.push(`
          <div style="display:flex; gap:10px; align-items:flex-start; line-height:1.4;">
            <span style="color:#fbbf24; font-weight:bold;">💡</span>
            <span>Your savings rate is currently thin. Try cutting back on "Wants" categories like junk food or tours to build a secure emergency fund.</span>
          </div>
        `);
      }

      if (insights.length === 0) {
        insights.push(`
          <div style="color:var(--text3); text-align:center; padding:12px 0;">
            No clear saving patterns detected yet. Log more transactions and inflows to unlock personalized behavior recommendations.
          </div>
        `);
      }

      insightsList.innerHTML = insights.join('');
    }
  }

  // Graph 1: Savings & Cumulative Balance Curve Over Time (Line Chart)
  function renderBalanceTrend() {
    const txs = getTransactions();
    const inflows = getInflows();

    const canvas = document.getElementById('balance-trend-chart');
    const empty = document.getElementById('balance-trend-empty');
    if (!canvas || !empty) return;

    // Combine all events with dates
    let events = [];
    inflows.forEach(i => {
      events.push({ date: i.date, amount: parseFloat(i.amount || 0), type: 'income' });
    });
    txs.forEach(t => {
      events.push({ date: t.date, amount: parseFloat(t.amount || 0), type: 'expense' });
    });

    if (events.length === 0) {
      canvas.style.display = 'none';
      empty.style.display = '';
      return;
    }
    canvas.style.display = '';
    empty.style.display = 'none';

    // Sort by date chronological
    events.sort((a, b) => a.date.localeCompare(b.date));

    // Consolidate dates to avoid duplicate points on the line graph
    const dates = [];
    const balances = [];
    let runningBalance = 0;
    
    events.forEach(ev => {
      const amt = ev.type === 'income' ? ev.amount : -ev.amount;
      runningBalance += amt;
      
      const lastIndex = dates.length - 1;
      if (lastIndex >= 0 && dates[lastIndex] === ev.date) {
        balances[lastIndex] = runningBalance;
      } else {
        dates.push(ev.date);
        balances.push(runningBalance);
      }
    });

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.05)';
    const tickColor = isDark ? '#94a3b8' : '#475569';
    const tooltipBg = isDark ? '#1e293b' : '#ffffff';
    const tooltipColor = isDark ? '#e2e8f0' : '#0f172a';
    const tooltipBorder = isDark ? 'rgba(148, 163, 184, 0.1)' : 'rgba(0, 0, 0, 0.08)';

    if (charts.balanceTrend) charts.balanceTrend.destroy();
    charts.balanceTrend = new Chart(canvas, {
      type: 'line',
      data: {
        labels: dates.map(d => formatDate(d)),
        datasets: [{
          label: 'Net Balance Curve',
          data: balances,
          borderColor: isDark ? '#34d399' : '#059669',
          backgroundColor: isDark ? 'rgba(52, 211, 153, 0.05)' : 'rgba(5, 150, 105, 0.05)',
          borderWidth: 2,
          fill: true,
          tension: 0.3,
          pointRadius: dates.length > 20 ? 0 : 3,
          pointHoverRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: tooltipBg,
            titleColor: tooltipColor,
            bodyColor: tooltipColor,
            borderColor: tooltipBorder,
            borderWidth: 1,
            padding: 10,
            callbacks: {
              label: ctx => ` Balance: ${currency(ctx.raw)}`
            }
          }
        },
        scales: {
          x: { grid: { color: 'rgba(255,255,255,0.01)' }, ticks: { color: tickColor, font: { size: 10 } } },
          y: { grid: { color: gridColor }, ticks: { color: tickColor, font: { size: 10 } } }
        }
      }
    });
  }

  // Graph 2: Inflow vs Outflow monthly comparisons (Bar Chart)
  function renderMonthlyCompare() {
    const txs = getTransactions();
    const inflows = getInflows();

    const canvas = document.getElementById('monthly-compare-chart');
    const empty = document.getElementById('monthly-compare-empty');
    if (!canvas || !empty) return;

    // Group items by month key (YYYY-MM)
    const monthlyData = {};

    inflows.forEach(i => {
      const month = i.date ? i.date.substring(0, 7) : 'Unknown';
      if (!monthlyData[month]) monthlyData[month] = { income: 0, spent: 0 };
      monthlyData[month].income += parseFloat(i.amount || 0);
    });

    txs.forEach(t => {
      const month = t.date ? t.date.substring(0, 7) : 'Unknown';
      if (!monthlyData[month]) monthlyData[month] = { income: 0, spent: 0 };
      monthlyData[month].spent += parseFloat(t.amount || 0);
    });

    const months = Object.keys(monthlyData).filter(m => m !== 'Unknown').sort();

    if (months.length === 0) {
      canvas.style.display = 'none';
      empty.style.display = '';
      return;
    }
    canvas.style.display = '';
    empty.style.display = 'none';

    const incomeValues = months.map(m => monthlyData[m].income);
    const spentValues = months.map(m => monthlyData[m].spent);

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

    if (charts.monthlyCompare) charts.monthlyCompare.destroy();
    charts.monthlyCompare = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: formattedMonths,
        datasets: [
          {
            label: 'Total Inflow (+)',
            data: incomeValues,
            backgroundColor: isDark ? '#60a5fa' : '#2563eb',
            borderRadius: 4
          },
          {
            label: 'Total Outflow (-)',
            data: spentValues,
            backgroundColor: isDark ? '#f43f5e' : '#be123c',
            borderRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: tickColor, font: { family: 'Inter', size: 11 } } },
          tooltip: {
            backgroundColor: tooltipBg,
            titleColor: tooltipColor,
            bodyColor: tooltipColor,
            borderColor: tooltipBorder,
            borderWidth: 1,
            callbacks: {
              label: ctx => ` ${ctx.dataset.label}: ${currency(ctx.raw)}`
            }
          }
        },
        scales: {
          x: { grid: { display: false }, ticks: { color: tickColor } },
          y: { grid: { color: gridColor }, ticks: { color: tickColor } }
        }
      }
    });
  }

  // Graph 3: Categories Breakdown (Donut Chart)
  function renderCategoryBreakdown() {
    const txs = getTransactions();
    const canvas = document.getElementById('category-donut-chart');
    const empty = document.getElementById('category-donut-empty');
    if (!canvas || !empty) return;

    const data = {};
    Object.keys(CATEGORIES).forEach(c => data[c] = 0);
    txs.forEach(t => { if (data[t.category] !== undefined) data[t.category] += parseFloat(t.amount || 0); });

    const hasData = Object.values(data).some(v => v > 0);
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

    if (charts.categoryDonut) charts.categoryDonut.destroy();
    charts.categoryDonut = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: labels.map(l => l.charAt(0).toUpperCase() + l.slice(1)),
        datasets: [{ data: values, backgroundColor: colors, borderWidth: 0, hoverOffset: 6 }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
          legend: {
            position: 'right',
            labels: { color: tickColor, font: { family: 'Inter', size: 12 }, usePointStyle: true }
          },
          tooltip: {
            backgroundColor: tooltipBg,
            titleColor: tooltipColor,
            bodyColor: tooltipColor,
            borderColor: tooltipBorder,
            borderWidth: 1,
            callbacks: { label: ctx => ' ' + ctx.label + ': ' + currency(ctx.raw) }
          }
        }
      }
    });
  }

  // Graph 4: Peak Spending Days (Bar Chart)
  function renderPeakSpendingDays() {
    const txs = getTransactions();
    const canvas = document.getElementById('day-bar-chart');
    const empty = document.getElementById('day-bar-empty');
    if (!canvas || !empty) return;

    const dayTotals = [0, 0, 0, 0, 0, 0, 0]; // Sun=0, Mon=1...
    txs.forEach(t => {
      const day = new Date(t.date).getDay();
      if (!isNaN(day)) {
        dayTotals[day] += parseFloat(t.amount || 0);
      }
    });

    const hasData = dayTotals.some(v => v > 0);
    if (!hasData) {
      canvas.style.display = 'none';
      empty.style.display = '';
      return;
    }
    canvas.style.display = '';
    empty.style.display = 'none';

    const dayLabels = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.05)';
    const tickColor = isDark ? '#94a3b8' : '#475569';
    const tooltipBg = isDark ? '#1e293b' : '#ffffff';
    const tooltipColor = isDark ? '#e2e8f0' : '#0f172a';
    const tooltipBorder = isDark ? 'rgba(148, 163, 184, 0.1)' : 'rgba(0, 0, 0, 0.08)';

    if (charts.dayBar) charts.dayBar.destroy();
    charts.dayBar = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: dayLabels,
        datasets: [{
          label: 'Total Expenses',
          data: dayTotals,
          backgroundColor: isDark ? 'rgba(244, 63, 94, 0.75)' : 'rgba(225, 29, 72, 0.8)',
          hoverBackgroundColor: isDark ? 'rgba(244, 63, 94, 0.95)' : 'rgba(225, 29, 72, 0.95)',
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: tooltipBg,
            titleColor: tooltipColor,
            bodyColor: tooltipColor,
            borderColor: tooltipBorder,
            borderWidth: 1,
            callbacks: { label: ctx => ` Spent: ${currency(ctx.raw)}` }
          }
        },
        scales: {
          x: { grid: { display: false }, ticks: { color: tickColor } },
          y: { grid: { color: gridColor }, ticks: { color: tickColor } }
        }
      }
    });
  }

  document.addEventListener('DOMContentLoaded', init);
  window.addEventListener('themechange', init);
})();
