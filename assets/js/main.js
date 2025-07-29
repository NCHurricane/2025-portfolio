// Main JavaScript for Chuck Copeland Portfolio
// Handles scroll indicator functionality on hero sections
// Enhanced with namespaced IIFE pattern to prevent global pollution

(function () {
    'use strict';

    // ============================================================================
    // LOCAL SCOPE - All variables and functions are now contained
    // ============================================================================

    // Local variables (no longer global)
    var scrollIndicator;
    var portfolioSection;
    var isInitialized = false;
    var throttledScrollHandler;

    // ============================================================================
    // LOCAL FUNCTIONS - Scroll handling functionality
    // ============================================================================

    // Throttle function to limit how often scroll events fire
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

    // Handle scroll indicator visibility
    function handleScroll() {
        if (!scrollIndicator) return;

        var scrollPosition = window.scrollY;

        if (scrollPosition > 100) {
            scrollIndicator.classList.add('fade-out');
        } else {
            scrollIndicator.classList.remove('fade-out');
        }
    }

    // Handle scroll indicator click
    function handleScrollIndicatorClick() {
        if (portfolioSection) {
            portfolioSection.scrollIntoView({
                behavior: 'smooth'
            });
        }
    }

    // Initialize scroll functionality
    function initScrollIndicator() {
        scrollIndicator = document.getElementById('scrollIndicator');
        portfolioSection = document.querySelector('.intro-gallery');

        // Only proceed if we have the required elements
        if (!scrollIndicator) {
            console.log('No scroll indicator found - main.js functionality not needed on this page');
            return false;
        }

        // Smooth scroll to portfolio section when clicked
        if (scrollIndicator && portfolioSection) {
            scrollIndicator.addEventListener('click', handleScrollIndicatorClick);
        }

        // Create throttled scroll handler - only fires every 100ms max
        throttledScrollHandler = throttle(handleScroll, 100);

        // Add the throttled scroll listener
        window.addEventListener('scroll', throttledScrollHandler);

        // Initial check for scroll position
        handleScroll();

        return true;
    }

    // Cleanup function to remove event listeners
    function cleanup() {
        if (scrollIndicator) {
            scrollIndicator.removeEventListener('click', handleScrollIndicatorClick);
        }
        if (throttledScrollHandler) {
            window.removeEventListener('scroll', throttledScrollHandler);
        }

        // Reset variables
        scrollIndicator = null;
        portfolioSection = null;
        throttledScrollHandler = null;
        isInitialized = false;

        console.log('Main.js scroll functionality cleaned up');
    }

    // ============================================================================
    // MAIN EXECUTION - Enhanced with better initialization
    // ============================================================================

    // Initialize when DOM is ready
    function init() {
        // Prevent double initialization
        if (isInitialized) {
            console.warn('Main.js already initialized');
            return;
        }

        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init);
            return;
        }

        // Initialize scroll indicator functionality
        var success = initScrollIndicator();

        if (success) {
            isInitialized = true;
            console.log('Main.js scroll indicator initialized');
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

    // Expose main functionality
    window.ChuckPortfolio.main = {
        // Allow manual re-initialization (useful for single-page app behavior)
        reinitialize: function () {
            if (isInitialized) {
                cleanup();
            }
            init();
        },

        // Check if main functionality is active
        isInitialized: function () {
            return isInitialized;
        },

        // Allow other scripts to manually trigger scroll to portfolio
        scrollToPortfolio: function () {
            if (portfolioSection) {
                portfolioSection.scrollIntoView({
                    behavior: 'smooth'
                });
                return true;
            }
            return false;
        },

        // Allow other scripts to manually hide/show scroll indicator
        hideScrollIndicator: function () {
            if (scrollIndicator) {
                scrollIndicator.classList.add('fade-out');
            }
        },

        showScrollIndicator: function () {
            if (scrollIndicator) {
                scrollIndicator.classList.remove('fade-out');
            }
        },

        // Clean up manually if needed
        cleanup: cleanup,

        version: '1.0.0'
    };

})(); // IIFE ends here - everything above is now in local scope