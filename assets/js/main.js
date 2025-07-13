document.addEventListener('DOMContentLoaded', function () {
    const scrollIndicator = document.getElementById('scrollIndicator');
    const portfolioSection = document.querySelector('.intro-gallery');

    // Smooth scroll to portfolio section when clicked
    scrollIndicator.addEventListener('click', function () {
        if (portfolioSection) {
            portfolioSection.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });

    // Fade out on scroll
    window.addEventListener('scroll', function () {
        const scrollPosition = window.scrollY;

        if (scrollPosition > 100) {
            scrollIndicator.classList.add('fade-out');
        } else {
            scrollIndicator.classList.remove('fade-out');
        }
    });
});