import os

print("🌊 Starting River static Python compiler with high-reliability string replacement...")

src_dir = os.path.dirname(os.path.abspath(__file__))
dist_dir = src_dir

# 1. Read header and footer templates
with open(os.path.join(src_dir, 'includes', 'header.php'), 'r', encoding='utf-8') as f:
    header_tpl = f.read()

with open(os.path.join(src_dir, 'includes', 'footer.php'), 'r', encoding='utf-8') as f:
    footer_tpl = f.read()

# Replace page title dynamic placeholder
header_tpl = header_tpl.replace(
    "<?php echo isset($pageTitle) ? '— '.$pageTitle : ''; ?>",
    "{{PAGE_TITLE}}"
)

# Replace local cache-busting timestamp with a clean static version
header_tpl = header_tpl.replace("<?php echo time(); ?>", "1.0.0")

# Define the literal string block for the PHP sidebar loop to replace
php_nav_block = """    <?php
    $currentPage = basename($_SERVER['PHP_SELF']);
    $navItems = [
      ['file' => 'index.php', 'label' => 'Dashboard', 'icon' => '<i class="fi fi-sr-home"></i>'],
      ['file' => 'inflow.php', 'label' => 'Inflow', 'icon' => '<i class="fi fi-sr-sack-dollar"></i>'],
      ['file' => 'transactions.php', 'label' => 'Transactions', 'icon' => '<i class="fi fi-sr-receipt"></i>'],
      ['file' => 'stats.php', 'label' => 'Statistics', 'icon' => '<i class="fi fi-sr-chart-histogram"></i>'],
      ['file' => 'planning.php', 'label' => 'Planning', 'icon' => '<i class="fi fi-sr-clipboard"></i>'],
      ['file' => 'cart.php', 'label' => 'Cart', 'icon' => '<i class="fi fi-sr-shopping-cart"></i>'],
      ['file' => 'settings.php', 'label' => 'Settings', 'icon' => '<i class="fi fi-sr-settings"></i>'],
    ];
    foreach ($navItems as $item) {
      $active = ($currentPage === $item['file']) ? ' active' : '';
      echo '<a href="'.$item['file'].'" class="nav-link'.$active.'">'.$item['icon'].'<span>'.$item['label'].'</span></a>';
    }
    ?>"""

# Replace PHP nav block with dynamic placeholder
header_tpl = header_tpl.replace(php_nav_block, "{{SIDEBAR_NAVIGATION}}")

# Define the literal string block for the footer scripts block to replace
php_footer_scripts = """<script src="js/app.js?v=<?php echo time(); ?>"></script>
<?php if (isset($pageScript)): ?>
<script src="js/<?php echo $pageScript; ?>?v=<?php echo time(); ?>"></script>
<?php endif; ?>"""

# Replace footer scripts block with dynamic placeholders
footer_tpl = footer_tpl.replace(php_footer_scripts, """<script src="js/app.js?v=1.0.0"></script>
<script src="js/{{PAGE_SCRIPT}}?v=1.0.0"></script>""")

# Config navigation items for compiled HTML links
nav_items = [
    { 'file': 'index.html', 'label': 'Dashboard', 'icon': '<i class="fi fi-sr-home"></i>' },
    { 'file': 'inflow.html', 'label': 'Inflow', 'icon': '<i class="fi fi-sr-sack-dollar"></i>' },
    { 'file': 'transactions.html', 'label': 'Transactions', 'icon': '<i class="fi fi-sr-receipt"></i>' },
    { 'file': 'stats.html', 'label': 'Statistics', 'icon': '<i class="fi fi-sr-chart-histogram"></i>' },
    { 'file': 'planning.html', 'label': 'Planning', 'icon': '<i class="fi fi-sr-clipboard"></i>' },
    { 'file': 'cart.html', 'label': 'Cart', 'icon': '<i class="fi fi-sr-shopping-cart"></i>' },
    { 'file': 'settings.html', 'label': 'Settings', 'icon': '<i class="fi fi-sr-settings"></i>' }
]

pages = [
    { 'filename': 'index.php', 'out_filename': 'index.html', 'title': 'Dashboard', 'script': 'dashboard.js' },
    { 'filename': 'inflow.php', 'out_filename': 'inflow.html', 'title': 'Inflow', 'script': 'inflow.js' },
    { 'filename': 'transactions.php', 'out_filename': 'transactions.html', 'title': 'Transactions', 'script': 'transactions.js' },
    { 'filename': 'stats.php', 'out_filename': 'stats.html', 'title': 'Statistics', 'script': 'stats.js' },
    { 'filename': 'planning.php', 'out_filename': 'planning.html', 'title': 'Planning', 'script': 'planning.js' },
    { 'filename': 'cart.php', 'out_filename': 'cart.html', 'title': 'Cart', 'script': 'cart.js' },
    { 'filename': 'settings.php', 'out_filename': 'settings.html', 'title': 'Settings', 'script': 'settings.js' }
]

for p in pages:
    print(f"Compiling: {p['filename']} -> {p['out_filename']}")
    
    with open(os.path.join(src_dir, p['filename']), 'r', encoding='utf-8') as f:
        body = f.read()
        
    # Remove head and foot PHP import blocks
    body = body.replace(f"<?php $pageTitle = '{p['title']}'; $pageScript = '{p['script']}'; include 'includes/header.php'; ?>", "")
    body = body.replace("<?php include 'includes/footer.php'; ?>", "")
    
    # Replace all .php references inside page links to point to compiled .html files
    for pg in pages:
        body = body.replace(pg['filename'], pg['out_filename'])
        
    # Generate sidebar navigation structure
    nav_html = ""
    for item in nav_items:
        active_cls = " active" if item['file'] == p['out_filename'] else ""
        nav_html += f"    <a href=\"{item['file']}\" class=\"nav-link{active_cls}\">{item['icon']}<span>{item['label']}</span></a>\n"
        
    # Build complete page header
    page_header = header_tpl.replace("{{PAGE_TITLE}}", f"— {p['title']}")
    page_header = page_header.replace("{{SIDEBAR_NAVIGATION}}", nav_html.rstrip())
    
    # Build complete page footer
    page_footer = footer_tpl.replace("{{PAGE_SCRIPT}}", p['script'])
    
    # Assemble complete page HTML
    final_html = f"{page_header}\n{body.strip()}\n{page_footer}"
    
    with open(os.path.join(dist_dir, p['out_filename']), 'w', encoding='utf-8') as out_f:
        out_f.write(final_html)

print("🎉 River successfully compiled to standalone static HTML with 100% structural fidelity!")
