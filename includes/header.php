<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="River — Personal finance tracker. Track expenses, plan budgets, and manage your money locally.">
  <title>River <?php echo isset($pageTitle) ? '— '.$pageTitle : ''; ?></title>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@flaticon/flaticon-uicons@3.3.1/css/all/all.min.css">
  <link rel="stylesheet" href="css/styles.css?v=<?php echo time(); ?>">
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4"></script>
  <!-- Flatpickr Core & MonthSelect plugin -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/flatpickr/dist/plugins/monthSelect/style.css">
  <script src="https://cdn.jsdelivr.net/npm/flatpickr"></script>
  <script src="https://cdn.jsdelivr.net/npm/flatpickr/dist/plugins/monthSelect/index.js"></script>

</head>
<body>

<!-- Mobile toggle -->
<button class="mobile-toggle" aria-label="Toggle menu"><i class="fi fi-sr-menu-burger"></i></button>

<!-- Sidebar -->
<aside class="sidebar">
  <div class="sidebar-logo">
    <span class="logo-emoji">🌊</span>
    <span class="logo-text">River</span>
  </div>
  <nav class="sidebar-nav">
    <?php
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
    ?>
  </nav>
</aside>

<!-- Main Content -->
<main class="main">
