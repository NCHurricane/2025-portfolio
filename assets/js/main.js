document.addEventListener('DOMContentLoaded', function () {
    const scrollIndicator = document.getElementById('scrollIndicator');
    const portfolioSection = document.querySelector('.intro-gallery');

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

    // Smooth scroll to portfolio section when clicked
    if (scrollIndicator && portfolioSection) {
        scrollIndicator.addEventListener('click', function () {
            portfolioSection.scrollIntoView({
                behavior: 'smooth'
            });
        });
    }

    // Throttled scroll handler - only fires every 100ms max
    var throttledScrollHandler = throttle(function () {
        if (!scrollIndicator) return;

        var scrollPosition = window.scrollY;

        if (scrollPosition > 100) {
            scrollIndicator.classList.add('fade-out');
        } else {
            scrollIndicator.classList.remove('fade-out');
        }
    }, 100);

    // Add the throttled scroll listener
    window.addEventListener('scroll', throttledScrollHandler);
});