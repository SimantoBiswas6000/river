# 🌊 River — Personal Finance Tracker

A premium, highly interactive, and completely local personal finance ledger and statistics dashboard.

This application is built entirely on the client-side (`localStorage`) and runs **100% serverless**. You can run it locally in a PHP environment, open the compiled HTML files directly, or deploy it instantly to static hosting services like **GitHub Pages**.

---

## 🚀 How to Deploy on GitHub Pages

Because the app is client-side, you don't need a PHP server for hosting! Follow these 3 easy steps to deploy it to GitHub:

1. **Commit and Push to GitHub:**
   Make sure all files in this repository (including `index.html`, `stats.html`, `js/`, `css/`, etc.) are pushed to your GitHub repository.

2. **Enable GitHub Pages:**
   * Go to your repository settings on GitHub.
   * Click on the **Pages** tab in the sidebar under "Code and automation".
   * Under **Build and deployment**, set the source to **Deploy from a branch**.
   * Choose your branch (e.g. `main`) and set the folder to `/ (root)`.
   * Click **Save**.

3. **Enjoy your live site:**
   GitHub will deploy your site in less than a minute! You will get a custom URL like `https://username.github.io/repository-name/` where you can access your tracker securely from any device.

---

## 🛠️ How to make edits and update the site

1. If you ever make structural changes to the page templates, make them directly inside the modular `.php` files (e.g. `index.php`, `includes/header.php`, `includes/footer.php`).
2. Run the automated static compiler to update all HTML files instantly:
   ```bash
   python3 build.py
   ```
3. Push the newly updated `.html` files to GitHub to redeploy automatically!

---

## ✨ Features

* **Default Light Mode & Onyx Dark Mode:** Switch themes seamlessly with the button at the bottom of the sidebar. Defaults to light mode with a beautiful slate aesthetic, and switches to a solid, non-bluish carbon black dark theme.
* **River Blue Accents:** striking, modern River Blue accent colors applied only on buttons and key action items, keeping the rest of the application beautifully clean and monochrome.
* **Normal-Person Financial Intelligence:** Actionable health ratings, customized advice, cash flow headroom gauges, and visual tracking against the gold standard **50/30/20 spending rule**.
* **Visual Graph Stack:** Breathtaking savings curves, monthly inflow vs outflow comparison bars, category breakdowns, and weekday spending patterns in gorgeous multi-colored graphs.
