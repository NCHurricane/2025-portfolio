// Enhanced Keyboard Navigation for Chuck Copeland Portfolio
// Provides essential accessibility features for keyboard users

(function () {
    'use strict';

    // Focus Management for Lightbox/Modal
    var focusableElementsSelector = 'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex="0"], [contenteditable]';
    var previouslyFocusedElement;

    // Skip Navigation Enhancement
    function initSkipNavigation() {
        // Ensure main content has proper ID for skip navigation
        var mainContent = document.getElementById('main-content');
        if (mainContent) {
            // Make main content focusable for skip navigation
            mainContent.setAttribute('tabindex', '-1');

            // Handle skip link clicks
            var skipLink = document.querySelector('.skip-link');
            if (skipLink) {
                skipLink.addEventListener('click', function (e) {
                    e.preventDefault();
                    mainContent.focus();
                    // Scroll to top of main content
                    mainContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
                });
            }
        }
    }

    // Enhanced Video Keyboard Controls
    function initVideoKeyboardControls() {
        var videos = document.querySelectorAll('video');

        videos.forEach(function (video) {
            // Make video focusable
            video.setAttribute('tabindex', '0');

            // Add keyboard event listeners
            video.addEventListener('keydown', function (e) {
                switch (e.code) {
                    case 'Space':
                        e.preventDefault();
                        if (video.paused) {
                            video.play();
                        } else {
                            video.pause();
                        }
                        break;
                    case 'ArrowLeft':
                        e.preventDefault();
                        video.currentTime = Math.max(0, video.currentTime - 10);
                        break;
                    case 'ArrowRight':
                        e.preventDefault();
                        video.currentTime = Math.min(video.duration, video.currentTime + 10);
                        break;
                    case 'KeyM':
                        e.preventDefault();
                        video.muted = !video.muted;
                        break;
                    case 'KeyF':
                        e.preventDefault();
                        if (video.requestFullscreen) {
                            video.requestFullscreen();
                        }
                        break;
                }
            });

            // Add visual feedback for keyboard users
            video.addEventListener('focus', function () {
                var wrapper = video.closest('.video-wrapper');
                if (wrapper) {
                    wrapper.classList.add('keyboard-focused');
                }
            });

            video.addEventListener('blur', function () {
                var wrapper = video.closest('.video-wrapper');
                if (wrapper) {
                    wrapper.classList.remove('keyboard-focused');
                }
            });
        });
    }

    // Enhanced Custom Video Controls Keyboard Support
    function initCustomVideoControlsKeyboard() {
        var customControls = document.querySelectorAll('.custom-video-controls');

        customControls.forEach(function (controls) {
            var video = controls.closest('.video-wrapper').querySelector('video');
            var progressBar = controls.querySelector('.progress-bar');
            var volumeSlider = controls.querySelector('.volume-slider');

            // Make progress bar keyboard accessible
            if (progressBar && video) {
                progressBar.setAttribute('tabindex', '0');
                progressBar.setAttribute('role', 'slider');
                progressBar.setAttribute('aria-label', 'Video progress');
                progressBar.setAttribute('aria-valuemin', '0');
                progressBar.setAttribute('aria-valuemax', '100');

                progressBar.addEventListener('keydown', function (e) {
                    var currentPercent = (video.currentTime / video.duration) * 100;

                    switch (e.code) {
                        case 'ArrowLeft':
                            e.preventDefault();
                            video.currentTime = Math.max(0, video.currentTime - 5);
                            break;
                        case 'ArrowRight':
                            e.preventDefault();
                            video.currentTime = Math.min(video.duration, video.currentTime + 5);
                            break;
                        case 'Home':
                            e.preventDefault();
                            video.currentTime = 0;
                            break;
                        case 'End':
                            e.preventDefault();
                            video.currentTime = video.duration;
                            break;
                    }
                });

                // Update aria-valuenow during playback
                video.addEventListener('timeupdate', function () {
                    var percent = Math.round((video.currentTime / video.duration) * 100);
                    progressBar.setAttribute('aria-valuenow', percent);
                });
            }

            // Enhanced volume slider keyboard support
            if (volumeSlider && video) {
                volumeSlider.addEventListener('keydown', function (e) {
                    switch (e.code) {
                        case 'ArrowUp':
                        case 'ArrowRight':
                            e.preventDefault();
                            video.volume = Math.min(1, video.volume + 0.1);
                            volumeSlider.value = video.volume;
                            break;
                        case 'ArrowDown':
                        case 'ArrowLeft':
                            e.preventDefault();
                            video.volume = Math.max(0, video.volume - 0.1);
                            volumeSlider.value = video.volume;
                            break;
                        case 'Home':
                            e.preventDefault();
                            video.volume = 0;
                            volumeSlider.value = 0;
                            break;
                        case 'End':
                            e.preventDefault();
                            video.volume = 1;
                            volumeSlider.value = 1;
                            break;
                    }
                });
            }
        });
    }

    // Lightbox Focus Management
    function initLightboxFocusManagement() {
        // Override lightbox behavior if available
        if (typeof lightbox !== 'undefined') {
            // Store original methods
            var originalStart = lightbox.start;
            var originalEnd = lightbox.end;

            // Enhanced start method with focus management
            lightbox.start = function ($link) {
                // Store currently focused element
                previouslyFocusedElement = document.activeElement;

                // Call original start method
                originalStart.call(this, $link);

                // Set up focus trap after lightbox opens
                setTimeout(function () {
                    var lightboxElement = document.getElementById('lightbox');
                    if (lightboxElement) {
                        trapFocus(lightboxElement);
                        lightboxElement.focus();
                    }
                }, 100);
            };

            // Enhanced end method with focus restoration
            lightbox.end = function () {
                // Call original end method
                originalEnd.call(this);

                // Restore focus to previously focused element
                if (previouslyFocusedElement) {
                    previouslyFocusedElement.focus();
                    previouslyFocusedElement = null;
                }
            };
        }
    }

    // Focus Trap Utility
    function trapFocus(element) {
        var focusableElements = element.querySelectorAll(focusableElementsSelector);
        var firstFocusableElement = focusableElements[0];
        var lastFocusableElement = focusableElements[focusableElements.length - 1];

        element.addEventListener('keydown', function (e) {
            if (e.key === 'Tab') {
                if (e.shiftKey) {
                    if (document.activeElement === firstFocusableElement) {
                        lastFocusableElement.focus();
                        e.preventDefault();
                    }
                } else {
                    if (document.activeElement === lastFocusableElement) {
                        firstFocusableElement.focus();
                        e.preventDefault();
                    }
                }
            }

            if (e.key === 'Escape') {
                // Close lightbox on escape
                if (typeof lightbox !== 'undefined') {
                    lightbox.end();
                }
            }
        });
    }

    // Enhanced Play Button Overlay Keyboard Support
    function initPlayButtonKeyboard() {
        var playOverlays = document.querySelectorAll('.video-play-overlay');

        playOverlays.forEach(function (overlay) {
            overlay.setAttribute('tabindex', '0');
            overlay.setAttribute('role', 'button');
            overlay.setAttribute('aria-label', 'Play video');

            overlay.addEventListener('keydown', function (e) {
                if (e.code === 'Space' || e.code === 'Enter') {
                    e.preventDefault();
                    overlay.click();
                }
            });
        });
    }

    // Gallery Grid Keyboard Navigation Enhancement
    function initGalleryKeyboardNavigation() {
        var galleryItems = document.querySelectorAll('.gallery-item a, .video-card a, .intro-card a');

        galleryItems.forEach(function (item, index) {
            item.addEventListener('keydown', function (e) {
                var currentIndex = index;
                var nextItem, prevItem;

                switch (e.code) {
                    case 'ArrowRight':
                        e.preventDefault();
                        nextItem = galleryItems[currentIndex + 1];
                        if (nextItem) {
                            nextItem.focus();
                        }
                        break;
                    case 'ArrowLeft':
                        e.preventDefault();
                        prevItem = galleryItems[currentIndex - 1];
                        if (prevItem) {
                            prevItem.focus();
                        }
                        break;
                    case 'Home':
                        e.preventDefault();
                        galleryItems[0].focus();
                        break;
                    case 'End':
                        e.preventDefault();
                        galleryItems[galleryItems.length - 1].focus();
                        break;
                }
            });
        });
    }

    // Social Icons Keyboard Enhancement
    function initSocialIconsKeyboard() {
        var socialSections = document.querySelectorAll('.social-main, .social-cats, .social-wx, .social-motor');

        socialSections.forEach(function (section) {
            var socialLinks = section.querySelectorAll('.social-icon');

            socialLinks.forEach(function (link, index) {
                link.addEventListener('keydown', function (e) {
                    var currentIndex = index;
                    var nextLink, prevLink;

                    switch (e.code) {
                        case 'ArrowRight':
                        case 'ArrowDown':
                            e.preventDefault();
                            nextLink = socialLinks[currentIndex + 1];
                            if (nextLink) {
                                nextLink.focus();
                            } else if (socialLinks[0]) {
                                socialLinks[0].focus(); // Wrap to first
                            }
                            break;
                        case 'ArrowLeft':
                        case 'ArrowUp':
                            e.preventDefault();
                            prevLink = socialLinks[currentIndex - 1];
                            if (prevLink) {
                                prevLink.focus();
                            } else if (socialLinks[socialLinks.length - 1]) {
                                socialLinks[socialLinks.length - 1].focus(); // Wrap to last
                            }
                            break;
                        case 'Home':
                            e.preventDefault();
                            socialLinks[0].focus();
                            break;
                        case 'End':
                            e.preventDefault();
                            socialLinks[socialLinks.length - 1].focus();
                            break;
                    }
                });
            });
        });
    }

    // Global Escape Key Handler
    function initGlobalKeyboardHandlers() {
        document.addEventListener('keydown', function (e) {
            // Global escape key handler
            if (e.key === 'Escape') {
                // Close any open modals, overlays, etc.
                var openLightbox = document.getElementById('lightbox');
                if (openLightbox && openLightbox.style.display !== 'none') {
                    if (typeof lightbox !== 'undefined') {
                        lightbox.end();
                    }
                }
            }
        });
    }

    // Add Keyboard Hints to Video Elements
    function addKeyboardHints() {
        var videos = document.querySelectorAll('video');
        videos.forEach(function (video) {
            var wrapper = video.closest('.video-wrapper');
            if (wrapper && !wrapper.querySelector('.keyboard-hint')) {
                var hint = document.createElement('div');
                hint.className = 'keyboard-hint sr-only';
                hint.textContent = 'Keyboard controls: Space=play/pause, ←→=seek, M=mute, F=fullscreen';
                wrapper.appendChild(hint);

                video.addEventListener('focus', function () {
                    hint.classList.remove('sr-only');
                });

                video.addEventListener('blur', function () {
                    hint.classList.add('sr-only');
                });
            }
        });
    }

    // Initialize all keyboard navigation features
    function init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init);
            return;
        }

        // Initialize all features
        initSkipNavigation();
        initVideoKeyboardControls();
        initCustomVideoControlsKeyboard();
        initLightboxFocusManagement();
        initPlayButtonKeyboard();
        initGalleryKeyboardNavigation();
        initSocialIconsKeyboard();
        initGlobalKeyboardHandlers();
        addKeyboardHints();

        console.log('Enhanced keyboard navigation initialized');
    }

    // Start initialization
    init();

})();