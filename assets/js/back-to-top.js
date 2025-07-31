// Back to top button functionality
(function () {
    'use strict';

    var backToTopBtn;
    var isInitialized = false;
    var throttledScrollHandler;

    function toggleBackToTop() {
        if (!backToTopBtn) return;

        if (window.scrollY > 300) {
            backToTopBtn.classList.add('show');
        } else {
            backToTopBtn.classList.remove('show');
        }
    }

    function scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    function handleKeyDown(e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            scrollToTop();
        }
    }

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

    function initBackToTop() {
        backToTopBtn = document.getElementById('backToTop');

        if (!backToTopBtn) {
            console.log('No back-to-top button found - functionality not needed on this page');
            return false;
        }

        throttledScrollHandler = throttle(toggleBackToTop, 100);

        window.addEventListener('scroll', throttledScrollHandler);
        backToTopBtn.addEventListener('click', scrollToTop);
        backToTopBtn.addEventListener('keydown', handleKeyDown);

        toggleBackToTop();

        return true;
    }

    function cleanup() {
        if (backToTopBtn) {
            backToTopBtn.removeEventListener('click', scrollToTop);
            backToTopBtn.removeEventListener('keydown', handleKeyDown);
        }

        if (throttledScrollHandler) {
            window.removeEventListener('scroll', throttledScrollHandler);
        }

        // Add lightbox cleanup
        if (window.ChuckPortfolio && window.ChuckPortfolio.lightbox) {
            window.ChuckPortfolio.lightbox.cleanup();
        }

        backToTopBtn = null;
        throttledScrollHandler = null;
        isInitialized = false;

        console.log('Back-to-top functionality cleaned up');
    }


    function init() {
        if (isInitialized) {
            console.warn('Back-to-top already initialized');
            return;
        }

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init);
            return;
        }

        var success = initBackToTop();

        if (success) {
            isInitialized = true;
            console.log('Back-to-top button initialized');
        }
    }

    init();

    window.addEventListener('beforeunload', cleanup);
    window.addEventListener('pagehide', cleanup);

    // Public API
    window.ChuckPortfolio = window.ChuckPortfolio || {};
    window.ChuckPortfolio.backToTop = {
        reinitialize: function () {
            if (isInitialized) {
                cleanup();
            }
            init();
        },
        isInitialized: function () {
            return isInitialized;
        },
        scrollToTop: function () {
            scrollToTop();
            return true;
        },
        show: function () {
            if (backToTopBtn) {
                backToTopBtn.classList.add('show');
            }
        },
        hide: function () {
            if (backToTopBtn) {
                backToTopBtn.classList.remove('show');
            }
        },
        isVisible: function () {
            return backToTopBtn && backToTopBtn.classList.contains('show');
        },
        updateThreshold: function (newThreshold) {
            if (typeof newThreshold === 'number' && newThreshold >= 0) {
                toggleBackToTop = function () {
                    if (!backToTopBtn) return;

                    if (window.scrollY > newThreshold) {
                        backToTopBtn.classList.add('show');
                    } else {
                        backToTopBtn.classList.remove('show');
                    }
                };

                toggleBackToTop();
                return true;
            }
            return false;
        },
        cleanup: cleanup,
        version: '1.0.0'
    };

})();