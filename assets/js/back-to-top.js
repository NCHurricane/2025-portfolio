// Back to Top Button Functionality
// Enhanced with namespaced IIFE pattern to prevent global pollution

(function () {
    'use strict';

    // ============================================================================
    // LOCAL SCOPE - All variables and functions are now contained
    // ============================================================================

    // Local variables (no longer global)
    var backToTopBtn;
    var isInitialized = false;
    var throttledScrollHandler;

    // ============================================================================
    // LOCAL FUNCTIONS - Back to top functionality
    // ============================================================================

    // Show/hide button based on scroll position
    function toggleBackToTop() {
        if (!backToTopBtn) return;

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

    // Handle keyboard interactions
    function handleKeyDown(e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            scrollToTop();
        }
    }

    // Throttle scroll events for better performance
    function throttle(func, limit) {
        var inThrottle;
        return function () {
            var args = arguments;
            var context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(function () { inThrottle = false; }, limit);
            }
        };
    }

    // Initialize back to top functionality
    function initBackToTop() {
        backToTopBtn = document.getElementById('backToTop');

        // Only proceed if we have the button
        if (!backToTopBtn) {
            console.log('No back-to-top button found - functionality not needed on this page');
            return false;
        }

        // Create throttled scroll handler
        throttledScrollHandler = throttle(toggleBackToTop, 100);

        // Event listeners
        window.addEventListener('scroll', throttledScrollHandler);
        backToTopBtn.addEventListener('click', scrollToTop);
        backToTopBtn.addEventListener('keydown', handleKeyDown);

        // Initial check for scroll position
        toggleBackToTop();

        return true;
    }

    // Cleanup function to remove event listeners
    function cleanup() {
        if (backToTopBtn) {
            backToTopBtn.removeEventListener('click', scrollToTop);
            backToTopBtn.removeEventListener('keydown', handleKeyDown);
        }

        if (throttledScrollHandler) {
            window.removeEventListener('scroll', throttledScrollHandler);
        }

        // Reset variables
        backToTopBtn = null;
        throttledScrollHandler = null;
        isInitialized = false;

        console.log('Back-to-top functionality cleaned up');
    }

    // ============================================================================
    // MAIN EXECUTION - Enhanced with better initialization
    // ============================================================================

    // Initialize when DOM is ready
    function init() {
        // Prevent double initialization
        if (isInitialized) {
            console.warn('Back-to-top already initialized');
            return;
        }

        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init);
            return;
        }

        // Initialize back to top functionality
        var success = initBackToTop();

        if (success) {
            isInitialized = true;
            console.log('Back-to-top button initialized');
        }
    }

    // Start initialization
    init();

    // ============================================================================
    // CLEANUP ON PAGE UNLOAD
    // ============================================================================

    // Clean up when page unloads (good practice)
    window.addEventListener('beforeunload', cleanup);
    window.addEventListener('pagehide', cleanup);

    // ============================================================================
    // PUBLIC API - Expose essential functionality for other scripts
    // ============================================================================

    // Create namespace if it doesn't exist
    window.ChuckPortfolio = window.ChuckPortfolio || {};

    // Expose back-to-top functionality
    window.ChuckPortfolio.backToTop = {
        // Allow manual re-initialization (useful for dynamic content)
        reinitialize: function () {
            if (isInitialized) {
                cleanup();
            }
            init();
        },

        // Check if back-to-top is active
        isInitialized: function () {
            return isInitialized;
        },

        // Allow other scripts to manually trigger scroll to top
        scrollToTop: function () {
            scrollToTop();
            return true;
        },

        // Allow other scripts to manually show button
        show: function () {
            if (backToTopBtn) {
                backToTopBtn.classList.add('show');
            }
        },

        // Allow other scripts to manually hide button
        hide: function () {
            if (backToTopBtn) {
                backToTopBtn.classList.remove('show');
            }
        },

        // Check current scroll position threshold
        isVisible: function () {
            return backToTopBtn && backToTopBtn.classList.contains('show');
        },

        // Allow other scripts to change the scroll threshold
        updateThreshold: function (newThreshold) {
            if (typeof newThreshold === 'number' && newThreshold >= 0) {
                // Override the toggle function with new threshold
                toggleBackToTop = function () {
                    if (!backToTopBtn) return;

                    if (window.scrollY > newThreshold) {
                        backToTopBtn.classList.add('show');
                    } else {
                        backToTopBtn.classList.remove('show');
                    }
                };

                // Apply immediately
                toggleBackToTop();
                return true;
            }
            return false;
        },

        // Clean up manually if needed
        cleanup: cleanup,

        version: '1.0.0'
    };

})(); // IIFE ends here - everything above is now in local scope