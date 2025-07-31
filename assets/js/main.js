// Main scroll indicator functionality
(function () {
    'use strict';

    var scrollIndicator;
    var portfolioSection;
    var isInitialized = false;
    var throttledScrollHandler;

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

    function handleScroll() {
        if (!scrollIndicator) return;

        var scrollPosition = window.scrollY;

        if (scrollPosition > 100) {
            scrollIndicator.classList.add('fade-out');
        } else {
            scrollIndicator.classList.remove('fade-out');
        }
    }

    function handleScrollIndicatorClick() {
        if (portfolioSection) {
            portfolioSection.scrollIntoView({
                behavior: 'smooth'
            });
        }
    }

    function initScrollIndicator() {
        scrollIndicator = document.getElementById('scrollIndicator');
        portfolioSection = document.querySelector('.intro-gallery');

        if (!scrollIndicator) {
            console.log('No scroll indicator found - main.js functionality not needed on this page');
            return false;
        }

        if (scrollIndicator && portfolioSection) {
            scrollIndicator.addEventListener('click', handleScrollIndicatorClick);
        }

        throttledScrollHandler = throttle(handleScroll, 100);
        window.addEventListener('scroll', throttledScrollHandler);
        handleScroll();

        return true;
    }

    function cleanup() {
        if (scrollIndicator) {
            scrollIndicator.removeEventListener('click', handleScrollIndicatorClick);
        }
        if (throttledScrollHandler) {
            window.removeEventListener('scroll', throttledScrollHandler);
        }

        // Add lightbox cleanup
        if (window.ChuckPortfolio && window.ChuckPortfolio.lightbox) {
            window.ChuckPortfolio.lightbox.cleanup();
        }

        scrollIndicator = null;
        portfolioSection = null;
        throttledScrollHandler = null;
        isInitialized = false;

        console.log('Main.js scroll functionality cleaned up');
    }

    function init() {
        if (isInitialized) {
            console.warn('Main.js already initialized');
            return;
        }

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init);
            return;
        }

        var success = initScrollIndicator();

        if (success) {
            isInitialized = true;
            console.log('Main.js scroll indicator initialized');
        }
    }

    init();

    window.addEventListener('beforeunload', cleanup);
    window.addEventListener('pagehide', cleanup);

    // Public API
    window.ChuckPortfolio = window.ChuckPortfolio || {};
    window.ChuckPortfolio.main = {
        reinitialize: function () {
            if (isInitialized) {
                cleanup();
            }
            init();
        },
        isInitialized: function () {
            return isInitialized;
        },
        scrollToPortfolio: function () {
            if (portfolioSection) {
                portfolioSection.scrollIntoView({
                    behavior: 'smooth'
                });
                return true;
            }
            return false;
        },
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
        cleanup: cleanup,
        version: '1.0.0'
    };

})();