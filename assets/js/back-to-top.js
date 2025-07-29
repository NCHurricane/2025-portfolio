// Back to Top Button Functionality
document.addEventListener('DOMContentLoaded', function () {
    var backToTopBtn = document.getElementById('backToTop');

    if (!backToTopBtn) return; // Exit if button doesn't exist

    // Show/hide button based on scroll position
    function toggleBackToTop() {
        if (window.scrollY > 300) {
            backToTopBtn.classList.add('show');
        } else {
            backToTopBtn.classList.remove('show');
        }
    }

    // Smooth scroll to top
    function scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    // Throttle scroll events for better performance
    var scrollTimeout;
    function throttledScroll() {
        if (scrollTimeout) {
            return;
        }
        scrollTimeout = setTimeout(function () {
            toggleBackToTop();
            scrollTimeout = null;
        }, 100);
    }

    // Event listeners
    window.addEventListener('scroll', throttledScroll);
    backToTopBtn.addEventListener('click', scrollToTop);

    // Keyboard support
    backToTopBtn.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            scrollToTop();
        }
    });

    // Initial check
    toggleBackToTop();
});