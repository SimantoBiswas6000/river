</main><!-- /.main -->

<script src="js/app.js?v=<?php echo time(); ?>"></script>
<?php if (isset($pageScript)): ?>
<script src="js/<?php echo $pageScript; ?>?v=<?php echo time(); ?>"></script>
<?php endif; ?>
</body>
</html>
