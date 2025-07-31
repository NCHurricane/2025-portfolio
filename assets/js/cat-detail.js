// Cat Detail Page JavaScript

(function () {
    'use strict';

    // ============================================================================
    // LOCAL SCOPE - All variables and functions are now contained
    // ============================================================================

    // Local variables (no longer global)
    var currentCatData = null;
    var isLoaded = false;

    // ============================================================================
    // LOCAL FUNCTIONS - Cat detail functionality
    // ============================================================================

    // Format photo date for display
    function formatPhotoDate(dateString) {
        var date = new Date(dateString);
        var options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };
        return date.toLocaleDateString('en-US', options);
    }

    // Display error message
    function showError(message) {
        var nameElement = document.getElementById('catName');
        var bioElement = document.getElementById('catBio');
        var galleryElement = document.getElementById('catGalleryGrid');

        if (nameElement) nameElement.textContent = 'Error';
        if (bioElement) bioElement.textContent = message;
        if (galleryElement) {
            galleryElement.innerHTML = '<div class="col-12 text-center"><p class="text-danger">' + message + '</p></div>';
        }
    }

    // Render photo gallery with year grouping
    function renderPhotoGallery(photos, catName) {
        var container = document.getElementById('catGalleryGrid');

        if (!photos || photos.length === 0) {
            container.innerHTML = '<div class="col-12 text-center"><p class="text-warning">No photos available for ' + catName + ' yet.</p></div>';
            return;
        }

        // Clear loading state
        container.innerHTML = '';

        // Group photos by year WITHOUT sorting (preserve JSON order)
        var photosByYear = {};

        photos.forEach(function (photo, index) {
            var year = new Date(photo.date).getFullYear();
            if (!photosByYear[year]) {
                photosByYear[year] = [];
            }
            // Add original index to preserve order
            photo.originalIndex = index;
            photosByYear[year].push(photo);
        });

        // Sort years in ascending order (oldest first, as per your preference)
        var years = Object.keys(photosByYear).sort(function (a, b) {
            return a - b;
        });

        // Render photos grouped by year
        years.forEach(function (year) {
            // Add year header
            var yearHeader = document.createElement('div');
            yearHeader.className = 'col-12 mb-3 mt-4';
            yearHeader.innerHTML = `
                <h3 class="year-divider">
                    <span class="year-text">${year}</span>
                    <span class="photo-count">(${photosByYear[year].length} photo${photosByYear[year].length > 1 ? 's' : ''})</span>
                </h3>
                <hr class="year-separator">
            `;
            container.appendChild(yearHeader);

            // Render photos for this year
            photosByYear[year].forEach(function (photo) {
                var col = document.createElement('div');
                col.className = 'col-6 col-md-4 col-lg-3 mb-4 gallery-item';

                // Format the date for display
                var photoDate = formatPhotoDate(photo.date);

                // Create caption with cat name, date, and photo caption
                var fullCaption =
                    '<h5>' + photo.caption + '</h5>' +
                    '<p class="lb-caption">' + photoDate + ' &bull; ' + catName + '</p>';

                var escapedCaption = fullCaption.replace(/"/g, '&quot;');

                col.innerHTML =
                    '<a href="' + photo.full + '"' +
                    ' data-lightbox="cat-gallery"' +
                    ' data-title="' + escapedCaption + '">' +
                    '<div class="gallery-pic">' +
                    '<img src="' + photo.thumb + '"' +
                    ' alt="' + photo.caption + '"' +
                    ' loading="lazy"' +
                    ' class="img-fluid rounded shadow-sm" />' +
                    '</div>' +
                    '</a>' +
                    '<h5 class="mt-2"><strong>' + photo.caption + '</strong></h5>' +
                    '<hr>';

                container.appendChild(col);
            });
        });
    }

    // Render cat detail page
    function renderCatDetail(catData) {
        // Store cat data locally
        currentCatData = catData;

        // Update page title
        document.title = catData.name + ' Gallery - chuckcopeland.com';

        // Update header information
        var catNameElement = document.getElementById('catName');
        var catBioElement = document.getElementById('catBio');
        var catPhotoElement = document.getElementById('catPhoto');

        if (catNameElement) catNameElement.textContent = catData.name;
        if (catBioElement) catBioElement.textContent = catData.bio;

        // Add the cat photo
        if (catPhotoElement) {
            catPhotoElement.src = catData.cardThumbnail;
            catPhotoElement.alt = catData.name;
        }

        // Add memorial styling if applicable
        var headerContainer = document.getElementById('catDetailHeader');
        if (headerContainer && catData.memorial === "true") {
            headerContainer.classList.add('memorial');
        }

        // Render photo gallery with year grouping
        renderPhotoGallery(catData.photos, catData.name);
    }

    // Load cat data from JSON file
    function loadCatData(catName) {
        if (!catName) {
            showError('No cat specified in URL');
            return;
        }

        // Show loading state
        var galleryElement = document.getElementById('catGalleryGrid');
        if (galleryElement) {
            galleryElement.innerHTML = `
                <div class="col-12 text-center">
                    <div class="loading-photos">
                        <i class="fas fa-spinner fa-spin"></i>
                        Loading photos...
                    </div>
                </div>
            `;
        }

        // Load the cat's data
        fetch('../data/' + catName + '.json')
            .then(function (res) {
                if (!res.ok) {
                    throw new Error(`HTTP ${res.status}: Cat data not found`);
                }
                return res.json();
            })
            .then(function (catData) {
                // Validate cat data
                if (!catData || !catData.name) {
                    throw new Error('Invalid cat data format');
                }

                renderCatDetail(catData);
                isLoaded = true;
            })
            .catch(function (err) {
                console.error('Failed to load cat detail:', err);
                isLoaded = false;

                // Provide specific error messages
                var errorMessage;
                if (err.message.includes('HTTP 404') || err.message.includes('Cat data not found')) {
                    errorMessage = 'Cat information not found. Please check the URL or try again.';
                } else if (err.message.includes('JSON')) {
                    errorMessage = 'Cat data is corrupted. Please contact the site administrator.';
                } else if (err.message.includes('fetch')) {
                    errorMessage = 'Unable to connect to the server. Please check your internet connection.';
                } else {
                    errorMessage = 'Unable to load cat information. Please try again.';
                }

                showError(errorMessage);
            });
    }

    // ============================================================================
    // MAIN EXECUTION - Enhanced with better error handling
    // ============================================================================

    // Initialize when DOM is ready
    function init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init);
            return;
        }

        // Get cat name from URL parameter
        var urlParams = new URLSearchParams(window.location.search);
        var catName = urlParams.get('name');

        // Validate and sanitize cat name
        if (catName) {
            catName = catName.replace(/[^a-zA-Z0-9\-]/g, ''); // Basic sanitization
            if (catName.length > 0) {
                loadCatData(catName);
            } else {
                showError('Invalid cat name in URL');
            }
        } else {
            showError('No cat specified in URL');
        }
    }

    // Start initialization
    init();

    // ============================================================================
    // PUBLIC API - Expose essential functionality for other scripts
    // ============================================================================

    // Create namespace if it doesn't exist
    window.ChuckPortfolio = window.ChuckPortfolio || {};

    // Expose cat detail functionality
    window.ChuckPortfolio.catDetail = {
        // Get current cat data
        getCurrentCat: function () {
            return currentCatData ? Object.assign({}, currentCatData) : null; // Return copy
        },

        // Check if cat data is loaded
        isLoaded: function () {
            return isLoaded;
        },

        // Reload current cat (useful for dynamic updates)
        reload: function () {
            var urlParams = new URLSearchParams(window.location.search);
            var catName = urlParams.get('name');
            if (catName) {
                currentCatData = null;
                isLoaded = false;
                loadCatData(catName);
            }
        },

        // Get photos for current cat
        getPhotos: function () {
            return currentCatData && currentCatData.photos ? currentCatData.photos.slice() : [];
        },

        // Get photos by year
        getPhotosByYear: function (year) {
            if (!currentCatData || !currentCatData.photos) return [];

            return currentCatData.photos.filter(function (photo) {
                return new Date(photo.date).getFullYear() === year;
            });
        },

        cleanup: function () {
            if (window.ChuckPortfolio && window.ChuckPortfolio.lightbox) {
                window.ChuckPortfolio.lightbox.cleanup();
            }
        },

        version: '1.0.0'
    };;

    window.addEventListener('beforeunload', function () {
        if (window.ChuckPortfolio && window.ChuckPortfolio.catDetail) {
            window.ChuckPortfolio.catDetail.cleanup();
        }
    });

})(); // IIFE ends here - everything above is now in local scope