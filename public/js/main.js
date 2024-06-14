document.addEventListener('DOMContentLoaded', function() {
    var menuToggle = document.getElementById('menu-toggle');
    var menuItems = document.getElementById('menu-items');

    menuToggle.addEventListener('click', function() {
        menuItems.classList.toggle('open');
    });
});