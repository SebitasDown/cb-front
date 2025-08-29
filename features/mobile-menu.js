// Mobile Menu Functionality
export function initMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    const hamburger = document.querySelector('.hamburger');

    if (!mobileMenuBtn || !sidebar || !sidebarOverlay || !hamburger) {
        console.warn('Mobile menu elements not found');
        return;
    }

    // Toggle menu
    function toggleMenu() {
        const isOpen = sidebar.classList.contains('mobile-open');
        
        if (isOpen) {
            closeMenu();
        } else {
            openMenu();
        }
    }

    // Open menu
    function openMenu() {
        sidebar.classList.add('mobile-open');
        sidebarOverlay.classList.add('active');
        hamburger.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent background scroll
    }

    // Close menu
    function closeMenu() {
        sidebar.classList.remove('mobile-open');
        sidebarOverlay.classList.remove('active');
        hamburger.classList.remove('active');
        document.body.style.overflow = ''; // Restore scroll
    }

    // Event listeners
    mobileMenuBtn.addEventListener('click', toggleMenu);
    sidebarOverlay.addEventListener('click', closeMenu);

    // Close menu when clicking on navigation items
    const navItems = sidebar.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            // Small delay to allow navigation to complete
            setTimeout(closeMenu, 100);
        });
    });

    // Close menu when pressing Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeMenu();
        }
    });

    // Close menu on window resize (if switching to desktop)
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            closeMenu();
        }
    });

    console.log('📱 Mobile menu initialized');
}



